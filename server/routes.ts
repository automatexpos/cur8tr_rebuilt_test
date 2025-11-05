import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
import passport from "passport";
import { 
  insertRecommendationSchema, 
  updateProfileSchema, 
  createCategorySchema,
  insertCommentSchema,
  insertAdminRecommendSchema,
  insertSectionSchema,
  registerUserSchema,
  loginUserSchema,
  verifyEmailSchema,
  resendCodeSchema,
} from "@shared/schema";
import { fromError } from "zod-validation-error";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { emailService } from "./email";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Admin middleware
const isAdmin: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: "Authorization check failed" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // ===== HEALTH CHECK ENDPOINT =====
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // ===== AUTH ROUTES =====
  
  // Register new user
  app.post('/api/auth/register', async (req, res) => {
    try {
      const result = registerUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: fromError(result.error).toString(),
        });
      }

      const { email, password, username } = result.data;

      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Check if username is taken
      const [existingUsername] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Generate verification code
      const verificationCode = emailService.generateVerificationCode();
      const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          username,
          emailVerified: false,
          verificationCode,
          verificationCodeExpiry,
        })
        .returning();

      // Send verification email
      await emailService.sendVerificationCode(email, verificationCode);

      res.json({
        message: "Registration successful. Please check your email for verification code.",
        email: newUser.email,
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Verify email with code
  app.post('/api/auth/verify-email', async (req, res) => {
    try {
      const result = verifyEmailSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: fromError(result.error).toString(),
        });
      }

      const { email, code } = result.data;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      if (!user.verificationCode || !user.verificationCodeExpiry) {
        return res.status(400).json({ message: "No verification code found" });
      }

      if (new Date() > user.verificationCodeExpiry) {
        return res.status(400).json({ message: "Verification code expired" });
      }

      if (user.verificationCode !== code) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      // Mark email as verified
      await db
        .update(users)
        .set({
          emailVerified: true,
          verificationCode: null,
          verificationCodeExpiry: null,
        })
        .where(eq(users.id, user.id));

      res.json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
      console.error("Error during email verification:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // Resend verification code
  app.post('/api/auth/resend-code', async (req, res) => {
    try {
      const result = resendCodeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: fromError(result.error).toString(),
        });
      }

      const { email } = result.data;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      // Generate new verification code
      const verificationCode = emailService.generateVerificationCode();
      const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

      await db
        .update(users)
        .set({
          verificationCode,
          verificationCodeExpiry,
        })
        .where(eq(users.id, user.id));

      // Send new verification email
      await emailService.sendVerificationCode(email, verificationCode);

      res.json({ message: "Verification code resent" });
    } catch (error) {
      console.error("Error resending verification code:", error);
      res.status(500).json({ message: "Failed to resend code" });
    }
  });

  // Login
  app.post('/api/auth/login', (req, res, next) => {
    const result = loginUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: fromError(result.error).toString(),
      });
    }

    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        return res.json({ message: "Login successful", user });
      });
    })(req, res, next);
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ===== USER PROFILE ROUTES =====
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      console.log('[PATCH /api/user/profile] Request received:', JSON.stringify(req.body));
      const userId = req.user.id;
      
      // Validate request body
      const result = updateProfileSchema.safeParse(req.body);
      if (!result.success) {
        console.log('[PATCH /api/user/profile] Validation failed:', result.error);
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromError(result.error).toString() 
        });
      }
      
      console.log('[PATCH /api/user/profile] Updating user profile...');
      const user = await storage.updateUserProfile(userId, result.data);
      console.log('[PATCH /api/user/profile] Profile updated successfully');
      res.json(user);
    } catch (error) {
      console.error("[PATCH /api/user/profile] Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/user/:username', async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/user/:userId/stats', async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.params.userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get('/api/platform/stats', async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "Failed to fetch platform stats" });
    }
  });

  // ===== OBJECT STORAGE ROUTES =====
  // Get presigned URL for uploading recommendation images
  app.post('/api/objects/upload', isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Set ACL policy for uploaded recommendation images
  app.put('/api/recommendation-images', isAuthenticated, async (req: any, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    const userId = req.user.id;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId,
          visibility: "public",
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting recommendation image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve uploaded images
  app.get('/objects/:objectPath(*)', async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
      });
      if (!canAccess) {
        return res.sendStatus(403);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // ===== CATEGORY ROUTES =====
  app.get('/api/categories', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Validate request body
      const result = createCategorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromError(result.error).toString() 
        });
      }
      
      const category = await storage.createCategory({ name: result.data.name, userId });
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.delete('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.deleteCategory(userId, req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      if (error instanceof Error && error.message.includes('not found or not owned')) {
        res.status(403).json({ message: "Not authorized to delete this category" });
      } else {
        res.status(500).json({ message: "Failed to delete category" });
      }
    }
  });

  // ===== RECOMMENDATION ROUTES =====
  app.get('/api/recommendations', async (req: any, res) => {
    try {
      const { userId, categoryId, hasProTip, limit } = req.query;
      const currentUserId = req.user?.claims?.sub; // Get current user if authenticated
      const recs = await storage.getRecommendations({
        userId: userId as string | undefined,
        categoryId: categoryId as string | undefined,
        hasProTip: hasProTip === 'true' ? true : hasProTip === 'false' ? false : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        currentUserId, // Pass current user for visibility filtering
      });
      
      // Fetch like counts for all recommendations
      const likeCounts = await storage.getLikeCounts(recs.map(r => r.id));
      
      // Add like counts to each recommendation
      const recsWithLikes = recs.map(rec => ({
        ...rec,
        likeCount: likeCounts[rec.id] || 0,
      }));
      
      res.json(recsWithLikes);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.get('/api/map/search', async (req: any, res) => {
    try {
      const { geocodeLocation } = await import('./utils/distance.js');
      const { location, lat, lng, radius } = req.query;
      const currentUserId = req.user?.claims?.sub; // Get current user if authenticated
      
      // Default radius is 50 miles
      const radiusMiles = radius ? parseFloat(radius as string) : 50;
      
      let latitude: number;
      let longitude: number;
      
      // If lat/lng provided, use them directly
      if (lat && lng) {
        latitude = parseFloat(lat as string);
        longitude = parseFloat(lng as string);
      } 
      // Otherwise, geocode the location string
      else if (location) {
        const coords = await geocodeLocation(location as string);
        if (!coords) {
          return res.status(400).json({ message: "Location not found" });
        }
        latitude = coords.lat;
        longitude = coords.lon;
      } 
      else {
        return res.status(400).json({ message: "Please provide either location text or lat/lng coordinates" });
      }
      
      // Get recommendations within radius
      const recs = await storage.getRecommendationsInRadius(latitude, longitude, radiusMiles, currentUserId);
      
      // Fetch like counts for all recommendations
      const likeCounts = await storage.getLikeCounts(recs.map(r => r.id));
      
      // Add like counts to each recommendation
      const recsWithLikes = recs.map(rec => ({
        ...rec,
        likeCount: likeCounts[rec.id] || 0,
      }));
      
      res.json({
        center: { latitude, longitude },
        radius: radiusMiles,
        count: recsWithLikes.length,
        recommendations: recsWithLikes,
      });
    } catch (error) {
      console.error("Error searching map:", error);
      res.status(500).json({ message: "Failed to search map" });
    }
  });

  app.get('/api/activity-feed', async (req: any, res) => {
    try {
      // Get current user if authenticated, null otherwise
      const userId = req.user?.claims?.sub || null;
      const categoryId = req.query.categoryId as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const recs = await storage.getActivityFeed(userId, categoryId, limit);
      
      // Fetch like counts for all recommendations
      const likeCounts = await storage.getLikeCounts(recs.map(r => r.id));
      
      // Add like counts to each recommendation
      const recsWithLikes = recs.map(rec => ({
        ...rec,
        likeCount: likeCounts[rec.id] || 0,
      }));
      
      res.json(recsWithLikes);
    } catch (error) {
      console.error("Error fetching activity feed:", error);
      res.status(500).json({ message: "Failed to fetch activity feed" });
    }
  });

  app.get('/api/recommendations/pro-tips', async (req, res) => {
    try {
      const recs = await storage.getProTips();
      res.json(recs);
    } catch (error) {
      console.error("Error fetching pro tips:", error);
      res.status(500).json({ message: "Failed to fetch pro tips" });
    }
  });

  app.get('/api/recommendations/:id', async (req: any, res) => {
    try {
      const rec = await storage.getRecommendation(req.params.id);
      if (!rec) {
        return res.status(404).json({ message: "Recommendation not found" });
      }
      
      // Visibility check: if private, only owner can access
      if (rec.isPrivate) {
        const currentUserId = req.user?.claims?.sub;
        if (!currentUserId || currentUserId !== rec.userId) {
          // Return 404 instead of 403 to not leak existence of private recommendations
          return res.status(404).json({ message: "Recommendation not found" });
        }
      }
      
      // Fetch user info
      const user = await storage.getUser(rec.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Fetch category if exists
      let category = null;
      if (rec.categoryId) {
        const allCategories = await storage.getCategories(rec.userId);
        category = allCategories.find(c => c.id === rec.categoryId) || null;
      }
      
      // Fetch like count
      const likeCounts = await storage.getLikeCounts([rec.id]);
      const likeCount = likeCounts[rec.id] || 0;
      
      // Return recommendation with all details
      res.json({
        ...rec,
        user,
        category,
        likeCount,
      });
    } catch (error) {
      console.error("Error fetching recommendation:", error);
      res.status(500).json({ message: "Failed to fetch recommendation" });
    }
  });

  app.post('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Validate request body
      const result = insertRecommendationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromError(result.error).toString() 
        });
      }
      
      const { tags, ...recData } = result.data;
      
      const rec = await storage.createRecommendation(recData, userId, tags);
      res.json(rec);
    } catch (error) {
      console.error("Error creating recommendation:", error);
      res.status(500).json({ message: "Failed to create recommendation" });
    }
  });

  app.patch('/api/recommendations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Verify ownership
      const existing = await storage.getRecommendation(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this recommendation" });
      }
      
      // Validate request body (partial update)
      const result = insertRecommendationSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromError(result.error).toString() 
        });
      }
      
      // Strip tags from update (not a direct column, requires separate handling)
      const { tags, ...updateData } = result.data;
      
      const rec = await storage.updateRecommendation(req.params.id, updateData);
      
      // TODO: Implement tag updates if tags are provided
      // This would require deleting existing tags and inserting new ones
      
      res.json(rec);
    } catch (error) {
      console.error("Error updating recommendation:", error);
      res.status(500).json({ message: "Failed to update recommendation" });
    }
  });

  app.delete('/api/recommendations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.deleteRecommendationForUser(userId, req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting recommendation:", error);
      if (error instanceof Error && error.message.includes('not found or not owned')) {
        res.status(403).json({ message: "Not authorized to delete this recommendation" });
      } else {
        res.status(500).json({ message: "Failed to delete recommendation" });
      }
    }
  });

  // ===== COMMENT ROUTES =====
  app.get('/api/comments/:recommendationId', async (req, res) => {
    try {
      const comments = await storage.getComments(req.params.recommendationId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Validate request body
      const result = insertCommentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromError(result.error).toString() 
        });
      }
      
      const comment = await storage.createComment(result.data, userId);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // ===== SOCIAL ROUTES =====
  app.post('/api/follow/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.id;
      const followingId = req.params.userId;
      
      const follow = await storage.followUser(followerId, followingId);
      res.json(follow);
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete('/api/follow/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.id;
      const followingId = req.params.userId;
      
      await storage.unfollowUser(followerId, followingId);
      res.json({ message: "Unfollowed" });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  app.post('/api/like/:recommendationId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const recommendationId = req.params.recommendationId;
      
      const like = await storage.likeRecommendation(userId, recommendationId);
      res.json(like);
    } catch (error) {
      console.error("Error liking recommendation:", error);
      res.status(500).json({ message: "Failed to like recommendation" });
    }
  });

  app.delete('/api/like/:recommendationId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const recommendationId = req.params.recommendationId;
      
      await storage.unlikeRecommendation(userId, recommendationId);
      res.json({ message: "Unliked" });
    } catch (error) {
      console.error("Error unliking recommendation:", error);
      res.status(500).json({ message: "Failed to unlike recommendation" });
    }
  });

  app.get('/api/likes', async (req: any, res) => {
    try {
      // Return empty array if not authenticated
      if (!req.user) {
        return res.json([]);
      }
      
      const userId = req.user.id;
      const likes = await storage.getUserLikes(userId);
      res.json(likes);
    } catch (error) {
      console.error("Error fetching user likes:", error);
      res.status(500).json({ message: "Failed to fetch likes" });
    }
  });

  app.get('/api/users/featured', async (req, res) => {
    try {
      const users = await storage.getFeaturedUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching featured users:", error);
      res.status(500).json({ message: "Failed to fetch featured users" });
    }
  });

  // ===== ADMIN/CURATOR ROUTES =====
  app.get('/api/curator-recs', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
      const recs = await storage.getCuratorRecs(limit);
      res.json(recs);
    } catch (error) {
      console.error("Error fetching curator recs:", error);
      res.status(500).json({ message: "Failed to fetch curator recs" });
    }
  });

  app.get('/api/curator-recs/ids', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const ids = await storage.getCuratorRecIds();
      res.json(ids);
    } catch (error) {
      console.error("Error fetching curator rec IDs:", error);
      res.status(500).json({ message: "Failed to fetch curator rec IDs" });
    }
  });

  app.post('/api/curator-recs/:recommendationId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const curatorId = req.user.id;
      const recommendationId = req.params.recommendationId;
      
      const rec = await storage.addCuratorRec(recommendationId, curatorId);
      res.json(rec);
    } catch (error) {
      console.error("Error adding curator rec:", error);
      res.status(500).json({ message: "Failed to add curator rec" });
    }
  });

  app.delete('/api/curator-recs/:recommendationId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.removeCuratorRec(req.params.recommendationId);
      res.json({ message: "Removed from curator recs" });
    } catch (error) {
      console.error("Error removing curator rec:", error);
      res.status(500).json({ message: "Failed to remove curator rec" });
    }
  });

  // ===== ADMIN RECOMMENDS ROUTES (CUR8tr Recommends) =====
  app.get('/api/admin-recommends', async (req, res) => {
    try {
      const visibleOnly = req.query.visibleOnly === 'true';
      const recommends = await storage.getAdminRecommends(visibleOnly);
      res.json(recommends);
    } catch (error) {
      console.error("Error fetching admin recommends:", error);
      res.status(500).json({ message: "Failed to fetch admin recommends" });
    }
  });

  app.get('/api/admin-recommends/:id', async (req, res) => {
    try {
      const recommend = await storage.getAdminRecommend(req.params.id);
      if (!recommend) {
        return res.status(404).json({ message: "Admin recommend not found" });
      }
      res.json(recommend);
    } catch (error) {
      console.error("Error fetching admin recommend:", error);
      res.status(500).json({ message: "Failed to fetch admin recommend" });
    }
  });

  app.post('/api/admin-recommends', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Validate request body
      const result = insertAdminRecommendSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromError(result.error).toString() 
        });
      }
      
      const recommend = await storage.createAdminRecommend(result.data, userId);
      res.json(recommend);
    } catch (error) {
      console.error("Error creating admin recommend:", error);
      res.status(500).json({ message: "Failed to create admin recommend" });
    }
  });

  app.patch('/api/admin-recommends/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Validate request body
      const result = insertAdminRecommendSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromError(result.error).toString() 
        });
      }
      
      const recommend = await storage.updateAdminRecommend(req.params.id, result.data);
      res.json(recommend);
    } catch (error) {
      console.error("Error updating admin recommend:", error);
      res.status(500).json({ message: "Failed to update admin recommend" });
    }
  });

  app.delete('/api/admin-recommends/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteAdminRecommend(req.params.id);
      res.json({ message: "Admin recommend deleted" });
    } catch (error) {
      console.error("Error deleting admin recommend:", error);
      res.status(500).json({ message: "Failed to delete admin recommend" });
    }
  });

  app.post('/api/admin-recommends/:id/toggle-visibility', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const recommend = await storage.toggleAdminRecommendVisibility(req.params.id);
      res.json(recommend);
    } catch (error) {
      console.error("Error toggling visibility:", error);
      res.status(500).json({ message: "Failed to toggle visibility" });
    }
  });

  // ===== SECTION ROUTES =====
  app.get('/api/sections', async (req, res) => {
    try {
      const sections = await storage.getSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ message: "Failed to fetch sections" });
    }
  });

  app.get('/api/sections/with-recommendations', async (req, res) => {
    try {
      const sections = await storage.getSectionsWithRecommendations();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching sections with recommendations:", error);
      res.status(500).json({ message: "Failed to fetch sections with recommendations" });
    }
  });

  app.get('/api/sections/:id', async (req, res) => {
    try {
      const section = await storage.getSection(req.params.id);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      res.json(section);
    } catch (error) {
      console.error("Error fetching section:", error);
      res.status(500).json({ message: "Failed to fetch section" });
    }
  });

  app.post('/api/sections', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Validate request body
      const result = insertSectionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromError(result.error).toString() 
        });
      }
      
      const section = await storage.createSection(result.data, userId);
      res.json(section);
    } catch (error) {
      console.error("Error creating section:", error);
      res.status(500).json({ message: "Failed to create section" });
    }
  });

  app.patch('/api/sections/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Validate request body
      const result = insertSectionSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromError(result.error).toString() 
        });
      }
      
      const section = await storage.updateSection(req.params.id, result.data);
      res.json(section);
    } catch (error) {
      console.error("Error updating section:", error);
      res.status(500).json({ message: "Failed to update section" });
    }
  });

  app.delete('/api/sections/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteSection(req.params.id);
      res.json({ message: "Section deleted" });
    } catch (error) {
      console.error("Error deleting section:", error);
      res.status(500).json({ message: "Failed to delete section" });
    }
  });

  app.post('/api/sections/:sectionId/recommendations/:recommendationId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { sectionId, recommendationId } = req.params;
      const sectionRec = await storage.addRecommendationToSection(sectionId, recommendationId);
      res.json(sectionRec);
    } catch (error: any) {
      console.error("Error adding recommendation to section:", error);
      res.status(500).json({ message: error.message || "Failed to add recommendation to section" });
    }
  });

  app.delete('/api/sections/:sectionId/recommendations/:recommendationId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { sectionId, recommendationId } = req.params;
      await storage.removeRecommendationFromSection(sectionId, recommendationId);
      res.json({ message: "Recommendation removed from section" });
    } catch (error) {
      console.error("Error removing recommendation from section:", error);
      res.status(500).json({ message: "Failed to remove recommendation from section" });
    }
  });

  // ===== APP SETTINGS ROUTES =====
  app.get('/api/settings/:key', async (req, res) => {
    try {
      const value = await storage.getSetting(req.params.key);
      res.json({ key: req.params.key, value });
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.post('/api/settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key || typeof value !== 'string') {
        return res.status(400).json({ message: "Invalid request: key and value required" });
      }
      
      const setting = await storage.setSetting(key, value);
      res.json(setting);
    } catch (error) {
      console.error("Error setting value:", error);
      res.status(500).json({ message: "Failed to set value" });
    }
  });

  // ===== TAGS ROUTES =====
  app.get('/api/tags', async (req, res) => {
    try {
      const tags = await storage.getTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

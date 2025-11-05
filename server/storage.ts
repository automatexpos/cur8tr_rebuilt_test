import {
  users,
  categories,
  recommendations,
  tags,
  recommendationTags,
  follows,
  likes,
  curatorRecs,
  adminRecommends,
  comments,
  sections,
  sectionRecommendations,
  appSettings,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Recommendation,
  type InsertRecommendation,
  type Tag,
  type Follow,
  type Like,
  type CuratorRec,
  type AdminRecommend,
  type InsertAdminRecommend,
  type Comment,
  type InsertComment,
  type Section,
  type InsertSection,
  type SectionRecommendation,
  type SectionWithRecommendations,
  type AppSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, or, inArray, isNotNull, isNull, notInArray } from "drizzle-orm";

// Storage interface - following Replit Auth blueprint requirements
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUserProfile(id: string, data: Partial<User>): Promise<User>;
  
  // Category operations
  getCategories(userId?: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(userId: string, categoryId: string): Promise<void>;
  
  // Recommendation operations
  getRecommendations(filters?: { 
    userId?: string; 
    categoryId?: string; 
    hasProTip?: boolean;
    limit?: number;
    currentUserId?: string; // For filtering private recommendations
  }): Promise<Recommendation[]>;
  getRecommendation(id: string): Promise<Recommendation | undefined>;
  getRecommendationsInRadius(latitude: number, longitude: number, radiusMiles: number, currentUserId?: string): Promise<Recommendation[]>;
  createRecommendation(rec: InsertRecommendation, userId: string, tagNames?: string[]): Promise<Recommendation>;
  updateRecommendation(id: string, rec: Partial<InsertRecommendation>): Promise<Recommendation>;
  deleteRecommendation(id: string): Promise<void>;
  deleteRecommendationForUser(userId: string, recommendationId: string): Promise<void>;
  
  // Tag operations
  getTags(): Promise<Tag[]>;
  getOrCreateTags(tagNames: string[]): Promise<Tag[]>;
  
  // Social operations
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowerCount(userId: string): Promise<number>;
  getFollowingCount(userId: string): Promise<number>;
  
  likeRecommendation(userId: string, recommendationId: string): Promise<Like>;
  unlikeRecommendation(userId: string, recommendationId: string): Promise<void>;
  isLiked(userId: string, recommendationId: string): Promise<boolean>;
  getLikeCount(recommendationId: string): Promise<number>;
  getUserLikeCount(userId: string): Promise<number>;
  getUserLikes(userId: string): Promise<Like[]>;
  getLikeCounts(recommendationIds: string[]): Promise<Record<string, number>>;
  
  // Admin/Curator operations
  getCuratorRecs(limit?: number): Promise<Recommendation[]>;
  addCuratorRec(recommendationId: string, curatorId: string): Promise<CuratorRec>;
  removeCuratorRec(recommendationId: string): Promise<void>;
  isCuratorRec(recommendationId: string): Promise<boolean>;
  getCuratorRecIds(): Promise<string[]>;
  
  // Stats
  getUserStats(userId: string): Promise<{
    recommendationsCount: number;
    followersCount: number;
    followingCount: number;
    likesCount: number;
  }>;
  getPlatformStats(): Promise<{
    recommendationsCount: number;
    curatorsCount: number;
    categoriesCount: number;
  }>;
  getFeaturedUsers(limit?: number): Promise<Array<User & { recommendationsCount: number; followersCount: number }>>;
  getProTips(limit?: number): Promise<Recommendation[]>;
  
  // Comment operations
  getComments(recommendationId: string): Promise<Array<Comment & { user: User; replies: Array<Comment & { user: User }> }>>;
  createComment(comment: InsertComment, userId: string): Promise<Comment>;
  
  // Activity feed
  getActivityFeed(userId: string | null, categoryId?: string, limit?: number): Promise<Recommendation[]>;
  
  // Admin Recommends operations
  getAdminRecommends(visibleOnly?: boolean): Promise<AdminRecommend[]>;
  getAdminRecommend(id: string): Promise<AdminRecommend | undefined>;
  createAdminRecommend(data: InsertAdminRecommend, userId: string): Promise<AdminRecommend>;
  updateAdminRecommend(id: string, data: Partial<InsertAdminRecommend>): Promise<AdminRecommend>;
  deleteAdminRecommend(id: string): Promise<void>;
  toggleAdminRecommendVisibility(id: string): Promise<AdminRecommend>;
  
  // Section operations
  getSections(): Promise<Section[]>;
  getSection(id: string): Promise<Section | undefined>;
  getSectionsWithRecommendations(): Promise<SectionWithRecommendations[]>;
  createSection(data: InsertSection, userId: string): Promise<Section>;
  updateSection(id: string, data: Partial<InsertSection>): Promise<Section>;
  deleteSection(id: string): Promise<void>;
  addRecommendationToSection(sectionId: string, recommendationId: string): Promise<SectionRecommendation>;
  removeRecommendationFromSection(sectionId: string, recommendationId: string): Promise<void>;
  getSectionRecommendations(sectionId: string): Promise<Recommendation[]>;
  
  // App Settings operations
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<AppSetting>;
}

export class DatabaseStorage implements IStorage {
  // ===== USER OPERATIONS =====
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // First, check if a user with this email already exists (different ID)
    if (userData.email) {
      const existingUserByEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);
      
      // If user exists with this email but different ID, update that user instead
      if (existingUserByEmail.length > 0 && existingUserByEmail[0].id !== userData.id) {
        const [updatedUser] = await db
          .update(users)
          .set({
            ...userData,
            id: existingUserByEmail[0].id, // Keep the original ID
            updatedAt: new Date(),
          })
          .where(eq(users.id, existingUserByEmail[0].id))
          .returning();
        return updatedUser;
      }
    }

    // Normal upsert based on ID
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // ===== CATEGORY OPERATIONS =====
  async getCategories(userId?: string): Promise<Category[]> {
    if (userId) {
      // Get both pre-built (null userId) and user's custom categories
      return await db
        .select()
        .from(categories)
        .where(or(eq(categories.userId, userId), sql`${categories.userId} IS NULL`));
    }
    // Get only pre-built categories
    return await db
      .select()
      .from(categories)
      .where(sql`${categories.userId} IS NULL`);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async deleteCategory(userId: string, categoryId: string): Promise<void> {
    // Verify ownership - only allow deletion of user's own custom categories
    const [category] = await db
      .select()
      .from(categories)
      .where(and(
        eq(categories.id, categoryId),
        eq(categories.userId, userId)
      ));
    
    if (!category) {
      throw new Error('Category not found or not owned by user');
    }
    
    // Set categoryId to null for all recommendations using this category
    await db
      .update(recommendations)
      .set({ categoryId: null })
      .where(eq(recommendations.categoryId, categoryId));
    
    // Delete the category
    await db.delete(categories).where(eq(categories.id, categoryId));
  }

  // ===== RECOMMENDATION OPERATIONS =====
  async getRecommendations(filters?: { 
    userId?: string; 
    categoryId?: string; 
    hasProTip?: boolean;
    limit?: number;
    currentUserId?: string; // For filtering private recommendations
  }): Promise<Recommendation[]> {
    let query = db.select().from(recommendations);
    
    const conditions = [];
    if (filters?.userId) {
      conditions.push(eq(recommendations.userId, filters.userId));
    }
    if (filters?.categoryId) {
      conditions.push(eq(recommendations.categoryId, filters.categoryId));
    }
    if (filters?.hasProTip !== undefined) {
      // If hasProTip is true, filter for recommendations where proTip is not null
      // If hasProTip is false, filter for recommendations where proTip is null
      conditions.push(filters.hasProTip ? isNotNull(recommendations.proTip) : isNull(recommendations.proTip));
    }
    
    // Visibility filter: show public recommendations, or private ones owned by current user
    if (filters?.currentUserId) {
      conditions.push(
        or(
          eq(recommendations.isPrivate, false),
          eq(recommendations.userId, filters.currentUserId)
        )!
      );
    } else {
      // If no current user, only show public recommendations
      conditions.push(eq(recommendations.isPrivate, false));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    query = query.orderBy(desc(recommendations.createdAt)) as any;
    
    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }
    
    return await query;
  }

  async getRecommendation(id: string): Promise<Recommendation | undefined> {
    const [rec] = await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.id, id));
    return rec;
  }

  async getRecommendationsInRadius(
    latitude: number,
    longitude: number,
    radiusMiles: number,
    currentUserId?: string
  ): Promise<Recommendation[]> {
    const { calculateDistance } = await import('./utils/distance.js');
    
    // Build visibility filter
    const visibilityCondition = currentUserId
      ? or(
          eq(recommendations.isPrivate, false),
          eq(recommendations.userId, currentUserId)
        )!
      : eq(recommendations.isPrivate, false);
    
    const allRecs = await db
      .select()
      .from(recommendations)
      .where(
        and(
          isNotNull(recommendations.latitude),
          isNotNull(recommendations.longitude),
          visibilityCondition
        )
      )
      .orderBy(desc(recommendations.createdAt));
    
    const recsWithinRadius = allRecs.filter(rec => {
      if (rec.latitude === null || rec.longitude === null) {
        return false;
      }
      
      const distance = calculateDistance(
        latitude,
        longitude,
        rec.latitude,
        rec.longitude
      );
      
      return distance <= radiusMiles;
    });
    
    return recsWithinRadius;
  }

  async createRecommendation(rec: InsertRecommendation, userId: string, tagNames?: string[]): Promise<Recommendation> {
    const [newRec] = await db
      .insert(recommendations)
      .values({ ...rec, userId })
      .returning();
    
    // Handle tags if provided
    if (tagNames && tagNames.length > 0) {
      const createdTags = await this.getOrCreateTags(tagNames);
      await db.insert(recommendationTags).values(
        createdTags.map(tag => ({
          recommendationId: newRec.id,
          tagId: tag.id,
        }))
      );
    }
    
    return newRec;
  }

  async updateRecommendation(id: string, rec: Partial<InsertRecommendation>): Promise<Recommendation> {
    const [updated] = await db
      .update(recommendations)
      .set({ ...rec, updatedAt: new Date() })
      .where(eq(recommendations.id, id))
      .returning();
    return updated;
  }

  async deleteRecommendation(id: string): Promise<void> {
    await db.delete(recommendations).where(eq(recommendations.id, id));
  }

  async deleteRecommendationForUser(userId: string, recommendationId: string): Promise<void> {
    // Verify ownership before deleting
    const [rec] = await db
      .select()
      .from(recommendations)
      .where(and(
        eq(recommendations.id, recommendationId),
        eq(recommendations.userId, userId)
      ));
    
    if (!rec) {
      throw new Error('Recommendation not found or not owned by user');
    }
    
    // Delete the recommendation (cascade will handle likes and tags)
    await db.delete(recommendations).where(eq(recommendations.id, recommendationId));
  }

  // ===== TAG OPERATIONS =====
  async getTags(): Promise<Tag[]> {
    return await db.select().from(tags);
  }

  async getOrCreateTags(tagNames: string[]): Promise<Tag[]> {
    const createdTags: Tag[] = [];
    
    for (const name of tagNames) {
      const normalized = name.toLowerCase().trim();
      const [existing] = await db
        .select()
        .from(tags)
        .where(eq(tags.name, normalized));
      
      if (existing) {
        createdTags.push(existing);
      } else {
        const [newTag] = await db
          .insert(tags)
          .values({ name: normalized })
          .returning();
        createdTags.push(newTag);
      }
    }
    
    return createdTags;
  }

  // ===== SOCIAL OPERATIONS =====
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values({ followerId, followingId })
      .onConflictDoNothing()
      .returning();
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ));
    return !!follow;
  }

  async getFollowerCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followingId, userId));
    return Number(result.count);
  }

  async getFollowingCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followerId, userId));
    return Number(result.count);
  }

  async likeRecommendation(userId: string, recommendationId: string): Promise<Like> {
    const [like] = await db
      .insert(likes)
      .values({ userId, recommendationId })
      .onConflictDoNothing()
      .returning();
    return like;
  }

  async unlikeRecommendation(userId: string, recommendationId: string): Promise<void> {
    await db
      .delete(likes)
      .where(and(
        eq(likes.userId, userId),
        eq(likes.recommendationId, recommendationId)
      ));
  }

  async isLiked(userId: string, recommendationId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(
        eq(likes.userId, userId),
        eq(likes.recommendationId, recommendationId)
      ));
    return !!like;
  }

  async getLikeCount(recommendationId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(likes)
      .where(eq(likes.recommendationId, recommendationId));
    return Number(result.count);
  }

  async getUserLikeCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(likes)
      .leftJoin(recommendations, eq(likes.recommendationId, recommendations.id))
      .where(eq(recommendations.userId, userId));
    return Number(result.count);
  }

  async getUserLikes(userId: string): Promise<Like[]> {
    return await db
      .select()
      .from(likes)
      .where(eq(likes.userId, userId));
  }

  async getLikeCounts(recommendationIds: string[]): Promise<Record<string, number>> {
    if (recommendationIds.length === 0) return {};
    
    const counts = await db
      .select({
        recommendationId: likes.recommendationId,
        count: sql<number>`count(*)`,
      })
      .from(likes)
      .where(inArray(likes.recommendationId, recommendationIds))
      .groupBy(likes.recommendationId);
    
    const countMap: Record<string, number> = {};
    recommendationIds.forEach(id => { countMap[id] = 0; }); // Initialize all to 0
    counts.forEach(c => { countMap[c.recommendationId] = Number(c.count); });
    return countMap;
  }

  // ===== ADMIN/CURATOR OPERATIONS =====
  async getCuratorRecs(limit: number = 8): Promise<Recommendation[]> {
    const curatorRecIds = await db
      .select({ recId: curatorRecs.recommendationId })
      .from(curatorRecs)
      .orderBy(desc(curatorRecs.createdAt))
      .limit(limit);
    
    if (curatorRecIds.length === 0) return [];
    
    return await db
      .select()
      .from(recommendations)
      .where(inArray(recommendations.id, curatorRecIds.map(r => r.recId)));
  }

  async addCuratorRec(recommendationId: string, curatorId: string): Promise<CuratorRec> {
    const [rec] = await db
      .insert(curatorRecs)
      .values({ recommendationId, curatedBy: curatorId })
      .returning();
    return rec;
  }

  async removeCuratorRec(recommendationId: string): Promise<void> {
    await db
      .delete(curatorRecs)
      .where(eq(curatorRecs.recommendationId, recommendationId));
  }

  async isCuratorRec(recommendationId: string): Promise<boolean> {
    const [rec] = await db
      .select()
      .from(curatorRecs)
      .where(eq(curatorRecs.recommendationId, recommendationId))
      .limit(1);
    return !!rec;
  }

  async getCuratorRecIds(): Promise<string[]> {
    const recs = await db
      .select({ recommendationId: curatorRecs.recommendationId })
      .from(curatorRecs);
    return recs.map(r => r.recommendationId);
  }

  // ===== STATS =====
  async getUserStats(userId: string): Promise<{
    recommendationsCount: number;
    followersCount: number;
    followingCount: number;
    likesCount: number;
  }> {
    const [recsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(recommendations)
      .where(eq(recommendations.userId, userId));
    
    const followersCount = await this.getFollowerCount(userId);
    const followingCount = await this.getFollowingCount(userId);
    const likesCount = await this.getUserLikeCount(userId);
    
    return {
      recommendationsCount: Number(recsCount.count),
      followersCount,
      followingCount,
      likesCount,
    };
  }

  async getFeaturedUsers(limit: number = 3): Promise<Array<User & { recommendationsCount: number; followersCount: number }>> {
    const usersWithStats = await db
      .select({
        user: users,
        recCount: sql<number>`count(distinct ${recommendations.id})`,
        followerCount: sql<number>`count(distinct ${follows.followerId})`,
      })
      .from(users)
      .leftJoin(recommendations, eq(recommendations.userId, users.id))
      .leftJoin(follows, eq(follows.followingId, users.id))
      .groupBy(users.id)
      .orderBy(desc(users.createdAt))
      .limit(limit);
    
    return usersWithStats.map((row) => ({
      ...row.user,
      recommendationsCount: Number(row.recCount),
      followersCount: Number(row.followerCount),
    }));
  }

  async getProTips(limit: number = 4): Promise<Recommendation[]> {
    return await db
      .select()
      .from(recommendations)
      .where(isNotNull(recommendations.proTip))
      .orderBy(desc(recommendations.createdAt))
      .limit(limit);
  }

  async getPlatformStats(): Promise<{
    recommendationsCount: number;
    curatorsCount: number;
    categoriesCount: number;
  }> {
    const [recsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(recommendations);
    
    const [usersCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    
    const [catsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(categories);
    
    return {
      recommendationsCount: Number(recsCount.count),
      curatorsCount: Number(usersCount.count),
      categoriesCount: Number(catsCount.count),
    };
  }

  // ===== COMMENT OPERATIONS =====
  async getComments(recommendationId: string): Promise<Array<Comment & { user: User; replies: Array<Comment & { user: User }> }>> {
    // Get all comments for the recommendation
    const allComments = await db
      .select({
        comment: comments,
        user: users,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.recommendationId, recommendationId))
      .orderBy(desc(comments.createdAt));

    // Separate top-level comments and replies
    const topLevelComments = allComments.filter(c => !c.comment.parentId);
    const repliesMap = new Map<string, Array<Comment & { user: User }>>();

    // Group replies by parent ID
    allComments
      .filter(c => c.comment.parentId)
      .forEach(c => {
        const parentId = c.comment.parentId!;
        if (!repliesMap.has(parentId)) {
          repliesMap.set(parentId, []);
        }
        repliesMap.get(parentId)!.push({
          ...c.comment,
          user: c.user,
        });
      });

    // Build the result with replies nested
    return topLevelComments.map(c => ({
      ...c.comment,
      user: c.user,
      replies: repliesMap.get(c.comment.id) || [],
    }));
  }

  async createComment(commentData: InsertComment, userId: string): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values({
        ...commentData,
        userId,
      })
      .returning();
    return comment;
  }

  // ===== ACTIVITY FEED =====
  async getActivityFeed(userId: string | null, categoryId?: string, limit: number = 20): Promise<Recommendation[]> {
    // If user is authenticated, get recommendations from followed users + recent community recommendations
    if (userId) {
      // Get users that current user follows
      const followedUsers = await db
        .select({ followingId: follows.followingId })
        .from(follows)
        .where(eq(follows.followerId, userId));
      
      const followedUserIds = followedUsers.map(f => f.followingId);
      
      // If user follows people, combine their recommendations with recent community recommendations
      if (followedUserIds.length > 0) {
        // Build conditions for category filter
        const followedConditions = [inArray(recommendations.userId, followedUserIds)];
        const communityConditions = [notInArray(recommendations.userId, [...followedUserIds, userId])];
        
        if (categoryId) {
          followedConditions.push(eq(recommendations.categoryId, categoryId));
          communityConditions.push(eq(recommendations.categoryId, categoryId));
        }
        
        // Get recommendations from followed users (prioritized)
        const followedRecs = await db
          .select()
          .from(recommendations)
          .where(and(...followedConditions))
          .orderBy(desc(recommendations.createdAt))
          .limit(15); // Get more from followed users
        
        // Get recent community recommendations (not from followed users or self)
        const communityRecs = await db
          .select()
          .from(recommendations)
          .where(and(...communityConditions))
          .orderBy(desc(recommendations.createdAt))
          .limit(10); // Get fewer from community
        
        // Combine and sort by timestamp
        const combined = [...followedRecs, ...communityRecs]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, limit);
        
        return combined;
      } else {
        // User doesn't follow anyone - show community recommendations excluding their own
        const conditions = [notInArray(recommendations.userId, [userId])];
        if (categoryId) {
          conditions.push(eq(recommendations.categoryId, categoryId));
        }
        
        return await db
          .select()
          .from(recommendations)
          .where(and(...conditions))
          .orderBy(desc(recommendations.createdAt))
          .limit(limit);
      }
    }
    
    // If user is not authenticated, just show recent recommendations
    let query = db.select().from(recommendations);
    
    if (categoryId) {
      query = query.where(eq(recommendations.categoryId, categoryId)) as any;
    }
    
    return await query
      .orderBy(desc(recommendations.createdAt))
      .limit(limit);
  }

  // ===== ADMIN RECOMMENDS OPERATIONS =====
  async getAdminRecommends(visibleOnly: boolean = false): Promise<AdminRecommend[]> {
    let query = db.select().from(adminRecommends);
    
    if (visibleOnly) {
      query = query.where(eq(adminRecommends.isVisible, true)) as any;
    }
    
    return await query.orderBy(desc(adminRecommends.createdAt));
  }

  async getAdminRecommend(id: string): Promise<AdminRecommend | undefined> {
    const [recommend] = await db.select().from(adminRecommends).where(eq(adminRecommends.id, id));
    return recommend;
  }

  async createAdminRecommend(data: InsertAdminRecommend, userId: string): Promise<AdminRecommend> {
    const [recommend] = await db
      .insert(adminRecommends)
      .values({
        ...data,
        createdBy: userId,
      })
      .returning();
    return recommend;
  }

  async updateAdminRecommend(id: string, data: Partial<InsertAdminRecommend>): Promise<AdminRecommend> {
    const [recommend] = await db
      .update(adminRecommends)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(adminRecommends.id, id))
      .returning();
    return recommend;
  }

  async deleteAdminRecommend(id: string): Promise<void> {
    await db.delete(adminRecommends).where(eq(adminRecommends.id, id));
  }

  async toggleAdminRecommendVisibility(id: string): Promise<AdminRecommend> {
    const current = await this.getAdminRecommend(id);
    if (!current) {
      throw new Error("Admin recommend not found");
    }
    
    const [recommend] = await db
      .update(adminRecommends)
      .set({
        isVisible: !current.isVisible,
        updatedAt: new Date(),
      })
      .where(eq(adminRecommends.id, id))
      .returning();
    return recommend;
  }

  // ===== SECTION OPERATIONS =====
  async getSections(): Promise<Section[]> {
    return await db
      .select()
      .from(sections)
      .orderBy(sections.displayOrder, desc(sections.createdAt));
  }

  async getSection(id: string): Promise<Section | undefined> {
    const [section] = await db.select().from(sections).where(eq(sections.id, id));
    return section;
  }

  async getSectionsWithRecommendations(): Promise<SectionWithRecommendations[]> {
    const allSections = await this.getSections();
    
    const sectionsWithRecs = await Promise.all(
      allSections.map(async (section) => {
        const recs = await this.getSectionRecommendations(section.id);
        
        // Also fetch admin recommends assigned to this section (visible only)
        const adminRecs = await db
          .select()
          .from(adminRecommends)
          .where(
            and(
              eq(adminRecommends.sectionId, section.id),
              eq(adminRecommends.isVisible, true)
            )
          )
          .orderBy(adminRecommends.createdAt);
        
        return {
          ...section,
          recommendations: recs,
          adminRecommends: adminRecs,
        };
      })
    );
    
    return sectionsWithRecs;
  }

  async createSection(data: InsertSection, userId: string): Promise<Section> {
    const [section] = await db
      .insert(sections)
      .values({
        ...data,
        createdBy: userId,
      })
      .returning();
    return section;
  }

  async updateSection(id: string, data: Partial<InsertSection>): Promise<Section> {
    const [section] = await db
      .update(sections)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(sections.id, id))
      .returning();
    return section;
  }

  async deleteSection(id: string): Promise<void> {
    await db.delete(sections).where(eq(sections.id, id));
  }

  async addRecommendationToSection(
    sectionId: string,
    recommendationId: string
  ): Promise<SectionRecommendation> {
    // Count existing recs in this section
    const existing = await db
      .select()
      .from(sectionRecommendations)
      .where(eq(sectionRecommendations.sectionId, sectionId));

    if (existing.length >= 8) {
      throw new Error("Section can only have up to 8 recommendations");
    }

    const [sectionRec] = await db
      .insert(sectionRecommendations)
      .values({
        sectionId,
        recommendationId,
        displayOrder: existing.length,
      })
      .returning();
    return sectionRec;
  }

  async removeRecommendationFromSection(
    sectionId: string,
    recommendationId: string
  ): Promise<void> {
    await db
      .delete(sectionRecommendations)
      .where(
        and(
          eq(sectionRecommendations.sectionId, sectionId),
          eq(sectionRecommendations.recommendationId, recommendationId)
        )
      );
  }

  async getSectionRecommendations(sectionId: string): Promise<Recommendation[]> {
    const results = await db
      .select({
        recommendation: recommendations,
      })
      .from(sectionRecommendations)
      .innerJoin(
        recommendations,
        eq(sectionRecommendations.recommendationId, recommendations.id)
      )
      .where(eq(sectionRecommendations.sectionId, sectionId))
      .orderBy(sectionRecommendations.displayOrder);

    return results.map((r) => r.recommendation);
  }

  // ===== APP SETTINGS OPERATIONS =====
  async getSetting(key: string): Promise<string | null> {
    const [setting] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, key));
    return setting?.value || null;
  }

  async setSetting(key: string, value: string): Promise<AppSetting> {
    // Try to update first
    const existing = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, key))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(appSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(appSettings.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(appSettings)
        .values({ key, value })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();

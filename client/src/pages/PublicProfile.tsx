import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RecommendationCard from "@/components/RecommendationCard";
import { QrCode, Share2, UserPlus, UserMinus, Check, Edit } from "lucide-react";
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfile } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Recommendation, Category } from "@shared/schema";
import QRCode from "qrcode";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { Upload, ImageIcon } from "lucide-react";

type UserStats = {
  recommendationsCount: number;
  followersCount: number;
  followingCount: number;
  likesCount: number;
};

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [deleteRecId, setDeleteRecId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const { data: profileUser, isLoading: userLoading, isError: userError } = useQuery<User>({
    queryKey: ['/api/user', username],
    enabled: !!username,
  });

  const editForm = useForm<UpdateProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: "",
      bio: "",
      profileImageUrl: "",
      instagramUrl: "",
      tiktokUrl: "",
      youtubeUrl: "",
    },
  });

  useEffect(() => {
    if (profileUser) {
      editForm.reset({
        username: profileUser.username || "",
        bio: profileUser.bio || "",
        profileImageUrl: profileUser.profileImageUrl || "",
        instagramUrl: profileUser.instagramUrl || "",
        tiktokUrl: profileUser.tiktokUrl || "",
        youtubeUrl: profileUser.youtubeUrl || "",
      });
    }
  }, [profileUser, editForm]);

  const { data: stats } = useQuery<UserStats>({
    queryKey: ['/api/user', profileUser?.id, 'stats'],
    enabled: !!profileUser?.id,
  });

  const { data: recommendations = [], isLoading: recsLoading } = useQuery<Recommendation[]>({
    queryKey: [`/api/recommendations?userId=${profileUser?.id}`],
    enabled: !!profileUser?.id,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: follows = [] } = useQuery<any[]>({
    queryKey: ['/api/follows'],
    enabled: !!currentUser,
  });

  const isFollowing = follows.some((f) => f.followingId === profileUser?.id);
  const isOwnProfile = currentUser?.id === profileUser?.id;

  const followMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/follow/${profileUser?.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/follows'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', profileUser?.id, 'stats'] });
      toast({
        title: "Success",
        description: `You are now following @${profileUser?.username}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/unfollow/${profileUser?.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/follows'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', profileUser?.id, 'stats'] });
      toast({
        title: "Success",
        description: `You unfollowed @${profileUser?.username}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfile) => {
      console.log('[updateProfile] Starting mutation with data:', data);
      try {
        const response = await apiRequest('PATCH', '/api/user/profile', data);
        console.log('[updateProfile] Response received:', response.status);
        const result = await response.json() as User;
        console.log('[updateProfile] Parsed result:', result);
        return result;
      } catch (error) {
        console.error('[updateProfile] Error in mutationFn:', error);
        throw error;
      }
    },
    onSuccess: async (updatedUser: User) => {
      console.log('[updateProfile] onSuccess called');
      await queryClient.invalidateQueries({ queryKey: ['/api/user', username] });
      await queryClient.invalidateQueries({ queryKey: ['/api/user', updatedUser.username] });
      await queryClient.invalidateQueries({ queryKey: ['/api/user', profileUser?.id, 'stats'] });
      setEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Your profile has been updated",
      });
      if (updatedUser.username !== profileUser?.username) {
        navigate(`/profile/${updatedUser.username}`);
      }
    },
    onError: (error: any) => {
      console.error('[updateProfile] onError called:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      return await apiRequest('POST', '/api/categories', { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setCategoryDialogOpen(false);
      setNewCategoryName("");
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      return await apiRequest('DELETE', `/api/categories/${categoryId}`);
    },
    onSuccess: (_, deletedCategoryId) => {
      // Reset selected category if it was the one deleted
      if (selectedCategory === deletedCategoryId) {
        setSelectedCategory("all");
      }
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: [`/api/recommendations?userId=${profileUser?.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', profileUser?.id, 'stats'] });
      setDeleteCategoryId(null);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  const deleteRecommendationMutation = useMutation({
    mutationFn: async (recommendationId: string) => {
      return await apiRequest('DELETE', `/api/recommendations/${recommendationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/recommendations?userId=${profileUser?.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', profileUser?.id, 'stats'] });
      setDeleteRecId(null);
      toast({
        title: "Success",
        description: "Recommendation deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete recommendation",
        variant: "destructive",
      });
    },
  });

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const handleSearch = () => {
    navigate('/explore');
  };

  const handleCreateRec = () => {
    if (!currentUser) {
      handleLogin();
      return;
    }
    navigate('/create');
  };

  const handleAdmin = () => {
    navigate('/admin');
  };

  const handleFollowToggle = () => {
    if (!currentUser) {
      handleLogin();
      return;
    }
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileUser?.username}'s Profile`,
          url,
        });
      } catch (err) {
        // User cancelled share or error occurred
        setShareDialogOpen(true);
      }
    } else {
      setShareDialogOpen(true);
    }
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Success",
        description: "Profile link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleShowQR = async () => {
    const url = window.location.href;
    try {
      const qrUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrCodeUrl(qrUrl);
      setQrDialogOpen(true);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.download = `${profileUser?.username}-qr.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const handleEditProfile = () => {
    setEditDialogOpen(true);
  };

  const handleSaveProfile = (data: UpdateProfile) => {
    console.log('[handleSaveProfile] Called with data:', data);
    console.log('[handleSaveProfile] Mutation isPending:', updateProfileMutation.isPending);
    updateProfileMutation.mutate(data);
    console.log('[handleSaveProfile] Mutation triggered');
  };

  // Filter recommendations by category
  const filteredRecs = selectedCategory === "all"
    ? recommendations
    : recommendations.filter((rec) => rec.categoryId === selectedCategory);

  // Count recommendations per category
  const categoryCounts = recommendations.reduce((acc, rec) => {
    if (rec.categoryId) {
      acc[rec.categoryId] = (acc[rec.categoryId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation
          isLoggedIn={!!currentUser}
          onLogin={handleLogin}
          onSearch={handleSearch}
          onCreateRec={handleCreateRec}
        />
        <div className="text-center py-12 text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (userError || !profileUser) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation
          isLoggedIn={!!currentUser}
          onLogin={handleLogin}
          onSearch={handleSearch}
          onCreateRec={handleCreateRec}
        />
        <div className="text-center py-12">
          <p className="text-destructive mb-2">User not found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isLoggedIn={!!currentUser}
        isAdmin={currentUser?.isAdmin || false}
        onLogin={handleLogin}
        onSearch={handleSearch}
        onCreateRec={handleCreateRec}
        onAdmin={handleAdmin}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="border-4 border-foreground p-4 md:p-8 mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-foreground flex-shrink-0">
              <AvatarImage src={profileUser.profileImageUrl || undefined} alt={profileUser.username || 'User'} />
              <AvatarFallback className="text-2xl md:text-3xl font-bold">
                {profileUser.username?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 w-full">
              <h1 className="font-display font-bold text-2xl md:text-4xl mb-2 break-words" data-testid="text-profile-name">
                {profileUser.username}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-4 break-words" data-testid="text-profile-username">
                @{profileUser.username}
              </p>

              {profileUser.bio && (
                <p className="text-base mb-6" data-testid="text-profile-bio">
                  {profileUser.bio}
                </p>
              )}

              {(profileUser.instagramUrl || profileUser.tiktokUrl || profileUser.youtubeUrl) && (
                <div className="flex gap-3 mb-6">
                  {profileUser.instagramUrl && (
                    <a
                      href={profileUser.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Visit Instagram profile"
                      className="hover-elevate active-elevate-2 p-2 rounded-md border-2 border-foreground"
                      data-testid="link-instagram"
                    >
                      <SiInstagram className="w-5 h-5" />
                    </a>
                  )}
                  {profileUser.tiktokUrl && (
                    <a
                      href={profileUser.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Visit TikTok profile"
                      className="hover-elevate active-elevate-2 p-2 rounded-md border-2 border-foreground"
                      data-testid="link-tiktok"
                    >
                      <SiTiktok className="w-5 h-5" />
                    </a>
                  )}
                  {profileUser.youtubeUrl && (
                    <a
                      href={profileUser.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Visit YouTube profile"
                      className="hover-elevate active-elevate-2 p-2 rounded-md border-2 border-foreground"
                      data-testid="link-youtube"
                    >
                      <SiYoutube className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-4 md:gap-6 mb-6 text-sm">
                <div>
                  <span className="font-bold" data-testid="text-profile-recs">
                    {stats?.recommendationsCount || 0}
                  </span>
                  <span className="text-muted-foreground ml-1">Recommendations</span>
                </div>
                <div className="cursor-pointer hover:underline">
                  <span className="font-bold" data-testid="text-profile-followers">
                    {stats?.followersCount || 0}
                  </span>
                  <span className="text-muted-foreground ml-1">Followers</span>
                </div>
                <div className="cursor-pointer hover:underline">
                  <span className="font-bold" data-testid="text-profile-following">
                    {stats?.followingCount || 0}
                  </span>
                  <span className="text-muted-foreground ml-1">Following</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 md:gap-3">
                {isOwnProfile ? (
                  <>
                    <Button
                      className="border-4 text-sm md:text-base"
                      size="sm"
                      onClick={handleEditProfile}
                      data-testid="button-edit-profile"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      className="border-4 text-sm md:text-base"
                      size="sm"
                      onClick={() => navigate('/create')}
                      data-testid="button-create-recommendation"
                    >
                      <span className="text-xl mr-2">+</span>
                      Create Recommendation
                    </Button>
                  </>
                ) : (
                  <Button
                    className="border-4 text-sm md:text-base"
                    size="sm"
                    onClick={handleFollowToggle}
                    disabled={followMutation.isPending || unfollowMutation.isPending}
                    data-testid="button-follow"
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
                <Button variant="outline" className="border-2 text-sm md:text-base" size="sm" onClick={handleShare} data-testid="button-share">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" className="border-2 text-sm md:text-base" size="sm" onClick={handleShowQR} data-testid="button-qr">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <section className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
            <h2 className="font-display font-bold text-xl md:text-2xl">Categories</h2>
            {isOwnProfile && (
              <Button
                onClick={() => setCategoryDialogOpen(true)}
                data-testid="button-create-category"
                size="sm"
                className="border-2 text-sm"
              >
                <span className="text-lg mr-2">+</span>
                Create Category
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge
              variant={selectedCategory === "all" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm border-2"
              onClick={() => setSelectedCategory("all")}
              data-testid="badge-category-all"
            >
              All ({recommendations.length})
            </Badge>
            {categories.filter(cat => categoryCounts[cat.id] > 0).map((cat) => (
              <div key={cat.id} className="relative group">
                <Badge
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm border-2"
                  onClick={() => setSelectedCategory(cat.id)}
                  data-testid={`badge-category-${cat.id}`}
                >
                  {cat.name} ({categoryCounts[cat.id] || 0})
                </Badge>
                {isOwnProfile && cat.userId === currentUser?.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteCategoryId(cat.id);
                    }}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`button-delete-category-${cat.id}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section>
          <h2 className="font-display font-bold text-xl md:text-2xl mb-4 md:mb-6 break-words">
            {selectedCategory === 'all' ? 'All Recommendations' : `${categories.find(c => c.id === selectedCategory)?.name} Recommendations`}
          </h2>
          {recsLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading recommendations...</div>
          ) : filteredRecs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No recommendations in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRecs.map((rec) => (
                <div key={rec.id} className="relative group">
                  <RecommendationCard
                    id={rec.id}
                    image={rec.imageUrl}
                    title={rec.title}
                    subtitle={categories.find(c => c.id === rec.categoryId)?.name || 'General'}
                    proTip={rec.proTip}
                    externalUrl={rec.externalUrl || undefined}
                    onClick={() => navigate(`/recommendation/${rec.id}`)}
                  />
                  {isOwnProfile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteRecId(rec.id);
                      }}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-md px-3 py-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity border-2 border-foreground"
                      data-testid={`button-delete-rec-${rec.id}`}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent data-testid="dialog-qr">
          <DialogHeader>
            <DialogTitle>Profile QR Code</DialogTitle>
            <DialogDescription>
              Share this QR code for easy access to this profile
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            {qrCodeUrl && (
              <>
                <img src={qrCodeUrl} alt="QR Code" className="border-4 border-foreground mb-4" />
                <Button onClick={handleDownloadQR} data-testid="button-download-qr">
                  Download QR Code
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent data-testid="dialog-share">
          <DialogHeader>
            <DialogTitle>Share Profile</DialogTitle>
            <DialogDescription>
              Copy the link to share this profile
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={window.location.href}
              className="flex-1 px-3 py-2 border-2 border-foreground rounded bg-background"
              data-testid="input-share-url"
            />
            <Button onClick={handleCopyLink} data-testid="button-copy-link">
              {copied ? <Check className="w-4 h-4" /> : 'Copy'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-profile">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleSaveProfile)} className="space-y-6">
              <FormField
                control={editForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter username" 
                        {...field} 
                        data-testid="input-edit-username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about yourself" 
                        className="resize-none"
                        rows={4}
                        {...field} 
                        data-testid="input-edit-bio"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="profileImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={10485760}
                          onGetUploadParameters={async () => {
                            const response = await apiRequest('POST', '/api/objects/upload', {});
                            const data: any = await response.json();
                            return {
                              method: 'PUT' as const,
                              url: data.uploadURL,
                            };
                          }}
                          onComplete={async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
                            if (result.successful && result.successful.length > 0) {
                              setIsUploadingAvatar(true);
                              const uploadedUrl = result.successful[0].uploadURL;
                              try {
                                const response = await apiRequest('PUT', '/api/recommendation-images', {
                                  imageURL: uploadedUrl,
                                });
                                const data: any = await response.json();
                                setUploadedAvatarUrl(data.objectPath);
                                field.onChange(data.objectPath);
                                toast({
                                  title: "Success",
                                  description: "Avatar uploaded successfully!",
                                });
                              } catch (error) {
                                console.error("Error setting avatar ACL:", error);
                                toast({
                                  variant: "destructive",
                                  title: "Error",
                                  description: "Failed to save avatar",
                                });
                              } finally {
                                setIsUploadingAvatar(false);
                              }
                            }
                          }}
                          variant="outline"
                          data-testid="uploader-avatar"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadedAvatarUrl || field.value ? "Change Avatar" : "Upload Avatar"}
                        </ObjectUploader>
                        
                        {(uploadedAvatarUrl || field.value) && (() => {
                          const avatarUrl = uploadedAvatarUrl || field.value || '';
                          const displayUrl = avatarUrl.startsWith('/objects/') 
                            ? `/api${avatarUrl}` 
                            : avatarUrl;
                          
                          return (
                            <div className="border-4 border-foreground rounded-md p-4 bg-card space-y-3">
                              <div className="text-sm font-medium">Avatar Preview</div>
                              
                              {/* Circular preview showing how it will appear */}
                              <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0">
                                  <div className="w-24 h-24 rounded-full border-4 border-foreground overflow-hidden bg-muted">
                                    <img 
                                      src={displayUrl}
                                      alt="Avatar preview" 
                                      className="w-full h-full object-cover"
                                      style={{ objectPosition: 'center' }}
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex-1">
                                  <p className="text-sm text-muted-foreground mb-3">
                                    This is how your avatar will appear on your profile.
                                  </p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      field.onChange('');
                                      setUploadedAvatarUrl(null);
                                    }}
                                    data-testid="button-remove-avatar"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="instagramUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://instagram.com/yourprofile" 
                        {...field} 
                        data-testid="input-edit-instagram"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="tiktokUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TikTok URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://tiktok.com/@yourprofile" 
                        {...field} 
                        data-testid="input-edit-tiktok"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="youtubeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://youtube.com/@yourprofile" 
                        {...field} 
                        data-testid="input-edit-youtube"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  data-testid="button-edit-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-edit-save"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent data-testid="dialog-create-category">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a custom category for your recommendations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              data-testid="input-category-name"
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setCategoryDialogOpen(false);
                  setNewCategoryName("");
                }}
                data-testid="button-category-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createCategoryMutation.mutate(newCategoryName)}
                disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                data-testid="button-category-save"
              >
                {createCategoryMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <Dialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
        <DialogContent data-testid="dialog-delete-category">
          <DialogHeader>
            <DialogTitle>Delete Category?</DialogTitle>
            <DialogDescription>
              This will remove the category from your recommendations. Recommendations in this category will become uncategorized.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteCategoryId(null)}
              data-testid="button-cancel-delete-category"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteCategoryId && deleteCategoryMutation.mutate(deleteCategoryId)}
              disabled={deleteCategoryMutation.isPending}
              data-testid="button-confirm-delete-category"
            >
              {deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Recommendation Confirmation Dialog */}
      <Dialog open={!!deleteRecId} onOpenChange={() => setDeleteRecId(null)}>
        <DialogContent data-testid="dialog-delete-recommendation">
          <DialogHeader>
            <DialogTitle>Delete Recommendation?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this recommendation.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteRecId(null)}
              data-testid="button-cancel-delete-rec"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteRecId && deleteRecommendationMutation.mutate(deleteRecId)}
              disabled={deleteRecommendationMutation.isPending}
              data-testid="button-confirm-delete-rec"
            >
              {deleteRecommendationMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

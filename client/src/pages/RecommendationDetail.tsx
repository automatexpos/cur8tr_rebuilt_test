import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import { logout } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Heart, MapPin, Star, ExternalLink, ArrowLeft, MessageCircle } from "lucide-react";
import type { Recommendation, User, Category, Comment as CommentType } from "@shared/schema";
import Comment from "@/components/Comment";
import CommentForm from "@/components/CommentForm";
import ShareButton from "@/components/ShareButton";
import { useState } from "react";

type RecommendationWithDetails = Recommendation & {
  user: User;
  category: Category | null;
  likeCount: number;
};

type CommentWithUser = CommentType & {
  user: User;
  replies: Array<CommentType & { user: User }>;
};

export default function RecommendationDetail() {
  const [, params] = useRoute("/recommendation/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const recId = params?.id;
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // Fetch current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });

  // Fetch recommendation details
  const { data: recommendation, isLoading } = useQuery<RecommendationWithDetails>({
    queryKey: ['/api/recommendations', recId],
    enabled: !!recId,
  });

  // Fetch user's likes
  const { data: userLikes = [] } = useQuery<{ recommendationId: string }[]>({
    queryKey: ['/api/likes'],
    enabled: !!currentUser,
  });

  const isLiked = userLikes.some(like => like.recommendationId === recId);

  // Fetch comments
  const { data: comments = [] } = useQuery<CommentWithUser[]>({
    queryKey: ['/api/comments', recId],
    enabled: !!recId,
  });

  // Check if current user is the recommender
  const isRecommender = currentUser && recommendation && currentUser.id === recommendation.userId;

  const handleLogout = () => {
    logout();
  };

  const handleAdmin = () => {
    navigate('/admin');
  };

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async ({ text, parentId }: { text: string; parentId?: string }) => {
      if (!currentUser) {
        navigate('/');
        return;
      }
      return await apiRequest('POST', '/api/comments', {
        text,
        recommendationId: recId,
        parentId: parentId || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments', recId] });
      setReplyTo(null);
      toast({
        title: "Success",
        description: replyTo ? "Reply posted!" : "Comment posted!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  // Like/unlike mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        navigate('/');
        return;
      }
      return await apiRequest(
        isLiked ? 'DELETE' : 'POST',
        `/api/like/${recId}`
      );
    },
    onSuccess: async () => {
      // Invalidate and refetch all related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/likes'], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['/api/recommendations', recId], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['/api/recommendations'], refetchType: 'active' }),
      ]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation 
          isLoggedIn={!!currentUser}
          isAdmin={currentUser?.isAdmin || false}
          onLogout={handleLogout}
          onCreateRec={() => navigate('/create')}
          onAdmin={handleAdmin}
        />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">Loading...</div>
        </main>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation 
          isLoggedIn={!!currentUser}
          isAdmin={currentUser?.isAdmin || false}
          onCreateRec={() => navigate('/create')}
          onAdmin={handleAdmin}
        />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Recommendation not found</p>
            <Button onClick={() => navigate('/explore')} data-testid="button-back-to-explore">
              Back to Explore
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "fill-primary text-primary"
                : "fill-none text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
        <Navigation
          isLoggedIn={!!currentUser}
          isAdmin={currentUser?.isAdmin || false}
          onLogout={handleLogout}
          onCreateRec={() => navigate('/create')}
          onAdmin={handleAdmin}
        />      <main className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mb-4 md:mb-6 border-2"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Main Content */}
        <div className="bg-card border-4 border-foreground rounded-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {/* Image */}
          {recommendation.imageUrl && (
            <div className="w-full h-[250px] md:h-[400px] overflow-hidden border-b-4 border-foreground">
              <img
                src={recommendation.imageUrl}
                alt={recommendation.title}
                className="w-full h-full object-cover"
                data-testid="img-recommendation"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-4 md:p-8">
            {/* Badges */}
            <div className="flex gap-3 mb-4 flex-wrap">
              {recommendation.proTip && (
                <Badge
                  variant="default"
                  className="border-2 px-3 py-1"
                  data-testid="badge-pro-tip"
                >
                  ⭐ Pro Tip
                </Badge>
              )}
              {recommendation.category && (
                <Badge
                  variant="outline"
                  className="border-2 px-3 py-1"
                  data-testid="badge-category"
                >
                  {recommendation.category.name}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1
              className="font-display font-bold text-2xl md:text-4xl mb-4 break-words"
              data-testid="text-title"
            >
              {recommendation.title}
            </h1>

            {/* Rating & Like */}
            <div className="flex items-center gap-4 md:gap-6 mb-6 flex-wrap">
              <div className="flex items-center gap-2" data-testid="rating-stars">
                {renderStars(recommendation.rating)}
                <span className="text-sm text-muted-foreground">
                  {recommendation.rating}/5
                </span>
              </div>
              
              <button
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isPending || !currentUser}
                className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-1 rounded border-2 border-foreground"
                data-testid="button-like"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isLiked ? "fill-primary text-primary" : "fill-none"
                  }`}
                />
                <span className="font-medium" data-testid="text-like-count">
                  {recommendation.likeCount}
                </span>
              </button>

              <ShareButton
                title={recommendation.title}
                description={recommendation.description}
                variant="outline"
                size="default"
                className="border-2"
              />
            </div>

            {/* User Info */}
            <div
              className="flex items-center gap-3 mb-6 pb-6 border-b-2 border-foreground cursor-pointer hover-elevate rounded p-2"
              onClick={() => navigate(`/profile/${recommendation.user.username}`)}
              data-testid="link-user-profile"
            >
              <Avatar className="border-2 border-foreground w-12 h-12">
                <AvatarImage src={recommendation.user.profileImageUrl || undefined} />
                <AvatarFallback>
                  {recommendation.user.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium" data-testid="text-username">
                  @{recommendation.user.username}
                </p>
                <p className="text-sm text-muted-foreground">
                  Recommended by
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="font-display font-bold text-lg md:text-xl mb-3">Description</h2>
              <p
                className="text-sm md:text-base text-foreground leading-relaxed whitespace-pre-wrap break-words"
                data-testid="text-description"
              >
                {recommendation.description}
              </p>
            </div>

            {/* Pro Tip */}
            {recommendation.proTip && (
              <div className="mb-6 p-3 md:p-4 border-2 border-primary bg-primary/5 rounded-md">
                <div className="flex items-start gap-2">
                  <span className="text-lg">⭐</span>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display font-bold text-base md:text-lg mb-2 text-primary">Pro Tip</h2>
                    <p
                      className="text-foreground leading-relaxed"
                      data-testid="text-pro-tip"
                    >
                      {recommendation.proTip}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            {recommendation.location && (
              <div className="mb-6">
                <h2 className="font-display font-bold text-xl mb-3">Location</h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  <span data-testid="text-location">{recommendation.location}</span>
                </div>
              </div>
            )}

            {/* External Link */}
            {recommendation.externalUrl && (
              <div className="mb-6">
                <Button
                  variant="outline"
                  className="border-2"
                  onClick={() => window.open(recommendation.externalUrl!, '_blank')}
                  data-testid="button-external-link"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Website
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t-2 border-foreground">
              <Button
                onClick={() => navigate(`/profile/${recommendation.user.username}`)}
                className="border-2"
                data-testid="button-view-profile"
              >
                View Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/explore')}
                className="border-2"
                data-testid="button-explore-more"
              >
                Explore More
              </Button>
            </div>

            {/* Comments Section */}
            <div className="pt-8 mt-8 border-t-2 border-foreground">
              <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="w-6 h-6" />
                <h2 className="font-display font-bold text-2xl">
                  Comments ({comments.length})
                </h2>
              </div>

              {/* Comment Form */}
              {currentUser ? (
                <div className="mb-8">
                  {replyTo ? (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">
                          Replying to comment
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyTo(null)}
                          data-testid="button-cancel-reply"
                        >
                          Cancel
                        </Button>
                      </div>
                      <CommentForm
                        onSubmit={(text) => createCommentMutation.mutate({ text, parentId: replyTo })}
                        isSubmitting={createCommentMutation.isPending}
                        placeholder="Write your reply..."
                        buttonText="Reply"
                      />
                    </div>
                  ) : (
                    <CommentForm
                      onSubmit={(text) => createCommentMutation.mutate({ text })}
                      isSubmitting={createCommentMutation.isPending}
                    />
                  )}
                </div>
              ) : (
                <div className="mb-8 p-4 border-2 border-foreground rounded-md bg-muted">
                  <p className="text-sm text-muted-foreground">
                    Please{' '}
                    <button
                      onClick={() => navigate('/')}
                      className="text-primary underline"
                      data-testid="link-sign-in-to-comment"
                    >
                      sign in
                    </button>
                    {' '}to leave a comment.
                  </p>
                </div>
              )}

              {/* Comments List */}
              {comments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <div className="space-y-6" data-testid="comments-list">
                  {comments.map((comment) => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      isRecommender={isRecommender || false}
                      onReply={isRecommender ? setReplyTo : undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

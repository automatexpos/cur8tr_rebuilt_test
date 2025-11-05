import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import { logout } from "@/lib/authUtils";
import RecommendationCard from "@/components/RecommendationCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import type { Recommendation, Category, Like } from "@shared/schema";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function Activity() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: recommendations = [], isLoading } = useQuery<Recommendation[]>({
    queryKey: ['/api/activity-feed', selectedCategory !== 'all' ? selectedCategory : undefined],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('categoryId', selectedCategory);
      }
      const url = `/api/activity-feed${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch activity feed');
      return response.json();
    },
  });

  const { data: userLikes = [] } = useQuery<Like[]>({
    queryKey: ['/api/likes'],
  });

  const likeMutation = useMutation({
    mutationFn: (recommendationId: string) => apiRequest('POST', `/api/like/${recommendationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/likes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity-feed'] });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: (recommendationId: string) => apiRequest('DELETE', `/api/like/${recommendationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/likes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity-feed'] });
    },
  });

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const handleLogout = () => {
    logout();
  };

  const handleSearch = () => {
    navigate('/explore');
  };

  const handleCreateRec = () => {
    if (!user) {
      handleLogin();
      return;
    }
    navigate('/create');
  };

  const handleAdmin = () => {
    navigate('/admin');
  };

  const handleProfile = () => {
    navigate('/dashboard');
  };

  const handleLike = (recommendationId: string) => {
    if (!user) {
      handleLogin();
      return;
    }
    
    const isLiked = userLikes.some(like => like.recommendationId === recommendationId);
    if (isLiked) {
      unlikeMutation.mutate(recommendationId);
    } else {
      likeMutation.mutate(recommendationId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isLoggedIn={!!user}
        isAdmin={user?.isAdmin || false}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSearch={handleSearch}
        onProfile={handleProfile}
        onCreateRec={handleCreateRec}
        onAdmin={handleAdmin}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="space-y-6 md:space-y-8">
          {/* Header */}
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold font-display" data-testid="text-activity-title">
              Activity Feed
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              {user 
                ? "Recommendations from people you follow and the community"
                : "See what's happening in the community"
              }
            </p>
            
            {/* Category Filter */}
            <div className="flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px]" data-testid="select-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory !== "all" && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer gap-1"
                  onClick={() => setSelectedCategory("all")}
                  data-testid="badge-clear-category"
                >
                  {categories.find(c => c.id === selectedCategory)?.name} ×
                </Badge>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading activity...
            </div>
          ) : recommendations.length === 0 ? (
            <Card className="border-4 p-12 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">No activity yet</h2>
              <p className="text-muted-foreground">
                Check back soon for updates from the community!
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.slice(0, 20).map((rec) => {
                const isLiked = userLikes.some(like => like.recommendationId === rec.id);
                return (
                  <RecommendationCard
                    key={rec.id}
                    id={rec.id}
                    title={rec.title}
                    subtitle={categories.find(c => c.id === rec.categoryId)?.name || 'General'}
                    image={rec.imageUrl}
                    proTip={rec.proTip}
                    externalUrl={rec.externalUrl || undefined}
                    showLike={true}
                    isLiked={isLiked}
                    likeCount={(rec as any).likeCount || 0}
                    onLike={() => handleLike(rec.id)}
                    onClick={() => navigate(`/recommendation/${rec.id}`)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

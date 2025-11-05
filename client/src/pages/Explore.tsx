import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import RecommendationCard from "@/components/RecommendationCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Recommendation, Category, Like } from "@shared/schema";

export default function Explore() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: recommendations = [], isLoading: recsLoading, isError: recsError } = useQuery<Recommendation[]>({
    queryKey: ['/api/recommendations'],
  });

  const { data: categories = [], isError: categoriesError } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: userLikes = [] } = useQuery<Like[]>({
    queryKey: ['/api/likes'],
  });

  const likeMutation = useMutation({
    mutationFn: (recommendationId: string) => apiRequest('POST', `/api/like/${recommendationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/likes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: (recommendationId: string) => apiRequest('DELETE', `/api/like/${recommendationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/likes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
    },
  });

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

  const handleLogin = () => {
    window.location.href = '/api/login';
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

  // Filter and sort recommendations
  const filteredRecs = recommendations
    .filter((rec) => {
      // Search filter
      const matchesSearch = searchQuery.trim() === "" || 
        rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === "all" || rec.categoryId === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "popular") {
        // Sort by rating as a proxy for popularity until we add likes count
        return b.rating - a.rating;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isLoggedIn={!!user}
        isAdmin={user?.isAdmin || false}
        onLogin={handleLogin}
        onSearch={handleSearch}
        onProfile={handleProfile}
        onCreateRec={handleCreateRec}
        onAdmin={handleAdmin}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="space-y-6 md:space-y-8">
          {/* Header */}
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold font-display">Explore Recommendations</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Discover curated recommendations from the community
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recommendations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                  data-testid="button-clear-search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Category Filter */}
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

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "recent" | "popular")}>
              <SelectTrigger className="w-full md:w-[200px]" data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter Toggle */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden" data-testid="button-filters">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Filter and sort recommendations
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger data-testid="select-category-mobile">
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
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as "recent" | "popular")}>
                      <SelectTrigger data-testid="select-sort-mobile">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedCategory !== "all") && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1" data-testid="badge-search-filter">
                  Search: {searchQuery}
                  <X
                    className="h-3 w-3 cursor-pointer hover-elevate"
                    onClick={() => setSearchQuery("")}
                  />
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1" data-testid="badge-category-filter">
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <X
                    className="h-3 w-3 cursor-pointer hover-elevate"
                    onClick={() => setSelectedCategory("all")}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                data-testid="button-clear-filters"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Results */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground" data-testid="text-results-count">
              {filteredRecs.length} {filteredRecs.length === 1 ? 'recommendation' : 'recommendations'} found
            </p>

            {recsError || categoriesError ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-2">Failed to load data</p>
                <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
              </div>
            ) : recsLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading recommendations...
              </div>
            ) : filteredRecs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No recommendations found matching your filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-4"
                  data-testid="button-reset-filters"
                >
                  Reset filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredRecs.map((rec) => {
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
        </div>
      </main>
    </div>
  );
}

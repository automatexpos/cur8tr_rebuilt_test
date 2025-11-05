import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Star, LayoutGrid } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import RecommendationCard from "@/components/RecommendationCard";
import type { Recommendation, Category, SectionWithRecommendations, AdminRecommend } from "@shared/schema";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CuratorRecs() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: sections = [], isLoading } = useQuery<SectionWithRecommendations[]>({
    queryKey: ['/api/sections/with-recommendations'],
  });

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

  const handleProfile = () => {
    if (user?.username) {
      navigate(`/profile/${user.username}`);
    }
  };

  const handleAdmin = () => {
    navigate('/admin');
  };

  // Filter sections by category if selected
  const filteredSections = selectedCategory === 'all' 
    ? sections 
    : sections.map(section => ({
        ...section,
        recommendations: section.recommendations.filter(rec => rec.categoryId === selectedCategory)
      })).filter(section => section.recommendations.length > 0);

  const hasSections = sections.length > 0;
  const hasRecommendations = filteredSections.some(section => section.recommendations.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isLoggedIn={!!user}
        isAdmin={user?.isAdmin || false}
        onLogin={handleLogin}
        onSearch={handleSearch}
        onCreateRec={handleCreateRec}
        onProfile={handleProfile}
        onAdmin={handleAdmin}
      />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold font-display flex items-center gap-2" data-testid="text-curator-recs-title">
                <Star className="w-10 h-10 fill-primary text-primary" />
                CUR8tr Recs
              </h1>
              <p className="text-lg text-muted-foreground">
                Handpicked recommendations curated by our team
              </p>
            </div>
            
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

          {/* Sections */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading recommendations...
            </div>
          ) : !hasSections ? (
            <div className="border-4 border-foreground p-12 text-center">
              <LayoutGrid className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">No sections yet</h2>
              <p className="text-muted-foreground">
                Check back soon for handpicked recommendations!
              </p>
            </div>
          ) : selectedCategory !== 'all' && !hasRecommendations ? (
            <div className="border-4 border-foreground p-12 text-center">
              <LayoutGrid className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">No matching recommendations</h2>
              <p className="text-muted-foreground">
                No recommendations found in this category. Try selecting a different category.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {sections.map((section) => {
                const filteredRecs = selectedCategory === 'all' 
                  ? section.recommendations 
                  : section.recommendations.filter(rec => rec.categoryId === selectedCategory);
                
                // Admin recommends only show when no category filter (they don't have categories)
                const adminRecs = selectedCategory === 'all' ? section.adminRecommends : [];
                
                const totalItems = filteredRecs.length + adminRecs.length;
                
                // Only show section if it has items matching the filter or if no filter is applied
                if (selectedCategory !== 'all' && filteredRecs.length === 0) {
                  return null;
                }
                
                return (
                  <section key={section.id} className="space-y-4" data-testid={`section-${section.id}`}>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold font-display flex items-center gap-2" data-testid={`text-section-title-${section.id}`}>
                        <LayoutGrid className="w-6 h-6" />
                        {section.title}
                      </h2>
                      {section.subtitle && (
                        <p className="text-base text-muted-foreground" data-testid={`text-section-subtitle-${section.id}`}>
                          {section.subtitle}
                        </p>
                      )}
                    </div>
                    
                    {totalItems === 0 ? (
                      <div className="border-2 border-dashed border-muted-foreground/30 p-8 text-center rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          No recommendations assigned to this section yet
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredRecs.map((rec) => (
                          <RecommendationCard
                            key={rec.id}
                            id={rec.id}
                            image={rec.imageUrl || ''}
                            title={rec.title}
                            subtitle={rec.description}
                            proTip={rec.proTip}
                            onClick={() => navigate(`/recommendation/${rec.id}`)}
                          />
                        ))}
                        {adminRecs.map((rec) => (
                          <RecommendationCard
                            key={`admin-${rec.id}`}
                            id={rec.id}
                            image={rec.imageUrl}
                            title={rec.title}
                            subtitle={rec.subtitle || ''}
                            externalUrl={rec.externalUrl}
                            price={rec.price || undefined}
                            isAdminCard={true}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { AdminCuratorRecsManager } from "@/components/AdminCuratorRecsManager";
import { SectionManager } from "@/components/SectionManager";
import { Star, LayoutGrid } from "lucide-react";
import type { Recommendation, Category } from "@shared/schema";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // If not admin, redirect to user's profile page
    if (!isLoading && user && !user.isAdmin) {
      navigate(`/profile/${user.username}`);
    } else if (!isLoading && !user) {
      // If not logged in, redirect to homepage
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const { data: recommendations = [], isLoading: recsLoading } = useQuery<Recommendation[]>({
    queryKey: ['/api/recommendations'],
    enabled: !!user?.isAdmin,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: !!user?.isAdmin,
  });

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const handleSearch = () => {
    navigate('/explore');
  };

  const handleCreateRec = () => {
    navigate('/create');
  };

  const handleAdmin = () => {
    navigate('/admin');
  };

  const handleProfile = () => {
    if (user?.username) {
      navigate(`/profile/${user.username}`);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not admin, they'll be redirected, but show a loading state briefly
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isLoggedIn={true}
        isAdmin={user.isAdmin}
        onLogin={handleLogin}
        onSearch={handleSearch}
        onCreateRec={handleCreateRec}
        onAdmin={handleAdmin}
        onProfile={handleProfile}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8 md:mb-12">
          <h1 className="font-display font-bold text-3xl md:text-5xl mb-2">
            Admin Dashboard
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Manage CUR8tr Recommendations and platform content
          </p>
        </div>

        <section className="mb-8 md:mb-12 p-4 md:p-6 border-4 border-primary rounded-lg bg-primary/5">
          <h2 className="font-display font-bold text-lg md:text-2xl mb-4 md:mb-6 flex items-center gap-2 flex-wrap">
            <Star className="w-5 h-5 md:w-6 md:h-6 fill-primary text-primary" />
            <span>Manage CUR8tr Recommendations</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
            Select up to 8 recommendations to feature on the landing page and CUR8tr Recommendations page.
          </p>
          
          {recsLoading ? (
            <div className="text-center py-6 text-muted-foreground">Loading recommendations...</div>
          ) : (
            <AdminCuratorRecsManager recommendations={recommendations} categories={categories} />
          )}
        </section>

        <section className="mb-8 md:mb-12 p-4 md:p-6 border-4 border-foreground rounded-lg bg-card">
          <h2 className="font-display font-bold text-lg md:text-2xl mb-4 md:mb-6 flex items-center gap-2 flex-wrap">
            <LayoutGrid className="w-5 h-5 md:w-6 md:h-6" />
            <span>Manage CUR8tr Recs Sections</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
            Organize recommendations into themed sections for the CUR8tr Recs page. Each section can hold up to 8 recommendations.
          </p>
          
          {recsLoading ? (
            <div className="text-center py-6 text-muted-foreground">Loading recommendations...</div>
          ) : (
            <SectionManager recommendations={recommendations} />
          )}
        </section>
      </main>
    </div>
  );
}

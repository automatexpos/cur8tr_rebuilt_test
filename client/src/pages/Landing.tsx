import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import SectionHeader from "@/components/SectionHeader";
import RecommendationCard from "@/components/RecommendationCard";
import UserCard from "@/components/UserCard";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import type { Recommendation, FeaturedUser, AdminRecommend } from "@shared/schema";

export default function Landing() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const { data: recentRecs = [], isLoading: recentLoading } = useQuery<Recommendation[]>({
    queryKey: ['/api/recommendations'],
    select: (data) => data.slice(0, 8),
  });

  const { data: proTips = [], isLoading: proTipsLoading } = useQuery<Recommendation[]>({
    queryKey: ['/api/recommendations/pro-tips'],
  });

  const { data: adminRecommends = [], isLoading: adminRecommendsLoading } = useQuery<AdminRecommend[]>({
    queryKey: ['/api/admin-recommends'],
    queryFn: async () => {
      const response = await fetch('/api/admin-recommends?visibleOnly=true');
      if (!response.ok) {
        throw new Error('Failed to fetch admin recommends');
      }
      const data = await response.json();
      return data.slice(0, 8);
    },
  });

  const { data: featuredUsers = [], isLoading: featuredUsersLoading } = useQuery<FeaturedUser[]>({
    queryKey: ['/api/users/featured'],
  });

  const { data: curatorRecommendsSubtitle } = useQuery<{ key: string; value: string | null }>({
    queryKey: ['/api/settings/curator_recommends_subtitle'],
  });

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  const handleExplore = () => {
    navigate('/explore');
  };

  const handleSearch = () => {
    navigate('/explore');
  };

  const handleProfile = () => {
    navigate('/dashboard');
  };

  const handleCreateRec = () => {
    navigate('/create');
  };

  const handleAdmin = () => {
    navigate('/admin');
  };

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

      <Hero
        onSignUp={handleSignUp}
        onLogin={handleLogin}
        onExplore={handleExplore}
        isLoggedIn={!!user}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6">
        <section className="py-12 md:py-20">
          <SectionHeader
            title="Recent Recommendations"
            subtitle="Latest recommendations from the community"
          />
          {recentLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading recommendations...</div>
          ) : recentRecs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No recommendations yet. Be the first to share!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentRecs.map((rec) => (
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
            </div>
          )}
        </section>

        <section className="py-12 md:py-20">
          <SectionHeader
            title="CUR8tr Recommends"
            subtitle={curatorRecommendsSubtitle?.value || "Handpicked favorites from our team"}
            badge="Staff Picks"
          />
          {adminRecommendsLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading curator picks...</div>
          ) : adminRecommends.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No curator recommendations yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminRecommends.map((rec) => (
                <RecommendationCard
                  key={rec.id}
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

        <section className="py-12 md:py-20">
          <SectionHeader
            title="Pro Tips"
            subtitle="Expert recommendations you can't miss"
            badge="Featured"
          />
          {proTipsLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading pro tips...</div>
          ) : proTips.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No pro tips yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {proTips.map((rec) => (
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
            </div>
          )}
        </section>

        {featuredUsers.length > 0 && (
          <section className="py-12 md:py-20">
            <SectionHeader
              title="Featured CUR8trs"
              subtitle="Discover curators with exceptional taste"
            />
            {featuredUsersLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading curators...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredUsers.slice(0, 3).map((curator) => (
                  <UserCard
                    key={curator.id}
                    id={curator.id}
                    username={curator.username || 'anonymous'}
                    name={curator.username || 'Anonymous'}
                    avatar={curator.profileImageUrl || undefined}
                    recommendationsCount={curator.recommendationsCount}
                    followersCount={curator.followersCount}
                    onViewProfile={() => navigate(`/profile/${curator.username}`)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

import Navigation from "@/components/Navigation";
import SectionHeader from "@/components/SectionHeader";
import LocationMap from "@/components/LocationMap";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function ExploreMap() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const handleLogin = () => {
    window.location.href = '/api/login';
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isLoggedIn={!!user}
        isAdmin={user?.isAdmin || false}
        onLogin={handleLogin}
        onSearch={() => console.log('Search')}
        onProfile={handleProfile}
        onCreateRec={handleCreateRec}
        onAdmin={handleAdmin}
      />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <SectionHeader
          title="Explore by Location"
          subtitle="Discover recommendations in your area or anywhere in the world"
          badge="Interactive Map"
        />

        <LocationMap />
      </main>
    </div>
  );
}

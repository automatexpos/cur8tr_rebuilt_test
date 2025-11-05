import { Button } from "@/components/ui/button";
import { Sparkles, Compass, LogIn } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface HeroProps {
  onSignUp?: () => void;
  onLogin?: () => void;
  onExplore?: () => void;
  isLoggedIn?: boolean;
}

interface PlatformStats {
  recommendationsCount: number;
  curatorsCount: number;
  categoriesCount: number;
}

function formatCount(count: number): string {
  if (count >= 1000) {
    const thousands = count / 1000;
    return `${thousands.toFixed(1)}K+`;
  }
  return `${count}+`;
}

export default function Hero({ onSignUp, onLogin, onExplore, isLoggedIn = false }: HeroProps) {
  const { data: stats } = useQuery<PlatformStats>({
    queryKey: ['/api/platform/stats'],
  });

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <div className="inline-block mb-6">
          <div className="inline-flex items-center gap-2 border-2 border-foreground px-4 py-2 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wide">
            <Sparkles className="w-4 h-4" />
            Curate & Discover
          </div>
        </div>

        <h1 className="font-display font-bold text-5xl md:text-7xl mb-6 leading-tight" data-testid="text-hero-title">
          Discover & Share
          <br />
          Recommendations
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12" data-testid="text-hero-subtitle">
          Join a community of curators sharing their favorite books, places, products, and experiences
        </p>

        {!isLoggedIn && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={onSignUp}
              className="border-4 font-bold text-lg px-8 py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
              data-testid="button-hero-signup"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create Account
            </Button>
            
            <Button
              size="lg"
              variant="secondary"
              onClick={onLogin}
              className="border-2 font-medium text-lg px-8 py-6"
              data-testid="button-hero-login"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={onExplore}
              className="border-2 font-medium text-lg px-8 py-6"
              data-testid="button-hero-explore"
            >
              <Compass className="w-5 h-5 mr-2" />
              Explore Recs
            </Button>
          </div>
        )}

        <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm">
          <div className="text-center">
            <div className="font-display font-bold text-3xl mb-1" data-testid="text-stat-recs">
              {stats ? formatCount(stats.recommendationsCount) : '...'}
            </div>
            <div className="text-muted-foreground uppercase tracking-wide">Recommendations</div>
          </div>
          <div className="text-center">
            <div className="font-display font-bold text-3xl mb-1" data-testid="text-stat-curators">
              {stats ? formatCount(stats.curatorsCount) : '...'}
            </div>
            <div className="text-muted-foreground uppercase tracking-wide">Curators</div>
          </div>
          <div className="text-center">
            <div className="font-display font-bold text-3xl mb-1" data-testid="text-stat-categories">
              {stats ? formatCount(stats.categoriesCount) : '...'}
            </div>
            <div className="text-muted-foreground uppercase tracking-wide">Categories</div>
          </div>
        </div>
      </div>
    </section>
  );
}

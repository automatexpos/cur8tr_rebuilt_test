import { Search, Plus, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "wouter";

interface NavigationProps {
  isLoggedIn?: boolean;
  username?: string;
  isAdmin?: boolean;
  onCreateRec?: () => void;
  onSearch?: () => void;
  onProfile?: () => void;
  onLogin?: () => void;
  onAdmin?: () => void;
}

export default function Navigation({
  isLoggedIn = false,
  username,
  isAdmin = false,
  onCreateRec,
  onSearch,
  onProfile,
  onLogin,
  onAdmin
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b-4 border-foreground bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <a href="/" className="font-display font-bold text-2xl cursor-pointer hover-elevate px-2 py-1 rounded-md" data-testid="link-logo">
              CUR8tr
            </a>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="/explore" className="font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-explore">
                Explore
              </a>
              <a href="/activity" className="font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-activity">
                Activity
              </a>
              <a href="/curator-recs" className="font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-curator-recs">
                CUR8tr Recs
              </a>
              <a href="/map" className="font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-map">
                Map
              </a>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={onSearch}
              data-testid="button-search"
            >
              <Search className="w-5 h-5" />
            </Button>

            {isLoggedIn ? (
              <>
                <Button
                  onClick={onProfile}
                  variant="outline"
                  className="border-2 font-medium"
                  data-testid="button-dashboard"
                >
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                {isAdmin && (
                  <Button
                    onClick={onAdmin}
                    variant="outline"
                    className="border-2 font-medium"
                    data-testid="button-admin"
                  >
                    Admin
                  </Button>
                )}
                <Button
                  onClick={onCreateRec}
                  className="border-4 font-bold"
                  data-testid="button-create-rec"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rec
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include',
                      });
                      if (response.ok) {
                        window.location.href = '/';
                      }
                    } catch (error) {
                      console.error('Logout failed:', error);
                    }
                  }}
                  variant="outline"
                  className="border-2 font-medium"
                  data-testid="button-logout"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="border-2 font-medium"
                  data-testid="button-login"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="border-4 font-bold"
                  data-testid="button-register"
                >
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              <a href="/explore" className="font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-mobile-explore">
                Explore
              </a>
              <a href="/activity" className="font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-mobile-activity">
                Activity
              </a>
              <a href="/curator-recs" className="font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-mobile-curator-recs">
                CUR8tr Recs
              </a>
              <a href="/map" className="font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-mobile-map">
                Map
              </a>
              {isLoggedIn ? (
                <>
                  <Button onClick={onProfile} className="w-full mt-2 border-2 font-bold" data-testid="button-mobile-dashboard">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  {isAdmin && (
                    <Button onClick={onAdmin} className="w-full border-2 font-bold" data-testid="button-mobile-admin">
                      Admin
                    </Button>
                  )}
                  <Button onClick={onCreateRec} className="w-full border-2 border-foreground text-black" style={{ backgroundColor: '#C1BCCF' }} data-testid="button-mobile-create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Rec
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/auth/logout', {
                          method: 'POST',
                          credentials: 'include',
                        });
                        if (response.ok) {
                          window.location.href = '/';
                        }
                      } catch (error) {
                        console.error('Logout failed:', error);
                      }
                    }}
                    variant="outline"
                    className="w-full border-2 font-medium"
                    data-testid="button-mobile-logout"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full mt-2 border-2 font-medium" data-testid="button-mobile-login">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="w-full border-4 font-bold" data-testid="button-mobile-register">
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="border-t-4 border-foreground py-16 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-display font-bold text-2xl mb-4" data-testid="text-footer-logo">
              CUR8tr
            </h3>
            <p className="text-muted-foreground">
              Discover and share curated recommendations with a global community.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wide mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Explore</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Categories</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Curators</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Pro Tips</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wide mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-foreground">About</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wide mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-3">Get weekly curated recommendations</p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="border-2"
                data-testid="input-newsletter"
              />
              <Button className="border-2" data-testid="button-subscribe">
                Join
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2024 CUR8tr. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

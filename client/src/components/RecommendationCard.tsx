import { ExternalLink, Heart, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ShareButton from "@/components/ShareButton";

interface RecommendationCardProps {
  id?: string;
  image?: string | null;
  title: string;
  subtitle: string;
  proTip?: string | null;
  price?: string;
  externalUrl?: string;
  onClick?: () => void;
  likeCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
  showLike?: boolean;
  isAdminCard?: boolean;
}

export default function RecommendationCard({
  id,
  image,
  title,
  subtitle,
  proTip,
  price,
  externalUrl,
  onClick,
  likeCount = 0,
  isLiked = false,
  onLike,
  showLike = false,
  isAdminCard = false,
}: RecommendationCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  
  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike();
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer overflow-visible"
      data-testid={`card-recommendation-${id || 'unknown'}`}
    >
      <div className="border-4 border-foreground overflow-hidden transition-transform duration-200 hover:translate-y-[-4px]">
        <div className={`relative ${isAdminCard ? 'aspect-[9/16]' : 'aspect-[4/5]'}`}>
          {image ? (
            <>
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </>
          ) : (
            <>
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <div className="text-center p-6">
                  <FileText className="w-16 h-16 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-foreground font-medium line-clamp-2">{title}</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-background/10 to-transparent" />
            </>
          )}
          
          {proTip && (
            <div className="absolute top-4 left-4">
              <Badge 
                variant="default" 
                className="border-2 border-primary-foreground bg-primary text-primary-foreground px-3 py-1 text-xs font-bold uppercase tracking-wide"
                data-testid="badge-protip"
              >
                Pro Tip
              </Badge>
            </div>
          )}

          {price && (
            <div className="absolute top-4 right-4">
              <Badge 
                className="border-2 border-foreground bg-background text-foreground px-3 py-1 text-sm font-bold"
                data-testid="badge-price"
              >
                ${price}
              </Badge>
            </div>
          )}

          {showLike && !isAdminCard && (
            <div className="absolute top-4 right-4">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleLike}
                className="backdrop-blur-md bg-black/30 hover:bg-black/50 border-2 border-white/50"
                data-testid="button-like"
              >
                <Heart 
                  className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`}
                />
              </Button>
            </div>
          )}

          <div className="absolute bottom-4 right-4">
            <ShareButton
              title={title}
              description={subtitle}
              variant="ghost"
              size="icon"
              className="backdrop-blur-md bg-black/30 hover:bg-black/50 border-2 border-white/50 text-white"
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur-md bg-black/30">
            <h3 className="font-display font-bold text-xl text-white mb-1 line-clamp-2" data-testid="text-recommendation-title">
              {title}
            </h3>
            <p className="text-sm text-white/90 line-clamp-1" data-testid="text-recommendation-subtitle">
              {subtitle}
            </p>
            <div className="flex items-center justify-between mt-2">
              <div>
                {externalUrl && (
                  <button
                    onClick={handleExternalLink}
                    className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"
                    data-testid="button-external-link"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View source</span>
                  </button>
                )}
              </div>
              {showLike && (
                <div className="flex items-center gap-1 text-xs text-white/90" data-testid="text-like-count">
                  <Heart className="w-3 h-3" />
                  <span>{likeCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

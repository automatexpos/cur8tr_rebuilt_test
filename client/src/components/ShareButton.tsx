import { Share2, MessageCircle, Send, Facebook, Twitter, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function ShareButton({
  title,
  description,
  url,
  variant = "ghost",
  size = "icon",
  className = "",
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Use current URL if not provided (guard for SSR)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = description ? `${title} - ${description}` : title;

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        setOpen(false);
      } catch (error) {
        // User cancelled or error occurred
        console.log("Share cancelled or failed:", error);
      }
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  const handleSMS = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const smsUrl = `sms:?&body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.location.href = smsUrl;
    setOpen(false);
  };

  const handleFacebook = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    setOpen(false);
  };

  const handleTwitter = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    setOpen(false);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
  };

  // Prevent any clicks inside popover from bubbling to card
  const handlePopoverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // If Web Share API is available on mobile, use it directly (guard for SSR)
  if (typeof navigator !== 'undefined' && typeof navigator.share !== 'undefined' && 
      typeof window !== 'undefined' && window.innerWidth <= 768) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleNativeShare}
        className={className}
        data-testid="button-share"
        aria-label="Share recommendation"
      >
        <Share2 className="w-5 h-5" />
      </Button>
    );
  }

  // Desktop: show popover with sharing options
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={handleButtonClick}
          className={className}
          data-testid="button-share"
          aria-label="Share recommendation"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-3" 
        align="end" 
        data-testid="popover-share-menu"
        onClick={handlePopoverClick}
        onPointerDown={handlePopoverClick}
      >
        <div className="space-y-2">
          <h4 className="font-semibold text-sm mb-3">Share this recommendation</h4>
          
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleCopyLink}
            data-testid="button-copy-link"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Link copied!</span>
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                <span>Copy link</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleWhatsApp}
            data-testid="button-share-whatsapp"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleSMS}
            data-testid="button-share-sms"
          >
            <Send className="w-4 h-4" />
            <span>SMS</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleFacebook}
            data-testid="button-share-facebook"
          >
            <Facebook className="w-4 h-4" />
            <span>Facebook</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleTwitter}
            data-testid="button-share-twitter"
          >
            <Twitter className="w-4 h-4" />
            <span>Twitter</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

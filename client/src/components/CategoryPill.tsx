import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface CategoryPillProps {
  icon?: LucideIcon;
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}

export default function CategoryPill({ 
  icon: Icon, 
  label, 
  count, 
  active = false, 
  onClick 
}: CategoryPillProps) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className={`
        border-2 px-4 py-2 text-sm font-medium cursor-pointer
        ${active ? 'bg-primary text-primary-foreground' : 'hover-elevate'}
      `}
      onClick={onClick}
      data-testid={`pill-category-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        <span>{label}</span>
        {count !== undefined && (
          <span className="ml-1 opacity-70">({count})</span>
        )}
      </div>
    </Badge>
  );
}

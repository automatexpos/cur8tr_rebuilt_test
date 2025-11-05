import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  onClick?: () => void;
}

export default function StatCard({ icon: Icon, value, label, onClick }: StatCardProps) {
  return (
    <Card 
      className={`border-4 p-6 ${onClick ? 'cursor-pointer hover-elevate' : ''}`}
      onClick={onClick}
      data-testid={`card-stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex flex-col items-center text-center">
        <Icon className="w-8 h-8 mb-4 text-primary" />
        <div className="font-display font-bold text-4xl mb-2" data-testid="text-stat-value">
          {value}
        </div>
        <div className="text-sm uppercase tracking-wide text-muted-foreground" data-testid="text-stat-label">
          {label}
        </div>
      </div>
    </Card>
  );
}

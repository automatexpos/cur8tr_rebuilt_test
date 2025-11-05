interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export default function SectionHeader({ title, subtitle, badge }: SectionHeaderProps) {
  return (
    <div className="mb-12">
      {badge && (
        <div className="inline-block mb-4">
          <div className="inline-flex items-center border-2 border-foreground px-3 py-1 bg-accent text-accent-foreground font-bold text-xs uppercase tracking-wide">
            {badge}
          </div>
        </div>
      )}
      <h2 className="font-display font-bold text-3xl md:text-4xl mb-2" data-testid="text-section-title">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-muted-foreground" data-testid="text-section-subtitle">
          {subtitle}
        </p>
      )}
    </div>
  );
}

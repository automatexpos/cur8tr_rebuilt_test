import SectionHeader from '../SectionHeader';

export default function SectionHeaderExample() {
  return (
    <div className="space-y-8 p-6">
      <SectionHeader 
        title="Recent Recommendations"
        subtitle="Latest recommendations from the community"
      />
      <SectionHeader 
        title="Pro Tips"
        subtitle="Expert recommendations you can't miss"
        badge="Featured"
      />
    </div>
  );
}

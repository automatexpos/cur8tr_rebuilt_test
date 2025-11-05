import StatCard from '../StatCard';
import { Heart, Users, Star, BookmarkCheck } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
      <StatCard icon={BookmarkCheck} value={42} label="Recommendations" />
      <StatCard icon={Users} value={1203} label="Followers" onClick={() => console.log('Followers clicked')} />
      <StatCard icon={Users} value={358} label="Following" onClick={() => console.log('Following clicked')} />
      <StatCard icon={Heart} value={2847} label="Total Likes" />
    </div>
  );
}

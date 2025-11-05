import UserCard from '../UserCard';
import avatar1 from '@assets/generated_images/User_avatar_portrait_1_87776cb4.png';

export default function UserCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 max-w-4xl">
      <UserCard
        id="1"
        username="alex_curates"
        name="Alex Chen"
        avatar={avatar1}
        recommendationsCount={42}
        followersCount={1203}
        onViewProfile={() => console.log('View profile clicked')}
      />
      <UserCard
        id="2"
        username="sarah_finds"
        name="Sarah Martinez"
        recommendationsCount={28}
        followersCount={856}
        onViewProfile={() => console.log('View profile clicked')}
      />
    </div>
  );
}

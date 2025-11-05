import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UserCardProps {
  id?: string;
  username: string;
  name: string;
  avatar?: string;
  recommendationsCount: number;
  followersCount: number;
  onViewProfile?: () => void;
}

export default function UserCard({
  id,
  username,
  name,
  avatar,
  recommendationsCount,
  followersCount,
  onViewProfile
}: UserCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="border-4 p-6 hover-elevate" data-testid={`card-user-${id || username}`}>
      <div className="flex flex-col items-center">
        <Avatar className="w-20 h-20 border-4 border-foreground">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="text-lg font-bold">{initials}</AvatarFallback>
        </Avatar>
        
        <h3 className="font-display font-bold text-lg text-center mt-4" data-testid="text-user-name">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground" data-testid="text-user-username">
          @{username}
        </p>

        <div className="flex justify-center gap-4 mt-4 text-sm">
          <div className="text-center">
            <div className="font-bold" data-testid="text-user-recs">{recommendationsCount}</div>
            <div className="text-muted-foreground text-xs">Recs</div>
          </div>
          <div className="text-center">
            <div className="font-bold" data-testid="text-user-followers">{followersCount}</div>
            <div className="text-muted-foreground text-xs">Followers</div>
          </div>
        </div>

        <Button
          onClick={onViewProfile}
          className="w-full mt-4 border-2"
          variant="outline"
          data-testid="button-view-profile"
        >
          View Profile
        </Button>
      </div>
    </Card>
  );
}

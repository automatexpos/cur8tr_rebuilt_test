import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Reply } from "lucide-react";

interface CommentUser {
  id: string;
  username: string | null;
  profileImageUrl: string | null;
}

interface CommentData {
  id: string;
  text: string;
  createdAt: string | Date;
  user: CommentUser;
  replies?: CommentData[];
}

interface CommentProps {
  comment: CommentData;
  isRecommender: boolean;
  onReply?: (commentId: string) => void;
}

export default function Comment({ comment, isRecommender, onReply }: CommentProps) {
  return (
    <div className="space-y-4" data-testid={`comment-${comment.id}`}>
      <div className="flex gap-2 md:gap-4">
        <Avatar className="border-2 border-foreground w-10 h-10 flex-shrink-0">
          <AvatarImage src={comment.user.profileImageUrl || undefined} />
          <AvatarFallback>
            {comment.user.username?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="bg-card border-2 border-foreground rounded-md p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-medium text-sm break-all" data-testid="text-comment-username">
                @{comment.user.username || 'anonymous'}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm leading-relaxed break-words" data-testid="text-comment-text">
              {comment.text}
            </p>
          </div>
          
          {isRecommender && onReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(comment.id)}
              className="mt-2 text-xs"
              data-testid={`button-reply-${comment.id}`}
            >
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </Button>
          )}
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 ml-3 md:ml-6 space-y-4">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex gap-2 md:gap-3" data-testid={`reply-${reply.id}`}>
                  <Avatar className="border-2 border-foreground w-8 h-8 flex-shrink-0">
                    <AvatarImage src={reply.user.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {reply.user.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="bg-muted border-2 border-foreground rounded-md p-2 md:p-3">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-xs break-all" data-testid="text-reply-username">
                          @{reply.user.username || 'anonymous'}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed break-words" data-testid="text-reply-text">
                        {reply.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

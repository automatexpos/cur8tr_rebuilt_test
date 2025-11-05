import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Recommendation, Category } from "@shared/schema";

interface AdminCuratorRecsManagerProps {
  recommendations: Recommendation[];
  categories: Category[];
}

export function AdminCuratorRecsManager({ 
  recommendations, 
  categories 
}: AdminCuratorRecsManagerProps) {
  const { toast } = useToast();
  
  const { data: curatorRecIds = [], isLoading: idsLoading } = useQuery<string[]>({
    queryKey: ['/api/curator-recs/ids'],
  });

  const addCuratorRecMutation = useMutation({
    mutationFn: (recommendationId: string) => 
      apiRequest('POST', `/api/curator-recs/${recommendationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/curator-recs/ids'] });
      queryClient.invalidateQueries({ queryKey: ['/api/curator-recs'] });
      toast({
        title: "Success",
        description: "Added to CUR8tr Recommendations",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to CUR8tr Recommendations",
        variant: "destructive",
      });
    },
  });

  const removeCuratorRecMutation = useMutation({
    mutationFn: (recommendationId: string) => 
      apiRequest('DELETE', `/api/curator-recs/${recommendationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/curator-recs/ids'] });
      queryClient.invalidateQueries({ queryKey: ['/api/curator-recs'] });
      toast({
        title: "Success",
        description: "Removed from CUR8tr Recommendations",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from CUR8tr Recommendations",
        variant: "destructive",
      });
    },
  });

  const handleToggleCuratorRec = (recId: string, isCurator: boolean) => {
    if (isCurator) {
      removeCuratorRecMutation.mutate(recId);
    } else {
      if (curatorRecIds.length >= 8) {
        toast({
          title: "Limit Reached",
          description: "You can only have up to 8 CUR8tr Recommendations at a time.",
          variant: "destructive",
        });
        return;
      }
      addCuratorRecMutation.mutate(recId);
    }
  };

  if (idsLoading) {
    return <div className="text-center py-6 text-muted-foreground">Loading...</div>;
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No recommendations available. Create some recommendations first to feature them as CUR8tr Recommendations.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        {curatorRecIds.length} / 8 recommendations selected
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => {
          const isCuratorRec = curatorRecIds.includes(rec.id);
          return (
            <div
              key={rec.id}
              className={`p-4 border-2 rounded-lg hover-elevate transition-all ${
                isCuratorRec ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <div className="flex gap-4">
                {rec.imageUrl && (
                  <img
                    src={rec.imageUrl}
                    alt={rec.title}
                    className="w-20 h-20 object-cover rounded-md border-2"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold mb-1 truncate">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {rec.description}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {categories.find(c => c.id === rec.categoryId)?.name || 'General'}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant={isCuratorRec ? "default" : "outline"}
                  onClick={() => handleToggleCuratorRec(rec.id, isCuratorRec)}
                  disabled={addCuratorRecMutation.isPending || removeCuratorRecMutation.isPending}
                  data-testid={`button-toggle-curator-${rec.id}`}
                  className="flex-shrink-0"
                >
                  {isCuratorRec ? (
                    <>
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      Featured
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-1" />
                      Feature
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

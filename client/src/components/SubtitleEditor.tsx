import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";

export function SubtitleEditor() {
  const { toast } = useToast();
  const [subtitle, setSubtitle] = useState("");

  const { data: setting, isLoading } = useQuery<{ key: string; value: string | null }>({
    queryKey: ['/api/settings/curator_recommends_subtitle'],
  });

  useEffect(() => {
    if (setting) {
      setSubtitle(setting.value || "");
    }
  }, [setting]);

  const updateMutation = useMutation({
    mutationFn: async (value: string) => {
      return await apiRequest('POST', '/api/settings', {
        key: 'curator_recommends_subtitle',
        value,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/curator_recommends_subtitle'] });
      toast({
        title: "Subtitle updated",
        description: "The landing page subtitle has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subtitle",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(subtitle);
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Landing Page Settings
        </CardTitle>
        <CardDescription>
          Customize the subtitle for the "CUR8tr Recommends" section on the landing page
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="subtitle" className="text-sm font-medium">
              CUR8tr Recommends Subtitle
            </label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Handpicked favorites from our team"
              data-testid="input-curator-subtitle"
            />
            <p className="text-xs text-muted-foreground">
              This text appears below the "CUR8tr Recommends" title on the landing page
            </p>
          </div>
          <Button 
            type="submit" 
            disabled={updateMutation.isPending}
            data-testid="button-save-subtitle"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

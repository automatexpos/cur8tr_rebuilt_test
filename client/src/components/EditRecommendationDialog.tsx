import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertRecommendationSchema, type Category, type Recommendation, type InsertRecommendation } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";

interface EditRecommendationDialogProps {
  recommendation: Recommendation & { category?: Category | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditRecommendationDialog({ 
  recommendation, 
  open, 
  onOpenChange 
}: EditRecommendationDialogProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(recommendation.rating);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<InsertRecommendation>({
    resolver: zodResolver(insertRecommendationSchema.partial()),
    defaultValues: {
      title: recommendation.title,
      description: recommendation.description,
      imageUrl: recommendation.imageUrl || "",
      rating: recommendation.rating,
      proTip: recommendation.proTip || "",
      categoryId: recommendation.categoryId || undefined,
      location: recommendation.location || "",
      externalUrl: recommendation.externalUrl || "",
      isPrivate: recommendation.isPrivate || false,
    },
  });

  // Update rating state when recommendation changes
  useEffect(() => {
    setRating(recommendation.rating);
    form.reset({
      title: recommendation.title,
      description: recommendation.description,
      imageUrl: recommendation.imageUrl || "",
      rating: recommendation.rating,
      proTip: recommendation.proTip || "",
      categoryId: recommendation.categoryId || undefined,
      location: recommendation.location || "",
      externalUrl: recommendation.externalUrl || "",
      isPrivate: recommendation.isPrivate || false,
    });
  }, [recommendation, form]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<InsertRecommendation>) => 
      apiRequest('PATCH', `/api/recommendations/${recommendation.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations', recommendation.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity-feed'] });
      toast({
        title: "Success!",
        description: "Your recommendation has been updated.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update recommendation",
      });
    },
  });

  const onSubmit = (data: InsertRecommendation) => {
    updateMutation.mutate(data);
  };

  const renderStars = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => {
              setRating(star);
              form.setValue('rating', star);
            }}
            className="transition-transform hover:scale-110"
            data-testid={`star-${star}`}
          >
            <Star
              className={`w-8 h-8 ${
                star <= rating
                  ? 'fill-primary text-primary'
                  : 'fill-none text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-recommendation">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Edit Recommendation</DialogTitle>
          <DialogDescription>
            Update your recommendation details
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Title*</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Best Coffee in San Francisco" 
                      {...field}
                      data-testid="input-edit-title"
                      className="border-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Description*</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us what makes this special..."
                      className="resize-none border-2 min-h-[120px]"
                      {...field}
                      data-testid="input-edit-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel className="font-bold">Rating*</FormLabel>
              <div className="mt-2">
                {renderStars()}
              </div>
              <FormDescription>
                How would you rate this? (1-5 stars)
              </FormDescription>
            </FormItem>

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                    disabled={categoriesLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="border-2" data-testid="select-edit-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="proTip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Pro Tip</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any insider tips or tricks? (e.g., 'Ask for the secret menu item')"
                      className="resize-none border-2"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-edit-protip"
                    />
                  </FormControl>
                  <FormDescription>
                    Share a special tip that makes this recommendation even better
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., San Francisco, CA"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-edit-location"
                      className="border-2"
                    />
                  </FormControl>
                  <FormDescription>
                    Where can people find this?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="externalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Website/Link</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-edit-url"
                      className="border-2"
                    />
                  </FormControl>
                  <FormDescription>
                    Add a link to the website or social media
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-foreground p-4 bg-card">
                  <div className="space-y-0.5">
                    <FormLabel className="font-bold">Private Recommendation</FormLabel>
                    <FormDescription>
                      Only you can see private recommendations
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-edit-private"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                data-testid="button-submit-edit"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

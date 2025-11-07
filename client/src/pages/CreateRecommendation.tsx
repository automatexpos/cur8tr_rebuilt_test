import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Star, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { insertRecommendationSchema, createCategorySchema, type Category, type InsertRecommendation } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function CreateRecommendation() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [categoryMode, setCategoryMode] = useState<'existing' | 'new'>('existing');
  const [newCategoryName, setNewCategoryName] = useState('');

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<InsertRecommendation>({
    resolver: zodResolver(insertRecommendationSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      rating: 0,
      proTip: undefined,
      categoryId: undefined,
      location: undefined,
      externalUrl: undefined,
      isPrivate: false,
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => apiRequest('POST', '/api/categories', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertRecommendation) => apiRequest('POST', '/api/recommendations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity-feed'] });
      toast({
        title: "Success!",
        description: "Your recommendation has been created.",
      });
      setNewCategoryName(''); // Clear custom category name
      navigate('/explore');
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create recommendation",
      });
    },
  });

  const onSubmit = async (data: InsertRecommendation) => {
    try {
      let categoryId = data.categoryId;

      // If creating a new category, create it first
      if (categoryMode === 'new') {
        if (!newCategoryName.trim()) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Please enter a category name",
          });
          return;
        }

        const result = createCategorySchema.safeParse({ name: newCategoryName.trim() });
        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Category name must be between 1 and 100 characters",
          });
          return;
        }

        // Check if category already exists (case-insensitive)
        const normalizedName = newCategoryName.trim().toLowerCase();
        const existingCategory = categories.find(
          cat => cat.name.toLowerCase() === normalizedName
        );
        
        if (existingCategory) {
          toast({
            variant: "destructive",
            title: "Category already exists",
            description: `The category "${existingCategory.name}" already exists. Please select it from the existing categories or choose a different name.`,
          });
          return;
        }

        const response = await createCategoryMutation.mutateAsync(newCategoryName.trim());
        const newCategory = await (response as Response).json() as Category;
        categoryId = newCategory.id;
      }

      // Create the recommendation with the category ID
      createMutation.mutate({ ...data, categoryId });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create category",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/explore')}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Button>
          <h1 className="text-4xl font-bold font-display mb-2">Create Recommendation</h1>
          <p className="text-lg text-muted-foreground">
            Share your favorite find with the community
          </p>
        </div>

        <div className="border-4 border-foreground p-8 rounded-md bg-card">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold">Title*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Best Coffee in San Francisco" 
                        {...field}
                        data-testid="input-title"
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
                    <FormLabel className="text-lg font-bold">Description*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us what makes this recommendation special..."
                        {...field}
                        data-testid="input-description"
                        className="border-2 min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold">Category*</FormLabel>
                    
                    <RadioGroup
                      value={categoryMode}
                      onValueChange={(value: 'existing' | 'new') => {
                        setCategoryMode(value);
                        if (value === 'new') {
                          field.onChange(undefined);
                        }
                      }}
                      className="flex gap-4 mb-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="existing" id="existing" data-testid="radio-existing-category" />
                        <Label htmlFor="existing" className="cursor-pointer font-normal">
                          Select existing
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new" id="new" data-testid="radio-new-category" />
                        <Label htmlFor="new" className="cursor-pointer font-normal">
                          Create new
                        </Label>
                      </div>
                    </RadioGroup>

                    {categoryMode === 'existing' ? (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || undefined}
                        disabled={categoriesLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="border-2" data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="Enter category name (e.g., Books, Coffee, Tech)"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="border-2"
                        data-testid="input-new-category"
                        maxLength={100}
                      />
                    )}
                    
                    <FormDescription className="text-sm text-muted-foreground">
                      {categoryMode === 'new' 
                        ? "Your custom category will be saved for future use" 
                        : "Choose from your categories and pre-built options"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold">Rating*</FormLabel>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            setRating(star);
                            field.onChange(star);
                          }}
                          className="p-1"
                          data-testid={`button-rating-${star}`}
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= (rating || field.value)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <FormDescription>
                      Rate this recommendation from 1 to 5 stars
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold">Image*</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <ImageUploader
                          onImageSelect={(base64) => {
                            field.onChange(base64);
                          }}
                          currentImage={field.value}
                          onRemove={() => {
                            field.onChange('');
                          }}
                          maxSizeMB={5}
                          buttonText="Choose Image"
                          variant="outline"
                        />
                        
                        {field.value && (
                          <div className="border-4 border-foreground rounded-md p-6 bg-card space-y-4">
                            <div className="text-sm font-medium mb-3">Image Preview</div>
                            
                            {/* Preview showing 3:4 aspect ratio as it will appear on cards */}
                            <div className="max-w-xs mx-auto">
                              <div className="border-4 border-foreground overflow-hidden">
                                <div className="relative aspect-[3/4]">
                                  <img 
                                    src={field.value}
                                    alt="Recommendation preview" 
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-center text-sm text-muted-foreground">
                              This is how your image will appear on recommendation cards. Images are displayed in a 3:4 portrait aspect ratio.
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload an image for your recommendation (max 5MB)
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
                    <FormLabel className="text-lg font-bold">Location</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., San Francisco, CA" 
                        {...field}
                        value={field.value || ""}
                        data-testid="input-location"
                        className="border-2"
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Add a location for this recommendation
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
                    <FormLabel className="text-lg font-bold">External Link</FormLabel>
                    <FormControl>
                      <Input 
                        type="url"
                        placeholder="https://example.com" 
                        {...field}
                        value={field.value || ""}
                        data-testid="input-external-url"
                        className="border-2"
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Link to a website or resource
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="proTip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold">Pro Tip</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Make sure to arrive early for the best selection" 
                        {...field}
                        value={field.value || ""}
                        data-testid="input-pro-tip"
                        className="border-2"
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Share an insider tip or helpful advice for others
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border-4 border-foreground p-6 bg-card">
                    <div className="space-y-0.5">
                      <FormLabel className="text-lg font-bold">Private Recommendation</FormLabel>
                      <FormDescription>
                        Only you can see private recommendations
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-private"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="border-4 font-bold flex-1"
                  data-testid="button-create-submit"
                >
                  {createMutation.isPending ? "Creating..." : "Create Recommendation"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/explore')}
                  className="border-2"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

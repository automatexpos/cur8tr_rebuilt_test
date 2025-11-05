import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Upload, Eye, EyeOff, Pencil, Trash2, ExternalLink } from "lucide-react";
import { logout } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { insertAdminRecommendSchema, type AdminRecommend, type InsertAdminRecommend, type Section } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import Navigation from "@/components/Navigation";
import { useLocation } from "wouter";
import { SubtitleEditor } from "@/components/SubtitleEditor";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
  };

  const { data: user } = useQuery<{ isAdmin: boolean }>({
    queryKey: ['/api/auth/user'],
  });

  const { data: adminRecommends = [], isLoading } = useQuery<AdminRecommend[]>({
    queryKey: ['/api/admin-recommends'],
  });

  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: ['/api/sections'],
  });

  const form = useForm<InsertAdminRecommend>({
    resolver: zodResolver(insertAdminRecommendSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      imageUrl: "",
      externalUrl: "",
      price: "",
      isVisible: true,
      sectionId: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertAdminRecommend) => {
      const response = await apiRequest('POST', '/api/admin-recommends', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin-recommends'] });
      toast({
        title: "Success",
        description: "CUR8tr Recommend created successfully!",
      });
      form.reset();
      setUploadedImageUrl(null);
      setEditingId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create CUR8tr Recommend",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertAdminRecommend> }) => {
      const response = await apiRequest('PATCH', `/api/admin-recommends/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin-recommends'] });
      toast({
        title: "Success",
        description: "CUR8tr Recommend updated successfully!",
      });
      form.reset();
      setUploadedImageUrl(null);
      setEditingId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update CUR8tr Recommend",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin-recommends/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin-recommends'] });
      toast({
        title: "Success",
        description: "CUR8tr Recommend deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete CUR8tr Recommend",
        variant: "destructive",
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('POST', `/api/admin-recommends/${id}/toggle-visibility`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin-recommends'] });
      toast({
        title: "Success",
        description: "Visibility toggled successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to toggle visibility",
        variant: "destructive",
      });
    },
  });

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      setIsUploading(true);
      const uploadedUrl = result.successful[0].uploadURL;
      try {
        const response = await apiRequest('PUT', '/api/recommendation-images', {
          imageURL: uploadedUrl,
        });
        const data: any = await response.json();
        setUploadedImageUrl(data.objectPath);
        form.setValue("imageUrl", data.objectPath);
        toast({
          title: "Success",
          description: "Image uploaded successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process uploaded image",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const onSubmit = (data: InsertAdminRecommend) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (recommend: AdminRecommend) => {
    setEditingId(recommend.id);
    setUploadedImageUrl(recommend.imageUrl);
    form.reset({
      title: recommend.title,
      subtitle: recommend.subtitle || "",
      imageUrl: recommend.imageUrl,
      externalUrl: recommend.externalUrl,
      price: recommend.price || "",
      isVisible: recommend.isVisible,
      sectionId: recommend.sectionId || null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset();
    setUploadedImageUrl(null);
  };

  // Check if user is admin
  if (user && !user.isAdmin) {
    return (
      <>
        <Navigation 
          isLoggedIn={true}
          onLogout={handleLogout}
          onCreateRec={() => navigate("/create")}
          onProfile={() => navigate("/profile/" + user)}
        />
        <div className="min-h-screen bg-background p-4 md:p-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don't have permission to access the admin dashboard.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation 
        isLoggedIn={true}
        onLogout={handleLogout}
        onCreateRec={() => navigate("/create")}
        onProfile={() => navigate("/dashboard")}
      />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="border-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="font-display font-bold text-3xl md:text-5xl" data-testid="text-admin-title">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">Manage CUR8tr Recommends</p>
            </div>
          </div>

          <SubtitleEditor />

          <Card>
            <CardHeader>
              <CardTitle data-testid="text-form-title">
                {editingId ? "Edit" : "Create"} CUR8tr Recommend
              </CardTitle>
              <CardDescription>
                {editingId ? "Update the CUR8tr Recommend details" : "Add a new featured recommendation card that opens in a new tab"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., The Best Coffee Shop" 
                            {...field} 
                            data-testid="input-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitle (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Award-winning artisan roasters" 
                            {...field} 
                            value={field.value || ""}
                            data-testid="input-subtitle"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {uploadedImageUrl ? (
                              <div className="border-4 border-foreground rounded-md p-6 bg-card space-y-4">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-medium">Image Preview</span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setUploadedImageUrl(null);
                                      form.setValue("imageUrl", "");
                                    }}
                                    data-testid="button-remove-image"
                                  >
                                    Remove
                                  </Button>
                                </div>
                                
                                {/* Preview showing 9:16 aspect ratio as it will appear on landing page */}
                                <div className="max-w-xs mx-auto">
                                  <div className="border-4 border-foreground overflow-hidden">
                                    <div className="relative aspect-[9/16]">
                                      <img
                                        src={uploadedImageUrl}
                                        alt="CUR8tr Recommends preview"
                                        className="w-full h-full object-cover"
                                        data-testid="img-preview"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-center text-sm text-muted-foreground">
                                  This is how your card will appear on the landing page. Images are displayed in a 9:16 portrait aspect ratio.
                                </div>
                              </div>
                            ) : (
                              <ObjectUploader
                                maxNumberOfFiles={1}
                                maxFileSize={10485760}
                                onGetUploadParameters={async () => {
                                  const response = await apiRequest('POST', '/api/objects/upload', {});
                                  const data: any = await response.json();
                                  return {
                                    method: 'PUT' as const,
                                    url: data.uploadURL,
                                  };
                                }}
                                onComplete={handleUploadComplete}
                              >
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="border-2"
                                  data-testid="button-open-uploader"
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload Image
                                </Button>
                              </ObjectUploader>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="externalUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>External URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com" 
                            {...field} 
                            data-testid="input-external-url"
                          />
                        </FormControl>
                        <FormDescription>
                          The URL this card will link to when clicked
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (Optional)</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">$</span>
                            <Input 
                              placeholder="25" 
                              {...field} 
                              value={field.value || ""}
                              data-testid="input-price"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Enter just the number (e.g., "25" for $25)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sectionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section (Optional)</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value === "none" ? null : value)} 
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-section">
                              <SelectValue placeholder="Select a section" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none" data-testid="select-section-none">None</SelectItem>
                            {sections.map((section) => (
                              <SelectItem 
                                key={section.id} 
                                value={section.id}
                                data-testid={`select-section-${section.id}`}
                              >
                                {section.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose a section to also display this recommend on the CUR8tr Recs page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isVisible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-md border-2 border-foreground p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Visible on Homepage</FormLabel>
                          <FormDescription>
                            Show this recommend on the landing page
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Button
                            type="button"
                            variant={field.value ? "default" : "outline"}
                            onClick={() => field.onChange(!field.value)}
                            className="border-2"
                            data-testid="button-toggle-visibility-form"
                          >
                            {field.value ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                            {field.value ? "Visible" : "Hidden"}
                          </Button>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={isUploading || createMutation.isPending || updateMutation.isPending}
                      className="border-4 font-bold"
                      data-testid="button-submit"
                    >
                      {editingId ? "Update" : "Create"} CUR8tr Recommend
                    </Button>
                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="border-2"
                        data-testid="button-cancel-edit"
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle data-testid="text-list-title">Existing CUR8tr Recommends</CardTitle>
              <CardDescription>
                {adminRecommends.length} recommend{adminRecommends.length !== 1 ? 's' : ''} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground" data-testid="text-loading">Loading...</p>
              ) : adminRecommends.length === 0 ? (
                <p className="text-muted-foreground" data-testid="text-empty">No CUR8tr Recommends yet. Create one above!</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {adminRecommends.map((recommend) => (
                    <Card key={recommend.id} className="overflow-hidden" data-testid={`card-recommend-${recommend.id}`}>
                      <div className="relative h-48">
                        <img
                          src={recommend.imageUrl}
                          alt={recommend.title}
                          className="w-full h-full object-cover"
                          data-testid={`img-recommend-${recommend.id}`}
                        />
                        {recommend.price && (
                          <div className="absolute top-2 right-2 bg-background border-2 border-foreground px-3 py-1 font-bold rounded-md" data-testid={`text-price-${recommend.id}`}>
                            ${recommend.price}
                          </div>
                        )}
                        <div className={`absolute top-2 left-2 px-3 py-1 font-bold rounded-md border-2 ${recommend.isVisible ? 'bg-green-500 border-green-700' : 'bg-gray-500 border-gray-700'}`} data-testid={`badge-visibility-${recommend.id}`}>
                          {recommend.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </div>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-bold text-lg" data-testid={`text-title-${recommend.id}`}>{recommend.title}</h3>
                          {recommend.subtitle && (
                            <p className="text-sm text-muted-foreground" data-testid={`text-subtitle-${recommend.id}`}>{recommend.subtitle}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ExternalLink className="w-4 h-4" />
                          <a 
                            href={recommend.externalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline truncate"
                            data-testid={`link-external-${recommend.id}`}
                          >
                            {recommend.externalUrl}
                          </a>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(recommend)}
                            className="border-2"
                            data-testid={`button-edit-${recommend.id}`}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleVisibilityMutation.mutate(recommend.id)}
                            className="border-2"
                            data-testid={`button-toggle-${recommend.id}`}
                          >
                            {recommend.isVisible ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                            {recommend.isVisible ? "Hide" : "Show"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this CUR8tr Recommend?')) {
                                deleteMutation.mutate(recommend.id);
                              }
                            }}
                            className="border-2"
                            data-testid={`button-delete-${recommend.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

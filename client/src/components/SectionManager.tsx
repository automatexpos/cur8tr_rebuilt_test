import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Section, InsertSection, Recommendation, SectionWithRecommendations } from "@shared/schema";
import { insertSectionSchema } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface SectionManagerProps {
  recommendations: Recommendation[];
}

export function SectionManager({ recommendations }: SectionManagerProps) {
  const { toast } = useToast();
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [managingRecsForSection, setManagingRecsForSection] = useState<Section | null>(null);

  const { data: sectionsWithRecs = [], isLoading } = useQuery<SectionWithRecommendations[]>({
    queryKey: ['/api/sections/with-recommendations'],
  });

  const createForm = useForm<InsertSection>({
    resolver: zodResolver(insertSectionSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      displayOrder: 0,
    },
  });

  const editForm = useForm<InsertSection>({
    resolver: zodResolver(insertSectionSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      displayOrder: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertSection) => {
      return await apiRequest('POST', '/api/sections', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sections/with-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sections'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Section created",
        description: "The section has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create section",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertSection> }) => {
      return await apiRequest('PATCH', `/api/sections/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sections/with-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sections'] });
      setIsEditDialogOpen(false);
      setEditingSection(null);
      editForm.reset();
      toast({
        title: "Section updated",
        description: "The section has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update section",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/sections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sections/with-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sections'] });
      toast({
        title: "Section deleted",
        description: "The section has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete section",
        variant: "destructive",
      });
    },
  });

  const addRecToSectionMutation = useMutation({
    mutationFn: async ({ sectionId, recommendationId }: { sectionId: string; recommendationId: string }) => {
      return await apiRequest('POST', `/api/sections/${sectionId}/recommendations/${recommendationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sections/with-recommendations'] });
      toast({
        title: "Recommendation added",
        description: "The recommendation has been added to the section.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add recommendation",
        variant: "destructive",
      });
    },
  });

  const removeRecFromSectionMutation = useMutation({
    mutationFn: async ({ sectionId, recommendationId }: { sectionId: string; recommendationId: string }) => {
      return await apiRequest('DELETE', `/api/sections/${sectionId}/recommendations/${recommendationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sections/with-recommendations'] });
      toast({
        title: "Recommendation removed",
        description: "The recommendation has been removed from the section.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove recommendation",
        variant: "destructive",
      });
    },
  });

  const handleCreateSection = (data: InsertSection) => {
    createMutation.mutate(data);
  };

  const handleEditSection = (data: InsertSection) => {
    if (editingSection) {
      updateMutation.mutate({ id: editingSection.id, data });
    }
  };

  const handleDeleteSection = (id: string) => {
    if (confirm("Are you sure you want to delete this section?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditClick = (section: Section) => {
    setEditingSection(section);
    editForm.reset({
      title: section.title,
      subtitle: section.subtitle || "",
      displayOrder: section.displayOrder,
    });
    setIsEditDialogOpen(true);
  };

  const handleAddRecToSection = (sectionId: string, recommendationId: string) => {
    addRecToSectionMutation.mutate({ sectionId, recommendationId });
  };

  const handleRemoveRecFromSection = (sectionId: string, recommendationId: string) => {
    removeRecFromSectionMutation.mutate({ sectionId, recommendationId });
  };

  if (isLoading) {
    return <div className="text-center py-6 text-muted-foreground">Loading sections...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-display font-bold text-lg">Sections</h3>
          <p className="text-sm text-muted-foreground">Organize recommendations into themed sections</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-section">
              <Plus className="w-4 h-4 mr-2" />
              Create Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Section</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateSection)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Section title" data-testid="input-section-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ""} 
                          placeholder="Section description" 
                          data-testid="input-section-subtitle"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-section-order"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} data-testid="button-cancel-create">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create">
                    {createMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {sectionsWithRecs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No sections yet. Create one to get started.
            </CardContent>
          </Card>
        ) : (
          sectionsWithRecs.map((section) => (
            <Card key={section.id} className="overflow-hidden" data-testid={`card-section-${section.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-display font-bold text-base" data-testid={`text-section-title-${section.id}`}>
                      {section.title}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {section.recommendations.length}/8
                    </Badge>
                  </div>
                  {section.subtitle && (
                    <p className="text-sm text-muted-foreground" data-testid={`text-section-subtitle-${section.id}`}>
                      {section.subtitle}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setManagingRecsForSection(section)}
                    data-testid={`button-manage-recs-${section.id}`}
                  >
                    Manage Recs
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEditClick(section)}
                    data-testid={`button-edit-section-${section.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDeleteSection(section.id)}
                    data-testid={`button-delete-section-${section.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              {section.recommendations.length > 0 && (
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {section.recommendations.map((rec) => (
                      <Badge 
                        key={rec.id} 
                        variant="outline" 
                        className="gap-1"
                        data-testid={`badge-rec-${rec.id}`}
                      >
                        {rec.title}
                        <button
                          onClick={() => handleRemoveRecFromSection(section.id, rec.id)}
                          className="ml-1 hover:text-destructive"
                          data-testid={`button-remove-rec-${rec.id}`}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Edit Section Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSection)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Section title" data-testid="input-edit-section-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""} 
                        placeholder="Section description" 
                        data-testid="input-edit-section-subtitle"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-edit-section-order"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} data-testid="button-cancel-edit">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit">
                  {updateMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Manage Recommendations Dialog */}
      {managingRecsForSection && (
        <Dialog open={!!managingRecsForSection} onOpenChange={() => setManagingRecsForSection(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Recommendations for "{managingRecsForSection.title}"</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Select up to 8 recommendations for this section
              </p>
            </DialogHeader>
            <div className="space-y-2 mt-4">
              {recommendations.map((rec) => {
                const section = sectionsWithRecs.find(s => s.id === managingRecsForSection.id);
                const isInSection = section?.recommendations.some(r => r.id === rec.id);
                const canAdd = (section?.recommendations.length || 0) < 8;

                return (
                  <div 
                    key={rec.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                    data-testid={`rec-option-${rec.id}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{rec.title}</p>
                      <p className="text-xs text-muted-foreground">by {rec.userId}</p>
                    </div>
                    {isInSection ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveRecFromSection(managingRecsForSection.id, rec.id)}
                        disabled={removeRecFromSectionMutation.isPending}
                        data-testid={`button-remove-from-section-${rec.id}`}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleAddRecToSection(managingRecsForSection.id, rec.id)}
                        disabled={!canAdd || addRecToSectionMutation.isPending}
                        data-testid={`button-add-to-section-${rec.id}`}
                      >
                        {canAdd ? "Add" : "Limit Reached"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

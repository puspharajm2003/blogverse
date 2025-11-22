import { useState, useEffect } from 'react';
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { 
  Globe, 
  Eye, 
  MoreHorizontal, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  AlertCircle,
  Upload,
  X
} from "lucide-react";
import { api } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Blog {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  status: string;
  createdAt: string;
}

export default function MyBlogs() {
  const [, setLocation] = useLocation();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);
  
  // Edit form states
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageLocal, setEditImageLocal] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageTab, setImageTab] = useState<"url" | "upload">("url");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setIsLoading(true);
      const data = await api.getBlogs();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (blog: Blog) => {
    setEditingBlogId(blog.id);
    setEditTitle(blog.title);
    setEditDescription(blog.description || "");
    setEditImageUrl(blog.image || "");
    setImagePreview(blog.image || "");
    setEditImageLocal(null);
    setImageTab("url");
  };

  const handleLocalImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageLocal(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setEditImageUrl(url);
    setImagePreview(url);
    setEditImageLocal(null);
  };

  const handleSaveBlog = async (blogId: string) => {
    if (!editTitle.trim()) {
      toast.error("Blog title cannot be empty");
      return;
    }

    try {
      setIsSaving(true);
      
      // For now, use URL if available, otherwise use preview
      const imageToUse = editImageUrl || imagePreview;
      
      await api.updateBlog(blogId, {
        title: editTitle,
        description: editDescription,
        image: imageToUse,
      });

      setBlogs(blogs.map(b => 
        b.id === blogId 
          ? {
              ...b,
              title: editTitle,
              description: editDescription,
              image: imageToUse,
            }
          : b
      ));

      setEditingBlogId(null);
      toast.success("Blog updated successfully");
    } catch (error) {
      console.error("Failed to update blog:", error);
      toast.error("Failed to update blog");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    try {
      await api.deleteBlog(blogId);
      setBlogs(blogs.filter(b => b.id !== blogId));
      setDeletingBlogId(null);
      toast.success("Blog deleted successfully");
    } catch (error) {
      console.error("Failed to delete blog:", error);
      toast.error("Failed to delete blog");
    }
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif font-bold tracking-tight">My Blogs</h1>
              <p className="text-muted-foreground mt-2">Manage your publications and sites. ({blogs.length} blog{blogs.length !== 1 ? 's' : ''})</p>
            </div>
            <Link href="/dashboard">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create New Blog
              </Button>
            </Link>
          </div>

          {blogs.length === 0 ? (
            <Card className="p-12 text-center">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-serif text-xl font-bold mb-2">No blogs yet</h3>
              <p className="text-muted-foreground mb-6">Create your first blog to get started.</p>
              <Link href="/dashboard">
                <Button>Create First Blog</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Card key={blog.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                  {/* Blog Image */}
                  <div className="aspect-video relative bg-gradient-to-br from-muted/30 to-muted/10">
                    {blog.image ? (
                      <img 
                        src={blog.image} 
                        alt={blog.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/20">
                        <Globe className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge 
                        variant={blog.status === "active" ? "default" : "secondary"}
                        className="backdrop-blur-md bg-background/80 text-foreground"
                      >
                        {blog.status === "active" ? "Active" : "Draft"}
                      </Badge>
                    </div>
                  </div>

                  {/* Blog Info */}
                  <CardHeader>
                    <CardTitle className="font-serif text-xl line-clamp-2">{blog.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-2">
                      <Globe className="h-3 w-3" /> {blog.slug}
                    </CardDescription>
                    {blog.description && (
                      <CardDescription className="line-clamp-2 mt-2">
                        {blog.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  {/* Actions */}
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Link href={`/public-blog?blogId=${blog.id}`} className="flex-1">
                        <Button variant="outline" className="w-full gap-2">
                          <Eye className="h-4 w-4" /> Preview
                        </Button>
                      </Link>
                      
                      <Dialog open={editingBlogId === blog.id} onOpenChange={(open) => !open && setEditingBlogId(null)}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => openEditDialog(blog)}
                            data-testid={`button-edit-blog-${blog.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Blog</DialogTitle>
                            <DialogDescription>
                              Update your blog details and appearance
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6 py-4">
                            {/* Blog Title */}
                            <div className="space-y-2">
                              <Label htmlFor="blog-title">Blog Title</Label>
                              <Input
                                id="blog-title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Enter blog title"
                              />
                            </div>

                            {/* Blog Description */}
                            <div className="space-y-2">
                              <Label htmlFor="blog-desc">Description</Label>
                              <Textarea
                                id="blog-desc"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Enter blog description"
                                rows={3}
                              />
                            </div>

                            {/* Blog Banner Image */}
                            <div className="space-y-3">
                              <Label>Blog Banner Image</Label>
                              
                              {/* Image Preview */}
                              {imagePreview && (
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/20 border border-border">
                                  <img 
                                    src={imagePreview} 
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={() => {
                                      setImagePreview("");
                                      toast.error("Invalid image URL");
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                      setImagePreview("");
                                      setEditImageUrl("");
                                      setEditImageLocal(null);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}

                              {/* Upload Tabs */}
                              <Tabs value={imageTab} onValueChange={(v: any) => setImageTab(v)}>
                                <TabsList className="w-full">
                                  <TabsTrigger value="url" className="flex-1">From URL</TabsTrigger>
                                  <TabsTrigger value="upload" className="flex-1">Upload</TabsTrigger>
                                </TabsList>

                                <TabsContent value="url" className="space-y-3">
                                  <Input
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={editImageUrl}
                                    onChange={(e) => handleUrlChange(e.target.value)}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Enter a valid image URL (HTTPS recommended)
                                  </p>
                                </TabsContent>

                                <TabsContent value="upload" className="space-y-3">
                                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/30 transition-colors cursor-pointer">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleLocalImageSelect}
                                      className="hidden"
                                      id="image-upload"
                                    />
                                    <Label 
                                      htmlFor="image-upload"
                                      className="cursor-pointer flex flex-col items-center gap-2"
                                    >
                                      <Upload className="h-6 w-6 text-muted-foreground" />
                                      <span className="font-medium">Click to upload or drag and drop</span>
                                      <span className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</span>
                                    </Label>
                                  </div>
                                  {editImageLocal && (
                                    <p className="text-sm text-green-600">
                                      ✓ {editImageLocal.name}
                                    </p>
                                  )}
                                </TabsContent>
                              </Tabs>
                            </div>

                            <Separator />

                            {/* Action Buttons */}
                            <div className="flex gap-2 justify-end">
                              <Button 
                                variant="outline"
                                onClick={() => setEditingBlogId(null)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => handleSaveBlog(blog.id)}
                                disabled={isSaving}
                                className="gap-2"
                              >
                                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setLocation(`/publish?blogId=${blog.id}`)}>
                            Publish Articles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setLocation(`/performance?blogId=${blog.id}`)}>
                            Performance
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeletingBlogId(blog.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Blog Confirmation */}
      <AlertDialog open={!!deletingBlogId} onOpenChange={(open) => !open && setDeletingBlogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Blog?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this blog and all its articles. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingBlogId && handleDeleteBlog(deletingBlogId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Blog
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarLayout>
  );
}

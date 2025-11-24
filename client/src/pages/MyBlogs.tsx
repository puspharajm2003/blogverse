import { useState, useEffect } from 'react';
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  RefreshCw,
  ChevronDown,
  Zap,
  Send,
  Upload,
  X,
  FileText,
  Copy,
  Check,
  Calendar,
  Clock,
  Share2,
  AlertCircle,
  Sparkles,
  Pencil,
  Flame,
  BookOpen
} from "lucide-react";
import { api } from "@/lib/api";
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

interface Article {
  id: string;
  blogId: string;
  title: string;
  content?: string;
  excerpt?: string;
  status: string;
  createdAt: string;
  publishedAt?: string;
}

export default function MyBlogs() {
  const [, setLocation] = useLocation();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogArticles, setBlogArticles] = useState<{ [key: string]: Article[] }>({});
  const [expandedBlogId, setExpandedBlogId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);
  const [loadingBlogId, setLoadingBlogId] = useState<string | null>(null);
  
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageLocal, setEditImageLocal] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageTab, setImageTab] = useState<"url" | "upload">("url");
  const [isSaving, setIsSaving] = useState(false);

  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editArticleTitle, setEditArticleTitle] = useState("");
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split("T")[0]);
  const [publishTime, setPublishTime] = useState("12:00");
  const [publishedLink, setPublishedLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Publish states
  const [currentPublishingArticleId, setCurrentPublishingArticleId] = useState<string | null>(null);
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  
  // Create Blog States
  const [isCreateBlogOpen, setIsCreateBlogOpen] = useState(false);
  const [createBlogTitle, setCreateBlogTitle] = useState("");
  const [createBlogDescription, setCreateBlogDescription] = useState("");
  const [createBlogImageUrl, setCreateBlogImageUrl] = useState("");
  const [createBlogImageLocal, setCreateBlogImageLocal] = useState<File | null>(null);
  const [createBlogImagePreview, setCreateBlogImagePreview] = useState("");
  const [createBlogImageTab, setCreateBlogImageTab] = useState<"url" | "upload">("url");
  const [isCreatingBlog, setIsCreatingBlog] = useState(false);

  useEffect(() => {
    loadBlogs();
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadBlogs();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadBlogs = async () => {
    try {
      setIsRefreshing(true);
      const data = await api.getBlogs();
      const blogList = Array.isArray(data) ? data : [];
      setBlogs(blogList);
    } catch (error) {
      console.error("Failed to load blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadBlogArticles = async (blogId: string) => {
    if (blogArticles[blogId]) return;
    
    try {
      setLoadingBlogId(blogId);
      const data = await api.getArticlesByBlogAdmin(blogId);
      const activeArticles = (data || []).filter((a: any) => a.status !== "deleted");
      setBlogArticles(prev => ({
        ...prev,
        [blogId]: activeArticles
      }));
    } catch (error) {
      console.error("Failed to load articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setLoadingBlogId(null);
    }
  };

  const toggleBlogExpanded = (blogId: string) => {
    if (expandedBlogId === blogId) {
      setExpandedBlogId(null);
    } else {
      setExpandedBlogId(blogId);
      loadBlogArticles(blogId);
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
      const result = await api.deleteBlog(blogId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setBlogs(blogs.filter(b => b.id !== blogId));
      setDeletingBlogId(null);
      toast.success("Blog deleted successfully");
    } catch (error) {
      console.error("Failed to delete blog:", error);
      toast.error("Failed to delete blog");
    }
  };

  const handlePublishArticle = async (articleId: string, publishNow: boolean = false) => {
    try {
      setPublishingId(articleId);
      
      // Get the article to validate before publishing
      const article = expandedBlogId ? (blogArticles[expandedBlogId] || []).find(a => a.id === articleId) : null;
      if (!article) {
        toast.error("Article not found");
        setPublishingId(null);
        return;
      }
      
      // Validate article has content
      if (!article.title || !article.title.trim()) {
        toast.error("Cannot publish: Article needs a title");
        setPublishingId(null);
        return;
      }
      
      if (!article.content || !article.content.trim()) {
        toast.error("Cannot publish: Article needs content");
        setPublishingId(null);
        return;
      }
      
      let publishDateTime: Date;
      if (publishNow) {
        // Use current date and time
        publishDateTime = new Date();
      } else {
        // Use selected date and time
        publishDateTime = new Date(`${publishDate}T${publishTime}`);
        
        // Validate scheduled time is in the future
        if (publishDateTime <= new Date()) {
          toast.error("Cannot schedule: Please select a future date and time");
          setPublishingId(null);
          return;
        }
      }
      
      const updateResult = await api.updateArticle(articleId, {
        status: "published",
        publishedAt: publishDateTime.toISOString(),
      });
      
      if (updateResult && !updateResult.error) {
        const shareLink = `${window.location.origin}/public-blog?blogId=${article.blogId}&articleId=${articleId}`;
        setPublishedLink(shareLink);
        
        if (publishNow) {
          toast.success("✨ Article published successfully! Your article is now live on your blog.", {
            description: "Share it with your audience using the link below.",
          });
        } else {
          const scheduleDate = new Date(publishDateTime);
          toast.success(`📅 Article scheduled successfully! Publishing on ${scheduleDate.toLocaleDateString()} at ${scheduleDate.toLocaleTimeString()}`, {
            description: "The article will be automatically published at the scheduled time.",
          });
        }
        
        // Remove from drafts list
        if (expandedBlogId) {
          setBlogArticles(prev => ({
            ...prev,
            [expandedBlogId]: prev[expandedBlogId].filter(a => a.id !== articleId)
          }));
        }
      } else {
        const errorMessage = updateResult?.error || updateResult?.message || "Failed to publish article. Please try again.";
        toast.error(`❌ Publishing failed: ${errorMessage}`);
      }
      
      setPublishingId(null);
    } catch (error) {
      console.error("Failed to publish article:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(`❌ Error: ${errorMessage}`);
      setPublishingId(null);
    }
  };

  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().slice(0, 5);
    return { dateStr, timeStr };
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      const article = expandedBlogId ? blogArticles[expandedBlogId]?.find(a => a.id === articleId) : null;
      if (!article) return;

      await api.updateArticle(articleId, { status: "deleted" });

      const deletedArticles = JSON.parse(localStorage.getItem("deleted_articles") || "[]");
      deletedArticles.push({
        id: article.id,
        blogId: article.blogId,
        title: article.title,
        excerpt: article.excerpt,
        deletedAt: new Date().toISOString(),
      });
      localStorage.setItem("deleted_articles", JSON.stringify(deletedArticles));

      if (expandedBlogId) {
        setBlogArticles(prev => ({
          ...prev,
          [expandedBlogId]: prev[expandedBlogId].filter(a => a.id !== articleId)
        }));
      }
      setDeletingArticleId(null);
      toast.success("Article moved to trash");
    } catch (error) {
      console.error("Failed to delete article:", error);
      toast.error("Failed to delete article");
    }
  };

  const handleCreateBlogImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCreateBlogImageLocal(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCreateBlogImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBlogImageUrl = (url: string) => {
    setCreateBlogImageUrl(url);
    setCreateBlogImagePreview(url);
    setCreateBlogImageLocal(null);
  };

  const handleCreateBlog = async () => {
    if (!createBlogTitle.trim()) {
      toast.error("Blog title cannot be empty");
      return;
    }

    try {
      setIsCreatingBlog(true);
      const imageToUse = createBlogImageUrl || createBlogImagePreview;

      const newBlog = await api.createBlog({
        title: createBlogTitle,
        description: createBlogDescription,
        image: imageToUse,
        slug: createBlogTitle.toLowerCase().replace(/\s+/g, '-'),
        status: "active",
        theme: "default",
      });

      if (newBlog && !newBlog.error) {
        setBlogs([...blogs, newBlog]);
        
        // Reset form
        setCreateBlogTitle("");
        setCreateBlogDescription("");
        setCreateBlogImageUrl("");
        setCreateBlogImageLocal(null);
        setCreateBlogImagePreview("");
        setCreateBlogImageTab("url");
        setIsCreateBlogOpen(false);
        
        toast.success("Blog created successfully! 🎉");
      } else {
        toast.error(newBlog?.error || "Failed to create blog");
      }
    } catch (error) {
      console.error("Failed to create blog:", error);
      toast.error("Failed to create blog");
    } finally {
      setIsCreatingBlog(false);
    }
  };

  const draftArticles = expandedBlogId ? (blogArticles[expandedBlogId] || []).filter(a => a.status === "draft") : [];
  const selectedBlog = blogs.find(b => b.id === expandedBlogId);

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        {/* Hero Header */}
        <div className="relative border-b border-border/40 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900/50 dark:via-background dark:to-slate-900/30 backdrop-blur-xl sticky top-0 z-40">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/3 to-transparent rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-5xl font-serif font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    My Blogs
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground">Create, manage, and publish stunning content</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  onClick={loadBlogs}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
                  Refresh
                </Button>
                <Dialog open={isCreateBlogOpen} onOpenChange={setIsCreateBlogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all">
                      <Plus className="h-4 w-4" /> Create Blog
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Create New Blog
                      </DialogTitle>
                      <DialogDescription>
                        Start a new blog and begin publishing your content
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      {/* Blog Title */}
                      <div className="space-y-2">
                        <Label htmlFor="blog-title-create" className="text-sm font-semibold">Blog Title *</Label>
                        <Input
                          id="blog-title-create"
                          placeholder="e.g., My Travel Adventures"
                          value={createBlogTitle}
                          onChange={(e) => setCreateBlogTitle(e.target.value)}
                          className="rounded-lg"
                        />
                        {!createBlogTitle && <p className="text-xs text-muted-foreground">Blog title is required</p>}
                      </div>

                      {/* Blog Description */}
                      <div className="space-y-2">
                        <Label htmlFor="blog-desc-create" className="text-sm font-semibold">Description</Label>
                        <Textarea
                          id="blog-desc-create"
                          placeholder="Describe your blog... What will it be about?"
                          value={createBlogDescription}
                          onChange={(e) => setCreateBlogDescription(e.target.value)}
                          rows={3}
                          className="rounded-lg"
                        />
                      </div>

                      {/* Blog Banner Image */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Blog Banner Image (Optional)</Label>
                        {createBlogImagePreview && (
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/20 border border-border shadow-md">
                            <img 
                              src={createBlogImagePreview} 
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={() => {
                                setCreateBlogImagePreview("");
                                toast.error("Invalid image URL");
                              }}
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2 shadow-lg"
                              onClick={() => {
                                setCreateBlogImagePreview("");
                                setCreateBlogImageUrl("");
                                setCreateBlogImageLocal(null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        <Tabs value={createBlogImageTab} onValueChange={(v: any) => setCreateBlogImageTab(v)}>
                          <TabsList className="w-full rounded-lg">
                            <TabsTrigger value="url" className="flex-1">From URL</TabsTrigger>
                            <TabsTrigger value="upload" className="flex-1">Upload</TabsTrigger>
                          </TabsList>
                          <TabsContent value="url" className="space-y-3 mt-3">
                            <Input
                              type="url"
                              placeholder="https://example.com/image.jpg"
                              value={createBlogImageUrl}
                              onChange={(e) => handleCreateBlogImageUrl(e.target.value)}
                              className="rounded-lg"
                            />
                          </TabsContent>
                          <TabsContent value="upload" className="space-y-3 mt-3">
                            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleCreateBlogImageSelect}
                                className="hidden"
                                id="create-blog-image-upload"
                              />
                              <Label htmlFor="create-blog-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                                <span className="font-medium text-sm">Click to upload image</span>
                                <span className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</span>
                              </Label>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>

                      <Separator className="my-2" />

                      {/* Action Buttons */}
                      <div className="flex gap-3 justify-end pt-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCreateBlogOpen(false)}
                          disabled={isCreatingBlog}
                          className="rounded-lg"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateBlog} 
                          disabled={isCreatingBlog || !createBlogTitle.trim()}
                          className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg rounded-lg"
                        >
                          {isCreatingBlog ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Create Blog
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 max-w-7xl mx-auto">
          {blogs.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 mb-6">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-2">No blogs yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">Create your first blog to start publishing amazing content</p>
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-primary/80">
                  <Plus className="h-4 w-4" /> Create Your First Blog
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Blog Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {blogs.map((blog) => (
                  <div key={blog.id} className="group">
                    {/* ID Card Style (9:16) */}
                    <div 
                      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 h-full flex flex-col cursor-pointer transform ${
                        expandedBlogId === blog.id
                          ? 'border-primary/50 shadow-2xl scale-105 ring-2 ring-primary/20'
                          : 'border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:border-primary/30'
                      }`}
                      style={{ aspectRatio: '9/16' }}
                      onClick={() => toggleBlogExpanded(blog.id)}
                    >
                      {/* Gradient Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/70 dark:to-slate-900/30"></div>
                      
                      {/* Animated Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 transition-opacity duration-500 pointer-events-none ${
                        expandedBlogId === blog.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}></div>

                      <div className="relative z-10 flex flex-col h-full">
                        {/* Image Section */}
                        <div className="relative w-full h-2/5 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                          {blog.image ? (
                            <img 
                              src={blog.image} 
                              alt={blog.title}
                              onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                              <Globe className="h-12 w-12 text-primary/20" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          {/* Status Badge */}
                          <div className="absolute top-3 right-3 transform transition-all duration-500 group-hover:scale-110">
                            <Badge className="backdrop-blur-md bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white border-0 shadow-lg text-xs">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></div>
                              Active
                            </Badge>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 p-4 space-y-3 flex flex-col">
                          <div className="flex-1">
                            <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mb-1">
                              {blog.title}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {blog.description || blog.slug}
                            </p>
                          </div>

                          {/* Draft Counter */}
                          <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 group-hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-1.5">
                              <div className="p-1 bg-primary/10 rounded">
                                <FileText className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{draftArticles.length}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Drafts</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 h-9 text-xs gap-2 rounded-lg hover:bg-primary/5"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBlogExpanded(blog.id);
                              }}
                            >
                              <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${expandedBlogId === blog.id ? 'rotate-180' : ''}`} />
                              Manage
                            </Button>
                            <Link href={`/public-blog?blogId=${blog.id}`} onClick={(e) => e.stopPropagation()}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-1 h-9 text-xs gap-2 border-slate-200 dark:border-slate-700"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                            </Link>
                          </div>

                          {/* Edit & Delete Buttons */}
                          <div className="flex gap-1.5">
                            <Dialog open={editingBlogId === blog.id} onOpenChange={(open) => !open && setEditingBlogId(null)}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="flex-1 h-8 text-xs gap-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditDialog(blog);
                                  }}
                                >
                                  <Edit2 className="h-3 w-3" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit Blog</DialogTitle>
                                  <DialogDescription>Update your blog details</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="blog-title">Blog Title</Label>
                                    <Input
                                      id="blog-title"
                                      value={editTitle}
                                      onChange={(e) => setEditTitle(e.target.value)}
                                      placeholder="Enter blog title"
                                    />
                                  </div>
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
                                  <div className="space-y-3">
                                    <Label>Blog Banner Image</Label>
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
                                      </TabsContent>
                                      <TabsContent value="upload" className="space-y-3">
                                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLocalImageSelect}
                                            className="hidden"
                                            id="image-upload"
                                          />
                                          <Label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                            <Upload className="h-6 w-6 text-muted-foreground" />
                                            <span className="font-medium text-sm">Upload image</span>
                                          </Label>
                                        </div>
                                      </TabsContent>
                                    </Tabs>
                                  </div>
                                  <Separator />
                                  <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={() => setEditingBlogId(null)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={() => handleSaveBlog(blog.id)} disabled={isSaving}>
                                      {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <AlertDialog open={deletingBlogId === blog.id} onOpenChange={(open) => !open && setDeletingBlogId(null)}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 h-8 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/5 rounded-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingBlogId(blog.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Blog?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this blog and all its articles. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex gap-2 justify-end">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteBlog(blog.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Side Expandable Panel - Draft Articles */}
              {expandedBlogId && selectedBlog && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 perspective">
                  <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-slate-50/80 via-white/80 to-slate-50/80 dark:from-slate-900/30 dark:via-slate-900/50 dark:to-slate-900/30 backdrop-blur-xl p-6 shadow-2xl [box-shadow:0_20px_60px_-12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                          <Flame className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">{selectedBlog.title}</h3>
                          <p className="text-xs text-muted-foreground">{draftArticles.length} draft{draftArticles.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpandedBlogId(null)}
                        className="h-9 w-9 rounded-lg hover:bg-primary/10"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Articles List */}
                    {loadingBlogId === expandedBlogId ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : draftArticles.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-4">No draft articles yet</p>
                        <Link href={`/editor?blogId=${expandedBlogId}`}>
                          <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-primary/80">
                            <Plus className="h-3 w-3" /> Create Article
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {draftArticles.map((article, idx) => (
                          <div
                            key={article.id}
                            className="group animate-in fade-in slide-in-from-left-4 duration-500"
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                            <div className="relative p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 transform hover:scale-102 hover:-translate-y-1">
                              {/* Hover Glow Effect */}
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                              
                              <div className="relative z-10">
                                <h4 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                                  {article.title}
                                </h4>

                                {/* Date Info */}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 pb-3 border-b border-slate-200/50 dark:border-slate-700/50">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 h-8 text-xs gap-1 rounded-lg border-slate-200/50 dark:border-slate-700/50"
                                    onClick={() => setLocation(`/editor?articleId=${article.id}`)}
                                  >
                                    <Pencil className="h-3 w-3" />
                                    Edit
                                  </Button>

                                  <Dialog open={currentPublishingArticleId === article.id} onOpenChange={(open) => {
                                    if (!open) {
                                      setCurrentPublishingArticleId(null);
                                      setIsScheduleMode(false);
                                      setPublishedLink(null);
                                    }
                                  }}>
                                    <DialogTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        className="flex-1 h-8 text-xs gap-1 rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all"
                                        onClick={() => {
                                          setCurrentPublishingArticleId(article.id);
                                          const { dateStr, timeStr } = getCurrentDateTime();
                                          setPublishDate(dateStr);
                                          setPublishTime(timeStr);
                                          setIsScheduleMode(false);
                                          setPublishedLink(null);
                                        }}
                                      >
                                        <Zap className="h-3 w-3" />
                                        Publish
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                      <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                          <Sparkles className="h-5 w-5 text-primary" />
                                          Publish Article
                                        </DialogTitle>
                                        <DialogDescription>
                                          {article.title}
                                        </DialogDescription>
                                      </DialogHeader>

                                      {publishedLink ? (
                                        <div className="space-y-4 py-4">
                                          <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                              <p className="font-semibold text-emerald-900 dark:text-emerald-100">Published Successfully! 🎉</p>
                                            </div>
                                            <p className="text-sm text-emerald-700 dark:text-emerald-200">Your article is now live and visible on your blog.</p>
                                          </div>

                                          <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Share Link</Label>
                                            <div className="flex gap-2">
                                              <Input
                                                readOnly
                                                value={publishedLink}
                                                className="text-xs"
                                              />
                                              <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() => {
                                                  navigator.clipboard.writeText(publishedLink);
                                                  setCopiedLink(true);
                                                  setTimeout(() => setCopiedLink(false), 2000);
                                                }}
                                              >
                                                {copiedLink ? (
                                                  <Check className="h-4 w-4 text-emerald-600" />
                                                ) : (
                                                  <Copy className="h-4 w-4" />
                                                )}
                                              </Button>
                                            </div>
                                          </div>

                                          <div className="flex gap-2">
                                            <Button
                                              variant="outline"
                                              className="flex-1"
                                              onClick={() => {
                                                window.open(publishedLink, '_blank');
                                              }}
                                            >
                                              <Share2 className="h-4 w-4 mr-2" />
                                              View Article
                                            </Button>
                                            <Button
                                              className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                                              onClick={() => {
                                                setCurrentPublishingArticleId(null);
                                                setIsScheduleMode(false);
                                                setPublishedLink(null);
                                              }}
                                            >
                                              Done
                                            </Button>
                                          </div>
                                        </div>
                                      ) : !isScheduleMode ? (
                                        // Initial View - Publish Now vs Schedule
                                        <div className="space-y-4 py-6">
                                          <div className="p-4 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Clock className="h-4 w-4 text-muted-foreground" />
                                              <p className="text-xs text-muted-foreground">Current Date & Time</p>
                                            </div>
                                            <p className="font-semibold text-sm">
                                              {new Date(
                                                `${publishDate}T${publishTime}`
                                              ).toLocaleString()}
                                            </p>
                                          </div>

                                          <Separator className="my-2" />

                                          <div className="space-y-3">
                                            <Button
                                              onClick={() => handlePublishArticle(article.id, true)}
                                              disabled={publishingId === article.id}
                                              className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all rounded-lg"
                                            >
                                              {publishingId === article.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                <Zap className="h-4 w-4" />
                                              )}
                                              Publish Now
                                            </Button>

                                            <Button
                                              onClick={() => setIsScheduleMode(true)}
                                              disabled={publishingId === article.id}
                                              variant="outline"
                                              className="w-full gap-2 rounded-lg border-slate-200 dark:border-slate-700"
                                            >
                                              <Calendar className="h-4 w-4" />
                                              Schedule for Later
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        // Schedule Mode - Date & Time Picker
                                        <div className="space-y-4 py-4">
                                          <div className="space-y-3">
                                            <div className="space-y-2">
                                              <Label htmlFor="pub-date-schedule" className="text-sm font-semibold flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Publish Date
                                              </Label>
                                              <Input
                                                id="pub-date-schedule"
                                                type="date"
                                                value={publishDate}
                                                onChange={(e) => setPublishDate(e.target.value)}
                                                className="rounded-lg"
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="pub-time-schedule" className="text-sm font-semibold flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Publish Time
                                              </Label>
                                              <Input
                                                id="pub-time-schedule"
                                                type="time"
                                                value={publishTime}
                                                onChange={(e) => setPublishTime(e.target.value)}
                                                className="rounded-lg"
                                              />
                                            </div>
                                          </div>

                                          <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                              <strong>Scheduled for:</strong> {new Date(
                                                `${publishDate}T${publishTime}`
                                              ).toLocaleString()}
                                            </p>
                                          </div>

                                          <Separator />

                                          <div className="flex gap-2">
                                            <Button
                                              variant="outline"
                                              onClick={() => setIsScheduleMode(false)}
                                              disabled={publishingId === article.id}
                                              className="flex-1 rounded-lg"
                                            >
                                              Back
                                            </Button>
                                            <Button
                                              onClick={() => handlePublishArticle(article.id, false)}
                                              disabled={publishingId === article.id}
                                              className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg rounded-lg"
                                            >
                                              {publishingId === article.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                <Calendar className="h-4 w-4" />
                                              )}
                                              Schedule
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>

                                  <AlertDialog open={deletingArticleId === article.id} onOpenChange={(open) => !open && setDeletingArticleId(null)}>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/5 rounded-lg"
                                      onClick={() => setDeletingArticleId(article.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will move the article to trash.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <div className="flex gap-2 justify-end">
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteArticle(article.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </div>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer Action */}
                    {draftArticles.length > 0 && (
                      <div className="pt-4 mt-4 border-t border-primary/20">
                        <Link href={`/editor?blogId=${expandedBlogId}`}>
                          <Button variant="outline" className="w-full gap-2" size="sm">
                            <Plus className="h-3 w-3" />
                            Create New Article
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}

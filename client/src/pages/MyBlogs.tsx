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
  X,
  RefreshCw,
  ChevronDown,
  Calendar,
  Clock,
  Zap,
  Send,
  PenTool,
  Pencil,
  Sparkles,
  TrendingUp,
  FileText
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
import { PlagiarismChecker } from "@/components/PlagiarismChecker";

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
  const [plagiarismArticleId, setPlagiarismArticleId] = useState<string | null>(null);
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split("T")[0]);
  const [publishTime, setPublishTime] = useState("12:00");

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
      console.log(`[MyBlogs] Loaded ${blogList.length} blogs`, blogList);
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
      await api.deleteBlog(blogId);
      setBlogs(blogs.filter(b => b.id !== blogId));
      setDeletingBlogId(null);
      toast.success("Blog deleted successfully");
    } catch (error) {
      console.error("Failed to delete blog:", error);
      toast.error("Failed to delete blog");
    }
  };

  const handlePublishArticle = async (articleId: string) => {
    try {
      setPublishingId(articleId);
      const publishDateTime = new Date(`${publishDate}T${publishTime}`);
      
      const updateResult = await api.updateArticle(articleId, {
        status: "published",
        publishedAt: publishDateTime.toISOString(),
      });
      
      if (updateResult && !updateResult.error) {
        toast.success("Article published successfully!");
        const expandedId = expandedBlogId;
        if (expandedId) {
          setBlogArticles(prev => ({
            ...prev,
            [expandedId]: prev[expandedId].filter(a => a.id !== articleId)
          }));
        }
      } else {
        toast.error(updateResult?.error || "Failed to publish article");
      }
      
      setPublishingId(null);
    } catch (error) {
      console.error("Failed to publish article:", error);
      toast.error("Failed to publish article");
      setPublishingId(null);
    }
  };

  const handleEditArticle = async (articleId: string) => {
    if (!editArticleTitle.trim()) {
      toast.error("Article title cannot be empty");
      return;
    }
    
    try {
      await api.updateArticle(articleId, { title: editArticleTitle });
      if (expandedBlogId) {
        setBlogArticles(prev => ({
          ...prev,
          [expandedBlogId]: prev[expandedBlogId].map(a => 
            a.id === articleId ? { ...a, title: editArticleTitle } : a
          )
        }));
      }
      setEditingArticleId(null);
      toast.success("Article title updated successfully");
    } catch (error) {
      console.error("Failed to update article:", error);
      toast.error("Failed to update article");
    }
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

  const draftArticles = expandedBlogId ? (blogArticles[expandedBlogId] || []).filter(a => a.status === "draft") : [];

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
        {/* Premium Hero Header */}
        <div className="relative border-b border-border/40 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900/50 dark:via-background dark:to-slate-900/30 backdrop-blur-xl sticky top-0 z-40">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/3 to-transparent rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-5xl font-serif font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    My Blogs
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground">Manage your publications and digital presence</p>
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
                <Link href="/dashboard">
                  <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all">
                    <Plus className="h-4 w-4" /> New Blog
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/30 backdrop-blur border border-slate-100 dark:border-slate-700/50">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Total Blogs</p>
                <p className="text-3xl font-bold text-primary mt-1">{blogs.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/30 backdrop-blur border border-slate-100 dark:border-slate-700/50">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Status</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">Active</p>
              </div>
              <div className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/30 backdrop-blur border border-slate-100 dark:border-slate-700/50">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Total Articles</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {Object.values(blogArticles).flat().length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {blogs.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 mb-6">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-2">No blogs yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">Create your first blog to start publishing amazing content</p>
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-primary/80">
                  <Plus className="h-4 w-4" /> Create First Blog
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {blogs.map((blog) => (
                <div key={blog.id} className="space-y-4">
                  {/* Blog Card */}
                  <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur hover:shadow-xl transition-all duration-300">
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    
                    {/* Blog Image */}
                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 h-48">
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
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <Globe className="h-16 w-16 text-primary/20" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Badge 
                          className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white border-0 shadow-lg"
                        >
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                          {blog.status === "active" ? "Active" : "Draft"}
                        </Badge>
                      </div>
                    </div>

                    {/* Blog Content */}
                    <div className="relative p-6 space-y-4">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                          {blog.title}
                        </h2>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {blog.slug}
                        </p>
                      </div>
                      
                      {blog.description && (
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                          {blog.description}
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <Link href={`/public-blog?blogId=${blog.id}`} className="flex-1">
                          <Button 
                            variant="outline" 
                            className="w-full gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <Eye className="h-4 w-4" /> Preview
                          </Button>
                        </Link>
                        
                        <Dialog open={editingBlogId === blog.id} onOpenChange={(open) => !open && setEditingBlogId(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
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
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setLocation(`/performance?blogId=${blog.id}`)}>
                              <TrendingUp className="h-4 w-4 mr-2" />
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

                      {/* Drafts Expand Button */}
                      <Button
                        variant={expandedBlogId === blog.id ? "default" : "outline"}
                        className="w-full gap-2 mt-4 border-slate-200 dark:border-slate-700"
                        onClick={() => toggleBlogExpanded(blog.id)}
                        disabled={loadingBlogId === blog.id}
                      >
                        {loadingBlogId === blog.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ChevronDown className={`h-4 w-4 transition-transform ${expandedBlogId === blog.id ? 'rotate-180' : ''}`} />
                        )}
                        <FileText className="h-4 w-4" />
                        Drafts ({(blogArticles[blog.id] || []).filter(a => a.status === "draft").length})
                      </Button>
                    </div>
                  </div>

                  {/* Draft Articles */}
                  {expandedBlogId === blog.id && (
                    <div className="space-y-4 ml-0 bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/20 rounded-lg p-6 border border-slate-200 dark:border-slate-700/50">
                      {draftArticles.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-muted-foreground font-medium">No draft articles</p>
                          <p className="text-sm text-muted-foreground mb-4">Create one to start writing</p>
                          <Link href={`/editor?blogId=${blog.id}`}>
                            <Button size="sm" variant="outline" className="gap-2">
                              <Plus className="h-4 w-4" /> Create Article
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {draftArticles.map((article) => (
                            <div 
                              key={article.id} 
                              className="p-4 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 hover:shadow-md transition-all"
                            >
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1">
                                    {article.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {article.excerpt || article.content?.substring(0, 80) || "No description"}
                                  </p>
                                </div>
                                <Badge variant="secondary" className="text-xs">Draft</Badge>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                <span>{(article.content?.split(/\s+/).length || 0).toLocaleString()} words</span>
                              </div>

                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setLocation(`/editor?articleId=${article.id}`)}
                                  className="gap-2 h-8"
                                >
                                  <PenTool className="h-3 w-3" />
                                  Edit
                                </Button>

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" className="gap-2 h-8 bg-gradient-to-r from-primary to-primary/80">
                                      <Zap className="h-3 w-3" />
                                      Publish
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Publish Article</DialogTitle>
                                      <DialogDescription>
                                        Set the publication date and time
                                      </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-6 py-6">
                                      <div className="space-y-3">
                                        <label className="text-sm font-semibold">Publish Date</label>
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-5 w-5 text-muted-foreground" />
                                          <Input
                                            type="date"
                                            value={publishDate}
                                            onChange={(e) => setPublishDate(e.target.value)}
                                            className="flex-1"
                                          />
                                        </div>
                                      </div>

                                      <div className="space-y-3">
                                        <label className="text-sm font-semibold">Publish Time</label>
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-5 w-5 text-muted-foreground" />
                                          <Input
                                            type="time"
                                            value={publishTime}
                                            onChange={(e) => setPublishTime(e.target.value)}
                                            className="flex-1"
                                          />
                                        </div>
                                      </div>

                                      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <p className="text-sm text-blue-900 dark:text-blue-100">
                                          Publishing on <strong>{new Date(`${publishDate}T${publishTime}`).toLocaleString()}</strong>
                                        </p>
                                      </div>

                                      <Button
                                        onClick={() => handlePublishArticle(article.id)}
                                        disabled={publishingId === article.id}
                                        className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80"
                                      >
                                        {publishingId === article.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Send className="h-4 w-4" />
                                        )}
                                        {publishingId === article.id ? "Publishing..." : "Publish Now"}
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setPlagiarismArticleId(article.id)}
                                  className="gap-2 h-8"
                                >
                                  <Eye className="h-3 w-3" />
                                  Check
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingArticleId(article.id)}
                                  className="gap-2 h-8 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Article Title Dialog */}
      {editingArticleId && (
        <Dialog open={!!editingArticleId} onOpenChange={(open) => !open && setEditingArticleId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Article Title</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                value={editArticleTitle}
                onChange={(e) => setEditArticleTitle(e.target.value)}
                placeholder="Enter article title"
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditingArticleId(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleEditArticle(editingArticleId)}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Article Confirmation */}
      {deletingArticleId && (
        <Dialog open={!!deletingArticleId} onOpenChange={(open) => !open && setDeletingArticleId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Article</DialogTitle>
              <DialogDescription>
                This article will be moved to trash. You can restore it later.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setDeletingArticleId(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleDeleteArticle(deletingArticleId)}
              >
                Move to Trash
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Plagiarism Checker Dialog */}
      {plagiarismArticleId && (
        <Dialog open={!!plagiarismArticleId} onOpenChange={(open) => !open && setPlagiarismArticleId(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Plagiarism Checker</DialogTitle>
              <DialogDescription>
                Check your article content for potential plagiarism
              </DialogDescription>
            </DialogHeader>
            {plagiarismArticleId && expandedBlogId && (
              <PlagiarismChecker
                articleId={plagiarismArticleId}
                content={(blogArticles[expandedBlogId] || []).find(a => a.id === plagiarismArticleId)?.content || ""}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

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

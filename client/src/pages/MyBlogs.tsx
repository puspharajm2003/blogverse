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
  FileText,
  ArrowRight
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
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-5xl font-serif font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    My Blogs
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground">Manage and publish articles across your blogs</p>
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
                    <Plus className="h-4 w-4" /> Create Blog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-max">
              {blogs.map((blog) => (
                <div key={blog.id} className="group">
                  {/* ID Card Style (9:16 ratio) */}
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur hover:shadow-2xl transition-all duration-300 h-full flex flex-col" style={{ aspectRatio: '9/16' }}>
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    
                    {/* Blog Image Header */}
                    <div className="relative w-full h-2/5 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                      {blog.image ? (
                        <img 
                          src={blog.image} 
                          alt={blog.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <Globe className="h-12 w-12 text-primary/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="absolute top-3 right-3">
                        <Badge 
                          className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white border-0 shadow-lg text-xs"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></div>
                          Active
                        </Badge>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="flex-1 p-4 space-y-3 flex flex-col">
                      <div className="flex-1">
                        <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mb-1">
                          {blog.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {blog.description || blog.slug}
                        </p>
                      </div>

                      {/* Drafts Count */}
                      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-semibold">{(blogArticles[blog.id] || []).filter(a => a.status === "draft").length}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Drafts</span>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 h-8 text-xs gap-1"
                          onClick={() => toggleBlogExpanded(blog.id)}
                        >
                          <ChevronDown className="h-3 w-3" />
                          Manage
                        </Button>
                        <Link href={`/public-blog?blogId=${blog.id}`} className="flex-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full h-8 text-xs gap-1 border-slate-200 dark:border-slate-700"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                        </Link>
                      </div>

                      {/* More Actions */}
                      <div className="flex gap-1.5 pt-1">
                        <Dialog open={editingBlogId === blog.id} onOpenChange={(open) => !open && setEditingBlogId(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEditDialog(blog)}
                            >
                              <Edit2 className="h-3 w-3" />
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
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeletingBlogId(blog.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Blog?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this blog and all its articles.
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

                  {/* Draft Articles Expandable Section */}
                  {expandedBlogId === blog.id && (
                    <div className="mt-4 space-y-3 col-span-full">
                      <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/20 border border-slate-200 dark:border-slate-700/50">
                        <h4 className="font-semibold mb-3 text-sm">Draft Articles ({draftArticles.length})</h4>
                        {draftArticles.length === 0 ? (
                          <div className="text-center py-8">
                            <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No drafts yet</p>
                            <Link href={`/editor?blogId=${blog.id}`}>
                              <Button size="sm" variant="outline" className="mt-2 gap-2">
                                <Plus className="h-3 w-3" /> Create Article
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {draftArticles.map((article) => (
                              <div key={article.id} className="p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                                <h5 className="font-semibold text-sm line-clamp-1 mb-1">{article.title}</h5>
                                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                                  {article.excerpt || article.content?.substring(0, 50) || "No description"}
                                </p>
                                <div className="flex gap-1.5 flex-wrap">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 text-xs flex-1"
                                    onClick={() => setLocation(`/editor?articleId=${article.id}`)}
                                  >
                                    Edit
                                  </Button>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button size="sm" className="h-6 text-xs flex-1 gap-1">
                                        <Zap className="h-3 w-3" />
                                        Publish
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Publish Article</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div>
                                          <label className="text-sm font-semibold">Date</label>
                                          <Input
                                            type="date"
                                            value={publishDate}
                                            onChange={(e) => setPublishDate(e.target.value)}
                                            className="mt-1"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-semibold">Time</label>
                                          <Input
                                            type="time"
                                            value={publishTime}
                                            onChange={(e) => setPublishTime(e.target.value)}
                                            className="mt-1"
                                          />
                                        </div>
                                        <Button
                                          onClick={() => handlePublishArticle(article.id)}
                                          disabled={publishingId === article.id}
                                          className="w-full gap-2"
                                        >
                                          {publishingId === article.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <Send className="h-4 w-4" />
                                          )}
                                          Publish
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 text-xs"
                                    onClick={() => setDeletingArticleId(article.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Article Dialog */}
      {deletingArticleId && (
        <Dialog open={!!deletingArticleId} onOpenChange={(open) => !open && setDeletingArticleId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Article?</DialogTitle>
              <DialogDescription>This will move the article to trash.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setDeletingArticleId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDeleteArticle(deletingArticleId)}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Plagiarism Checker */}
      {plagiarismArticleId && (
        <Dialog open={!!plagiarismArticleId} onOpenChange={(open) => !open && setPlagiarismArticleId(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Plagiarism Checker</DialogTitle>
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
    </SidebarLayout>
  );
}

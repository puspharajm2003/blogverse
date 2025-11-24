import { useState, useEffect } from "react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { PlagiarismChecker } from "@/components/PlagiarismChecker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { useLocation } from "wouter";
import {
  Send,
  Calendar,
  Clock,
  Eye,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap,
  Globe,
  Edit2,
  MoreHorizontal,
  X,
  Pencil,
  PenTool,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function BlogPublish() {
  const [, setLocation] = useLocation();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<string>("");
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split("T")[0]);
  const [publishTime, setPublishTime] = useState("12:00");
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [editBlogTitle, setEditBlogTitle] = useState("");
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editArticleTitle, setEditArticleTitle] = useState("");
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null);
  const [plagiarismArticleId, setPlagiarismArticleId] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const data = await api.getBlogs();
      setBlogs(data || []);
      if (data && data.length > 0) {
        setSelectedBlog(data[0].id);
        fetchArticles(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArticles = async (blogId: string) => {
    if (!blogId) return;
    setIsFetching(true);
    try {
      const data = await api.getArticlesByBlogAdmin(blogId);
      // Filter out deleted articles
      const activeArticles = (data || []).filter((a: any) => a.status !== "deleted");
      setArticles(activeArticles);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setIsFetching(false);
    }
  };

  const handleBlogChange = (blogId: string) => {
    setSelectedBlog(blogId);
    fetchArticles(blogId);
  };

  const handleEditBlog = async (blogId: string) => {
    if (!editBlogTitle.trim()) {
      toast.error("Blog title cannot be empty");
      return;
    }
    
    try {
      await api.updateBlog(blogId, { title: editBlogTitle });
      setBlogs(blogs.map(b => b.id === blogId ? { ...b, title: editBlogTitle } : b));
      setEditingBlogId(null);
      toast.success("Blog updated successfully");
    } catch (error) {
      console.error("Failed to update blog:", error);
      toast.error("Failed to update blog");
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    try {
      // Note: Implement delete endpoint in your API
      setBlogs(blogs.filter(b => b.id !== blogId));
      if (selectedBlog === blogId) {
        setSelectedBlog(blogs[0]?.id || "");
      }
      setDeletingBlogId(null);
      toast.success("Blog deleted successfully");
    } catch (error) {
      console.error("Failed to delete blog:", error);
      toast.error("Failed to delete blog");
    }
  };

  const handlePublish = async (articleId: string) => {
    try {
      setPublishingId(articleId);
      const publishDateTime = new Date(`${publishDate}T${publishTime}`);
      
      const updateResult = await api.updateArticle(articleId, {
        status: "published",
        publishedAt: publishDateTime.toISOString(),
      });
      
      if (updateResult && !updateResult.error) {
        toast.success("Article published! View it on your public blog.", {
          action: {
            label: "View Blog",
            onClick: () => {
              const blog = blogs.find(b => b.id === selectedBlog);
              if (blog) {
                setLocation(`/public-blog?blogId=${selectedBlog}`);
              }
            },
          },
        });
        
        // Refresh articles to show updated status
        await fetchArticles(selectedBlog);
      } else {
        toast.error(updateResult?.error || "Failed to publish article");
      }
      
      setPublishingId(null);
    } catch (error) {
      console.error("Failed to publish article:", error);
      toast.error("Failed to publish article. Please try again.");
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
      setArticles(articles.map(a => a.id === articleId ? { ...a, title: editArticleTitle } : a));
      setEditingArticleId(null);
      toast.success("Article updated successfully");
    } catch (error) {
      console.error("Failed to update article:", error);
      toast.error("Failed to update article");
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      // Get article details for trash
      const article = articles.find(a => a.id === articleId);
      if (!article) return;

      // Update article status to "deleted" in database
      await api.updateArticle(articleId, { status: "deleted" });

      // Store in trash (localStorage for backup)
      const deletedArticles = JSON.parse(localStorage.getItem("deleted_articles") || "[]");
      deletedArticles.push({
        id: article.id,
        blogId: article.blogId,
        title: article.title,
        excerpt: article.excerpt,
        deletedAt: new Date().toISOString(),
      });
      localStorage.setItem("deleted_articles", JSON.stringify(deletedArticles));

      // Remove from articles in UI
      setArticles(articles.filter(a => a.id !== articleId));
      setDeletingArticleId(null);
      toast.success("Article moved to trash");
    } catch (error) {
      console.error("Failed to delete article:", error);
      toast.error("Failed to delete article");
    }
  };

  const handleUnpublish = async (articleId: string) => {
    try {
      setPublishingId(articleId);
      
      await api.updateArticle(articleId, {
        status: "draft",
        publishedAt: null,
      });
      
      toast.success("Article unpublished successfully!");
      fetchArticles(selectedBlog);
    } catch (error) {
      console.error("Failed to unpublish article:", error);
      toast.error("Failed to unpublish article");
    } finally {
      setPublishingId(null);
    }
  };

  const draftArticles = (articles || []).filter((a) => a.status === "draft");
  const publishedArticles = (articles || []).filter((a) => a.status === "published");

  const selectedBlogData = Array.isArray(blogs) ? blogs.find((b) => b.id === selectedBlog) : null;

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
        {/* Header Section */}
        <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-serif font-bold tracking-tight flex items-center gap-3">
                  <Send className="h-8 w-8 text-primary" />
                  Publish Articles
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage your article drafts and published content
                </p>
              </div>

              {/* Blog Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">Select Blog:</span>
                <Select value={selectedBlog} onValueChange={handleBlogChange}>
                  <SelectTrigger className="w-80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(blogs) && blogs.map((blog) => (
                      <SelectItem key={blog.id} value={blog.id}>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {blog.name || blog.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Blog Management Buttons */}
                {selectedBlogData && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="ml-auto">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => {
                          setEditingBlogId(selectedBlog);
                          setEditBlogTitle(selectedBlogData.title);
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Blog
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeletingBlogId(selectedBlog)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Blog
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Edit Blog Dialog */}
              {editingBlogId && (
                <Dialog open={!!editingBlogId} onOpenChange={(open) => !open && setEditingBlogId(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Blog</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Blog Title</label>
                        <Input
                          value={editBlogTitle}
                          onChange={(e) => setEditBlogTitle(e.target.value)}
                          placeholder="Enter blog title"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" onClick={() => setEditingBlogId(null)}>
                          Cancel
                        </Button>
                        <Button onClick={() => handleEditBlog(editingBlogId)}>
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Delete Blog Confirmation */}
              {deletingBlogId && (
                <Dialog open={!!deletingBlogId} onOpenChange={(open) => !open && setDeletingBlogId(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Blog</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this blog? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" onClick={() => setDeletingBlogId(null)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleDeleteBlog(deletingBlogId)}
                      >
                        Delete
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Edit Article Dialog */}
              {editingArticleId && (
                <Dialog open={!!editingArticleId} onOpenChange={(open) => !open && setEditingArticleId(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Article</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Article Title</label>
                        <Input
                          value={editArticleTitle}
                          onChange={(e) => setEditArticleTitle(e.target.value)}
                          placeholder="Enter article title"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
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

              {/* Plagiarism Check Dialog */}
              {plagiarismArticleId && (
                <Dialog open={!!plagiarismArticleId} onOpenChange={(open) => !open && setPlagiarismArticleId(null)}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Plagiarism Checker</DialogTitle>
                      <DialogDescription>
                        Check your article content for potential plagiarism
                      </DialogDescription>
                    </DialogHeader>
                    {plagiarismArticleId && (
                      <PlagiarismChecker
                        articleId={plagiarismArticleId}
                        content={articles.find(a => a.id === plagiarismArticleId)?.content || ""}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 py-12">
          {!Array.isArray(blogs) || blogs.length === 0 ? (
            <Card className="text-center py-12 border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <CardTitle>No Blogs Found</CardTitle>
              <CardDescription>Create a blog first to publish articles</CardDescription>
            </Card>
          ) : (
            <Tabs defaultValue="drafts" className="space-y-8">
              <div className="flex items-center justify-between">
                <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100 dark:bg-slate-800">
                  <TabsTrigger value="drafts" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                    <AlertCircle className="h-4 w-4" />
                    Drafts ({draftArticles.length})
                  </TabsTrigger>
                  <TabsTrigger value="published" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Published ({publishedArticles.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Draft Articles Tab */}
              <TabsContent value="drafts" className="space-y-6">
                {draftArticles.length === 0 ? (
                  <Card className="text-center py-16 border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                    <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                    <CardTitle className="text-amber-900 dark:text-amber-100">No Draft Articles</CardTitle>
                    <CardDescription className="text-amber-800/70">Create a new article to get started</CardDescription>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {draftArticles.map((article) => (
                      <Card
                        key={article.id}
                        className="hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:scale-[1.01] overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10 pointer-events-none" />
                        <CardHeader className="relative">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
                                <div className="flex-1">
                                  <CardTitle className="text-2xl font-serif line-clamp-2">
                                    {article.title || "Untitled"}
                                  </CardTitle>
                                </div>
                              </div>
                              <CardDescription className="text-sm ml-4 line-clamp-2">
                                {article.excerpt || article.content?.substring(0, 150) || "No description"}
                              </CardDescription>
                            </div>
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs font-semibold px-3 py-1">
                              Draft
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="space-y-6">
                            {/* Article Meta Stats */}
                            <div className="grid grid-cols-4 gap-3">
                              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/40 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                                <p className="text-xs text-blue-600 dark:text-blue-300 uppercase font-bold">Created</p>
                                <p className="font-semibold text-sm mt-1 text-blue-900 dark:text-blue-100">
                                  {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                              <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/40 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                                <p className="text-xs text-purple-600 dark:text-purple-300 uppercase font-bold">Words</p>
                                <p className="font-semibold text-sm mt-1 text-purple-900 dark:text-purple-100">
                                  {(article.content?.split(/\s+/).length || 0).toLocaleString()}
                                </p>
                              </div>
                              <div className="p-3 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/40 dark:to-green-900/40 rounded-lg border border-green-200/50 dark:border-green-800/50">
                                <p className="text-xs text-green-600 dark:text-green-300 uppercase font-bold">Read Time</p>
                                <p className="font-semibold text-sm mt-1 text-green-900 dark:text-green-100">
                                  {Math.ceil((article.content?.split(/\s+/).length || 0) / 200)} min
                                </p>
                              </div>
                              <div className="p-3 bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-950/40 dark:to-pink-900/40 rounded-lg border border-pink-200/50 dark:border-pink-800/50">
                                <p className="text-xs text-pink-600 dark:text-pink-300 uppercase font-bold">Status</p>
                                <p className="font-semibold text-sm mt-1 text-pink-900 dark:text-pink-100">Draft</p>
                              </div>
                            </div>

                            {/* Article Actions */}
                            <div className="flex gap-3 flex-wrap pt-3">
                              <Button
                                variant="outline"
                                onClick={() => setLocation(`/editor?articleId=${article.id}`)}
                                className="gap-2 flex-1 h-10 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300"
                                title="Edit article content"
                              >
                                <PenTool className="h-4 w-4" />
                                Edit Content
                              </Button>

                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingArticleId(article.id);
                                  setEditArticleTitle(article.title);
                                }}
                                className="gap-2 flex-1 h-10 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:border-purple-300"
                                title="Edit article title"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit Title
                              </Button>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button className="flex-1 gap-2 font-semibold h-10 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                                    <Zap className="h-4 w-4" />
                                    Publish
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Publish Article</DialogTitle>
                                    <DialogDescription>
                                      Set the publication date and time for your article
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

                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                      <p className="text-sm text-blue-900">
                                        Your article will be published on{" "}
                                        <strong>
                                          {new Date(`${publishDate}T${publishTime}`).toLocaleString()}
                                        </strong>
                                      </p>
                                    </div>

                                    <Button
                                      onClick={() => handlePublish(article.id)}
                                      disabled={publishingId === article.id}
                                      className="w-full gap-2 font-semibold h-11"
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
                                variant="outline"
                                onClick={() => setPlagiarismArticleId(article.id)}
                                className="gap-2 flex-1 h-10 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:border-teal-300"
                                title="Check plagiarism"
                              >
                                <Eye className="h-4 w-4" />
                                Check Plagiarism
                              </Button>

                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => setDeletingArticleId(article.id)}
                                title="Delete article"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Published Articles Tab */}
              <TabsContent value="published" className="space-y-6">
                {publishedArticles.length === 0 ? (
                  <Card className="text-center py-16 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                    <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <CardTitle className="text-green-900 dark:text-green-100">No Published Articles</CardTitle>
                    <CardDescription className="text-green-800/70">Publish your first article to see it here</CardDescription>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {publishedArticles.map((article) => (
                      <Card
                        key={article.id}
                        className="hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:scale-[1.01] overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10 pointer-events-none" />
                        <CardHeader className="relative">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full" />
                                <div className="flex-1">
                                  <CardTitle className="text-2xl font-serif line-clamp-2">
                                    {article.title || "Untitled"}
                                  </CardTitle>
                                </div>
                              </div>
                              <CardDescription className="text-sm ml-4 line-clamp-2">
                                {article.excerpt || article.content?.substring(0, 150) || "No description"}
                              </CardDescription>
                            </div>
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs font-semibold px-3 py-1">
                              Live
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="space-y-6">
                            {/* Article Meta Stats */}
                            <div className="grid grid-cols-4 gap-3">
                              <div className="p-3 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/40 dark:to-green-900/40 rounded-lg border border-green-200/50 dark:border-green-800/50">
                                <p className="text-xs text-green-600 dark:text-green-300 uppercase font-bold">Published</p>
                                <p className="font-semibold text-sm mt-1 text-green-900 dark:text-green-100">
                                  {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                              <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/40 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                                <p className="text-xs text-indigo-600 dark:text-indigo-300 uppercase font-bold">Words</p>
                                <p className="font-semibold text-sm mt-1 text-indigo-900 dark:text-indigo-100">
                                  {(article.content?.split(/\s+/).length || 0).toLocaleString()}
                                </p>
                              </div>
                              <div className="p-3 bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-950/40 dark:to-cyan-900/40 rounded-lg border border-cyan-200/50 dark:border-cyan-800/50">
                                <p className="text-xs text-cyan-600 dark:text-cyan-300 uppercase font-bold">Read Time</p>
                                <p className="font-semibold text-sm mt-1 text-cyan-900 dark:text-cyan-100">
                                  {Math.ceil((article.content?.split(/\s+/).length || 0) / 200)} min
                                </p>
                              </div>
                              <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/40 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                                <p className="text-xs text-emerald-600 dark:text-emerald-300 uppercase font-bold">Status</p>
                                <p className="font-semibold text-sm mt-1 text-emerald-900 dark:text-emerald-100">Live</p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-3">
                              <Button 
                                className="flex-1 gap-2 h-10 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all"
                                onClick={() => setLocation(`/public-blog?blogId=${selectedBlog}`)}
                              >
                                <Eye className="h-4 w-4" />
                                View Live
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 gap-2 h-10 hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-300 hover:text-red-600"
                                onClick={() => handleUnpublish(article.id)}
                                disabled={publishingId === article.id}
                              >
                                {publishingId === article.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                {publishingId === article.id ? "Unpublishing..." : "Unpublish"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </SidebarLayout>
  );
}

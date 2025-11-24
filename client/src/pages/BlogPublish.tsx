import { useState, useEffect } from "react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
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
      
      await api.updateArticle(articleId, {
        status: "published",
        publishedAt: publishDateTime.toISOString(),
      });
      
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
      
      fetchArticles(selectedBlog);
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
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 py-12">
          {!Array.isArray(blogs) || blogs.length === 0 ? (
            <Card className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>No Blogs Found</CardTitle>
              <CardDescription>Create a blog first to publish articles</CardDescription>
            </Card>
          ) : (
            <Tabs defaultValue="drafts" className="space-y-8">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="drafts" className="gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Drafts ({draftArticles.length})
                </TabsTrigger>
                <TabsTrigger value="published" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Published ({publishedArticles.length})
                </TabsTrigger>
              </TabsList>

              {/* Draft Articles Tab */}
              <TabsContent value="drafts" className="space-y-6">
                {draftArticles.length === 0 ? (
                  <Card className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <CardTitle>No Draft Articles</CardTitle>
                    <CardDescription>Create a new article to get started</CardDescription>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {draftArticles.map((article) => (
                      <Card
                        key={article.id}
                        className="hover:shadow-md transition-shadow border-l-4 border-l-amber-500"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <CardTitle className="text-2xl font-serif">
                                {article.title || "Untitled"}
                              </CardTitle>
                              <CardDescription className="text-base">
                                {article.excerpt || article.content?.substring(0, 100) || "No description"}
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              Draft
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            {/* Article Meta */}
                            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/40 rounded-lg">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Created</p>
                                <p className="font-medium">
                                  {new Date(article.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Word Count</p>
                                <p className="font-medium">
                                  {article.content?.split(/\s+/).length || 0} words
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Reading Time</p>
                                <p className="font-medium">
                                  {Math.ceil((article.content?.split(/\s+/).length || 0) / 200)} min
                                </p>
                              </div>
                            </div>

                            {/* Article Actions */}
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                variant="outline"
                                onClick={() => setLocation(`/editor?articleId=${article.id}`)}
                                className="gap-2 flex-1"
                                title="Edit article content"
                              >
                                <PenTool className="h-4 w-4" />
                                Change
                              </Button>

                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingArticleId(article.id);
                                  setEditArticleTitle(article.title);
                                }}
                                className="gap-2 flex-1"
                                title="Edit article title"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Button>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button className="flex-1 gap-2 font-semibold h-11">
                                    <Zap className="h-4 w-4" />
                                    Ready to Publish?
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
                  <Card className="text-center py-12">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <CardTitle>No Published Articles</CardTitle>
                    <CardDescription>Publish your first article to see it here</CardDescription>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {publishedArticles.map((article) => (
                      <Card
                        key={article.id}
                        className="hover:shadow-md transition-shadow border-l-4 border-l-green-500"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <CardTitle className="text-2xl font-serif">
                                {article.title || "Untitled"}
                              </CardTitle>
                              <CardDescription className="text-base">
                                {article.excerpt || article.content?.substring(0, 100) || "No description"}
                              </CardDescription>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              Published
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            {/* Article Meta */}
                            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/40 rounded-lg">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Published</p>
                                <p className="font-medium">
                                  {new Date(article.publishedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Word Count</p>
                                <p className="font-medium">
                                  {article.content?.split(/\s+/).length || 0} words
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Status</p>
                                <p className="font-medium text-green-600 flex items-center gap-1">
                                  <Eye className="h-4 w-4" /> Live
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                              <Button 
                                variant="outline" 
                                className="flex-1 gap-2"
                                onClick={() => setLocation(`/public-blog?blogId=${selectedBlog}`)}
                              >
                                <Eye className="h-4 w-4" />
                                View Published
                              </Button>
                              <Button
                                variant="destructive"
                                className="flex-1 gap-2"
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

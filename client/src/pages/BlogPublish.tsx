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
} from "lucide-react";
import { toast } from "sonner";

export default function BlogPublish() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<string>("");
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split("T")[0]);
  const [publishTime, setPublishTime] = useState("12:00");

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
      setArticles(data || []);
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

  const handlePublish = async (articleId: string) => {
    try {
      setPublishingId(articleId);
      const publishDateTime = new Date(`${publishDate}T${publishTime}`);
      
      await api.updateArticle(articleId, {
        status: "published",
        publishedAt: publishDateTime.toISOString(),
      });
      
      toast.success("Article published successfully!");
      fetchArticles(selectedBlog);
    } catch (error) {
      console.error("Failed to publish article:", error);
      toast.error("Failed to publish article");
    } finally {
      setPublishingId(null);
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
              </div>
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

                            {/* Publish Settings */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="w-full gap-2 font-semibold h-11">
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
                              <Button variant="outline" className="flex-1 gap-2">
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

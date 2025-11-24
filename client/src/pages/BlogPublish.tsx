import { useState, useEffect } from "react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useLocation } from "wouter";
import {
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

export default function BlogPublish() {
  const [, setLocation] = useLocation();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const data = await api.getBlogs();
      setBlogs(data || []);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      let allArticles: any[] = [];
      
      // Fetch articles from all blogs
      for (const blog of blogs) {
        const data = await api.getArticlesByBlogAdmin(blog.id);
        const publishedArticles = (data || []).filter((a: any) => a.status === "published");
        allArticles = [...allArticles, ...publishedArticles.map((a: any) => ({ ...a, blogTitle: blog.title }))];
      }
      
      setArticles(allArticles);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
      toast.error("Failed to load articles");
    }
  };

  useEffect(() => {
    if (blogs.length > 0) {
      fetchArticles();
    }
  }, [blogs]);

  const publishedArticles = (articles || []).filter((a: any) => a.status === "published");

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
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-serif font-bold tracking-tight flex items-center gap-3">
                  Published Articles
                </h1>
                <p className="text-muted-foreground mt-2">
                  View all your published articles across all blogs
                </p>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 py-12">
          {blogs.length === 0 ? (
            <Card className="text-center py-12 border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <CardTitle>No Blogs Found</CardTitle>
              <CardDescription>Create a blog first to see published articles</CardDescription>
            </Card>
          ) : publishedArticles.length === 0 ? (
            <Card className="text-center py-12 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
              <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <CardTitle className="text-green-900 dark:text-green-100">No Published Articles Yet</CardTitle>
              <CardDescription className="text-green-800/70">
                Go to My Blogs and publish an article to see it here
              </CardDescription>
              <Button className="mt-4" onClick={() => setLocation("/my-blogs")}>
                Go to My Blogs
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6">
              {publishedArticles.map((article) => (
                <Card
                  key={article.id}
                  className="hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden"
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
                            <CardDescription className="text-sm mt-1 flex items-center gap-2">
                              <Globe className="h-3 w-3" />
                              {article.blogTitle || "Unknown Blog"}
                            </CardDescription>
                          </div>
                        </div>
                        <CardDescription className="text-sm ml-4 line-clamp-2">
                          {article.excerpt || article.content?.substring(0, 150) || "No description"}
                        </CardDescription>
                      </div>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs font-semibold px-3 py-1">
                        Published
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="space-y-6">
                      {/* Article Meta Stats */}
                      <div className="grid grid-cols-4 gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/40 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                          <p className="text-xs text-blue-600 dark:text-blue-300 uppercase font-bold">Published</p>
                          <p className="font-semibold text-sm mt-1 text-blue-900 dark:text-blue-100">
                            {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                          <p className="font-semibold text-sm mt-1 text-pink-900 dark:text-pink-100">Published</p>
                        </div>
                      </div>

                      {/* Article Actions */}
                      <div className="flex gap-3 pt-3">
                        <Button
                          variant="outline"
                          onClick={() => setLocation(`/public-blog?blogId=${article.blogId}&articleId=${article.id}`)}
                          className="gap-2 flex-1"
                        >
                          <Eye className="h-4 w-4" />
                          View Article
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setLocation(`/editor?articleId=${article.id}`)}
                          className="gap-2 flex-1"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </SidebarLayout>
  );
}

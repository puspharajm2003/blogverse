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
  Grid3x3,
  List,
  Zap,
  TrendingUp,
  Calendar,
  BookOpen,
  Share2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { calculateReadingTime, formatReadingTime } from "@/lib/reading-time";

export default function BlogPublish() {
  const [, setLocation] = useLocation();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
  const totalViews = publishedArticles.reduce((sum, a) => sum + (a.views || 0), 0);
  const avgReadTime = Math.ceil(
    publishedArticles.reduce((sum, a) => sum + calculateReadingTime(a.content || ""), 0) / (publishedArticles.length || 1)
  );

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
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.1); }
          50% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.2); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        .article-card {
          animation: slideInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .article-card:nth-child(1) { animation-delay: 0.05s; }
        .article-card:nth-child(2) { animation-delay: 0.1s; }
        .article-card:nth-child(3) { animation-delay: 0.15s; }
        .article-card:nth-child(4) { animation-delay: 0.2s; }
        .article-card:nth-child(5) { animation-delay: 0.25s; }
        .article-card:nth-child(6) { animation-delay: 0.3s; }

        .card-hover {
          transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
          perspective: 1000px;
        }

        .card-hover:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 
            0 20px 40px -10px rgba(0, 0, 0, 0.1),
            0 20px 50px -15px rgba(34, 197, 94, 0.2);
        }

        .stat-card {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .stat-card:nth-child(1) { animation-delay: 0s; }
        .stat-card:nth-child(2) { animation-delay: 0.1s; }
        .stat-card:nth-child(3) { animation-delay: 0.2s; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        {/* Header Section */}
        <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/10">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h1 className="text-4xl font-serif font-bold tracking-tight">Published Articles</h1>
                </div>
                <p className="text-muted-foreground ml-1">
                  Your live articles across all blogs • Manage and track performance
                </p>
              </div>
              <div className="flex gap-1 items-center">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="transition-all"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="transition-all"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stats Section */}
            {publishedArticles.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                <div className="stat-card p-4 rounded-lg border border-border/30 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Total Published</p>
                  <p className="text-2xl font-bold mt-1 text-green-700 dark:text-green-400">{publishedArticles.length}</p>
                </div>
                <div className="stat-card p-4 rounded-lg border border-border/30 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Total Views</p>
                  <p className="text-2xl font-bold mt-1 text-blue-700 dark:text-blue-400">{totalViews.toLocaleString()}</p>
                </div>
                <div className="stat-card p-4 rounded-lg border border-border/30 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Avg Read Time</p>
                  <p className="text-2xl font-bold mt-1 text-purple-700 dark:text-purple-400">{avgReadTime} min</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          {blogs.length === 0 ? (
            <Card className="text-center py-16 border-0 shadow-sm bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <CardTitle className="text-slate-900 dark:text-slate-100">No Blogs Found</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
                Create a blog first to see published articles
              </CardDescription>
              <Button className="mt-6 gap-2" onClick={() => setLocation("/my-blogs")}>
                <Zap className="h-4 w-4" /> Create Blog
              </Button>
            </Card>
          ) : publishedArticles.length === 0 ? (
            <Card className="text-center py-16 border-0 shadow-sm bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/30">
              <Sparkles className="h-12 w-12 text-green-400 mx-auto mb-4 animate-pulse" />
              <CardTitle className="text-green-900 dark:text-green-100">No Published Articles Yet</CardTitle>
              <CardDescription className="text-green-800/70 dark:text-green-200/60 mt-2">
                Create and publish your first article to see it here
              </CardDescription>
              <Button className="mt-6 gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" onClick={() => setLocation("/editor")}>
                <BookOpen className="h-4 w-4" /> Write Article
              </Button>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedArticles.map((article) => (
                <PublishedArticleCard key={article.id} article={article} setLocation={setLocation} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {publishedArticles.map((article) => (
                <PublishedArticleListItem key={article.id} article={article} setLocation={setLocation} />
              ))}
            </div>
          )}
        </main>
      </div>
    </SidebarLayout>
  );
}

function PublishedArticleCard({ article, setLocation }: any) {
  const readingTime = calculateReadingTime(article.content || "");
  const wordCount = (article.content || "").split(/\s+/).filter((w: string) => w.length > 0).length;

  return (
    <div className="article-card">
      <Card className="card-hover group overflow-hidden h-full flex flex-col border-0 shadow-md hover:shadow-2xl">
        {/* Top Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-green-500/80 to-emerald-500/80" />

        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-green-500/5 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-start justify-between gap-2 mb-3">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 font-semibold gap-1.5 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-3 w-3" />
              Published
            </Badge>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
              Live
            </span>
          </div>
          <h3 className="font-serif text-lg font-bold line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
            {article.title || "Untitled"}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-2">
            <Globe className="h-3 w-3" />
            <span className="font-medium">{article.blogTitle || "Unknown Blog"}</span>
          </p>
        </CardHeader>

        <CardContent className="flex-1 pb-4 relative z-10">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {article.excerpt || article.content?.substring(0, 100) || "No description"}
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded bg-muted/50 text-center">
              <p className="text-muted-foreground font-semibold text-xs">Views</p>
              <p className="font-bold text-foreground">{(article.views || 0).toLocaleString()}</p>
            </div>
            <div className="p-2 rounded bg-muted/50 text-center">
              <p className="text-muted-foreground font-semibold text-xs">Words</p>
              <p className="font-bold text-foreground">{wordCount.toLocaleString()}</p>
            </div>
            <div className="p-2 rounded bg-muted/50 text-center">
              <p className="text-muted-foreground font-semibold text-xs">Read</p>
              <p className="font-bold text-foreground">{formatReadingTime(readingTime)}</p>
            </div>
          </div>
        </CardContent>

        <div className="border-t border-border/30 px-6 py-4 relative z-10 space-y-3">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Published {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 border-border/50 hover:border-green-500/50 hover:bg-green-500/5 transition-all"
              onClick={() => setLocation(`/public-blog?blogId=${article.blogId}&articleId=${article.id}`)}
              data-testid={`button-view-published-${article.id}`}
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={() => setLocation(`/editor?articleId=${article.id}`)}
              data-testid={`button-edit-published-${article.id}`}
            >
              Edit
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PublishedArticleListItem({ article, setLocation }: any) {
  const readingTime = calculateReadingTime(article.content || "");
  const wordCount = (article.content || "").split(/\s+/).filter((w: string) => w.length > 0).length;

  return (
    <div className="article-card">
      <Card className="card-hover group overflow-hidden border-0 shadow-md hover:shadow-xl bg-gradient-to-r from-green-500/5 to-transparent transition-all">
        {/* Top Accent */}
        <div className="h-0.5 bg-gradient-to-r from-green-500/80 to-emerald-500/80" />

        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-6">
            {/* Left Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 font-semibold whitespace-nowrap">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Published
                </Badge>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                  Live
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold line-clamp-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {article.title || "Untitled"}
              </h3>

              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap mt-3">
                <span className="flex items-center gap-1.5 bg-muted/50 rounded px-3 py-1">
                  <Globe className="h-3.5 w-3.5" />
                  {article.blogTitle}
                </span>
                <span className="flex items-center gap-1.5 bg-muted/50 rounded px-3 py-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {wordCount.toLocaleString()} words
                </span>
                <span className="flex items-center gap-1.5 bg-muted/50 rounded px-3 py-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {(article.views || 0).toLocaleString()} views
                </span>
                <span className="flex items-center gap-1.5 bg-muted/50 rounded px-3 py-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-1 mt-2 group-hover:text-muted-foreground/80 transition-colors">
                {article.excerpt || article.content?.substring(0, 150) || "No description"}
              </p>
            </div>

            {/* Right Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-border/50 hover:border-green-500/50 hover:bg-green-500/5 transition-all"
                onClick={() => setLocation(`/public-blog?blogId=${article.blogId}&articleId=${article.id}`)}
                data-testid={`button-view-published-list-${article.id}`}
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
                onClick={() => setLocation(`/editor?articleId=${article.id}`)}
                data-testid={`button-edit-published-list-${article.id}`}
              >
                Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

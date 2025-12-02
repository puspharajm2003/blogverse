import { useState, useEffect } from 'react';
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "wouter";
import { 
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Grid3x3,
  List,
  Globe,
  Calendar,
  BookOpen,
  CheckCircle2,
  Clock,
  RefreshCw,
  TrendingUp,
  Zap,
  Share2,
  MoreVertical,
  ArrowRight,
  Sparkles,
  Pencil,
  Wand2,
  Loader
} from "lucide-react";
import { api } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { calculateReadingTime, formatReadingTime } from "@/lib/reading-time";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuickEditModal } from "@/components/QuickEditModal";

interface Article {
  id: string;
  blogId: string;
  blogTitle: string;
  title: string;
  content?: string;
  excerpt?: string;
  status: string;
  createdAt: string;
  publishedAt?: string;
  tags?: string[];
}

interface Blog {
  id: string;
  title: string;
}

export default function MyArticles() {
  const [, setLocation] = useLocation();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [blogFilter, setBlogFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "views">("recent");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsRefreshing(true);
      const blogsData = await api.getBlogs();
      const blogsArray = Array.isArray(blogsData) ? blogsData : [];
      setBlogs(blogsArray);

      // Fetch all articles in parallel for speed
      const articlesPromises = blogsArray.map(blog => 
        api.getArticlesByBlogAdmin(blog.id).then(data => ({
          blog,
          data: Array.isArray(data) ? data.filter((a: any) => a.status !== "deleted") : []
        }))
      );
      
      const allResults = await Promise.all(articlesPromises);
      const allArticlesData: Article[] = allResults.flatMap(result =>
        result.data.map((a: any) => ({
          ...a,
          blogTitle: result.blog.title,
        }))
      );

      setAllArticles(allArticlesData);
      filterAndSortArticles(allArticlesData, searchQuery, activeTab, blogFilter, sortBy);
    } catch (error) {
      console.error("Failed to load articles:", error);
      toast.error("Failed to load articles");
      setBlogs([]);
      setAllArticles([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterAndSortArticles = (
    articles: Article[],
    search: string,
    tab: string,
    blog: string,
    sort: string
  ) => {
    let filtered = articles;

    // Search filter
    if (search.trim()) {
      filtered = filtered.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.excerpt?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Tab filter
    if (tab === "published") {
      filtered = filtered.filter((a) => a.status === "published");
    } else if (tab === "draft") {
      filtered = filtered.filter((a) => a.status === "draft");
    } else if (tab === "scheduled") {
      filtered = filtered.filter((a) => a.status === "scheduled");
    }

    // Blog filter
    if (blog !== "all") {
      filtered = filtered.filter((a) => a.blogId === blog);
    }

    // Sorting
    if (sort === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === "views") {
      // Sort by title for now as placeholder
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredArticles(filtered);
  };

  useEffect(() => {
    filterAndSortArticles(allArticles, searchQuery, activeTab, blogFilter, sortBy);
  }, [searchQuery, activeTab, blogFilter, sortBy, allArticles]);

  const stats = {
    total: allArticles.length,
    published: allArticles.filter((a) => a.status === "published").length,
    draft: allArticles.filter((a) => a.status === "draft").length,
    scheduled: allArticles.filter((a) => a.status === "scheduled").length,
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
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes shimmer {
          0%, 100% { background-position: 200% center; }
          50% { background-position: -200% center; }
        }

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

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.1); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
        }

        @keyframes parallax-bg-1 {
          0% { transform: translateY(0px); }
          100% { transform: translateY(40px); }
        }

        @keyframes parallax-bg-2 {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-30px); }
        }

        @keyframes parallax-bg-3 {
          0% { transform: translateY(0px); }
          100% { transform: translateY(50px); }
        }

        .parallax-container {
          overflow: hidden;
          position: relative;
        }

        .parallax-element-1 {
          position: fixed;
          top: 10%;
          left: 5%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          blur: 40px;
          animation: parallax-bg-1 20s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
        }

        .parallax-element-2 {
          position: fixed;
          bottom: 15%;
          right: 5%;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          animation: parallax-bg-2 25s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
        }

        .parallax-element-3 {
          position: fixed;
          top: 50%;
          right: 10%;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          animation: parallax-bg-3 30s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
        }

        .article-card {
          animation: slideInUp 0.5s ease-out forwards;
          opacity: 0;
          position: relative;
          z-index: 10;
        }

        .article-card:nth-child(1) { animation-delay: 0.05s; }
        .article-card:nth-child(2) { animation-delay: 0.1s; }
        .article-card:nth-child(3) { animation-delay: 0.15s; }
        .article-card:nth-child(4) { animation-delay: 0.2s; }
        .article-card:nth-child(5) { animation-delay: 0.25s; }
        .article-card:nth-child(6) { animation-delay: 0.3s; }

        .card-parallax {
          transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
          perspective: 1000px;
        }

        .card-parallax:hover {
          transform: translateY(-12px) rotateX(5deg);
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 25px 50px -12px rgba(59, 130, 246, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .stat-card-glow {
          animation: glow 3s ease-in-out infinite;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .dark .glass-effect {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.1);
        }

        .gradient-text {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Parallax Background Elements */}
      <div className="parallax-element-1" />
      <div className="parallax-element-2" />
      <div className="parallax-element-3" />

      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        {/* Header */}
        <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                    <BookOpen className="h-7 w-7 text-primary" />
                  </div>
                  <h1 className="text-4xl font-serif font-bold tracking-tight">My Articles</h1>
                </div>
                <p className="text-muted-foreground mt-2">
                  Manage and track all your published articles across {blogs.length} blog{blogs.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Link href="/editor">
                <Button className="gap-2 h-11 px-6 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all">
                  <Plus className="h-5 w-5" /> Write New Article
                </Button>
              </Link>
            </div>

            {/* Stats Grid with Enhanced Design */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Total Articles"
                value={stats.total}
                icon={<BookOpen className="h-5 w-5" />}
                gradient="from-blue-50 via-blue-100/30 to-blue-50 dark:from-blue-950/30 dark:via-blue-900/20 dark:to-blue-950/30"
                textColor="text-blue-600 dark:text-blue-400"
                borderColor="border-blue-200/50 dark:border-blue-800/30"
              />
              <StatCard
                label="Published"
                value={stats.published}
                icon={<CheckCircle2 className="h-5 w-5" />}
                gradient="from-green-50 via-green-100/30 to-green-50 dark:from-green-950/30 dark:via-green-900/20 dark:to-green-950/30"
                textColor="text-green-600 dark:text-green-400"
                borderColor="border-green-200/50 dark:border-green-800/30"
              />
              <StatCard
                label="Drafts"
                value={stats.draft}
                icon={<Clock className="h-5 w-5" />}
                gradient="from-amber-50 via-amber-100/30 to-amber-50 dark:from-amber-950/30 dark:via-amber-900/20 dark:to-amber-950/30"
                textColor="text-amber-600 dark:text-amber-400"
                borderColor="border-amber-200/50 dark:border-amber-800/30"
              />
              <StatCard
                label="Scheduled"
                value={stats.scheduled}
                icon={<Zap className="h-5 w-5" />}
                gradient="from-purple-50 via-purple-100/30 to-purple-50 dark:from-purple-950/30 dark:via-purple-900/20 dark:to-purple-950/30"
                textColor="text-purple-600 dark:text-purple-400"
                borderColor="border-purple-200/50 dark:border-purple-800/30"
              />
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative group">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Search articles by title or content..."
                  className="pl-11 h-11 text-base transition-all border-border/40 focus:border-primary/50 focus:shadow-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-articles"
                />
              </div>

              {/* Filters & View Toggle */}
              <div className="flex gap-3 items-center flex-wrap">
                <Select value={blogFilter} onValueChange={setBlogFilter}>
                  <SelectTrigger className="w-48 border-border/40 hover:border-border/60 transition-colors">
                    <Globe className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Blogs</SelectItem>
                    {blogs.map((blog) => (
                      <SelectItem key={blog.id} value={blog.id}>
                        {blog.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-48 border-border/40 hover:border-border/60 transition-colors">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="views">Most Views</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-1 ml-auto">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    data-testid="button-grid-view"
                    className="transition-all"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    data-testid="button-list-view"
                    className="transition-all"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={loadData}
                    disabled={isRefreshing}
                    data-testid="button-refresh"
                    className="transition-all"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Content */}
        <main className="p-8 max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/50 border border-border/40 p-1 rounded-lg">
              <TabsTrigger value="all" className="gap-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-md">
                <BookOpen className="h-4 w-4" />
                All ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="published" className="gap-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-md">
                <CheckCircle2 className="h-4 w-4" />
                Published ({stats.published})
              </TabsTrigger>
              <TabsTrigger value="draft" className="gap-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-md">
                <Clock className="h-4 w-4" />
                Drafts ({stats.draft})
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="gap-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-md">
                <Zap className="h-4 w-4" />
                Scheduled ({stats.scheduled})
              </TabsTrigger>
            </TabsList>

            {["all", "published", "draft", "scheduled"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {filteredArticles.length === 0 ? (
                  <EmptyState activeTab={activeTab} />
                ) : viewMode === "grid" ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map((article) => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        setLocation={setLocation}
                        onRefresh={loadData}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredArticles.map((article) => (
                      <ArticleListItem 
                        key={article.id} 
                        article={article} 
                        setLocation={setLocation}
                        onRefresh={loadData}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>
    </SidebarLayout>
  );
}

function StatCard({ label, value, icon, gradient, textColor, borderColor }: any) {
  return (
    <Card className={`border ${borderColor} shadow-sm bg-gradient-to-br ${gradient} hover:shadow-lg hover:border-primary/30 transition-all duration-300 group cursor-default`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{label}</p>
            <p className={`text-4xl font-bold mt-2 ${textColor} group-hover:scale-110 transition-transform duration-300`}>{value}</p>
          </div>
          <div className={`p-4 rounded-xl ${textColor} bg-current/10 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ activeTab }: { activeTab: string }) {
  const messages = {
    all: { title: "No articles yet", desc: "Create your first article to get started" },
    published: { title: "No published articles", desc: "Publish an article to see it here" },
    draft: { title: "No drafts", desc: "Start writing your first draft" },
    scheduled: { title: "No scheduled articles", desc: "Schedule an article for later publication" },
  };

  const msg = messages[activeTab as keyof typeof messages] || messages.all;

  return (
    <Card className="text-center py-16 border-0 shadow-sm bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
      <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4 animate-pulse" />
      <CardTitle className="text-slate-900 dark:text-slate-100">{msg.title}</CardTitle>
      <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
        {msg.desc}
      </CardDescription>
      <Link href="/editor">
        <Button className="mt-6 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
          <Plus className="h-4 w-4" /> Write Article
        </Button>
      </Link>
    </Card>
  );
}

function ArticleCard({ article, setLocation, onRefresh }: any) {
  const [quickEditOpen, setQuickEditOpen] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const readingTime = calculateReadingTime(article.content || "");
  const wordCount = (article.content || "").split(/\s+/).filter((w: string) => w.length > 0).length;

  const handleGenerateTags = async () => {
    if (!article.content) {
      toast.error("Article has no content to analyze");
      return;
    }

    setGeneratingTags(true);
    try {
      const response = await api.generateBlogContent(article.content, "tags");
      const tagsText = response.text || "";
      const newTags = tagsText
        .split(/[,\n]/)
        .map((tag: string) => tag.trim().replace(/^#/, "").toLowerCase())
        .filter((tag: string) => tag.length > 0)
        .slice(0, 8);

      if (newTags.length > 0) {
        await api.updateArticle(article.id, { tags: newTags });
        toast.success(`Generated ${newTags.length} tags!`);
        onRefresh();
      } else {
        toast.error("No tags generated");
      }
    } catch (error) {
      console.error("Failed to generate tags:", error);
      toast.error("Failed to generate tags");
    } finally {
      setGeneratingTags(false);
    }
  };

  const statusConfig = {
    published: { 
      badge: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-800/50",
      gradient: "from-green-500/20 to-transparent"
    },
    draft: { 
      badge: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50",
      gradient: "from-amber-500/20 to-transparent"
    },
    scheduled: { 
      badge: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50",
      gradient: "from-purple-500/20 to-transparent"
    }
  };

  const config = statusConfig[article.status as keyof typeof statusConfig] || statusConfig.draft;

  return (
    <div className="article-card">
      <Card className={`card-parallax group hover:z-10 overflow-hidden h-full flex flex-col border-0 shadow-md hover:shadow-2xl`}>
        {/* Gradient Header */}
        <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />

        {/* Top Accent */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-start justify-between gap-2 mb-4">
            <Badge
              variant="outline"
              className={`${config.badge} border transition-all group-hover:scale-110 font-semibold`}
            >
              {article.status === "published" ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              ) : article.status === "scheduled" ? (
                <Zap className="h-3 w-3 mr-1" />
              ) : (
                <Clock className="h-3 w-3 mr-1" />
              )}
              {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
            </Badge>
            {article.status === "published" && (
              <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            )}
          </div>
          <h3 className="font-serif text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors group-hover:drop-shadow-sm">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors">
            <Globe className="h-3.5 w-3.5" />
            <span className="font-medium">{article.blogTitle}</span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-4 relative z-10">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 group-hover:text-muted-foreground/80 transition-colors">
            {article.excerpt || article.content?.substring(0, 100) || "No description"}
          </p>
          
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {article.tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary dark:text-primary-foreground hover:bg-primary/20 transition-colors">
                  #{tag}
                </Badge>
              ))}
              {article.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                  +{article.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <div className="border-t border-border/50 px-6 py-5 space-y-4 relative z-10">
          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground/70 transition-colors bg-muted/50 rounded-lg px-2 py-2">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="font-medium">{formatReadingTime(readingTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground/70 transition-colors bg-muted/50 rounded-lg px-2 py-2">
              <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="font-medium truncate">{wordCount} w</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground/70 transition-colors bg-muted/50 rounded-lg px-2 py-2">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="font-medium">{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 group/btn border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={() => setLocation(`/editor?articleId=${article.id}`)}
              data-testid={`button-edit-article-${article.id}`}
            >
              <Edit2 className="h-4 w-4 group-hover/btn:text-primary transition-colors" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 group/btn border-border/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
              onClick={handleGenerateTags}
              disabled={generatingTags}
              data-testid={`button-generate-tags-${article.id}`}
              title="Generate AI tags"
            >
              {generatingTags ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 group-hover/btn:text-purple-600 transition-colors" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 group/btn border-border/50 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
              onClick={() => setQuickEditOpen(true)}
              data-testid={`button-quick-edit-${article.id}`}
              title="Quick edit title and tags"
            >
              <Pencil className="h-4 w-4 group-hover/btn:text-amber-600 transition-colors" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-muted/80 transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setLocation(`/draft-preview/${article.id}`)} className="gap-2 cursor-pointer">
                  <Eye className="h-4 w-4" />
                  View Article
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/draft-preview/${article.id}`);
                  toast.success("Link copied!");
                }} className="gap-2 cursor-pointer">
                  <Share2 className="h-4 w-4" />
                  Copy Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <QuickEditModal
          open={quickEditOpen}
          onOpenChange={setQuickEditOpen}
          article={article}
          onSave={onRefresh}
        />
      </Card>
    </div>
  );
}

function ArticleListItem({ article, setLocation, onRefresh }: any) {
  const readingTime = calculateReadingTime(article.content || "");
  const wordCount = (article.content || "").split(/\s+/).filter((w: string) => w.length > 0).length;

  const statusConfig = {
    published: { 
      badge: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-800/50",
      bgGradient: "from-green-500/5 to-transparent"
    },
    draft: { 
      badge: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50",
      bgGradient: "from-amber-500/5 to-transparent"
    },
    scheduled: { 
      badge: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50",
      bgGradient: "from-purple-500/5 to-transparent"
    }
  };

  const config = statusConfig[article.status as keyof typeof statusConfig] || statusConfig.draft;

  return (
    <div className="article-card">
      <Card className={`card-parallax group hover:z-10 overflow-hidden border-0 shadow-md hover:shadow-xl bg-gradient-to-r ${config.bgGradient} transition-all`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-6">
            {/* Left Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <Badge
                  variant="outline"
                  className={`${config.badge} border font-semibold whitespace-nowrap transition-all group-hover:scale-105`}
                >
                  {article.status === "published" ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : article.status === "scheduled" ? (
                    <Zap className="h-3 w-3 mr-1" />
                  ) : (
                    <Clock className="h-3 w-3 mr-1" />
                  )}
                  {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                </Badge>
                <h3 className="font-serif text-lg font-semibold line-clamp-1 hover:text-primary transition-colors cursor-pointer group-hover:drop-shadow-sm">
                  {article.title}
                </h3>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap mb-3 group-hover:text-muted-foreground/80 transition-colors">
                <span className="flex items-center gap-1.5 bg-muted/50 rounded-lg px-3 py-1">
                  <Globe className="h-3.5 w-3.5" />
                  {article.blogTitle}
                </span>
                <span className="flex items-center gap-1.5 bg-muted/50 rounded-lg px-3 py-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatReadingTime(readingTime)}
                </span>
                <span className="flex items-center gap-1.5 bg-muted/50 rounded-lg px-3 py-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {wordCount} words
                </span>
                <span className="flex items-center gap-1.5 bg-muted/50 rounded-lg px-3 py-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                </span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-1 group-hover:text-muted-foreground/80 transition-colors">
                {article.excerpt || article.content?.substring(0, 150) || "No description"}
              </p>

              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {article.tags.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary dark:text-primary-foreground hover:bg-primary/20 transition-colors">
                      #{tag}
                    </Badge>
                  ))}
                  {article.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                      +{article.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group/btn"
                onClick={() => setLocation(`/editor?articleId=${article.id}`)}
                data-testid={`button-edit-article-${article.id}`}
              >
                <Edit2 className="h-4 w-4 group-hover/btn:text-primary transition-colors" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-muted/80 transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setLocation(`/draft-preview/${article.id}`)} className="gap-2 cursor-pointer">
                    <Eye className="h-4 w-4" />
                    View Article
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/draft-preview/${article.id}`);
                    toast.success("Link copied!");
                  }} className="gap-2 cursor-pointer">
                    <Share2 className="h-4 w-4" />
                    Copy Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
  MoreVertical
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

      let allArticlesData: Article[] = [];
      if (Array.isArray(blogsArray)) {
        for (const blog of blogsArray) {
          try {
            const data = await api.getArticlesByBlogAdmin(blog.id);
            const activeArticles = Array.isArray(data) ? data.filter((a: any) => a.status !== "deleted") : [];
            allArticlesData = [
              ...allArticlesData,
              ...activeArticles.map((a: any) => ({
                ...a,
                blogTitle: blog.title,
              })),
            ];
          } catch (err) {
            console.warn(`Failed to load articles for blog ${blog.id}:`, err);
          }
        }
      }

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        {/* Header */}
        <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-serif font-bold tracking-tight flex items-center gap-3">
                  <BookOpen className="h-9 w-9 text-primary" />
                  My Articles
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage and track all your articles across {blogs.length} blog{blogs.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Link href="/editor">
                <Button className="gap-2 h-10 px-6 text-base">
                  <Plus className="h-5 w-5" /> Write New
                </Button>
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Total Articles"
                value={stats.total}
                icon={<BookOpen className="h-5 w-5" />}
                gradient="from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/40"
                textColor="text-blue-600 dark:text-blue-400"
              />
              <StatCard
                label="Published"
                value={stats.published}
                icon={<CheckCircle2 className="h-5 w-5" />}
                gradient="from-green-50 to-green-100/50 dark:from-green-950/40 dark:to-green-900/40"
                textColor="text-green-600 dark:text-green-400"
              />
              <StatCard
                label="Drafts"
                value={stats.draft}
                icon={<Clock className="h-5 w-5" />}
                gradient="from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/40"
                textColor="text-amber-600 dark:text-amber-400"
              />
              <StatCard
                label="Scheduled"
                value={stats.scheduled}
                icon={<Zap className="h-5 w-5" />}
                gradient="from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/40"
                textColor="text-purple-600 dark:text-purple-400"
              />
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles by title or content..."
                  className="pl-11 h-10 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-articles"
                />
              </div>

              {/* Filters & View Toggle */}
              <div className="flex gap-3 items-center flex-wrap">
                <Select value={blogFilter} onValueChange={setBlogFilter}>
                  <SelectTrigger className="w-48">
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
                  <SelectTrigger className="w-48">
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
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    data-testid="button-list-view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={loadData}
                    disabled={isRefreshing}
                    data-testid="button-refresh"
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
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="all" className="gap-2">
                <BookOpen className="h-4 w-4" />
                All ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="published" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Published ({stats.published})
              </TabsTrigger>
              <TabsTrigger value="draft" className="gap-2">
                <Clock className="h-4 w-4" />
                Drafts ({stats.draft})
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="gap-2">
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

function StatCard({ label, value, icon, gradient, textColor }: any) {
  return (
    <Card className={`border-0 shadow-sm bg-gradient-to-br ${gradient} hover:shadow-md transition-all`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-2 ${textColor}`}>{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${textColor} bg-current/10`}>
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
      <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
      <CardTitle className="text-slate-900 dark:text-slate-100">{msg.title}</CardTitle>
      <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
        {msg.desc}
      </CardDescription>
      <Link href="/editor">
        <Button className="mt-6 gap-2">
          <Plus className="h-4 w-4" /> Write Article
        </Button>
      </Link>
    </Card>
  );
}

function ArticleCard({ article, setLocation, onRefresh }: any) {
  const readingTime = calculateReadingTime(article.content || "");
  const wordCount = (article.content || "").split(/\s+/).filter((w: string) => w.length > 0).length;

  const statusColor = {
    published: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-800/50",
    draft: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50",
    scheduled: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50"
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col border-0 shadow-sm">
      {/* Header with gradient accent */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge
            variant="outline"
            className={statusColor[article.status as keyof typeof statusColor] || statusColor.draft}
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
        </div>
        <h3 className="font-serif text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <Globe className="h-3 w-3" />
          <span className="font-medium">{article.blogTitle}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {article.excerpt || article.content?.substring(0, 100) || "No description"}
        </p>
        
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {article.tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {article.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{article.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <div className="border-t border-border/50 px-6 py-4 space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatReadingTime(readingTime)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            <span>{wordCount} words</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => setLocation(`/editor?articleId=${article.id}`)}
            data-testid={`button-edit-article-${article.id}`}
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLocation(`/draft-preview/${article.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Draft
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/draft-preview/${article.id}`);
                toast.success("Link copied!");
              }}>
                <Share2 className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}

function ArticleListItem({ article, setLocation, onRefresh }: any) {
  const readingTime = calculateReadingTime(article.content || "");
  const wordCount = (article.content || "").split(/\s+/).filter((w: string) => w.length > 0).length;

  const statusColor = {
    published: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-800/50",
    draft: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50",
    scheduled: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50"
  };

  return (
    <Card className="hover:shadow-md transition-all duration-300 border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-6">
          {/* Left Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Badge
                variant="outline"
                className={statusColor[article.status as keyof typeof statusColor] || statusColor.draft}
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
              <h3 className="font-serif text-lg font-semibold line-clamp-1 hover:text-primary transition-colors cursor-pointer">
                {article.title}
              </h3>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap mb-2">
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {article.blogTitle}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatReadingTime(readingTime)}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {wordCount} words
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
              </span>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-1">
              {article.excerpt || article.content?.substring(0, 150) || "No description"}
            </p>

            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {article.tags.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {article.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
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
              onClick={() => setLocation(`/editor?articleId=${article.id}`)}
              data-testid={`button-edit-article-${article.id}`}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocation(`/draft-preview/${article.id}`)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Draft
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/draft-preview/${article.id}`);
                  toast.success("Link copied!");
                }}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

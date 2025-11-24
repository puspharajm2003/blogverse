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
  RefreshCw
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
  seoTitle?: string;
  seoDescription?: string;
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
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [blogFilter, setBlogFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "title">("recent");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsRefreshing(true);
      const blogsData = await api.getBlogs();
      setBlogs(blogsData || []);

      let allArticlesData: Article[] = [];
      for (const blog of blogsData) {
        const data = await api.getArticlesByBlogAdmin(blog.id);
        const activeArticles = (data || []).filter((a: any) => a.status !== "deleted");
        allArticlesData = [
          ...allArticlesData,
          ...activeArticles.map((a: any) => ({
            ...a,
            blogTitle: blog.title,
          })),
        ];
      }

      setAllArticles(allArticlesData);
      filterAndSortArticles(allArticlesData, searchQuery, statusFilter, blogFilter, sortBy);
    } catch (error) {
      console.error("Failed to load articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterAndSortArticles = (
    articles: Article[],
    search: string,
    status: string,
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

    // Status filter
    if (status !== "all") {
      filtered = filtered.filter((a) => a.status === status);
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
    } else if (sort === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredArticles(filtered);
  };

  useEffect(() => {
    filterAndSortArticles(allArticles, searchQuery, statusFilter, blogFilter, sortBy);
  }, [searchQuery, statusFilter, blogFilter, sortBy, allArticles]);

  const draftCount = allArticles.filter((a) => a.status === "draft").length;
  const publishedCount = allArticles.filter((a) => a.status === "published").length;

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
        {/* Header */}
        <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-serif font-bold tracking-tight flex items-center gap-3">
                  <BookOpen className="h-9 w-9 text-primary" />
                  My Articles
                </h1>
                <p className="text-muted-foreground mt-2">
                  View all {allArticles.length} article{allArticles.length !== 1 ? "s" : ""} across your blogs
                </p>
              </div>
              <Link href="/editor">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Write New
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Total Articles</p>
                  <p className="text-3xl font-bold mt-2">{allArticles.length}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/30">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Drafts</p>
                  <p className="text-3xl font-bold mt-2 text-amber-600 dark:text-amber-400">{draftCount}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/30">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Published</p>
                  <p className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">{publishedCount}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/30">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Blogs</p>
                  <p className="text-3xl font-bold mt-2 text-purple-600 dark:text-purple-400">{blogs.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles by title..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters & View Toggle */}
              <div className="flex gap-3 items-center flex-wrap">
                <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Drafts</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={blogFilter} onValueChange={setBlogFilter}>
                  <SelectTrigger className="w-40">
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
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="title">By Title (A-Z)</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-1 ml-auto">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={loadData}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="p-8 max-w-7xl mx-auto">
          {filteredArticles.length === 0 ? (
            <Card className="text-center py-16 border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <CardTitle className="text-slate-900 dark:text-slate-100">No articles found</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
                {searchQuery || statusFilter !== "all" || blogFilter !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "Create your first article to get started"}
              </CardDescription>
              {!searchQuery && statusFilter === "all" && blogFilter === "all" && (
                <Link href="/editor">
                  <Button className="mt-4">Write First Article</Button>
                </Link>
              )}
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} setLocation={setLocation} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <ArticleListItem key={article.id} article={article} setLocation={setLocation} />
              ))}
            </div>
          )}
        </main>
      </div>
    </SidebarLayout>
  );
}

function ArticleCard({ article, setLocation }: { article: Article; setLocation: any }) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge
            variant={article.status === "published" ? "default" : "secondary"}
            className="text-xs"
          >
            {article.status === "published" ? (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            ) : (
              <Clock className="h-3 w-3 mr-1" />
            )}
            {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2 text-lg">{article.title}</CardTitle>
        <CardDescription className="flex items-center gap-2 mt-1 text-xs">
          <Globe className="h-3 w-3" />
          {article.blogTitle}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {article.excerpt || article.content?.substring(0, 100) || "No description"}
        </p>
      </CardContent>

      <div className="border-t border-border/50 px-6 py-3 space-y-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(article.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div>
            {(article.content?.split(/\s+/).length || 0).toLocaleString()} words
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => setLocation(`/editor?articleId=${article.id}`)}
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation(`/public-blog?articleId=${article.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ArticleListItem({ article, setLocation }: { article: Article; setLocation: any }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <Badge
                variant={article.status === "published" ? "default" : "secondary"}
                className="text-xs"
              >
                {article.status === "published" ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <Clock className="h-3 w-3 mr-1" />
                )}
                {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
              </Badge>
              <h3 className="font-serif text-lg font-semibold line-clamp-1">{article.title}</h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {article.blogTitle}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(article.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              <span>{(article.content?.split(/\s+/).length || 0).toLocaleString()} words</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {article.excerpt || article.content?.substring(0, 150) || "No description"}
            </p>
          </div>

          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation(`/editor?articleId=${article.id}`)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation(`/public-blog?articleId=${article.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

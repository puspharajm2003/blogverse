import { useState, useEffect } from "react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import {
  TrendingUp,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Loader2,
  AlertCircle,
  Globe,
  ArrowUp,
  ArrowDown,
  Zap,
  Users,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

// Advanced mock data
const mockViewsData = [
  { date: "Mon", views: 120, likes: 25, shares: 10 },
  { date: "Tue", views: 180, likes: 35, shares: 15 },
  { date: "Wed", views: 250, likes: 52, shares: 22 },
  { date: "Thu", views: 220, likes: 48, shares: 18 },
  { date: "Fri", views: 300, likes: 68, shares: 28 },
  { date: "Sat", views: 280, likes: 62, shares: 25 },
  { date: "Sun", views: 350, likes: 85, shares: 35 },
];

const COLORS = ["#3b82f6", "#ec4899", "#f59e0b", "#10b981"];

export default function ArticlePerformance() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [viewMode, setViewMode] = useState<"all-blogs" | "single">("all-blogs");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const data = await api.getBlogs();
      setBlogs(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
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
      const published = (Array.isArray(data) ? data : []).filter((a: any) => a.status === "published");
      setArticles(published);
      if (published.length > 0) {
        setSelectedArticle(published[0].id);
      }
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

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SidebarLayout>
    );
  }

  const selectedBlogData = blogs.find((b) => b.id === selectedBlog);

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
        {/* Header Section */}
        <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-serif font-bold tracking-tight flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  Performance Analytics
                </h1>
                <p className="text-muted-foreground mt-2">
                  Advanced insights into your blog performance and reader engagement
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "all-blogs" ? "default" : "outline"}
                  onClick={() => setViewMode("all-blogs")}
                  className="gap-2"
                >
                  <Globe className="h-4 w-4" />
                  All Blogs
                </Button>
                <Button
                  variant={viewMode === "single" ? "default" : "outline"}
                  onClick={() => setViewMode("single")}
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Article Analytics
                </Button>
              </div>

              {/* Blog Selector for Single Mode */}
              {viewMode === "single" && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-muted-foreground block mb-2">Select Blog</span>
                    <Select value={selectedBlog} onValueChange={handleBlogChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {blogs.map((blog) => (
                          <SelectItem key={blog.id} value={blog.id}>
                            {blog.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {articles.length > 0 && (
                    <div className="flex-1">
                      <span className="text-sm font-medium text-muted-foreground block mb-2">Select Article</span>
                      <Select value={selectedArticle} onValueChange={setSelectedArticle}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {articles.map((article) => (
                            <SelectItem key={article.id} value={article.id}>
                              {article.title || "Untitled"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 py-12">
          {viewMode === "all-blogs" ? (
            // All Blogs View
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-serif font-bold mb-4">All Blogs Overview</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogs.length === 0 ? (
                    <Card className="col-span-full text-center py-12">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <CardTitle>No Blogs Found</CardTitle>
                      <CardDescription>Create a blog to see analytics</CardDescription>
                    </Card>
                  ) : (
                    blogs.map((blog) => (
                      <Card key={blog.id} className="hover:shadow-lg transition-all group cursor-pointer border-l-4 border-l-primary/30">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <CardTitle className="font-serif text-lg line-clamp-2">{blog.title}</CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-2">
                                <Globe className="h-3 w-3" /> {blog.slug}
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="whitespace-nowrap">
                              {blog.status === "active" ? "Active" : "Draft"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                            <div>
                              <p className="text-2xl font-bold text-primary">2.4K</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Eye className="h-3 w-3" /> Total Views
                              </p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-pink-500">128</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Heart className="h-3 w-3" /> Total Likes
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-lg font-bold text-amber-500">24</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Share2 className="h-3 w-3" /> Shares
                              </p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-green-500">12</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" /> Articles
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => {
                              setViewMode("single");
                              setSelectedBlog(blog.id);
                              fetchArticles(blog.id);
                            }}
                          >
                            View Details →
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Overall Stats */}
              {blogs.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif font-bold">Overall Metrics</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: "Total Views", value: "8,234", icon: Eye, trend: "+12%", color: "blue" },
                      { label: "Total Likes", value: "1,456", icon: Heart, trend: "+8%", color: "pink" },
                      { label: "Total Shares", value: "892", icon: Share2, trend: "+5%", color: "amber" },
                      { label: "Total Articles", icon: MessageCircle, value: blogs.length * 3, trend: "+2", color: "green" },
                    ].map((stat, i) => (
                      <Card key={i} className={`border-l-4 border-l-${stat.color}-500`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <stat.icon className="h-4 w-4" />
                            {stat.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{stat.value}</div>
                          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <ArrowUp className="h-3 w-3" /> {stat.trend}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Single Blog Analytics View
            <div className="space-y-8">
              {articles.length === 0 ? (
                <Card className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <CardTitle>No Published Articles</CardTitle>
                  <CardDescription>Publish an article first to see performance metrics</CardDescription>
                </Card>
              ) : (
                <>
                  {/* Key Metrics Cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: "Total Views", value: "1,850", icon: Eye, trend: "+12%", color: "blue" },
                      { label: "Likes", value: "243", icon: Heart, trend: "+8%", color: "pink" },
                      { label: "Shares", value: "127", icon: Share2, trend: "+5%", color: "amber" },
                      { label: "Avg. Reading Time", value: "4.2m", icon: Clock, trend: "+0.3m", color: "green" },
                    ].map((stat, i) => (
                      <Card key={i} className={`border-l-4 border-l-${stat.color}-500 hover:shadow-md transition-all`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <stat.icon className="h-4 w-4" />
                            {stat.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{stat.value}</div>
                          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <ArrowUp className="h-3 w-3" /> {stat.trend}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Charts */}
                  <Tabs defaultValue="trends" className="space-y-6">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                      <TabsTrigger value="trends">Trends</TabsTrigger>
                      <TabsTrigger value="comparison">Comparison</TabsTrigger>
                      <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                    </TabsList>

                    {/* Trends Tab */}
                    <TabsContent value="trends">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-primary" />
                            Performance Trends (Last 7 Days)
                          </CardTitle>
                          <CardDescription>
                            Views, likes, and shares over time
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={mockViewsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis dataKey="date" stroke="#888" />
                              <YAxis stroke="#888" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#1f2937",
                                  border: "1px solid #374151",
                                  borderRadius: "8px",
                                }}
                              />
                              <Legend />
                              <Area
                                type="monotone"
                                dataKey="views"
                                stroke="#3b82f6"
                                fillOpacity={1}
                                fill="url(#colorViews)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Comparison Tab */}
                    <TabsContent value="comparison">
                      <Card>
                        <CardHeader>
                          <CardTitle>Multi-Metric Comparison</CardTitle>
                          <CardDescription>
                            Compare views, likes, and shares performance
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={mockViewsData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis dataKey="date" stroke="#888" />
                              <YAxis stroke="#888" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#1f2937",
                                  border: "1px solid #374151",
                                  borderRadius: "8px",
                                }}
                              />
                              <Legend />
                              <Bar dataKey="views" fill="#3b82f6" />
                              <Bar dataKey="likes" fill="#ec4899" />
                              <Bar dataKey="shares" fill="#f59e0b" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Breakdown Tab */}
                    <TabsContent value="breakdown">
                      <Card>
                        <CardHeader>
                          <CardTitle>Engagement Breakdown</CardTitle>
                          <CardDescription>
                            Distribution of reader interactions
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col lg:flex-row gap-8 justify-center items-center">
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "Views", value: 350 },
                                  { name: "Likes", value: 120 },
                                  { name: "Shares", value: 85 },
                                  { name: "Comments", value: 45 },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {COLORS.map((color, index) => (
                                  <Cell key={`cell-${index}`} fill={color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="space-y-3">
                            {[
                              { label: "Views", value: 350, color: "#3b82f6" },
                              { label: "Likes", value: 120, color: "#ec4899" },
                              { label: "Shares", value: 85, color: "#f59e0b" },
                              { label: "Comments", value: 45, color: "#10b981" },
                            ].map((item) => (
                              <div key={item.label} className="flex items-center gap-3">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm font-medium">{item.label}</span>
                                <span className="ml-auto font-bold">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  {/* Traffic Sources */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Top Traffic Sources
                      </CardTitle>
                      <CardDescription>
                        Where your readers are coming from
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { source: "Direct", views: 620, percentage: 33.5 },
                          { source: "Search Engine", views: 480, percentage: 25.9 },
                          { source: "Social Media", views: 390, percentage: 21.1 },
                          { source: "Referral", views: 280, percentage: 15.1 },
                          { source: "Email", views: 80, percentage: 4.3 },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.source}</p>
                              <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                            </div>
                            <div className="text-right min-w-20">
                              <p className="font-semibold text-sm">{item.views}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.percentage}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </SidebarLayout>
  );
}

import { BarChart3 } from "lucide-react";

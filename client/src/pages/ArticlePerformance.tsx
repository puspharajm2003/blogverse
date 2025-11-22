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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
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
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function ArticlePerformance() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Mock analytics data
  const mockViewsData = [
    { date: "Mon", views: 120 },
    { date: "Tue", views: 180 },
    { date: "Wed", views: 250 },
    { date: "Thu", views: 220 },
    { date: "Fri", views: 300 },
    { date: "Sat", views: 280 },
    { date: "Sun", views: 350 },
  ];

  const mockEngagementData = [
    { name: "Views", value: 350, color: "#3b82f6" },
    { name: "Likes", value: 120, color: "#ec4899" },
    { name: "Shares", value: 85, color: "#f59e0b" },
    { name: "Comments", value: 45, color: "#10b981" },
  ];

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
      const published = (data || []).filter((a: any) => a.status === "published");
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
        {/* Header */}
        <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-serif font-bold tracking-tight flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  Article Performance
                </h1>
                <p className="text-muted-foreground mt-2">
                  Track views, engagement, and reader insights
                </p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <span className="text-sm font-medium text-muted-foreground block mb-2">Blog</span>
                  <Select value={selectedBlog} onValueChange={handleBlogChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(blogs) && blogs.map((blog) => (
                        <SelectItem key={blog.id} value={blog.id}>
                          {blog.name || blog.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-muted-foreground block mb-2">Article</span>
                  <Select value={selectedArticle} onValueChange={setSelectedArticle}>
                    <SelectTrigger className="w-full">
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
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 py-12">
          {articles.length === 0 ? (
            <Card className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>No Published Articles</CardTitle>
              <CardDescription>
                Publish an article first to see performance metrics
              </CardDescription>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Total Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">1,850</div>
                    <p className="text-xs text-green-600 mt-2">↑ 12% this week</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-pink-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Likes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">243</div>
                    <p className="text-xs text-green-600 mt-2">↑ 8% this week</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Shares
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">127</div>
                    <p className="text-xs text-green-600 mt-2">↑ 5% this week</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">64</div>
                    <p className="text-xs text-green-600 mt-2">↑ 3% this week</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="views" className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="views">Views Over Time</TabsTrigger>
                  <TabsTrigger value="engagement">Engagement Mix</TabsTrigger>
                </TabsList>

                {/* Views Chart */}
                <TabsContent value="views">
                  <Card>
                    <CardHeader>
                      <CardTitle>Views Over Last 7 Days</CardTitle>
                      <CardDescription>
                        Track daily page views and reader interest
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={mockViewsData}>
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
                          <Line
                            type="monotone"
                            dataKey="views"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: "#3b82f6", r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Engagement Chart */}
                <TabsContent value="engagement">
                  <Card>
                    <CardHeader>
                      <CardTitle>Engagement Breakdown</CardTitle>
                      <CardDescription>
                        Distribution of reader interactions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={mockEngagementData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {mockEngagementData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-4 ml-8">
                        {mockEngagementData.map((item) => (
                          <div key={item.name} className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm">{item.name}</span>
                            <span className="ml-auto font-semibold">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Reader Demographics */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Traffic Sources</CardTitle>
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
                          <div className="h-2 bg-muted rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
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
            </div>
          )}
        </main>
      </div>
    </SidebarLayout>
  );
}

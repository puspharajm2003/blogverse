import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp, Eye, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface TrendingArticle {
  id: string;
  title: string;
  excerpt?: string;
  slug: string;
  blogId: string;
  views: number;
  engagementScore: number;
  commentCount: number;
  trend: "rising" | "stable" | "declining";
  trendPercentage: number;
}

export default function TrendingArticles() {
  const [articles, setArticles] = useState<TrendingArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(7);
  const [, navigate] = useLocation();

  useEffect(() => {
    loadTrendingArticles();
  }, [timeframe]);

  const loadTrendingArticles = async () => {
    try {
      setLoading(true);
      const data = await api.getTrendingArticles(timeframe);
      setArticles(data || []);
    } catch (error) {
      console.error("Failed to load trending articles:", error);
      toast.error("Failed to load trending articles");
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "rising":
        return "from-green-500 to-emerald-600";
      case "declining":
        return "from-red-500 to-rose-600";
      default:
        return "from-blue-500 to-cyan-600";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "rising":
        return "📈";
      case "declining":
        return "📉";
      default:
        return "→";
    }
  };

  return (
    <SidebarLayout>
      <div className="flex-1 p-8 bg-gradient-to-br from-background via-background/95 to-background">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Flame className="h-8 w-8 text-orange-500" />
              <h1 className="text-4xl font-serif font-bold">Trending Articles</h1>
            </div>
            <p className="text-muted-foreground">Discover the most engaging content across the platform</p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setTimeframe(days)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeframe === days
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
                data-testid={`timeframe-${days}`}
              >
                Last {days} days
              </button>
            ))}
          </div>

          {/* Trending Articles Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : articles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No trending articles yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <Card
                  key={article.id}
                  className="hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                  onClick={() => navigate(`/articles/${article.slug}`)}
                  data-testid={`trending-card-${article.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getTrendIcon(article.trend)}</span>
                          <Badge
                            variant={article.trend === "rising" ? "default" : "outline"}
                            className={`${article.trend === "rising" ? "bg-green-500" : article.trend === "declining" ? "bg-red-500" : ""}`}
                          >
                            {article.trendPercentage > 0 ? "+" : ""}{article.trendPercentage}%
                          </Badge>
                        </div>
                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </CardTitle>
                      </div>
                      <div className="text-3xl font-bold text-orange-500">#{index + 1}</div>
                    </div>
                    {article.excerpt && (
                      <CardDescription className="line-clamp-2 mt-2">
                        {article.excerpt}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Views</p>
                          <p className="font-semibold">{article.views.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Comments</p>
                          <p className="font-semibold">{article.commentCount}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Engagement</p>
                        <p className="font-semibold">{article.engagementScore}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}

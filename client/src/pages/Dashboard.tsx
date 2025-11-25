import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Eye, BookOpen, Zap, MoreHorizontal, PenTool } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Link } from "wouter";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { ReadingChallenge } from "@/components/ReadingChallenge";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [statsData, chartDataRes] = await Promise.all([
          api.getDashboardStats(),
          api.getChartData(7),
        ]);
        setStats(statsData);
        setChartData(chartDataRes);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchDashboardStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-10 w-40 bg-muted rounded"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded"></div>)}
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Real-time overview of your blog's performance.</p>
          </div>
          <Link href="/editor">
             <Button className="gap-2">
                <PenTool className="h-4 w-4" /> New Post
             </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalViews?.toLocaleString() || "0"}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" /> 
                <span className="text-green-500 font-medium">Live</span> 
                <span className="ml-1">across all posts</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalArticles || "0"}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" /> 
                <span className="text-green-500 font-medium">{stats?.totalArticles || "0"}</span> 
                <span className="ml-1">total posts</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Blogs</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBlogs || "0"}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" /> 
                <span className="text-green-500 font-medium">{stats?.totalBlogs || "0"}</span> 
                <span className="ml-1">blog(s) active</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Views/Post</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalArticles > 0 ? Math.round(stats.totalViews / stats.totalArticles) : "0"}
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                 <span className="text-muted-foreground">Per article average</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reading Challenge Widget */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-3">
            <ReadingChallenge
              weeklyGoal={10}
              monthlyGoal={40}
              articlesReadThisWeek={3}
              articlesReadThisMonth={12}
            />
          </div>
          
          {/* Placeholder for future widget */}
          <div className="col-span-4" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Chart */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Articles */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Articles</CardTitle>
              <CardDescription>{stats?.totalArticles || 0} articles total</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.recentArticles && stats.recentArticles.length > 0 ? (
                <div className="space-y-6">
                  {stats.recentArticles.map((article: any, i: number) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="space-y-1">
                        <p className="font-medium font-serif truncate max-w-[200px]">{article.title}</p>
                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                          <span className={article.status === "published" ? "text-green-600" : "text-amber-600"}>● {article.status}</span>
                          <span>•</span>
                          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">-</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>View Stats</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No articles yet. Create one to get started!</p>
                  <Link href="/editor">
                    <Button variant="ghost" className="mt-4">Write Article</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Auto-refresh indicator */}
        <div className="text-xs text-muted-foreground text-center">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live data • Updates every 5 seconds
          </span>
        </div>
      </div>
    </SidebarLayout>
  );
}

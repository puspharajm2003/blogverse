import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Eye, BookOpen, Zap, MoreHorizontal, PenTool, Trophy } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ReadingChallenge } from "@/components/ReadingChallenge";
import { useAuth } from "@/lib/auth";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<any>({ totalBlogs: 0, totalArticles: 0, totalViews: 0, recentArticles: [] });
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [recentUnlocked, setRecentUnlocked] = useState<any[]>([]);
  const [avgViews, setAvgViews] = useState(0);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, lastPublishDate: null });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard", "stats", user?.id],
    queryFn: () => api.getDashboardStats(),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10,
  });

  const { data: chartResponse } = useQuery({
    queryKey: ["dashboard", "chart", user?.id],
    queryFn: () => api.getChartData(7),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const { data: achievementsResponse } = useQuery({
    queryKey: ["achievements", "user", user?.id],
    queryFn: () => api.getUserAchievements?.() || [],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const { data: streakResponse } = useQuery({
    queryKey: ["streak", user?.id],
    queryFn: () => api.getStreak?.() || { currentStreak: 0, longestStreak: 0, lastPublishDate: null },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!statsResponse) {
      setIsLoading(true);
      return;
    }

    try {
      // Handle error responses
      if (statsResponse?.error) {
        console.error("Stats API error:", statsResponse.error);
        setStats({ totalBlogs: 0, totalArticles: 0, totalViews: 0, recentArticles: [] });
        setIsLoading(false);
        return;
      }
      
      // Normalize stats
      const normalizedStats = {
        totalBlogs: parseInt(statsResponse?.totalBlogs) || 0,
        totalArticles: parseInt(statsResponse?.totalArticles) || 0,
        totalViews: parseInt(statsResponse?.totalViews) || 0,
        recentArticles: statsResponse?.recentArticles || []
      };
      
      setStats(normalizedStats);
      
      // Calculate average views per post
      if (normalizedStats.totalArticles > 0) {
        const avg = Math.round(normalizedStats.totalViews / normalizedStats.totalArticles);
        setAvgViews(avg);
      } else {
        setAvgViews(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [statsResponse]);

  useEffect(() => {
    if (chartResponse) setChartData(chartResponse || []);
  }, [chartResponse]);

  useEffect(() => {
    if (streakResponse) setStreak(streakResponse);
  }, [streakResponse]);

  useEffect(() => {
    if (achievementsResponse && Array.isArray(achievementsResponse)) {
      setUserAchievements(achievementsResponse);
      const sorted = achievementsResponse.sort((a: any, b: any) => 
        new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
      );
      setRecentUnlocked(sorted.slice(0, 3));
    }
  }, [achievementsResponse]);

  if (authLoading || isLoading) {
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

  if (!user) {
    return null;
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
              <div className="text-2xl font-bold">{avgViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">Per article</span>
                <span className="ml-1">average</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reading Challenge & Streak & Achievements Widget */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-2">
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🔥</span>
                  <CardTitle className="text-lg">Your Streak</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">{streak.currentStreak}</div>
                  <span className="text-sm text-muted-foreground">consecutive days</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Best: <span className="font-semibold text-foreground">{streak.longestStreak} days</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="col-span-2">
            <ReadingChallenge
              weeklyGoal={10}
              monthlyGoal={40}
              articlesReadThisWeek={3}
              articlesReadThisMonth={12}
            />
          </div>
          
          {/* Recent Achievements */}
          <Card className="col-span-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <CardTitle>Recent Achievements</CardTitle>
                </div>
                <Link href="/achievements">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
              <CardDescription className="text-xs">
                {userAchievements.length} achievements unlocked
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentUnlocked.length > 0 ? (
                <div className="space-y-3">
                  {recentUnlocked.map((ua: any) => (
                    <div key={ua.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                      <div className="text-2xl">{ua.achievement?.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{ua.achievement?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ua.achievement?.points} pts • {new Date(ua.unlockedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {ua.achievement?.tier}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">Publish articles to unlock achievements!</p>
                  <Link href="/editor">
                    <Button variant="ghost" size="sm" className="mt-2">Write Your First Post</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
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

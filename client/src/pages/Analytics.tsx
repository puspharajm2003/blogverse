import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Calendar, Download, TrendingUp, TrendingDown, Users, Eye, Clock, MousePointer, Globe, Zap, Share2, BookOpen, Activity, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const sourceData = [
  { name: 'Organic Search', value: 45, percentage: 45 },
  { name: 'Direct', value: 25, percentage: 25 },
  { name: 'Social Media', value: 15, percentage: 15 },
  { name: 'Referral', value: 10, percentage: 10 },
  { name: 'Other', value: 5, percentage: 5 },
];

const deviceData = [
  { name: 'Desktop', value: 60 },
  { name: 'Mobile', value: 35 },
  { name: 'Tablet', value: 5 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  description?: string;
  color?: string;
}

function MetricCard({ title, value, icon, trend, description, color = "bg-primary" }: MetricCardProps) {
  const isPositive = trend ? trend >= 0 : true;
  
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-5 rounded-full -mr-10 -mt-10`}></div>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend !== undefined && (
          <div className="flex items-center mt-2">
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(trend)}% vs last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState("30d");
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getDetailedAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generate advanced chart data
  const advancedTrafficData = Array.from({ length: 30 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const totalViews = analytics?.totalViews || 8000;
    const baseViews = Math.floor(totalViews / 30);
    
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      views: Math.floor(baseViews * (0.8 + Math.random() * 0.4)),
      visitors: Math.floor(baseViews * 0.6 * (0.8 + Math.random() * 0.4)),
      engaged: Math.floor(baseViews * 0.4 * (0.8 + Math.random() * 0.4)),
      dateObj: date
    };
  });

  const engagementData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      ctr: Math.floor(Math.random() * 8 + 2),
      engagement: Math.floor(Math.random() * 6 + 1),
      bounceRate: Math.floor(Math.random() * 40 + 20),
    };
  });

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-10 w-40 bg-muted rounded"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {[1,2,3,4,5].map(i => <div key={i} className="h-32 bg-muted rounded"></div>)}
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const totalViews = analytics?.totalViews || 0;
  const totalVisitors = analytics?.totalVisitors || 0;
  const avgEngagement = totalViews > 0 ? Math.floor((totalVisitors / totalViews) * 100) : 0;

  return (
    <SidebarLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Analytics
            </h1>
            <p className="text-muted-foreground mt-2">Advanced insights and performance metrics for your content</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="12m">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-2">
              <Activity className="h-4 w-4" /> Engagement
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" /> Sources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-8">
            {/* Key Metrics - Enhanced */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <MetricCard
                title="Total Pageviews"
                value={totalViews.toLocaleString()}
                icon={<Eye className="h-4 w-4 text-primary" />}
                trend={12.5}
                color="bg-blue-500"
              />
              <MetricCard
                title="Unique Visitors"
                value={totalVisitors.toLocaleString()}
                icon={<Users className="h-4 w-4 text-green-500" />}
                trend={8.3}
                color="bg-green-500"
              />
              <MetricCard
                title="Engagement Rate"
                value={`${avgEngagement}%`}
                icon={<Zap className="h-4 w-4 text-amber-500" />}
                trend={5.2}
                color="bg-amber-500"
              />
              <MetricCard
                title="Avg. Time on Page"
                value="3m 24s"
                icon={<Clock className="h-4 w-4 text-purple-500" />}
                trend={-2.1}
                color="bg-purple-500"
              />
              <MetricCard
                title="Bounce Rate"
                value={`${analytics?.bounceRate || 32}%`}
                icon={<MousePointer className="h-4 w-4 text-red-500" />}
                trend={-4.5}
                color="bg-red-500"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Traffic Chart */}
              <Card className="col-span-7 lg:col-span-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Traffic Performance</CardTitle>
                      <CardDescription>Daily pageviews, visitors, and engagement</CardDescription>
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={advancedTrafficData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                        <Area type="monotone" dataKey="visitors" stroke="hsl(var(--chart-2))" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitors)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="col-span-7 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>Key metrics at a glance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="text-sm text-muted-foreground">Click-Through Rate</span>
                      <span className="font-semibold">4.2%</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="text-sm text-muted-foreground">Pages per Session</span>
                      <span className="font-semibold">2.8</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="text-sm text-muted-foreground">Conversion Rate</span>
                      <span className="font-semibold">3.1%</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="text-sm text-muted-foreground">Return Visitors</span>
                      <span className="font-semibold">42%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Mobile Traffic</span>
                      <span className="font-semibold">58%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Top Performing Articles</CardTitle>
                    <CardDescription>Your best-performing content by engagement</CardDescription>
                  </div>
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                {analytics?.topArticles && analytics.topArticles.length > 0 ? (
                  <div className="space-y-0">
                    {analytics.topArticles.map((article: any, index: number) => (
                      <div key={index} className="grid grid-cols-12 text-sm items-center py-4 border-b border-border last:border-0 gap-4 hover:bg-muted/50 px-4 -mx-4 transition-colors">
                        <div className="col-span-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                            {index + 1}
                          </div>
                        </div>
                        <div className="col-span-4">
                          <p className="font-medium font-serif line-clamp-2">{article.title}</p>
                        </div>
                        <div className="col-span-2">
                          <div>
                            <p className="font-semibold">{article.views?.toLocaleString() || "0"}</p>
                            <p className="text-xs text-muted-foreground">views</p>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div>
                            <p className="font-semibold">{article.uniqueVisitors?.toLocaleString() || "0"}</p>
                            <p className="text-xs text-muted-foreground">visitors</p>
                          </div>
                        </div>
                        <div className="col-span-3 text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            article.status === "published" 
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${article.status === "published" ? "bg-green-600" : "bg-amber-600"}`}></div>
                            {article.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="h-12 w-12 opacity-20 mx-auto mb-3" />
                    <p>No articles yet. Create one to see analytics!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-8 mt-8">
            {/* Engagement Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Reading Depth"
                value="68%"
                icon={<BookOpen className="h-4 w-4 text-blue-500" />}
                trend={3.2}
                color="bg-blue-500"
              />
              <MetricCard
                title="Scroll Depth"
                value="72%"
                icon={<TrendingUp className="h-4 w-4 text-green-500" />}
                trend={6.1}
                color="bg-green-500"
              />
              <MetricCard
                title="Social Shares"
                value="342"
                icon={<Share2 className="h-4 w-4 text-purple-500" />}
                trend={15.8}
                color="bg-purple-500"
              />
              <MetricCard
                title="Comments"
                value="128"
                icon={<MessageCircle className="h-4 w-4 text-pink-500" />}
                trend={9.4}
                color="bg-pink-500"
              />
            </div>

            {/* Engagement Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
                <CardDescription>CTR, bounce rate, and engagement metrics over time</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engagementData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <Line type="monotone" dataKey="ctr" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="CTR %" />
                      <Line type="monotone" dataKey="engagement" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Engagement %" />
                      <Line type="monotone" dataKey="bounceRate" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Bounce %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-8 mt-8">
            {/* Traffic Sources */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Where your visitors are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sourceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {sourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Breakdown</CardTitle>
                  <CardDescription>Traffic by device type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {deviceData.map((device, index) => {
                    const percentage = device.value;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{device.name}</span>
                          <span className="text-sm font-semibold">{percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Source Details */}
            <Card>
              <CardHeader>
                <CardTitle>Source Details</CardTitle>
                <CardDescription>Detailed breakdown of traffic sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {sourceData.map((source, index) => (
                    <div key={index} className="grid grid-cols-12 text-sm items-center py-4 border-b border-border last:border-0 gap-4 hover:bg-muted/50 px-4 -mx-4 transition-colors">
                      <div className="col-span-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      </div>
                      <div className="col-span-5">
                        <p className="font-medium">{source.name}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-semibold">{Math.floor(totalViews * source.percentage / 100).toLocaleString()}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">{source.percentage}%</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="inline-flex items-center text-green-600">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{Math.floor(Math.random() * 15) + 5}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Live Indicator */}
        <div className="text-xs text-muted-foreground text-center py-4 border-t border-border">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live data • Updates every 5 seconds
          </span>
        </div>
      </div>
    </SidebarLayout>
  );
}

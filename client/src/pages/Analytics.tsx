import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Calendar, Download, Users, Clock, MousePointer, Globe } from "lucide-react";
import { useState } from "react";

const trafficData = [
  { date: 'Nov 01', views: 2400, visitors: 1400 },
  { date: 'Nov 02', views: 1398, visitors: 980 },
  { date: 'Nov 03', views: 9800, visitors: 5200 },
  { date: 'Nov 04', views: 3908, visitors: 2100 },
  { date: 'Nov 05', views: 4800, visitors: 2600 },
  { date: 'Nov 06', views: 3800, visitors: 2100 },
  { date: 'Nov 07', views: 4300, visitors: 2800 },
  { date: 'Nov 08', views: 5600, visitors: 3200 },
  { date: 'Nov 09', views: 4800, visitors: 2900 },
  { date: 'Nov 10', views: 6700, visitors: 4100 },
  { date: 'Nov 11', views: 7200, visitors: 4500 },
  { date: 'Nov 12', views: 6100, visitors: 3800 },
  { date: 'Nov 13', views: 5400, visitors: 3100 },
  { date: 'Nov 14', views: 8900, visitors: 5600 },
];

const sourceData = [
  { name: 'Google', value: 45 },
  { name: 'Direct', value: 25 },
  { name: 'Twitter', value: 15 },
  { name: 'LinkedIn', value: 10 },
  { name: 'Other', value: 5 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const topPages = [
  { path: '/blog/digital-minimalism', title: 'The Art of Digital Minimalism', views: '12.5k', time: '4m 32s', bounce: '42%' },
  { path: '/blog/react-server-components', title: 'Why React Server Components...', views: '8.2k', time: '6m 15s', bounce: '35%' },
  { path: '/blog/personal-branding', title: 'Building a Personal Brand', views: '5.1k', time: '3m 45s', bounce: '58%' },
  { path: '/blog/ai-workflows', title: 'Future of AI in Creative Workflows', views: '3.8k', time: '5m 10s', bounce: '28%' },
  { path: '/about', title: 'About Jane Doe', views: '2.1k', time: '1m 20s', bounce: '65%' },
];

export default function Analytics() {
  const [dateRange, setDateRange] = useState("30d");

  return (
    <SidebarLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Detailed insights into your audience and performance.</p>
          </div>
          <div className="flex items-center gap-2">
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
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pageviews</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128,430</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" /> 
                <span className="text-green-500 font-medium">+12.5%</span> 
                <span className="ml-1">vs previous period</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42,350</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" /> 
                <span className="text-green-500 font-medium">+8.2%</span> 
                <span className="ml-1">vs previous period</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4m 12s</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" /> 
                <span className="text-green-500 font-medium">+2.1%</span> 
                <span className="ml-1">vs previous period</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42.3%</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" /> 
                <span className="text-green-500 font-medium">-1.2%</span> 
                <span className="ml-1">vs previous period</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Main Chart */}
          <Card className="col-span-7 lg:col-span-5">
            <CardHeader>
              <CardTitle>Traffic Overview</CardTitle>
              <CardDescription>Daily pageviews and unique visitors over time.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                    <Area type="monotone" dataKey="visitors" stroke="hsl(var(--chart-2))" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitors)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card className="col-span-7 lg:col-span-2">
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your visitors are coming from.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="h-[250px]">
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
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
               </div>
               <div className="space-y-2 mt-4">
                    {sourceData.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span>{entry.name}</span>
                            </div>
                            <span className="font-medium">{entry.value}%</span>
                        </div>
                    ))}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Pages */}
        <Card>
            <CardHeader>
                <CardTitle>Top Content</CardTitle>
                <CardDescription>Your most performing pages.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-12 text-sm font-medium text-muted-foreground pb-2 border-b border-border">
                        <div className="col-span-6">Page Path</div>
                        <div className="col-span-2 text-right">Views</div>
                        <div className="col-span-2 text-right">Avg. Time</div>
                        <div className="col-span-2 text-right">Bounce Rate</div>
                    </div>
                    {topPages.map((page, i) => (
                        <div key={i} className="grid grid-cols-12 text-sm items-center py-2 hover:bg-muted/50 rounded px-2 -mx-2 transition-colors">
                            <div className="col-span-6">
                                <div className="font-medium text-foreground truncate">{page.title}</div>
                                <div className="text-xs text-muted-foreground truncate">{page.path}</div>
                            </div>
                            <div className="col-span-2 text-right font-medium">{page.views}</div>
                            <div className="col-span-2 text-right text-muted-foreground">{page.time}</div>
                            <div className="col-span-2 text-right text-muted-foreground">{page.bounce}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}

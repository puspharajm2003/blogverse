import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "next-themes";
import { LoadingFallback } from "@/components/LoadingFallback";
import NotFound from "@/pages/not-found";

// Lazy load pages for code splitting
const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Editor = lazy(() => import("@/pages/Editor"));
const ThemeSettings = lazy(() => import("@/pages/ThemeSettings"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const BlogPreview = lazy(() => import("@/pages/BlogPreview"));
const MyBlogs = lazy(() => import("@/pages/MyBlogs"));
const BlogPublish = lazy(() => import("@/pages/BlogPublish"));
const ArticlePerformance = lazy(() => import("@/pages/ArticlePerformance"));
const PublicBlog = lazy(() => import("@/pages/PublicBlog"));
const PersonalizedFeed = lazy(() => import("@/pages/PersonalizedFeed"));
const Trash = lazy(() => import("@/pages/Trash"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Achievements = lazy(() => import("@/pages/Achievements"));
const MyArticles = lazy(() => import("@/pages/MyArticles"));
const DraftPreview = lazy(() => import("@/pages/DraftPreview"));
const ArticleMarketplace = lazy(() => import("@/pages/ArticleMarketplace"));
const Feedback = lazy(() => import("@/pages/Feedback"));
const Bookmarks = lazy(() => import("@/pages/Bookmarks"));
const NotificationSettings = lazy(() => import("@/pages/NotificationSettings"));
const LearningPath = lazy(() => import("@/pages/LearningPath"));
const Import = lazy(() => import("@/pages/Import"));

function Router() {
  const [location] = useLocation();

  // Prefetch common route data for faster navigation
  useEffect(() => {
    if (location === '/dashboard') {
      queryClient.prefetchQuery({ queryKey: ['/api/dashboard/stats'] });
      queryClient.prefetchQuery({ queryKey: ['/api/user/blogs'] });
    } else if (location === '/my-blogs' || location === '/my-articles') {
      queryClient.prefetchQuery({ queryKey: ['/api/user/blogs'] });
    }
  }, [location]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/editor" component={Editor} />
        <Route path="/settings" component={ThemeSettings} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/performance" component={ArticlePerformance} />
        <Route path="/my-blogs" component={MyBlogs} />
        <Route path="/my-articles" component={MyArticles} />
        <Route path="/publish" component={BlogPublish} />
        <Route path="/blog-publish" component={BlogPublish} />
        <Route path="/blog/preview" component={BlogPreview} />
        <Route path="/public-blog" component={PublicBlog} />
        <Route path="/draft-preview/:articleId" component={DraftPreview} />
        <Route path="/feed" component={PersonalizedFeed} />
        <Route path="/trash" component={Trash} />
        <Route path="/achievements" component={Achievements} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/marketplace" component={ArticleMarketplace} />
        <Route path="/feedback" component={Feedback} />
        <Route path="/bookmarks" component={Bookmarks} />
        <Route path="/notifications" component={NotificationSettings} />
        <Route path="/learning" component={LearningPath} />
        <Route path="/import" component={Import} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

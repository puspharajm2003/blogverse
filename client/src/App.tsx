import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Editor from "@/pages/Editor";
import ThemeSettings from "@/pages/ThemeSettings";
import Analytics from "@/pages/Analytics";
import BlogPreview from "@/pages/BlogPreview";
import MyBlogs from "@/pages/MyBlogs";
import BlogPublish from "@/pages/BlogPublish";
import ArticlePerformance from "@/pages/ArticlePerformance";
import PublicBlog from "@/pages/PublicBlog";
import PersonalizedFeed from "@/pages/PersonalizedFeed";
import Trash from "@/pages/Trash";
import AdminDashboard from "@/pages/AdminDashboard";
import Achievements from "@/pages/Achievements";
import MyArticles from "@/pages/MyArticles";
import DraftPreview from "@/pages/DraftPreview";
import ArticleMarketplace from "@/pages/ArticleMarketplace";

function Router() {
  return (
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
      <Route component={NotFound} />
    </Switch>
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

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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/editor" component={Editor} />
      <Route path="/settings" component={ThemeSettings} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/my-blogs" component={MyBlogs} />
      <Route path="/blog/preview" component={BlogPreview} />
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

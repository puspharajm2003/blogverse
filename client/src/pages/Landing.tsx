import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Globe, Sparkles, Zap, Shield, BarChart3, Star, X, Loader2, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useTheme } from "next-themes";
import heroImage from "@assets/generated_images/abstract_modern_digital_publishing_hero_background.png";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [showDemoPanel, setShowDemoPanel] = useState(false);
  const [demoUser, setDemoUser] = useState<any>(null);
  const { theme, setTheme } = useTheme();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  const handleViewDemo = async () => {
    setIsLoadingDemo(true);
    try {
      const result = await api.getDemo();
      if (result.token && result.user) {
        localStorage.setItem("stack_token", result.token);
        localStorage.setItem("stack_user", JSON.stringify(result.user));
        setDemoUser(result.user);
        setShowDemoPanel(true);
        toast.success("Demo loaded! Explore the platform.", { duration: 3000 });
      }
    } catch (error) {
      console.error("Failed to load demo:", error);
      toast.error("Failed to load demo");
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleNavigateToDashboard = () => {
    setShowDemoPanel(false);
    setLocation("/dashboard");
  };

  const handleCloseDemoPanel = () => {
    localStorage.removeItem("stack_token");
    localStorage.removeItem("stack_user");
    setShowDemoPanel(false);
    setDemoUser(null);
  };
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="border-b border-border/40 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-xl">B</span>
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">BlogVerse</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Success Stories</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="toggle-theme-navbar"
              title="Toggle dark mode"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/login">
              <Button>Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center rounded-full border border-border bg-muted/30 px-3 py-1 text-sm font-medium text-foreground mb-8 backdrop-blur-sm">
                <Sparkles className="mr-2 h-3.5 w-3.5 text-amber-500" />
                <span>AI-Powered Publishing Platform v2.0</span>
              </div>
              <h1 className="font-serif text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
                Publish your ideas with <span className="italic text-primary/80">intelligence.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                The complete platform for serious writers. Create beautiful blogs, optimize with AI, and monetize your audience from day one.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button size="lg" className="h-12 px-8 text-base">Start Writing for Free</Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-12 px-8 text-base"
                  onClick={handleViewDemo}
                  disabled={isLoadingDemo}
                >
                  {isLoadingDemo ? "Loading..." : "View Demo"}
                </Button>
              </div>
              
              <div className="mt-12 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                <p>Joined by 10,000+ creators</p>
              </div>
            </div>
            <div className="relative lg:h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl border border-border/50 group perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 mix-blend-overlay z-10" />
              <img 
                src={heroImage} 
                alt="Platform Interface" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Floating UI Elements */}
              <div className="absolute top-12 left-12 bg-background/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-border z-20 max-w-xs transform transition-all duration-500 hover:-translate-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SEO Score</span>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold font-serif">98</span>
                    <span className="text-sm text-green-600 mb-1">+12%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-green-500 w-[98%]" />
                </div>
              </div>

              <div className="absolute bottom-12 right-12 bg-background/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-border z-20 max-w-xs transform transition-all duration-500 delay-100 hover:-translate-y-2">
                 <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium">AI Suggestion</span>
                 </div>
                 <p className="text-sm text-muted-foreground">
                    "Consider adding a section about 'sustainable growth' to improve engagement with your target audience."
                 </p>
                 <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="h-7 text-xs w-full">Apply</Button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">Everything you need to run a modern publication.</h2>
            <p className="text-lg text-muted-foreground">Focus on writing. We handle the SEO, design, hosting, and monetization infrastructure.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "AI Writing Assistant",
                desc: "Generate outlines, optimize headlines, and fix grammar with our built-in AI co-pilot trained on top-performing content."
              },
              {
                icon: Globe,
                title: "SEO Optimized",
                desc: "Automatic sitemaps, meta tags, schema markup, and performance optimization to rank higher on Google."
              },
              {
                icon: Shield,
                title: "Membership Built-in",
                desc: "Turn readers into subscribers. Native support for newsletters, paywalls, and recurring subscriptions."
              },
              {
                icon: Zap,
                title: "Blazing Fast",
                desc: "Built on modern edge infrastructure. Your blog loads instantly anywhere in the world."
              },
              {
                icon: Check,
                title: "Custom Themes",
                desc: "Choose from our gallery of editorial themes or build your own with our visual theme editor."
              },
              {
                icon: BarChart3, // Note: Need to import if not already
                title: "Deep Analytics",
                desc: "Understand your audience with privacy-focused analytics. See what's working and where readers drop off."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="h-12 w-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">Trusted by world-class writers.</h2>
            <p className="text-lg text-muted-foreground">Join thousands of creators who trust BlogVerse to share their stories.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "BlogVerse completely changed how I publish. The AI tools are subtle but incredibly powerful.",
                author: "Sarah Jenkins",
                role: "Tech Journalist",
                img: "https://i.pravatar.cc/150?u=sarah"
              },
              {
                quote: "Finally, a blogging platform that cares about design as much as I do. It's simply beautiful.",
                author: "Marcus Chen",
                role: "Design Lead",
                img: "https://i.pravatar.cc/150?u=marcus"
              },
              {
                quote: "The SEO features helped me double my traffic in just three months. Highly recommended.",
                author: "Elena Rodriguez",
                role: "Travel Blogger",
                img: "https://i.pravatar.cc/150?u=elena"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-muted/20 p-8 rounded-2xl border border-border">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-lg mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                    <img src={testimonial.img} alt={testimonial.author} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">Simple, transparent pricing.</h2>
            <p className="text-lg text-muted-foreground">Start for free, upgrade as you grow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-card p-8 rounded-2xl border border-border flex flex-col">
              <div className="mb-8">
                <h3 className="font-serif text-xl font-bold mb-2">Starter</h3>
                <p className="text-muted-foreground text-sm mb-4">Perfect for hobbyists.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "1 Blog",
                  "50 AI generations/mo",
                  "Basic Analytics",
                  "Community Support"
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full">Get Started</Button>
            </div>

            {/* Pro Plan */}
            <div className="bg-card p-8 rounded-2xl border-2 border-primary relative flex flex-col shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div className="mb-8">
                <h3 className="font-serif text-xl font-bold mb-2">Pro</h3>
                <p className="text-muted-foreground text-sm mb-4">For serious creators.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$12</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "Unlimited Blogs",
                  "Unlimited AI generations",
                  "Custom Domains",
                  "Advanced Analytics",
                  "Newsletter Integration",
                  "Priority Support"
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full">Start Free Trial</Button>
            </div>

            {/* Team Plan */}
            <div className="bg-card p-8 rounded-2xl border border-border flex flex-col">
              <div className="mb-8">
                <h3 className="font-serif text-xl font-bold mb-2">Team</h3>
                <p className="text-muted-foreground text-sm mb-4">For agencies & teams.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "Everything in Pro",
                  "5 Team Members",
                  "Collaboration Tools",
                  "Approval Workflows",
                  "API Access",
                  "Dedicated Manager"
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                 <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground font-serif font-bold text-sm">B</span>
                </div>
                <span className="font-serif text-lg font-bold">BlogVerse</span>
              </div>
              <p className="text-muted-foreground max-w-xs">
                The platform for modern publishing. Built for writers, optimized for growth.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Features</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Showcase</a></li>
                <li><a href="#" className="hover:text-foreground">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © 2024 BlogVerse Inc. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Demo Panel Overlay */}
      {showDemoPanel && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-300"
          onClick={handleCloseDemoPanel}
        />
      )}

      {/* Demo Panel */}
      {showDemoPanel && (
        <div 
          className="fixed bottom-0 right-0 h-screen w-full md:w-[600px] bg-card border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-500 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
            <div>
              <h2 className="text-lg font-serif font-bold">Welcome to BlogVerse Demo</h2>
              <p className="text-xs text-muted-foreground">Explore the platform with sample data</p>
            </div>
            <button
              onClick={handleCloseDemoPanel}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              data-testid="button-close-demo-panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Demo Account</p>
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm font-mono">{demoUser?.email || "demo@blogverse.com"}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">What you can explore:</p>
              <ul className="space-y-2">
                {[
                  "Dashboard with analytics",
                  "Create and publish blogs",
                  "AI-powered content generation",
                  "Article management",
                  "Personalized feed",
                  "Trash & restore functionality"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> All demo data is pre-loaded. Navigate to different sections using the sidebar to explore features.
              </p>
            </div>
          </div>

          {/* Panel Footer */}
          <div className="p-4 border-t border-border bg-muted/30 space-y-3">
            <Button 
              onClick={handleNavigateToDashboard}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 animate-in fade-in slide-in-from-bottom duration-500 delay-100"
              data-testid="button-navigate-dashboard"
            >
              {isLoadingDemo ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Explore Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
            <Button 
              variant="ghost"
              onClick={handleCloseDemoPanel}
              className="w-full hover:bg-muted transition-colors"
              data-testid="button-close-demo"
            >
              Explore Later
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

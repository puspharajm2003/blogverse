import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Twitter, Github, Linkedin, ArrowRight, ArrowLeft, Loader2, Clock, User, Calendar, Share2, Heart } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function BlogPreview() {
  const [location] = useLocation();
  const [blog, setBlog] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const blogId = params.get('blogId');

        if (!blogId) {
          setError("No blog selected");
          setIsLoading(false);
          return;
        }

        const [blogData, articlesData] = await Promise.all([
          api.getBlog(blogId),
          api.getArticles(blogId)
        ]);

        setBlog(blogData);
        setArticles(articlesData || []);
      } catch (err) {
        console.error("Failed to load blog:", err);
        setError("Failed to load blog data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Blog not found"}</p>
          <Link href="/my-blogs">
            <Button>Back to My Blogs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const featuredArticle = articles?.[0];
  const restArticles = articles?.slice(1) || [];
  const defaultAvatar = blog?.name?.charAt(0).toUpperCase() || "B";
  const filteredArticles = restArticles.filter(article =>
    article.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-serif font-bold text-lg">{defaultAvatar}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold tracking-tight" data-testid="blog-title">{blog?.name || "Untitled Blog"}</span>
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest">Professional Platform</span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#featured" className="text-sm font-medium hover:text-primary transition-colors">Home</a>
              <a href="#articles" className="text-sm font-medium hover:text-primary transition-colors">Articles</a>
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">About</a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link href="/my-blogs">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="overflow-hidden">
        {/* Featured Article Hero Section */}
        {featuredArticle ? (
          <section id="featured" className="relative overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Content */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Badge variant="outline" className="w-fit px-3 py-1 border-primary/30 bg-primary/5 text-primary font-semibold">
                      📌 Featured Article
                    </Badge>
                    <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight" data-testid="featured-title">
                      {featuredArticle?.title || "Untitled Article"}
                    </h1>
                  </div>

                  <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                    {featuredArticle?.excerpt || featuredArticle?.content?.substring(0, 120) || "Discover professional insights and expert perspectives"}
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 pt-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/20 ring-4 ring-primary/10">
                      <AvatarImage src={blog?.author?.avatar || "https://api.dicebear.com/7.x/avataaars/svg"} onError={(e) => (e.currentTarget as HTMLImageElement).style.display = 'none'} />
                      <AvatarFallback className="font-bold">{defaultAvatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">{blog?.author || blog?.name || "Anonymous"}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{featuredArticle?.createdAt ? new Date(featuredArticle.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString()}</span>
                        <span>•</span>
                        <Clock className="h-4 w-4" />
                        <span>{Math.ceil((featuredArticle?.content?.split(/\s+/).length || 0) / 200)} min read</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="flex items-center gap-3 pt-4">
                    <Button size="lg" className="gap-2 font-semibold">
                      Read Article <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Featured Image */}
                <div className="hidden lg:block relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-primary/10">
                    <div className="aspect-square bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
                      <div className="text-center">
                        <Calendar className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                        <p className="text-muted-foreground text-sm">Featured Article</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                  <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="py-32 text-center">
            <p className="text-muted-foreground text-lg">No articles published yet. Check back soon!</p>
          </section>
        )}

        {/* All Articles Section */}
        {restArticles.length > 0 && (
          <section id="articles" className="relative py-24 sm:py-32">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/2 to-primary/0 pointer-events-none" />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="space-y-8 mb-16">
                <div className="space-y-4">
                  <h2 className="font-serif text-4xl sm:text-5xl font-bold">Latest Articles</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl">
                    Explore our collection of in-depth articles and professional insights
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 rounded-xl bg-muted/40 border-border/40 hover:bg-muted/60 focus:bg-background transition-colors"
                  />
                </div>
              </div>

              {/* Articles Grid */}
              {filteredArticles.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredArticles.map((article, i) => (
                    <article
                      key={i}
                      className="group h-full rounded-2xl border border-border/40 bg-card/30 hover:bg-card/60 backdrop-blur transition-all duration-300 overflow-hidden hover:shadow-lg hover:border-border/80"
                    >
                      {/* Card Header */}
                      <div className="p-6 space-y-4 h-full flex flex-col">
                        {/* Tag & Date */}
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5">
                            {article.category || "Article"}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium">
                            {article.createdAt ? new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {/* Title */}
                        <h3
                          className="font-serif text-xl sm:text-2xl font-bold leading-tight group-hover:text-primary transition-colors duration-300 flex-1"
                          data-testid={`article-title-${i}`}
                        >
                          {article.title || "Untitled"}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-3">
                          {article.excerpt || article.content?.substring(0, 140) || "No description available"}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-auto">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">{Math.ceil((article.content?.split(/\s+/).length || 0) / 200)} min</span>
                          </div>
                          <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/10 group-hover:translate-x-1 transition-transform">
                            Read <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No articles found matching your search.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Professional CTA Section */}
        <section className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-12 sm:p-16">
              {/* Grid Pattern Background */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'linear-gradient(90deg, transparent 24%, rgba(68, 68, 68, .05) 25%, rgba(68, 68, 68, .05) 26%, transparent 27%, transparent 74%, rgba(68, 68, 68, .05) 75%, rgba(68, 68, 68, .05) 76%, transparent 77%, transparent), linear-gradient(0deg, transparent 24%, rgba(68, 68, 68, .05) 25%, rgba(68, 68, 68, .05) 26%, transparent 27%, transparent 74%, rgba(68, 68, 68, .05) 75%, rgba(68, 68, 68, .05) 76%, transparent 77%, transparent)',
                backgroundSize: '50px 50px'
              }} />

              <div className="relative text-center space-y-8 max-w-2xl mx-auto">
                <div className="space-y-4">
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary-foreground">
                    Never Miss an Update
                  </h2>
                  <p className="text-lg text-primary-foreground/90">
                    Subscribe to get the latest articles and insights delivered directly to your inbox
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    className="bg-primary-foreground text-primary px-6 py-3 rounded-xl border-0 shadow-lg placeholder:text-primary/50 focus-visible:ring-2 ring-primary-foreground/30"
                  />
                  <Button variant="secondary" size="lg" className="font-semibold px-8">
                    Subscribe
                  </Button>
                </div>

                <p className="text-xs text-primary-foreground/70 font-medium">
                  ✓ No spam. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-serif font-bold">{defaultAvatar}</span>
                </div>
                <span className="font-serif font-bold">{blog?.name || "BlogVerse"}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional blogging platform for creators and thought leaders.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#featured" className="text-muted-foreground hover:text-foreground transition-colors">Home</a></li>
                <li><a href="#articles" className="text-muted-foreground hover:text-foreground transition-colors">Articles</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Categories</a></li>
              </ul>
            </div>

            {/* More Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Follow Us</h4>
              <div className="flex gap-3">
                <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                  <Github className="h-4 w-4" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 {blog?.name || "BlogVerse"}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">RSS Feed</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

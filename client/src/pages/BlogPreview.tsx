import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Twitter, Github, Linkedin, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function BlogPreview() {
  const [location] = useLocation();
  const [blog, setBlog] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        // Get blogId from URL query params
        const params = new URLSearchParams(location.split('?')[1]);
        const blogId = params.get('blogId');

        if (!blogId) {
          setError("No blog selected");
          setIsLoading(false);
          return;
        }

        // Fetch blog and articles data
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
  }, [location]);

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

  return (
    <div className="min-h-screen bg-background font-sans antialiased selection:bg-primary/10 selection:text-primary">
      {/* Navigation */}
      <header className="border-b border-border sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        {/* Admin Overlay Bar for Preview Mode */}
        <div className="bg-primary text-primary-foreground py-2 px-4 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="bg-primary-foreground/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">Preview Mode</span>
                <span>You are viewing the public version of your blog.</span>
            </div>
            <Link href="/my-blogs">
                <Button size="sm" variant="secondary" className="h-6 text-xs px-3 gap-1">
                    <ArrowLeft className="h-3 w-3" /> Back to My Blogs
                </Button>
            </Link>
        </div>

        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-xl">{defaultAvatar}</span>
            </div>
            <span className="font-serif text-xl font-bold tracking-tight" data-testid="blog-title">{blog?.name || "Untitled Blog"}</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-6 text-sm font-medium">
              <a href="#" className="hover:text-primary transition-colors">Home</a>
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Newsletter</a>
            </nav>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Github className="h-4 w-4" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Linkedin className="h-4 w-4" />
                </a>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
             <Button size="sm" variant="ghost">Menu</Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        {featuredArticle ? (
          <section className="py-20 md:py-28 border-b border-border bg-muted/10">
              <div className="container mx-auto px-4">
                  <div className="max-w-4xl mx-auto text-center">
                      <Badge variant="secondary" className="mb-6 px-3 py-1 rounded-full text-sm font-medium">
                          Featured Post
                      </Badge>
                      <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-8 tracking-tight" data-testid="featured-title">
                          {featuredArticle?.title || "Untitled Article"}
                      </h1>
                      <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
                          {featuredArticle?.excerpt || featuredArticle?.content?.substring(0, 100) || "Read the featured article to learn more."}
                      </p>
                      <div className="flex items-center justify-center gap-4 mb-12">
                          <Avatar className="h-12 w-12 border-2 border-background">
                              <AvatarImage src={blog?.author?.avatar} />
                              <AvatarFallback>{defaultAvatar}</AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                              <div className="font-bold">{blog?.author || blog?.name || "Anonymous"}</div>
                              <div className="text-sm text-muted-foreground">
                                {featuredArticle?.createdAt ? new Date(featuredArticle.createdAt).toLocaleDateString() : new Date().toLocaleDateString()} · {Math.ceil((featuredArticle?.content?.split(/\s+/).length || 0) / 200)} min read
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </section>
        ) : (
          <section className="py-20 md:py-28 border-b border-border bg-muted/10">
              <div className="container mx-auto px-4 text-center">
                  <p className="text-muted-foreground">No articles published yet. Check back soon!</p>
              </div>
          </section>
        )}

        {/* Recent Posts Grid */}
        {restArticles.length > 0 && (
          <section className="py-24">
              <div className="container mx-auto px-4">
                  <div className="flex items-center justify-between mb-12">
                      <h2 className="font-serif text-3xl font-bold">All Articles</h2>
                      <div className="relative w-64 hidden md:block">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Search articles..." className="pl-9 rounded-full bg-muted/20 border-transparent focus:bg-background focus:border-border transition-all" />
                      </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                      {restArticles.map((article, i) => (
                          <article key={i} className="group cursor-pointer flex flex-col h-full">
                              <div className="rounded-xl overflow-hidden mb-6 aspect-video bg-muted relative">
                                  <div className="absolute top-4 left-4 z-10">
                                      <Badge className="bg-background/80 backdrop-blur text-foreground hover:bg-background">{article.category || "Article"}</Badge>
                                  </div>
                                  {article.image && (
                                    <img 
                                        src={article.image} 
                                        alt={article.title} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                    />
                                  )}
                              </div>
                              <div className="flex-1 flex flex-col">
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                                      <span>{article.createdAt ? new Date(article.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                                      <span>•</span>
                                      <span>{Math.ceil((article.content?.split(/\s+/).length || 0) / 200)} min read</span>
                                  </div>
                                  <h3 className="font-serif text-2xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight" data-testid={`article-title-${i}`}>
                                      {article.title || "Untitled"}
                                  </h3>
                                  <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                                      {article.excerpt || article.content?.substring(0, 150) || "No description available"}
                                  </p>
                                  <div className="flex items-center text-sm font-medium text-primary mt-auto group-hover:translate-x-1 transition-transform duration-300 w-fit">
                                      Read Article <ArrowRight className="ml-2 h-4 w-4" />
                                  </div>
                              </div>
                          </article>
                      ))}
                  </div>
              </div>
          </section>
        )}

        {/* Newsletter Section */}
        <section className="py-24 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">Subscribe to my newsletter</h2>
                    <p className="text-primary-foreground/80 text-lg mb-8">
                        Get the latest articles, tutorials, and updates delivered straight to your inbox. No spam, ever.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <Input 
                            type="email" 
                            placeholder="Enter your email" 
                            className="bg-primary-foreground text-primary border-transparent h-12 px-6 placeholder:text-primary/50 focus-visible:ring-primary-foreground/50" 
                        />
                        <Button variant="secondary" size="lg" className="h-12 px-8 font-semibold hover:bg-secondary/90">
                            Subscribe
                        </Button>
                    </div>
                    <p className="text-xs text-primary-foreground/60 mt-4">
                        Join 5,000+ subscribers. Unsubscribe anytime.
                    </p>
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-muted-foreground">
                © 2025 {blog?.name || "BlogVerse"}. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="hover:text-foreground transition-colors">RSS</a>
            </div>
        </div>
      </footer>
      
      {/* Floating Action Button for Demo Context */}
      <div className="fixed bottom-6 right-6 z-50">
         <Link href="/dashboard">
            <Button className="shadow-2xl rounded-full px-6 h-12 border-2 border-background" size="lg">
                Back to Dashboard
            </Button>
         </Link>
      </div>
    </div>
  );
}

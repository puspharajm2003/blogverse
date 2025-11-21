import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Twitter, Github, Linkedin, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function BlogPreview() {
  const posts = [
    {
      title: "The Art of Digital Minimalism in 2024",
      excerpt: "In a world overflowing with notifications, tabs, and endless feeds, the ability to focus has become a superpower. Digital minimalism isn't just about deleting apps; it's about reclaiming your attention.",
      date: "Nov 21, 2025",
      category: "Lifestyle",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1499750310159-57f0e1b013b6?auto=format&fit=crop&q=80&w=1000"
    },
    {
      title: "Why React Server Components Change Everything",
      excerpt: "The shift from client-side rendering to server components represents a fundamental change in how we build web applications. Here's what you need to know.",
      date: "Nov 18, 2025",
      category: "Engineering",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1000"
    },
    {
      title: "Building a Personal Brand as a Developer",
      excerpt: "Your code is your portfolio, but your voice is your brand. Learn how to communicate your value effectively in a crowded market.",
      date: "Nov 15, 2025",
      category: "Career",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=1000"
    },
    {
      title: "The Future of AI in Creative Workflows",
      excerpt: "AI isn't replacing creatives; it's augmenting them. Explore how designers and writers are using new tools to push boundaries.",
      date: "Nov 10, 2025",
      category: "AI",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000"
    }
  ];

  return (
    <div className="min-h-screen bg-background font-sans antialiased selection:bg-primary/10 selection:text-primary">
      {/* Navigation */}
      <header className="border-b border-border sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-xl">B</span>
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">Jane's Blog</span>
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
        <section className="py-20 md:py-28 border-b border-border bg-muted/10">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <Badge variant="secondary" className="mb-6 px-3 py-1 rounded-full text-sm font-medium">
                        Featured Post
                    </Badge>
                    <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-8 tracking-tight">
                        The Art of Digital Minimalism in 2024
                    </h1>
                    <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
                        In a world overflowing with notifications and endless feeds, the ability to focus has become a superpower.
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-12">
                        <Avatar className="h-12 w-12 border-2 border-background">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                            <div className="font-bold">Jane Doe</div>
                            <div className="text-sm text-muted-foreground">Nov 21, 2025 · 5 min read</div>
                        </div>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[21/9] group">
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                        <img 
                            src="https://images.unsplash.com/photo-1499750310159-57f0e1b013b6?auto=format&fit=crop&q=80&w=2000" 
                            alt="Hero" 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                        />
                    </div>
                </div>
            </div>
        </section>

        {/* Recent Posts Grid */}
        <section className="py-24">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="font-serif text-3xl font-bold">Recent Writings</h2>
                    <div className="relative w-64 hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search articles..." className="pl-9 rounded-full bg-muted/20 border-transparent focus:bg-background focus:border-border transition-all" />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {posts.slice(1).map((post, i) => (
                        <article key={i} className="group cursor-pointer flex flex-col h-full">
                            <div className="rounded-xl overflow-hidden mb-6 aspect-video bg-muted relative">
                                <div className="absolute top-4 left-4 z-10">
                                    <Badge className="bg-background/80 backdrop-blur text-foreground hover:bg-background">{post.category}</Badge>
                                </div>
                                <img 
                                    src={post.image} 
                                    alt={post.title} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                                    <span>{post.date}</span>
                                    <span>•</span>
                                    <span>{post.readTime}</span>
                                </div>
                                <h3 className="font-serif text-2xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight">
                                    {post.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                                    {post.excerpt}
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
                © 2025 Jane Doe. All rights reserved.
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

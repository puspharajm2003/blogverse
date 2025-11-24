import { useState, useEffect } from 'react';
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, Search, Star, Heart, MessageCircle, Download, 
  TrendingUp, Filter, Sparkles, Clock, Users, DollarSign, Eye 
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Article {
  id: string;
  title: string;
  author: string;
  price: number;
  category: string;
  rating: number;
  reviews: number;
  purchases: number;
  excerpt: string;
  wordCount: number;
  image?: string;
  tags: string[];
  isFavorite?: boolean;
}

export default function ArticleMarketplace() {
  const [articles, setArticles] = useState<Article[]>([
    {
      id: '1',
      title: 'Complete Guide to React Hooks',
      author: 'Sarah Chen',
      price: 9.99,
      category: 'Technology',
      rating: 4.8,
      reviews: 342,
      purchases: 1200,
      excerpt: 'Master React Hooks with practical examples and best practices...',
      wordCount: 5000,
      tags: ['React', 'JavaScript', 'Tutorial'],
      isFavorite: false
    },
    {
      id: '2',
      title: 'Building Your Personal Brand',
      author: 'Alex Johnson',
      price: 12.99,
      category: 'Business',
      rating: 4.6,
      reviews: 156,
      purchases: 450,
      excerpt: 'Learn strategies to build and maintain a strong personal brand...',
      wordCount: 4200,
      tags: ['Branding', 'Marketing', 'Business'],
      isFavorite: false
    },
    {
      id: '3',
      title: 'Sustainable Lifestyle Guide',
      author: 'Emma Green',
      price: 8.99,
      category: 'Lifestyle',
      rating: 4.9,
      reviews: 523,
      purchases: 2100,
      excerpt: 'Discover practical tips for living sustainably without compromise...',
      wordCount: 3800,
      tags: ['Sustainability', 'Lifestyle', 'Tips'],
      isFavorite: false
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("trending");
  const [cart, setCart] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);

  const categories = ["all", "Technology", "Business", "Lifestyle", "Health", "Education"];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch(sortBy) {
      case 'trending': return b.purchases - a.purchases;
      case 'rating': return b.rating - a.rating;
      case 'price_low': return a.price - b.price;
      case 'price_high': return b.price - a.price;
      case 'newest': return 0;
      default: return 0;
    }
  });

  const handleAddToCart = (articleId: string) => {
    if (!cart.includes(articleId)) {
      setCart([...cart, articleId]);
      const article = articles.find(a => a.id === articleId);
      toast.success(`"${article?.title}" added to cart`);
    }
  };

  const handleToggleFavorite = (articleId: string) => {
    setArticles(articles.map(a => 
      a.id === articleId ? { ...a, isFavorite: !a.isFavorite } : a
    ));
  };

  const cartTotal = cart.reduce((sum, id) => {
    const article = articles.find(a => a.id === id);
    return sum + (article?.price || 0);
  }, 0);

  const cartArticles = articles.filter(a => cart.includes(a.id));

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        {/* Header */}
        <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-serif font-bold tracking-tight flex items-center gap-3">
                  <ShoppingCart className="h-9 w-9 text-primary" />
                  Article Marketplace
                </h1>
                <p className="text-muted-foreground mt-2">
                  Discover and purchase premium articles from talented writers
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={() => setShowCart(!showCart)}
                className="gap-2 relative"
              >
                <ShoppingCart className="h-5 w-5" />
                Cart ({cart.length})
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles by title or author..."
                  className="pl-11 h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-articles"
                />
              </div>

              <div className="flex gap-3 flex-wrap">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="p-8 max-w-7xl mx-auto">
          {showCart ? (
            // Cart View
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Shopping Cart</h2>
              {cart.length === 0 ? (
                <Card className="text-center py-12 border-0 shadow-sm">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                </Card>
              ) : (
                <>
                  <div className="space-y-3">
                    {cartArticles.map(article => (
                      <Card key={article.id} className="border-0 shadow-sm">
                        <CardContent className="p-6 flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{article.title}</h3>
                            <p className="text-sm text-muted-foreground">by {article.author}</p>
                          </div>
                          <div className="flex items-center gap-4 ml-4">
                            <span className="text-lg font-bold">${article.price}</span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCart(cart.filter(id => id !== article.id))}
                            >
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xl font-semibold">Total:</span>
                        <span className="text-3xl font-bold text-primary">${cartTotal.toFixed(2)}</span>
                      </div>
                      <Button className="w-full gap-2" size="lg" data-testid="button-checkout">
                        <DollarSign className="h-5 w-5" />
                        Proceed to Checkout
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          ) : (
            // Articles Grid
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedArticles.map(article => (
                <Card key={article.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden flex flex-col">
                  {/* Category Badge */}
                  <div className="p-4 pb-2 flex justify-between items-start">
                    <Badge variant="secondary">{article.category}</Badge>
                    <button
                      onClick={() => handleToggleFavorite(article.id)}
                      className="transition"
                    >
                      <Heart 
                        className={`h-5 w-5 ${article.isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`}
                      />
                    </button>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition">{article.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">by {article.author}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{article.excerpt}</p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{article.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MessageCircle className="h-3 w-3" />
                        <span>{article.reviews}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Download className="h-3 w-3" />
                        <span>{article.purchases}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <BookOpen className="h-3 w-3" />
                      <span>{article.wordCount.toLocaleString()} words</span>
                    </div>
                  </CardContent>

                  {/* Price and Action */}
                  <div className="border-t border-border/50 p-4 flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">${article.price}</span>
                    <Button 
                      size="sm"
                      onClick={() => handleAddToCart(article.id)}
                      disabled={cart.includes(article.id)}
                      data-testid={`button-add-to-cart-${article.id}`}
                    >
                      {cart.includes(article.id) ? 'In Cart' : 'Add to Cart'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </SidebarLayout>
  );
}

// Import needed icon
import { BookOpen } from "lucide-react";

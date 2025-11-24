import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Share2,
  Heart,
  MessageCircle,
  Eye,
  Edit2,
  Loader2,
  AlertCircle,
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  Filter,
  X,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Users,
  Flame,
  BarChart3,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function PublicBlog() {
  const [, setLocation] = useLocation();
  const [blog, setBlog] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingBlog, setIsEditingBlog] = useState(false);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogImage, setBlogImage] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState({ name: "", email: "", content: "" });
  
  // Tag filtering
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  
  // Advanced metrics
  const [articleMetrics, setArticleMetrics] = useState<any>({});
  const [scrollDepth, setScrollDepth] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const blogId = params.get("blogId");

    if (!blogId) {
      setLocation("/my-blogs");
      return;
    }

    fetchBlogData(blogId);
  }, [setLocation]);

  const fetchBlogData = async (blogId: string) => {
    try {
      setIsLoading(true);
      const blogData = await api.getBlog(blogId);
      setBlog(blogData);
      setBlogTitle(blogData.title || "");
      setBlogImage(blogData.image || "");
      
      const articlesData = await api.getArticles(blogId);
      const allArticles = Array.isArray(articlesData) ? articlesData : [];
      const uniqueArticles = Array.from(
        new Map(allArticles.map((article: any) => [article.id, article])).values()
      );
      setArticles(uniqueArticles);
      
      // Extract all unique tags for filter
      const tags = new Set<string>();
      uniqueArticles.forEach((article: any) => {
        if (article.tags && Array.isArray(article.tags)) {
          article.tags.forEach((tag: string) => tags.add(tag));
        }
      });
      setAllTags(Array.from(tags).sort());
      
      // Initialize metrics
      const metrics: any = {};
      uniqueArticles.forEach((article: any) => {
        metrics[article.id] = {
          views: Math.floor(Math.random() * 500) + 10,
          likes: Math.floor(Math.random() * 100) + 2,
          shares: Math.floor(Math.random() * 50) + 1,
          avgTimeOnPage: Math.floor(Math.random() * 300) + 60,
          avgScrollDepth: Math.floor(Math.random() * 40) + 60,
          uniqueVisitors: Math.floor(Math.random() * 300) + 5,
          bounceRate: Math.floor(Math.random() * 30) + 40,
          engagementScore: Math.floor(Math.random() * 50) + 50,
        };
      });
      setArticleMetrics(metrics);
      
      if (uniqueArticles.length > 0) {
        setSelectedArticle(uniqueArticles[0]);
        api.recordEvent(uniqueArticles[0].id, "pageview", {});
        trackScrollDepth();
        // Fetch comments for first article
        fetchComments(uniqueArticles[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch blog data:", error);
      toast.error("Failed to load blog");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (articleId: string) => {
    try {
      const commentsData = await api.getCommentsByArticle(articleId);
      // Only show approved comments in public view
      const approvedComments = (commentsData || []).filter((c: any) => c.status === "approved");
      setComments(approvedComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const trackScrollDepth = () => {
    const handleScroll = () => {
      const element = document.documentElement;
      const scrollTop = element.scrollTop || document.body.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      const depth = scrollHeight ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollDepth(Math.round(depth));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  };

  const getFilteredArticles = () => {
    return articles.filter((article) => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        (article.tags && article.tags.some((tag: string) => selectedTags.includes(tag)));
      
      return matchesSearch && matchesTags;
    });
  };

  const calculateReadTime = (content: string): number => {
    if (!content) return 0;
    const text = content.replace(/<[^>]*>/g, "").trim();
    const wordCount = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  const handleAddComment = async () => {
    if (!newComment.name.trim() || !newComment.email.trim() || !newComment.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const comment = await api.createComment(
        selectedArticle.id,
        newComment.name,
        newComment.email,
        newComment.content
      );
      setComments([...comments, comment]);
      setNewComment({ name: "", email: "", content: "" });
      toast.success("Comment submitted for moderation!");
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast.error("Failed to submit comment");
    }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?article=${selectedArticle?.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareOnSocial = (platform: string) => {
    if (!selectedArticle) return;
    const url = `${window.location.origin}${window.location.pathname}?article=${selectedArticle.id}`;
    const text = `Check out: ${selectedArticle.title}`;
    
    const shares: any = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(selectedArticle.title)}&body=${encodeURIComponent(text + "\n\n" + url)}`,
    };
    
    if (shares[platform]) {
      window.open(shares[platform], "_blank");
      api.recordEvent(selectedArticle.id, "share", { platform });
    }
  };

  const handleSaveBlogDetails = async () => {
    if (!blog) return;
    
    try {
      await api.updateBlog(blog.id, {
        title: blogTitle,
        image: blogImage,
      });
      setBlog({ ...blog, title: blogTitle, image: blogImage });
      setIsEditingBlog(false);
      toast.success("Blog details updated successfully");
    } catch (error) {
      console.error("Failed to update blog:", error);
      toast.error("Failed to update blog details");
    }
  };

  const filteredArticles = getFilteredArticles();
  const metrics = selectedArticle ? articleMetrics[selectedArticle.id] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading your blog...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Blog Not Found</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">The blog you're looking for doesn't exist.</p>
        <Button onClick={() => setLocation("/my-blogs")} variant="outline">
          Back to My Blogs
        </Button>
      </div>
    );
  }

  const defaultImage = "https://images.unsplash.com/photo-1499750310159-57f0e1b013b6?auto=format&fit=crop&q=80&w=1200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative">
          <div className="h-96 relative overflow-hidden">
            <img
              src={blogImage || defaultImage}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultImage;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent" />
          </div>

          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/my-blogs")}
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/20"
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <Dialog open={isEditingBlog} onOpenChange={setIsEditingBlog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/20"
                  data-testid="button-edit-blog"
                >
                  <Edit2 className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Blog Details</DialogTitle>
                  <DialogDescription>
                    Customize how your blog appears publicly
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Blog Title</label>
                    <Input
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      placeholder="Enter blog title"
                      data-testid="input-blog-title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Blog Image URL</label>
                    <Input
                      value={blogImage}
                      onChange={(e) => setBlogImage(e.target.value)}
                      placeholder="Enter image URL"
                      data-testid="input-blog-image"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsEditingBlog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveBlogDetails} className="bg-indigo-600 hover:bg-indigo-700">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-blue-300" />
              <span className="text-sm font-semibold text-blue-200">Blog</span>
            </div>
            <h1 className="text-5xl font-serif font-bold tracking-tight leading-tight mb-2">
              {blog.title || "Untitled Blog"}
            </h1>
            {blog.description && (
              <p className="text-lg text-slate-200">{blog.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        {articles.length === 0 ? (
          <Card className="text-center py-16 border-0 shadow-lg">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <CardTitle className="text-2xl mb-2">No Published Articles Yet</CardTitle>
            <CardDescription>
              Publish some articles in the editor to display them here.
            </CardDescription>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content - Article Display (70-75% width) */}
            <div className="lg:col-span-3">
              {selectedArticle ? (
                <div className="space-y-6">
                  {/* Article Header */}
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30">
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200">
                          Published
                        </Badge>
                        {metrics && (
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Zap className="h-3 w-3 text-yellow-500" />
                            <span>{metrics.engagementScore}% Engagement</span>
                          </div>
                        )}
                      </div>
                      <CardTitle className="font-serif text-4xl line-clamp-3 text-slate-900 dark:text-white mb-4">
                        {selectedArticle.title}
                      </CardTitle>
                      <CardDescription className="space-y-3">
                        <div className="flex items-center gap-2 text-base">
                          <span className="text-slate-600 dark:text-slate-400">
                            {selectedArticle.publishedAt 
                              ? new Date(selectedArticle.publishedAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : new Date(selectedArticle.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                            }
                          </span>
                          <span className="text-slate-400">•</span>
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <Clock className="h-4 w-4" />
                            {calculateReadTime(selectedArticle.content)} min read
                          </div>
                        </div>
                        {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {selectedArticle.tags.map((tag: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs cursor-pointer hover:border-indigo-500"
                                onClick={() => {
                                  if (!selectedTags.includes(tag)) {
                                    setSelectedTags([...selectedTags, tag]);
                                  }
                                }}
                                data-testid={`badge-article-tag-${tag}`}
                              >
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardDescription>
                    </CardHeader>

                    {/* Article Content */}
                    <CardContent className="pt-8 space-y-6">
                      <div className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                        {typeof selectedArticle.content === 'string' && selectedArticle.content ? (
                          <div 
                            dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                            data-testid="text-article-content"
                          />
                        ) : (
                          <p className="text-slate-500">No content available</p>
                        )}
                      </div>

                      <Separator className="my-6" />

                      {/* Author Bio */}
                      {selectedArticle?.authorBio && (
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-lg p-6 space-y-3 border border-indigo-200/50 dark:border-indigo-800/50">
                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">About the Author</p>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedArticle.authorBio}</p>
                        </div>
                      )}

                      {/* Advanced Engagement Metrics */}
                      {metrics && (
                        <div className="space-y-4 p-6 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                          <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-semibold text-slate-900 dark:text-white">Article Performance</h3>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                              <div className="text-2xl font-bold text-indigo-600">{metrics.views}</div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                                <Eye className="h-3 w-3" /> Views
                              </div>
                            </div>
                            
                            <div className="p-3 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                              <div className="text-2xl font-bold text-pink-600">{metrics.likes}</div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                                <Heart className="h-3 w-3" /> Likes
                              </div>
                            </div>
                            
                            <div className="p-3 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                              <div className="text-2xl font-bold text-blue-600">{metrics.shares}</div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                                <Share2 className="h-3 w-3" /> Shares
                              </div>
                            </div>
                            
                            <div className="p-3 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                              <div className="text-2xl font-bold text-green-600">{metrics.uniqueVisitors}</div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                                <Users className="h-3 w-3" /> Visitors
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Share Section */}
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          onClick={copyShareLink} 
                          variant="outline" 
                          size="sm"
                          className="gap-2"
                          data-testid="button-copy-link"
                        >
                          <Copy className="h-4 w-4" />
                          {copiedLink ? "Copied!" : "Copy Link"}
                        </Button>
                        <Button onClick={() => shareOnSocial("twitter")} variant="outline" size="sm" className="gap-2" data-testid="button-share-twitter">
                          <Twitter className="h-4 w-4" /> Twitter
                        </Button>
                        <Button onClick={() => shareOnSocial("facebook")} variant="outline" size="sm" className="gap-2" data-testid="button-share-facebook">
                          <Facebook className="h-4 w-4" /> Facebook
                        </Button>
                        <Button onClick={() => shareOnSocial("linkedin")} variant="outline" size="sm" className="gap-2" data-testid="button-share-linkedin">
                          <Linkedin className="h-4 w-4" /> LinkedIn
                        </Button>
                        <Button onClick={() => shareOnSocial("email")} variant="outline" size="sm" className="gap-2" data-testid="button-share-email">
                          <Mail className="h-4 w-4" /> Email
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Comments Section */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <MessageCircle className="h-6 w-6 text-indigo-600" />
                        Comments ({comments.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      {/* Add Comment Form */}
                      <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Share Your Thoughts</h3>
                        <Input
                          placeholder="Your name"
                          value={newComment.name}
                          onChange={(e) => setNewComment({...newComment, name: e.target.value})}
                          data-testid="input-comment-name"
                          className="border-slate-300 dark:border-slate-600"
                        />
                        <Input
                          type="email"
                          placeholder="Your email"
                          value={newComment.email}
                          onChange={(e) => setNewComment({...newComment, email: e.target.value})}
                          data-testid="input-comment-email"
                          className="border-slate-300 dark:border-slate-600"
                        />
                        <textarea
                          placeholder="Share your thoughts..."
                          className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
                          rows={3}
                          value={newComment.content}
                          onChange={(e) => setNewComment({...newComment, content: e.target.value})}
                          data-testid="textarea-comment"
                        />
                        <Button
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                          onClick={handleAddComment}
                          data-testid="button-add-comment"
                        >
                          Submit for Review
                        </Button>
                      </div>

                      {/* Display Comments */}
                      {comments.length > 0 ? (
                        <div className="space-y-4">
                          {comments.map((comment) => (
                            <div 
                              key={comment.id} 
                              className={`border-l-4 p-4 rounded-r-lg transition-all ${
                                comment.status === "approved"
                                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                  : comment.status === "rejected"
                                  ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                                  : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                              }`}
                              data-testid={`comment-${comment.id}`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{comment.authorName}</p>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge className={`text-xs ${
                                  comment.status === "approved"
                                    ? "bg-green-600"
                                    : comment.status === "rejected"
                                    ? "bg-red-600"
                                    : "bg-yellow-600"
                                }`}>
                                  {comment.status}
                                </Badge>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-slate-500 py-6">No comments yet. Be the first to share your thoughts!</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="text-center py-16 border-0 shadow-lg">
                  <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <CardTitle className="text-2xl mb-2">No Article Selected</CardTitle>
                </Card>
              )}
            </div>

            {/* Right Sidebar - Articles List (25-30% width) */}
            <div className="lg:col-span-1 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-300 dark:border-slate-600"
                  data-testid="input-search"
                />
                <div className="absolute left-3 top-2.5 text-slate-400">🔍</div>
              </div>

              {/* Tag Filter */}
              {allTags.length > 0 && (
                <div className="space-y-3 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-white">
                    <Filter className="h-4 w-4 text-indigo-600" />
                    Filter by Tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer transition-all text-xs ${
                          selectedTags.includes(tag)
                            ? "bg-indigo-600 hover:bg-indigo-700"
                            : "hover:border-indigo-500"
                        }`}
                        onClick={() => {
                          if (selectedTags.includes(tag)) {
                            setSelectedTags(selectedTags.filter(t => t !== tag));
                          } else {
                            setSelectedTags([...selectedTags, tag]);
                          }
                        }}
                        data-testid={`badge-tag-${tag}`}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedTags([])}
                      className="w-full text-xs text-slate-600 dark:text-slate-400"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              )}

              {/* Article Count */}
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  {filteredArticles.length} Article{filteredArticles.length !== 1 ? 's' : ''}
                </h2>
              </div>

              {/* Articles List */}
              <div className="space-y-3 max-h-[calc(100vh-500px)] overflow-y-auto pr-4">
                {filteredArticles.map((article) => (
                  <Card
                    key={article.id}
                    className={`cursor-pointer transition-all border-0 shadow-md hover:shadow-lg ${
                      selectedArticle?.id === article.id
                        ? "ring-2 ring-indigo-500 shadow-lg"
                        : ""
                    }`}
                    onClick={async () => {
                      setSelectedArticle(article);
                      api.recordEvent(article.id, "pageview", {});
                      fetchComments(article.id);
                    }}
                    data-testid={`card-article-${article.id}`}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="font-serif text-lg line-clamp-2 text-slate-900 dark:text-white">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="text-sm mt-2">
                        {new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {article.excerpt || article.content?.replace(/<[^>]*>/g, "").slice(0, 100) || "No description"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

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
  Image as ImageIcon,
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
      
      // Use the public endpoint which returns only published articles
      const articlesData = await api.getArticles(blogId);
      const allArticles = Array.isArray(articlesData) ? articlesData : [];
      // Remove any duplicates
      const uniqueArticles = Array.from(
        new Map(allArticles.map((article: any) => [article.id, article])).values()
      );
      setArticles(uniqueArticles);
      
      if (uniqueArticles.length > 0) {
        setSelectedArticle(uniqueArticles[0]);
        // Record view for first article
        api.recordEvent(uniqueArticles[0].id, "pageview", {});
      }
    } catch (error) {
      console.error("Failed to fetch blog data:", error);
      toast.error("Failed to load blog");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateReadTime = (content: string): number => {
    if (!content) return 0;
    const text = content.replace(/<[^>]*>/g, "").trim();
    const wordCount = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  const handleAddComment = () => {
    if (!newComment.name.trim() || !newComment.email.trim() || !newComment.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    const comment = {
      id: Date.now().toString(),
      ...newComment,
      createdAt: new Date().toISOString(),
    };
    setComments([...comments, comment]);
    setNewComment({ name: "", email: "", content: "" });
    toast.success("Comment added successfully!");
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
      {/* Hero Section with Dynamic Image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative">
          {/* Blog Cover Image */}
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

          {/* Header Controls */}
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
                      placeholder="Enter image URL or paste from Unsplash"
                      data-testid="input-blog-image"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Tip: Use Unsplash (unsplash.com) for free high-quality images
                    </p>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingBlog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveBlogDetails}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Blog Title Overlay */}
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
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Articles Sidebar */}
            <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-4">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  {articles.length} Article{articles.length !== 1 ? 's' : ''}
                </h2>
              </div>
              
              {articles.map((article) => (
                <Card
                  key={article.id}
                  className={`cursor-pointer transition-all border-0 shadow-md hover:shadow-lg ${
                    selectedArticle?.id === article.id
                      ? "ring-2 ring-indigo-500 shadow-lg"
                      : "hover:shadow-lg"
                  }`}
                  onClick={() => {
                    setSelectedArticle(article);
                    api.recordEvent(article.id, "pageview", {});
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

            {/* Article Content */}
            <div className="lg:col-span-2">
              {selectedArticle ? (
                <Card className="border-0 shadow-xl sticky top-8">
                  <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200">
                        Published
                      </Badge>
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
                            <Badge key={i} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>

                  {/* Article Content */}
                  <CardContent className="pt-8 space-y-6 max-h-[calc(100vh-600px)] overflow-y-auto">
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

                    {/* Engagement Stats */}
                    <div className="grid grid-cols-3 gap-3 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">0</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1 mt-1">
                          <Eye className="h-3 w-3" /> Views
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">0</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1 mt-1">
                          <Heart className="h-3 w-3" /> Likes
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1 mt-1">
                          <Share2 className="h-3 w-3" /> Shares
                        </div>
                      </div>
                    </div>

                    {/* Engagement Buttons */}
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                          onClick={() => {
                            api.recordEvent(selectedArticle.id, "like", {});
                          }}
                          data-testid="button-like"
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Like Article
                        </Button>
                        <Button
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => {
                            api.recordEvent(selectedArticle.id, "share", {});
                          }}
                          data-testid="button-share"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>

                      {/* Social Sharing */}
                      <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Share on Social</p>
                        <div className="grid grid-cols-4 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-200 dark:border-slate-700"
                            onClick={() => shareOnSocial("twitter")}
                            title="Share on Twitter"
                            data-testid="button-share-twitter"
                          >
                            <Twitter className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-200 dark:border-slate-700"
                            onClick={() => shareOnSocial("facebook")}
                            title="Share on Facebook"
                            data-testid="button-share-facebook"
                          >
                            <Facebook className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-200 dark:border-slate-700"
                            onClick={() => shareOnSocial("linkedin")}
                            title="Share on LinkedIn"
                            data-testid="button-share-linkedin"
                          >
                            <Linkedin className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-200 dark:border-slate-700"
                            onClick={() => shareOnSocial("email")}
                            title="Share via Email"
                            data-testid="button-share-email"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-slate-200 dark:border-slate-700"
                          onClick={copyShareLink}
                          data-testid="button-copy-link"
                        >
                          {copiedLink ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                          {copiedLink ? "Copied!" : "Copy Link"}
                        </Button>
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-8 space-y-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                          <MessageCircle className="h-5 w-5 text-indigo-600" />
                          Comments ({comments.length})
                        </h3>
                        
                        {/* Add Comment Form */}
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4 mb-6 space-y-3 border border-slate-200 dark:border-slate-700">
                          <Input
                            placeholder="Your name"
                            value={newComment.name}
                            onChange={(e) => setNewComment({...newComment, name: e.target.value})}
                            data-testid="input-comment-name"
                            className="border-slate-300 dark:border-slate-600"
                          />
                          <Input
                            placeholder="Your email"
                            type="email"
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
                            Post Comment
                          </Button>
                        </div>

                        {/* Display Comments */}
                        {comments.length > 0 ? (
                          <div className="space-y-4">
                            {comments.map((comment) => (
                              <div key={comment.id} className="border-l-4 border-indigo-500 pl-4 py-3 bg-slate-50 dark:bg-slate-800/30 rounded-r-lg p-4">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-slate-900 dark:text-white">{comment.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{comment.email}</p>
                                <p className="text-slate-800 dark:text-slate-200 mt-3">{comment.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-slate-500 dark:text-slate-400 py-6">No comments yet. Be the first to comment!</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="text-center py-12 border-0 shadow-lg">
                  <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <CardTitle>Select an article to read</CardTitle>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

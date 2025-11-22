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
  const [articleEngagement, setArticleEngagement] = useState<Record<string, any>>({"views": 0, "likes": 0, "shares": 0});
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState({ name: "", email: "", content: "" });
  const [copiedLink, setCopiedLink] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Blog Not Found</h1>
        <p className="text-muted-foreground mb-6">The blog you're looking for doesn't exist.</p>
        <Button onClick={() => setLocation("/my-blogs")} variant="outline">
          Back to My Blogs
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
      {/* Header with Hero Image */}
      <div className="relative h-80 bg-muted overflow-hidden">
        <img
          src={
            blogImage ||
            "https://images.unsplash.com/photo-1499750310159-57f0e1b013b6?auto=format&fit=crop&q=80&w=1200"
          }
          alt={blog.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back Button & Controls */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/my-blogs")}
            className="bg-background/50 backdrop-blur-sm hover:bg-background/70 text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Dialog open={isEditingBlog} onOpenChange={setIsEditingBlog}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/50 backdrop-blur-sm hover:bg-background/70 text-foreground"
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
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Blog Image URL</label>
                  <Input
                    value={blogImage}
                    onChange={(e) => setBlogImage(e.target.value)}
                    placeholder="Enter image URL"
                  />
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
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Blog Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
            {blog.title || "Untitled Blog"}
          </h1>
          <p className="text-gray-200 mt-2">{blog.description || ""}</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Articles List */}
          <div className="lg:col-span-2 space-y-6">
            {articles.length === 0 ? (
              <Card className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle>No Published Articles</CardTitle>
                <CardDescription>
                  No articles have been published yet. Publish some articles in the editor to display them here.
                </CardDescription>
              </Card>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                {articles.length > 0 ? articles.map((article) => (
                  <Card
                    key={article.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedArticle?.id === article.id
                        ? "border-primary shadow-md"
                        : ""
                    }`}
                    onClick={() => setSelectedArticle(article)}
                  >
                    <CardHeader>
                      <CardTitle className="font-serif text-xl">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="text-sm mt-2">
                        Published on {new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2">
                        {article.excerpt ||
                          article.content?.replace(/<[^>]*>/g, "").slice(0, 160) || "No description"}
                      </p>
                    </CardContent>
                  </Card>
                )) : (
                  <Card className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <CardTitle>No Articles Yet</CardTitle>
                    <CardDescription>
                      Create and save articles in the editor to display them here
                    </CardDescription>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Article Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              {selectedArticle ? (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={selectedArticle.status === "published" ? "default" : "outline"}>
                        {selectedArticle.status === "published" ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <CardTitle className="font-serif text-2xl line-clamp-2 mt-2">
                      {selectedArticle.title}
                    </CardTitle>
                    <CardDescription className="mt-2 space-y-2">
                      <div>
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
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        {calculateReadTime(selectedArticle.content)} min read
                      </div>
                      {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {selectedArticle.tags.map((tag: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6 space-y-4 max-h-96 overflow-y-auto">
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                      {typeof selectedArticle.content === 'string' && selectedArticle.content ? (
                        <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                      ) : (
                        <p className="text-muted-foreground">No content available</p>
                      )}
                    </div>
                    <Separator className="my-4" />
                    
                    {/* Author Bio Section */}
                    {selectedArticle?.authorBio && (
                      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">About the Author</p>
                        <p className="text-sm leading-relaxed">{selectedArticle.authorBio}</p>
                      </div>
                    )}

                    <div className="space-y-4 pt-4">
                      <div className="grid grid-cols-3 gap-2 text-center py-3 bg-muted/30 rounded-lg">
                        <div>
                          <div className="text-lg font-semibold text-primary">0</div>
                          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                            <Eye className="h-3 w-3" /> Views
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-primary">0</div>
                          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                            <Heart className="h-3 w-3" /> Likes
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-primary">0</div>
                          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                            <Share2 className="h-3 w-3" /> Shares
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              api.recordEvent(selectedArticle.id, "like", {});
                              setArticleEngagement(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
                            }}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Like
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              api.recordEvent(selectedArticle.id, "share", {});
                              setArticleEngagement(prev => ({ ...prev, shares: (prev.shares || 0) + 1 }));
                            }}
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>

                        {/* Social Sharing Buttons */}
                        <div className="space-y-2 border-t pt-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Share on Social</p>
                          <div className="grid grid-cols-4 gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => shareOnSocial("twitter")}
                              title="Share on Twitter"
                            >
                              <Twitter className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => shareOnSocial("facebook")}
                              title="Share on Facebook"
                            >
                              <Facebook className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => shareOnSocial("linkedin")}
                              title="Share on LinkedIn"
                            >
                              <Linkedin className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => shareOnSocial("email")}
                              title="Share via Email"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-8"
                            onClick={copyShareLink}
                          >
                            {copiedLink ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            {copiedLink ? "Copied!" : "Copy Link"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-8 space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          Comments ({comments.length})
                        </h3>
                        
                        {/* Add Comment Form */}
                        <div className="bg-muted/30 rounded-lg p-4 mb-6 space-y-3">
                          <Input
                            placeholder="Your name"
                            value={newComment.name}
                            onChange={(e) => setNewComment({...newComment, name: e.target.value})}
                            data-testid="input-comment-name"
                          />
                          <Input
                            placeholder="Your email"
                            type="email"
                            value={newComment.email}
                            onChange={(e) => setNewComment({...newComment, email: e.target.value})}
                            data-testid="input-comment-email"
                          />
                          <textarea
                            placeholder="Share your thoughts..."
                            className="w-full p-2 rounded border border-border bg-background text-foreground resize-none"
                            rows={3}
                            value={newComment.content}
                            onChange={(e) => setNewComment({...newComment, content: e.target.value})}
                            data-testid="textarea-comment"
                          />
                          <Button
                            className="w-full"
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
                              <div key={comment.id} className="border-l-2 border-primary pl-4 py-2">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-sm">{comment.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{comment.email}</p>
                                <p className="text-sm mt-2">{comment.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground text-sm py-4">
                            No comments yet. Be the first to comment!
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Select an article to preview
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

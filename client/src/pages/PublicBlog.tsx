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
      
      const articlesData = await api.getArticlesByBlogAdmin(blogId);
      // Show all articles (both draft and published), remove duplicates
      const allArticles = articlesData || [];
      const uniqueArticles = Array.from(
        new Map(allArticles.map((article: any) => [article.id, article])).values()
      );
      setArticles(uniqueArticles);
      
      if (uniqueArticles.length > 0) {
        setSelectedArticle(uniqueArticles[0]);
      }
    } catch (error) {
      console.error("Failed to fetch blog data:", error);
      toast.error("Failed to load blog");
    } finally {
      setIsLoading(false);
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
                <CardTitle>No Articles Yet</CardTitle>
                <CardDescription>
                  Write and save articles in the editor to display them here.
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
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="font-serif text-xl">
                          {article.title}
                        </CardTitle>
                        <Badge variant={article.status === "published" ? "default" : "outline"}>
                          {article.status === "published" ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4 text-sm mt-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" /> 2.4K views
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" /> 128 likes
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" /> 24 comments
                        </span>
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
                    <CardDescription className="mt-2">
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Like
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
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

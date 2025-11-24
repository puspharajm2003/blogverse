import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { api } from "@/lib/api";
import {
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Eye,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<string>("");
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const blogsData = await api.getBlogs();
      setBlogs(blogsData || []);
      if ((blogsData || []).length > 0) {
        setSelectedBlog((blogsData as any[])[0].id);
        await fetchComments((blogsData as any[])[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (blogId: string) => {
    try {
      setIsFetching(true);
      const commentsData = await api.getCommentsByBlog(blogId);
      setComments(commentsData || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setIsFetching(false);
    }
  };

  const handleBlogChange = (blogId: string) => {
    setSelectedBlog(blogId);
    fetchComments(blogId);
  };

  const handleApprove = async (commentId: string) => {
    try {
      await api.updateCommentStatus(commentId, "approved");
      setComments(comments.map(c => c.id === commentId ? { ...c, status: "approved" } : c));
      toast.success("Comment approved!");
    } catch (error) {
      console.error("Failed to approve comment:", error);
      toast.error("Failed to approve comment");
    }
  };

  const handleReject = async (commentId: string) => {
    try {
      await api.updateCommentStatus(commentId, "rejected");
      setComments(comments.map(c => c.id === commentId ? { ...c, status: "rejected" } : c));
      toast.error("Comment rejected");
    } catch (error) {
      console.error("Failed to reject comment:", error);
      toast.error("Failed to reject comment");
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await api.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const pendingComments = comments.filter(c => c.status === "pending");
  const approvedComments = comments.filter(c => c.status === "approved");
  const rejectedComments = comments.filter(c => c.status === "rejected");

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Comment Moderation</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and moderate comments across your blogs</p>
        </div>

        {blogs.length === 0 ? (
          <Card className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <CardTitle className="text-2xl mb-2">No Blogs Found</CardTitle>
            <CardDescription>Create a blog first to manage comments</CardDescription>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Blog Selection */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {blogs.map((blog) => (
                <Button
                  key={blog.id}
                  variant={selectedBlog === blog.id ? "default" : "outline"}
                  onClick={() => handleBlogChange(blog.id)}
                  className={selectedBlog === blog.id ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                  data-testid={`button-blog-${blog.id}`}
                >
                  {blog.title}
                </Button>
              ))}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                    Total Comments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{comments.length}</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    Pending Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{pendingComments.length}</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Approved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{approvedComments.length}</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Rejected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{rejectedComments.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Comments List */}
            {isFetching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : comments.length === 0 ? (
              <Card className="text-center py-16">
                <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <CardTitle className="text-2xl mb-2">No Comments</CardTitle>
                <CardDescription>No comments have been posted on your blog yet</CardDescription>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Pending Comments */}
                {pendingComments.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      Pending Review ({pendingComments.length})
                    </h2>
                    {pendingComments.map((comment) => (
                      <Card key={comment.id} className="border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{comment.authorName}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{comment.authorEmail}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                {new Date(comment.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pending</Badge>
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 mb-4">{comment.content}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(comment.id)}
                              data-testid={`button-approve-${comment.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => handleReject(comment.id)}
                              data-testid={`button-reject-${comment.id}`}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Approved Comments */}
                {approvedComments.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Approved ({approvedComments.length})
                    </h2>
                    {approvedComments.map((comment) => (
                      <Card key={comment.id} className="border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{comment.authorName}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{comment.authorEmail}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                {new Date(comment.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="border-green-500 text-green-700">Approved</Badge>
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 mb-4">{comment.content}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => handleDelete(comment.id)}
                              data-testid={`button-delete-${comment.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Rejected Comments */}
                {rejectedComments.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      Rejected ({rejectedComments.length})
                    </h2>
                    {rejectedComments.map((comment) => (
                      <Card key={comment.id} className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20 opacity-75">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{comment.authorName}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{comment.authorEmail}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                {new Date(comment.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="border-red-500 text-red-700">Rejected</Badge>
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 mb-4">{comment.content}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => handleDelete(comment.id)}
                              data-testid={`button-delete-${comment.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}

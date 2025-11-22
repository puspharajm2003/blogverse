import { useState, useEffect } from "react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/api";
import { Trash2, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface DeletedArticle {
  id: string;
  blogId: string;
  title: string;
  excerpt: string;
  deletedAt: string;
}

export default function Trash() {
  const [deletedArticles, setDeletedArticles] = useState<DeletedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadDeletedArticles();
  }, []);

  const loadDeletedArticles = async () => {
    try {
      setIsLoading(true);
      // For now, load from localStorage (can be replaced with API call)
      const stored = localStorage.getItem("deleted_articles");
      const deleted = stored ? JSON.parse(stored) : [];
      setDeletedArticles(deleted);
    } catch (error) {
      console.error("Failed to load deleted articles:", error);
      toast.error("Failed to load trash");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (articleId: string) => {
    try {
      setRestoringId(articleId);
      // Remove from deleted list
      const updated = deletedArticles.filter(a => a.id !== articleId);
      setDeletedArticles(updated);
      localStorage.setItem("deleted_articles", JSON.stringify(updated));
      toast.success("Article restored to drafts");
    } catch (error) {
      console.error("Failed to restore article:", error);
      toast.error("Failed to restore article");
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDelete = async (articleId: string) => {
    try {
      const updated = deletedArticles.filter(a => a.id !== articleId);
      setDeletedArticles(updated);
      localStorage.setItem("deleted_articles", JSON.stringify(updated));
      toast.success("Article permanently deleted");
      setPermanentDeleteId(null);
    } catch (error) {
      console.error("Failed to delete permanently:", error);
      toast.error("Failed to delete permanently");
    }
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
        {/* Header */}
        <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-serif font-bold tracking-tight flex items-center gap-3">
                <Trash2 className="h-8 w-8 text-red-500" />
                Trash
              </h1>
              <p className="text-muted-foreground">
                Deleted articles are kept for 30 days. Restore them or permanently delete.
              </p>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 py-12">
          {deletedArticles.length === 0 ? (
            <Card className="text-center py-16">
              <Trash2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <CardTitle>Trash is Empty</CardTitle>
              <CardDescription className="mt-2">
                Deleted articles will appear here for 30 days before permanent deletion.
              </CardDescription>
            </Card>
          ) : (
            <div className="space-y-4">
              {deletedArticles.map((article) => (
                <Card key={article.id} className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="font-serif text-xl line-clamp-2">
                          {article.title || "Untitled"}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {article.excerpt || "No description"}
                        </CardDescription>
                        <p className="text-xs text-muted-foreground mt-3">
                          Deleted on {new Date(article.deletedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <Badge variant="destructive">Deleted</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRestore(article.id)}
                        disabled={restoringId === article.id}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        {restoringId === article.id ? "Restoring..." : "Restore"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => setPermanentDeleteId(article.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Permanently
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!permanentDeleteId} onOpenChange={(open) => !open && setPermanentDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Permanently Delete?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the article. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => permanentDeleteId && handlePermanentDelete(permanentDeleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Permanently Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarLayout>
  );
}

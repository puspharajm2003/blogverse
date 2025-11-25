import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Trash2, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState("reading-list");

  useEffect(() => {
    loadBookmarks();
  }, [collection]);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/api/bookmarks?collection=${collection}`);
      setBookmarks(data || []);
    } catch (error) {
      toast.error("Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api.delete(`/api/bookmarks/${id}`);
      setBookmarks(bookmarks.filter(b => b.id !== id));
      toast.success("Bookmark removed");
    } catch (error) {
      toast.error("Failed to remove bookmark");
    }
  };

  return (
    <SidebarLayout>
      <div className="flex-1 p-8 bg-gradient-to-br from-background via-background/95 to-background">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bookmark className="h-8 w-8 text-blue-500" />
              <h1 className="text-4xl font-serif font-bold">Reading List</h1>
            </div>
            <p className="text-muted-foreground">Articles you've saved to read later, synced across all your devices</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading your bookmarks...</p>
            </div>
          ) : bookmarks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No bookmarks yet</p>
                <Link href="/publish">
                  <Button variant="outline">Browse Articles</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookmarks.map((bookmark) => (
                <Card key={bookmark.id} className="hover:shadow-lg transition-shadow" data-testid={`bookmark-card-${bookmark.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-bold text-lg mb-2 truncate">
                          {bookmark.article?.title || "Untitled"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {bookmark.article?.excerpt || "No description"}
                        </p>
                        {bookmark.notes && (
                          <p className="text-sm italic text-muted-foreground mb-3 bg-muted p-2 rounded">
                            "{bookmark.notes}"
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Saved {new Date(bookmark.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/blog/preview?articleId=${bookmark.article?.id}`}>
                          <Button variant="outline" size="icon" data-testid={`read-article-${bookmark.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemove(bookmark.id)}
                          data-testid={`remove-bookmark-${bookmark.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}

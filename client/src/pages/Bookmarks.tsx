import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Trash2, ExternalLink, Grid3x3, List, Clock, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState("reading-list");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadBookmarks();
  }, [collection]);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await api.getBookmarks(collection);
      setBookmarks(data || []);
    } catch (error) {
      toast.error("Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api.removeBookmark(id);
      setBookmarks(bookmarks.filter(b => b.id !== id));
      toast.success("Bookmark removed");
    } catch (error) {
      toast.error("Failed to remove bookmark");
    }
  };

  const filteredBookmarks = bookmarks.filter(b =>
    b.article?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarLayout>
      <div className="flex-1 p-8 bg-gradient-to-br from-background via-background/95 to-background">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Bookmark className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Reading List</h1>
                  <p className="text-muted-foreground">Articles saved for later, synced across all your devices</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  data-testid="view-grid-button"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  data-testid="view-list-button"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 border border-input rounded-lg bg-background hover:border-blue-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  data-testid="search-bookmarks-input"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-200/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600">{bookmarks.length}</div>
                <p className="text-sm text-muted-foreground mt-1">Total Bookmarks</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-200/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-600">{bookmarks.length}</div>
                <p className="text-sm text-muted-foreground mt-1">Reading List</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-200/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600">{bookmarks.filter(b => b.notes).length}</div>
                <p className="text-sm text-muted-foreground mt-1">With Notes</p>
              </CardContent>
            </Card>
          </div>

          {/* Bookmarks Grid/List */}
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading your bookmarks...</p>
              </CardContent>
            </Card>
          ) : filteredBookmarks.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-500/10 to-gray-500/5">
              <CardContent className="py-12 text-center">
                <Bookmark className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">
                  {searchQuery ? "No bookmarks found" : "No bookmarks yet"}
                </p>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try adjusting your search" : "Start saving articles to read later"}
                </p>
                <Link href="/publish">
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                    Browse Articles
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div
              className={viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
              }
            >
              {filteredBookmarks.map((bookmark) => (
                <Card
                  key={bookmark.id}
                  className="hover:shadow-lg hover:border-blue-200/50 transition-all duration-300 group"
                  data-testid={`bookmark-card-${bookmark.id}`}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col h-full gap-4">
                      {/* Title & Excerpt */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 truncate">
                          {bookmark.article?.title || "Untitled"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {bookmark.article?.excerpt || "No description"}
                        </p>

                        {/* Notes */}
                        {bookmark.notes && (
                          <div className="mb-3 p-3 bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-200/50 rounded-lg">
                            <div className="flex gap-2 items-start">
                              <MessageSquare className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm italic text-amber-900 dark:text-amber-100 flex-1">
                                "{bookmark.notes}"
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Date */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Saved {new Date(bookmark.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Link href={`/blog/preview?articleId=${bookmark.article?.id}`} className="flex-1">
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            data-testid={`read-article-${bookmark.id}`}
                          >
                            <ExternalLink className="h-3 w-3 mr-2" />
                            Read
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemove(bookmark.id)}
                          className="hover:bg-destructive/10"
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

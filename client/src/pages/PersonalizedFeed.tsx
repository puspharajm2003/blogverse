import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useLocation } from "wouter";
import { Loader2, ArrowRight, Sparkles, Filter, Tag as TagIcon } from "lucide-react";
import { toast } from "sonner";
import { SidebarLayout } from "@/components/layout/SidebarLayout";

export default function PersonalizedFeed() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchFeed();
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const prefs = await api.getUserPreferences();
      setPreferences(prefs);
      setSelectedTags(prefs?.preferredTags || []);
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    }
  };

  const fetchFeed = async () => {
    try {
      setIsLoading(true);
      const feed = await api.getPersonalizedFeed(20);
      setArticles(Array.isArray(feed) ? feed : []);
      
      const tags = new Set<string>();
      feed?.forEach((article: any) => {
        if (article.tags && Array.isArray(article.tags)) {
          article.tags.forEach((tag: string) => tags.add(tag));
        }
      });
      setAllTags(Array.from(tags).sort());
    } catch (error) {
      console.error("Failed to fetch feed:", error);
      toast.error("Failed to load personalized feed");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (tag: string) => {
    try {
      const updated = selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag];
      
      setSelectedTags(updated);
      await api.updateUserPreferences({ preferredTags: updated });
      toast.success("Preferences updated!");
      fetchFeed();
    } catch (error) {
      toast.error("Failed to update preferences");
    }
  };

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-serif bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Your Personalized Feed
                </h1>
                <p className="text-muted-foreground mt-2">
                  Discover articles tailored to your interests and reading preferences
                </p>
              </div>
            </div>
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Topics You're Interested In
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer transition-all px-4 py-2 ${
                        selectedTags.includes(tag)
                          ? "bg-gradient-to-r from-violet-500 to-purple-500"
                          : "hover:border-violet-300"
                      }`}
                      onClick={() => updatePreference(tag)}
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Articles Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : articles.length === 0 ? (
            <Card className="text-center py-16 border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
              <Sparkles className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <CardTitle className="text-amber-900 dark:text-amber-100">No Articles Yet</CardTitle>
              <CardDescription className="text-amber-800/70">
                Start following topics to get personalized recommendations
              </CardDescription>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Card
                  key={article.id}
                  className="hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:scale-[1.02] group cursor-pointer overflow-hidden"
                  onClick={() => setLocation(`/public-blog?articleId=${article.id}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10 pointer-events-none" />
                  
                  <CardHeader className="relative pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
                      <div className="flex-1">
                        <CardTitle className="text-xl font-serif group-hover:text-violet-600 transition-colors line-clamp-2">
                          {article.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {article.excerpt || article.content?.substring(0, 120)}
                    </p>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {article.tags.slice(0, 3).map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {article.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{article.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                      <span>
                        {Math.ceil((article.content?.split(/\s+/).length || 0) / 200)} min read
                      </span>
                      <span>
                        {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* CTA */}
                    <Button
                      className="w-full mt-4 gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/public-blog?articleId=${article.id}`);
                      }}
                    >
                      Read Article
                      <ArrowRight className="h-4 w-4" />
                    </Button>
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

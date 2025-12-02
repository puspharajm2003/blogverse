import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ScheduledArticle {
  id: string;
  title: string;
  blogId: string;
  status: string;
  scheduledPublishAt?: string;
  createdAt?: string;
}

export default function ArticleScheduler() {
  const { user } = useAuth();
  const [scheduled, setScheduled] = useState<ScheduledArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScheduledArticles();
  }, [user]);

  const loadScheduledArticles = async () => {
    try {
      setLoading(true);
      const data = await api.getScheduledArticles();
      setScheduled(data || []);
    } catch (error) {
      console.error("Failed to load scheduled articles:", error);
      toast.error("Failed to load scheduled articles");
    } finally {
      setLoading(false);
    }
  };

  const formatScheduleTime = (date?: string) => {
    if (!date) return "—";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "Invalid date";
    }
  };

  const isUpcoming = (date?: string) => {
    if (!date) return false;
    return new Date(date) > new Date();
  };

  return (
    <SidebarLayout>
      <div className="flex-1 p-8 bg-gradient-to-br from-background via-background/95 to-background">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-500" />
                <h1 className="text-4xl font-serif font-bold">Article Scheduler</h1>
              </div>
            </div>
            <p className="text-muted-foreground">
              Schedule your articles for future publication and manage your content calendar
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Scheduled Articles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{scheduled.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {scheduled.filter((a) => isUpcoming(a.scheduledPublishAt)).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Next Publication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {scheduled.length > 0
                    ? formatScheduleTime(
                        scheduled.sort((a, b) => {
                          const dateA = new Date(a.scheduledPublishAt || 0);
                          const dateB = new Date(b.scheduledPublishAt || 0);
                          return dateA.getTime() - dateB.getTime();
                        })[0]?.scheduledPublishAt
                      )
                    : "No scheduled articles"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Scheduled Articles List */}
          <div>
            <h2 className="text-xl font-bold mb-4">Your Schedule</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : scheduled.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg">No scheduled articles yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Create an article and set a publication date to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {scheduled.map((article) => (
                  <Card
                    key={article.id}
                    className="hover:shadow-md transition-all"
                    data-testid={`scheduled-article-${article.id}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2 line-clamp-1">{article.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              {article.scheduledPublishAt
                                ? formatScheduleTime(article.scheduledPublishAt)
                                : "No date set"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              isUpcoming(article.scheduledPublishAt) ? "default" : "secondary"
                            }
                            className={
                              isUpcoming(article.scheduledPublishAt)
                                ? "bg-green-500"
                                : "bg-amber-500"
                            }
                          >
                            {isUpcoming(article.scheduledPublishAt) ? "Upcoming" : "Pending"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toast.info("Edit functionality to be added");
                            }}
                            data-testid={`edit-schedule-${article.id}`}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Scheduling Tips
                  </p>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Schedule articles during peak engagement times</li>
                    <li>• Plan your content calendar weeks in advance</li>
                    <li>• Published articles appear automatically at the scheduled time</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}

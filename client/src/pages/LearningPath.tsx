import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";

const LESSONS = [
  {
    id: "welcome",
    title: "Welcome to BlogVerse",
    description: "Get started with the basics of BlogVerse",
    icon: "👋",
  },
  {
    id: "create-blog",
    title: "Create Your First Blog",
    description: "Set up and customize your blog",
    icon: "📝",
  },
  {
    id: "write-article",
    title: "Write an Article",
    description: "Create and publish your first article",
    icon: "✍️",
  },
  {
    id: "use-ai",
    title: "Harness AI Features",
    description: "Generate content with AI assistance",
    icon: "🤖",
  },
  {
    id: "analytics",
    title: "Track Your Success",
    description: "Monitor your article performance",
    icon: "📊",
  },
];

export default function LearningPath() {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const data = await api.get("/api/learning/progress");
      if (!data) {
        await api.post("/api/learning/init", {});
        const newData = await api.get("/api/learning/progress");
        setProgress(newData);
      } else {
        setProgress(data);
      }
    } catch (error) {
      toast.error("Failed to load learning progress");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async (lessonId: string) => {
    try {
      setCompleting(lessonId);
      const result = await api.post("/api/learning/complete", { lessonId });
      setProgress(result);
      toast.success("Lesson completed! 🎉");
    } catch (error) {
      toast.error("Failed to complete lesson");
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex-1 p-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading your learning path...</p>
        </div>
      </SidebarLayout>
    );
  }

  const completed = new Set(progress?.completedLessons || []);
  const completedCount = completed.size;
  const progressPercent = progress?.progressPercent || 0;

  return (
    <SidebarLayout>
      <div className="flex-1 p-8 bg-gradient-to-br from-background via-background/95 to-background">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-8 w-8 text-yellow-500" />
              <h1 className="text-4xl font-serif font-bold">Learning Path</h1>
            </div>
            <p className="text-muted-foreground">Master BlogVerse with our guided learning experience</p>
          </div>

          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <CardTitle>Your Progress</CardTitle>
                    <span className="text-sm font-medium">{completedCount}/{LESSONS.length} Completed</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {LESSONS.map((lesson) => {
              const isCompleted = completed.has(lesson.id);
              const isCurrent = !isCompleted;

              return (
                <Card
                  key={lesson.id}
                  className={`transition-all ${
                    isCompleted
                      ? "bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-200/50"
                      : "hover:shadow-lg"
                  }`}
                  data-testid={`lesson-card-${lesson.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="text-3xl">{lesson.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{lesson.title}</h3>
                          <p className="text-sm text-muted-foreground">{lesson.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <CheckCircle2 className="h-6 w-6 text-green-600" data-testid={`lesson-completed-${lesson.id}`} />
                        )}
                        {isCurrent && (
                          <Button
                            onClick={() => handleCompleteLesson(lesson.id)}
                            disabled={completing === lesson.id}
                            size="sm"
                            data-testid={`complete-lesson-${lesson.id}`}
                          >
                            {completing === lesson.id ? "Completing..." : "Complete"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {progressPercent >= 100 && (
            <Card className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-yellow-200/50">
              <CardContent className="p-6 text-center">
                <p className="text-lg font-semibold mb-2">🎓 Congratulations!</p>
                <p className="text-muted-foreground">You've completed the learning path! You're now ready to master BlogVerse.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, CheckCircle2, Lock, Sparkles, Award } from "lucide-react";
import { toast } from "sonner";

const LESSONS = [
  {
    id: "welcome",
    title: "Welcome to BlogVerse",
    description: "Get started with the basics of BlogVerse and explore the platform",
    icon: "👋",
    color: "from-blue-500",
  },
  {
    id: "create-blog",
    title: "Create Your First Blog",
    description: "Set up and customize your blog with your unique style",
    icon: "📝",
    color: "from-purple-500",
  },
  {
    id: "write-article",
    title: "Write an Article",
    description: "Create, edit, and publish your first article",
    icon: "✍️",
    color: "from-pink-500",
  },
  {
    id: "use-ai",
    title: "Harness AI Features",
    description: "Generate content with AI assistance and create amazing posts",
    icon: "🤖",
    color: "from-cyan-500",
  },
  {
    id: "analytics",
    title: "Track Your Success",
    description: "Monitor your article performance and reader engagement",
    icon: "📊",
    color: "from-green-500",
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
      const data = await api.getLearningProgress();
      if (!data) {
        await api.initLearning();
        const newData = await api.getLearningProgress();
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
      const result = await api.completeLesson(lessonId);
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
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Learning Path</h1>
                <p className="text-muted-foreground">Master BlogVerse with our guided learning experience</p>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-200/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600">{completedCount}</div>
                <p className="text-sm text-muted-foreground mt-1">Lessons Completed</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-200/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-600">{LESSONS.length - completedCount}</div>
                <p className="text-sm text-muted-foreground mt-1">Lessons Remaining</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-200/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600">{progressPercent}%</div>
                <p className="text-sm text-muted-foreground mt-1">Overall Progress</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-200/50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-amber-600">{completedCount * 20}</div>
                <p className="text-sm text-muted-foreground mt-1">Points Earned</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Progress Card */}
          <Card className="border-2 border-blue-200/50 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    Your Learning Journey
                  </CardTitle>
                  <span className="text-sm font-bold text-blue-600">{completedCount}/{LESSONS.length}</span>
                </div>
                <Progress value={progressPercent} className="h-4" />
              </div>
            </CardHeader>
          </Card>

          {/* Lessons */}
          <div className="space-y-4">
            {LESSONS.map((lesson, index) => {
              const isCompleted = completed.has(lesson.id);
              const isCurrent = !isCompleted;
              const isNextLesson = index === completedCount;

              return (
                <Card
                  key={lesson.id}
                  className={`border-2 transition-all overflow-hidden ${
                    isCompleted
                      ? "bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-200/50"
                      : isNextLesson
                        ? "bg-gradient-to-r from-blue-500/10 to-blue-500/5 border-blue-500 shadow-lg shadow-blue-500/20"
                        : "hover:shadow-md hover:border-gray-300/50"
                  }`}
                  data-testid={`lesson-card-${lesson.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      {/* Left Section - Icon & Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Lesson Icon */}
                        <div className={`text-4xl flex-shrink-0 transition-transform ${isNextLesson ? "scale-110" : ""}`}>
                          {lesson.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg line-clamp-1">{lesson.title}</h3>
                            {isNextLesson && (
                              <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full flex-shrink-0">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{lesson.description}</p>

                          {/* Step Indicator */}
                          <div className="mt-3 flex items-center gap-2">
                            <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              isCompleted
                                ? "bg-green-500/20 text-green-700 dark:text-green-300"
                                : "bg-gray-500/20 text-gray-700 dark:text-gray-300"
                            }`}>
                              Step {index + 1} of {LESSONS.length}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Status */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {isCompleted && (
                          <div className="text-center">
                            <CheckCircle2 className="h-8 w-8 text-green-600 mb-1" data-testid={`lesson-completed-${lesson.id}`} />
                            <p className="text-xs font-semibold text-green-600">Completed</p>
                          </div>
                        )}
                        {isCurrent && !isCompleted && (
                          <Button
                            onClick={() => handleCompleteLesson(lesson.id)}
                            disabled={completing === lesson.id}
                            className={`bg-gradient-to-r ${lesson.color} to-blue-600 hover:shadow-lg text-white`}
                            data-testid={`complete-lesson-${lesson.id}`}
                          >
                            {completing === lesson.id ? "Completing..." : "Complete"}
                          </Button>
                        )}
                        {!isCurrent && !isCompleted && (
                          <div className="text-center">
                            <Lock className="h-6 w-6 text-muted-foreground mb-1" />
                            <p className="text-xs font-semibold text-muted-foreground">Locked</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Completion Message */}
          {progressPercent >= 100 && (
            <Card className="bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 border-2 border-yellow-200/50">
              <CardContent className="p-8 text-center">
                <Award className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                <p className="text-2xl font-bold mb-2">🎓 Congratulations!</p>
                <p className="text-lg text-muted-foreground mb-4">You've completed the learning path! You're now ready to master BlogVerse.</p>
                <div className="flex gap-3 justify-center">
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                    Get Started →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}

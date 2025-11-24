import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Lock, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Achievements() {
  const { user } = useAuth();
  const [allAchievements, setAllAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    loadAchievements();
  }, [user]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const [all, user] = await Promise.all([
        api.get("/api/achievements"),
        api.get("/api/achievements/user"),
      ]);
      
      setAllAchievements(all || []);
      setUserAchievements(user || []);
      
      const points = (user || []).reduce((sum: number, ua: any) => sum + (ua.achievement?.points || 0), 0);
      setTotalPoints(points);
    } catch (error) {
      console.error("Failed to load achievements:", error);
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "from-amber-600 to-amber-700";
      case "silver":
        return "from-gray-400 to-gray-500";
      case "gold":
        return "from-yellow-400 to-yellow-500";
      case "platinum":
        return "from-cyan-300 to-cyan-400";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "secondary";
      case "silver":
        return "outline";
      case "gold":
        return "default";
      case "platinum":
        return "default";
      default:
        return "outline";
    }
  };

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievementId === achievementId);
  };

  const unlockedCount = userAchievements.length;
  const progressPercent = allAchievements.length > 0 ? (unlockedCount / allAchievements.length) * 100 : 0;

  return (
    <SidebarLayout>
      <div className="flex-1 p-8 bg-gradient-to-br from-background via-background/95 to-background">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-8 w-8 text-amber-500" />
              <h1 className="text-4xl font-serif font-bold">Your Achievements</h1>
            </div>
            <p className="text-muted-foreground">Unlock badges by creating consistent, quality content</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{unlockedCount}/{allAchievements.length}</div>
                <Progress value={progressPercent} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalPoints}</div>
                <p className="text-xs text-muted-foreground mt-2">Earned from achievements</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Next Milestone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{allAchievements.length - unlockedCount}</div>
                <p className="text-xs text-muted-foreground mt-2">Achievements remaining</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Math.round(progressPercent)}%</div>
                <p className="text-xs text-muted-foreground mt-2">Keep going!</p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements by Tier */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin mb-4">
                <Zap className="h-8 w-8 mx-auto text-primary" />
              </div>
              <p className="text-muted-foreground">Loading achievements...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {["bronze", "silver", "gold", "platinum"].map((tier) => {
                const tierAchievements = allAchievements.filter(a => a.tier === tier);
                if (tierAchievements.length === 0) return null;

                return (
                  <div key={tier}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${getTierColor(tier)}`} />
                      <h2 className="text-xl font-semibold capitalize">{tier} Tier</h2>
                      <span className="text-sm text-muted-foreground">
                        ({tierAchievements.filter(a => isUnlocked(a.id)).length}/{tierAchievements.length})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tierAchievements.map((achievement) => {
                        const unlocked = isUnlocked(achievement.id);
                        const userAch = userAchievements.find(ua => ua.achievementId === achievement.id);

                        return (
                          <Card 
                            key={achievement.id}
                            className={`overflow-hidden transition-all duration-300 ${
                              unlocked 
                                ? `bg-gradient-to-br ${getTierColor(tier)} bg-opacity-10 border-2 border-${tier === 'bronze' ? 'amber' : tier === 'silver' ? 'gray' : tier === 'gold' ? 'yellow' : 'cyan'}-400` 
                                : "opacity-60 grayscale"
                            }`}
                            data-testid={`achievement-card-${achievement.id}`}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between mb-2">
                                <div className="text-4xl">{achievement.icon}</div>
                                {unlocked && (
                                  <Trophy className="h-5 w-5 text-amber-500" />
                                )}
                                {!unlocked && (
                                  <Lock className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <CardTitle className="text-lg">{achievement.title}</CardTitle>
                              <CardDescription className="text-sm">
                                {achievement.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {achievement.requirementType === "articles_published" && `${achievement.requirement} articles`}
                                    {achievement.requirementType === "total_views" && `${achievement.requirement} views`}
                                    {achievement.requirementType === "consecutive_days" && `${achievement.requirement} days`}
                                  </span>
                                  <Badge variant={getTierBadgeVariant(achievement.tier)} className="capitalize">
                                    {achievement.points} pts
                                  </Badge>
                                </div>
                                {unlocked && userAch && (
                                  <div className="text-xs text-green-600 font-medium">
                                    ✓ Unlocked {new Date(userAch.unlockedAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}

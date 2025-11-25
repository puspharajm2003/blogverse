import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";

interface ReadingChallengeProps {
  weeklyGoal?: number;
  monthlyGoal?: number;
  articlesReadThisWeek?: number;
  articlesReadThisMonth?: number;
}

export function ReadingChallenge({
  weeklyGoal = 10,
  monthlyGoal = 40,
  articlesReadThisWeek = 3,
  articlesReadThisMonth = 12,
}: ReadingChallengeProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<"weekly" | "monthly">("weekly");

  const weeklyProgress = Math.min((articlesReadThisWeek / weeklyGoal) * 100, 100);
  const monthlyProgress = Math.min((articlesReadThisMonth / monthlyGoal) * 100, 100);

  const currentGoal = selectedChallenge === "weekly" ? weeklyGoal : monthlyGoal;
  const currentRead = selectedChallenge === "weekly" ? articlesReadThisWeek : articlesReadThisMonth;
  const currentProgress = selectedChallenge === "weekly" ? weeklyProgress : monthlyProgress;
  const isWeeklyComplete = articlesReadThisWeek >= weeklyGoal;
  const isMonthlyComplete = articlesReadThisMonth >= monthlyGoal;

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          Reading Challenge
        </CardTitle>
        <CardDescription>
          Complete your reading goals and unlock achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Challenge Selector */}
        <div className="flex gap-2">
          <Button
            variant={selectedChallenge === "weekly" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedChallenge("weekly")}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Weekly
          </Button>
          <Button
            variant={selectedChallenge === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedChallenge("monthly")}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Monthly
          </Button>
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{currentRead}</div>
              <div className="text-sm text-muted-foreground">
                of {currentGoal} articles
              </div>
            </div>
            {currentProgress >= 100 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-400">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-semibold">Complete!</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
              style={{ width: `${currentProgress}%` }}
            />
          </div>

          {/* Percentage */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {Math.round(currentProgress)}%
            </span>
          </div>
        </div>

        {/* Stats Overview */}
        {selectedChallenge === "weekly" ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-background/50">
              <div className="text-muted-foreground">This Week</div>
              <div className="text-xl font-bold">{articlesReadThisWeek}</div>
              <div className="text-xs text-muted-foreground">articles read</div>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <div className="text-muted-foreground">Remaining</div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {Math.max(0, weeklyGoal - articlesReadThisWeek)}
              </div>
              <div className="text-xs text-muted-foreground">to complete</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-background/50">
              <div className="text-muted-foreground">This Month</div>
              <div className="text-xl font-bold">{articlesReadThisMonth}</div>
              <div className="text-xs text-muted-foreground">articles read</div>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <div className="text-muted-foreground">Remaining</div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {Math.max(0, monthlyGoal - articlesReadThisMonth)}
              </div>
              <div className="text-xs text-muted-foreground">to complete</div>
            </div>
          </div>
        )}

        {/* Motivational Message */}
        <div className="text-center text-sm p-3 rounded-lg bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30">
          {currentProgress >= 100 ? (
            <div className="text-amber-900 dark:text-amber-100">
              🎉 Great job! Keep up the momentum!
            </div>
          ) : (
            <div className="text-amber-900 dark:text-amber-100">
              {currentRead === 0
                ? "Start reading to reach your goal!"
                : `You're ${Math.round(currentProgress)}% complete. Keep going!`}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

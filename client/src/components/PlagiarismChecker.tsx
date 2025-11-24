import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Loader2, CheckCircle2, AlertCircle, Eye, History } from "lucide-react";
import { toast } from "sonner";

interface Match {
  source: string;
  similarity: number;
  url: string;
}

interface PlagiarismCheckResult {
  id: string;
  overallScore: number;
  uniqueScore: number;
  matchCount: number;
  matches: Match[];
  status: string;
  checkedAt: string;
}

interface Props {
  articleId: string;
  content: string;
  onCheckStart?: () => void;
  onCheckComplete?: (result: PlagiarismCheckResult) => void;
}

export function PlagiarismChecker({
  articleId,
  content,
  onCheckStart,
  onCheckComplete,
}: Props) {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<PlagiarismCheckResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<PlagiarismCheckResult[]>([]);

  const handleCheck = useCallback(async () => {
    if (!content || content.trim().length < 50) {
      toast.error("Content must be at least 50 characters to check plagiarism");
      return;
    }

    setIsChecking(true);
    onCheckStart?.();

    try {
      const response = await api.checkPlagiarism(articleId, content);
      setResult(response);
      onCheckComplete?.(response);
      
      if (response.overallScore < 20) {
        toast.success(`✓ Excellent! Only ${response.overallScore}% plagiarism detected`);
      } else if (response.overallScore < 50) {
        toast.warning(`⚠ Content has ${response.overallScore}% potential plagiarism`);
      } else {
        toast.error(`⚠ High plagiarism score: ${response.overallScore}%`);
      }
    } catch (error) {
      console.error("Plagiarism check failed:", error);
      toast.error("Failed to check plagiarism");
    } finally {
      setIsChecking(false);
    }
  }, [articleId, content, onCheckStart, onCheckComplete]);

  const loadHistory = async () => {
    try {
      const data = await api.getPlagiarismHistory(articleId);
      setHistory(data);
      setShowHistory(true);
    } catch (error) {
      console.error("Failed to load history:", error);
      toast.error("Failed to load plagiarism history");
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 15) return "text-green-600";
    if (score < 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeClass = (score: number) => {
    if (score < 15) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    if (score < 40) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Plagiarism Checker
          </CardTitle>
          <CardDescription>
            Check your content for potential plagiarism before publishing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result ? (
            <Button
              onClick={handleCheck}
              disabled={isChecking || !content || content.trim().length < 50}
              className="w-full"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check for Plagiarism"
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
                    {result.overallScore}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Plagiarism Score</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {result.uniqueScore}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Uniqueness</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {result.matchCount}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Matches Found</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Plagiarism Level</span>
                  <Badge className={getScoreBadgeClass(result.overallScore)}>
                    {result.overallScore < 15 ? "Very Low" : result.overallScore < 40 ? "Moderate" : "High"}
                  </Badge>
                </div>
                <Progress value={result.overallScore} className="h-2" />
              </div>

              {result.matches && result.matches.length > 0 && (
                <div className="border rounded-lg p-3 bg-red-50 dark:bg-red-950">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Plagiarism Matches Found
                  </h4>
                  <div className="space-y-2 text-sm">
                    {result.matches.map((match, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{match.source}</p>
                          <a
                            href={match.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline text-xs truncate"
                          >
                            {match.url}
                          </a>
                        </div>
                        <Badge variant="outline" className={getScoreColor(match.similarity)}>
                          {match.similarity}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleCheck}
                  variant="outline"
                  className="flex-1"
                  disabled={isChecking}
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Check Again"
                  )}
                </Button>
                <Button
                  onClick={loadHistory}
                  variant="outline"
                  className="flex-1"
                >
                  <History className="w-4 h-4 mr-2" />
                  View History
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Check History</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">No previous checks</p>
            ) : (
              <div className="space-y-3">
                {history.map((check) => (
                  <div
                    key={check.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">{check.overallScore}% plagiarism</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(check.checkedAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={getScoreBadgeClass(check.overallScore)}>
                      {check.uniqueScore}% unique
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

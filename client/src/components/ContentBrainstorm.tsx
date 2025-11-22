import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Lightbulb, Copy, CheckCircle, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
}

interface ContentBrainstormProps {
  onSelectIdea?: (idea: Suggestion) => void;
}

export function ContentBrainstorm({ onSelectIdea }: ContentBrainstormProps) {
  const [niche, setNiche] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleBrainstorm = async () => {
    if (!niche.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await api.brainstormContentIdeas(niche);

      if (response.error) {
        // Fallback demo ideas
        setSuggestions(generateDemoIdeas(niche));
      } else {
        setSuggestions(response.ideas || generateDemoIdeas(niche));
      }
    } catch (error) {
      console.error("Brainstorm error:", error);
      setSuggestions(generateDemoIdeas(niche));
    } finally {
      setIsLoading(false);
    }
  };

  const generateDemoIdeas = (niche: string): Suggestion[] => {
    const ideas: Suggestion[] = [
      {
        id: "1",
        title: `Beginner's Guide to ${niche}`,
        description: `A comprehensive introduction to ${niche} for newcomers, covering fundamental concepts and getting started tips.`,
        category: "Guide",
        keywords: ["beginner", "guide", "tutorial", niche.toLowerCase()],
      },
      {
        id: "2",
        title: `10 Essential Tips for ${niche} Success`,
        description: `Learn the top 10 actionable tips that professionals use to excel in ${niche}.`,
        category: "Tips & Tricks",
        keywords: ["tips", "best practices", "strategies", niche.toLowerCase()],
      },
      {
        id: "3",
        title: `The Future of ${niche}: Trends to Watch`,
        description: `Explore emerging trends and innovations shaping the future of ${niche} industry.`,
        category: "Trends",
        keywords: ["trends", "future", "innovation", "industry", niche.toLowerCase()],
      },
      {
        id: "4",
        title: `${niche} vs Competitors: A Comprehensive Comparison`,
        description: `Compare different approaches and tools within the ${niche} space to help readers make informed decisions.`,
        category: "Comparison",
        keywords: ["comparison", "alternatives", "tools", niche.toLowerCase()],
      },
      {
        id: "5",
        title: `Common ${niche} Mistakes and How to Avoid Them`,
        description: `Explore the most common pitfalls in ${niche} and provide practical solutions to prevent them.`,
        category: "Problem Solving",
        keywords: ["mistakes", "errors", "troubleshooting", niche.toLowerCase()],
      },
      {
        id: "6",
        title: `${niche} Tools and Resources: The Complete Toolkit`,
        description: `A curated list of the best tools, software, and resources available for ${niche} professionals.`,
        category: "Resources",
        keywords: ["tools", "resources", "software", "guides", niche.toLowerCase()],
      },
    ];

    return ideas;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectIdea = (idea: Suggestion) => {
    if (onSelectIdea) {
      onSelectIdea(idea);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold text-lg">Content Brainstorm</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Discover AI-generated content ideas for your niche
        </p>
      </div>

      {/* Input Section */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter your niche or topic (e.g., 'AI in Healthcare')"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleBrainstorm();
          }}
          disabled={isLoading}
          data-testid="input-brainstorm-niche"
          className="text-sm"
        />
        <Button
          onClick={handleBrainstorm}
          disabled={!niche.trim() || isLoading}
          size="sm"
          data-testid="button-brainstorm"
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Brainstorm
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate
            </>
          )}
        </Button>
      </div>

      {/* Suggestions Grid */}
      <div className="space-y-3">
        {hasSearched && suggestions.length === 0 && !isLoading && (
          <div className="text-center py-6 text-muted-foreground">
            <p>No ideas generated. Try a different niche.</p>
          </div>
        )}

        {suggestions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">
              {suggestions.length} Ideas Generated
            </p>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {suggestions.map((idea) => (
                  <Card
                    key={idea.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-border/50 hover:border-border"
                    onClick={() => handleSelectIdea(idea)}
                    data-testid={`card-idea-${idea.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-sm font-semibold leading-tight">
                            {idea.title}
                          </CardTitle>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {idea.category}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(idea.title, idea.id);
                          }}
                          data-testid={`button-copy-idea-${idea.id}`}
                        >
                          {copiedId === idea.id ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {idea.description}
                      </p>

                      {/* Keywords */}
                      <div className="flex flex-wrap gap-1">
                        {idea.keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>

                      {/* Action Button */}
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full text-xs mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectIdea(idea);
                        }}
                        data-testid={`button-use-idea-${idea.id}`}
                      >
                        Use This Idea
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {!hasSearched && suggestions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              Enter a niche or topic to generate content ideas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

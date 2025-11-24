import { useState, useEffect } from "react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { formatReadingTime, calculateReadingTime } from "@/lib/reading-time";
import { useLocation } from "wouter";
import { ArrowLeft, Copy, Check, Clock } from "lucide-react";
import { toast } from "sonner";

export default function DraftPreview({ params }: { params: { articleId: string } }) {
  const [, setLocation] = useLocation();
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const articleId = params.articleId;

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await api.getArticle(articleId);
        setArticle(data);
      } catch (error) {
        console.error("Failed to fetch article:", error);
        toast.error("Article not found");
        setLocation("/my-blogs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, setLocation]);

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="p-8 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-32 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-6 bg-muted rounded w-3/4"></div>)}
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!article) {
    return (
      <SidebarLayout>
        <div className="p-8 max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">Article not found</p>
        </div>
      </SidebarLayout>
    );
  }

  const readingTime = calculateReadingTime(article.content);
  const shareLink = `${window.location.origin}/draft-preview/${articleId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast.success("Link copied to clipboard!");
  };

  return (
    <SidebarLayout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/my-blogs")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300">
              Draft Preview
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatReadingTime(readingTime)}</span>
            </div>
          </div>

          <h1 className="text-4xl font-serif font-bold mb-4">{article.title}</h1>
          
          {article.excerpt && (
            <p className="text-lg text-muted-foreground mb-6">{article.excerpt}</p>
          )}
        </div>

        <Separator className="my-8" />

        {/* Share Draft Preview Card */}
        <Card className="mb-8 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-lg">Share This Draft Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Gather feedback on your draft before publishing. Share this link with collaborators or reviewers:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 px-3 py-2 rounded-md border border-border bg-muted/50 text-sm font-mono"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={copyLink}
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Article Content */}
        {article.coverImage && (
          <div className="mb-8 rounded-lg overflow-hidden border border-border">
            <img 
              src={article.coverImage} 
              alt={article.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        <article className="prose prose-sm dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio */}
        {article.authorBio && (
          <div className="mt-8 p-6 rounded-lg bg-muted/50 border border-border">
            <h3 className="font-semibold mb-2">About the Author</h3>
            <p className="text-sm text-muted-foreground">{article.authorBio}</p>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}

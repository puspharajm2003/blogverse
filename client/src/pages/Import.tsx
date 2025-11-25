import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, CheckCircle2, AlertCircle, Loader2, TrendingUp, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ParsedArticle {
  title: string;
  content: string;
  excerpt: string;
  wordCount: number;
  readingTime: string;
  status: "published" | "draft";
}

interface SeoAnalysis {
  titleScore: number;
  contentScore: number;
  keywordScore: number;
  readabilityScore: number;
  overallScore: number;
  suggestions: string[];
  keywords: string[];
}

export default function Import() {
  const [file, setFile] = useState<File | null>(null);
  const [articles, setArticles] = useState<ParsedArticle[]>([]);
  const [seoData, setSeoData] = useState<Record<number, SeoAnalysis>>({});
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const parseArticles = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseExportedArticles(text);
      setArticles(parsed);

      // Analyze SEO for each article
      const seoAnalysis: Record<number, SeoAnalysis> = {};
      parsed.forEach((article, idx) => {
        seoAnalysis[idx] = analyzeSEO(article);
      });
      setSeoData(seoAnalysis);

      toast.success(`Parsed ${parsed.length} articles`);
    } catch (error) {
      toast.error("Failed to parse file");
    }
  };

  const importArticles = async () => {
    if (!articles.length) {
      toast.error("No articles to import");
      return;
    }

    setImporting(true);
    setImportProgress(0);

    try {
      const totalArticles = articles.length;
      let successCount = 0;

      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        try {
          await fetch("/api/articles/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: article.title,
              content: article.content,
              excerpt: article.excerpt,
              status: article.status,
              tags: extractKeywords(article.content),
            }),
          });
          successCount++;
        } catch {
          console.error(`Failed to import article: ${article.title}`);
        }
        setImportProgress(Math.round((successCount / totalArticles) * 100));
      }

      toast.success(`Successfully imported ${successCount} articles`);
      setArticles([]);
      setSeoData({});
      setFile(null);
      setImporting(false);
    } catch (error) {
      toast.error("Import failed");
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Import Articles
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Bulk import articles from exported content with SEO analysis
          </p>
        </div>

        {articles.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardHeader>
              <CardTitle>Upload Article Export</CardTitle>
              <CardDescription>Paste exported articles from your blog</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <div className="flex justify-center mb-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <input
                        id="file-upload"
                        type="file"
                        accept=".txt"
                        onChange={handleFileChange}
                        className="hidden"
                        data-testid="input-file-upload"
                      />
                      <button className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900">
                        Choose File
                      </button>
                    </label>
                  </div>
                  {file && <p className="text-sm text-slate-600 dark:text-slate-400">{file.name}</p>}
                </div>
                <Button
                  onClick={parseArticles}
                  disabled={!file}
                  className="w-full"
                  data-testid="button-parse"
                >
                  Parse Articles
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{articles.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Avg SEO Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {seoData && Object.values(seoData).length > 0
                      ? Math.round(
                          Object.values(seoData).reduce((sum, s) => sum + s.overallScore, 0) /
                            Object.values(seoData).length
                        )
                      : 0}
                    /100
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Words</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {articles.reduce((sum, a) => sum + a.wordCount, 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {articles.map((article, idx) => (
                <ArticlePreviewCard key={idx} article={article} index={idx} seo={seoData[idx]} />
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setArticles([]);
                  setSeoData({});
                  setFile(null);
                }}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={importArticles}
                disabled={importing}
                className="flex-1"
                data-testid="button-import"
              >
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing... ({importProgress}%)
                  </>
                ) : (
                  "Import All Articles"
                )}
              </Button>
            </div>

            {importing && <Progress value={importProgress} className="w-full" />}
          </div>
        )}
      </div>
    </div>
  );
}

function ArticlePreviewCard({
  article,
  index,
  seo,
}: {
  article: ParsedArticle;
  index: number;
  seo: SeoAnalysis;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{article.title}</CardTitle>
            <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{seo.overallScore}</div>
              <p className="text-xs text-slate-500">SEO Score</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <ScoreItem label="Title" score={seo.titleScore} />
          <ScoreItem label="Content" score={seo.contentScore} />
          <ScoreItem label="Keywords" score={seo.keywordScore} />
          <ScoreItem label="Readability" score={seo.readabilityScore} />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Words:</span>
            <span className="font-medium">{article.wordCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Reading Time:</span>
            <span className="font-medium">{article.readingTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Status:</span>
            <span className="font-medium capitalize">{article.status}</span>
          </div>
        </div>

        {seo.suggestions.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Suggestions:
            </p>
            <ul className="space-y-1">
              {seo.suggestions.slice(0, 3).map((suggestion, i) => (
                <li key={i} className="text-xs text-blue-800 dark:text-blue-200">
                  • {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScoreItem({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{label}</p>
      <div className="text-lg font-bold">{score}</div>
      <Progress value={score} className="h-1 mt-1" />
    </div>
  );
}

function parseExportedArticles(text: string): ParsedArticle[] {
  const articles: ParsedArticle[] = [];
  const sections = text.split(/\n\n\nPublished|Drafted/g);

  for (const section of sections) {
    if (!section.trim()) continue;

    const lines = section.split("\n").filter((l) => l.trim());
    if (lines.length < 2) continue;

    let title = lines[0].trim();
    let content = "";
    let wordCount = 0;
    let readingTime = "1 min";

    // Extract reading time and word count
    for (const line of lines) {
      if (line.includes("min read")) {
        const match = line.match(/(\d+)\s+min read/);
        if (match) readingTime = `${match[1]} min`;
      }
      if (line.includes(" w") && line.match(/\d+\s+w/)) {
        const match = line.match(/(\d+)\s+w/);
        if (match) wordCount = parseInt(match[1]);
      }
    }

    content = lines.slice(1, -1).join("\n");
    const excerpt = content.substring(0, 150).replace(/<[^>]*>/g, "");

    articles.push({
      title,
      content,
      excerpt,
      wordCount: wordCount || calculateWordCount(content),
      readingTime,
      status: section.includes("Published") ? "published" : "draft",
    });
  }

  return articles;
}

function calculateWordCount(content: string): number {
  return content.split(/\s+/).filter((w) => w.length > 0).length;
}

function extractKeywords(content: string): string[] {
  const words = content.toLowerCase().split(/\s+/);
  const stopwords = new Set([
    "the",
    "a",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "is",
    "was",
    "are",
  ]);
  const uniqueWords = new Set(words.filter((w) => w.length > 4 && !stopwords.has(w)));
  return Array.from(uniqueWords).slice(0, 8);
}

function analyzeSEO(article: ParsedArticle): SeoAnalysis {
  const titleLength = article.title.length;
  const contentLength = article.content.length;
  const wordCount = article.wordCount;

  let titleScore = 0;
  if (titleLength >= 30 && titleLength <= 60) titleScore = 100;
  else if (titleLength >= 20 && titleLength <= 70) titleScore = 80;
  else if (titleLength > 0) titleScore = 60;

  let contentScore = 0;
  if (wordCount >= 800) contentScore = 100;
  else if (wordCount >= 500) contentScore = 80;
  else if (wordCount >= 300) contentScore = 60;
  else contentScore = 40;

  const keywords = extractKeywords(article.content);
  const keywordScore = Math.min(100, keywords.length * 12);

  const readabilityScore = Math.min(100, Math.round((contentLength / 5000) * 100));

  const overallScore = Math.round((titleScore + contentScore + keywordScore + readabilityScore) / 4);

  const suggestions: string[] = [];
  if (titleLength < 30 || titleLength > 60)
    suggestions.push("Title should be between 30-60 characters for optimal SEO");
  if (wordCount < 500) suggestions.push("Increase content to at least 500 words for better ranking");
  if (keywords.length < 5) suggestions.push("Add more relevant keywords throughout the content");
  if (!article.content.includes("##")) suggestions.push("Use proper heading structure (H2, H3) for better readability");

  return {
    titleScore,
    contentScore,
    keywordScore,
    readabilityScore,
    overallScore,
    suggestions,
    keywords,
  };
}

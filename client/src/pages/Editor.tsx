import { useState, useRef, useCallback, useEffect } from 'react';
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { AiChatbot } from "@/components/AiChatbot";
import { ContentBrainstorm } from "@/components/ContentBrainstorm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/lib/api";
import { useTheme } from "next-themes";
import { exportArticleToPDF, exportArticleAsDocx } from "@/lib/pdf-export";
import { toast } from "sonner";
import { calculateReadingTime, formatReadingTime } from "@/lib/reading-time";
import { 
    Save, 
    Send, 
    Image as ImageIcon, 
    Settings, 
    Sparkles, 
    Search,
    Tag,
    Globe,
    Loader2,
    Moon,
    Sun,
    Share2,
    Undo2,
    Redo2,
    AlertCircle,
    Eye,
    Lightbulb,
    Video,
    Clock,
    Share,
    Users,
    FileText,
    CheckCircle2,
    AlertTriangle
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Helper to strip HTML and count words
const countWords = (htmlContent: string): number => {
  const text = htmlContent.replace(/<[^>]*>/g, '').trim();
  return text.split(/\s+/).filter(word => word.length > 0).length;
};

// Convert markdown syntax to HTML - handles already-converted HTML and markdown mixed content
const convertMarkdownToHtml = (text: string): string => {
  let html = text;
  
  // Only convert if it contains markdown headers (# ## ### etc)
  // Check if content has markdown syntax
  const hasMarkdown = /^#+\s/m.test(html);
  
  if (!hasMarkdown) {
    // Content is already HTML or plain text, return as-is
    return html;
  }
  
  // Split by newlines and process each line
  const lines = html.split('\n');
  let result: string[] = [];
  let inList = false;
  let listItems: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Headers
    if (line.match(/^##### /)) {
      if (inList && listItems.length > 0) {
        result.push(`<ul class="list-disc ml-6 mb-4">${listItems.join('')}</ul>`);
        listItems = [];
        inList = false;
      }
      result.push(line.replace(/^##### (.+)$/, '<h5 class="text-lg font-bold mt-4 mb-2">$1</h5>'));
      continue;
    }
    if (line.match(/^#### /)) {
      if (inList && listItems.length > 0) {
        result.push(`<ul class="list-disc ml-6 mb-4">${listItems.join('')}</ul>`);
        listItems = [];
        inList = false;
      }
      result.push(line.replace(/^#### (.+)$/, '<h4 class="text-xl font-bold mt-5 mb-3">$1</h4>'));
      continue;
    }
    if (line.match(/^### /)) {
      if (inList && listItems.length > 0) {
        result.push(`<ul class="list-disc ml-6 mb-4">${listItems.join('')}</ul>`);
        listItems = [];
        inList = false;
      }
      result.push(line.replace(/^### (.+)$/, '<h3 class="text-2xl font-bold mt-6 mb-3">$1</h3>'));
      continue;
    }
    if (line.match(/^## /)) {
      if (inList && listItems.length > 0) {
        result.push(`<ul class="list-disc ml-6 mb-4">${listItems.join('')}</ul>`);
        listItems = [];
        inList = false;
      }
      result.push(line.replace(/^## (.+)$/, '<h2 class="text-3xl font-bold mt-8 mb-4">$1</h2>'));
      continue;
    }
    if (line.match(/^# /)) {
      if (inList && listItems.length > 0) {
        result.push(`<ul class="list-disc ml-6 mb-4">${listItems.join('')}</ul>`);
        listItems = [];
        inList = false;
      }
      result.push(line.replace(/^# (.+)$/, '<h1 class="text-4xl font-bold mt-10 mb-5">$1</h1>'));
      continue;
    }
    
    // List items
    if (line.match(/^- /)) {
      inList = true;
      listItems.push(line.replace(/^- (.+)$/, '<li class="mb-2">$1</li>'));
      continue;
    }
    
    // Regular paragraphs
    if (line.trim()) {
      if (inList && listItems.length > 0) {
        result.push(`<ul class="list-disc ml-6 mb-4">${listItems.join('')}</ul>`);
        listItems = [];
        inList = false;
      }
      result.push(`<p class="mb-4 leading-relaxed">${line}</p>`);
    }
  }
  
  // Close any remaining list
  if (inList && listItems.length > 0) {
    result.push(`<ul class="list-disc ml-6 mb-4">${listItems.join('')}</ul>`);
  }
  
  html = result.join('\n');
  
  // Convert remaining markdown in paragraphs
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  
  return html;
};

// History entry for undo/redo
interface HistoryEntry {
  title: string;
  content: string;
}

export default function Editor() {
  const { theme, setTheme } = useTheme();
  const [title, setTitle] = useState("Untitled Draft");
  const [content, setContent] = useState("<p>Start writing...</p>");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [blogId, setBlogId] = useState<string | null>(null);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [isBrainstormOpen, setIsBrainstormOpen] = useState(false);
  const [scheduledPublishAt, setScheduledPublishAt] = useState<string | null>(null);
  const [showPlagiarismResult, setShowPlagiarismResult] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<any>(null);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showDraftPreviewLink, setShowDraftPreviewLink] = useState(false);

  // Initialize blog on mount
  useEffect(() => {
    const initializeBlog = async () => {
      try {
        const blogs = await api.getBlogs();
        let targetBlog = blogs[0];
        
        if (!targetBlog) {
          targetBlog = await api.createBlog({
            title: "My Blog",
            slug: "my-blog",
            description: "My personal blog"
          });
        }
        
        setBlogId(targetBlog.id);
      } catch (error) {
        console.error("Failed to initialize blog:", error);
      }
    };
    
    initializeBlog();
  }, []);

  // Autosave functionality
  useEffect(() => {
    if (!autoSaveEnabled) return;
    
    const autoSaveTimer = setTimeout(() => {
      if (title !== "Untitled Draft" || content !== "<p>Start writing...</p>") {
        handleSaveArticle();
      }
    }, 30000); // Autosave every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [content, title, autoSaveEnabled]);

  // Undo/Redo state
  const [history, setHistory] = useState<HistoryEntry[]>([{ title, content }]);
  const [historyIndex, setHistoryIndex] = useState(0);


  // Add to history when content changes
  const updateContent = (newContent: string, newTitle: string = title) => {
    setContent(newContent);
    setTitle(newTitle);
    
    const newEntry: HistoryEntry = { title: newTitle, content: newContent };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newEntry);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo functionality
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setTitle(history[newIndex].title);
      setContent(history[newIndex].content);
    }
  };

  // Redo functionality
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setTitle(history[newIndex].title);
      setContent(history[newIndex].content);
    }
  };

  // Handle content deletion with confirmation
  const handleDeleteContent = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    updateContent("<p>Start writing...</p>", "Untitled Draft");
    setShowDeleteConfirm(false);
  };

  // Handle saving blog article
  const handleSaveArticle = async () => {
    if (!title.trim()) {
      alert("Please enter a title for your article.");
      return;
    }

    setIsSaving(true);
    setSaveStatus("saving");

    try {
      let currentBlogId = blogId;
      const slug = title.toLowerCase().replace(/\s+/g, "-").slice(0, 50);
      
      // Create or update blog with article title if needed
      if (!currentBlogId) {
        const newBlog = await api.createBlog({
          title: title,
          slug: slug,
          description: `Blog about ${title}`
        });
        currentBlogId = newBlog.id;
        setBlogId(newBlog.id);
      } else {
        // Update blog title to match article title
        await api.updateBlog(currentBlogId, {
          title: title,
          slug: slug,
        });
      }
      
      if (articleId) {
        // Update existing article
        const updated = await api.updateArticle(articleId, {
          title,
          content,
          slug,
          scheduledPublishAt: scheduledPublishAt ? new Date(scheduledPublishAt) : null,
          status: scheduledPublishAt ? "scheduled" : "draft",
          tags: tags.length > 0 ? tags : null,
        });
        console.log("Article updated:", updated);
      } else {
        // Create new article
        const article = await api.createArticle({
          blogId: currentBlogId,
          title,
          content,
          slug,
          excerpt: content.replace(/<[^>]*>/g, "").slice(0, 160),
          status: scheduledPublishAt ? "scheduled" : "draft",
          scheduledPublishAt: scheduledPublishAt ? new Date(scheduledPublishAt) : null,
          tags: tags.length > 0 ? tags : null,
        });
        setArticleId(article.id);
        console.log("Article created:", article);
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save article. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle PDF export
  const handleExportPDF = () => {
    exportArticleToPDF(title, content, "", new Date().toLocaleDateString());
  };

  // Handle document export
  const handleExportDocx = () => {
    exportArticleAsDocx(title, content, "", new Date().toLocaleDateString());
  };

  // Handle plagiarism check
  const handleCheckPlagiarism = async () => {
    setIsCheckingPlagiarism(true);
    try {
      // Save article first if not saved
      if (!articleId) {
        toast.info("Saving article before plagiarism check...");
        await handleSaveArticle();
        if (!articleId) {
          toast.error("Please create an article first");
          setIsCheckingPlagiarism(false);
          return;
        }
      }

      // Call real plagiarism API
      const result = await api.checkPlagiarism(articleId, content);
      
      // Format result for display
      const formattedResult = {
        overallScore: result.overallScore,
        uniqueScore: result.uniqueScore,
        matchCount: result.matchCount,
        matches: Array.isArray(result.matches) ? result.matches : [],
        status: result.status,
        checkedAt: result.createdAt
      };
      
      setPlagiarismResult(formattedResult);
      setShowPlagiarismResult(true);
      
      // Show toast notification
      if (result.overallScore < 15) {
        toast.success(`✅ Great! Only ${result.overallScore}% plagiarism detected - Your content is highly original!`);
      } else if (result.overallScore < 40) {
        toast.warning(`⚠️ Moderate match: ${result.overallScore}% similarity detected. Review the sources and ensure proper attribution.`);
      } else {
        toast.error(`⛔ High plagiarism score: ${result.overallScore}%. Please revise your content before publishing.`);
      }
    } catch (error) {
      console.error("Plagiarism check error:", error);
      toast.error("Failed to check plagiarism. Please try again.");
    } finally {
      setIsCheckingPlagiarism(false);
    }
  };

  // Share to social media
  const shareToSocial = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my blog: "${title}"`)}&url=${encodeURIComponent(window.location.href)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  // Handle content generated from chatbot
  const handleContentGenerated = (generatedText: string, type: string) => {
    if (!generatedText) return;

    // Convert markdown to HTML
    const formattedText = convertMarkdownToHtml(generatedText);
    
    updateContent(content + formattedText, title);
  };

  // Handle brainstorm idea selection
  const handleBrainstormIdea = (idea: any) => {
    // Set the title to the selected idea
    updateContent(content, idea.title);
    setIsBrainstormOpen(false);
    
    // Automatically generate full article for this idea
    api.generateBlogContent(idea.title, "full").then((response) => {
      if (response.text) {
        const formattedText = convertMarkdownToHtml(response.text);
        updateContent(formattedText, idea.title);
      }
    }).catch((error) => {
      console.error("Failed to generate article:", error);
    });
  };

  const wordCount = countWords(content);
  const readingTime = calculateReadingTime(content);

  return (
    <SidebarLayout>
      <div className="h-full flex flex-col">
        {/* Editor Header - Professional & Modern */}
        <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left side - Status and Info */}
            <div className="flex items-center gap-8 min-w-0">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Article Status</span>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full transition-colors ${
                    saveStatus === 'saving' ? 'bg-blue-500 animate-pulse' : 
                    saveStatus === 'saved' ? 'bg-green-500' : 
                    'bg-amber-500'
                  }`} />
                  <span className="text-sm font-medium">
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Draft'}
                  </span>
                </div>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                <span className="font-semibold text-foreground">{wordCount}</span> words
              </div>

              <div className="text-sm text-muted-foreground whitespace-nowrap">
                <Clock className="h-4 w-4 inline mr-1" />
                <span className="font-semibold text-foreground">{formatReadingTime(readingTime)}</span>
              </div>
            </div>
            
            {/* Center - Toolbar Buttons */}
            <div className="flex items-center gap-1 justify-center">
              {/* Undo/Redo Buttons */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                data-testid="button-undo"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                data-testid="button-redo"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-6" />

              {/* Dark Mode Toggle */}
              <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              data-testid="button-toggle-theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              </Button>

              {/* AI Assistant - Icon Only */}
              <Sheet open={isAiOpen} onOpenChange={setIsAiOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  data-testid="button-ai-assistant"
                  title="AI Assistant"
                  className="hover:bg-indigo-500/10"
                >
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[500px] p-0 flex flex-col">
                <AiChatbot onContentGenerated={handleContentGenerated} />
              </SheetContent>
            </Sheet>

            {/* Content Brainstorm - Icon Only */}
            <Sheet open={isBrainstormOpen} onOpenChange={setIsBrainstormOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  data-testid="button-brainstorm"
                  title="Brainstorm Ideas"
                  className="hover:bg-yellow-500/10"
                >
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[500px] p-0 flex flex-col">
                <div className="p-4 border-b overflow-auto flex-1">
                  <ContentBrainstorm onSelectIdea={handleBrainstormIdea} />
                </div>
              </SheetContent>
            </Sheet>

            {/* Media Embedding */}
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-embed-media"
              title="Embed Media"
              className="hover:bg-green-500/10"
            >
              <Video className="h-4 w-4 text-green-500" />
            </Button>

            {/* Plagiarism Checker */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleCheckPlagiarism}
              disabled={isCheckingPlagiarism}
              data-testid="button-plagiarism-check"
              title="Check Plagiarism"
              className="hover:bg-red-500/10"
            >
              {isCheckingPlagiarism ? (
                <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </Button>

            {/* PDF Export */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleExportPDF}
              data-testid="button-export-pdf"
              title="Export as PDF"
              className="hover:bg-indigo-500/10"
            >
              <FileText className="h-4 w-4 text-indigo-500" />
            </Button>

            {/* Version History */}
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-version-history"
              title="Version History"
              className="hover:bg-orange-500/10"
            >
              <Clock className="h-4 w-4 text-orange-500" />
            </Button>

            {/* Collaborative Editing */}
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-collaborate"
              title="Collaborate"
              className="hover:bg-purple-500/10"
            >
              <Users className="h-4 w-4 text-purple-500" />
            </Button>

                <Separator orientation="vertical" className="h-6 ml-1" />

              {/* Share Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-share" title="Share">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                <SheetHeader>
                  <SheetTitle>Share Article</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 py-6">
                  <p className="text-sm text-muted-foreground">Share your article on social media</p>
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700" 
                      onClick={() => shareToSocial('twitter')}
                      data-testid="button-share-twitter"
                    >
                      Share on Twitter
                    </Button>
                    <Button 
                      className="w-full bg-blue-500 hover:bg-blue-600" 
                      onClick={() => shareToSocial('facebook')}
                      data-testid="button-share-facebook"
                    >
                      Share on Facebook
                    </Button>
                    <Button 
                      className="w-full bg-blue-700 hover:bg-blue-800" 
                      onClick={() => shareToSocial('linkedin')}
                      data-testid="button-share-linkedin"
                    >
                      Share on LinkedIn
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" data-testid="button-settings" title="Settings">
                    <Settings className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Post Settings</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 py-6">
                    <div className="space-y-2">
                      <Label>Featured Image</Label>
                      <div className="aspect-video rounded-md border border-dashed border-border flex items-center justify-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <ImageIcon className="h-8 w-8" />
                          <span className="text-sm">Upload cover</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>URL Slug</Label>
                      <div className="flex">
                        <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 border-border text-sm text-muted-foreground flex items-center">
                          blogverse.com/
                        </span>
                        <Input className="rounded-l-none" placeholder="my-post-slug" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tags & Categories</Label>
                      <div className="flex gap-2 mb-2">
                        <Input 
                          placeholder="Add a tag..." 
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                                setTags([...tags, tagInput.trim()]);
                                setTagInput("");
                                toast.success(`Tag "${tagInput.trim()}" added`);
                              }
                            }
                          }}
                          data-testid="input-article-tags"
                        />
                        <Button 
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                              setTags([...tags, tagInput.trim()]);
                              setTagInput("");
                              toast.success(`Tag "${tagInput.trim()}" added`);
                            }
                          }}
                          data-testid="button-add-tag"
                        >
                          Add
                        </Button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <Badge 
                              key={tag}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => {
                                setTags(tags.filter(t => t !== tag));
                                toast.success(`Tag "${tag}" removed`);
                              }}
                            >
                              {tag}
                              <span className="ml-1 text-xs">✕</span>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">Press Enter or click Add. Click tags to remove.</p>
                    </div>
                    <div className="space-y-2">
                      <Label>SEO Description</Label>
                      <Textarea placeholder="Meta description for search engines..." className="h-24" />
                      <p className="text-xs text-muted-foreground text-right">0/160</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Author Bio</Label>
                      <Textarea 
                        placeholder="Tell readers about yourself..." 
                        className="h-20"
                        data-testid="textarea-author-bio"
                      />
                      <p className="text-xs text-muted-foreground">Optional: A brief bio for readers to know about the author</p>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <Label>Schedule Publication</Label>
                      <Input 
                        type="datetime-local"
                        value={scheduledPublishAt || ""}
                        onChange={(e) => setScheduledPublishAt(e.target.value || null)}
                        data-testid="input-scheduled-publish-at"
                      />
                      {scheduledPublishAt && (
                        <p className="text-xs text-green-600">
                          ✓ This article will be published on {new Date(scheduledPublishAt).toLocaleString()}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Leave empty to save as draft</p>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <Label>Share & Export</Label>
                      {articleId && (
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => {
                            const shareLink = `${window.location.origin}/draft-preview/${articleId}`;
                            navigator.clipboard.writeText(shareLink);
                            toast.success("Draft preview link copied!");
                          }}
                          data-testid="button-draft-preview-link"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Copy Draft Preview Link
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleExportPDF}
                        data-testid="button-export-pdf-settings"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Export as PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleExportDocx}
                        data-testid="button-export-docx"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Export as Document
                      </Button>
                    </div>
                    <Separator className="my-4" />
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={handleDeleteContent}
                      data-testid="button-delete-content"
                    >
                      Delete Content
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Button 
                variant="outline" 
                onClick={handleSaveArticle}
                disabled={isSaving}
                data-testid="button-save"
              >
                <Save className="h-4 w-4 mr-2" /> 
                {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save"}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowPreview(true)}
                data-testid="button-preview"
                title="Preview"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>

            {/* Right side - Publish Button */}
            <Button 
              className="ml-auto gap-2"
              onClick={() => {
                handleSaveArticle();
                setTimeout(() => window.location.href = '/publish', 500);
              }}
              disabled={isSaving}
              size="lg"
              data-testid="button-publish-final">
              <Send className="h-4 w-4" />
              {saveStatus === "saving" ? "Saving..." : "Publish"}
            </Button>
          </div>
        </header>

        {/* Editor Main Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background via-background/95 to-background">
            <div className="max-w-4xl mx-auto py-16 px-8">
                {/* Title Input */}
                <div className="mb-12">
                  <input 
                      type="text" 
                      value={title}
                      onChange={(e) => updateContent(content, e.target.value)}
                      className="w-full text-5xl lg:text-6xl font-serif font-bold bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/30 mb-4 tracking-tight leading-tight text-foreground"
                      placeholder="Enter your article title..."
                      data-testid="input-title"
                  />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-1 w-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
                    Start typing your article content below
                  </div>
                </div>
                
                {/* Tiptap Editor */}
                <div className="bg-card/40 rounded-xl border border-border/50 backdrop-blur-sm overflow-hidden">
                  <RichTextEditor 
                      content={content} 
                      onChange={(newContent) => updateContent(newContent, title)} 
                      className="border-none shadow-none bg-transparent"
                  />
                </div>
            </div>
        </div>


        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Delete All Content?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your article content. This action cannot be undone. Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 mt-4 p-3 bg-destructive/10 rounded-md text-sm text-destructive">
              <p>Current word count: <strong>{wordCount}</strong> words</p>
            </div>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                Delete Content
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Advanced Preview Modal */}
        <Sheet open={showPreview} onOpenChange={setShowPreview}>
          <SheetContent side="right" className="w-full sm:w-[90vw] md:w-[80vw] overflow-y-auto p-0 bg-gradient-to-b from-background via-background/95 to-background">
            {/* Preview Header */}
            <div className="sticky top-0 z-10 border-b border-border/40 bg-gradient-to-r from-background via-background to-background/50 backdrop-blur-sm">
              <div className="px-8 py-6">
                <SheetTitle className="text-2xl">Article Preview</SheetTitle>
                <p className="text-sm text-muted-foreground mt-2">Full article layout with formatting</p>
              </div>
              
              {/* Preview Meta Info */}
              <div className="px-8 py-4 border-t border-border/40 flex gap-6 bg-muted/30">
                <div className="text-xs">
                  <span className="text-muted-foreground block">Word Count</span>
                  <span className="font-semibold text-sm">{wordCount} words</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground block">Status</span>
                  <span className="font-semibold text-sm text-amber-600">Draft</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground block">Reading Time</span>
                  <span className="font-semibold text-sm">{Math.ceil(wordCount / 200)} min</span>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="px-8 py-12 max-w-4xl">
              <article className="prose prose-invert max-w-none">
                {/* Article Title */}
                <div className="mb-12 pb-8 border-b border-border/40">
                  <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-4 text-foreground leading-tight tracking-tight">
                    {title || "Untitled Article"}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>📅 {new Date().toLocaleDateString()}</span>
                    <span>•</span>
                    <span>✍️ Draft</span>
                  </div>
                </div>

                {/* Article Body */}
                <style>{`
                  .article-preview h1 {
                    font-size: 2.25rem;
                    font-weight: bold;
                    margin-top: 2.5rem;
                    margin-bottom: 1.25rem;
                    color: currentColor;
                    line-height: 1.3;
                  }
                  .article-preview h2 {
                    font-size: 1.875rem;
                    font-weight: bold;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                    color: currentColor;
                    line-height: 1.4;
                  }
                  .article-preview h3 {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                    color: currentColor;
                  }
                  .article-preview h4 {
                    font-size: 1.25rem;
                    font-weight: bold;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    color: currentColor;
                  }
                  .article-preview h5 {
                    font-size: 1.125rem;
                    font-weight: bold;
                    margin-top: 1.5rem;
                    margin-bottom: 0.5rem;
                    color: currentColor;
                  }
                  .article-preview p {
                    margin-bottom: 1.5rem;
                    line-height: 1.8;
                    color: currentColor;
                  }
                  .article-preview strong {
                    font-weight: 700;
                    color: currentColor;
                  }
                  .article-preview em {
                    font-style: italic;
                    color: currentColor;
                  }
                  .article-preview ul, .article-preview ol {
                    margin-left: 1.5rem;
                    margin-bottom: 1.5rem;
                  }
                  .article-preview li {
                    margin-bottom: 0.75rem;
                    color: currentColor;
                    line-height: 1.6;
                  }
                  .article-preview hr {
                    margin: 3rem 0;
                    border: none;
                    border-top: 1px solid currentColor;
                    opacity: 0.1;
                  }
                  .article-preview blockquote {
                    border-left: 4px solid currentColor;
                    padding-left: 1.5rem;
                    margin-left: 0;
                    margin-right: 0;
                    margin-bottom: 1.5rem;
                    font-style: italic;
                    color: currentColor;
                    opacity: 0.8;
                  }
                  .article-preview code {
                    background: muted;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-family: monospace;
                    color: currentColor;
                  }
                `}</style>
                <div className="article-preview" dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(content) }} />
              </article>

              {/* Article Footer */}
              <div className="mt-12 pt-8 border-t border-border/40">
                <p className="text-sm text-muted-foreground text-center">
                  💡 This is a preview of how your article will appear to readers
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Plagiarism Check Results Dialog */}
        <Sheet open={showPlagiarismResult} onOpenChange={setShowPlagiarismResult}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Plagiarism Check Results
              </SheetTitle>
            </SheetHeader>
            {plagiarismResult && (
              <div className="space-y-6 py-6">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="text-center">
                    <div className={`text-5xl font-bold mb-2 ${
                      plagiarismResult.overallScore < 10 ? 'text-green-600' :
                      plagiarismResult.overallScore < 30 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {plagiarismResult.overallScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Plagiarism Score</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    {plagiarismResult.overallScore < 10 ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-green-900 dark:text-green-100">Original Content Detected</div>
                          <div className="text-sm text-green-800 dark:text-green-200">Your content appears to be original and unique.</div>
                        </div>
                      </>
                    ) : plagiarismResult.overallScore < 30 ? (
                      <>
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-yellow-900 dark:text-yellow-100">Minor Similarities Found</div>
                          <div className="text-sm text-yellow-800 dark:text-yellow-200">Some phrases may be similar to existing content. Consider reviewing the matches below.</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-red-900 dark:text-red-100">High Similarity Detected</div>
                          <div className="text-sm text-red-800 dark:text-red-200">Your content has significant similarities to existing sources. Please review the matches below.</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {plagiarismResult.matches && plagiarismResult.matches.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Detected Matches</div>
                    {plagiarismResult.matches.map((match: any, idx: number) => (
                      <div key={idx} className="p-3 border border-border rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm">{match.source}</div>
                          <Badge variant="secondary">{match.similarity}% match</Badge>
                        </div>
                        {match.url && (
                          <div className="text-xs text-muted-foreground truncate">
                            {match.url}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Button 
                  className="w-full" 
                  onClick={() => setShowPlagiarismResult(false)}
                  data-testid="button-close-plagiarism-results"
                >
                  Done
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </SidebarLayout>
  );
}

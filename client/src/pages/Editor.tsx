import { useState, useRef, useCallback, useEffect } from 'react';
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { AiChatbot } from "@/components/AiChatbot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/lib/api";
import { useTheme } from "next-themes";
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
    Eye
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

// Convert markdown syntax to HTML
const convertMarkdownToHtml = (text: string): string => {
  let html = text;
  
  // Convert headers (must be done in order from largest to smallest)
  html = html.replace(/^##### (.*?)$/gm, '<h5 class="text-lg font-bold mt-4 mb-2">$1</h5>');
  html = html.replace(/^#### (.*?)$/gm, '<h4 class="text-xl font-bold mt-5 mb-3">$1</h4>');
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-2xl font-bold mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-3xl font-bold mt-8 mb-4">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-4xl font-bold mt-10 mb-5">$1</h1>');
  
  // Convert bold markdown **text** to <strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Convert italic markdown *text* to <em>
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // Convert bullet points
  html = html.replace(/^\- (.*?)$/gm, '<li class="ml-4">$1</li>');
  
  // Wrap consecutive list items in <ul>
  html = html.replace(/(<li[^>]*>.*?<\/li>)/g, (match) => {
    if (!match.includes('<ul')) {
      return `<ul class="list-disc">${match}</ul>`;
    }
    return match;
  });
  
  // Convert line breaks to proper spacing
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  
  // Wrap paragraphs
  const paragraphs = html.split('</p><p>');
  html = paragraphs.map((p) => {
    if (p.includes('<h') || p.includes('<ul') || p.includes('<li')) {
      return p;
    }
    if (!p.includes('<p>')) {
      return `<p>${p}</p>`;
    }
    return p;
  }).join('');
  
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
    if (!blogId) {
      alert("Blog not initialized. Please refresh the page.");
      return;
    }

    setIsSaving(true);
    setSaveStatus("saving");

    try {
      const slug = title.toLowerCase().replace(/\s+/g, "-").slice(0, 50);
      
      if (articleId) {
        // Update existing article
        await api.updateArticle(articleId, {
          title,
          content,
          slug,
        });
      } else {
        // Create new article
        const article = await api.createArticle({
          blogId,
          title,
          content,
          slug,
          excerpt: content.replace(/<[^>]*>/g, "").slice(0, 160),
          status: "draft",
        });
        setArticleId(article.id);
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

  const wordCount = countWords(content);

  return (
    <SidebarLayout>
      <div className="h-full flex flex-col">
        {/* Editor Header */}
        <header className="h-20 border-b border-border/40 flex items-center justify-between px-8 bg-gradient-to-r from-background via-background to-background/50 sticky top-0 z-20 backdrop-blur-sm">
          <div className="flex items-center gap-6">
             <div className="flex flex-col">
                 <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</span>
                 <span className="text-sm font-semibold flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full transition-colors ${
                      saveStatus === 'saving' ? 'bg-blue-500 animate-pulse' : 
                      saveStatus === 'saved' ? 'bg-green-500' : 
                      'bg-amber-500'
                    }`} /> 
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'All changes saved' : 'Draft'}
                 </span>
             </div>
             <Separator orientation="vertical" className="h-8" />
             <div className="text-sm text-muted-foreground">
                <span className="font-medium">{wordCount}</span> words • {articleId ? '📁 Saved to database' : '📝 Not saved yet'}
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Word Counter */}
            <div className="text-sm text-muted-foreground px-3 py-2 rounded-md bg-muted/50">
              <span data-testid="word-count">{wordCount}</span> words
            </div>
            
            {/* Undo/Redo Buttons */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              data-testid="button-undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              data-testid="button-redo"
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

            {/* AI Assistant */}
            <Sheet open={isAiOpen} onOpenChange={setIsAiOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  data-testid="button-ai-assistant"
                >
                    <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                    AI Assistant
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[500px] p-0 flex flex-col">
                <AiChatbot onContentGenerated={handleContentGenerated} />
              </SheetContent>
            </Sheet>

            {/* Share Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-share">
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
                    <Button variant="outline" size="icon" data-testid="button-settings">
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
                            <Label>Tags</Label>
                            <Input placeholder="Add tags (comma separated)" />
                        </div>
                        <div className="space-y-2">
                            <Label>SEO Description</Label>
                            <Textarea placeholder="Meta description for search engines..." className="h-24" />
                            <p className="text-xs text-muted-foreground text-right">0/160</p>
                        </div>
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
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button data-testid="button-publish">
                <Send className="h-4 w-4 mr-2" /> Publish
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

        {/* Preview Modal */}
        <Sheet open={showPreview} onOpenChange={setShowPreview}>
          <SheetContent side="right" className="w-full sm:w-[90vw] md:w-[75vw] overflow-y-auto p-0">
            <SheetHeader className="px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
              <SheetTitle>Article Preview</SheetTitle>
            </SheetHeader>
            <div className="px-6 py-8 max-w-3xl">
              <article>
                <h1 className="text-5xl font-serif font-bold mb-8 text-foreground">{title}</h1>
                <div 
                  className="prose dark:prose-invert max-w-none text-base leading-relaxed text-foreground"
                  style={{
                    '--tw-prose-body': 'currentColor',
                    '--tw-prose-headings': 'currentColor',
                    '--tw-prose-bold': 'currentColor',
                  } as React.CSSProperties}
                >
                  <style>{`
                    .preview-content h1 {
                      font-size: 2.25rem;
                      font-weight: bold;
                      margin-top: 2.5rem;
                      margin-bottom: 1.25rem;
                      color: currentColor;
                    }
                    .preview-content h2 {
                      font-size: 1.875rem;
                      font-weight: bold;
                      margin-top: 2rem;
                      margin-bottom: 1rem;
                      color: currentColor;
                    }
                    .preview-content h3 {
                      font-size: 1.5rem;
                      font-weight: bold;
                      margin-top: 1.5rem;
                      margin-bottom: 0.75rem;
                      color: currentColor;
                    }
                    .preview-content h4 {
                      font-size: 1.25rem;
                      font-weight: bold;
                      margin-top: 1.25rem;
                      margin-bottom: 0.75rem;
                      color: currentColor;
                    }
                    .preview-content h5 {
                      font-size: 1.125rem;
                      font-weight: bold;
                      margin-top: 1rem;
                      margin-bottom: 0.5rem;
                      color: currentColor;
                    }
                    .preview-content p {
                      margin-bottom: 1rem;
                      line-height: 1.75;
                      color: currentColor;
                    }
                    .preview-content strong {
                      font-weight: 700;
                      color: currentColor;
                    }
                    .preview-content em {
                      font-style: italic;
                      color: currentColor;
                    }
                    .preview-content ul {
                      list-style-type: disc;
                      margin-left: 1.5rem;
                      margin-bottom: 1rem;
                    }
                    .preview-content li {
                      margin-bottom: 0.5rem;
                      color: currentColor;
                    }
                    .preview-content hr {
                      margin: 2rem 0;
                      border: none;
                      border-top: 1px solid currentColor;
                      opacity: 0.2;
                    }
                  `}</style>
                  <div className="preview-content" dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(content) }} />
                </div>
              </article>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </SidebarLayout>
  );
}

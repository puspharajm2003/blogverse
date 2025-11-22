import { useState, useRef, useCallback } from 'react';
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
    AlertCircle
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

    const formattedText = generatedText
      .split('\n\n')
      .filter((para: string) => para.trim().length > 0)
      .map((para: string) => `<p>${para.trim().replace(/\n/g, '<br>')}</p>`)
      .join('');
    
    updateContent(content + formattedText, title);
  };

  const wordCount = countWords(content);

  return (
    <SidebarLayout>
      <div className="h-full flex flex-col">
        {/* Editor Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background sticky top-0 z-20">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                 <span className="text-xs text-muted-foreground">Status</span>
                 <span className="text-sm font-medium flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-amber-500 rounded-full" /> Draft
                 </span>
             </div>
             <Separator orientation="vertical" className="h-8" />
             <div className="text-sm text-muted-foreground">
                Last saved: <span className="text-foreground">Just now</span>
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
            <Button variant="outline" data-testid="button-save">
                <Save className="h-4 w-4 mr-2" /> Save
            </Button>
            <Button data-testid="button-publish">
                <Send className="h-4 w-4 mr-2" /> Publish
            </Button>
          </div>
        </header>

        {/* Editor Main Area */}
        <div className="flex-1 overflow-y-auto bg-background">
            <div className="max-w-3xl mx-auto py-12 px-6">
                {/* Title Input */}
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => updateContent(content, e.target.value)}
                    className="w-full text-4xl md:text-5xl font-serif font-bold bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/50 mb-8"
                    placeholder="Enter your title..."
                    data-testid="input-title"
                />
                
                {/* Tiptap Editor */}
                <RichTextEditor 
                    content={content} 
                    onChange={(newContent) => updateContent(newContent, title)} 
                    className="border-none shadow-none bg-transparent"
                />
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
      </div>
    </SidebarLayout>
  );
}

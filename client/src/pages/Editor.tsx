import { useState } from 'react';
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/lib/api";
import { 
    Save, 
    Send, 
    Image as ImageIcon, 
    Settings, 
    Sparkles, 
    Search,
    Tag,
    Globe,
    Loader2
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

export default function Editor() {
  const [title, setTitle] = useState("Untitled Draft");
  const [content, setContent] = useState("<p>Start writing...</p>");
  const [isAiOpen, setIsAiOpen] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generationType, setGenerationType] = useState<"section" | "full" | "outline" | "title" | "tags" | "meta">("section");

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const response = await api.generateBlogContent(aiPrompt, generationType);
      
      if (response.error) {
        console.error("AI Error:", response.error);
        alert(`Error: ${response.error}\n\n${response.details || 'Please check your OpenAI API key and try again.'}`);
        setIsGenerating(false);
        return;
      }

      const generatedText = response.text || "";
      
      if (!generatedText) {
        console.error("No content generated");
        alert("No content was generated. Please try again.");
        setIsGenerating(false);
        return;
      }

      if (generationType === "title") {
        setTitle(generatedText);
      } else if (generationType === "tags") {
        console.log("Generated tags:", generatedText);
        alert(`Tags:\n${generatedText}`);
      } else if (generationType === "meta") {
        console.log("Generated meta:", generatedText);
        alert(`SEO Meta Description:\n${generatedText}`);
      } else if (generationType === "outline") {
        const outlineHtml = `<h2>Article Outline</h2><p>${generatedText.replace(/\n/g, '</p><p>')}</p>`;
        setContent(prev => prev + outlineHtml);
      } else {
        // Full article or section - wrap in paragraphs
        const formattedText = generatedText.split('\n\n').map(para => `<p>${para.trim()}</p>`).join('');
        setContent(prev => prev + formattedText);
      }
      
      setAiPrompt("");
    } catch (error) {
      console.error("Failed to generate content:", error);
      alert("Failed to generate content. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

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
            <Button variant="ghost" onClick={() => setIsAiOpen(true)}>
                <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                AI Assistant
            </Button>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
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
                    </div>
                </SheetContent>
            </Sheet>
            <Button variant="outline">
                <Save className="h-4 w-4 mr-2" /> Save
            </Button>
            <Button>
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
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-4xl md:text-5xl font-serif font-bold bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/50 mb-8"
                    placeholder="Enter your title..."
                />
                
                {/* Tiptap Editor */}
                <RichTextEditor 
                    content={content} 
                    onChange={setContent} 
                    className="border-none shadow-none bg-transparent"
                />
            </div>
        </div>

        {/* AI Assistant Panel (Simulated) */}
        {isAiOpen && (
            <div className="w-80 border-l border-border bg-card fixed right-0 top-16 bottom-0 z-30 flex flex-col shadow-xl animate-in slide-in-from-right-10">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-500" /> AI Assistant
                    </h3>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsAiOpen(false)}>
                        ✕
                    </Button>
                </div>
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    <div className="bg-muted/50 p-3 rounded-lg text-sm">
                        <p className="font-medium mb-1 text-indigo-600">Suggestion</p>
                        <p>Your title is a bit generic. Try something more catchy like:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                            <li>"5 Ways AI is Revolutionizing Blogging"</li>
                            <li>"The Writer's Guide to AI Tools"</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs uppercase text-muted-foreground font-bold">Generation Type</Label>
                        <Select value={generationType} onValueChange={(v: any) => setGenerationType(v)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="section">Write Section</SelectItem>
                            <SelectItem value="full">Full Article</SelectItem>
                            <SelectItem value="outline">Outline</SelectItem>
                            <SelectItem value="title">Title Suggestion</SelectItem>
                            <SelectItem value="tags">Generate Tags</SelectItem>
                            <SelectItem value="meta">SEO Description</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="p-4 border-t border-border">
                    <div className="flex gap-2">
                        <Input 
                            placeholder={`Ask AI to ${generationType === 'full' ? 'write a full article' : generationType === 'outline' ? 'create an outline' : generationType === 'title' ? 'suggest titles' : 'write'}...`}
                            className="h-9 text-xs" 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                            disabled={isGenerating}
                        />
                        <Button 
                            size="sm" 
                            className="h-9 w-9 p-0"
                            onClick={handleAiGenerate}
                            disabled={isGenerating || !aiPrompt.trim()}
                        >
                            {isGenerating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Powered by OpenAI GPT-5</p>
                </div>
            </div>
        )}
      </div>
    </SidebarLayout>
  );
}

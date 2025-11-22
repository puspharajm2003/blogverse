import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send, Copy, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  message: string;
  generationType?: string;
  topic?: string;
  createdAt?: string;
}

interface AiChatbotProps {
  onContentGenerated?: (content: string, type: string) => void;
}

interface PendingContent {
  text: string;
  type: string;
  messageIndex: number;
}

export function AiChatbot({ onContentGenerated }: AiChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [generationType, setGenerationType] = useState<
    "section" | "full" | "outline" | "title" | "tags" | "meta"
  >("section");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingContent, setPendingContent] = useState<PendingContent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await api.getChatHistory(30);
        setMessages(history);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };
    loadHistory();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      message: input,
      generationType,
      topic: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Save user message
      await api.saveChatMessage(
        "user",
        input,
        generationType,
        input
      );

      // Generate content
      const response = await api.generateBlogContent(input, generationType);

      if (response.error) {
        const errorMessage: ChatMessage = {
          role: "assistant",
          message: `Error: ${response.error}. ${response.details || ""}`,
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        message: response.text || "No content generated",
        generationType,
        topic: input,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message
      await api.saveChatMessage(
        "assistant",
        response.text || "No content generated",
        generationType,
        input
      );

      // Set pending content for Apply/Re-Generate options
      setPendingContent({
        text: response.text || "",
        type: generationType,
        messageIndex: messages.length + 1,
      });
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        message: "Failed to generate content. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyContent = () => {
    if (!pendingContent) return;
    if (onContentGenerated) {
      onContentGenerated(pendingContent.text, pendingContent.type);
    }
    setPendingContent(null);
  };

  const handleRegenerate = async () => {
    if (!pendingContent) return;
    
    const topic = messages[pendingContent.messageIndex - 1]?.message || input;
    setIsLoading(true);
    
    try {
      const response = await api.generateBlogContent(topic, generationType);
      
      if (!response.error && response.text) {
        setPendingContent({
          text: response.text,
          type: generationType,
          messageIndex: messages.length,
        });
      }
    } catch (error) {
      console.error("Regeneration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const typeLabels: Record<string, string> = {
    section: "📝 Write Section",
    full: "📚 Full Article",
    outline: "📋 Create Outline",
    title: "✨ Generate Titles",
    tags: "🏷️ Generate Tags",
    meta: "🔍 Meta Description",
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">AI Content Assistant</h2>
        <div className="flex gap-2">
          <Select
            value={generationType}
            onValueChange={(value: any) => setGenerationType(value)}
          >
            <SelectTrigger data-testid="select-generation-type" className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="section">📝 Write Section</SelectItem>
              <SelectItem value="full">📚 Full Article</SelectItem>
              <SelectItem value="outline">📋 Create Outline</SelectItem>
              <SelectItem value="title">✨ Generate Titles</SelectItem>
              <SelectItem value="tags">🏷️ Generate Tags</SelectItem>
              <SelectItem value="meta">🔍 Meta Description</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 p-4 space-y-4">
        <div>
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-2">👋 Welcome to AI Content Assistant</p>
              <p className="text-sm">
                Select a generation type above and describe your topic to get started.
              </p>
              <p className="text-sm mt-4 space-y-1">
                <span className="block">Examples:</span>
                <span className="block">• "10 Tips for Better Blogging"</span>
                <span className="block">• "AI in Content Creation"</span>
                <span className="block">• "Digital Marketing Strategies"</span>
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-4 animate-in fade-in-50 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm font-medium mb-1 opacity-75">
                    {msg.role === "user" ? "You" : "Assistant"}
                    {msg.generationType && msg.role === "assistant" && (
                      <span className="ml-2 text-xs">
                        {typeLabels[msg.generationType]}
                      </span>
                    )}
                  </p>
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {msg.message}
                  </div>
                  {msg.role === "assistant" && pendingContent?.messageIndex === idx && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="text-xs"
                        onClick={handleApplyContent}
                        disabled={isLoading}
                        data-testid="button-apply-content"
                      >
                        ✓ Apply
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={handleRegenerate}
                        disabled={isLoading}
                        data-testid="button-regenerate-content"
                      >
                        ↻ Re-Generate
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => copyToClipboard(msg.message, `msg-${idx}`)}
                        data-testid={`button-copy-message-${idx}`}
                      >
                        {copiedId === `msg-${idx}` ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  {msg.role === "assistant" && pendingContent?.messageIndex !== idx && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-6 text-xs"
                      onClick={() => copyToClipboard(msg.message, `msg-${idx}`)}
                      data-testid={`button-copy-message-${idx}`}
                    >
                      {copiedId === `msg-${idx}` ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating content...
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-4 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder={`Describe your ${typeLabels[generationType].toLowerCase().replace(/^[^\s]+\s/, "")} topic...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
            data-testid="input-chat-message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            data-testid="button-send-chat"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          💡 Tip: Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { api } from "@/lib/api";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

export default function Feedback() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("bug");
  const [priority, setPriority] = useState("normal");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/feedback", { subject, message, category, priority, rating: rating || null });
      toast.success("Thank you! Your feedback has been submitted.");
      setSubject("");
      setMessage("");
      setCategory("bug");
      setPriority("normal");
      setRating(0);
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="flex-1 p-8 bg-gradient-to-br from-background via-background/95 to-background">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <h1 className="text-4xl font-serif font-bold">Send Feedback</h1>
            </div>
            <p className="text-muted-foreground">Help us improve BlogVerse with your thoughts and suggestions</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feedback Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    data-testid="feedback-category-select"
                  >
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="improvement">Improvement</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your feedback"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    data-testid="feedback-subject-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us more details..."
                    rows={6}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background resize-none"
                    data-testid="feedback-message-textarea"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                      data-testid="feedback-priority-select"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-2xl ${rating >= star ? "text-yellow-500" : "text-muted-foreground"}`}
                          data-testid={`rating-star-${star}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full gap-2"
                  data-testid="submit-feedback-button"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Submitting..." : "Send Feedback"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}

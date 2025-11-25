import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, CheckCircle2, AlertCircle, Lightbulb, Bug } from "lucide-react";
import { toast } from "sonner";

export default function Feedback() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("bug");
  const [priority, setPriority] = useState("normal");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadFeedbackHistory();
  }, []);

  const loadFeedbackHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await api.getFeedback();
      setFeedbackList(data || []);
    } catch (error) {
      console.error("Failed to load feedback history", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await api.submitFeedback({ subject, message, category, priority, rating: rating || null });
      toast.success("Thank you! Your feedback has been submitted.");
      setSubject("");
      setMessage("");
      setCategory("bug");
      setPriority("normal");
      setRating(0);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      loadFeedbackHistory();
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "bug": return <Bug className="h-4 w-4" />;
      case "feature": return <Lightbulb className="h-4 w-4" />;
      case "improvement": return <CheckCircle2 className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "bug": return "from-red-500/10 to-red-500/5 border-red-200/50";
      case "feature": return "from-blue-500/10 to-blue-500/5 border-blue-200/50";
      case "improvement": return "from-green-500/10 to-green-500/5 border-green-200/50";
      default: return "from-purple-500/10 to-purple-500/5 border-purple-200/50";
    }
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case "urgent": return "text-red-500";
      case "high": return "text-orange-500";
      case "normal": return "text-blue-500";
      default: return "text-gray-500";
    }
  };

  return (
    <SidebarLayout>
      <div className="flex-1 p-8 bg-gradient-to-br from-background via-background/95 to-background">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Send Feedback</h1>
                <p className="text-muted-foreground">Help us improve BlogVerse with your thoughts and suggestions</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Feedback Form */}
            <div className="lg:col-span-2">
              {submitted && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-200/50 rounded-lg flex gap-3 items-start animate-in fade-in">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">Feedback submitted!</p>
                    <p className="text-sm text-green-800 dark:text-green-200">Thank you for helping us improve.</p>
                  </div>
                </div>
              )}

              <Card className="border-2 hover:border-blue-200/50 transition-colors">
                <CardHeader className="bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                  <CardTitle>Feedback Form</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-3">Category *</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-4 py-2.5 border border-input rounded-lg bg-background hover:border-blue-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                          data-testid="feedback-category-select"
                        >
                          <option value="bug">🐛 Bug Report</option>
                          <option value="feature">✨ Feature Request</option>
                          <option value="improvement">🎯 Improvement</option>
                          <option value="other">💬 Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-3">Priority</label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full px-4 py-2.5 border border-input rounded-lg bg-background hover:border-blue-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                          data-testid="feedback-priority-select"
                        >
                          <option value="low">⬇️ Low</option>
                          <option value="normal">➡️ Normal</option>
                          <option value="high">⬆️ High</option>
                          <option value="urgent">🔴 Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-3">Subject *</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g., Editor crashes when uploading large images"
                        className="w-full px-4 py-2.5 border border-input rounded-lg bg-background hover:border-blue-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                        data-testid="feedback-subject-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-3">Message *</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us more details about your feedback..."
                        rows={5}
                        className="w-full px-4 py-2.5 border border-input rounded-lg bg-background hover:border-blue-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none"
                        data-testid="feedback-message-textarea"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-3">How satisfied are you with BlogVerse?</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-4xl transition-all transform hover:scale-110 ${
                              rating >= star
                                ? "text-yellow-400 drop-shadow-md"
                                : "text-muted-foreground/30 hover:text-muted-foreground/60"
                            }`}
                            data-testid={`rating-star-${star}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold h-11 transition-all"
                      data-testid="submit-feedback-button"
                    >
                      <Send className="h-4 w-4" />
                      {submitting ? "Submitting..." : "Send Feedback"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-200/50">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">{feedbackList.length}</div>
                  <p className="text-sm text-muted-foreground mt-1">Feedback items</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-200/50">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-green-600">{feedbackList.filter(f => f.status === "resolved").length}</div>
                  <p className="text-sm text-muted-foreground mt-1">Resolved</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-200/50">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-purple-600">{feedbackList.filter(f => f.status === "open").length}</div>
                  <p className="text-sm text-muted-foreground mt-1">Open</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Feedback History */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6" />
              Your Feedback History
            </h2>
            {loadingHistory ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Loading feedback...
                </CardContent>
              </Card>
            ) : feedbackList.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No feedback submitted yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {feedbackList.slice().reverse().map((item) => (
                  <Card
                    key={item.id}
                    className={`bg-gradient-to-r ${getCategoryColor(item.category)} hover:shadow-md transition-all`}
                    data-testid={`feedback-item-${item.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-background rounded">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{item.subject}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.message}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs font-semibold uppercase ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                              <span className="px-2 py-0.5 bg-background text-xs rounded-full">
                                {item.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        {item.rating && (
                          <div className="text-lg">{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

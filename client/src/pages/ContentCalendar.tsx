import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Plus, Clock, AlertCircle, CheckCircle, Edit2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export default function ContentCalendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledDate: new Date().toISOString().split("T")[0],
    status: "planned",
    priority: "normal",
    category: "",
    tags: "",
  });

  useEffect(() => {
    loadEvents();
  }, [user]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/calendar", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      }).then(r => r.json());
      setEvents(response || []);
    } catch (error) {
      console.error("Failed to load calendar:", error);
      toast.error("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      const newEvent = await fetch("/api/calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        }),
      }).then(r => r.json());
      setEvents([...events, newEvent]);
      toast.success("Event added to calendar!");
      setShowDialog(false);
      setFormData({
        title: "",
        description: "",
        scheduledDate: new Date().toISOString().split("T")[0],
        status: "planned",
        priority: "normal",
        category: "",
        tags: "",
      });
    } catch (error) {
      console.error("Failed to add event:", error);
      toast.error("Failed to add event");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await fetch(`/api/calendar/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      }).then(r => r.json());
      setEvents(events.filter(e => e.id !== id));
      toast.success("Event removed");
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "review":
        return "bg-purple-100 text-purple-800";
      case "writing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    return priority === "high" ? "🔴" : priority === "normal" ? "🟡" : "🟢";
  };

  const filteredEvents = events.filter(e => filterStatus === "all" || e.status === filterStatus);

  return (
    <SidebarLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-8 w-8 text-blue-500" />
              <h1 className="text-4xl font-serif font-bold">Content Calendar</h1>
            </div>
            <p className="text-muted-foreground">Plan, organize, and track your article publishing schedule</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Schedule Article
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Planned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.filter(e => e.status === "planned").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Writing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.filter(e => e.status === "writing").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.filter(e => e.status === "scheduled").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.filter(e => e.status === "published").length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Schedule</CardTitle>
              <div className="flex gap-2">
                {["planned", "writing", "review", "scheduled", "published"].map(status => (
                  <Badge
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFilterStatus(filterStatus === status ? "all" : status)}
                  >
                    {status}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No scheduled articles yet. Start planning your content!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()).map(event => (
                  <div key={event.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">{getPriorityIcon(event.priority)}</span>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                      </div>
                      {event.description && <p className="text-sm text-muted-foreground mb-2">{event.description}</p>}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(event.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex gap-1">
                            {event.tags.map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Article</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Article title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Brief description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="planned">Planned</option>
                  <option value="writing">Writing</option>
                  <option value="review">Review</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  placeholder="tag1, tag2, tag3"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
              <Button onClick={handleAddEvent} className="w-full">Schedule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  );
}

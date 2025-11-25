import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Save } from "lucide-react";
import { toast } from "sonner";

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    newComments: true,
    articleUpdates: true,
    achievementUnlocked: true,
    emailNotifications: true,
    pushNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await api.get("/api/notification-preferences");
      if (data) {
        setPrefs(data);
      }
    } catch (error) {
      console.error("Failed to load preferences", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.patch("/api/notification-preferences", prefs);
      toast.success("Notification preferences updated");
    } catch (error) {
      toast.error("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex-1 p-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="flex-1 p-8 bg-gradient-to-br from-background via-background/95 to-background">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bell className="h-8 w-8 text-blue-500" />
              <h1 className="text-4xl font-serif font-bold">Notification Settings</h1>
            </div>
            <p className="text-muted-foreground">Control how and when you receive notifications</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground">Notification Types</h3>
                
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors" data-testid="pref-new-comments">
                  <div>
                    <p className="font-medium">New Comments</p>
                    <p className="text-sm text-muted-foreground">Get notified when someone comments on your articles</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={prefs.newComments}
                      onChange={() => handleToggle("newComments")}
                      className="w-5 h-5 rounded"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors" data-testid="pref-article-updates">
                  <div>
                    <p className="font-medium">Article Updates</p>
                    <p className="text-sm text-muted-foreground">Get notified when articles you follow are updated</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={prefs.articleUpdates}
                      onChange={() => handleToggle("articleUpdates")}
                      className="w-5 h-5 rounded"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors" data-testid="pref-achievements">
                  <div>
                    <p className="font-medium">Achievement Unlocked</p>
                    <p className="text-sm text-muted-foreground">Celebrate when you unlock new achievements</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={prefs.achievementUnlocked}
                      onChange={() => handleToggle("achievementUnlocked")}
                      className="w-5 h-5 rounded"
                    />
                  </label>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground">Delivery Method</h3>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors" data-testid="pref-email">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={prefs.emailNotifications}
                      onChange={() => handleToggle("emailNotifications")}
                      className="w-5 h-5 rounded"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors" data-testid="pref-push">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={prefs.pushNotifications}
                      onChange={() => handleToggle("pushNotifications")}
                      className="w-5 h-5 rounded"
                    />
                  </label>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full gap-2"
                data-testid="save-preferences-button"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}

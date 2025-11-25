import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Save, MessageSquare, Zap, Trophy, Mail, Smartphone } from "lucide-react";
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
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await api.getNotificationPreferences();
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
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateNotificationPreferences(prefs);
      toast.success("Notification preferences updated");
      setUnsavedChanges(false);
    } catch (error) {
      toast.error("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadPreferences();
    setUnsavedChanges(false);
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex-1 p-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading notification settings...</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="flex-1 p-8 bg-gradient-to-br from-background via-background/95 to-background">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Bell className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Notification Settings</h1>
                <p className="text-muted-foreground">Control how and when you receive notifications</p>
              </div>
            </div>
          </div>

          {/* Notification Types */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-bold">Notification Types</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* New Comments */}
              <Card
                className={`border-2 transition-all cursor-pointer hover:border-blue-200/50 ${
                  prefs.newComments ? "bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-200/50" : "hover:shadow-md"
                }`}
                data-testid="pref-new-comments"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        </div>
                        <h3 className="font-semibold">New Comments</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">Get notified when someone comments on your articles</p>
                    </div>
                    <button
                      onClick={() => handleToggle("newComments")}
                      className={`w-12 h-7 rounded-full transition-all flex items-center ${
                        prefs.newComments
                          ? "bg-blue-500"
                          : "bg-muted"
                      }`}
                      data-testid="toggle-new-comments"
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                          prefs.newComments ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Article Updates */}
              <Card
                className={`border-2 transition-all cursor-pointer hover:border-purple-200/50 ${
                  prefs.articleUpdates ? "bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-200/50" : "hover:shadow-md"
                }`}
                data-testid="pref-article-updates"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded">
                          <Zap className="h-4 w-4 text-purple-600" />
                        </div>
                        <h3 className="font-semibold">Article Updates</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">Get notified when articles you follow are updated</p>
                    </div>
                    <button
                      onClick={() => handleToggle("articleUpdates")}
                      className={`w-12 h-7 rounded-full transition-all flex items-center ${
                        prefs.articleUpdates
                          ? "bg-purple-500"
                          : "bg-muted"
                      }`}
                      data-testid="toggle-article-updates"
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                          prefs.articleUpdates ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card
                className={`border-2 transition-all cursor-pointer hover:border-green-200/50 ${
                  prefs.achievementUnlocked ? "bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-200/50" : "hover:shadow-md"
                }`}
                data-testid="pref-achievements"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-green-500/20 rounded">
                          <Trophy className="h-4 w-4 text-green-600" />
                        </div>
                        <h3 className="font-semibold">Achievement Unlocked</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">Celebrate when you unlock new achievements</p>
                    </div>
                    <button
                      onClick={() => handleToggle("achievementUnlocked")}
                      className={`w-12 h-7 rounded-full transition-all flex items-center ${
                        prefs.achievementUnlocked
                          ? "bg-green-500"
                          : "bg-muted"
                      }`}
                      data-testid="toggle-achievements"
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                          prefs.achievementUnlocked ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Delivery Methods */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold">Delivery Methods</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <Card
                className={`border-2 transition-all cursor-pointer hover:border-orange-200/50 ${
                  prefs.emailNotifications ? "bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-200/50" : "hover:shadow-md"
                }`}
                data-testid="pref-email"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-orange-500/20 rounded">
                          <Mail className="h-4 w-4 text-orange-600" />
                        </div>
                        <h3 className="font-semibold">Email Notifications</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <button
                      onClick={() => handleToggle("emailNotifications")}
                      className={`w-12 h-7 rounded-full transition-all flex items-center ${
                        prefs.emailNotifications
                          ? "bg-orange-500"
                          : "bg-muted"
                      }`}
                      data-testid="toggle-email"
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                          prefs.emailNotifications ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Push */}
              <Card
                className={`border-2 transition-all cursor-pointer hover:border-red-200/50 ${
                  prefs.pushNotifications ? "bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-200/50" : "hover:shadow-md"
                }`}
                data-testid="pref-push"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-red-500/20 rounded">
                          <Bell className="h-4 w-4 text-red-600" />
                        </div>
                        <h3 className="font-semibold">Push Notifications</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                    </div>
                    <button
                      onClick={() => handleToggle("pushNotifications")}
                      className={`w-12 h-7 rounded-full transition-all flex items-center ${
                        prefs.pushNotifications
                          ? "bg-red-500"
                          : "bg-muted"
                      }`}
                      data-testid="toggle-push"
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                          prefs.pushNotifications ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 sticky bottom-8 bg-gradient-to-t from-background to-transparent pt-4">
            {unsavedChanges && (
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={saving}
                data-testid="reset-preferences-button"
              >
                Reset Changes
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving || !unsavedChanges}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold h-11 transition-all"
              data-testid="save-preferences-button"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

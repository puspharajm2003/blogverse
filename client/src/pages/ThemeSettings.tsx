import { useTheme } from "next-themes";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Palette, Layout, Type, Image as ImageIcon, User, Building, CreditCard, Globe, Lock, Bell, Crown, Moon, Sun, Monitor, Eye } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DarkModeToggle } from "@/components/DarkModeToggle";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [siteIndexing, setSiteIndexing] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userPlan, setUserPlan] = useState("free");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userAvatar, setUserAvatar] = useState("");
  const [selectedHeadingFont, setSelectedHeadingFont] = useState("playfair");

  const fontOptions = [
    { id: "playfair", name: "Playfair Display", class: "font-serif" },
    { id: "inter", name: "Inter", class: "font-sans" },
    { id: "space-mono", name: "Space Mono", class: "font-mono" },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await api.getProfile();
        if (profile) {
          setDisplayName(profile.displayName || "");
          setEmail(profile.email || "");
          setBio(profile.bio || "");
          setSiteTitle(profile.displayName ? `${profile.displayName}'s Blog` : "My Blog");
          setSiteDescription("Share your thoughts and ideas with the world.");
          setUserPlan(profile.plan || "free");
          setIsAdmin(profile.isAdmin || false);
          setUserAvatar(profile.avatar || "");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile settings");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const result = await api.updateProfile({
        displayName,
        bio,
      });
      if (result && !result.error) {
        toast.success("Settings saved successfully");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-10 w-40 bg-muted rounded"></div>
            <div className="grid gap-4">
              {[1,2,3].map(i => <div key={i} className="h-32 bg-muted rounded"></div>)}
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <style>{`
        .theme-card {
          transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
        }
        
        .theme-card:hover {
          transform: translateY(-4px);
        }
        
        .theme-card.active {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }
      `}</style>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences.</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your public profile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={userAvatar || "https://github.com/shadcn.png"} />
                    <AvatarFallback>{displayName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline">Change Avatar</Button>
                </div>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={email} disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" placeholder="Tell us about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} className="h-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme Settings */}
          <TabsContent value="theme" className="space-y-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5" /> Dark Mode Settings
                </CardTitle>
                <CardDescription>
                  Optimize your reading experience with improved readability in low-light conditions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Choose Your Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <ThemeOptionCard
                      icon={<Sun className="h-6 w-6" />}
                      label="Light Mode"
                      description="Bright and clear"
                      active={theme === "light"}
                      onClick={() => setTheme("light")}
                      testId="option-light"
                    />
                    <ThemeOptionCard
                      icon={<Moon className="h-6 w-6" />}
                      label="Dark Mode"
                      description="Easy on the eyes"
                      active={theme === "dark"}
                      onClick={() => setTheme("dark")}
                      testId="option-dark"
                    />
                    <ThemeOptionCard
                      icon={<Monitor className="h-6 w-6" />}
                      label="System"
                      description="Auto-switch"
                      active={theme === "system"}
                      onClick={() => setTheme("system")}
                      testId="option-system"
                    />
                  </div>
                </div>

                <Separator />

                {/* Quick Toggle */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Quick Toggle</Label>
                  <p className="text-sm text-muted-foreground">Use these buttons for instant theme switching</p>
                  <div className="flex gap-4 items-center">
                    <DarkModeToggle variant="inline" size="md" />
                    <div className="text-xs text-muted-foreground">
                      Current: <span className="font-semibold capitalize">{theme}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Info */}
                <div className="bg-blue-500/10 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <span className="font-semibold">💡 Tip:</span> Dark mode reduces eye strain in low-light environments and helps save battery on OLED displays.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Preferences</CardTitle>
                <CardDescription>Configure your blog settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-title">Site Title</Label>
                    <Input id="site-title" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-desc">Site Description</Label>
                    <Input id="site-desc" value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label className="text-base">Search Engine Indexing</Label>
                      <p className="text-sm text-muted-foreground">Allow indexing by search engines</p>
                    </div>
                    <Switch checked={siteIndexing} onCheckedChange={setSiteIndexing} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
}

function ThemeOptionCard({ icon, label, description, active, onClick, testId }: any) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`theme-card w-full p-4 rounded-lg border-2 transition-all text-center ${
        active
          ? "border-primary bg-primary/5"
          : "border-border bg-background hover:border-primary/50"
      }`}
    >
      <div className="flex justify-center mb-3 text-primary">{icon}</div>
      <div className="font-semibold text-sm">{label}</div>
      <div className="text-xs text-muted-foreground mt-1">{description}</div>
    </button>
  );
}

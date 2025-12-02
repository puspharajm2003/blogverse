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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Palette, Layout, Type, Image as ImageIcon, User, Building, CreditCard, Globe, Lock, Bell, Crown, Moon, Sun, Monitor, Eye, Upload, Trash2 } from "lucide-react";
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
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [avatarTab, setAvatarTab] = useState("professional");

  // Utility: Generate color from name
  const getColorFromName = (name: string) => {
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500"];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Utility: Get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Avatar types
  const professionalStyles = [
    { id: "pixel-art", name: "Pixel Art", url: (seed: string) => `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}` },
    { id: "avataaars", name: "Modern 3D", url: (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}` },
    { id: "adventurer", name: "Adventurer", url: (seed: string) => `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}` },
    { id: "big-heads", name: "Big Heads", url: (seed: string) => `https://api.dicebear.com/7.x/big-heads/svg?seed=${seed}` },
    { id: "bottts", name: "Robots", url: (seed: string) => `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}` },
    { id: "personas", name: "Personas", url: (seed: string) => `https://api.dicebear.com/7.x/personas/svg?seed=${seed}` },
  ];

  const handleAvatarSelect = async (avatarUrl: string) => {
    setUserAvatar(avatarUrl);
    try {
      await api.updateProfile({ avatar: avatarUrl });
      toast.success("Avatar updated!");
      setShowAvatarSelector(false);
    } catch (error) {
      toast.error("Failed to update avatar");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setUserAvatar(dataUrl);
      try {
        await api.updateProfile({ avatar: dataUrl });
        toast.success("Photo uploaded successfully!");
        setShowAvatarSelector(false);
      } catch (error) {
        toast.error("Failed to upload photo");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGravatar = () => {
    const gravatarUrl = `https://www.gravatar.com/avatar/${email?.toLowerCase() || "user"}?d=identicon&s=200`;
    handleAvatarSelect(gravatarUrl);
  };

  const handleInitialsAvatar = () => {
    const initials = getInitials(displayName || "U");
    const bgColor = getColorFromName(displayName || "");
    setUserAvatar(`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="%23FF6B6B" width="200" height="200"/><text x="50%" y="50%" font-size="80" font-weight="bold" fill="white" text-anchor="middle" dy=".3em">${initials}</text></svg>`.replace("#FF6B6B", bgColor === "bg-red-500" ? "#EF4444" : bgColor === "bg-blue-500" ? "#3B82F6" : bgColor === "bg-green-500" ? "#10B981" : bgColor === "bg-yellow-500" ? "#FBBF24" : bgColor === "bg-purple-500" ? "#A855F7" : bgColor === "bg-pink-500" ? "#EC4899" : "#6366F1"));
    try {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="%23${getColorCode(bgColor)}" width="200" height="200"/><text x="50%" y="50%" font-size="80" font-weight="bold" fill="white" text-anchor="middle" dy=".3em">${initials}</text></svg>`;
      const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      setUserAvatar(dataUrl);
      api.updateProfile({ avatar: dataUrl });
      toast.success("Initials avatar created!");
      setShowAvatarSelector(false);
    } catch (error) {
      toast.error("Failed to create avatar");
    }
  };

  const getColorCode = (colorClass: string) => {
    const colorMap: any = {
      "bg-red-500": "EF4444",
      "bg-blue-500": "3B82F6",
      "bg-green-500": "10B981",
      "bg-yellow-500": "FBBF24",
      "bg-purple-500": "A855F7",
      "bg-pink-500": "EC4899",
      "bg-indigo-500": "6366F1",
      "bg-orange-500": "F97316",
    };
    return colorMap[colorClass] || "3B82F6";
  };

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
          cursor: pointer;
          transition: all 0.3s ease;
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
                    <AvatarImage src={userAvatar || "https://api.dicebear.com/7.x/avataaars/svg"} onError={(e) => (e.currentTarget as HTMLImageElement).style.display = 'none'} />
                    <AvatarFallback>{displayName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" onClick={() => setShowAvatarSelector(true)}>Change Avatar</Button>
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
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Choose Your Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <ThemeOptionCard icon={<Sun className="h-6 w-6" />} label="Light" active={theme === "light"} onClick={() => setTheme("light")} />
                    <ThemeOptionCard icon={<Moon className="h-6 w-6" />} label="Dark" active={theme === "dark"} onClick={() => setTheme("dark")} />
                    <ThemeOptionCard icon={<Monitor className="h-6 w-6" />} label="System" active={theme === "system"} onClick={() => setTheme("system")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Preferences</CardTitle>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Comprehensive Avatar Selector Modal */}
        <Dialog open={showAvatarSelector} onOpenChange={setShowAvatarSelector}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Choose Your Avatar</DialogTitle>
              <DialogDescription>Select from professional styles, upload a photo, or generate from your name</DialogDescription>
            </DialogHeader>

            <Tabs value={avatarTab} onValueChange={setAvatarTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="professional">Professional</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="initials">Initials</TabsTrigger>
                <TabsTrigger value="gravatar">Gravatar</TabsTrigger>
              </TabsList>

              {/* Professional Avatars */}
              <TabsContent value="professional" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {professionalStyles.map((style) => (
                    <div key={style.id} className="space-y-3">
                      <p className="text-sm font-medium text-center">{style.name}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2].map((i) => (
                          <button
                            key={`${style.id}-${i}`}
                            onClick={() => handleAvatarSelect(style.url(`random${Math.random()}`))}
                            className="p-3 border-2 border-border rounded-lg hover:border-primary transition-all"
                            data-testid={`avatar-${style.id}-${i}`}
                          >
                            <img src={style.url(`seed${i}`)} alt={`${style.name} ${i}`} className="w-12 h-12 rounded mx-auto" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Photo Upload */}
              <TabsContent value="upload" className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">Upload Your Photo</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="avatar-upload" className="cursor-pointer">Choose File</label>
                  </Button>
                </div>
              </TabsContent>

              {/* Initials Avatar */}
              <TabsContent value="initials" className="space-y-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Create an avatar from your name initials with a random color</p>
                  <div className="flex items-center justify-center p-8">
                    <div className={`${getColorFromName(displayName)} h-24 w-24 rounded-lg flex items-center justify-center text-white text-4xl font-bold`}>
                      {getInitials(displayName || "U")}
                    </div>
                  </div>
                  <Button onClick={handleInitialsAvatar} className="w-full">Use Initials Avatar</Button>
                </div>
              </TabsContent>

              {/* Gravatar */}
              <TabsContent value="gravatar" className="space-y-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Use your Gravatar associated with {email || "your email"}</p>
                  <div className="flex items-center justify-center p-8">
                    <img src={`https://www.gravatar.com/avatar/${email?.toLowerCase() || "user"}?d=identicon&s=100`} alt="Gravatar" className="h-24 w-24 rounded-lg" />
                  </div>
                  <Button onClick={handleGravatar} className="w-full">Use Gravatar</Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  );
}

function ThemeOptionCard({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`theme-card p-4 rounded-lg border-2 transition-all ${
        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      }`}
    >
      <div className="text-center space-y-2">
        {icon}
        <p className="text-sm font-medium">{label}</p>
      </div>
    </button>
  );
}

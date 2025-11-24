import { useTheme } from "next-themes";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Palette, Layout, Type, Image as ImageIcon, User, Building, CreditCard, Globe, Lock, Bell, Crown } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account, billing, and blog preferences.</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-[800px]">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your public profile and bio.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={userAvatar || "https://github.com/shadcn.png"} />
                            <AvatarFallback>{displayName?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline">Change Avatar</Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input 
                              id="name" 
                              value={displayName} 
                              onChange={(e) => setDisplayName(e.target.value)}
                              data-testid="input-display-name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                              id="email" 
                              value={email} 
                              disabled
                              data-testid="input-email"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea 
                          id="bio" 
                          placeholder="Tell us about yourself..." 
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="h-32"
                          data-testid="textarea-bio"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Site Settings</CardTitle>
                    <CardDescription>Configure your blog's core identity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="site-title">Site Title</Label>
                        <Input 
                          id="site-title" 
                          value={siteTitle}
                          onChange={(e) => setSiteTitle(e.target.value)}
                          data-testid="input-site-title"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="site-desc">Site Description</Label>
                        <Input 
                          id="site-desc" 
                          value={siteDescription}
                          onChange={(e) => setSiteDescription(e.target.value)}
                          data-testid="input-site-description"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Search Engine Indexing</Label>
                            <p className="text-sm text-muted-foreground">Allow search engines to index your site.</p>
                        </div>
                        <Switch 
                          checked={siteIndexing}
                          onCheckedChange={setSiteIndexing}
                          data-testid="toggle-site-indexing"
                        />
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          {/* Theme Settings */}
          <TabsContent value="theme" className="space-y-6">
             <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
                <Card className="col-span-1 h-full overflow-y-auto border-0 shadow-none bg-transparent p-0">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-medium flex items-center gap-2">
                                <Palette className="h-4 w-4" /> Colors
                            </h3>
                            <div className="grid grid-cols-5 gap-2">
                                {['bg-blue-500', 'bg-indigo-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'].map((color) => (
                                    <div key={color} className={`${color} h-8 w-8 rounded-full cursor-pointer hover:ring-2 ring-offset-2 ring-foreground transition-all shadow-sm`} />
                                ))}
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <Label htmlFor="dark-mode">Dark Mode</Label>
                                <Switch 
                                  id="dark-mode" 
                                  checked={theme === "dark"}
                                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                                  data-testid="toggle-dark-mode"
                                />
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                            <h3 className="font-medium flex items-center gap-2">
                                <Type className="h-4 w-4" /> Typography
                            </h3>
                            <div className="space-y-2">
                                <Label>Heading Font</Label>
                                <div className="grid grid-cols-1 gap-2">
                                    <Button variant="outline" className="justify-start font-serif">Playfair Display</Button>
                                    <Button variant="ghost" className="justify-start font-sans">Inter</Button>
                                    <Button variant="ghost" className="justify-start font-mono">Space Mono</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Live Preview Area */}
                <div className="col-span-2 bg-muted/20 rounded-xl border border-border overflow-hidden flex flex-col">
                    <div className="h-8 bg-muted border-b border-border flex items-center px-4 gap-2">
                        <div className="flex gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-red-400" />
                            <div className="h-3 w-3 rounded-full bg-amber-400" />
                            <div className="h-3 w-3 rounded-full bg-green-400" />
                        </div>
                        <div className="flex-1 bg-background h-5 rounded mx-4 text-[10px] flex items-center px-2 text-muted-foreground">
                            blogverse.com/preview
                        </div>
                    </div>
                    <div className="flex-1 p-8 overflow-y-auto bg-background">
                         <article className="max-w-lg mx-auto">
                            <span className="text-xs font-bold text-indigo-600 mb-2 block uppercase tracking-wider">Blog</span>
                            <h1 className="font-serif text-4xl font-bold mb-4 leading-tight">{siteTitle || "My Blog"}</h1>
                            <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
                                <div className="h-6 w-6 rounded-full bg-muted" />
                                <span>By {displayName || "Author"}</span>
                            </div>
                            <div className="prose prose-sm text-muted-foreground">
                                <p className="mb-4">
                                    {siteDescription || "Share your thoughts and ideas with the world."}
                                </p>
                                <Button size="sm">Read More</Button>
                            </div>
                        </article>
                    </div>
                </div>
             </div>
          </TabsContent>

          {/* Team Settings */}
          <TabsContent value="team" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage who has access to your blog.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={userAvatar || "https://github.com/shadcn.png"} />
                                    <AvatarFallback>{displayName?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                      {displayName}
                                      {isAdmin && <Crown className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{email}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">{isAdmin ? "Admin" : "Owner"}</span>
                                <Button variant="ghost" size="sm" disabled>Active</Button>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full border-dashed">
                            <User className="mr-2 h-4 w-4" /> Invite Team Member
                        </Button>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Settings */}
          <TabsContent value="billing" className="space-y-6">
             <div className="grid md:grid-cols-3 gap-6">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>You are currently on the {isAdmin ? "Admin (Enterprise)" : userPlan ? userPlan.charAt(0).toUpperCase() + userPlan.slice(1) : "Free"} Plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 border border-primary/20 bg-primary/5 rounded-lg">
                            <div>
                                <div className="font-bold text-lg flex items-center gap-2">
                                  {isAdmin ? "Admin (Enterprise)" : userPlan ? userPlan.charAt(0).toUpperCase() + userPlan.slice(1) : "Free"} Plan
                                  {isAdmin && <Crown className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {isAdmin ? "Full access to all features" : userPlan === "pro" ? "$12/month, billed monthly" : "Limited features"}
                                </div>
                            </div>
                            <Badge variant="default" className="bg-primary">Active</Badge>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Storage Used</span>
                                <span>4.2GB / {userPlan === "enterprise" || isAdmin ? "Unlimited" : "10GB"}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full ${userPlan === "enterprise" || isAdmin ? "bg-yellow-500 w-full" : "bg-indigo-500"} ${userPlan === "free" ? "w-[30%]" : "w-[42%]"}`} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>AI Generations</span>
                                <span>{isAdmin ? "Unlimited" : userPlan === "pro" ? "850 / 1000" : "10 / 100"}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full ${isAdmin ? "bg-yellow-500 w-full" : "bg-indigo-500"} ${userPlan === "free" ? "w-[10%]" : "w-[85%]"}`} />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        {!isAdmin && userPlan === "free" && <Button variant="outline">Upgrade Plan</Button>}
                    </CardFooter>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isAdmin ? (
                          <div className="flex items-center gap-3 p-3 border border-border rounded-md bg-yellow-50 dark:bg-yellow-950/20">
                            <Crown className="h-5 w-5 text-yellow-500" />
                            <div className="flex-1">
                                <div className="font-medium text-sm">Admin Account</div>
                                <div className="text-xs text-muted-foreground">No payment required</div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <div className="font-medium text-sm">Visa ending in 4242</div>
                                    <div className="text-xs text-muted-foreground">Expires 12/2026</div>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="w-full text-muted-foreground">Update Payment</Button>
                          </>
                        )}
                    </CardContent>
                </Card>
             </div>
          </TabsContent>
          
          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Custom Domain</CardTitle>
                    <CardDescription>Connect your own domain to your blog.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input placeholder="www.yourdomain.com" disabled={!isAdmin && userPlan !== "enterprise"} />
                        <Button disabled={!isAdmin && userPlan !== "enterprise"}>Verify</Button>
                    </div>
                    {(!isAdmin && userPlan !== "enterprise") && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-100">
                            <Lock className="h-4 w-4 mt-0.5" />
                            <p>Custom domains are available on Enterprise plan.</p>
                        </div>
                      </div>
                    )}
                    {(isAdmin || userPlan === "enterprise") && (
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Globe className="h-4 w-4 mt-0.5" />
                            <p>Please add a CNAME record pointing to <strong>cname.blogverse.com</strong> in your DNS settings.</p>
                        </div>
                      </div>
                    )}
                </CardContent>
             </Card>

             <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Delete Account</div>
                            <div className="text-sm text-muted-foreground">Permanently delete your account and all content.</div>
                        </div>
                        <Button variant="destructive">Delete Account</Button>
                    </div>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
}

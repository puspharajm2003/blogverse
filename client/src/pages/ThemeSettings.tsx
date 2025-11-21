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
import { Palette, Layout, Type, Image as ImageIcon, User, Building, CreditCard, Globe, Lock, Bell } from "lucide-react";

export default function Settings() {
  return (
    <SidebarLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account, billing, and blog preferences.</p>
          </div>
          <Button>Save Changes</Button>
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
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <Button variant="outline">Change Avatar</Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input id="name" defaultValue="Jane Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" defaultValue="jane@example.com" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" placeholder="Tell us about yourself..." className="h-32" />
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
                        <Input id="site-title" defaultValue="Jane's Blog" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="site-desc">Site Description</Label>
                        <Input id="site-desc" defaultValue="Thoughts on tech, design, and life." />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Search Engine Indexing</Label>
                            <p className="text-sm text-muted-foreground">Allow search engines to index your site.</p>
                        </div>
                        <Switch defaultChecked />
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
                                <Switch id="dark-mode" />
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
                            <span className="text-xs font-bold text-indigo-600 mb-2 block uppercase tracking-wider">Lifestyle</span>
                            <h1 className="font-serif text-4xl font-bold mb-4 leading-tight">The Art of Digital Minimalism</h1>
                            <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
                                <div className="h-6 w-6 rounded-full bg-muted" />
                                <span>By Jane Doe</span>
                            </div>
                            <div className="prose prose-sm text-muted-foreground">
                                <p className="mb-4">
                                    In a world overflowing with notifications, tabs, and endless feeds, the ability to focus has become a superpower. Digital minimalism isn't just about deleting apps.
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
                        {[
                            { name: "Jane Doe", email: "jane@example.com", role: "Owner", img: "CN" },
                            { name: "John Smith", email: "john@example.com", role: "Editor", img: "JS" },
                            { name: "Sarah Wilson", email: "sarah@example.com", role: "Writer", img: "SW" },
                        ].map((member, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarFallback>{member.img}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{member.name}</div>
                                        <div className="text-sm text-muted-foreground">{member.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-muted-foreground">{member.role}</span>
                                    <Button variant="ghost" size="sm">Manage</Button>
                                </div>
                            </div>
                        ))}
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
                        <CardDescription>You are currently on the Pro Plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 border border-primary/20 bg-primary/5 rounded-lg">
                            <div>
                                <div className="font-bold text-lg">Pro Plan</div>
                                <div className="text-sm text-muted-foreground">$12/month, billed monthly</div>
                            </div>
                            <Badge variant="default" className="bg-primary">Active</Badge>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Storage Used</span>
                                <span>4.2GB / 10GB</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[42%]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>AI Generations</span>
                                <span>850 / 1000</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[85%]" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline">Upgrade Plan</Button>
                    </CardFooter>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                                <div className="font-medium text-sm">Visa ending in 4242</div>
                                <div className="text-xs text-muted-foreground">Expires 12/2026</div>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full text-muted-foreground">Update Payment</Button>
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
                        <Input placeholder="www.yourdomain.com" />
                        <Button>Verify</Button>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Globe className="h-4 w-4 mt-0.5" />
                            <p>Please add a CNAME record pointing to <strong>cname.blogverse.com</strong> in your DNS settings.</p>
                        </div>
                    </div>
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

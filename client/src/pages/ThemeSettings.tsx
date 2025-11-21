import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Layout, Type, Image as ImageIcon } from "lucide-react";

export default function ThemeSettings() {
  return (
    <SidebarLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Settings Panel */}
        <div className="w-80 border-r border-border overflow-y-auto p-6 bg-card">
          <div className="mb-6">
            <h1 className="text-2xl font-serif font-bold">Theme</h1>
            <p className="text-sm text-muted-foreground">Customize your blog's appearance.</p>
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="general"><Palette className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="layout"><Layout className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="typo"><Type className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="media"><ImageIcon className="h-4 w-4" /></TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6">
                <div className="space-y-3">
                    <Label>Accent Color</Label>
                    <div className="grid grid-cols-5 gap-2">
                        {['bg-blue-500', 'bg-indigo-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'].map((color) => (
                            <div key={color} className={`${color} h-8 w-8 rounded-full cursor-pointer hover:ring-2 ring-offset-2 ring-foreground transition-all`} />
                        ))}
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <Switch id="dark-mode" />
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="typo" className="space-y-6">
                 <div className="space-y-3">
                    <Label>Heading Font</Label>
                    <div className="grid grid-cols-1 gap-2">
                        <Button variant="outline" className="justify-start font-serif">Playfair Display</Button>
                        <Button variant="ghost" className="justify-start font-sans">Inter</Button>
                        <Button variant="ghost" className="justify-start font-mono">Space Mono</Button>
                    </div>
                 </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview */}
        <div className="flex-1 bg-muted/20 p-8 overflow-y-auto flex items-center justify-center">
            <div className="w-full max-w-4xl bg-background rounded-xl shadow-2xl border border-border min-h-[800px] overflow-hidden flex flex-col">
                {/* Fake Browser Header */}
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
                
                {/* Preview Content */}
                <div className="flex-1 p-12 overflow-y-auto">
                    <header className="flex justify-between items-center mb-16">
                        <div className="font-serif text-2xl font-bold">My Awesome Blog</div>
                        <nav className="flex gap-6 text-sm font-medium">
                            <span>Home</span>
                            <span>About</span>
                            <span>Subscribe</span>
                        </nav>
                    </header>

                    <article className="max-w-2xl mx-auto">
                        <span className="text-sm font-medium text-indigo-600 mb-4 block uppercase tracking-wider">Lifestyle</span>
                        <h1 className="font-serif text-5xl font-bold mb-6 leading-tight">The Art of Digital Minimalism in 2024</h1>
                        <div className="flex items-center gap-3 mb-8 text-sm text-muted-foreground">
                            <div className="h-8 w-8 rounded-full bg-muted" />
                            <span>By Jane Doe</span>
                            <span>•</span>
                            <span>Nov 21, 2025</span>
                        </div>
                        <div className="prose prose-lg text-muted-foreground">
                            <p className="mb-4">
                                In a world overflowing with notifications, tabs, and endless feeds, the ability to focus has become a superpower. Digital minimalism isn't just about deleting apps; it's about reclaiming your attention.
                            </p>
                            <p>
                                We often confuse connectivity with productivity. But true creative work requires deep, uninterrupted silence. This is where the magic happens—in the spaces between the noise.
                            </p>
                        </div>
                    </article>
                </div>
            </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

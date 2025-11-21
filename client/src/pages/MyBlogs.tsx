import { useState } from 'react';
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Globe, Eye, MoreHorizontal, Plus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";

export default function MyBlogs() {
  const blogs = [
    {
      id: 1,
      name: "Jane's Tech Blog",
      url: "blogverse.com/jane-tech",
      status: "Active",
      posts: 12,
      views: "45.2k",
      image: "https://images.unsplash.com/photo-1499750310159-57f0e1b013b6?auto=format&fit=crop&q=80&w=500"
    },
    {
      id: 2,
      name: "Travel Diaries",
      url: "blogverse.com/jane-travels",
      status: "Draft",
      posts: 3,
      views: "1.2k",
      image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=500"
    }
  ];

  return (
    <SidebarLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">My Blogs</h1>
            <p className="text-muted-foreground">Manage your publications and sites.</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Create New Blog
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden group">
              <div className="aspect-video relative bg-muted">
                <img 
                  src={blog.image} 
                  alt={blog.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant={blog.status === "Active" ? "default" : "secondary"} className="backdrop-blur-md bg-background/80 text-foreground">
                    {blog.status}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="font-serif text-xl">{blog.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                   <Globe className="h-3 w-3" /> {blog.url}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6 text-sm text-muted-foreground">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground text-lg">{blog.posts}</span>
                    <span>Posts</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="font-bold text-foreground text-lg">{blog.views}</span>
                    <span>Total Views</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link href="/blog/preview" className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                        <Eye className="h-4 w-4" /> Preview
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuItem>Analytics</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Create New Placeholder Card */}
          <div className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-6 text-center hover:bg-muted/30 transition-colors cursor-pointer h-full min-h-[300px]">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-1">Create another blog</h3>
            <p className="text-muted-foreground text-sm max-w-[200px]">
                Launch a new publication for a different audience.
            </p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Users, Plus, Trash2, Shield, Edit2, Eye, Share2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Collaborator {
  id: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  status: 'online' | 'offline';
  addedAt: string;
}

export function CollaboratorsPanel({ articleId }: { articleId?: string }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      email: 'editor@example.com',
      role: 'editor',
      status: 'online',
      addedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '2',
      email: 'reviewer@example.com',
      role: 'viewer',
      status: 'offline',
      addedAt: new Date(Date.now() - 172800000).toISOString()
    }
  ]);
  
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [newCollaboratorRole, setNewCollaboratorRole] = useState<'viewer' | 'editor'>('editor');

  const handleAddCollaborator = () => {
    if (!newCollaboratorEmail.trim()) {
      toast.error('Please enter an email');
      return;
    }

    const newCollaborator: Collaborator = {
      id: Date.now().toString(),
      email: newCollaboratorEmail,
      role: newCollaboratorRole,
      status: 'offline',
      addedAt: new Date().toISOString()
    };

    setCollaborators([...collaborators, newCollaborator]);
    setNewCollaboratorEmail("");
    toast.success(`${newCollaboratorEmail} added as ${newCollaboratorRole}`);
  };

  const handleRemove = (id: string) => {
    const collaborator = collaborators.find(c => c.id === id);
    setCollaborators(collaborators.filter(c => c.id !== id));
    toast.success(`${collaborator?.email} removed from collaboration`);
  };

  const handleRoleChange = (id: string, newRole: 'viewer' | 'editor' | 'admin') => {
    setCollaborators(collaborators.map(c => 
      c.id === id ? { ...c, role: newRole } : c
    ));
    toast.success('Role updated');
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'editor': return <Edit2 className="h-4 w-4" />;
      case 'viewer': return <Eye className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Real-Time Collaboration
          </CardTitle>
          <CardDescription>
            Invite team members to edit and review your article together
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Add Collaborator */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Add Collaborator</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={newCollaboratorEmail}
                onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                className="flex-1"
                data-testid="input-collaborator-email"
              />
              <Select value={newCollaboratorRole} onValueChange={(v: any) => setNewCollaboratorRole(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddCollaborator}
                className="gap-2"
                data-testid="button-add-collaborator"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          <Separator />

          {/* Collaborators List */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Active Collaborators ({collaborators.length})</label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {collaborators.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  <Share2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No collaborators yet</p>
                </div>
              ) : (
                collaborators.map((collab) => (
                  <div key={collab.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-xs bg-primary text-white">
                          {collab.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{collab.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={collab.status === 'online' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            <span className={`h-2 w-2 rounded-full mr-1 ${collab.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                            {collab.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                      <Select value={collab.role} onValueChange={(v: any) => handleRoleChange(collab.id, v)}>
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleRemove(collab.id)}
                        data-testid={`button-remove-collaborator-${collab.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

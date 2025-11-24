import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, RotateCcw, Eye, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Version {
  id: string;
  versionNumber: number;
  title: string;
  content: string;
  createdAt: string;
  changeDescription?: string;
  createdBy: string;
}

export function VersionHistory({ 
  articleId, 
  isOpen, 
  onClose,
  onRestoreVersion
}: { 
  articleId?: string;
  isOpen: boolean;
  onClose: () => void;
  onRestoreVersion?: (version: Version) => void;
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  useEffect(() => {
    if (isOpen && articleId) {
      loadVersions();
    }
  }, [isOpen, articleId]);

  const loadVersions = async () => {
    if (!articleId) return;
    setIsLoading(true);
    try {
      // Mock versions data - in production, fetch from API
      const mockVersions: Version[] = [
        {
          id: '1',
          versionNumber: 3,
          title: 'Article Title - Final',
          content: 'Latest version content...',
          createdAt: new Date().toISOString(),
          changeDescription: 'Final edits and proofreading',
          createdBy: 'user-1'
        },
        {
          id: '2',
          versionNumber: 2,
          title: 'Article Title - Draft 2',
          content: 'Second draft content...',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          changeDescription: 'Major content rewrite',
          createdBy: 'user-1'
        },
        {
          id: '3',
          versionNumber: 1,
          title: 'Article Title - Initial',
          content: 'First draft content...',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          changeDescription: 'Initial version',
          createdBy: 'user-1'
        }
      ];
      setVersions(mockVersions);
    } catch (error) {
      console.error('Failed to load versions:', error);
      toast.error('Failed to load version history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = (version: Version) => {
    if (onRestoreVersion) {
      onRestoreVersion(version);
      toast.success(`Restored to version ${version.versionNumber}`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Version History
          </DialogTitle>
          <DialogDescription>
            View, compare, and restore previous versions of your article
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-3">
            {versions.length === 0 ? (
              <Card className="bg-slate-50 dark:bg-slate-900/50 border-0">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">No versions available yet</p>
                </CardContent>
              </Card>
            ) : (
              versions.map((version, index) => (
                <Card 
                  key={version.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${selectedVersion?.id === version.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedVersion(version)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={index === 0 ? "default" : "secondary"}>
                            v{version.versionNumber}
                          </Badge>
                          {index === 0 && <Badge variant="outline" className="text-xs">Latest</Badge>}
                        </div>
                        <h3 className="font-semibold text-sm">{version.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {version.changeDescription || 'No description'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(version.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {selectedVersion?.id === version.id && (
                    <>
                      <Separator />
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded text-xs max-h-32 overflow-y-auto">
                            <p className="text-muted-foreground line-clamp-4">{version.content}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="gap-2"
                              onClick={() => setSelectedVersion(null)}
                            >
                              <Eye className="h-4 w-4" />
                              Preview
                            </Button>
                            {index > 0 && (
                              <Button 
                                size="sm"
                                className="gap-2 ml-auto"
                                onClick={() => handleRestore(version)}
                              >
                                <RotateCcw className="h-4 w-4" />
                                Restore Version
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  ExternalLink,
  GitBranch,
  Github,
  FolderGit2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Repository {
  id: string;
  name: string;
  url: string;
  provider: string;
  projectId: string | null;
  defaultBranch: string | null;
  createdAt: string;
  project?: { id: string; name: string; key: string } | null;
}

const repoSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  url: z.string().url("Must be a valid URL"),
  provider: z.enum(["github", "gitlab", "bitbucket"]),
  projectId: z.string().optional(),
  defaultBranch: z.string().optional(),
});

type RepoInput = z.infer<typeof repoSchema>;

function getProviderBadge(provider: string) {
  switch (provider) {
    case "github":
      return (
        <Badge className="bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">
          <Github className="h-3 w-3 mr-1" />
          GitHub
        </Badge>
      );
    case "gitlab":
      return (
        <Badge className="bg-orange-600 text-white">
          <FolderGit2 className="h-3 w-3 mr-1" />
          GitLab
        </Badge>
      );
    case "bitbucket":
      return (
        <Badge className="bg-blue-600 text-white">
          <GitBranch className="h-3 w-3 mr-1" />
          Bitbucket
        </Badge>
      );
    default:
      return <Badge variant="secondary">{provider}</Badge>;
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-9 w-48 bg-muted animate-pulse rounded" />
        <div className="h-10 w-44 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function ReposPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RepoInput>({
    resolver: zodResolver(repoSchema),
    defaultValues: {
      name: "",
      url: "",
      provider: "github",
      projectId: "",
      defaultBranch: "main",
    },
  });

  const fetchRepos = useCallback(async () => {
    try {
      setLoading(true);
      const [reposRes, projectsRes] = await Promise.all([
        fetch("/api/repos"),
        fetch("/api/projects"),
      ]);
      if (!reposRes.ok) throw new Error("Failed to fetch repositories");
      const reposJson = await reposRes.json();
      setRepos(reposJson.data ?? []);

      if (projectsRes.ok) {
        const projectsJson = await projectsRes.json();
        setProjects(
          (projectsJson.data ?? []).map((p: { id: string; name: string }) => ({
            id: p.id,
            name: p.name,
          }))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const onSubmit = async (data: RepoInput) => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to connect repository");
      setDialogOpen(false);
      reset();
      fetchRepos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect repository"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive text-lg font-medium">
            Error loading repositories
          </p>
          <p className="text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">
            Manage your connected Git repositories
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Connect Repository
        </Button>
      </div>

      {/* Repos Grid */}
      {repos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-lg border-dashed">
          <FolderGit2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No repositories connected</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Connect a Git repository to get started with version control
            integration.
          </p>
          <Button className="mt-4" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Connect Repository
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map((repo) => (
            <Card key={repo.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {repo.name}
                    </CardTitle>
                    {repo.project && (
                      <CardDescription className="text-xs">
                        Linked to {repo.project.key} - {repo.project.name}
                      </CardDescription>
                    )}
                  </div>
                  {getProviderBadge(repo.provider)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{repo.url}</span>
                  </a>
                  {repo.defaultBranch && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <GitBranch className="h-3.5 w-3.5" />
                      <span>{repo.defaultBranch}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Connect Repository Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Connect Repository</DialogTitle>
            <DialogDescription>
              Link a Git repository to your project.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repo-name">Repository Name</Label>
              <Input
                id="repo-name"
                placeholder="my-awesome-repo"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="repo-url">Repository URL</Label>
              <Input
                id="repo-url"
                placeholder="https://github.com/org/repo"
                {...register("url")}
              />
              {errors.url && (
                <p className="text-sm text-destructive">
                  {errors.url.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                defaultValue="github"
                onValueChange={(value) =>
                  setValue("provider", value as RepoInput["provider"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="gitlab">GitLab</SelectItem>
                  <SelectItem value="bitbucket">Bitbucket</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Project (Optional)</Label>
              <Select
                onValueChange={(value) => setValue("projectId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repo-branch">Default Branch</Label>
              <Input
                id="repo-branch"
                placeholder="main"
                {...register("defaultBranch")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Connecting..." : "Connect Repository"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

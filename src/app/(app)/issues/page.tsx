"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, Bug } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
import { getStatusColor, getSeverityColor, getTypeColor, formatDate, getInitials } from "@/lib/utils";
import { issueSchema, type IssueInput } from "@/lib/validations";
import { usePagination } from "@/hooks/use-pagination";
import { Pagination } from "@/components/ui/pagination";

interface Issue {
  id: string;
  title: string;
  description: string | null;
  status: string;
  severity: string;
  type: string;
  reproSteps: string | null;
  projectId: string;
  assigneeId: string | null;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  assignee?: { id: string; name: string | null; email: string | null; image: string | null } | null;
  reporter?: { id: string; name: string | null; email: string | null; image: string | null };
  project?: { id: string; name: string; key: string };
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-9 w-24 bg-muted animate-pulse rounded" />
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>
      <div className="flex gap-4">
        <div className="h-10 flex-1 bg-muted animate-pulse rounded" />
        <div className="h-10 w-40 bg-muted animate-pulse rounded" />
        <div className="h-10 w-40 bg-muted animate-pulse rounded" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function IssuesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string; key: string }[]>([]);
  const [projectId, setProjectId] = useState("");

  // Lazy-load projects the first time the create dialog opens so the page
  // avoids an extra network request on every mount.
  useEffect(() => {
    if (!newDialogOpen || projects.length > 0) return;
    fetch("/api/projects?pageSize=100")
      .then((r) => r.json())
      .then((json) => {
        const list: { id: string; name: string; key: string }[] = json.data ?? [];
        setProjects(list);
        if (list.length > 0) setProjectId(list[0].id);
      })
      .catch(() => {});
  }, [newDialogOpen, projects.length]);

  const serverParams = useMemo(
    () => ({ status: statusFilter, severity: severityFilter }),
    [statusFilter, severityFilter]
  );

  const {
    data: issues,
    pagination,
    loading,
    error,
    setPage,
    setPageSize,
    refetch,
  } = usePagination<Issue>({
    url: "/api/issues",
    params: serverParams,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<IssueInput>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "open",
      severity: "medium",
      type: "bug",
      reproSteps: "",
      assigneeId: "",
    },
  });

  const onSubmit = async (data: IssueInput) => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, projectId }),
      });
      if (!res.ok) throw new Error("Failed to create issue");
      setNewDialogOpen(false);
      reset();
      refetch();
    } catch (err) {
      console.error(err instanceof Error ? err.message : "Failed to create issue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setDetailDialogOpen(true);
  };

  // Client-side text search (status/severity are server-side filtered)
  const filteredIssues = issues.filter((issue) => {
    return (
      search === "" ||
      issue.title.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive text-lg font-medium">Error loading issues</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Issues</h1>
          <p className="text-muted-foreground">Track and resolve bugs and issues</p>
        </div>
        <Button onClick={() => setNewDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Issue
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Issues List */}
      {filteredIssues.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-lg border-dashed">
          <Bug className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No issues found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {issues.length === 0
              ? "No issues have been reported yet."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="col-span-4">Title</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-2">Severity</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-1">Updated</div>
          </div>
          {filteredIssues.map((issue) => (
            <Card
              key={issue.id}
              className="cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => handleIssueClick(issue)}
            >
              <CardContent className="p-4">
                <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center space-y-2 md:space-y-0">
                  <div className="col-span-4">
                    <h4 className="text-sm font-medium truncate">
                      {issue.title}
                    </h4>
                    {issue.project && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {issue.project.key} - {issue.project.name}
                      </p>
                    )}
                  </div>
                  <div className="col-span-1">
                    <Badge className={getTypeColor(issue.type)}>
                      {issue.type}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <Badge className={getSeverityColor(issue.severity)}>
                      {issue.severity}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <Badge className={getStatusColor(issue.status)}>
                      {issue.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    {issue.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={issue.assignee.image ?? undefined} />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(issue.assignee.name ?? "U")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs truncate">
                          {issue.assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Unassigned
                      </span>
                    )}
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(issue.updatedAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Issue Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedIssue && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedIssue.title}</DialogTitle>
                <DialogDescription>
                  {selectedIssue.project
                    ? `${selectedIssue.project.key} - ${selectedIssue.project.name}`
                    : "Issue details"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(selectedIssue.status)}>
                    {selectedIssue.status.replace("_", " ")}
                  </Badge>
                  <Badge className={getSeverityColor(selectedIssue.severity)}>
                    {selectedIssue.severity}
                  </Badge>
                  <Badge className={getTypeColor(selectedIssue.type)}>
                    {selectedIssue.type}
                  </Badge>
                </div>

                {selectedIssue.description && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Description
                    </Label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">
                      {selectedIssue.description}
                    </p>
                  </div>
                )}

                {selectedIssue.reproSteps && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Reproduction Steps
                    </Label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">
                      {selectedIssue.reproSteps}
                    </p>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Assignee
                    </Label>
                    {selectedIssue.assignee ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={selectedIssue.assignee.image ?? undefined}
                          />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(selectedIssue.assignee.name ?? "U")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{selectedIssue.assignee.name}</span>
                      </div>
                    ) : (
                      <p className="text-muted-foreground mt-1">Unassigned</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Reporter
                    </Label>
                    {selectedIssue.reporter ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={selectedIssue.reporter.image ?? undefined}
                          />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(selectedIssue.reporter.name ?? "U")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{selectedIssue.reporter.name}</span>
                      </div>
                    ) : (
                      <p className="text-muted-foreground mt-1">Unknown</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Created
                    </Label>
                    <p className="mt-1">{formatDate(selectedIssue.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Updated
                    </Label>
                    <p className="mt-1">{formatDate(selectedIssue.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Issue Dialog */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Report New Issue</DialogTitle>
            <DialogDescription>
              Create a new issue to track bugs or feature requests.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.key} — {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-title">Title</Label>
              <Input
                id="issue-title"
                placeholder="Issue title"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-desc">Description</Label>
              <Textarea
                id="issue-desc"
                placeholder="Describe the issue..."
                {...register("description")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  defaultValue="bug"
                  onValueChange={(value) =>
                    setValue("type", value as IssueInput["type"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select
                  defaultValue="medium"
                  onValueChange={(value) =>
                    setValue("severity", value as IssueInput["severity"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                defaultValue="open"
                onValueChange={(value) =>
                  setValue("status", value as IssueInput["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-repro">Reproduction Steps</Label>
              <Textarea
                id="issue-repro"
                placeholder="Steps to reproduce..."
                {...register("reproSteps")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNewDialogOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Issue"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

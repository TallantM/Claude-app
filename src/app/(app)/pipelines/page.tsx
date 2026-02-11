"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Play,
  Clock,
  GitBranch,
  GitCommit,
  CheckCircle2,
  XCircle,
  Loader2,
  Circle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getStatusColor, formatRelativeTime, formatDate } from "@/lib/utils";
import type { PipelineStatus, PipelineRunStatus } from "@/types";

interface PipelineStage {
  id: string;
  name: string;
  order: number;
}

interface PipelineRun {
  id: string;
  status: string;
  branch: string | null;
  commitSha: string | null;
  duration: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  triggeredBy?: { id: string; name: string | null };
}

interface Pipeline {
  id: string;
  name: string;
  status: string;
  projectId: string;
  config: string | null;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string; key: string };
  stages: PipelineStage[];
  runs: PipelineRun[];
}

function getRunStatusIcon(status: string) {
  switch (status) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "running":
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "cancelled":
      return <Circle className="h-4 w-4 text-gray-400" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
}

function getPipelineStatusDot(status: string) {
  const colors: Record<string, string> = {
    idle: "bg-gray-400",
    running: "bg-blue-500 animate-pulse",
    success: "bg-green-500",
    failed: "bg-red-500",
  };
  return colors[status] || "bg-gray-400";
}

function formatDuration(seconds: number | null): string {
  if (seconds == null) return "-";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h ${remainMins}m`;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-40 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPipeline, setExpandedPipeline] = useState<string | null>(null);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  const fetchPipelines = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pipelines");
      if (!res.ok) throw new Error("Failed to fetch pipelines");
      const json = await res.json();
      setPipelines(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipelines();
  }, [fetchPipelines]);

  const handleTriggerRun = async (pipelineId: string) => {
    try {
      setTriggeringId(pipelineId);
      const res = await fetch(`/api/pipelines/${pipelineId}/trigger`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to trigger pipeline run");
      fetchPipelines();
    } catch (err) {
      console.error("Error triggering pipeline:", err);
    } finally {
      setTriggeringId(null);
    }
  };

  const toggleExpanded = (pipelineId: string) => {
    setExpandedPipeline((prev) => (prev === pipelineId ? null : pipelineId));
  };

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive text-lg font-medium">Error loading pipelines</p>
          <p className="text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CI/CD Pipelines</h1>
        <p className="text-muted-foreground">
          Monitor and manage your build and deployment pipelines
        </p>
      </div>

      {/* Pipelines Grid */}
      {pipelines.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-lg border-dashed">
          <Play className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No pipelines configured</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Set up CI/CD pipelines for your projects.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelines.map((pipeline) => {
            const isExpanded = expandedPipeline === pipeline.id;
            const lastRun = pipeline.runs[0];

            return (
              <Card key={pipeline.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full shrink-0 ${getPipelineStatusDot(pipeline.status)}`}
                        />
                        <CardTitle className="text-base truncate">
                          {pipeline.name}
                        </CardTitle>
                      </div>
                      {pipeline.project && (
                        <CardDescription className="text-xs">
                          {pipeline.project.key} - {pipeline.project.name}
                        </CardDescription>
                      )}
                    </div>
                    <Badge className={getStatusColor(pipeline.status)}>
                      {pipeline.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  {/* Last run info */}
                  {lastRun ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {getRunStatusIcon(lastRun.status)}
                        <span className="text-muted-foreground">
                          Last run:{" "}
                          <span className="font-medium text-foreground">
                            {lastRun.status}
                          </span>
                        </span>
                      </div>
                      {lastRun.branch && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <GitBranch className="h-3.5 w-3.5" />
                          <span className="truncate">{lastRun.branch}</span>
                        </div>
                      )}
                      {lastRun.commitSha && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <GitCommit className="h-3.5 w-3.5" />
                          <code className="text-xs">
                            {lastRun.commitSha.slice(0, 7)}
                          </code>
                        </div>
                      )}
                      {lastRun.duration != null && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDuration(lastRun.duration)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No runs yet
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => handleTriggerRun(pipeline.id)}
                      disabled={triggeringId === pipeline.id}
                    >
                      {triggeringId === pipeline.id ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5 mr-1" />
                      )}
                      Trigger Run
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleExpanded(pipeline.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5 mr-1" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 mr-1" />
                      )}
                      Details
                    </Button>
                  </div>

                  {/* Expanded detail section */}
                  {isExpanded && (
                    <div className="mt-4 space-y-4">
                      <Separator />

                      {/* Stages */}
                      {pipeline.stages.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Stages</h4>
                          <div className="flex items-center gap-1 flex-wrap">
                            {pipeline.stages
                              .sort((a, b) => a.order - b.order)
                              .map((stage, idx) => (
                                <div key={stage.id} className="flex items-center">
                                  <Badge variant="outline" className="text-xs">
                                    {stage.name}
                                  </Badge>
                                  {idx < pipeline.stages.length - 1 && (
                                    <span className="text-muted-foreground mx-1">
                                      &rarr;
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Recent Runs */}
                      {pipeline.runs.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Recent Runs
                          </h4>
                          <div className="space-y-2">
                            {pipeline.runs.slice(0, 5).map((run) => (
                              <div
                                key={run.id}
                                className="flex items-center gap-3 text-sm p-2 rounded bg-muted/50"
                              >
                                {getRunStatusIcon(run.status)}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Badge className={getStatusColor(run.status)}>
                                      {run.status}
                                    </Badge>
                                    {run.branch && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <GitBranch className="h-3 w-3" />
                                        {run.branch}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground text-right">
                                  {run.duration != null && (
                                    <span>{formatDuration(run.duration)}</span>
                                  )}
                                  {run.startedAt && (
                                    <p>{formatRelativeTime(run.startedAt)}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

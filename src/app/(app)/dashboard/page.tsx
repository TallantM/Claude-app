"use client";

import { useEffect, useState } from "react";
import {
  FolderKanban,
  CheckSquare,
  CheckCircle,
  Bug,
  Zap,
  Users,
  Activity,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStatusColor, formatRelativeTime, getInitials } from "@/lib/utils";
import type {
  DashboardStats,
  ActivityType,
  ChartDataPoint,
} from "@/types";

// ─── Types ───

interface DashboardData {
  stats: DashboardStats;
  recentActivity: ActivityType[];
  taskDistribution: ChartDataPoint[];
}

// ─── Config ───

const statCards = [
  { key: "totalProjects" as const, label: "Total Projects", icon: FolderKanban, color: "text-primary" },
  { key: "totalTasks" as const, label: "Total Tasks", icon: CheckSquare, color: "text-foreground" },
  { key: "completedTasks" as const, label: "Completed Tasks", icon: CheckCircle, color: "text-green-600 dark:text-green-400" },
  { key: "openIssues" as const, label: "Open Issues", icon: Bug, color: "text-orange-600 dark:text-orange-400" },
  { key: "activeSprints" as const, label: "Active Sprints", icon: Zap, color: "text-purple-600 dark:text-purple-400" },
  { key: "teamMembers" as const, label: "Team Members", icon: Users, color: "text-blue-600 dark:text-blue-400" },
];

const taskStatusConfig = [
  { status: "todo", label: "To Do", color: "bg-gray-400 dark:bg-gray-500" },
  { status: "in_progress", label: "In Progress", color: "bg-blue-500 dark:bg-blue-400" },
  { status: "in_review", label: "In Review", color: "bg-yellow-500 dark:bg-yellow-400" },
  { status: "done", label: "Done", color: "bg-green-500 dark:bg-green-400" },
];

// ─── Helpers ───

/** Maps an activity entity type to a color-coded icon for the activity feed. */
function getActivityIcon(type: string) {
  switch (type) {
    case "task":
      return <CheckSquare className="h-4 w-4 text-blue-500" />;
    case "issue":
      return <Bug className="h-4 w-4 text-orange-500" />;
    case "project":
      return <FolderKanban className="h-4 w-4 text-primary" />;
    case "sprint":
      return <Zap className="h-4 w-4 text-purple-500" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
}

/** Placeholder pulse skeleton matching the stat cards + two-column grid layout. */
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 rounded-lg bg-muted animate-pulse" />
        <div className="h-96 rounded-lg bg-muted animate-pulse" />
      </div>
    </div>
  );
}

// ─── Main Page ───

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive text-lg font-medium">Error loading dashboard</p>
          <p className="text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Floor of 1 prevents division-by-zero when calculating bar widths
  const maxTaskCount = Math.max(
    ...taskStatusConfig.map((s) => {
      const point = data.taskDistribution.find((d) => d.label === s.status);
      return point?.value ?? 0;
    }),
    1
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your SDLC workspace</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ key, label, icon: Icon, color }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats[key]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No recent activity
              </p>
            ) : (
              <div className="space-y-4">
                {data.recentActivity.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-0.5">{getActivityIcon(activity.entity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={activity.user.image ?? undefined} />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(activity.user.name ?? "U")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">
                          {activity.user.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 truncate">
                        {activity.details}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taskStatusConfig.map(({ status, label, color }) => {
                const point = data.taskDistribution.find(
                  (d) => d.label === status
                );
                const count = point?.value ?? 0;
                const percentage = (count / maxTaskCount) * 100;

                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(status)}>
                          {label}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Tasks</span>
                <span className="font-semibold">{data.stats.totalTasks}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-semibold">
                  {data.stats.totalTasks > 0
                    ? Math.round(
                        (data.stats.completedTasks / data.stats.totalTasks) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { Download, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ─── Types ───

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  openIssues: number;
  activeSprints: number;
  teamMembers: number;
}

interface TaskDistItem {
  label: string;
  value: number;
}

interface Issue {
  severity: string;
  status: string;
}

interface Project {
  status: string;
}

interface ReportData {
  stats: DashboardStats;
  taskDistribution: TaskDistItem[];
  issues: Issue[];
  projects: Project[];
}

// ─── Chart Theming ───

const chartMutedColor = "hsl(var(--muted-foreground))";
const chartGridColor = "hsl(var(--border))";

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: chartMutedColor, font: { size: 12 } },
    },
  },
  scales: {
    x: {
      ticks: { color: chartMutedColor, font: { size: 11 } },
      grid: { color: chartGridColor },
    },
    y: {
      ticks: { color: chartMutedColor, font: { size: 11 } },
      grid: { color: chartGridColor },
      beginAtZero: true,
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: { color: chartMutedColor, font: { size: 12 }, padding: 16 },
    },
  },
};

// ─── Helpers ───

function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function countBy<T>(items: T[], key: keyof T): Record<string, number> {
  return items.reduce(
    (acc, item) => {
      const val = String(item[key]);
      acc[val] = (acc[val] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

// ─── Main Page ───

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [dashRes, issuesRes, projectsRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/issues?pageSize=500"),
          fetch("/api/projects?pageSize=500"),
        ]);

        if (!dashRes.ok || !issuesRes.ok || !projectsRes.ok) {
          throw new Error("Failed to load report data");
        }

        const [dash, issuesJson, projectsJson] = await Promise.all([
          dashRes.json(),
          issuesRes.json(),
          projectsRes.json(),
        ]);

        setReportData({
          stats: dash.stats,
          taskDistribution: dash.taskDistribution,
          issues: issuesJson.data ?? [],
          projects: projectsJson.data ?? [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reports");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">{error ?? "Failed to load reports"}</p>
      </div>
    );
  }

  const { stats, taskDistribution, issues, projects } = reportData;

  // ─── Build Chart Datasets ───

  // Task status distribution
  const taskStatusLabels = taskDistribution.map((d) =>
    d.label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
  const taskStatusData = {
    labels: taskStatusLabels,
    datasets: [
      {
        label: "Tasks",
        data: taskDistribution.map((d) => d.value),
        backgroundColor: [
          "hsla(var(--muted-foreground), 0.4)",
          "hsl(217, 91%, 60%, 0.7)",
          "hsl(48, 96%, 53%, 0.7)",
          "hsl(142, 71%, 45%, 0.7)",
        ],
        borderColor: [
          "hsl(var(--muted-foreground))",
          "hsl(217, 91%, 60%)",
          "hsl(48, 96%, 53%)",
          "hsl(142, 71%, 45%)",
        ],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Issue severity distribution
  const severityCounts = countBy(issues, "severity");
  const severityOrder = ["low", "medium", "high", "critical"];
  const issueSeverityData = {
    labels: severityOrder.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [
      {
        data: severityOrder.map((s) => severityCounts[s] ?? 0),
        backgroundColor: [
          "hsl(142, 71%, 45%)",
          "hsl(48, 96%, 53%)",
          "hsl(25, 95%, 53%)",
          "hsl(0, 84%, 60%)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Issue status distribution
  const statusCounts = countBy(issues, "status");
  const issueStatuses = ["open", "in_progress", "resolved", "closed"];
  const issueStatusData = {
    labels: issueStatuses.map((s) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())),
    datasets: [
      {
        label: "Issues",
        data: issueStatuses.map((s) => statusCounts[s] ?? 0),
        backgroundColor: [
          "hsl(0, 84%, 60%, 0.7)",
          "hsl(217, 91%, 60%, 0.7)",
          "hsl(142, 71%, 45%, 0.7)",
          "hsla(var(--muted-foreground), 0.4)",
        ],
        borderColor: [
          "hsl(0, 84%, 60%)",
          "hsl(217, 91%, 60%)",
          "hsl(142, 71%, 45%)",
          "hsl(var(--muted-foreground))",
        ],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Project status distribution
  const projectStatusCounts = countBy(projects, "status");
  const projectStatuses = ["active", "completed", "archived"];
  const projectStatusData = {
    labels: projectStatuses.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [
      {
        data: projectStatuses.map((s) => projectStatusCounts[s] ?? 0),
        backgroundColor: [
          "hsl(142, 71%, 45%)",
          "hsl(217, 91%, 60%)",
          "hsla(var(--muted-foreground), 0.4)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">Track your team&apos;s performance and project health</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Projects", value: stats.totalProjects },
          { label: "Total Tasks", value: stats.totalTasks },
          { label: "Completed", value: stats.completedTasks },
          { label: "Open Issues", value: stats.openIssues },
          { label: "Active Sprints", value: stats.activeSprints },
          { label: "Team Members", value: stats.teamMembers },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Task Status</CardTitle>
              <CardDescription>Distribution across all projects</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportToCSV(
                  "task-status.csv",
                  ["Status", "Count"],
                  taskDistribution.map((d) => [d.label, d.value])
                )
              }
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <Bar data={taskStatusData} options={commonOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Issue Severity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Issue Severity</CardTitle>
              <CardDescription>Issues categorized by severity ({issues.length} total)</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportToCSV(
                  "issue-severity.csv",
                  ["Severity", "Count"],
                  severityOrder.map((s) => [s, severityCounts[s] ?? 0])
                )
              }
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center justify-center">
              <Doughnut data={issueSeverityData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Issue Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Issue Status</CardTitle>
              <CardDescription>Open vs resolved vs closed</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportToCSV(
                  "issue-status.csv",
                  ["Status", "Count"],
                  issueStatuses.map((s) => [s, statusCounts[s] ?? 0])
                )
              }
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <Bar data={issueStatusData} options={commonOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Project Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Project Status</CardTitle>
              <CardDescription>Active, completed, and archived projects</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportToCSV(
                  "project-status.csv",
                  ["Status", "Count"],
                  projectStatuses.map((s) => [s, projectStatusCounts[s] ?? 0])
                )
              }
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center justify-center">
              <Doughnut data={projectStatusData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

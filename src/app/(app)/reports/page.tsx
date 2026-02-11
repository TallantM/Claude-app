"use client";

import { useState } from "react";
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
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Download } from "lucide-react";
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

const chartTextColor = "hsl(var(--foreground))";
const chartMutedColor = "hsl(var(--muted-foreground))";
const chartGridColor = "hsl(var(--border))";

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: chartMutedColor,
        font: { size: 12 },
      },
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
    },
  },
};

// Mock data for charts
const sprintLabels = [
  "Day 1", "Day 2", "Day 3", "Day 4", "Day 5",
  "Day 6", "Day 7", "Day 8", "Day 9", "Day 10",
];

const burndownData = {
  labels: sprintLabels,
  datasets: [
    {
      label: "Ideal",
      data: [50, 45, 40, 35, 30, 25, 20, 15, 10, 5],
      borderColor: "hsl(var(--muted-foreground))",
      borderDash: [5, 5],
      backgroundColor: "transparent",
      tension: 0,
      pointRadius: 0,
    },
    {
      label: "Actual",
      data: [50, 48, 42, 38, 32, 28, 22, 18, 12, 7],
      borderColor: "hsl(217, 91%, 60%)",
      backgroundColor: "hsla(217, 91%, 60%, 0.1)",
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: "hsl(217, 91%, 60%)",
    },
  ],
};

const velocityLabels = [
  "Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4",
  "Sprint 5", "Sprint 6", "Sprint 7", "Sprint 8",
];

const velocityData = {
  labels: velocityLabels,
  datasets: [
    {
      label: "Story Points Completed",
      data: [28, 35, 32, 40, 38, 42, 45, 48],
      backgroundColor: "hsla(217, 91%, 60%, 0.7)",
      borderColor: "hsl(217, 91%, 60%)",
      borderWidth: 1,
      borderRadius: 4,
    },
    {
      label: "Story Points Planned",
      data: [30, 35, 35, 40, 40, 45, 45, 50],
      backgroundColor: "hsla(var(--muted-foreground), 0.3)",
      borderColor: "hsl(var(--muted-foreground))",
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
};

const issueDistributionData = {
  labels: ["Low", "Medium", "High", "Critical"],
  datasets: [
    {
      data: [15, 25, 18, 8],
      backgroundColor: [
        "hsl(142, 71%, 45%)",
        "hsl(48, 96%, 53%)",
        "hsl(25, 95%, 53%)",
        "hsl(0, 84%, 60%)",
      ],
      borderColor: [
        "hsl(142, 71%, 45%)",
        "hsl(48, 96%, 53%)",
        "hsl(25, 95%, 53%)",
        "hsl(0, 84%, 60%)",
      ],
      borderWidth: 1,
    },
  ],
};

const completionTrendLabels = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const completionTrendData = {
  labels: completionTrendLabels,
  datasets: [
    {
      label: "Tasks Completed",
      data: [12, 19, 15, 25, 22, 30, 28, 35, 33, 40, 38, 45],
      borderColor: "hsl(142, 71%, 45%)",
      backgroundColor: "hsla(142, 71%, 45%, 0.1)",
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: "hsl(142, 71%, 45%)",
    },
    {
      label: "Tasks Created",
      data: [15, 22, 18, 28, 25, 35, 32, 38, 36, 42, 40, 48],
      borderColor: "hsl(25, 95%, 53%)",
      backgroundColor: "hsla(25, 95%, 53%, 0.1)",
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: "hsl(25, 95%, 53%)",
    },
  ],
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        color: chartMutedColor,
        font: { size: 12 },
        padding: 16,
      },
    },
  },
};

function handleExport(chartName: string) {
  // Placeholder export functionality
  alert(`Exporting ${chartName} data... (placeholder)`);
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground">
          Track your team&apos;s performance and project health
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Burndown Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Sprint Burndown</CardTitle>
              <CardDescription>
                Track remaining work in the current sprint
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("burndown")}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line
                data={burndownData}
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Velocity Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Team Velocity</CardTitle>
              <CardDescription>
                Story points completed per sprint
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("velocity")}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar
                data={velocityData}
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Issue Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Issue Distribution</CardTitle>
              <CardDescription>Issues categorized by severity</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("issues")}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <Doughnut data={issueDistributionData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Task Completion Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Task Completion Trend</CardTitle>
              <CardDescription>
                Monthly task creation vs completion
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("completion")}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line
                data={completionTrendData}
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

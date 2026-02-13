import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with proper precedence handling.
 * Wraps clsx + tailwind-merge so conflicting utilities resolve correctly.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date into a short, human-readable string like "Jan 5, 2025".
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Turn a date into a relative time string ("3h ago", "2d ago").
 * Falls back to formatDate once we're past a week.
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

/**
 * Derive a short project key from a name (e.g. "My Project" -> "MYPROJ").
 * Strips non-alphanumeric chars and caps at 6 characters.
 */
export function generateKey(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}

/**
 * Pull the first letter of each word for avatar fallbacks ("Jane Doe" -> "JD").
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Color Mapping Helpers ─────────────────────────────────
// These return Tailwind class strings for badges and chips.
// Each one covers both light and dark mode variants.

/**
 * Badge classes for workflow statuses (task, issue, sprint, pipeline, etc.).
 * Handles every status value across all entity types.
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    todo: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    in_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    open: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    planning: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    archived: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    idle: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    running: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
}

/**
 * Text color classes for priority indicators (low through critical).
 */
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: "text-green-600 dark:text-green-400",
    medium: "text-yellow-600 dark:text-yellow-400",
    high: "text-orange-600 dark:text-orange-400",
    critical: "text-red-600 dark:text-red-400",
  };
  return colors[priority] || "text-gray-600";
}

/**
 * Badge classes for issue severity levels.
 */
export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return colors[severity] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
}

/**
 * Badge classes for issue/task type categories (bug, feature, etc.).
 */
export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    bug: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    feature: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    improvement: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    task: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };
  return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
}

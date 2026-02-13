// ─── Pagination ───────────────────────────────────────────

export type {
  PaginationParams,
  PaginationMeta,
  PaginatedResponse,
} from "./pagination";
export { PAGINATION_DEFAULTS, PAGE_SIZE_OPTIONS } from "./pagination";

// ─── User Roles ────────────────────────────────────────────

/** Determines what a user can access and modify across the app. */
export enum UserRole {
  ADMIN = "admin",
  PROJECT_MANAGER = "project_manager",
  DEVELOPER = "developer",
  TESTER = "tester",
  VIEWER = "viewer",
}

// ─── Task Types ────────────────────────────────────────────

/** Kanban-style workflow states for tasks. */
export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  IN_REVIEW = "in_review",
  DONE = "done",
}

/** Urgency levels used for sorting and visual indicators on tasks. */
export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/** Categorizes what kind of work a task represents. */
export enum TaskType {
  TASK = "task",
  STORY = "story",
  BUG = "bug",
  EPIC = "epic",
}

// ─── Issue Types ───────────────────────────────────────────

/** Lifecycle states for bug reports and issues. */
export enum IssueStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

/** How badly the issue affects users or the system. */
export enum IssueSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// ─── Pipeline Types ────────────────────────────────────────

/** Overall state of a CI/CD pipeline. */
export enum PipelineStatus {
  IDLE = "idle",
  RUNNING = "running",
  SUCCESS = "success",
  FAILED = "failed",
}

/** State of an individual pipeline run (more granular than PipelineStatus). */
export enum PipelineRunStatus {
  PENDING = "pending",
  RUNNING = "running",
  SUCCESS = "success",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

// ─── Sprint Types ──────────────────────────────────────────

/** Tracks whether a sprint is being planned, actively worked, or wrapped up. */
export enum SprintStatus {
  PLANNING = "planning",
  ACTIVE = "active",
  COMPLETED = "completed",
}

// ─── Project Types ─────────────────────────────────────────

/** High-level project lifecycle state. */
export enum ProjectStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  COMPLETED = "completed",
}

// ─── Interfaces ────────────────────────────────────────────

/** Lightweight user info used in avatars, dropdowns, and assignee fields. */
export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

/** Project card data shown in the projects list view. */
export interface ProjectSummary {
  id: string;
  name: string;
  key: string;
  description: string | null;
  status: string;
  taskCount: number;
  openIssues: number;
  teamName: string | null;
}

/** A task with all its related data — assignee, labels, counts, etc. */
export interface TaskWithRelations {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  type: string;
  storyPoints: number | null;
  dueDate: string | null;
  position: number;
  projectId: string;
  sprintId: string | null;
  assigneeId: string | null;
  creatorId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: UserProfile | null;
  creator?: UserProfile;
  labels?: { label: { id: string; name: string; color: string } }[];
  _count?: { subtasks: number; comments: number };
}

/** A sprint along with the tasks assigned to it. */
export interface SprintWithTasks {
  id: string;
  name: string;
  goal: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  tasks: TaskWithRelations[];
}

/** Represents one column on the Kanban board. */
export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: TaskWithRelations[];
}

/** Aggregate numbers for the dashboard overview cards. */
export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  openIssues: number;
  activeSprints: number;
  teamMembers: number;
}

/** Generic label + value pair used by charts. */
export interface ChartDataPoint {
  label: string;
  value: number;
}

/** Shape of a notification from the API. */
export interface NotificationType {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

/** An activity feed entry tied to a specific entity (task, project, etc.). */
export interface ActivityType {
  id: string;
  type: string;
  entity: string;
  entityId: string;
  details: string | null;
  userId: string;
  createdAt: string;
  user: UserProfile;
}

// ─── API Response Types ────────────────────────────────────

/** Standard wrapper for API responses that may include data, an error, or both. */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// ─── NextAuth Extensions ───────────────────────────────────
// Augment the default NextAuth types so `session.user` includes our custom fields.

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

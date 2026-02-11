// ─── User Roles ────────────────────────────────────────────

export enum UserRole {
  ADMIN = "admin",
  PROJECT_MANAGER = "project_manager",
  DEVELOPER = "developer",
  TESTER = "tester",
  VIEWER = "viewer",
}

// ─── Task Types ────────────────────────────────────────────

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  IN_REVIEW = "in_review",
  DONE = "done",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum TaskType {
  TASK = "task",
  STORY = "story",
  BUG = "bug",
  EPIC = "epic",
}

// ─── Issue Types ───────────────────────────────────────────

export enum IssueStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

export enum IssueSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// ─── Pipeline Types ────────────────────────────────────────

export enum PipelineStatus {
  IDLE = "idle",
  RUNNING = "running",
  SUCCESS = "success",
  FAILED = "failed",
}

export enum PipelineRunStatus {
  PENDING = "pending",
  RUNNING = "running",
  SUCCESS = "success",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

// ─── Sprint Types ──────────────────────────────────────────

export enum SprintStatus {
  PLANNING = "planning",
  ACTIVE = "active",
  COMPLETED = "completed",
}

// ─── Project Types ─────────────────────────────────────────

export enum ProjectStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  COMPLETED = "completed",
}

// ─── Interfaces ────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

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

export interface SprintWithTasks {
  id: string;
  name: string;
  goal: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  tasks: TaskWithRelations[];
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: TaskWithRelations[];
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  openIssues: number;
  activeSprints: number;
  teamMembers: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface NotificationType {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

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

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// ─── NextAuth Extensions ───────────────────────────────────

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

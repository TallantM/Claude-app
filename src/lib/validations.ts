import { z } from "zod";

// ─── Auth Schemas ──────────────────────────────────────────

/** Validates login form — just email + password. */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/** Validates registration with password confirmation. */
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ─── Project & Task Schemas ────────────────────────────────

/** Project creation/update — key is auto-uppercased by Zod. */
export const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  key: z.string().min(2).max(6).toUpperCase(),
  description: z.string().max(500).optional(),
  status: z.enum(["active", "archived", "completed"]).default("active"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  teamId: z.string().optional(),
});

/** Task creation/update — covers all Kanban-relevant fields. */
export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(["todo", "in_progress", "in_review", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  type: z.enum(["task", "story", "bug", "epic"]).default("task"),
  storyPoints: z.number().int().min(0).max(100).optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  sprintId: z.string().optional(),
  parentId: z.string().optional(),
});

// ─── Issue & Sprint Schemas ────────────────────────────────

/** Bug reports and feature requests. */
export const issueSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).default("open"),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  type: z.enum(["bug", "feature", "improvement", "task"]).default("bug"),
  reproSteps: z.string().max(5000).optional(),
  assigneeId: z.string().optional(),
});

/** Sprint planning — name, goal, and date range. */
export const sprintSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  goal: z.string().max(500).optional(),
  status: z.enum(["planning", "active", "completed"]).default("planning"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// ─── Other Schemas ─────────────────────────────────────────

/** Validates a comment body — just a non-empty string. */
export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(5000),
});

/** CI/CD pipeline with optional stage definitions. */
export const pipelineSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  config: z.string().optional(),
  stages: z.array(z.object({
    name: z.string().min(1),
    order: z.number().int(),
  })).optional(),
});

// ─── Inferred Types ────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type IssueInput = z.infer<typeof issueSchema>;
export type SprintInput = z.infer<typeof sprintSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type PipelineInput = z.infer<typeof pipelineSchema>;

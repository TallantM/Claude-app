// Tests for Zod validation schemas — ensures form inputs are correctly validated
// before hitting the API layer.

import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  projectSchema,
  taskSchema,
  issueSchema,
  sprintSchema,
  commentSchema,
} from "@/lib/validations";

// ─── Auth Schemas ───

describe("loginSchema", () => {
  it("validates correct input", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("validates correct input", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      name: "J",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
  });
});

// ─── Entity Schemas ───

describe("projectSchema", () => {
  it("validates correct input", () => {
    const result = projectSchema.safeParse({
      name: "Test Project",
      key: "TEST",
      description: "A test project",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = projectSchema.safeParse({
      name: "",
      key: "TEST",
    });
    expect(result.success).toBe(false);
  });

  it("transforms key to uppercase", () => {
    const result = projectSchema.safeParse({
      name: "Test",
      key: "test",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.key).toBe("TEST");
    }
  });
});

describe("taskSchema", () => {
  it("validates correct input", () => {
    const result = taskSchema.safeParse({
      title: "Implement feature",
      status: "todo",
      priority: "high",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = taskSchema.safeParse({
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = taskSchema.safeParse({
      title: "Test",
      status: "invalid_status",
    });
    expect(result.success).toBe(false);
  });

  it("validates story points range", () => {
    const valid = taskSchema.safeParse({ title: "Test", storyPoints: 8 });
    expect(valid.success).toBe(true);

    const invalid = taskSchema.safeParse({ title: "Test", storyPoints: 101 });
    expect(invalid.success).toBe(false);
  });
});

describe("issueSchema", () => {
  it("validates correct input", () => {
    const result = issueSchema.safeParse({
      title: "Bug report",
      severity: "critical",
      type: "bug",
    });
    expect(result.success).toBe(true);
  });

  it("applies defaults", () => {
    const result = issueSchema.safeParse({ title: "Test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("open");
      expect(result.data.severity).toBe("medium");
      expect(result.data.type).toBe("bug");
    }
  });
});

describe("sprintSchema", () => {
  it("validates correct input", () => {
    const result = sprintSchema.safeParse({
      name: "Sprint 1",
      goal: "Complete foundation",
    });
    expect(result.success).toBe(true);
  });
});

describe("commentSchema", () => {
  it("validates correct input", () => {
    const result = commentSchema.safeParse({
      content: "This is a comment",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty comment", () => {
    const result = commentSchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
  });
});

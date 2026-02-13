// Seed script — populates the database with demo users, projects, tasks, issues,
// pipelines, and notifications so the app has realistic data out of the box.
// Run with `npx prisma db seed`.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ─── Users ───
  // All passwords are intentionally simple — this is demo data only
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@sdlchub.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@sdlchub.com",
      password: adminPassword,
      role: "admin",
    },
  });

  // Additional demo users with different roles to showcase permissions
  const devPassword = await bcrypt.hash("dev12345", 10);
  const dev = await prisma.user.upsert({
    where: { email: "dev@sdlchub.com" },
    update: {},
    create: {
      name: "Jane Developer",
      email: "dev@sdlchub.com",
      password: devPassword,
      role: "developer",
    },
  });

  const pm = await prisma.user.upsert({
    where: { email: "pm@sdlchub.com" },
    update: {},
    create: {
      name: "Bob Manager",
      email: "pm@sdlchub.com",
      password: await bcrypt.hash("pm123456", 10),
      role: "project_manager",
    },
  });

  const tester = await prisma.user.upsert({
    where: { email: "tester@sdlchub.com" },
    update: {},
    create: {
      name: "Alice Tester",
      email: "tester@sdlchub.com",
      password: await bcrypt.hash("test1234", 10),
      role: "tester",
    },
  });

  // ─── Team ───
  const team = await prisma.team.upsert({
    where: { id: "team-alpha" },
    update: {},
    create: {
      id: "team-alpha",
      name: "Team Alpha",
      description: "Core development team",
    },
  });

  // Assign all demo users to the team
  for (const user of [admin, dev, pm, tester]) {
    await prisma.teamMember.upsert({
      where: { userId_teamId: { userId: user.id, teamId: team.id } },
      update: {},
      create: {
        userId: user.id,
        teamId: team.id,
        role: user.role,
      },
    });
  }

  // ─── Projects ───
  const project1 = await prisma.project.upsert({
    where: { key: "SDLC" },
    update: {},
    create: {
      name: "SDLC Hub Platform",
      key: "SDLC",
      description: "The main SDLC Hub platform development project",
      status: "active",
      teamId: team.id,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-06-30"),
    },
  });

  const project2 = await prisma.project.upsert({
    where: { key: "MOBIL" },
    update: {},
    create: {
      name: "Mobile App",
      key: "MOBIL",
      description: "Cross-platform mobile application",
      status: "active",
      teamId: team.id,
      startDate: new Date("2025-02-01"),
    },
  });

  const project3 = await prisma.project.upsert({
    where: { key: "INFRA" },
    update: {},
    create: {
      name: "Infrastructure",
      key: "INFRA",
      description: "Cloud infrastructure and DevOps",
      status: "active",
      teamId: team.id,
    },
  });

  // ─── Labels ───
  const labels = await Promise.all([
    prisma.label.upsert({
      where: { name_projectId: { name: "frontend", projectId: project1.id } },
      update: {},
      create: { name: "frontend", color: "#3b82f6", projectId: project1.id },
    }),
    prisma.label.upsert({
      where: { name_projectId: { name: "backend", projectId: project1.id } },
      update: {},
      create: { name: "backend", color: "#10b981", projectId: project1.id },
    }),
    prisma.label.upsert({
      where: { name_projectId: { name: "urgent", projectId: project1.id } },
      update: {},
      create: { name: "urgent", color: "#ef4444", projectId: project1.id },
    }),
    prisma.label.upsert({
      where: { name_projectId: { name: "design", projectId: project1.id } },
      update: {},
      create: { name: "design", color: "#8b5cf6", projectId: project1.id },
    }),
  ]);

  // ─── Sprints ───
  const sprint1 = await prisma.sprint.upsert({
    where: { id: "sprint-1" },
    update: {},
    create: {
      id: "sprint-1",
      name: "Sprint 1 - Foundation",
      goal: "Set up project structure and core features",
      status: "completed",
      startDate: new Date("2025-01-06"),
      endDate: new Date("2025-01-17"),
      projectId: project1.id,
    },
  });

  const sprint2 = await prisma.sprint.upsert({
    where: { id: "sprint-2" },
    update: {},
    create: {
      id: "sprint-2",
      name: "Sprint 2 - Core Features",
      goal: "Implement project management and issue tracking",
      status: "active",
      startDate: new Date("2025-01-20"),
      endDate: new Date("2025-01-31"),
      projectId: project1.id,
    },
  });

  const sprint3 = await prisma.sprint.upsert({
    where: { id: "sprint-3" },
    update: {},
    create: {
      id: "sprint-3",
      name: "Sprint 3 - Integrations",
      goal: "Git integration and CI/CD pipeline management",
      status: "planning",
      startDate: new Date("2025-02-03"),
      endDate: new Date("2025-02-14"),
      projectId: project1.id,
    },
  });

  // ─── Milestones ───
  await prisma.milestone.upsert({
    where: { id: "milestone-mvp" },
    update: {},
    create: {
      id: "milestone-mvp",
      name: "MVP Release",
      description: "Minimum viable product with core features",
      dueDate: new Date("2025-03-01"),
      status: "open",
      projectId: project1.id,
    },
  });

  // ─── Tasks ───
  // Spread across sprints with varying statuses to fill the kanban board
  const tasks = [
    { title: "Set up project structure", status: "done", priority: "high", type: "task", storyPoints: 3, sprintId: sprint1.id, assigneeId: dev.id, position: 0 },
    { title: "Design database schema", status: "done", priority: "high", type: "task", storyPoints: 5, sprintId: sprint1.id, assigneeId: dev.id, position: 1 },
    { title: "Implement authentication", status: "done", priority: "critical", type: "story", storyPoints: 8, sprintId: sprint1.id, assigneeId: dev.id, position: 2 },
    { title: "Create responsive layout", status: "done", priority: "high", type: "story", storyPoints: 5, sprintId: sprint1.id, assigneeId: dev.id, position: 3 },
    { title: "Build dashboard page", status: "in_review", priority: "medium", type: "story", storyPoints: 5, sprintId: sprint2.id, assigneeId: dev.id, position: 0 },
    { title: "Implement Kanban board", status: "in_progress", priority: "high", type: "story", storyPoints: 8, sprintId: sprint2.id, assigneeId: dev.id, position: 1 },
    { title: "Create issue tracking module", status: "in_progress", priority: "high", type: "story", storyPoints: 8, sprintId: sprint2.id, assigneeId: tester.id, position: 2 },
    { title: "Add sprint management", status: "todo", priority: "medium", type: "story", storyPoints: 5, sprintId: sprint2.id, assigneeId: pm.id, position: 3 },
    { title: "Implement CI/CD pipeline view", status: "todo", priority: "medium", type: "story", storyPoints: 8, sprintId: sprint3.id, assigneeId: dev.id, position: 0 },
    { title: "Git repo integration", status: "todo", priority: "high", type: "epic", storyPoints: 13, sprintId: sprint3.id, assigneeId: dev.id, position: 1 },
    { title: "Build reporting dashboard", status: "todo", priority: "medium", type: "story", storyPoints: 8, sprintId: null, assigneeId: null, position: 0 },
    { title: "Add notification system", status: "todo", priority: "low", type: "story", storyPoints: 5, sprintId: null, assigneeId: null, position: 1 },
    { title: "Implement team management", status: "todo", priority: "medium", type: "story", storyPoints: 5, sprintId: null, assigneeId: pm.id, position: 2 },
    { title: "Add dark mode support", status: "done", priority: "low", type: "task", storyPoints: 2, sprintId: sprint1.id, assigneeId: dev.id, position: 4 },
    { title: "Write API documentation", status: "todo", priority: "low", type: "task", storyPoints: 3, sprintId: null, assigneeId: null, position: 3 },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: {
        ...task,
        projectId: project1.id,
        creatorId: admin.id,
      },
    });
  }

  // ─── Issues ───
  const issues = [
    { title: "Login page not responsive on small screens", status: "open", severity: "medium", type: "bug", reproSteps: "1. Open login page\n2. Resize to 320px width\n3. Form overflows", assigneeId: dev.id },
    { title: "API rate limiting not implemented", status: "open", severity: "high", type: "improvement", assigneeId: dev.id },
    { title: "Add export to PDF for reports", status: "in_progress", severity: "low", type: "feature", assigneeId: dev.id },
    { title: "Database query optimization needed", status: "open", severity: "high", type: "improvement", description: "Several queries are doing N+1 fetches", assigneeId: dev.id },
    { title: "Password reset flow broken", status: "resolved", severity: "critical", type: "bug", reproSteps: "1. Click forgot password\n2. Enter email\n3. Nothing happens", assigneeId: dev.id },
  ];

  for (const issue of issues) {
    await prisma.issue.create({
      data: {
        ...issue,
        projectId: project1.id,
        creatorId: tester.id,
      },
    });
  }

  // ─── CI/CD Pipelines & Runs ───
  const pipeline1 = await prisma.pipeline.create({
    data: {
      name: "CI/CD Pipeline",
      status: "success",
      config: "stages:\n  - build\n  - test\n  - deploy\n\nbuild:\n  script: npm run build\n\ntest:\n  script: npm run test\n\ndeploy:\n  script: npm run deploy\n  only: main",
      projectId: project1.id,
      stages: {
        create: [
          { name: "Build", order: 1 },
          { name: "Test", order: 2 },
          { name: "Deploy", order: 3 },
        ],
      },
    },
  });

  await prisma.pipelineRun.createMany({
    data: [
      { status: "success", branch: "main", commitSha: "a1b2c3d", pipelineId: pipeline1.id, startedAt: new Date("2025-01-15T10:00:00"), finishedAt: new Date("2025-01-15T10:05:00") },
      { status: "success", branch: "feat/dashboard", commitSha: "e4f5g6h", pipelineId: pipeline1.id, startedAt: new Date("2025-01-16T14:00:00"), finishedAt: new Date("2025-01-16T14:03:00") },
      { status: "failed", branch: "feat/issues", commitSha: "i7j8k9l", pipelineId: pipeline1.id, startedAt: new Date("2025-01-17T09:00:00"), finishedAt: new Date("2025-01-17T09:02:00"), logs: "Error: Test suite failed\n  - 3 tests failed in issues.test.ts" },
      { status: "success", branch: "main", commitSha: "m1n2o3p", pipelineId: pipeline1.id, startedAt: new Date("2025-01-18T11:00:00"), finishedAt: new Date("2025-01-18T11:04:00") },
    ],
  });

  // ─── Git Repositories ───
  await prisma.gitRepo.create({
    data: {
      name: "sdlc-hub",
      url: "https://github.com/team-alpha/sdlc-hub",
      provider: "github",
      projectId: project1.id,
    },
  });

  await prisma.gitRepo.create({
    data: {
      name: "mobile-app",
      url: "https://github.com/team-alpha/mobile-app",
      provider: "github",
      projectId: project2.id,
    },
  });

  // ─── Activity Feed ───
  const activities = [
    { type: "created", entity: "project", entityId: project1.id, details: "Created project SDLC Hub Platform", userId: admin.id, projectId: project1.id },
    { type: "created", entity: "sprint", entityId: sprint1.id, details: "Started Sprint 1 - Foundation", userId: pm.id, projectId: project1.id },
    { type: "updated", entity: "task", entityId: "task-1", details: "Moved 'Set up project structure' to Done", userId: dev.id, projectId: project1.id },
    { type: "commented", entity: "task", entityId: "task-2", details: "Commented on 'Design database schema'", userId: tester.id, projectId: project1.id },
    { type: "created", entity: "issue", entityId: "issue-1", details: "Reported 'Login page not responsive'", userId: tester.id, projectId: project1.id },
    { type: "updated", entity: "sprint", entityId: sprint2.id, details: "Sprint 2 - Core Features started", userId: pm.id, projectId: project1.id },
    { type: "created", entity: "pipeline", entityId: pipeline1.id, details: "Created CI/CD Pipeline", userId: dev.id, projectId: project1.id },
    { type: "updated", entity: "task", entityId: "task-5", details: "Moved 'Build dashboard page' to In Review", userId: dev.id, projectId: project1.id },
  ];

  for (const activity of activities) {
    await prisma.activity.create({ data: activity });
  }

  // ─── Notifications ───
  await prisma.notification.createMany({
    data: [
      { type: "task_assigned", title: "New task assigned", message: "You have been assigned 'Implement Kanban board'", userId: dev.id, link: "/projects" },
      { type: "comment_added", title: "New comment", message: "Alice Tester commented on 'Design database schema'", userId: dev.id, link: "/projects" },
      { type: "sprint_started", title: "Sprint started", message: "Sprint 2 - Core Features has been started", userId: dev.id, link: "/projects" },
      { type: "issue_created", title: "New issue reported", message: "Login page not responsive on small screens", userId: dev.id, link: "/issues" },
      { type: "pipeline_failed", title: "Pipeline failed", message: "CI/CD Pipeline run failed on feat/issues branch", userId: dev.id, link: "/pipelines", read: true },
    ],
  });

  console.log("Seed completed successfully!");
  console.log("Demo accounts:");
  console.log("  Admin: admin@sdlchub.com / admin123");
  console.log("  Developer: dev@sdlchub.com / dev12345");
  console.log("  PM: pm@sdlchub.com / pm123456");
  console.log("  Tester: tester@sdlchub.com / test1234");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

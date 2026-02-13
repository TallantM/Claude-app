import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validations";
import { parsePaginationParams, getPrismaPageArgs, buildPaginatedResponse } from "@/lib/pagination";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assigneeId = searchParams.get("assigneeId");
    const sprintId = searchParams.get("sprintId");

    const where: Prisma.TaskWhereInput = {};

    if (projectId) where.projectId = projectId.trim();
    if (status) where.status = status.trim();
    if (priority) where.priority = priority.trim();
    if (assigneeId) where.assigneeId = assigneeId.trim();
    if (sprintId) where.sprintId = sprintId.trim();

    const paginationParams = parsePaginationParams(searchParams);
    const [total, tasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        include: {
          assignee: {
            select: { id: true, name: true, email: true, image: true },
          },
          labels: {
            include: {
              label: {
                select: { id: true, name: true, color: true },
              },
            },
          },
        },
        orderBy: { position: "asc" },
        ...getPrismaPageArgs(paginationParams),
      }),
    ]);

    return NextResponse.json(buildPaginatedResponse(tasks, total, paginationParams));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId, milestoneId, ...rest } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    const validated = taskSchema.parse(rest);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const maxPosition = await prisma.task.aggregate({
      where: { projectId, status: validated.status },
      _max: { position: true },
    });

    const task = await prisma.task.create({
      data: {
        title: validated.title.trim(),
        description: validated.description?.trim(),
        status: validated.status,
        priority: validated.priority,
        type: validated.type,
        storyPoints: validated.storyPoints,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
        position: (maxPosition._max.position ?? -1) + 1,
        projectId,
        sprintId: validated.sprintId,
        milestoneId: milestoneId || undefined,
        assigneeId: validated.assigneeId,
        creatorId: session.user.id,
        parentId: validated.parentId,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, image: true },
        },
        labels: {
          include: {
            label: { select: { id: true, name: true, color: true } },
          },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

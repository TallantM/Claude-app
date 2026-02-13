import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sprintSchema } from "@/lib/validations";
import { parsePaginationParams, getPrismaPageArgs, buildPaginatedResponse } from "@/lib/pagination";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    const where = { projectId: projectId.trim() };
    const paginationParams = parsePaginationParams(searchParams);
    const [total, sprints] = await Promise.all([
      prisma.sprint.count({ where }),
      prisma.sprint.findMany({
        where,
        include: {
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { createdAt: "desc" },
        ...getPrismaPageArgs(paginationParams),
      }),
    ]);

    const result = sprints.map((sprint) => ({
      ...sprint,
      taskCount: sprint._count.tasks,
      _count: undefined,
    }));

    return NextResponse.json(buildPaginatedResponse(result, total, paginationParams));
  } catch (error) {
    console.error("Error fetching sprints:", error);
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
    const { projectId, ...rest } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    const validated = sprintSchema.parse(rest);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const sprint = await prisma.sprint.create({
      data: {
        name: validated.name.trim(),
        goal: validated.goal?.trim(),
        status: validated.status,
        startDate: validated.startDate ? new Date(validated.startDate) : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
        projectId,
      },
    });

    return NextResponse.json(sprint, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating sprint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

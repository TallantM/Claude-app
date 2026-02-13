import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { issueSchema } from "@/lib/validations";
import { parsePaginationParams, getPrismaPageArgs, buildPaginatedResponse } from "@/lib/pagination";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");

    const where: Prisma.IssueWhereInput = {};

    if (projectId) where.projectId = projectId.trim();
    if (status) where.status = status.trim();
    if (severity) where.severity = severity.trim();

    const paginationParams = parsePaginationParams(searchParams);
    const [total, issues] = await Promise.all([
      prisma.issue.count({ where }),
      prisma.issue.findMany({
        where,
        include: {
          assignee: {
            select: { id: true, name: true, email: true, image: true },
          },
          creator: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        ...getPrismaPageArgs(paginationParams),
      }),
    ]);

    return NextResponse.json(buildPaginatedResponse(issues, total, paginationParams));
  } catch (error) {
    console.error("Error fetching issues:", error);
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

    const validated = issueSchema.parse(rest);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const issue = await prisma.issue.create({
      data: {
        title: validated.title.trim(),
        description: validated.description?.trim(),
        status: validated.status,
        severity: validated.severity,
        type: validated.type,
        reproSteps: validated.reproSteps?.trim(),
        projectId,
        assigneeId: validated.assigneeId,
        creatorId: session.user.id,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, image: true },
        },
        creator: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating issue:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

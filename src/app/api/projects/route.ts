import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import { parsePaginationParams, getPrismaPageArgs, buildPaginatedResponse } from "@/lib/pagination";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Prisma.ProjectWhereInput = {};

    if (status) {
      where.status = status.trim();
    }

    if (search) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term } },
        { key: { contains: term } },
        { description: { contains: term } },
      ];
    }

    const paginationParams = parsePaginationParams(searchParams);
    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        include: {
          team: {
            select: { name: true },
          },
          _count: {
            select: {
              tasks: true,
              issues: {
                where: { status: { in: ["open", "in_progress"] } },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        ...getPrismaPageArgs(paginationParams),
      }),
    ]);

    const result = projects.map((project) => ({
      id: project.id,
      name: project.name,
      key: project.key,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      teamId: project.teamId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      taskCount: project._count.tasks,
      openIssues: project._count.issues,
      teamName: project.team?.name ?? null,
    }));

    return NextResponse.json(buildPaginatedResponse(result, total, paginationParams));
  } catch (error) {
    console.error("Error fetching projects:", error);
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
    const validated = projectSchema.parse(body);

    const existingProject = await prisma.project.findUnique({
      where: { key: validated.key },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "A project with this key already exists" },
        { status: 409 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name: validated.name.trim(),
        key: validated.key,
        description: validated.description?.trim(),
        status: validated.status,
        startDate: validated.startDate ? new Date(validated.startDate) : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
        teamId: validated.teamId,
      },
      include: {
        team: { select: { name: true } },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

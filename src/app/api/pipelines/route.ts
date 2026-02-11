import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pipelineSchema } from "@/lib/validations";
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

    const pipelines = await prisma.pipeline.findMany({
      where: { projectId: projectId.trim() },
      include: {
        _count: {
          select: { runs: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const result = pipelines.map((pipeline) => ({
      ...pipeline,
      runCount: pipeline._count.runs,
      _count: undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching pipelines:", error);
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

    const validated = pipelineSchema.parse(rest);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const pipeline = await prisma.pipeline.create({
      data: {
        name: validated.name.trim(),
        config: validated.config?.trim(),
        projectId,
        stages: validated.stages
          ? {
              create: validated.stages.map((stage) => ({
                name: stage.name.trim(),
                order: stage.order,
              })),
            }
          : undefined,
      },
      include: {
        stages: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(pipeline, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating pipeline:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

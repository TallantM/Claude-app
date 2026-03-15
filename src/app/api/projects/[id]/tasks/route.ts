import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validations";
import { z } from "zod";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { milestoneId, ...rest } = body;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const validated = taskSchema.parse({ ...rest, status: rest.status ?? "todo" });

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
        sprintId: validated.sprintId || null,
        milestoneId: milestoneId || undefined,
        assigneeId: validated.assigneeId || null,
        creatorId: session.user.id,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

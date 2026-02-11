import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
        creator: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
        project: {
          select: { id: true, name: true, key: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error) {
    console.error("Error fetching issue:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.issue.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = String(body.title).trim();
    if (body.description !== undefined) data.description = body.description ? String(body.description).trim() : null;
    if (body.status !== undefined) data.status = String(body.status).trim();
    if (body.severity !== undefined) data.severity = String(body.severity).trim();
    if (body.type !== undefined) data.type = String(body.type).trim();
    if (body.reproSteps !== undefined) data.reproSteps = body.reproSteps ? String(body.reproSteps).trim() : null;
    if (body.assigneeId !== undefined) data.assigneeId = body.assigneeId || null;

    const issue = await prisma.issue.update({
      where: { id },
      data,
      include: {
        assignee: { select: { id: true, name: true, email: true, image: true } },
        creator: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return NextResponse.json(issue);
  } catch (error) {
    console.error("Error updating issue:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.issue.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    await prisma.issue.delete({ where: { id } });
    return NextResponse.json({ message: "Issue deleted" });
  } catch (error) {
    console.error("Error deleting issue:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

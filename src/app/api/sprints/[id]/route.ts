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

    const sprint = await prisma.sprint.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true, image: true } },
          },
          orderBy: { position: "asc" },
        },
        project: { select: { id: true, name: true, key: true } },
      },
    });

    if (!sprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    }

    return NextResponse.json(sprint);
  } catch (error) {
    console.error("Error fetching sprint:", error);
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

    const existing = await prisma.sprint.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.goal !== undefined) data.goal = body.goal ? String(body.goal).trim() : null;
    if (body.status !== undefined) data.status = String(body.status).trim();
    if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;

    const sprint = await prisma.sprint.update({ where: { id }, data });
    return NextResponse.json(sprint);
  } catch (error) {
    console.error("Error updating sprint:", error);
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

    const existing = await prisma.sprint.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    }

    await prisma.sprint.delete({ where: { id } });
    return NextResponse.json({ message: "Sprint deleted" });
  } catch (error) {
    console.error("Error deleting sprint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

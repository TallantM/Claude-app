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

    const pipeline = await prisma.pipeline.findUnique({
      where: { id },
      include: {
        stages: { orderBy: { order: "asc" } },
        runs: { orderBy: { createdAt: "desc" }, take: 10 },
        project: { select: { id: true, name: true, key: true } },
      },
    });

    if (!pipeline) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }

    return NextResponse.json(pipeline);
  } catch (error) {
    console.error("Error fetching pipeline:", error);
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

    const existing = await prisma.pipeline.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.status !== undefined) data.status = String(body.status).trim();
    if (body.config !== undefined) data.config = body.config ? String(body.config).trim() : null;

    const pipeline = await prisma.pipeline.update({
      where: { id },
      data,
      include: { stages: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json(pipeline);
  } catch (error) {
    console.error("Error updating pipeline:", error);
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

    const existing = await prisma.pipeline.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }

    await prisma.pipeline.delete({ where: { id } });
    return NextResponse.json({ message: "Pipeline deleted" });
  } catch (error) {
    console.error("Error deleting pipeline:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

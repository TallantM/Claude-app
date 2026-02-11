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

    const pipeline = await prisma.pipeline.findUnique({ where: { id } });
    if (!pipeline) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }

    const runs = await prisma.pipelineRun.findMany({
      where: { pipelineId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(runs);
  } catch (error) {
    console.error("Error fetching pipeline runs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const pipeline = await prisma.pipeline.findUnique({ where: { id } });
    if (!pipeline) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const branch = body.branch ? String(body.branch).trim() : undefined;
    const commitSha = body.commitSha ? String(body.commitSha).trim() : undefined;

    const [run] = await prisma.$transaction([
      prisma.pipelineRun.create({
        data: {
          status: "running",
          branch,
          commitSha,
          startedAt: new Date(),
          pipelineId: id,
        },
      }),
      prisma.pipeline.update({
        where: { id },
        data: { status: "running" },
      }),
    ]);

    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    console.error("Error triggering pipeline run:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

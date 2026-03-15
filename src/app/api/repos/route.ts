import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const repoSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  url: z.string().url("Must be a valid URL"),
  provider: z.enum(["github", "gitlab", "bitbucket"]).default("github"),
  projectId: z.string().optional(),
  defaultBranch: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const repos = await prisma.gitRepo.findMany({
      include: {
        project: {
          select: { id: true, name: true, key: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: repos, total: repos.length });
  } catch (error) {
    console.error("Error fetching repos:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = repoSchema.parse(body);

    // projectId is required by the DB schema — use provided value or find/create a default project
    let projectId = validated.projectId;
    if (!projectId) {
      // Find any existing project to associate with
      const firstProject = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } });
      if (!firstProject) {
        return NextResponse.json(
          { error: "No projects exist. Create a project first before connecting a repository." },
          { status: 400 }
        );
      }
      projectId = firstProject.id;
    }

    const repo = await prisma.gitRepo.create({
      data: {
        name: validated.name,
        url: validated.url,
        provider: validated.provider,
        projectId,
      },
      include: {
        project: {
          select: { id: true, name: true, key: true },
        },
      },
    });

    return NextResponse.json(repo, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Error creating repo:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

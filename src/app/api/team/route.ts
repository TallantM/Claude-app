import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parsePaginationParams, getPrismaPageArgs, buildPaginatedResponse } from "@/lib/pagination";
import { z } from "zod";

const teamCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  description: z.string().max(500).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paginationParams = parsePaginationParams(searchParams);

    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          teamMembers: {
            include: {
              team: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { name: "asc" },
        ...getPrismaPageArgs(paginationParams),
      }),
    ]);

    return NextResponse.json(buildPaginatedResponse(users, total, paginationParams));
  } catch (error) {
    console.error("Error fetching team members:", error);
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
    const validated = teamCreateSchema.parse(body);

    const team = await prisma.team.create({
      data: {
        name: validated.name.trim(),
        description: validated.description?.trim(),
        members: {
          create: {
            userId: session.user.id,
            role: "admin",
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

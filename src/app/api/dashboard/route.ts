import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      totalProjects,
      totalTasks,
      completedTasks,
      openIssues,
      activeSprints,
      teamMembers,
      recentActivity,
      taskStatusDistribution,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: "done" } }),
      prisma.issue.count({
        where: { status: { in: ["open", "in_progress"] } },
      }),
      prisma.sprint.count({ where: { status: "active" } }),
      prisma.user.count(),
      prisma.activity.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      }),
      prisma.task.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const stats = {
      totalProjects,
      totalTasks,
      completedTasks,
      openIssues,
      activeSprints,
      teamMembers,
    };

    const taskDistribution = taskStatusDistribution.map((item) => ({
      label: item.status,
      value: item._count.status,
    }));

    return NextResponse.json({
      stats,
      recentActivity,
      taskDistribution,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

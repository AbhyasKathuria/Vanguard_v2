import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const isAuthority =
      user &&
      (user.role === "authority" ||
        user.role === "higher_authority" ||
        user.role === "admin" ||
        user.role === "super_admin");

    if (!isAuthority) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [total, open, assigned, inProgress, resolved, workersCount, volunteersCount] = await Promise.all([
      prisma.request.count(),
      prisma.request.count({ where: { status: "open" } }),
      prisma.request.count({ where: { status: "assigned" } }),
      prisma.request.count({ where: { status: "in_progress" } }),
      prisma.request.count({ where: { status: "resolved" } }),
      prisma.workerProfile.count({ where: { verified: true } }),
      prisma.volunteerProfile.count({ where: { verified: true } }),
    ]);

    return NextResponse.json({
      stats: {
        total,
        open,
        assigned,
        inProgress,
        resolved,
        verifiedWorkers: workersCount,
        verifiedVolunteers: volunteersCount,
      },
    });
  } catch (error: any) {
    console.error("Fetch authority stats error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch stats" }, { status: 500 });
  }
}

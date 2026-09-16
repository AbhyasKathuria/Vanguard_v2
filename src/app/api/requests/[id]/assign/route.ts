import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "authority") {
      return NextResponse.json({ error: "Forbidden: Only Local Authorities can assign requests." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { assigneeId, note } = body;

    if (!assigneeId) {
      return NextResponse.json({ error: "Assignee ID is required." }, { status: 400 });
    }

    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId },
      include: { workerProfile: true, volunteerProfile: true },
    });

    if (!assignee) {
      return NextResponse.json({ error: "Selected assignee not found." }, { status: 404 });
    }

    const assigneeRoleDesc =
      assignee.role === "worker"
        ? `Worker (${assignee.workerProfile?.profession || "General"})`
        : assignee.role === "volunteer"
        ? `Volunteer (${assignee.volunteerProfile?.organization || "Community"})`
        : assignee.role;

    const auditMessage = note
      ? `Manually assigned to ${assignee.name} [${assigneeRoleDesc}] by Local Authority ${user.name}. Note: "${note}"`
      : `Manually assigned to ${assignee.name} [${assigneeRoleDesc}] by Local Authority ${user.name}.`;

    const updated = await prisma.request.update({
      where: { id },
      data: {
        status: "assigned",
        assignedToId: assignee.id,
        updates: {
          create: {
            userId: user.id,
            status: "assigned",
            message: auditMessage,
          },
        },
      },
      include: {
        assignedTo: true,
        updates: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error: any) {
    console.error("Manual assign error:", error);
    return NextResponse.json({ error: error.message || "Failed to assign request" }, { status: 500 });
  }
}

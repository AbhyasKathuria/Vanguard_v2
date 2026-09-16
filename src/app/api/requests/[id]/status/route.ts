import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@/lib/types";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawParams = await params;
    const rawId = rawParams.id;
    const cleanId = decodeURIComponent(rawId || "").trim();

    if (!cleanId) {
      return NextResponse.json({ error: "Invalid ID parameter." }, { status: 400 });
    }

    const body = await request.json();
    const { status, message, action } = body;

    // ------------------------------------------------------------------------
    // CASE A: Look up in `prisma.request`
    // ------------------------------------------------------------------------
    let existingRequest = await prisma.request.findUnique({
      where: { id: cleanId },
      include: { assignedTo: true },
    });

    if (existingRequest) {
      // 1. Volunteer Claiming an Open Request
      if (action === "claim" && user.role === "volunteer") {
        if (existingRequest.status !== "open" && existingRequest.assignedToId && existingRequest.assignedToId !== user.id) {
          return NextResponse.json({ error: "This request is no longer open for claiming." }, { status: 400 });
        }

        const updated = await prisma.request.update({
          where: { id: cleanId },
          data: {
            status: "assigned",
            assignedToId: user.id,
            updates: {
              create: {
                userId: user.id,
                status: "assigned",
                message: message || `Claimed by volunteer ${user.name} (${user.volunteerProfile?.organization || "Community Volunteer"}).`,
              },
            },
          },
          include: { updates: true, assignedTo: true },
        });

        return NextResponse.json({ success: true, request: updated });
      }

      // 2. Standard Status Transitions
      const validStatuses: RequestStatus[] = ["open", "assigned", "in_progress", "resolved"];
      if (!status || !validStatuses.includes(status as RequestStatus)) {
        return NextResponse.json({ error: "Invalid status provided." }, { status: 400 });
      }

      const isAuthority =
        user.role === "authority" ||
        user.role === "higher_authority" ||
        user.role === "admin" ||
        user.role === "super_admin";
      const isAssigned = existingRequest.assignedToId === user.id;
      const isVolunteerOrWorker = user.role === "volunteer" || user.role === "worker";

      // If unassigned, allow volunteer/worker starting work to claim assignment automatically
      let newAssignedToId = existingRequest.assignedToId;
      if (!newAssignedToId && isVolunteerOrWorker) {
        newAssignedToId = user.id;
      } else if (!isAssigned && !isAuthority && !isVolunteerOrWorker) {
        return NextResponse.json(
          { error: "Forbidden: You are not authorized to update this request." },
          { status: 403 }
        );
      }

      const defaultMsg =
        status === "in_progress"
          ? `Status changed to IN PROGRESS by ${user.name} (${user.role}).`
          : status === "resolved"
          ? `Status marked as RESOLVED by ${user.name} (${user.role}).`
          : `Status updated to ${status.toUpperCase()} by ${user.name}.`;

      const updated = await prisma.request.update({
        where: { id: cleanId },
        data: {
          status,
          ...(newAssignedToId && { assignedToId: newAssignedToId }),
          updates: {
            create: {
              userId: user.id,
              status,
              message: message || defaultMsg,
            },
          },
        },
        include: {
          updates: {
            orderBy: { timestamp: "asc" },
          },
          assignedTo: true,
        },
      });

      return NextResponse.json({ success: true, request: updated });
    }

    // ------------------------------------------------------------------------
    // CASE B: Look up in `prisma.complaint` (e.g. from smart-complaint vision)
    // ------------------------------------------------------------------------
    const existingComplaint = await prisma.complaint.findUnique({
      where: { id: cleanId },
      include: { taskAssignments: true },
    });

    if (existingComplaint) {
      const updatedComplaint = await prisma.complaint.update({
        where: { id: cleanId },
        data: { status: status || "in_progress" },
      });

      // Update or create linked task assignment
      await prisma.taskAssignment.upsert({
        where: {
          id: existingComplaint.taskAssignments?.[0]?.id || `task_${cleanId}`,
        },
        update: {
          status: (status as any) || "in_progress",
          notes: message || `Updated to ${status} by ${user.name}`,
          ...(user.role === "volunteer" && { volunteerId: user.id }),
          ...(status === "resolved" && { completedAt: new Date() }),
          ...(status === "in_progress" && { acceptedAt: new Date() }),
        },
        create: {
          id: `task_${cleanId}`,
          complaintId: cleanId,
          volunteerId: user.role === "volunteer" ? user.id : null,
          status: (status as any) || "in_progress",
          priority: existingComplaint.urgency?.toLowerCase() === "critical" ? "critical" : "high",
          notes: message || `Claimed and updated to ${status} by ${user.name}`,
          acceptedAt: new Date(),
          ...(status === "resolved" && { completedAt: new Date() }),
        },
      });

      return NextResponse.json({
        success: true,
        complaint: updatedComplaint,
        message: `Complaint ${cleanId} transitioned to ${status}.`,
      });
    }

    // ------------------------------------------------------------------------
    // CASE C: Look up in `prisma.taskAssignment`
    // ------------------------------------------------------------------------
    const existingTask = await prisma.taskAssignment.findUnique({
      where: { id: cleanId },
      include: { complaint: true },
    });

    if (existingTask) {
      const updatedTask = await prisma.taskAssignment.update({
        where: { id: cleanId },
        data: {
          status: (status as any) || "in_progress",
          notes: message || existingTask.notes,
          ...(status === "resolved" && { completedAt: new Date() }),
        },
      });

      if (existingTask.complaintId) {
        await prisma.complaint.update({
          where: { id: existingTask.complaintId },
          data: { status: status || "in_progress" },
        });
      }

      return NextResponse.json({
        success: true,
        task: updatedTask,
        message: `Task ${cleanId} transitioned to ${status}.`,
      });
    }

    return NextResponse.json(
      { error: "Request or Complaint not found in system records." },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update status" },
      { status: 500 }
    );
  }
}

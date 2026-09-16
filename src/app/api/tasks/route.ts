import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const UpdateTaskSchema = z.object({
  taskId: z.string().optional(),
  complaintId: z.string().min(1, "complaintId is required"),
  status: z.enum(["pending", "assigned", "in_progress", "resolved"]),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  notes: z.string().optional(),
  volunteerId: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const volunteerId = searchParams.get("volunteerId");
    const status = searchParams.get("status");
    const complaintId = searchParams.get("complaintId");

    const where: any = {};
    if (volunteerId) where.volunteerId = volunteerId;
    if (status && status !== "all") where.status = status;
    if (complaintId) where.complaintId = complaintId;

    const tasks = await prisma.taskAssignment.findMany({
      where,
      include: {
        complaint: true,
        volunteer: {
          select: {
            id: true,
            name: true,
            phone: true,
            location: true,
            district: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error: any) {
    console.error("[API tasks GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch task assignments." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const rawBody = await request.json();

    const parseResult = UpdateTaskSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid task update payload", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { taskId, complaintId, status, priority, notes, volunteerId } = parseResult.data;
    const resolvedVolunteerId = volunteerId || user?.id || null;

    const now = new Date();
    const acceptedAt = status === "assigned" || status === "in_progress" ? now : undefined;
    const completedAt = status === "resolved" ? now : undefined;

    // Atomically upsert task assignment and synchronize the parent complaint status
    const task = taskId
      ? await prisma.taskAssignment.update({
          where: { id: taskId },
          data: {
            status,
            priority,
            notes: notes || undefined,
            volunteerId: resolvedVolunteerId,
            ...(acceptedAt && { acceptedAt }),
            ...(completedAt && { completedAt }),
          },
          include: {
            volunteer: true,
            complaint: true,
          },
        })
      : await prisma.taskAssignment.create({
          data: {
            complaintId,
            volunteerId: resolvedVolunteerId,
            status,
            priority,
            notes,
            ...(acceptedAt && { acceptedAt }),
            ...(completedAt && { completedAt }),
          },
          include: {
            volunteer: true,
            complaint: true,
          },
        });

    // Update parent Complaint status to match the task lifecycle
    try {
      await prisma.complaint.update({
        where: { id: complaintId },
        data: { status },
      });
    } catch (cmpErr) {
      console.warn("[API tasks] Could not update parent complaint status:", cmpErr);
    }

    return NextResponse.json({
      success: true,
      task,
      complaintStatus: status,
      message: `Task status transitioned to '${status}'.`,
    });
  } catch (error: any) {
    console.error("[API tasks POST] Error:", error);
    return NextResponse.json({ error: "Failed to update task assignment." }, { status: 500 });
  }
}

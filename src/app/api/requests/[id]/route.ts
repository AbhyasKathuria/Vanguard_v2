import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawParams = await params;
    const cleanId = decodeURIComponent(rawParams.id || "").trim();

    if (!cleanId) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
    }

    // 1. Try finding in `prisma.request`
    const requestItem = await prisma.request.findUnique({
      where: { id: cleanId },
      include: {
        user: {
          select: { id: true, name: true, phone: true, location: true, role: true },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            workerProfile: true,
            volunteerProfile: true,
          },
        },
        updates: {
          include: {
            user: {
              select: { id: true, name: true, role: true },
            },
          },
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (requestItem) {
      // Role-based visibility check
      const isCitizenOwner = user.role === "citizen" && requestItem.userId === user.id;
      const isPrivilegedRole =
        user.role === "authority" ||
        user.role === "higher_authority" ||
        user.role === "admin" ||
        user.role === "super_admin" ||
        user.role === "volunteer" ||
        user.role === "worker";

      if (!isCitizenOwner && !isPrivilegedRole) {
        return NextResponse.json(
          { error: "Forbidden: You are not authorized to view this request" },
          { status: 403 }
        );
      }

      return NextResponse.json({ request: requestItem });
    }

    // 2. Fallback: Try finding in `prisma.complaint`
    const complaint = await prisma.complaint.findUnique({
      where: { id: cleanId },
      include: {
        user: {
          select: { id: true, name: true, phone: true, location: true, role: true },
        },
        taskAssignments: {
          include: {
            volunteer: {
              select: { id: true, name: true, phone: true, location: true, role: true },
            },
          },
        },
      },
    });

    if (complaint) {
      const activeTask = complaint.taskAssignments?.[0];
      const assignedVolunteer = activeTask?.volunteer;

      const synthesizedRequest = {
        id: complaint.id,
        category: complaint.category || "civic",
        description: `[Grievance Ticket #${complaint.id.slice(-6).toUpperCase()}] ${complaint.title}: ${complaint.description}`,
        priority:
          complaint.urgency?.toLowerCase() === "critical"
            ? "high"
            : complaint.urgency?.toLowerCase() === "high"
            ? "high"
            : "medium",
        location: complaint.location || "Local District Area",
        district: complaint.district || "Rampur",
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        attachmentUrl: complaint.mediaUrl,
        status: complaint.status === "submitted" ? "open" : complaint.status,
        createdAt: complaint.createdAt,
        user: complaint.user || {
          id: complaint.userId || "usr_citizen",
          name: "Citizen Reporter",
          phone: "On File",
          role: "citizen",
        },
        assignedTo: assignedVolunteer
          ? {
              id: assignedVolunteer.id,
              name: assignedVolunteer.name,
              phone: assignedVolunteer.phone,
              role: "volunteer",
              volunteerProfile: { organization: "Community Volunteer" },
            }
          : null,
        updates: [
          {
            id: `event_init_${complaint.id}`,
            status: "open",
            message: `Grievance registered in VANGUARD Dispatch System. Target Authority: ${complaint.recommendedAuthority}. Risk Index: ${complaint.riskScore}/100.`,
            timestamp: complaint.createdAt,
            user: complaint.user || { name: "Citizen Reporter", role: "citizen" },
          },
          ...(complaint.taskAssignments || []).map((t: any, idx: number) => ({
            id: t.id || `task_${idx}`,
            status: t.status,
            message:
              t.notes ||
              `Task assigned to ${t.volunteer?.name || "Community Volunteer"} (${t.priority} priority).`,
            timestamp: t.acceptedAt || t.completedAt || t.createdAt,
            user: t.volunteer
              ? { id: t.volunteer.id, name: t.volunteer.name, role: "volunteer" }
              : undefined,
          })),
        ],
      };

      return NextResponse.json({ request: synthesizedRequest });
    }

    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  } catch (error: any) {
    console.error("Get request by ID error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch request" },
      { status: 500 }
    );
  }
}

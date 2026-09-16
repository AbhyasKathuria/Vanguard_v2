import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check recent complaints with urgency = 'Critical' AND emergency/safety category
    const criticalComplaints = await prisma.complaint.findMany({
      where: {
        status: { in: ["draft", "submitted", "in_investigation"] },
        urgency: "Critical",
        category: { in: ["Emergency", "emergency", "Medical"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        taskAssignments: true,
      },
    });

    // Check recent requests with category = 'emergency' (open or assigned)
    const criticalRequests = await prisma.request.findMany({
      where: {
        category: "emergency",
        OR: [
          { status: "open" },
          user.role === "authority" || user.role === "super_admin"
            ? { status: "assigned" }
            : { status: "assigned", assignedToId: user.id },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
    });

    // Synthesize alert items
    const alerts = [
      ...criticalComplaints.map((c) => ({
        id: c.id,
        type: "complaint",
        title: c.title,
        category: c.category,
        urgency: c.urgency,
        description: c.description,
        location: c.location,
        district: c.district,
        latitude: c.latitude,
        longitude: c.longitude,
        citizenName: c.user?.name || "Citizen Reporter",
        citizenPhone: c.user?.phone || "On File",
        riskScore: c.riskScore,
        createdAt: c.createdAt,
      })),
      ...criticalRequests.map((r) => ({
        id: r.id,
        type: "request",
        title: `${r.category.toUpperCase()} SOS: ${r.description.slice(0, 40)}...`,
        category: r.category,
        urgency: r.priority === "high" ? "Critical" : "High",
        description: r.description,
        location: r.location,
        district: r.district,
        latitude: r.latitude,
        longitude: r.longitude,
        citizenName: r.user?.name || "Citizen Reporter",
        citizenPhone: r.user?.phone || "On File",
        riskScore: r.priority === "high" ? 90 : 70,
        createdAt: r.createdAt,
      })),
    ];

    return NextResponse.json({ success: true, alerts });
  } catch (error: any) {
    console.error("Active SOS lookup error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch active SOS alerts" }, { status: 500 });
  }
}

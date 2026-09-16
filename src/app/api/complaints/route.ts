import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { determineRoutingAndAssignment } from "@/lib/routing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");
    const category = searchParams.get("category");

    const where: any = {};
    if (district && district !== "all") where.district = district;
    if (category && category !== "all") where.category = category;

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, complaints });
  } catch (error: any) {
    console.error("[API complaints GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch complaints." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const {
      title,
      category = "Infrastructure",
      urgency = "Moderate",
      urgencyReasoning,
      description,
      detectedTags = [],
      recommendedAuthority,
      riskScore = 50,
      location = "Rampur District Hub",
      district = "Rampur",
      latitude,
      longitude,
      mediaUrl,
      createLinkedRequest = true,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required." },
        { status: 400 }
      );
    }

    const tagsString = Array.isArray(detectedTags)
      ? JSON.stringify(detectedTags)
      : typeof detectedTags === "string"
      ? detectedTags
      : JSON.stringify(["#civic-hazard"]);

    const complaint = await prisma.complaint.create({
      data: {
        userId: user?.id || null,
        title,
        category,
        urgency,
        urgencyReasoning: urgencyReasoning || null,
        description,
        detectedTags: tagsString,
        recommendedAuthority: recommendedAuthority || "Municipal Corporation",
        riskScore: Number(riskScore) || 50,
        location,
        district,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        mediaUrl: mediaUrl || null,
        status: "submitted",
      },
    });

    // Optionally create a linked Request in the deterministic routing queue
    let linkedRequest = null;
    if (createLinkedRequest) {
      try {
        const citizenUserId = user?.id || "usr_citizen_1";
        const routingCategory =
          category === "Medical"
            ? "health"
            : category === "Public Safety"
            ? "emergency"
            : "civic";

        const routingResult = await determineRoutingAndAssignment(
          routingCategory,
          location,
          description,
          latitude && longitude ? { latitude: Number(latitude), longitude: Number(longitude) } : null
        );

        linkedRequest = await prisma.request.create({
          data: {
            userId: citizenUserId,
            category: routingCategory,
            description: `[AI Vision Complaint: ${title}] ${description}`,
            priority: urgency === "Critical" || urgency === "High" ? "high" : "medium",
            location,
            district,
            latitude: latitude ? Number(latitude) : null,
            longitude: longitude ? Number(longitude) : null,
            attachmentUrl: mediaUrl || null,
            status: routingResult.status,
            assignedToId: routingResult.assignedToId,
            updates: {
              create: {
                userId: citizenUserId,
                message: `Automated AI Vision Complaint filed (Ticket #${complaint.id.slice(-6).toUpperCase()}). ${routingResult.auditMessage}`,
                status: routingResult.status,
              },
            },
          },
        });
      } catch (reqErr) {
        console.warn("[API complaints POST] Linked request creation skipped:", reqErr);
      }
    }

    return NextResponse.json({
      success: true,
      complaint,
      linkedRequest,
    });
  } catch (error: any) {
    console.error("[API complaints POST] Error:", error);
    return NextResponse.json({ error: "Failed to create complaint." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { determineRoutingAndAssignment } from "@/lib/routing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const assetId = searchParams.get("assetId");
    const ward = searchParams.get("ward");

    const where: any = {};

    // 1. SafeLine Isolation: strict privacy gate
    const canSeeSafeLine =
      user &&
      (user.role === "super_admin" ||
        user.role === "higher_authority" ||
        user.subRole === "safeline_officer");

    if (!canSeeSafeLine) {
      where.isSafeLine = false;
    }

    // 2. Filters
    if (district && district !== "all") where.district = district;
    if (category && category !== "all") where.category = category;
    if (subcategory && subcategory !== "all") where.subcategory = subcategory;
    if (assetId && assetId !== "all") where.assetId = assetId;

    // 3. Ward scope filtering for Ward Members
    if (user?.subRole === "ward_member" && user?.wardScope) {
      where.location = { contains: user.wardScope };
    } else if (ward && ward !== "all") {
      where.location = { contains: ward };
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        timeline: { orderBy: { timestamp: "desc" } },
        evidence: true,
        asset: true,
        resolutions: true,
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    });

    // 4. Accountability without PII:
    // If public or Ward Member, strip user personal identifying info
    const sanitized = complaints.map((c) => {
      const isOwner = user?.id && user.id === c.userId;
      const isSuperAdmin = user?.role === "super_admin" || user?.role === "higher_authority";

      if (isOwner || isSuperAdmin) {
        return c;
      }

      // Sanitize: strip citizen PII, preserve complaint metrics & audit trail
      return {
        ...c,
        userId: undefined, // remove PII
        metaData: c.isSafeLine ? null : c.metaData,
      };
    });

    return NextResponse.json({ success: true, complaints: sanitized });
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
      subcategory,
      assignedDepartment,
      assetId,
      isSafeLine = false,
      metaData,
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
        subcategory: subcategory || null,
        assignedDepartment: assignedDepartment || null,
        assetId: assetId || null,
        isSafeLine: Boolean(isSafeLine),
        metaData: metaData ? (typeof metaData === "string" ? metaData : JSON.stringify(metaData)) : null,
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
        timeline: {
          create: {
            action: "SUBMITTED",
            performedBy: user?.name || "Citizen (Self-service)",
            role: user?.role || "citizen",
            remarks: `Grievance logged under ${category}${subcategory ? " / " + subcategory : ""}. SLA countdown initialized.`,
          },
        },
      },
      include: {
        timeline: true,
        asset: true,
      },
    });

    // Optionally create a linked Request in the deterministic routing queue
    let linkedRequest = null;
    if (createLinkedRequest && !isSafeLine) {
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

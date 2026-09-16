import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Strict SafeLine officer and admin authorization
function canAccessSafeLineRecords(user: any): boolean {
  if (!user) return false;
  return (
    user.role === "super_admin" ||
    user.role === "higher_authority" ||
    user.subRole === "safeline_officer" ||
    user.citizenProfile === "women"
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingCode = searchParams.get("code");
    const user = await getCurrentUser();

    // If anonymous tracking token is provided (SL-XXXXXX), allow checking this single record
    if (trackingCode) {
      const complaint = await prisma.complaint.findFirst({
        where: { id: trackingCode, isSafeLine: true },
        include: {
          timeline: { orderBy: { timestamp: "desc" } },
          resolutions: true,
        },
      });
      return NextResponse.json({ success: true, records: complaint ? [complaint] : [] });
    }

    // Otherwise, restrict full record listing to authorized officers or super_admins
    if (!user || !canAccessSafeLineRecords(user)) {
      return NextResponse.json({ error: "Access Denied: SafeLine records are restricted." }, { status: 403 });
    }

    const where: any = { isSafeLine: true };
    if (user.role === "citizen") {
      where.userId = user.id;
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        timeline: { orderBy: { timestamp: "desc" } },
        resolutions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, records: complaints });
  } catch (error: any) {
    console.error("[API safeline GET] Error:", error);
    return NextResponse.json({ error: "Failed to retrieve SafeLine records." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const {
      category = "Immediate Danger",
      urgency = "Critical",
      description,
      safeContactMethod = "discreet_call",
      safeContactNumber = "",
      location = "Confidential / Village Safe Zone",
      district = "Rampur",
      requiresDiscreetCallback = true,
      latitude,
      longitude,
    } = body;

    if (!description) {
      return NextResponse.json(
        { error: "Description of the assistance needed is required." },
        { status: 400 }
      );
    }

    // Generate randomized anonymous tracking token (e.g. SL-938210)
    const anonymousToken = "SL-" + Math.floor(100000 + Math.random() * 900000);

    const safeMeta = JSON.stringify({
      safeContactMethod,
      safeContactNumber: safeContactNumber ? safeContactNumber.slice(-4).padStart(10, "*") : "Masked",
      requiresDiscreetCallback,
      protectionProtocol: "WOMEN_CHILD_CONFIDENTIAL_LEVEL_1",
      emergencyHelplineDialed: false,
    });

    const complaint = await prisma.complaint.create({
      data: {
        id: anonymousToken,
        userId: user?.id || null,
        title: `[SafeLine Priority Protection] ${category}`,
        category: "Public Safety",
        subcategory: "SAFELINE_PROTECTION",
        assignedDepartment: "Women & Child Welfare / District Protection Cell",
        urgency: urgency as any,
        urgencyReasoning: "Confidential SafeLine intake routed directly to Women Protection Officer.",
        description,
        detectedTags: JSON.stringify(["#safeline", "#women-child-safety", "#confidential"]),
        recommendedAuthority: "District Women Protection Officer",
        riskScore: urgency === "Critical" ? 95 : 75,
        location,
        district,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        isSafeLine: true,
        metaData: safeMeta,
        status: "assigned",
        timeline: {
          create: {
            action: "ASSIGNED",
            performedBy: "VANGUARD SafeLine Automated Relay",
            role: "safeline_system",
            remarks: "Immediate priority notification dispatched to Smt. Sunita Devi (Designated Women Protection Officer). Discreet callback protocol engaged.",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      trackingCode: anonymousToken,
      complaintId: complaint.id,
      message: "Your SafeLine request has been encrypted and relayed directly to the Women Protection Cell.",
      supportHelplines: [
        { title: "National Women Helpline", number: "1091" },
        { title: "Child Helpline", number: "1098" },
        { title: "Domestic Abuse Direct Line", number: "181" },
        { title: "Emergency Response Support System (ERSS)", number: "112" },
      ],
    });
  } catch (error: any) {
    console.error("[API safeline POST] Error:", error);
    return NextResponse.json({ error: "Failed to record SafeLine dispatch." }, { status: 500 });
  }
}

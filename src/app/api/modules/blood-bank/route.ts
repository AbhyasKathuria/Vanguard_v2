import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendBloodDonorPush } from "@/lib/integrations/notifications";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bloodGroup = searchParams.get("group");
    const district = searchParams.get("district");
    const urgency = searchParams.get("urgency");

    const where: any = {};
    if (bloodGroup && bloodGroup !== "all") where.bloodGroup = bloodGroup;
    if (district && district !== "all") where.district = district;
    if (urgency && urgency !== "all") where.urgency = urgency;

    const requests = await prisma.bloodRequest.findMany({
      where,
      orderBy: [
        { urgency: "asc" },
        { createdAt: "desc" },
      ],
    });

    const enriched = requests.map((r) => ({
      ...r,
      units: r.unitsNeeded,
      hospitalName: r.hospital,
    }));

    const emergencyCount = enriched.filter((r) => r.urgency.includes("Emergency") && r.status === "open").length;
    const fulfilledCount = enriched.filter((r) => r.status === "fulfilled").length;
    const totalUnitsNeeded = enriched
      .filter((r) => r.status === "open")
      .reduce((sum, r) => sum + r.units, 0);

    return NextResponse.json({
      success: true,
      requests: enriched,
      metrics: {
        emergencyCount,
        fulfilledCount,
        totalUnitsNeeded,
        totalOpenRequests: enriched.filter((r) => r.status === "open").length,
      },
    });
  } catch (error: any) {
    console.error("[API blood-bank GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch blood bank requests." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const {
      patientName,
      bloodGroup,
      units = 1,
      hospitalName = "District Civil Hospital, Rampur",
      location = "District Government Hospital",
      district = "Rampur",
      contactPhone,
      urgency = "Emergency / Immediate",
    } = body;

    if (!patientName || !bloodGroup || !contactPhone) {
      return NextResponse.json(
        { error: "Patient name, blood group, and contact number are required." },
        { status: 400 }
      );
    }

    const bloodReq = await prisma.bloodRequest.create({
      data: {
        patientName,
        bloodGroup,
        unitsNeeded: Number(units) || 1,
        hospital: hospitalName,
        location,
        district,
        contactPhone,
        urgency,
        status: "open",
      },
    });

    const matchingVolunteers = await prisma.user.findMany({
      where: {
        role: "volunteer",
        district,
        volunteerProfile: {
          verified: true,
          availability: true,
        },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        phone: true,
        location: true,
      },
    });

    // Real-time W3C Web Push broadcast to verified volunteer donor devices
    sendBloodDonorPush({
      district,
      bloodGroup,
      units: Number(units) || 1,
      hospital: hospitalName,
      actionUrl: "/higher-official/dashboard",
    }).catch((err) => console.warn("Blood donor push error:", err));

    return NextResponse.json({
      success: true,
      request: { ...bloodReq, units: bloodReq.unitsNeeded, hospitalName: bloodReq.hospital },
      matchedDonors: matchingVolunteers,
      broadcastNotification: `Dispatched urgent ${bloodGroup} alert to ${matchingVolunteers.length} verified volunteers in ${district}.`,
    });
  } catch (error: any) {
    console.error("[API blood-bank POST] Error:", error);
    return NextResponse.json({ error: "Failed to create blood request." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Request ID and new status are required." }, { status: 400 });
    }

    const updated = await prisma.bloodRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, request: { ...updated, units: updated.unitsNeeded, hospitalName: updated.hospital } });
  } catch (error: any) {
    console.error("[API blood-bank PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update blood request." }, { status: 500 });
  }
}

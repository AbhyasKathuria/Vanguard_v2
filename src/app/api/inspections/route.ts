import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityType = searchParams.get("facilityType");

    const whereClause: any = {};
    if (facilityType && facilityType !== "all") {
      whereClause.facilityType = facilityType;
    }

    const inspections = await prisma.inspection.findMany({
      where: whereClause,
      include: {
        complaint: true,
      },
      orderBy: { completedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: inspections.length,
      inspections,
    });
  } catch (error: any) {
    console.error("Inspections fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch inspection records." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      facilityType,
      facilityName,
      location,
      checklistData,
      evidencePhotos,
      watermarkLat,
      watermarkLng,
      inspectorId,
      notes,
      complaintId,
    } = body;

    if (!facilityType || !checklistData) {
      return NextResponse.json(
        { error: "facilityType and checklistData are required." },
        { status: 400 }
      );
    }

    const inspection = await prisma.inspection.create({
      data: {
        facilityType,
        facilityName: facilityName || "Rural Civic Facility",
        location: location || "Gram Panchayat",
        checklistData: typeof checklistData === "string" ? checklistData : JSON.stringify(checklistData),
        evidencePhotos: evidencePhotos ? (typeof evidencePhotos === "string" ? evidencePhotos : JSON.stringify(evidencePhotos)) : null,
        watermarkLat: watermarkLat ? parseFloat(watermarkLat) : null,
        watermarkLng: watermarkLng ? parseFloat(watermarkLng) : null,
        inspectorId: inspectorId || "field_officer_verified",
        notes: notes || null,
        complaintId: complaintId || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Inspection audit successfully registered with GPS watermark.",
      inspection,
    });
  } catch (error: any) {
    console.error("Inspection save error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record inspection audit." },
      { status: 500 }
    );
  }
}

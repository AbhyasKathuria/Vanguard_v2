import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateVulnerabilityIndex,
  aggregateThreatsByDistrict,
} from "@/lib/ai/threatEngine";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const where: any = {};
    if (district && district !== "all") where.district = district;
    if (category && category !== "all") where.category = category;
    if (status && status !== "all") where.status = status;

    const rawThreats = await prisma.vulnerability.findMany({
      where,
      orderBy: { threatScore: "desc" },
    });

    // Compute live dynamic decay scores
    const now = new Date();
    const vulnerabilities = rawThreats.map((t) => {
      const createdDate = new Date(t.createdAt);
      const daysElapsed = Math.max(
        0,
        Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      const computedRiskIndex = calculateVulnerabilityIndex(
        t.threatScore,
        t.populationDensity,
        daysElapsed + 2, // sample decay offset
        t.decayFactor
      );

      return {
        ...t,
        computedRiskIndex,
      };
    });

    // Sort by computed dynamic risk index descending
    vulnerabilities.sort((a, b) => (b.computedRiskIndex || 0) - (a.computedRiskIndex || 0));

    const districtSummaries = aggregateThreatsByDistrict(vulnerabilities as any);

    return NextResponse.json({
      success: true,
      vulnerabilities,
      districtSummaries,
    });
  } catch (error: any) {
    console.error("[API threats GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch threat matrix data." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      category = "Structural",
      severity = "High",
      threatScore = 75,
      populationDensity = "Market Hub",
      affectedEstimate = 1000,
      timeToDecayDays = 30,
      decayFactor = 1.25,
      location = "District Bypass",
      district = "Rampur",
      latitude,
      longitude,
      mitigationPlan,
      reportedBy = "AI Threat Assessment Engine",
    } = body;

    if (!title || !latitude || !longitude) {
      return NextResponse.json(
        { error: "Title, latitude, and longitude are required." },
        { status: 400 }
      );
    }

    const threat = await prisma.vulnerability.create({
      data: {
        title,
        category,
        severity,
        threatScore: Number(threatScore),
        populationDensity,
        affectedEstimate: Number(affectedEstimate),
        timeToDecayDays: Number(timeToDecayDays),
        decayFactor: Number(decayFactor),
        location,
        district,
        latitude: Number(latitude),
        longitude: Number(longitude),
        mitigationPlan: mitigationPlan || null,
        reportedBy,
        status: "active",
      },
    });

    return NextResponse.json({ success: true, threat });
  } catch (error: any) {
    console.error("[API threats POST] Error:", error);
    return NextResponse.json({ error: "Failed to log vulnerability." }, { status: 500 });
  }
}

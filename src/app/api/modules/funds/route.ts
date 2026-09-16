import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");
    const department = searchParams.get("department");

    const where: any = {};
    if (district && district !== "all") where.district = district;
    if (department && department !== "all") where.department = department;

    const funds = await prisma.projectFund.findMany({
      where,
      orderBy: { allocatedAmount: "desc" },
    });

    const enriched = funds.map((f) => ({
      ...f,
      projectCode: f.id,
      projectName: f.title,
      completionPercent: f.progressPercent,
      isDiscrepancyFlagged: f.discrepancyReports > 0,
      discrepancyNote: f.discrepancyReports > 0 ? "Flagged by civic inspection audit." : null,
    }));

    const totalAllocated = enriched.reduce((acc, f) => acc + f.allocatedAmount, 0);
    const totalSpent = enriched.reduce((acc, f) => acc + f.spentAmount, 0);
    const flaggedCount = enriched.filter((f) => f.isDiscrepancyFlagged).length;

    return NextResponse.json({
      success: true,
      funds: enriched,
      summary: {
        totalAllocated,
        totalSpent,
        utilizationRate: totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0,
        flaggedCount,
        totalProjects: enriched.length,
      },
    });
  } catch (error: any) {
    console.error("[API funds GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch development fund data." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      flagDiscrepancy,
      completionPercent,
      spentAmount,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    const updateData: any = {};
    if (flagDiscrepancy) {
      updateData.discrepancyReports = { increment: 1 };
    }
    if (completionPercent !== undefined) updateData.progressPercent = Number(completionPercent);
    if (spentAmount !== undefined) updateData.spentAmount = Number(spentAmount);

    const updated = await prisma.projectFund.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      project: {
        ...updated,
        projectCode: updated.id,
        projectName: updated.title,
        completionPercent: updated.progressPercent,
        isDiscrepancyFlagged: updated.discrepancyReports > 0,
      },
    });
  } catch (error: any) {
    console.error("[API funds POST] Error:", error);
    return NextResponse.json({ error: "Failed to update project fund record." }, { status: 500 });
  }
}

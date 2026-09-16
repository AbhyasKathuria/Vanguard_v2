import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const triggerUpdate = searchParams.get("run") === "true";

    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    // Find open complaints
    const openComplaints = await prisma.complaint.findMany({
      where: {
        status: { not: "resolved" },
      },
      orderBy: { createdAt: "asc" },
    });

    const escalations: Array<{
      id: string;
      title: string;
      village?: string | null;
      district: string;
      category: string;
      priority?: string | null;
      daysPending: number;
      currentLevel: number;
      targetLevel: number;
      designatedAuthority: string;
      slaBreached: boolean;
    }> = [];

    const toUpdateDay2: string[] = [];
    const toUpdateDay5: string[] = [];

    for (const c of openComplaints) {
      const createdTime = new Date(c.createdAt).getTime();
      const diffDays = Math.floor((now.getTime() - createdTime) / (24 * 60 * 60 * 1000));

      let targetLevel = 0;
      let designatedAuthority = "Gram Panchayat Officer / Local Lineman";

      if (diffDays >= 5) {
        targetLevel = 2;
        designatedAuthority = "District Magistrate (DM) / Collector / Chief Engineer";
        if (c.escalationLevel < 2) toUpdateDay5.push(c.id);
      } else if (diffDays >= 2) {
        targetLevel = 1;
        designatedAuthority = "Block Development Officer (BDO) / Assistant Engineer";
        if (c.escalationLevel < 1) toUpdateDay2.push(c.id);
      }

      escalations.push({
        id: c.id,
        title: c.title,
        village: c.village,
        district: c.district,
        category: c.category,
        priority: c.priority,
        daysPending: diffDays,
        currentLevel: c.escalationLevel,
        targetLevel,
        designatedAuthority,
        slaBreached: diffDays >= 2,
      });
    }

    // If run=true, apply updates to database
    if (triggerUpdate) {
      if (toUpdateDay2.length > 0) {
        await prisma.complaint.updateMany({
          where: { id: { in: toUpdateDay2 } },
          data: { escalationLevel: 1 },
        });
      }
      if (toUpdateDay5.length > 0) {
        await prisma.complaint.updateMany({
          where: { id: { in: toUpdateDay5 } },
          data: { escalationLevel: 2 },
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalActiveCases: openComplaints.length,
      level0Count: escalations.filter((e) => e.targetLevel === 0).length,
      level1Count: escalations.filter((e) => e.targetLevel === 1).length,
      level2Count: escalations.filter((e) => e.targetLevel === 2).length,
      escalatedCases: escalations,
      updatedDay2Count: toUpdateDay2.length,
      updatedDay5Count: toUpdateDay5.length,
    });
  } catch (error: any) {
    console.error("SLA escalation route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute SLA escalation check." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { complaintId, newLevel, reason } = body;

    if (!complaintId || newLevel === undefined) {
      return NextResponse.json(
        { error: "complaintId and newLevel (0, 1, or 2) are required." },
        { status: 400 }
      );
    }

    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: { escalationLevel: parseInt(newLevel) },
    });

    return NextResponse.json({
      success: true,
      message: `Escalated incident ${complaintId} to Level ${newLevel}`,
      complaint: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Escalation update failed" }, { status: 500 });
  }
}

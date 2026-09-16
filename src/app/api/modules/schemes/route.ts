import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const department = searchParams.get("department");
    const query = searchParams.get("q");

    const where: any = {};
    if (category && category !== "all") where.category = category;
    if (department && department !== "all") where.department = department;
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { eligibility: { contains: query } },
      ];
    }

    const schemes = await prisma.scheme.findMany({
      where,
      orderBy: { name: "asc" },
    });

    const enriched = schemes.map((s) => ({
      ...s,
      benefits: s.description || s.eligibility,
      applicationUrl: s.officialUrl,
    }));

    return NextResponse.json({ success: true, schemes: enriched });
  } catch (error: any) {
    console.error("[API schemes GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch government schemes." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      age,
      annualIncome,
      landHoldingAcres,
      gender,
      occupation = "",
    } = body;

    const allSchemes = await prisma.scheme.findMany();

    const evaluated = allSchemes.map((s) => {
      let isEligible = true;
      const reasons: string[] = [];

      if (s.incomeLimit && annualIncome !== undefined && annualIncome !== null) {
        if (Number(annualIncome) > s.incomeLimit) {
          isEligible = false;
          reasons.push(`Income ₹${annualIncome} exceeds threshold ₹${s.incomeLimit}`);
        }
      }

      if (s.minAge && age !== undefined && age !== null) {
        if (Number(age) < s.minAge) {
          isEligible = false;
          reasons.push(`Age ${age} is below minimum age ${s.minAge}`);
        }
      }

      if (s.maxAge && age !== undefined && age !== null) {
        if (Number(age) > s.maxAge) {
          isEligible = false;
          reasons.push(`Age ${age} exceeds maximum age ${s.maxAge}`);
        }
      }

      if (s.gender && gender && s.gender !== "all") {
        if (s.gender.toLowerCase() !== gender.toLowerCase()) {
          isEligible = false;
          reasons.push(`Designated for ${s.gender} applicants`);
        }
      }

      return {
        scheme: {
          ...s,
          benefits: s.description || s.eligibility,
          applicationUrl: s.officialUrl,
        },
        isEligible,
        reasons,
      };
    });

    const eligible = evaluated.filter((e) => e.isEligible);
    const potential = evaluated.filter((e) => !e.isEligible);

    return NextResponse.json({
      success: true,
      eligibleSchemes: eligible,
      potentialSchemes: potential,
      totalCount: allSchemes.length,
    });
  } catch (error: any) {
    console.error("[API schemes POST] Error:", error);
    return NextResponse.json({ error: "Failed to evaluate scheme eligibility." }, { status: 500 });
  }
}

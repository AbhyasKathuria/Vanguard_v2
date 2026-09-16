import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const query = searchParams.get("q");

    const where: any = {};
    if (district && district !== "all") where.district = district;
    if (category && category !== "all") where.type = category;
    if (condition && condition !== "all") where.condition = condition;
    if (query) {
      where.OR = [
        { id: { contains: query } },
        { name: { contains: query } },
        { location: { contains: query } },
      ];
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        complaints: {
          select: {
            id: true,
            title: true,
            status: true,
            urgency: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const enriched = assets.map((a) => ({
      ...a,
      category: a.type,
      complaintsCount: a.complaints.length,
      activeComplaints: a.complaints,
    }));

    return NextResponse.json({ success: true, assets: enriched });
  } catch (error: any) {
    console.error("[API assets GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch assets." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      category = "water_tank",
      department = "Rural Water Supply",
      location,
      district = "Rampur",
      latitude,
      longitude,
      condition = "Good",
    } = body;

    if (!name || !location) {
      return NextResponse.json({ error: "Asset name and location are required." }, { status: 400 });
    }

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const assetId = `ASSET-${randomNum}`;

    const asset = await prisma.asset.create({
      data: {
        id: assetId,
        name,
        type: category,
        department,
        location,
        district,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        condition,
        lastInspection: new Date(),
      },
    });

    return NextResponse.json({ success: true, asset: { ...asset, category: asset.type } });
  } catch (error: any) {
    console.error("[API assets POST] Error:", error);
    return NextResponse.json({ error: "Failed to register asset." }, { status: 500 });
  }
}

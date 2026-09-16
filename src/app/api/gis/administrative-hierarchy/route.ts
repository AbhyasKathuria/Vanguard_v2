import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Fallback seed divisions for known demo jurisdictions
const FALLBACK_DIVISIONS = [
  {
    state: "Uttar Pradesh",
    district: "Rampur",
    block: "Milak",
    panchayat: "Dhamora GP",
    village: "Dhamora",
    latitude: 28.8154,
    longitude: 79.025,
    department: "Rural Development & Panchayati Raj",
    officerInCharge: "Shri Rajesh Verma (BDO Milak)",
    officerPhone: "+91-94500-11223",
  },
  {
    state: "Uttar Pradesh",
    district: "Rampur",
    block: "Shahabad",
    panchayat: "Saifni GP",
    village: "Saifni",
    latitude: 28.5667,
    longitude: 79.0167,
    department: "Jal Sansthan & Drinking Water",
    officerInCharge: "Smt. Sunita Devi (Gram Pradhan)",
    officerPhone: "+91-94500-44556",
  },
  {
    state: "Uttar Pradesh",
    district: "Sitapur",
    block: "Maholi",
    panchayat: "Maholi Dehat GP",
    village: "Maholi",
    latitude: 27.5656,
    longitude: 80.6829,
    department: "Public Works Department (PWD)",
    officerInCharge: "Er. Amit Kumar (Assistant Engineer PWD)",
    officerPhone: "+91-94150-77889",
  },
  {
    state: "Karnataka",
    district: "Mandya",
    block: "Maddur",
    panchayat: "Besagarahalli GP",
    village: "Besagarahalli",
    latitude: 12.5234,
    longitude: 76.8973,
    department: "Cauvery Irrigation & Agriculture",
    officerInCharge: "K. R. Srinivas (Assistant Director Agriculture)",
    officerPhone: "+91-98450-33445",
  },
  {
    state: "Karnataka",
    district: "Shivamogga",
    block: "Bhadravati",
    panchayat: "Holehonnur GP",
    village: "Holehonnur",
    latitude: 13.9299,
    longitude: 75.5681,
    department: "Primary Health & Sanitation",
    officerInCharge: "Dr. Deepa Hegde (Taluk Health Officer)",
    officerPhone: "+91-98450-99001",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get("lat") || searchParams.get("latitude");
    const lngStr = searchParams.get("lng") || searchParams.get("longitude");

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { error: "Latitude and longitude query parameters are required (?lat=...&lng=...)" },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: "Invalid coordinates." }, { status: 400 });
    }

    // 1. Try resolving via Prisma AdministrativeDivision
    const dbDivisions = await prisma.administrativeDivision.findMany();

    if (dbDivisions && dbDivisions.length > 0) {
      let nearest = dbDivisions[0];
      let minDistance = Infinity;

      for (const d of dbDivisions) {
        if (d.latitude && d.longitude) {
          const dist = haversine(lat, lng, d.latitude, d.longitude);
          if (dist < minDistance) {
            minDistance = dist;
            nearest = d;
          }
        }
      }

      return NextResponse.json({
        success: true,
        resolvedHierarchy: {
          state: nearest.state,
          district: nearest.district,
          block: nearest.block,
          panchayat: nearest.panchayat,
          village: nearest.village,
          department: "Panchayati Raj & Rural Administration",
          officerInCharge: "Gram Panchayat Secretary",
          distanceKm: minDistance === Infinity ? 0 : minDistance,
          source: "database",
        },
      });
    }

    // 2. Use fallback seeded divisions
    let nearestFallback = FALLBACK_DIVISIONS[0];
    let minDistance = haversine(lat, lng, nearestFallback.latitude, nearestFallback.longitude);

    for (let i = 1; i < FALLBACK_DIVISIONS.length; i++) {
      const dist = haversine(lat, lng, FALLBACK_DIVISIONS[i].latitude, FALLBACK_DIVISIONS[i].longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearestFallback = FALLBACK_DIVISIONS[i];
      }
    }

    return NextResponse.json({
      success: true,
      resolvedHierarchy: {
        ...nearestFallback,
        distanceKm: minDistance,
        source: "geospatial_model",
      },
    });
  } catch (error: any) {
    console.error("Administrative hierarchy resolution error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resolve administrative hierarchy." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lat = parseFloat(body.lat || body.latitude);
    const lng = parseFloat(body.lng || body.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: "Valid latitude and longitude required." }, { status: 400 });
    }

    let nearest = FALLBACK_DIVISIONS[0];
    let minDistance = haversine(lat, lng, nearest.latitude, nearest.longitude);

    for (let i = 1; i < FALLBACK_DIVISIONS.length; i++) {
      const dist = haversine(lat, lng, FALLBACK_DIVISIONS[i].latitude, FALLBACK_DIVISIONS[i].longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = FALLBACK_DIVISIONS[i];
      }
    }

    return NextResponse.json({
      success: true,
      resolvedHierarchy: {
        ...nearest,
        distanceKm: minDistance,
        source: "geospatial_model",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Resolution failed" }, { status: 500 });
  }
}

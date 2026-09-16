import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { latitude, longitude, isOnline = true } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Latitude and longitude required" }, { status: 400 });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    // Update user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastKnownLat: lat,
        lastKnownLng: lng,
        isOnline: Boolean(isOnline),
        lastHeartbeat: new Date(),
      },
    });

    // Also sync worker/volunteer profile coordinates
    if (user.role === "worker") {
      await prisma.workerProfile.upsert({
        where: { userId: user.id },
        update: { latitude: lat, longitude: lng, availability: Boolean(isOnline) },
        create: {
          userId: user.id,
          profession: "Skilled Responder",
          location: user.location,
          latitude: lat,
          longitude: lng,
          availability: true,
          verified: true,
        },
      });
    } else if (user.role === "volunteer") {
      await prisma.volunteerProfile.upsert({
        where: { userId: user.id },
        update: { latitude: lat, longitude: lng, availability: Boolean(isOnline) },
        create: {
          userId: user.id,
          organization: "Community Volunteer",
          area: user.location,
          latitude: lat,
          longitude: lng,
          availability: true,
          verified: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Heartbeat & location recorded.",
      location: { latitude: lat, longitude: lng, isOnline },
    });
  } catch (error: any) {
    console.error("Emergency heartbeat error:", error);
    return NextResponse.json({ error: error.message || "Failed to update heartbeat" }, { status: 500 });
  }
}

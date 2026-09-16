import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Haversine formula to compute great-circle distance between two GPS coordinates in kilometers
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in kilometers
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      incidentId,
      latitude,
      longitude,
      maxRadiusKm = 10,
      type = "request",
    } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Incident GPS coordinates (latitude and longitude) are required for auto-dispatch." },
        { status: 400 }
      );
    }

    const incLat = parseFloat(latitude);
    const incLng = parseFloat(longitude);

    if (isNaN(incLat) || isNaN(incLng)) {
      return NextResponse.json({ error: "Invalid coordinate numbers." }, { status: 400 });
    }

    // 1. Find all active volunteers and workers with location data
    const candidates = await prisma.user.findMany({
      where: {
        role: { in: ["volunteer", "worker"] },
        active: true,
      },
      include: {
        volunteerProfile: true,
        workerProfile: true,
      },
    });

    // 2. Score candidates by Haversine proximity
    const scoredResponders = candidates
      .map((user) => {
        const lat =
          user.lastKnownLat ||
          user.volunteerProfile?.latitude ||
          user.workerProfile?.latitude ||
          // Fallback coordinate approximations for seeded demo regions
          (user.district?.toLowerCase().includes("sitapur")
            ? 27.5656
            : user.district?.toLowerCase().includes("mandya")
            ? 12.5234
            : user.district?.toLowerCase().includes("shivamogga")
            ? 13.9299
            : 28.8154);

        const lng =
          user.lastKnownLng ||
          user.volunteerProfile?.longitude ||
          user.workerProfile?.longitude ||
          (user.district?.toLowerCase().includes("sitapur")
            ? 80.6829
            : user.district?.toLowerCase().includes("mandya")
            ? 76.8973
            : user.district?.toLowerCase().includes("shivamogga")
            ? 75.5681
            : 79.025);

        const distanceKm = calculateHaversineDistance(incLat, incLng, lat, lng);

        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          location: user.location,
          district: user.district,
          distanceKm,
          latitude: lat,
          longitude: lng,
          isOnline: user.isOnline,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    // Filter within maximum dispatch radius (or closest available candidate)
    const withinRadius = scoredResponders.filter((r) => r.distanceKm <= maxRadiusKm);
    const bestResponder = withinRadius[0] || scoredResponders[0];

    if (!bestResponder) {
      return NextResponse.json({
        success: false,
        dispatched: false,
        message: "No active responder candidates registered in system.",
      });
    }

    // 3. Link assignment in database
    if (incidentId) {
      // Check if it's in prisma.request
      const existingReq = await prisma.request.findUnique({
        where: { id: incidentId },
      });

      if (existingReq) {
        await prisma.request.update({
          where: { id: incidentId },
          data: {
            assignedToId: bestResponder.id,
            status: "assigned",
            updates: {
              create: {
                userId: bestResponder.id,
                status: "assigned",
                message: `Geospatial proximity auto-dispatch: matched nearest responder ${bestResponder.name} (${bestResponder.role}, ${bestResponder.distanceKm} km away).`,
              },
            },
          },
        });
      }

      // Check if it's in prisma.complaint
      const existingComplaint = await prisma.complaint.findUnique({
        where: { id: incidentId },
        include: { taskAssignments: true },
      });

      if (existingComplaint) {
        await prisma.complaint.update({
          where: { id: incidentId },
          data: { status: "submitted" },
        });

        await prisma.taskAssignment.create({
          data: {
            complaintId: incidentId,
            volunteerId: bestResponder.id,
            status: "assigned",
            priority: "high",
            notes: `Auto-dispatched via Haversine proximity matrix (${bestResponder.distanceKm} km from incident site).`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      dispatched: true,
      responder: bestResponder,
      distanceKm: bestResponder.distanceKm,
      withinRadius: bestResponder.distanceKm <= maxRadiusKm,
      message: `Successfully auto-dispatched to ${bestResponder.name} (${bestResponder.distanceKm} km away).`,
    });
  } catch (error: any) {
    console.error("Auto-dispatch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute proximity auto-dispatch" },
      { status: 500 }
    );
  }
}

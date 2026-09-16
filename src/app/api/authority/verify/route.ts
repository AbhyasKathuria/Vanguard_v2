import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    const isAuthority =
      user &&
      (user.role === "authority" ||
        user.role === "higher_authority" ||
        user.role === "admin" ||
        user.role === "super_admin");

    if (!isAuthority) {
      return NextResponse.json({ error: "Unauthorized: Authority access required." }, { status: 401 });
    }

    const body = await request.json();
    const { userId, role, verified } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: "User ID and role are required." }, { status: 400 });
    }

    // Lookup the target user first to ensure user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found." }, { status: 404 });
    }

    const isVerified = Boolean(verified);

    if (role === "worker") {
      await prisma.workerProfile.upsert({
        where: { userId },
        update: { verified: isVerified },
        create: {
          userId,
          profession: "General Service",
          location: targetUser.location || "Rampur",
          district: targetUser.district || "Rampur",
          availability: true,
          verified: isVerified,
        },
      });
    } else if (role === "volunteer") {
      await prisma.volunteerProfile.upsert({
        where: { userId },
        update: { verified: isVerified },
        create: {
          userId,
          organization: "Community Volunteer",
          area: targetUser.location || "Local Community",
          district: targetUser.district || "Rampur",
          availability: true,
          verified: isVerified,
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid role for verification." }, { status: 400 });
    }

    return NextResponse.json({ success: true, verified: isVerified });
  } catch (error: any) {
    console.error("Verification toggle error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update verification status" },
      { status: 500 }
    );
  }
}

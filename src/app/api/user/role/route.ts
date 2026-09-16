import { NextResponse } from "next/server";
import { getCurrentUser, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/types";

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { role, citizenProfile } = body;

    const validRoles = ["citizen", "worker", "volunteer", "authority", "super_admin"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    const validProfiles = ["general", "farmer", "women"];
    const effectiveProfile = validProfiles.includes(citizenProfile) ? citizenProfile : "general";

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        role,
        citizenProfile: effectiveProfile,
      },
    });

    // If role is worker, ensure WorkerProfile exists
    if (role === "worker") {
      await prisma.workerProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          profession: "General Rural Technician",
          location: user.location || "Rampur",
          district: user.district || "Rampur",
          availability: true,
          verified: true,
        },
      });
    }

    // Refresh JWT session cookie with updated role claims
    await setAuthCookie({
      userId: updatedUser.id,
      name: updatedUser.name,
      phone: updatedUser.phone,
      role: updatedUser.role as UserRole,
      language: updatedUser.language,
      location: updatedUser.location,
      district: updatedUser.district,
      citizenProfile: updatedUser.citizenProfile,
      subRole: updatedUser.subRole,
      wardScope: updatedUser.wardScope,
    });

    // Determine target dashboard
    let target = "/citizen/dashboard";
    if (role === "citizen") {
      if (effectiveProfile === "farmer") target = "/farmer";
      else if (effectiveProfile === "women") target = "/citizen/women";
      else target = "/citizen/dashboard";
    } else if (role === "worker") {
      target = "/worker/dashboard";
    } else if (role === "volunteer") {
      target = "/volunteer/dashboard";
    } else if (role === "authority" || role === "higher_authority") {
      target = "/authority/dashboard";
    } else if (role === "super_admin") {
      target = "/superadmin/dashboard";
    }

    return NextResponse.json({ success: true, user: updatedUser, target });
  } catch (error: any) {
    console.error("Role update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update role" }, { status: 500 });
  }
}

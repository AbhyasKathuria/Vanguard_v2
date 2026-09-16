import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const isAuthority =
      user &&
      (user.role === "authority" ||
        user.role === "higher_authority" ||
        user.role === "admin" ||
        user.role === "super_admin");

    if (!isAuthority) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [workers, volunteers] = await Promise.all([
      prisma.user.findMany({
        where: { role: "worker" },
        include: { workerProfile: true },
        orderBy: { name: "asc" },
      }),
      prisma.user.findMany({
        where: { role: "volunteer" },
        include: { volunteerProfile: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const assignees = [
      ...workers.map((w) => ({
        id: w.id,
        name: w.name,
        phone: w.phone,
        role: "worker",
        details: w.workerProfile?.profession || "Worker",
        location: w.workerProfile?.location || w.location,
        availability: w.workerProfile?.availability ?? true,
        verified: w.workerProfile?.verified ?? false,
      })),
      ...volunteers.map((v) => ({
        id: v.id,
        name: v.name,
        phone: v.phone,
        role: "volunteer",
        details: v.volunteerProfile?.organization || "Volunteer",
        location: v.volunteerProfile?.area || v.location,
        availability: v.volunteerProfile?.availability ?? true,
        verified: v.volunteerProfile?.verified ?? false,
      })),
    ];

    return NextResponse.json({ assignees });
  } catch (error: any) {
    console.error("Fetch assignees error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch assignees" }, { status: 500 });
  }
}

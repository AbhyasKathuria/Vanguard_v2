import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

/**
 * GET: List all District Authorities (Super Admin only)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized: Super Admin access required" }, { status: 403 });
    }

    const authorities = await prisma.user.findMany({
      where: { role: "authority" },
      select: {
        id: true,
        name: true,
        phone: true,
        location: true,
        district: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ authorities });
  } catch (error: any) {
    console.error("Fetch authorities error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch authorities" }, { status: 500 });
  }
}

/**
 * POST: Create a new District Authority account (Super Admin only)
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized: Super Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { name, phone, district, location, password } = body;

    if (!name || !phone || !district) {
      return NextResponse.json({ error: "Name, phone, and district are required" }, { status: 400 });
    }

    const cleanPhone = phone.trim().replace(/\D/g, "");
    const existing = await prisma.user.findUnique({ where: { phone: cleanPhone } });
    if (existing) {
      return NextResponse.json({ error: "User with this phone number already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password || "authority123", 10);

    const newAuthority = await prisma.user.create({
      data: {
        name,
        phone: cleanPhone,
        passwordHash,
        role: "authority",
        district,
        location: location || `${district} District HQ`,
        active: true,
        language: "en",
      },
    });

    return NextResponse.json({ success: true, authority: newAuthority }, { status: 201 });
  } catch (error: any) {
    console.error("Create authority error:", error);
    return NextResponse.json({ error: error.message || "Failed to create authority" }, { status: 500 });
  }
}

/**
 * PATCH: Toggle active status or update district of an authority (Super Admin only)
 */
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized: Super Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { id, active, district } = body;

    if (!id) {
      return NextResponse.json({ error: "Authority ID is required" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(typeof active === "boolean" ? { active } : {}),
        ...(district ? { district } : {}),
      },
    });

    return NextResponse.json({ success: true, authority: updated });
  } catch (error: any) {
    console.error("Update authority error:", error);
    return NextResponse.json({ error: error.message || "Failed to update authority" }, { status: 500 });
  }
}

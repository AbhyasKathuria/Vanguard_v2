import { hashPassword, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, password, role, location, language = "en", profession, organization, area } = body;

    if (!name || !phone || !password || !role || !location) {
      return NextResponse.json(
        { error: "Name, phone, password, role, and location are required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, "").slice(-10);
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Please provide a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    const validRoles: UserRole[] = ["citizen", "worker", "authority", "volunteer"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role selected." }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: phone.trim() },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this phone number already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userId = `usr_${role}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    let user: any = null;
    try {
      user = await prisma.user.create({
        data: {
          id: userId,
          name: name.trim(),
          phone: cleanPhone,
          passwordHash,
          role,
          language,
          location: location.trim(),
          district: location.trim(),
          active: true,
          ...(role === "worker" && {
            workerProfile: {
              create: {
                profession: profession || "General Service",
                location: location.trim(),
                availability: true,
                verified: false,
              },
            },
          }),
          ...(role === "volunteer" && {
            volunteerProfile: {
              create: {
                organization: organization || "Community Volunteer",
                area: area || location.trim(),
                availability: true,
                verified: false,
              },
            },
          }),
        },
        include: {
          workerProfile: true,
          volunteerProfile: true,
        },
      });
    } catch (createErr) {
      console.warn("[Signup] DB user create fallback:", createErr);
      user = {
        id: userId,
        name: name.trim(),
        phone: cleanPhone,
        role,
        location: location.trim(),
        district: location.trim(),
      };
    }

    await setAuthCookie({
      userId: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role as UserRole,
      location: user.location,
      district: user.district || user.location,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        location: user.location,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message || "Failed to create account" }, { status: 500 });
  }
}

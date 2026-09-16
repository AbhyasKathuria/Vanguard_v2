import { setAuthCookie } from "@/lib/auth";
import { verifyCode } from "@/lib/integrations/otp";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawTarget = body.target || body.phone || body.email;
    const rawCode = body.code || body.otp;
    const type = body.type || (body.email ? "email" : "phone");
    const role = body.role || "citizen";
    const name = body.name;
    const location = body.location || "Rampur";
    const district = body.district || "Rampur";

    if (!rawTarget || !rawCode) {
      return NextResponse.json(
        { error: "Target (phone/email) and 6-digit verification code are required." },
        { status: 400 }
      );
    }

    const cleanTarget = type === "phone" ? String(rawTarget).trim().replace(/\D/g, "") : String(rawTarget).trim().toLowerCase();
    const cleanCode = String(rawCode).trim();

    // Verify code
    const isCodeValid = verifyCode(cleanTarget, cleanCode, type as "phone" | "email");
    if (!isCodeValid) {
      return NextResponse.json(
        { error: "Invalid or expired verification code. Use demo code 123456 or request a new code." },
        { status: 400 }
      );
    }

    // Look up existing user
    let user = await prisma.user.findFirst({
      where:
        type === "phone"
          ? {
              OR: [
                { phone: cleanTarget },
                { phone: { contains: cleanTarget.slice(-10) } },
              ],
            }
          : {
              OR: [
                { email: cleanTarget },
              ],
            },
      include: {
        workerProfile: true,
        volunteerProfile: true,
      },
    });

    // Create user if not existing
    if (!user) {
      const allowedRoles = ["citizen", "volunteer", "worker"];
      const finalRole = allowedRoles.includes(role) ? role : "citizen";
      const fallbackPhone = type === "phone" ? cleanTarget : `91${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const fallbackName = name?.trim() || (type === "email" ? cleanTarget.split("@")[0] : `Resident ${cleanTarget.slice(-4)}`);

      user = await prisma.user.create({
        data: {
          name: fallbackName,
          phone: fallbackPhone,
          email: type === "email" ? cleanTarget : undefined,
          role: finalRole,
          location: location || "Rampur Central",
          district: district || "Rampur",
          isOnline: true,
          lastHeartbeat: new Date(),
          active: true,
          language: "en",
          ...(finalRole === "worker" && {
            workerProfile: {
              create: {
                profession: "Skilled Trade Volunteer",
                location: location || "Rampur",
                district: district || "Rampur",
                availability: true,
                verified: true,
              },
            },
          }),
          ...(finalRole === "volunteer" && {
            volunteerProfile: {
              create: {
                organization: "Red Cross Rural Volunteer Network",
                area: location || "Rampur",
                district: district || "Rampur",
                availability: true,
                verified: true,
              },
            },
          }),
        },
        include: {
          workerProfile: true,
          volunteerProfile: true,
        },
      });
    } else {
      // Mark active and online
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isOnline: true,
          lastHeartbeat: new Date(),
          ...(type === "email" && !user.email && { email: cleanTarget }),
        },
      });
    }

    // Generate JWT cookie
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
      message: "Authentication successful.",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        location: user.location,
        district: user.district,
      },
    });
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed." },
      { status: 500 }
    );
  }
}

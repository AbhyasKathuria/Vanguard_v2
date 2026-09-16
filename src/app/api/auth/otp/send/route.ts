import { sendVerificationCode } from "@/lib/integrations/otp";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawTarget = body.target || body.phone || body.email;
    const type = body.type || (body.email ? "email" : "phone");

    if (!rawTarget || typeof rawTarget !== "string" || !rawTarget.trim()) {
      return NextResponse.json(
        { error: "Phone number or email address is required." },
        { status: 400 }
      );
    }

    const cleanTarget = rawTarget.trim();

    if (type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanTarget)) {
        return NextResponse.json(
          { error: "Please provide a valid email address." },
          { status: 400 }
        );
      }
    } else {
      const cleanPhone = cleanTarget.replace(/\D/g, "");
      if (cleanPhone.length < 8) {
        return NextResponse.json(
          { error: "Please provide a valid phone number (minimum 8 digits)." },
          { status: 400 }
        );
      }
    }

    const result = await sendVerificationCode(cleanTarget, type as "phone" | "email");

    return NextResponse.json({
      success: true,
      message: result.message,
      provider: result.provider,
      ...(result.debugOtp && { debugOtp: result.debugOtp }),
    });
  } catch (error: any) {
    console.error("OTP send error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to dispatch verification code." },
      { status: 500 }
    );
  }
}

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/languages";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { language } = body;

    const validCodes = SUPPORTED_LANGUAGES.map((l) => l.code);
    if (!language || !validCodes.includes(language)) {
      return NextResponse.json({ error: "Invalid language code" }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { language },
      });
    }

    const response = NextResponse.json({ success: true, language, persisted: !!user });
    response.cookies.set("vanguard_locale", language, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  } catch (error: any) {
    console.error("Language update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update language" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return PATCH(request);
}

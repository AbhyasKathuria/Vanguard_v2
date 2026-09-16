import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, note: "Guest locale stored on client" });
    }

    const body = await request.json();
    const { language } = body;

    if (!language || !["en", "hi", "kn"].includes(language)) {
      return NextResponse.json({ error: "Invalid language code" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { language },
    });

    return NextResponse.json({ success: true, language });
  } catch (error: any) {
    console.error("Language update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update language" }, { status: 500 });
  }
}

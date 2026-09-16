import { NextResponse } from "next/server";
import { translateText } from "@/lib/integrations/translator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, targetLang, sourceLang } = body;

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: "Text and targetLang are required." },
        { status: 400 }
      );
    }

    const result = await translateText({
      text,
      targetLang,
      sourceLang,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      { error: "Internal translation error" },
      { status: 500 }
    );
  }
}

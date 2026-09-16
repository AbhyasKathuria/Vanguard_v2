import { queryGroqChatbot } from "@/lib/groq";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let messages: any[] = [];

    try {
      const text = await request.text();
      if (text && text.trim()) {
        const body = JSON.parse(text);
        messages = body.messages || [];
      }
    } catch (e) {
      console.warn("Failed to parse request JSON in /api/chat:", e);
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({
        reply: "👋 Hi! I'm VanguardBot. Ask me anything about women's menstrual health, first aid, crops & soil, or village service routing! 🌸🌾",
      });
    }

    const reply = await queryGroqChatbot(messages);
    return NextResponse.json({ reply: reply || "I'm here to help! Please ask your question. 🌸🌾" });
  } catch (error: any) {
    console.error("Chatbot API error:", error);
    return NextResponse.json({
      reply: "I'm having a brief connection pause, but I'm here to help with your health and farming questions! Please ask again in a moment. 🌸🌾",
    });
  }
}

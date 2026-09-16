import { NextResponse } from "next/server";
import { queryGroqChatbot } from "@/lib/groq";
import { z } from "zod";

export const dynamic = "force-dynamic";

const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  locale: z.string().optional().default("en"),
});

const REGIONAL_SYSTEM_PROMPTS: Record<string, string> = {
  hi: "आप VANGUARD के क्षेत्रीय AI सहायक हैं। कृपया विनम्र, स्पष्ट और सहायक हिंदी भाषा में उत्तर दें। आपातकालीन सहायता, नागरिक शिकायत, प्राथमिक चिकित्सा और ग्राम सेवा में सहायता करें।",
  kn: "ನೀವು VANGUARD ನ ಪ್ರಾದೇಶಿಕ AI ಸಹಾಯಕರು. ದಯವಿಟ್ಟು ವಿನಮ್ರ, ಸ್ಪಷ್ಟ ಮತ್ತು ಸಹಾಯಕವಾದ ಕನ್ನಡ ಭಾಷೆಯಲ್ಲಿ ಉತ್ತರಿಸಿ. ತುರ್ತು ನೆರವು, ನಾಗರಿಕ ದೂರುಗಳು ಮತ್ತು ಪ್ರಥಮ ಚಿಕಿತ್ಸೆಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಿ.",
  ta: "நீங்கள் VANGUARD இன் பிராந்திய AI உதவியாளர். தயவுசெய்து தமிழில் தெளிவாகவும் உதவியாகவும் பதிலளிக்கவும். அவசர உதவி, முதலுதவி மற்றும் பொது குறைகளுக்கு உதவவும்.",
  te: "మీరు VANGUARD యొక్క ప్రాంతీయ AI సహాయకుడు. దయచేసి తెలుగులో స్పష్టంగా మరియు సహాయకారిగా సమాధానం ఇవ్వండి. అత్యవసర సహాయం మరియు ప్రథమ చికిత్స అందించండి.",
  bn: "আপনি VANGUARD-এর আঞ্চলিক AI সহকারী। অনুগ্রহ করে বাংলায় সুস্পষ্ট ও সহায়কভাবে উত্তর দিন। জরুরি সহায়তা এবং প্রাথমিক চিকিৎসায় দিকনির্দেশনা দিন।",
  mr: "तुम्ही VANGUARD चे प्रादेशिक AI सहाय्यक आहात. कृपया स्पष्ट आणि आदरपूर्वक मराठीत उत्तर द्या. आपत्कालीन मदत, प्रथमोपचार आणि नागरी तक्रारी निवारणात मार्गदर्शन करा.",
  en: "You are VANGUARD's Regional AI Emergency & Civic Copilot. Respond with clear, compassionate, and actionable guidance for rural and urban citizens, emergency first-response, and complaint routing.",
};

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parseResult = ChatRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid messages format", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { messages, locale } = parseResult.data;

    // Inject regional language system prompt
    const regionalPrompt = REGIONAL_SYSTEM_PROMPTS[locale] || REGIONAL_SYSTEM_PROMPTS.en;
    const enrichedMessages = [
      { role: "system", content: regionalPrompt },
      ...messages,
    ];

    const reply = await queryGroqChatbot(enrichedMessages);

    return NextResponse.json({
      success: true,
      reply: reply || "I am here to assist with civic actions and emergencies.",
      locale,
    });
  } catch (error: any) {
    console.error("[API ai/chat] Error:", error);
    return NextResponse.json(
      { error: "Regional AI Chat service connection error." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { determineRoutingAndAssignment, getCategoryDefaultPriority } from "@/lib/routing";
import { RequestCategory } from "@/lib/types";
import { sendWhatsAppMessage } from "@/lib/integrations/whatsapp";
import { detectLanguageFromGreeting } from "@/lib/integrations/translator";

// In-memory conversation state for WhatsApp multi-step request creation flow
interface SessionState {
  step: "language" | "category" | "description" | "location";
  language: string;
  category?: RequestCategory;
  description?: string;
  location?: string;
  lastUpdated: number;
}

const sessionStore = new Map<string, SessionState>();

// Multi-lingual bot messages
const BOT_MESSAGES: Record<string, any> = {
  en: {
    welcome:
      "🛡️ *Welcome to VANGUARD Rural Service Dispatch!*\n\n" +
      "Please reply with the number matching your problem category:\n" +
      "1️⃣ *Civic / Infra* (Electricity, broken wire, drainage, water)\n" +
      "2️⃣ *Health / Medical* (First aid, clinic visit, medication)\n" +
      "3️⃣ *Emergency* (Accident, trauma, fire hazard)\n" +
      "4️⃣ *Farming* (Irrigation channel, harvest labor, machinery)\n" +
      "5️⃣ *Other Public Need*\n\n" +
      "_(Tip: Text LANG to change language / भाषा बदलने के लिए LANG लिखें)_",
    categorySelected: "✅ Category selected: *{cat}*\n\n📝 Please describe the issue in plain text (e.g. *'Streetlight wire broke near primary school'*).",
    promptLocation: "📍 Got it. Now please reply with your *Village / Town / Ward name* (e.g. *Rampur*, *Mandya*, *Sitapur*):",
    receiptAssigned:
      "🎉 *Service Request Raised & Routed!*\n\n" +
      "• *Request ID:* {id}\n" +
      "• *Priority:* {priority}\n" +
      "• *Status:* {status}\n\n" +
      "👤 *Assigned Handler:* {name}\n" +
      "📞 *Contact:* {phone}\n" +
      "📍 *Coverage:* {location}\n\n" +
      "You can text *STATUS {id}* anytime to check updates! 🛡️✨",
    receiptQueued:
      "⏳ *Service Request Queued for Authority Triage*\n\n" +
      "• *Request ID:* {id}\n" +
      "• *Priority:* {priority}\n" +
      "• *Status:* OPEN\n\n" +
      "Your request has been forwarded to the local authority command center. You will receive an update once assigned.",
    workerResolved: "✅ Request *{id}* updated to *RESOLVED*.\nCitizen tracking timeline has been updated! 🛡️",
    workerProgress: "🛠️ Request *{id}* marked *IN PROGRESS*.\nCitizen has been notified! 🛡️",
  },
  hi: {
    welcome:
      "🛡️ *वानगार्ड (VANGUARD) ग्रामीण सेवा प्रेषण में आपका स्वागत है!*\n\n" +
      "कृपया अपनी समस्या के अनुसार संख्या लिखकर भेजें:\n" +
      "1️⃣ *नागरिक / बिजली / पानी* (टूटा तार, जलभराव, सड़क)\n" +
      "2️⃣ *स्वास्थ्य / चिकित्सा* (प्राथमिक उपचार, दवाइयाँ)\n" +
      "3️⃣ *आपातकालीन* (दुर्घटना, आग, एम्बुलेंस)\n" +
      "4️⃣ *खेती / कृषि* (नहर रिसाव, फसल मजदूर, मोटर)\n" +
      "5️⃣ *अन्य सार्वजनिक आवश्यकता*",
    categorySelected: "✅ श्रेणी चुनी गई: *{cat}*\n\n📝 कृपया समस्या का विवरण लिखें (जैसे: *'स्कूल के पास बिजली का तार टूट गया है'*).",
    promptLocation: "📍 समझ गया। अब कृपया अपने *गाँव / शहर / वार्ड का नाम* लिखें (जैसे: *Rampur*, *Mandya*, *Sitapur*):",
    receiptAssigned:
      "🎉 *सेवा अनुरोध दर्ज और आवंटित!*\n\n" +
      "• *अनुरोध संख्या (ID):* {id}\n" +
      "• *प्राथमिकता:* {priority}\n" +
      "• *स्थिति:* ASSIGNED\n\n" +
      "👤 *सहायक का नाम:* {name}\n" +
      "📞 *संपर्क:* {phone}\n" +
      "📍 *क्षेत्र:* {location}\n\n" +
      "आप स्थिति देखने के लिए कभी भी *STATUS {id}* लिख सकते हैं! 🛡️",
    receiptQueued:
      "⏳ *अनुरोध प्राधिकरण समीक्षा के लिए कतारबद्ध*\n\n" +
      "• *अनुरोध संख्या (ID):* {id}\n" +
      "• *प्राथमिकता:* {priority}\n" +
      "• *स्थिति:* OPEN\n\n" +
      "स्थानीय प्राधिकरण को आपका अनुरोध भेज दिया गया है।",
    workerResolved: "✅ अनुरोध *{id}* का कार्य *पूर्ण (RESOLVED)* कर दिया गया है। 🛡️",
    workerProgress: "🛠️ अनुरोध *{id}* का कार्य *प्रगति पर (IN PROGRESS)* है। 🛡️",
  },
  kn: {
    welcome:
      "🛡️ *ವ್ಯಾನ್‌ಗಾರ್ಡ್ (VANGUARD) ಗ್ರಾಮೀಣ ಸೇವೆಗೆ ಸುಸ್ವಾಗತ!*\n\n" +
      "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಮಸ್ಯೆಯ ಸಂಖ್ಯೆಯನ್ನು ಕಳುಹಿಸಿ:\n" +
      "1️⃣ *ನಾಗರಿಕ / ಮೂಲಸೌಕರ್ಯ* (ವಿದ್ಯುತ್, ನೀರು, ರಸ್ತೆ)\n" +
      "2️⃣ *ಆರೋಗ್ಯ ಮತ್ತು ವೈದ್ಯಕೀಯ* (ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ, ಔಷಧಿ)\n" +
      "3️⃣ *ತುರ್ತು ಸೇವೆ* (ಅಪಘಾತ, ಬೆಂಕಿ, ಆಂಬ್ಯುಲೆನ್ಸ್)\n" +
      "4️⃣ *ಕೃಷಿ ಮತ್ತು ಬೆಳೆ* (ಕಾಲುವೆ ಸೋರಿಕೆ, ಕೂಲಿ ಕಾರ್ಮಿಕರು)\n" +
      "5️⃣ *ಇತರ ಸಾರ್ವಜನಿಕ ನೆರವು*",
    categorySelected: "✅ ವರ್ಗ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ: *{cat}*\n\n📝 ದಯವಿಟ್ಟು ಸಮಸ್ಯೆಯನ್ನು ವಿವರವಾಗಿ ಬರೆಯಿರಿ.",
    promptLocation: "📍 ನಿಮ್ಮ *ಗ್ರಾಮ / ವಾರ್ಡ್ ಹೆಸರು* ಬರೆಯಿರಿ (ಉದಾ: *Mandya*, *Rampur*, *Shivamogga*):",
    receiptAssigned:
      "🎉 *ಸೇವಾ ವಿನಂತಿ ದಾಖಲಾಗಿದೆ!*\n\n" +
      "• *ವಿನಂತಿ ಐಡಿ:* {id}\n" +
      "• *ಪ್ರಾಮುಖ್ಯತೆ:* {priority}\n" +
      "• *ಸ್ಥಿತಿ:* ASSIGNED\n\n" +
      "👤 *ನಿಯೋಜಿತ ವ್ಯಕ್ತಿ:* {name}\n" +
      "📞 *ದೂರವಾಣಿ:* {phone}\n" +
      "📍 *ಸ್ಥಳ:* {location}\n\n" +
      "ಸ್ಥಿತಿ ತಿಳಿಯಲು *STATUS {id}* ಎಂದು ಕಳುಹಿಸಿ! 🛡️",
    receiptQueued: "⏳ ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಪರಿಶೀಲನೆಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.",
    workerResolved: "✅ ವಿನಂತಿ *{id}* ಅನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಳಿಸಲಾಗಿದೆ (RESOLVED). 🛡️",
    workerProgress: "🛠️ ವಿನಂತಿ *{id}* ನ ಕೆಲಸ ಪ್ರಗತಿಯಲ್ಲಿದೆ (IN PROGRESS). 🛡️",
  },
  ta: {
    welcome:
      "🛡️ *வான்கார்ட் (VANGUARD) கிராமப்புற சேவைக்கு வரவேற்கிறோம்!*\n\n" +
      "உங்கள் பிரச்சனைக்குரிய எண்ணை அனுப்பவும்:\n" +
      "1️⃣ *குடிமை / மின்சாரம் / குடிநீர்*\n" +
      "2️⃣ *சுகாதாரம் & மருத்துவம்*\n" +
      "3️⃣ *அவசரகால உதவி / விபத்து*\n" +
      "4️⃣ *விவசாயம் & பாசனம்*\n" +
      "5️⃣ *இதர தேவைகள்*",
    categorySelected: "✅ வகை தேர்வு செய்யப்பட்டது: *{cat}*\n\n📝 பிரச்சனையை விரிவாக விவரிக்கவும்.",
    promptLocation: "📍 உங்கள் *கிராமம் / வார்டு பெயரை* பதிவிடவும் (எ.கா. *Rampur*, *Mandya*):",
    receiptAssigned:
      "🎉 *சேவை கோரிக்கை பதிவு செய்யப்பட்டது!*\n\n" +
      "• *கோரிக்கை எண்:* {id}\n" +
      "• *முன்னுரிமை:* {priority}\n" +
      "• *நிலை:* ASSIGNED\n\n" +
      "👤 *உதவியாளர்:* {name}\n" +
      "📞 *தொடர்பு:* {phone}\n" +
      "📍 *இடம்:* {location}\n\n" +
      "நிலையை அறிய *STATUS {id}* என அனுப்பவும்! 🛡️",
    receiptQueued: "⏳ கோரிக்கை அதிகாரிகளின் மதிப்பாய்விற்கு அனுப்பப்பட்டுள்ளது.",
    workerResolved: "✅ கோரிக்கை *{id}* வெற்றிகரமாக முடிக்கப்பட்டது (RESOLVED). 🛡️",
    workerProgress: "🛠️ கோரிக்கை *{id}* செயலில் உள்ளது (IN PROGRESS). 🛡️",
  },
  es: {
    welcome:
      "🛡️ *¡Bienvenido al Servicio de Asistencia Rural VANGUARD!*\n\n" +
      "Por favor responda con el número de su categoría:\n" +
      "1️⃣ *Servicios Cívicos* (Electricidad, agua, drenaje)\n" +
      "2️⃣ *Salud y Medicina* (Primeros auxilios, medicamentos)\n" +
      "3️⃣ *Emergencia* (Accidente, trauma, ambulancia)\n" +
      "4️⃣ *Agricultura* (Canales de riego, cosecha)\n" +
      "5️⃣ *Otro Requerimiento*",
    categorySelected: "✅ Categoría seleccionada: *{cat}*\n\n📝 Describa el problema en texto sencillo.",
    promptLocation: "📍 Ingrese el nombre de su *Pueblo o Distrito* (ej. *Rampur*, *Mandya*):",
    receiptAssigned:
      "🎉 *¡Solicitud Creada y Asignada!*\n\n" +
      "• *ID de Solicitud:* {id}\n" +
      "• *Prioridad:* {priority}\n" +
      "• *Estado:* ASSIGNED\n\n" +
      "👤 *Asignado a:* {name}\n" +
      "📞 *Contacto:* {phone}\n" +
      "📍 *Cobertura:* {location}",
    receiptQueued: "⏳ Solicitud en cola para triaje de la autoridad local.",
    workerResolved: "✅ Solicitud *{id}* marcada como *RESUELTA*. 🛡️",
    workerProgress: "🛠️ Solicitud *{id}* marcada *EN PROGRESO*. 🛡️",
  },
};

// Clear stale sessions older than 30 minutes
function getCleanSession(phone: string, detectedLang = "en"): SessionState {
  const existing = sessionStore.get(phone);
  if (existing && Date.now() - existing.lastUpdated < 30 * 60 * 1000) {
    return existing;
  }
  const initial: SessionState = {
    step: "category",
    language: detectedLang,
    lastUpdated: Date.now(),
  };
  sessionStore.set(phone, initial);
  return initial;
}

function getMsg(lang: string, key: string, params: Record<string, string> = {}): string {
  const dict = BOT_MESSAGES[lang] || BOT_MESSAGES.en;
  let text = dict[key] || BOT_MESSAGES.en[key] || "";
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, "g"), v);
  }
  return text;
}

/**
 * GET: Meta WhatsApp Webhook Verification Challenge
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken =
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "vanguard_webhook_verify_secret_2026";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("✅ [WhatsApp Webhook] Verification successful!");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification token mismatch" }, { status: 403 });
}

/**
 * POST: Handles incoming WhatsApp messages from Citizens & Workers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Extract message payload
    let senderPhone = "";
    let messageText = "";

    if (body.object === "whatsapp_business_account" && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const msg = body.entry[0].changes[0].value.messages[0];
      senderPhone = msg.from || "";
      messageText = msg.text?.body?.trim() || "";
    } else if (body.from && body.text) {
      // Direct simulator format
      senderPhone = body.from;
      messageText = body.text.trim();
    } else {
      return NextResponse.json({ status: "ignored" });
    }

    if (!senderPhone || !messageText) {
      return NextResponse.json({ status: "empty_message" });
    }

    const cleanPhone = senderPhone.replace(/\D/g, "");
    const upperText = messageText.toUpperCase();

    // Check language detection from greeting
    const detectedGreetingLang = detectLanguageFromGreeting(messageText);

    // ============================================================
    // LANGUAGE SWITCH COMMAND (e.g. "LANG ta", "LANG hi", "LANG es")
    // ============================================================
    if (upperText.startsWith("LANG")) {
      const targetCode = messageText.split(" ")[1]?.toLowerCase() || "en";
      const validLang = BOT_MESSAGES[targetCode] ? targetCode : "en";
      const session = getCleanSession(cleanPhone, validLang);
      session.language = validLang;
      sessionStore.set(cleanPhone, session);

      const reply = getMsg(validLang, "welcome");
      await sendWhatsAppMessage({ toPhone: cleanPhone, text: reply });
      return NextResponse.json({ reply, language: validLang });
    }

    // ============================================================
    // WORKER / VOLUNTEER DIRECT STATUS COMMANDS
    // ============================================================
    if (
      upperText.startsWith("DONE") ||
      upperText.startsWith("RESOLVE") ||
      upperText.startsWith("START") ||
      upperText.startsWith("PROGRESS") ||
      upperText.startsWith("STATUS")
    ) {
      const parts = messageText.split(" ");
      const command = parts[0].toUpperCase();
      const requestId = parts[1];
      const customNote = parts.slice(2).join(" ");

      if (!requestId) {
        const reply = "⚠️ Please specify a Request ID.\nExample: *START req_101* or *DONE req_101 Wiring fixed successfully*";
        await sendWhatsAppMessage({ toPhone: cleanPhone, text: reply });
        return NextResponse.json({ reply });
      }

      const reqRecord = await prisma.request.findUnique({
        where: { id: requestId },
        include: { user: true, assignedTo: true },
      });

      if (!reqRecord) {
        const reply = `❌ Request ID *${requestId}* not found in VANGUARD system.`;
        await sendWhatsAppMessage({ toPhone: cleanPhone, text: reply });
        return NextResponse.json({ reply });
      }

      const userLang = reqRecord.user?.language || "en";

      if (command === "STATUS") {
        const reply =
          `📋 *Status of Request ${reqRecord.id}*\n\n` +
          `• *Category:* ${reqRecord.category.toUpperCase()}\n` +
          `• *Priority:* ${reqRecord.priority.toUpperCase()}\n` +
          `• *Current Status:* ${reqRecord.status.toUpperCase()}\n` +
          `• *Assigned To:* ${reqRecord.assignedTo?.name || "Unassigned"}\n` +
          `• *Location:* ${reqRecord.location}\n\n` +
          `📝 *Description:* ${reqRecord.description}`;
        await sendWhatsAppMessage({ toPhone: cleanPhone, text: reply });
        return NextResponse.json({ reply });
      }

      const newStatus = command.startsWith("DONE") || command.startsWith("RESOLVE") ? "resolved" : "in_progress";

      await prisma.request.update({
        where: { id: reqRecord.id },
        data: { status: newStatus },
      });

      let workerUser = await prisma.user.findFirst({
        where: { phone: { contains: cleanPhone.slice(-10) } },
      });

      const workerName = workerUser?.name || "Field Responder";
      const auditMsg =
        newStatus === "resolved"
          ? customNote || `Completed by ${workerName} via mobile WhatsApp dispatch.`
          : customNote || `Work started by ${workerName} on site.`;

      await prisma.requestUpdate.create({
        data: {
          requestId: reqRecord.id,
          userId: workerUser?.id || reqRecord.userId,
          status: newStatus,
          message: auditMsg,
        },
      });

      const replyKey = newStatus === "resolved" ? "workerResolved" : "workerProgress";
      const reply = getMsg(userLang, replyKey, { id: reqRecord.id });
      await sendWhatsAppMessage({ toPhone: cleanPhone, text: reply });
      return NextResponse.json({ reply });
    }

    // ============================================================
    // CITIZEN INTERACTIVE SERVICE REQUEST CREATION FLOW
    // ============================================================
    const session = getCleanSession(cleanPhone, detectedGreetingLang !== "en" ? detectedGreetingLang : "en");
    if (detectedGreetingLang !== "en") {
      session.language = detectedGreetingLang;
    }

    // Reset / Greeting command
    if (
      upperText === "RESET" ||
      upperText === "CANCEL" ||
      upperText === "RESTART" ||
      upperText === "HI" ||
      upperText === "HELLO" ||
      detectedGreetingLang !== "en"
    ) {
      session.step = "category";
      session.lastUpdated = Date.now();
      sessionStore.set(cleanPhone, session);

      const reply = getMsg(session.language, "welcome");
      await sendWhatsAppMessage({ toPhone: cleanPhone, text: reply });
      return NextResponse.json({ reply, language: session.language });
    }

    // STEP 1: Process Category Selection
    if (session.step === "category") {
      let selectedCategory: RequestCategory = "civic";
      if (messageText === "1" || upperText.includes("CIVIC")) selectedCategory = "civic";
      else if (messageText === "2" || upperText.includes("HEALTH")) selectedCategory = "health";
      else if (messageText === "3" || upperText.includes("EMERGENCY")) selectedCategory = "emergency";
      else if (messageText === "4" || upperText.includes("FARM")) selectedCategory = "farming";
      else if (messageText === "5" || upperText.includes("OTHER")) selectedCategory = "other";
      else {
        const reply = "Please reply with a valid number from 1 to 5 to select your category:\n1. Civic\n2. Health\n3. Emergency\n4. Farming\n5. Other";
        await sendWhatsAppMessage({ toPhone: cleanPhone, text: reply });
        return NextResponse.json({ reply });
      }

      session.category = selectedCategory;
      session.step = "description";
      session.lastUpdated = Date.now();
      sessionStore.set(cleanPhone, session);

      const reply = getMsg(session.language, "categorySelected", {
        cat: selectedCategory.toUpperCase(),
      });
      await sendWhatsAppMessage({ toPhone: cleanPhone, text: reply });
      return NextResponse.json({ reply });
    }

    // STEP 2: Process Problem Description
    if (session.step === "description") {
      session.description = messageText;
      session.step = "location";
      session.lastUpdated = Date.now();
      sessionStore.set(cleanPhone, session);

      const reply = getMsg(session.language, "promptLocation");
      await sendWhatsAppMessage({ toPhone: cleanPhone, text: reply });
      return NextResponse.json({ reply });
    }

    // STEP 3: Process Location & Dispatch Request
    if (session.step === "location") {
      const location = messageText;
      const category = session.category || "civic";
      const description = session.description || "Service request raised via WhatsApp";

      // 1. Find or create citizen account for sender
      let citizen = await prisma.user.findFirst({
        where: { phone: { contains: cleanPhone.slice(-10) } },
      });

      if (!citizen) {
        citizen = await prisma.user.create({
          data: {
            name: `WhatsApp Citizen (${cleanPhone.slice(-4)})`,
            phone: cleanPhone.slice(-10),
            passwordHash: "$2a$10$wE99N502/KszZ1aWbA4lFuhQe56N63f35JmX99b8/qK2f2qY8fCwe", // bcrypt hash of "password123"
            role: "citizen",
            location: location,
            language: session.language || "en",
          },
        });
      }

      // 2. Execute VANGUARD Deterministic & Geo-Aware Routing Engine
      const priority = getCategoryDefaultPriority(category);
      const routingResult = await determineRoutingAndAssignment(category, location, description);

      const newRequest = await prisma.request.create({
        data: {
          userId: citizen.id,
          category,
          priority,
          location,
          description,
          status: routingResult.status,
          assignedToId: routingResult.assignedToId,
        },
        include: { assignedTo: true },
      });

      await prisma.requestUpdate.create({
        data: {
          requestId: newRequest.id,
          userId: citizen.id,
          status: routingResult.status,
          message: routingResult.auditMessage,
        },
      });

      // Clear session
      sessionStore.delete(cleanPhone);

      let reply = "";
      if (routingResult.assignedToId && newRequest.assignedTo) {
        reply = getMsg(session.language, "receiptAssigned", {
          id: newRequest.id,
          priority: priority.toUpperCase(),
          status: routingResult.status.toUpperCase(),
          name: newRequest.assignedTo.name,
          phone: newRequest.assignedTo.phone,
          location: location,
        });
      } else {
        reply = getMsg(session.language, "receiptQueued", {
          id: newRequest.id,
          priority: priority.toUpperCase(),
        });
      }

      await sendWhatsAppMessage({ toPhone: cleanPhone, text: reply });
      return NextResponse.json({
        success: true,
        reply,
        requestId: newRequest.id,
        status: routingResult.status,
        assignedTo: newRequest.assignedTo?.name || null,
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("WhatsApp webhook handler error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

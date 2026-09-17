import fs from "fs";
import path from "path";

let currentKeyIndex = 0;

function loadEnvKeysDirectly(): string[] {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const lines = content.split("\n");
      const foundKeys: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("#") || !trimmed.includes("=")) continue;
        const [keyName, ...rest] = trimmed.split("=");
        const val = rest.join("=").replace(/^["']|["']$/g, "").trim();

        if ((keyName.trim() === "GROQ_API_KEYS" || keyName.trim().startsWith("GROQ_API_KEY")) && val) {
          if (keyName.trim() === "GROQ_API_KEYS") {
            const split = val.split(",").map((k) => k.trim()).filter((k) => k.length > 0);
            foundKeys.push(...split);
          } else {
            foundKeys.push(val);
          }
        }
      }
      return foundKeys;
    }
  } catch (e) {
    // ignore
  }
  return [];
}

export function getGroqApiKeys(): string[] {
  const keys: string[] = [];

  // 1. Check process.env.GROQ_API_KEYS
  if (process.env.GROQ_API_KEYS) {
    const split = process.env.GROQ_API_KEYS.split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    keys.push(...split);
  }

  // 2. Check numbered keys GROQ_API_KEY_1 through GROQ_API_KEY_6
  for (let i = 1; i <= 6; i++) {
    const k = process.env[`GROQ_API_KEY_${i}`];
    if (k && k.trim() && !keys.includes(k.trim())) {
      keys.push(k.trim());
    }
  }

  // 3. Check single GROQ_API_KEY
  if (process.env.GROQ_API_KEY && !keys.includes(process.env.GROQ_API_KEY.trim())) {
    keys.push(process.env.GROQ_API_KEY.trim());
  }

  // 4. If still empty, read directly from .env file
  if (keys.length === 0) {
    const directKeys = loadEnvKeysDirectly();
    for (const dk of directKeys) {
      if (!keys.includes(dk)) {
        keys.push(dk);
      }
    }
  }

  return keys;
}

const SYSTEM_PROMPT = `You are VanguardBot (🛡️🌸🌾), an empathetic, expert, and friendly AI assistant for the VANGUARD Rural Service Routing Platform.

You are specialized to assist rural communities with 5 core knowledge domains in order of priority:

======================================================================
1. 🌸 WOMEN'S MENSTRUAL HEALTH, HYGIENE & SEXUAL WELLNESS (TOP PRIORITY)
======================================================================
- Menstrual Cycle & Periods: Normal cycle length (21-35 days), period duration (3-7 days), tracking ovulation, managing irregular periods.
- Cramps & Pain Relief: Warm compresses/heating pads on lower abdomen, warm ginger/chamomile tea, gentle stretches (child's pose, cat-cow), hydration, over-the-counter pain relief advice (e.g. Paracetamol/Mefenamic acid).
- Menstrual Hygiene: Washing cloth pads with clean water & soap and drying in direct sunlight, sanitary pad changing intervals (every 4-6 hours), preventing UTIs & vaginal infections.
- Reproductive & Sexual Wellness: Safe practices, contraceptive awareness (oral pills, condoms, copper-T), pregnancy signs, STI awareness, PCOS/PCOD symptoms (facial hair, weight, irregular flow).
- Tone: Empathetic, warm, supportive, scientifically accurate, stigma-free, confidential.

======================================================================
2. 🩺 BASIC MEDICAL HELP & FIRST AID
======================================================================
- Dehydration & Heatstroke: Oral Rehydration Salts (ORS recipe: 6 tsp sugar + 1/2 tsp salt in 1L boiled clean water), shade, cool compresses.
- Fever & Common Illness: Sponge with lukewarm water, hydration, rest, paracetamol dosage safety.
- Minor Cuts, Burns & Wounds: Running cool water over burns for 10-15 min (never ice or butter), antiseptic cleansing, clean bandage dressing.
- Triage & Red Flags: Chest pain, high fever >103°F with neck stiffness, severe breathing difficulty, blood loss -> urge immediate Primary Health Center (PHC) visit or raising an HIGH PRIORITY Emergency request in VANGUARD.

======================================================================
3. ⚡ HEALTH & CIVIC SERVICE DISPATCH
======================================================================
- How to report village problems in VANGUARD:
  * Health / Medical: Medication delivery, primary clinic transit, maternal checkup assistance.
  * Civic / Infrastructure: Transformer sparks, low hanging cables, broken water pumps, blocked drainage, road craters.
  * Emergency: Fires, sudden trauma, patient transport.
- Explain that VANGUARD automatically maps Emergency/Health to HIGH priority, Civic to MEDIUM priority.

======================================================================
4. 👥 VANGUARD PLATFORM WORKFLOW & USER ROLES
======================================================================
- 4 Roles:
  * 👤 Citizen: Submit plain-text requests, see assigned helper contact trust card, track live status.
  * 👷 Worker: Accept auto-matched jobs in their village, update status to 'In Progress', mark 'Resolved'.
  * 🤝 Volunteer: Handle emergency jobs, claim open unassigned community tasks.
  * 🏛️ Local Authority: District triage matrix, manual dispatch, verify/revoke staff credentials.
- Verification Gating: Unverified workers/volunteers are skipped by auto-routing until approved by Authority.
- Demo Login: Password for all test accounts is 'password123'.

======================================================================
5. 🌾 REAL FARMING, CROP & SOIL ADVISORY (EXPERT AGRONOMY)
======================================================================
- Soil Types & Best Crops:
  * Alluvial Soil: Highly fertile, rich in potash. Best for Wheat, Rice/Paddy, Sugarcane, Jute, Pulses, Oilseeds.
  * Black (Regur) Soil: Clayey, moisture-retentive, rich in iron/lime. Best for Cotton, Soybean, Sorghum (Jowar), Millets, Tobacco.
  * Red & Yellow Soil: Porous, low nitrogen. Best for Groundnut, Pulses, Millets (Ragi, Bajra), Tobacco with irrigation.
  * Sandy / Loamy Soil: Well-drained. Best for Vegetables (Tomato, Onion, Potato), Melons, Mustard, Maize.
- Sowing Seasons & Climate:
  * Kharif (Monsoon: June-Oct): Rice, Maize, Cotton, Soybean, Bajra, Groundnut (Warm & humid, 25-35°C).
  * Rabi (Winter: Oct-March): Wheat, Mustard, Gram/Chickpea, Barley, Peas (Cool & dry, 15-25°C).
  * Zaid (Summer: March-June): Watermelon, Cucumber, Fodder, Green gram (Hot & dry, 30-40°C).
- Water & Rainfall Requirements:
  * Rice/Paddy: 100-150 cm rainfall, standing water.
  * Wheat: 50-75 cm rainfall, 4-6 light irrigations at Crown Root Initiation (CRI) stage.
  * Mustard & Pulses: Low water requirement (25-40 cm), prone to waterlogging damage.
- Organic Pest & Soil Management:
  * Neem oil spray (5ml/L water) for aphids/whiteflies.
  * Jeevamrutha / Vermicompost for microbial soil rejuvenation.
  * Crop rotation (legumes after cereal) to fix biological nitrogen naturally.

======================================================================
RESPONSE STYLE GUIDELINES:
======================================================================
- Keep responses well-structured with clear bullet points, warm tone, practical and actionable advice.
- Use friendly, tasteful emojis (🌸, 🌾, 🩺, 🛡️, ⚡, 💧, ☀️).
- Always be ready to give step-by-step guidance for rural citizens.`;

/**
 * Built-in intelligent fallback responses when Groq API keys are rotating or offline
 */
export function getSmartFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  // Menstrual & Women's Health (Hindi + English + Kannada)
  if (
    q.includes("period") || q.includes("menstru") || q.includes("cramp") || q.includes("pad") ||
    q.includes("pcod") || q.includes("pcos") || q.includes("sexual") ||
    q.includes("माहवारी") || q.includes("पीरियड") || q.includes("दर्द") || q.includes("ಗರ್ಭ")
  ) {
    return "🌸 **महिला स्वास्थ्य एवं मासिक धर्म देखभाल (Women's Health):**\n• **दर्द निवारण:** पेट के निचले हिस्से पर गर्म पानी की थैली से सेक करें और गुनगुना पानी या अदरक वाली चाय पिएं।\n• **स्वच्छता:** पैड को हर 4-6 घंटे में बदलें। कपड़े का उपयोग करने पर साबुन से धोकर धूप में सुखाएं।\n• **डॉक्टर से कब मिलें:** अत्यधिक रक्तस्राव (<1 घंटे में पैड भीगना) या असहनीय दर्द होने पर तुरंत PHC जाएं या VANGUARD में महिला स्वास्थ्य सहायता चुनें! 🛡️✨";
  }

  // Farming & Crop Advisory (Hindi + English + Indic)
  if (
    q.includes("crop") || q.includes("soil") || q.includes("farm") || q.includes("wheat") ||
    q.includes("rice") || q.includes("cotton") || q.includes("season") || q.includes("pest") ||
    q.includes("फसल") || q.includes("खाद") || q.includes("कीट") || q.includes("यूरिया") ||
    q.includes("गेहूं") || q.includes("धान") || q.includes("ಬೆಳೆ") || q.includes("ಗೊಬ್ಬರ")
  ) {
    return "🌾 **कृषि एवं फसल परामर्श (Agricultural Advisory):**\n• **उर्वरक सरकारी दर:** यूरिया (₹266.50/45kg), डीएपी (₹1,350/50kg)। ओवर-चार्जिंग पर VANGUARD में शिकायत दर्ज करें।\n• **कीट नियंत्रण:** एफिड्स/सफेद मक्खी पर 5 मिली नीम का तेल प्रति लीटर पानी में मिलाकर छिड़काव करें।\n• **मिट्टी स्वास्थ्य:** फसल चक्र अपनाएं (दलहन फसलें) जिससे मिट्टी में नाइट्रोजन प्राकृतिक रूप से समृद्ध हो! 💧☀️";
  }

  // Medical First Aid & Emergency (Hindi + English + Indic)
  if (
    q.includes("fever") || q.includes("first aid") || q.includes("dehydrat") || q.includes("ors") ||
    q.includes("burn") || q.includes("cut") || q.includes("बुखार") || q.includes("चोट") ||
    q.includes("जलन") || q.includes("ओआरएस") || q.includes("दवा") || q.includes("ಜ್ವರ")
  ) {
    return "🩺 **प्राथमिक चिकित्सा एवं स्वास्थ्य परामर्श (First Aid):**\n• **डिहाइड्रेशन / ओआरएस:** 1 लीटर उबले साफ पानी में 6 चम्मच चीनी + 1/2 चम्मच नमक मिलाकर पिएं।\n• **जलने पर:** जले हुए स्थान पर 10-15 मिनट तक बहता ठंडा पानी डालें (बर्फ या घी न लगाएं)।\n• **गंभीर लक्षण:** तेज बुखार (>103°F) या सीने में दर्द होने पर तत्काल VANGUARD पर 'आपातकालीन एम्बुलेंस SOS' दबाएं! 🚨";
  }

  // Water & Electricity Civic Grievances
  if (
    q.includes("water") || q.includes("pipe") || q.includes("electric") || q.includes("wire") ||
    q.includes("पानी") || q.includes("बिजली") || q.includes("सड़क") || q.includes("नल") ||
    q.includes("नीरु") || q.includes("ವಿದ್ಯುತ್")
  ) {
    return "⚡ **नागरिक समस्या समाधान (Civic Assistance):**\n• टूटे पाइप, गंदे पानी या लटकते बिजली के तारों की शिकायत दर्ज करने के लिए होमपेज पर **'नई शिकायत दर्ज करें'** बटन दबाएं।\n• आपका आवेदन निकटतम प्रमाणित कारीगर (लाइनमैन/प्लंबर) को स्वतः 15 मिनट में आवंटित हो जाएगा! 🛡️";
  }

  // Routing & Workflow
  if (q.includes("routing") || q.includes("how it works") || q.includes("काम कैसे") || q.includes("नियम")) {
    return "⚡ **VANGUARD कैसे काम करता है:**\n1. अपनी समस्या बोलकर या लिखकर दर्ज करें।\n2. AI स्वतः समस्या की गंभीरता (आपातकालीन / सामान्य) निर्धारित करता है।\n3. आपके ग्राम पंचायत के निकटतम सत्यापित कार्यकर्ता या स्वयंसेवक को सीधे अलर्ट भेजा जाता है।\n4. अपनी शिकायत की लाइव स्थिति टाइमलाइन पर ट्रैक करें! 🛡️";
  }

  return "👋 नमस्ते! मैं **VanguardBot** (🛡️🌸🌾) हूँ!\nमैं आपकी निम्नलिखित विषयों में सहायता कर सकता हूँ:\n• 🌸 **महिला स्वास्थ्य, माहवारी एवं स्वच्छता**\n• 🩺 **प्राथमिक चिकित्सा एवं आपातकालीन SOS**\n• 🌾 **खेती, फसल रोग, खाद दर एवं मौसम चेतावनी**\n• ⚡ **नागरिक एवं पंचायत सेवा समाधान**\n\nआप क्या पूछना चाहते हैं?";
}

export async function queryGroqChatbot(messages: { role: string; content: string }[]): Promise<string> {
  const keys = getGroqApiKeys();

  if (keys.length === 0) {
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()?.content || "";
    return getSmartFallbackResponse(lastUserMessage);
  }

  // Official high-speed Groq models in order of priority
  const models = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
  ];

  let attempts = 0;
  const maxAttempts = keys.length * models.length;

  while (attempts < maxAttempts) {
    const key = keys[currentKeyIndex % keys.length];
    const model = models[Math.floor(attempts / keys.length) % models.length];

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          temperature: 0.6,
          max_tokens: 650,
        }),
      });

      const text = await res.text();
      if (!res.ok || !text) {
        console.warn(`[Groq Key #${(currentKeyIndex % keys.length) + 1} (${model})] Status: ${res.status}`);
        currentKeyIndex = (currentKeyIndex + 1) % keys.length;
        attempts++;
        continue;
      }

      let data: any;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.warn("[Groq] JSON parse error on response:", parseErr);
        currentKeyIndex = (currentKeyIndex + 1) % keys.length;
        attempts++;
        continue;
      }

      const reply = data?.choices?.[0]?.message?.content;
      if (reply && reply.trim()) {
        return reply.trim();
      }
    } catch (err) {
      console.warn(`[Groq] Fetch error on key index ${currentKeyIndex}:`, err);
      currentKeyIndex = (currentKeyIndex + 1) % keys.length;
      attempts++;
    }
  }

  const lastUserMessage = messages.filter((m) => m.role === "user").pop()?.content || "";
  return getSmartFallbackResponse(lastUserMessage);
}

export async function queryCustomGroq(
  messages: { role: string; content: string }[],
  systemPrompt?: string,
  temperature: number = 0.5
): Promise<string | null> {
  const keys = getGroqApiKeys();
  if (keys.length === 0) return null;

  const models = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.6-27b",
    "groq/compound",
  ];

  let attempts = 0;
  const maxAttempts = Math.min(keys.length * models.length, 6);

  while (attempts < maxAttempts) {
    const key = keys[currentKeyIndex % keys.length];
    const model = models[Math.floor(attempts / keys.length) % models.length];

    try {
      const fullMessages = systemPrompt
        ? [{ role: "system", content: systemPrompt }, ...messages]
        : messages;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: fullMessages,
          temperature,
          max_tokens: 500,
        }),
      });

      if (!res.ok) {
        currentKeyIndex = (currentKeyIndex + 1) % keys.length;
        attempts++;
        continue;
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content && content.trim()) {
        return content.trim();
      }
    } catch (err) {
      currentKeyIndex = (currentKeyIndex + 1) % keys.length;
      attempts++;
    }
  }

  return null;
}


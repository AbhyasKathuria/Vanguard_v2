import { CallScenario } from "@/lib/types";
import { queryCustomGroq } from "@/lib/groq";

export * from "./voiceConstants";
import { PRESET_CALL_SCENARIOS, VoiceCallTurnResult } from "./voiceConstants";

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/**
 * Processes a caller utterance in the simulated emergency dispatch call with multilingual support,
 * unscripted raw call triage, and live GPS integration.
 */
export async function processVoiceCallTurn(
  scenarioId: string | null | undefined,
  userMessage: string,
  history: { speaker: string; text: string }[],
  locale: string = "en",
  gpsCoords?: GpsCoordinates | null
): Promise<VoiceCallTurnResult> {
  const isRaw = !scenarioId || scenarioId === "raw" || scenarioId === "custom";
  const scenario = !isRaw
    ? PRESET_CALL_SCENARIOS.find((s) => s.id === scenarioId) || null
    : null;

  const userText = userMessage.trim();
  const gpsString = gpsCoords
    ? `GPS Coordinates: ${gpsCoords.latitude.toFixed(5)}°N, ${gpsCoords.longitude.toFixed(5)}°E (±${Math.round(
        gpsCoords.accuracy || 10
      )}m)`
    : null;

  // 1. Try calling Groq for dynamic, context-aware multilingual emergency dispatch
  try {
    let groqSystemPrompt = "";

    if (isRaw) {
      groqSystemPrompt = `You are the official VANGUARD AI Emergency Dispatcher operating on the 925 Toll-Free Emergency Hotline.
The caller is reporting an unscripted, real-time emergency in language code: "${locale}".
${gpsString ? `The caller has just transmitted their live satellite GPS location: "${gpsString}".` : "The caller has not shared GPS yet. If they state their location or landmark, extract it; otherwise ask them where they are located."}
You MUST respond to the caller strictly in their language ("${locale}").
Your spoken response ("reply") must be calm, authoritative, reassuring, and concise (2-3 short sentences max) suitable for telephone Text-To-Speech.
Categorize the emergency, evaluate urgency (Critical, High, or Moderate), identify the incident location, assign the best emergency unit, and provide immediate safety or first-aid instructions.
${gpsString ? "Acknowledge in your spoken response that their live GPS location has been locked and given to incoming units." : ""}
If the caller has already transmitted their location or is confirming that status is stable or asking units to reach there (e.g. 'हाँ, स्थिति स्थिर है, तुरंत पहुंचिए' / 'reach there' / 'stable' / 'yes'), acknowledge their status and issue the definitive VANGUARD dispatch command: confirm that emergency units are en route with lights and sirens, ETA ~4 minutes, and advise keeping road access clear.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "reply": "Clear concise spoken response in language '${locale}'",
  "extractedLocation": "${gpsString || "Detected landmark or 'Location Pending'"}",
  "urgency": "Critical" | "High" | "Moderate",
  "category": "Medical" | "Fire / Hazmat" | "Traffic / Accident" | "Animal Welfare" | "Electrical" | "Civic Disaster" | "Police / Threat",
  "incidentSummary": "1 sentence brief summary of the emergency in English",
  "dispatchTriggered": true,
  "assignedUnit": "Specific unit name (e.g. 'Advanced Life Support Ambulance 1', 'Rapid Fire Tender 2', 'Animal Rescue Ambulance', 'DISCOM Electrical Isolation Crew')",
  "etaMinutes": 4,
  "safetyInstructions": ["Action 1 in English", "Action 2 in English"]
}
Do NOT output markdown blocks or backticks. Return valid JSON only.`;
    } else {
      groqSystemPrompt = `You are the official VANGUARD AI Emergency Dispatcher operating on the 925 Toll-Free Emergency Hotline.
The caller is reporting an emergency in language code: "${locale}".
Scenario Context: "${scenario?.title}" (${scenario?.category}, ${scenario?.callerLocation}).
${gpsString ? `Live GPS shared: "${gpsString}".` : ""}
You MUST respond to the caller strictly in their language ("${locale}").
Your spoken response ("reply") must be calm, authoritative, reassuring, and concise (2-3 sentences max) so it sounds natural over telephone Text-To-Speech.
Provide immediate on-scene first-aid or safety guidance while dispatching emergency units.
If the caller confirms that the situation is stable or asks units to reach there, issue the active arrival command: confirm that emergency units are en route with emergency sirens, ETA ~4 minutes, and advise keeping road access clear.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "reply": "Clear concise spoken response in language '${locale}'",
  "extractedLocation": "${gpsString || scenario?.callerLocation}",
  "urgency": "${scenario?.urgency || "Critical"}",
  "category": "${scenario?.category}",
  "incidentSummary": "${scenario?.title}",
  "dispatchTriggered": true,
  "assignedUnit": "${scenario?.recommendedUnit}",
  "etaMinutes": 4,
  "safetyInstructions": ["Action 1 in English", "Action 2 in English"]
}
Do NOT output markdown blocks or backticks. Return valid JSON only.`;
    }

    const formattedHistory = history.map((h) => ({
      role: h.speaker === "agent" ? "assistant" : "user",
      content: h.text,
    }));

    formattedHistory.push({ role: "user", content: userText });

    const rawResponse = await queryCustomGroq(formattedHistory, groqSystemPrompt, 0.3);

    if (rawResponse) {
      const cleanJson = rawResponse.replace(/\`\`\`json/gi, "").replace(/\`\`\`/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.reply) {
        return {
          reply: parsed.reply,
          extractedLocation: parsed.extractedLocation || gpsString || scenario?.callerLocation || "Emergency Zone",
          urgency: parsed.urgency || (scenario ? scenario.urgency : "Critical"),
          category: parsed.category || (scenario ? scenario.category : "General Emergency"),
          incidentSummary: parsed.incidentSummary || (scenario ? scenario.title : "Live Citizen Emergency"),
          dispatchTriggered: parsed.dispatchTriggered !== false,
          assignedUnit: parsed.assignedUnit || (scenario ? scenario.recommendedUnit : "Rapid First Responder Unit 1"),
          etaMinutes: parsed.etaMinutes || 4,
          safetyInstructions: parsed.safetyInstructions || [
            "Do not move victim unless immediate danger.",
            "Keep access road clear for first responders.",
            "Maintain voice contact.",
          ],
        };
      }
    }
  } catch (groqErr) {
    // Fall back to rule-based engine
  }

  // 2. Multilingual Rule-Based Fallback Engine
  const lower = userText.toLowerCase();

  // Keyword categorization
  let detectedCategory = scenario?.category || "General Emergency";
  let detectedUrgency: "Critical" | "High" | "Moderate" = scenario?.urgency || "High";
  let recommendedUnit = scenario?.recommendedUnit || "Emergency Response Unit 1";
  let safetyAdvice = [
    "Stay calm and keep yourself and others at a safe distance.",
    "Keep access pathways clear for emergency vehicles.",
    "Follow operator instructions until first responders arrive.",
  ];

  if (
    lower.includes("heart") ||
    lower.includes("chest") ||
    lower.includes("breath") ||
    lower.includes("blood") ||
    lower.includes("bleed") ||
    lower.includes("unconscious") ||
    lower.includes("collapse") ||
    lower.includes("दर्द") ||
    lower.includes("सांस") ||
    lower.includes("खून") ||
    lower.includes("बेहोश") ||
    lower.includes("रक्त") ||
    lower.includes("ನೋವು") ||
    lower.includes("ಉಸಿರಾಟ")
  ) {
    detectedCategory = "Medical / Health";
    detectedUrgency = "Critical";
    recommendedUnit = "Advanced Life Support Ambulance 1 (District PHC)";
    safetyAdvice = [
      "Keep patient seated upright with clothing loosened.",
      "Check breathing and do not administer food or liquid.",
      "Prepare to perform CPR if patient becomes unresponsive.",
    ];
  } else if (
    lower.includes("fire") ||
    lower.includes("smoke") ||
    lower.includes("gas") ||
    lower.includes("leak") ||
    lower.includes("cylinder") ||
    lower.includes("flame") ||
    lower.includes("आग") ||
    lower.includes("धुआं") ||
    lower.includes("गैस") ||
    lower.includes("बेंकी") ||
    lower.includes("ಹೊಗೆ")
  ) {
    detectedCategory = "Fire / Hazmat";
    detectedUrgency = "Critical";
    recommendedUnit = "Rapid Fire Tender 1 + Hazmat Crew";
    safetyAdvice = [
      "Evacuate everyone immediately to an open outdoor area upwind.",
      "Do not touch electrical switches or ignite any flame.",
      "Stay at least 50 meters back from the structure.",
    ];
  } else if (
    lower.includes("accident") ||
    lower.includes("crash") ||
    lower.includes("truck") ||
    lower.includes("car") ||
    lower.includes("bike") ||
    lower.includes("hit") ||
    lower.includes("vehicle") ||
    lower.includes("टक्कर") ||
    lower.includes("दुर्घटना") ||
    lower.includes("एक्सीडेंट") ||
    lower.includes("ಅಪಘಾತ")
  ) {
    detectedCategory = "Traffic / Trauma";
    detectedUrgency = "Critical";
    recommendedUnit = "Highway Patrol & Trauma Ambulance Unit";
    safetyAdvice = [
      "Do not move the injured person unless there is immediate fire danger.",
      "Wave traffic down safely to prevent secondary collisions.",
      "Apply direct pressure with a clean cloth if active bleeding.",
    ];
  } else if (
    lower.includes("dog") ||
    lower.includes("cow") ||
    lower.includes("animal") ||
    lower.includes("cattle") ||
    lower.includes("snake") ||
    lower.includes("fracture") ||
    lower.includes("कुत्ता") ||
    lower.includes("गाय") ||
    lower.includes("जानवर") ||
    lower.includes("ಹಸು") ||
    lower.includes("ನಾಯಿ")
  ) {
    detectedCategory = "Animal Welfare";
    detectedUrgency = "High";
    recommendedUnit = "Karuna Mobile Animal Rescue Ambulance";
    safetyAdvice = [
      "Do not handle the injured animal aggressively; keep it calm.",
      "Drape a dry blanket or cloth over it to prevent shock.",
      "Keep bystanders and other animals away.",
    ];
  } else if (
    lower.includes("wire") ||
    lower.includes("spark") ||
    lower.includes("electric") ||
    lower.includes("transformer") ||
    lower.includes("shock") ||
    lower.includes("करंट") ||
    lower.includes("तार") ||
    lower.includes("ವಿದ್ಯುತ್")
  ) {
    detectedCategory = "Electrical Threat";
    detectedUrgency = "Critical";
    recommendedUnit = "DISCOM Emergency Grid Isolation Squad";
    safetyAdvice = [
      "Stay at least 15 meters away from snapped wires.",
      "Never use water on electrical equipment.",
      "Alert pedestrians to keep back.",
    ];
  }

  const isConfirming =
    lower.includes("yes") ||
    lower.includes("done") ||
    lower.includes("arrived") ||
    lower.includes("stable") ||
    lower.includes("reach") ||
    lower.includes("confirm") ||
    lower.includes("ok") ||
    lower.includes("okay") ||
    lower.includes("safe") ||
    lower.includes("fast") ||
    lower.includes("हाँ") ||
    lower.includes("हो गया") ||
    lower.includes("स्थिर") ||
    lower.includes("ठीक") ||
    lower.includes("पहुंच") ||
    lower.includes("जल्दी") ||
    lower.includes("भेज") ||
    lower.includes("आ जाओ") ||
    lower.includes("ಆಯಿತು") ||
    lower.includes("ಸರಿ") ||
    lower.includes("ತಲುಪಿ") ||
    lower.includes("ஆம்");

  const turnCount = history.filter((h) => h.speaker === "caller").length;
  const isFinalTurn = turnCount >= 2 || isConfirming;

  const resolvedLocation = gpsString || scenario?.callerLocation || "Caller Location";

  const rawLocalizedReplies: Record<string, { initial: string; final: string }> = {
    hi: {
      initial: `925 आपातकालीन ऑपरेटर सुन रहा है। आपकी सूचना दर्ज कर ली गई है। ${gpsString ? "आपकी लाइव जीपीएस लोकेशन मिल गई है।" : ""} ${recommendedUnit} को रवाना किया जा रहा है। कृपया शांत रहें, क्या स्थिति अभी स्थिर है?`,
      final: `वांगार्ड प्रेषण आदेश सक्रिय है। ${recommendedUnit} 4 मिनट में आपके स्थान पर पहुंच रहा है। सायरन बजते हुए टीम रवाना हो चुकी है। कृपया सड़क का रास्ता खुला रखें।`,
    },
    kn: {
      initial: `925 ತುರ್ತು ಆಪರೇಟರ್ ಮಾತನಾಡುತ್ತಿದ್ದಾರೆ. ನಿಮ್ಮ ವಿವರಗಳನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ. ${gpsString ? "ನಿಮ್ಮ ಲೈವ್ ಜಿಪಿಎಸ್ ಸ್ಥಳ ಲಭ್ಯವಾಗಿದೆ." : ""} ${recommendedUnit} ಅನ್ನು ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ. ಪರಿಸ್ಥಿತಿ ತಿಳಿಸಿ.`,
      final: `ವ್ಯಾನ್‌ಗಾರ್ಡ್ ರಕ್ಷಣಾ ಪಡೆ ತಲುಪುತ್ತಿದೆ. ${recommendedUnit} 4 ನಿಮಿಷಗಳಲ್ಲಿ ಸ್ಥಳದಲ್ಲಿದೆ. ದಯವಿಟ್ಟು ರಸ್ತೆಯನ್ನು ಮುಕ್ತವಾಗಿಡಿ.`,
    },
    ta: {
      initial: `925 அவசர பிரிவு உங்கள் அழைப்பை ஏற்றுக்கொண்டது. ${gpsString ? "உங்கள் நேரடி ஜிபிஎஸ் இருப்பிடம் பெறப்பட்டது." : ""} ${recommendedUnit} உடனடியாக அனுப்பப்படுகிறது.`,
      final: `வான்கார்ட் அவசர படை உங்களை அடைகிறது. ${recommendedUnit} 4 நிமிடங்களில் வரும்.`,
    },
    te: {
      initial: `925 అత్యవసర సహాయ కేంద్రం. మీ వివరాలు నమోదయ్యాయి. ${gpsString ? "మీ లైవ్ జీపీఎస్ లొకేషన్ అందింది." : ""} ${recommendedUnit} పంపబడుతోంది.`,
      final: `వాన్‌గార్డ్ రెస్క్యూ టీమ్ చేరుకుంటోంది. ${recommendedUnit} 4 నిమిషాల్లో వస్తుంది.`,
    },
    en: {
      initial: `VANGUARD 925 Dispatch. We have received your emergency report. ${gpsString ? "Your live GPS coordinates have been locked." : ""} Dispatching ${recommendedUnit} immediately. Please confirm current victim status.`,
      final: `Dispatch command confirmed. ${recommendedUnit} is en route with lights and sirens, reaching your coordinates in approximately 4 minutes. Maintain voice contact and keep access clear.`,
    },
  };

  const currentPack = rawLocalizedReplies[locale] || rawLocalizedReplies.en;
  const replyText = isFinalTurn ? currentPack.final : currentPack.initial;

  return {
    reply: replyText,
    extractedLocation: resolvedLocation,
    urgency: detectedUrgency,
    category: detectedCategory,
    incidentSummary: isRaw ? `Live Emergency: ${detectedCategory}` : scenario?.title || "Emergency",
    dispatchTriggered: true,
    assignedUnit: recommendedUnit,
    etaMinutes: isFinalTurn ? 3 : 5,
    safetyInstructions: safetyAdvice,
  };
}

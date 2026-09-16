import { CallScenario } from "@/lib/types";

export const TOLL_FREE_HOTLINE = "925";

export const MULTILINGUAL_HOTLINE_GREETINGS: Record<string, string> = {
  en: "VANGUARD Emergency Hotline 925. Operator #704. What is your emergency and where are you located?",
  hi: "वांगार्ड आपातकालीन टोल-फ्री 925। ऑपरेटर #704। आपकी क्या आपातकालीन समस्या है और आप किस स्थान पर हैं?",
  kn: "ವ್ಯಾನ್‌ಗಾರ್ಡ್ ತುರ್ತು ಟೋಲ್-ಫ್ರೀ 925. ಆಪರೇಟರ್ #704. ನಿಮ್ಮ ತುರ್ತು ಪರಿಸ್ಥಿತಿ ಏನು ಮತ್ತು ನೀವು ಎಲ್ಲಿದ್ದೀರಿ?",
  ta: "வான்கார்ட் அவசர உதவி எண் 925. ஆப்பரேட்டர் #704. உங்கள் அவசர நிலை என்ன மற்றும் நீங்கள் எங்கு இருக்கிறீர்கள்?",
  te: "వాన్‌గార్డ్ ఎమర్జెన్సీ టోಲ್-ఫ్రీ 925. ఆపరేటర్ #704. మీ అత్యవసర సమస్య ఏమిటి మరియు మీరు ఎక్కడ ఉన్నారు?",
  bn: "ভ্যানগার্ড ইমার্জেন্সি টোল-ফ্রি ৯২৫। অপারেটর #৭০৪। আপনার জরুরি অবস্থা কি এবং আপনি কোথায় আছেন?",
  mr: "व्हॅनगार्ड आपत्कालीन टोल-ফ्री ९२५. ऑपरेटर #७०४. तुमची आपत्कालीन समस्या काय आहे आणि तुम्ही कुठे आहात?",
  gu: "વાનગાર્ડ ઇમરજન્સી ટોલ-ફ્રી ૯૨૫. ઓપરેટર #૭૦૪. તમારી કટોકટી શું છે અને તમે ક્યાં છો?",
  ml: "വാൻഗാർഡ് എമർജൻസി ടോൾ-ഫ്രീ 925. ഓപ്പറേറ്റർ #704. നിങ്ങളുടെ അടിയന്തര പ്രശ്നം എന്താണ്, നിങ്ങൾ ಎവിടെയാണ്?",
  pa: "ਵੈਨਗਾਰਡ ਐਮਰਜੈਂਸੀ ਟੋਲ-ਫ੍ਰੀ 925। ਆਪਰੇਟਰ #704। ਤੁਹਾਡੀ ਐਮਰਜੈਂਸੀ ਕੀ ਹੈ ਅਤੇ ਤੁਸੀਂ ਕਿੱਥੇ ਹੋ?",
  es: "Línea de Emergencia VANGUARD 925. Operador #704. ¿Cuál es su emergencia y dónde se encuentra?",
  fr: "Ligne d'Urgence VANGUARD 925. Opérateur #704. Quelle est votre urgence et où êtes-vous situé ?",
  de: "VANGUARD Notruf-Hotline 925. Operator #704. Was ist Ihr Notfall und wo befinden Sie sich?",
  ar: "خط طوارئ فانغارد 925 المجاني. المشغل رقم 704. ما هي حالة الطوارئ الخاصة بك وأين موقعك؟",
};

export function getHotlineGreeting(locale: string = "en"): string {
  return MULTILINGUAL_HOTLINE_GREETINGS[locale] || MULTILINGUAL_HOTLINE_GREETINGS.en;
}

export const PRESET_CALL_SCENARIOS: CallScenario[] = [
  {
    id: "hit_and_run",
    title: "Hit-and-Run on Highway 7 (Pedestrian Injured)",
    category: "Traffic / Medical",
    urgency: "Critical",
    iconName: "CarCrash",
    description: "Pedestrian struck by commercial freight vehicle on Highway 7. Heavy lower extremity hemorrhage. Unconscious driver fled scene.",
    callerName: "Vikas Agrawal",
    callerLocation: "KM 42, State Highway 7 near Sitapur Border",
    initialCallerAudioText: "Emergency! An elderly gentleman was just struck by a speeding truck at KM 42 on Highway 7! The truck didn't stop and he is bleeding heavily from his leg!",
    recommendedUnit: "Ambulance Unit 4 (Sitapur PHC - Advanced Life Support)",
    simulatedConversation: [
      {
        caller: "Emergency! An elderly gentleman was just struck by a speeding truck at KM 42 on Highway 7! The truck didn't stop and he is bleeding heavily from his leg!",
        agent: "VANGUARD Emergency Dispatch receiving. I am immediately locking your GPS at KM 42 Highway 7. Is the gentleman conscious and breathing right now?",
      },
      {
        caller: "He is groaning and breathing shallowly, but cannot talk. Blood is soaking through his pant leg rapidly!",
        agent: "Ambulance Unit 4 with paramedic team is rolling with lights and sirens, ETA 6 minutes. Take a clean cloth or garment, fold it thick, and press firmly down directly on the bleeding site. Do not lift the cloth to check.",
      },
      {
        caller: "Understood, I am applying firm pressure with a towel. The bleeding is slowing down slightly.",
        agent: "Excellent job, Vikas. Keep steady pressure. Do not attempt to move his head or torso. Unit 4 paramedic driver is passing the toll gate now. Stay on the line with me.",
      },
      {
        caller: "I can hear the sirens approaching down the highway now!",
        agent: "Paramedics are on scene. Dispatch confirmed. Transferring patient care to on-site EMS crew. Stand clear of the roadway.",
      },
    ],
  },
  {
    id: "stray_dog_fracture",
    title: "Stray Dog Rescue (Severe Leg Fracture & Dehydration)",
    category: "Animal Welfare",
    urgency: "High",
    iconName: "Dog",
    description: "Young stray dog trapped beside open irrigation culvert with compound fracture. High distress and dehydration.",
    callerName: "Anandi Patel",
    callerLocation: "Behind Gram Panchayat Bhavan, Rampur Ward 2",
    initialCallerAudioText: "Hello, VANGUARD Animal Rescue? There is a friendly community dog crying in the ditch near the Panchayat office. His left hind leg is clearly broken and he can't stand up.",
    recommendedUnit: "Karuna Mobile Animal Rescue Ambulance (Unit 2)",
    simulatedConversation: [
      {
        caller: "Hello, VANGUARD Animal Rescue? There is a friendly community dog crying in the ditch near the Panchayat office. His left hind leg is clearly broken and he can't stand up.",
        agent: "VANGUARD Animal First Response online. We have your location behind Gram Panchayat Ward 2. Is the dog showing any signs of aggression or trying to bite?",
      },
      {
        caller: "No, he's very gentle but whimpering in pain. He seems terrified and shivering.",
        agent: "Do not attempt to pull his injured leg. If you have a dupatta, towel, or jacket, gently drape it over his back to keep him warm and calm. Our mobile rescue van is 8 minutes away with splints and sedation.",
      },
      {
        caller: "I covered him with a dry shawl. He calmed down a bit. Can I give him milk or water?",
        agent: "Offer a small shallow bowl of fresh water nearby, but do not force him to drink or eat in case he requires emergency orthopedic surgery. Rescue team Pooja and Dr. Sharma are arriving now.",
      },
      {
        caller: "The white rescue van with the green cross just arrived! Thank you so much!",
        agent: "Case logged and registered under Animal Rescue Ticket #AR-9021. Dispatch complete.",
      },
    ],
  },
  {
    id: "lpg_gas_leak",
    title: "LPG Gas Leak near Primary School Canteen",
    category: "Public Safety / Hazmat",
    urgency: "Critical",
    iconName: "Flame",
    description: "Strong smell of commercial LPG gas cylinder leakage adjacent to school cafeteria during morning hours.",
    callerName: "Sunita Devi (Headmistress)",
    callerLocation: "Government Primary School, Mandya Rural",
    initialCallerAudioText: "VANGUARD Dispatch, urgent emergency! We smell intense cooking gas around the canteen kitchen right next to two primary classrooms! About 60 children are inside!",
    recommendedUnit: "Rapid Hazmat & Fire Tender 1 + Gas Line Isolation Squad",
    simulatedConversation: [
      {
        caller: "VANGUARD Dispatch, urgent emergency! We smell intense cooking gas around the canteen kitchen right next to two primary classrooms! About 60 children are inside!",
        agent: "Mandatory emergency action. Do NOT turn on or off any electric switches, fans, or lights. Evacuate all children immediately to the open football ground upwind. Dispatching Fire Tender 1 right now.",
      },
      {
        caller: "All teachers are moving children out toward the open playground right now. No switches touched.",
        agent: "Outstanding. Can anyone safely approach the cylinder from outside without breathing fumes to shut the brass regulator valve, or is the odor too strong?",
      },
      {
        caller: "Too strong inside the kitchen room, we kept the windows wide open from outside with a pole.",
        agent: "Leave it alone and stay at least 50 meters back. Hazmat Fire Tender 1 is 3 minutes out with foam spray and gas detectors.",
      },
      {
        caller: "Fire department truck has entered the school gate! They are isolating the kitchen.",
        agent: "Site secured by Mandya Fire Command. Incident status updated to Mitigated. Zero casualties.",
      },
    ],
  },
  {
    id: "transformer_fire",
    title: "High-Voltage Transformer Fire & Exposed Cable",
    category: "Electrical",
    urgency: "Critical",
    iconName: "Zap",
    description: "Substation step-down transformer sparking violently with burning mineral oil and a snapped conductor lying across the street.",
    callerName: "Ramesh Sharma",
    callerLocation: "Bypass Junction, Rampur East",
    initialCallerAudioText: "Emergency! The 250kVA transformer at the bypass corner just exploded with a loud bang! Black smoke is pouring out and a snapped wire is sparking on the road!",
    recommendedUnit: "DISCOM Substation Emergency Grid Breaker + Chemical Fire Unit",
    simulatedConversation: [
      {
        caller: "Emergency! The 250kVA transformer at the bypass corner just exploded with a loud bang! Black smoke is pouring out and a snapped wire is sparking on the road!",
        agent: "Warning: High voltage threat. Keep yourself and all bystanders at least 15 meters away from the fallen conductor. Do not attempt to extinguish with water. Initiating remote substation grid trip.",
      },
      {
        caller: "People are stopping on motorbikes! I am waving them back!",
        agent: "Keep shouting for them to stay back. The feeder substation 33kV circuit breaker has been remotely tripped by state dispatch. Line is de-energized. Emergency lineman truck ETA 5 minutes.",
      },
      {
        caller: "The sparks stopped when the power cut off. Black oil smoke is still rising from the transformer casing.",
        agent: "Chemical foam tender and certified lineman Sunil are pulling up to your location now. Area isolation active.",
      },
    ],
  },
  {
    id: "elderly_cardiac",
    title: "Elderly Patient Severe Chest Pain & Breathing Distress",
    category: "Medical",
    urgency: "Critical",
    iconName: "HeartPulse",
    description: "72-year-old male experiencing crushing substernal chest pressure, cold sweat, and progressive cyanosis.",
    callerName: "Kavitha Hegde",
    callerLocation: "House 14, Main Bazaar, Shivamogga",
    initialCallerAudioText: "My father-in-law suddenly collapsed into his chair clutching his chest! He says an elephant is sitting on his chest and his lips look bluish!",
    recommendedUnit: "Cardiac Care Ambulance Unit 1 (Shivamogga Civil Hospital)",
    simulatedConversation: [
      {
        caller: "My father-in-law suddenly collapsed into his chair clutching his chest! He says an elephant is sitting on his chest and his lips look bluish!",
        agent: "Critical cardiac alert. Keep him sitting upright, propped up with pillows. Loosen collar and shirt buttons immediately. Never let him lie flat. Advanced Life Support ambulance is dispatched with doctor on board, ETA 4 minutes.",
      },
      {
        caller: "He is seated upright now. Is he allowed to have water?",
        agent: "No water or solid food. If he is conscious and not allergic to aspirin, give him one 300mg Disprin/aspirin tablet to chew, not swallow whole. If he becomes unresponsive, be ready for CPR.",
      },
      {
        caller: "Gave him the chewable aspirin. He is still breathing, breathing seems a little less panicked.",
        agent: "The cardiac ambulance has reached your street. Parameds entering your front door now with oxygen and ECG monitor.",
      },
    ],
  },
];

export function getEmergencyScenarios(): CallScenario[] {
  return PRESET_CALL_SCENARIOS;
}

export interface VoiceCallTurnResult {
  reply: string;
  extractedLocation?: string;
  urgency: "Critical" | "High" | "Moderate";
  category?: string;
  incidentSummary?: string;
  dispatchTriggered: boolean;
  assignedUnit?: string;
  etaMinutes?: number;
  safetyInstructions: string[];
}

import {
  TriageDomain,
  TriageCode,
  EmergencyFacility,
  TriageEvaluation,
} from "@/lib/types";

// Registered Emergency Facilities for Human Medical Services
export const HUMAN_EMERGENCY_FACILITIES: Record<string, EmergencyFacility[]> = {
  Rampur: [
    {
      id: "hosp_rampur_1",
      name: "Rampur District Civil Hospital (24/7 ICU & Trauma)",
      type: "Hospital",
      location: "Civil Lines, Rampur",
      district: "Rampur",
      phone: "0595-2345678",
      distanceKm: 3.2,
      availableAmbulance: true,
      operatingHours: "24/7 Emergency",
    },
    {
      id: "hosp_rampur_2",
      name: "Primary Health Center (PHC) Emergency Care",
      type: "PHC",
      location: "Bypass Ward 4, Rampur",
      district: "Rampur",
      phone: "108",
      distanceKm: 1.5,
      availableAmbulance: true,
      operatingHours: "24/7 Casualty",
    },
  ],
  Sitapur: [
    {
      id: "hosp_sitapur_1",
      name: "Sitapur District Memorial Hospital",
      type: "Hospital",
      location: "Station Road, Sitapur",
      district: "Sitapur",
      phone: "05862-246810",
      distanceKm: 2.8,
      availableAmbulance: true,
      operatingHours: "24/7 Trauma Unit",
    },
    {
      id: "hosp_sitapur_2",
      name: "Rural PHC Emergency Response Post",
      type: "PHC",
      location: "North Gate, Sitapur",
      district: "Sitapur",
      phone: "102",
      distanceKm: 4.1,
      availableAmbulance: true,
      operatingHours: "24/7",
    },
  ],
  Mandya: [
    {
      id: "hosp_mandya_1",
      name: "Mandya Institute of Medical Sciences (MIMS Hospital)",
      type: "Hospital",
      location: "Bangalore-Mysore Highway, Mandya",
      district: "Mandya",
      phone: "08232-224086",
      distanceKm: 2.1,
      availableAmbulance: true,
      operatingHours: "24/7 Level 1 Trauma",
    },
  ],
  Shivamogga: [
    {
      id: "hosp_shivamogga_1",
      name: "McGANN District Teaching Hospital",
      type: "Hospital",
      location: "Sagar Road, Shivamogga",
      district: "Shivamogga",
      phone: "08182-229933",
      distanceKm: 3.0,
      availableAmbulance: true,
      operatingHours: "24/7 Emergency & ICU",
    },
  ],
};

// Registered Animal Shelters, NGOs and Veterinary Hospitals
export const VETERINARY_FACILITIES: Record<string, EmergencyFacility[]> = {
  Rampur: [
    {
      id: "vet_rampur_1",
      name: "Karuna Animal Rescue & Mobile Ambulance",
      type: "NGO Animal Shelter",
      location: "Kosi Bypass Road, Rampur",
      district: "Rampur",
      phone: "+91-98765-99881",
      distanceKm: 2.4,
      availableAmbulance: true,
      operatingHours: "24/7 Rescue Dispatch",
    },
    {
      id: "vet_rampur_2",
      name: "Government Veterinary Polyclinic & Animal Surgery",
      type: "Veterinary Hospital",
      location: "Civil Lines, Rampur",
      district: "Rampur",
      phone: "0595-2349911",
      distanceKm: 3.8,
      availableAmbulance: false,
      operatingHours: "08:00 AM - 08:00 PM (Emergency on Call)",
    },
  ],
  Sitapur: [
    {
      id: "vet_sitapur_1",
      name: "Voice for Stray Animals (Sitapur Rescue Shelter)",
      type: "NGO Animal Shelter",
      location: "Near Railway Crossing, Sitapur",
      district: "Sitapur",
      phone: "+91-94560-01122",
      distanceKm: 3.5,
      availableAmbulance: true,
      operatingHours: "24/7 Animal SOS",
    },
    {
      id: "vet_sitapur_2",
      name: "Sitapur Animal Care Trust & Dispensary",
      type: "Veterinary Hospital",
      location: "Town Hall, Sitapur",
      district: "Sitapur",
      phone: "05862-251234",
      distanceKm: 4.6,
      availableAmbulance: true,
      operatingHours: "09:00 AM - 07:00 PM",
    },
  ],
  Mandya: [
    {
      id: "vet_mandya_1",
      name: "People For Animals (PFA) Mandya Chapter",
      type: "NGO Animal Shelter",
      location: "Sugar Mill Road, Mandya",
      district: "Mandya",
      phone: "+91-98450-44332",
      distanceKm: 3.1,
      availableAmbulance: true,
      operatingHours: "24/7 Stray Rescue",
    },
  ],
  Shivamogga: [
    {
      id: "vet_shivamogga_1",
      name: "Western Ghats Wildlife & Animal Rescue Center",
      type: "Wildlife Rescue",
      location: "Tyavarekoppa Road, Shivamogga",
      district: "Shivamogga",
      phone: "+91-99800-77665",
      distanceKm: 5.2,
      availableAmbulance: true,
      operatingHours: "24/7 Forest & Stray Rescue",
    },
  ],
};

/**
 * Human Medical Triage Evaluator
 */
export function evaluateHumanTriage(
  symptoms: string[],
  district: string = "Rampur",
  additionalNotes: string = ""
): TriageEvaluation {
  const combined = (symptoms.join(" ") + " " + additionalNotes).toLowerCase();

  const facilities = HUMAN_EMERGENCY_FACILITIES[district] || HUMAN_EMERGENCY_FACILITIES["Rampur"];

  // Code Red: Unconscious, cardiac, severe arterial bleeding, respiratory arrest
  if (
    combined.includes("unconscious") ||
    combined.includes("not breathing") ||
    combined.includes("chest pain") ||
    combined.includes("cardiac") ||
    combined.includes("heavy bleeding") ||
    combined.includes("arterial") ||
    combined.includes("choking")
  ) {
    return {
      domain: "human",
      patientType: "Adult / Pediatric Casualty",
      severity: "Code Red",
      priorityScore: 98,
      dangerSigns: [
        "Immediate threat to vital life functions (airway/breathing/circulation)",
        "Severe cerebral hypoxia or hemorrhagic shock potential",
      ],
      firstAidSteps: [
        {
          step: 1,
          title: "Check Responsiveness & Breathing",
          detail: "Tap the shoulders firmly and shout 'Are you okay?'. Look for chest rise for no more than 10 seconds.",
          warning: "If unresponsive and NOT breathing normally, begin CPR immediately.",
        },
        {
          step: 2,
          title: "Interactive CPR (Cardiopulmonary Resuscitation)",
          detail: "Place heel of hand in center of chest. Interlock fingers. Push hard and fast (2 inches deep, 100-120 beats per minute) following our audio metronome. 30 compressions followed by 2 rescue breaths.",
          warning: "Do not stop compressions until medical personnel take over or patient shows clear signs of life.",
        },
        {
          step: 3,
          title: "Hemorrhage Control (if bleeding)",
          detail: "Place clean thick gauze directly over wound and apply continuous, heavy body-weight pressure. Do not release pressure to check.",
          warning: "If limb bleeding is catastrophic and uncontrolled, apply improvised tourniquet 2-3 inches above wound.",
        },
      ],
      matchedFacilities: facilities,
      requiresImmediateSos: true,
      disclaimer: "VANGUARD First-Response Guidance is intended for rapid civilian triage while emergency medical services (108/112) are en route. It does not replace clinical physician care.",
    };
  }

  // Code Orange: Suspected fracture, severe burn, deep laceration, heatstroke
  if (
    combined.includes("burn") ||
    combined.includes("fracture") ||
    combined.includes("broken bone") ||
    combined.includes("heatstroke") ||
    combined.includes("high fever") ||
    combined.includes("head injury")
  ) {
    return {
      domain: "human",
      patientType: "Trauma / Acute Illness",
      severity: "Code Orange",
      priorityScore: 82,
      dangerSigns: [
        "Severe pain with potential secondary systemic deterioration",
        "Risk of deep infection or thermal tissue damage",
      ],
      firstAidSteps: [
        {
          step: 1,
          title: "For Burns: Immediate Cool Water Flush",
          detail: "Run gently flowing room-temperature tap water over the burn for 10-15 minutes immediately. Never use ice, toothpaste, or oil.",
          warning: "Do not burst blisters or pull clothing stuck to burnt skin.",
        },
        {
          step: 2,
          title: "For Fractures: Immobilize the Limb",
          detail: "Support the broken limb in the position found using rolled towels, cardboard, or a splint. Avoid moving the joint above and below the injury.",
        },
        {
          step: 3,
          title: "For Heatstroke: Rapid Shaded Cooling",
          detail: "Move patient into shade, fan vigorously, loosen clothing, and sponge forehead, neck, and armpits with cool wet cloth. Give sips of ORS if conscious.",
        },
      ],
      matchedFacilities: facilities,
      requiresImmediateSos: true,
      disclaimer: "VANGUARD First-Response Guidance is intended for rapid civilian triage while emergency medical services (108/112) are en route.",
    };
  }

  // Code Yellow / Green: Minor cuts, mild dehydration, basic first-aid
  return {
    domain: "human",
    patientType: "Non-Critical First-Aid",
    severity: "Code Yellow",
    priorityScore: 54,
    dangerSigns: ["Mild discomfort, monitor for infection or worsening fever"],
    firstAidSteps: [
      {
        step: 1,
        title: "Cleanse with Clean Water",
        detail: "Gently flush minor cuts with clean boiled-and-cooled water or sterile saline. Pat dry with sterile cloth.",
      },
      {
        step: 2,
        title: "Apply Antiseptic & Clean Dressing",
        detail: "Apply povidone-iodine antiseptic ointment and cover with sterile adhesive bandage.",
      },
      {
        step: 3,
        title: "Hydration & Rest",
        detail: "Administer Oral Rehydration Solution (ORS) or electrolyte fluids. Rest in well-ventilated area.",
      },
    ],
    matchedFacilities: facilities,
    requiresImmediateSos: false,
    disclaimer: "Standard home first-aid guidance. If symptoms worsen or infection develops, visit the local Primary Health Center.",
  };
}

/**
 * Veterinary & Animal Rescue Triage Evaluator
 */
export function evaluateVeterinaryTriage(
  species: string,
  injuryType: string,
  district: string = "Rampur",
  additionalNotes: string = ""
): TriageEvaluation {
  const combined = `${species} ${injuryType} ${additionalNotes}`.toLowerCase();
  const facilities = VETERINARY_FACILITIES[district] || VETERINARY_FACILITIES["Rampur"];

  // Code Red: Hit-and-run, suspected poisoning, heavy hemorrhage, bovine severe trauma
  if (
    combined.includes("hit and run") ||
    combined.includes("vehicle") ||
    combined.includes("poison") ||
    combined.includes("bleeding heavily") ||
    combined.includes("unresponsive") ||
    combined.includes("seizure")
  ) {
    return {
      domain: "veterinary",
      patientType: `${species} (Trauma Casualty)`,
      severity: "Code Red",
      priorityScore: 94,
      dangerSigns: [
        "Acute hypovolemic shock or neurotoxin ingestion",
        "High risk of pain-induced panic bites or fatal hypothermia",
      ],
      firstAidSteps: [
        {
          step: 1,
          title: "Safety First: Improvised Muzzle / Restraint",
          detail: "Even gentle animals will bite when in severe pain. For dogs: loop a soft strip of cloth or bandage over the snout, cross under the chin, and tie securely behind ears. (Do NOT muzzle if animal is vomiting or choking). For cats: wrap body securely in a thick towel like a burrito.",
          warning: "Never put your face directly near an injured animal's mouth.",
        },
        {
          step: 2,
          title: "Stabilization & Shock Management",
          detail: "Cover the animal gently with a warm, dry blanket to maintain core temperature. Place on a flat cardboard or wooden board for stretcher transport.",
          warning: "Do not attempt to feed solids or water by force.",
        },
        {
          step: 3,
          title: "Poisoning Protocol (if applicable)",
          detail: "If toxic bait ingestion is suspected, identify the substance if safe. Do NOT induce vomiting if acidic, battery fluid, or petroleum was swallowed. Rush directly to nearest veterinarian with activated charcoal.",
        },
      ],
      matchedFacilities: facilities,
      requiresImmediateSos: true,
      disclaimer: "Emergency animal rescue guidance. Professional veterinary intervention is strictly required for bone setting, surgical suturing, and antivenom administration.",
    };
  }

  // Bovine / Cattle & Livestock Emergency (Afra / Bloat, Foot & Mouth, Milk Fever, Dehydration)
  if (
    species.toLowerCase().includes("bovine") ||
    species.toLowerCase().includes("cow") ||
    species.toLowerCase().includes("cattle") ||
    species.toLowerCase().includes("buffalo") ||
    combined.includes("gaay") ||
    combined.includes("bloat") ||
    combined.includes("afra") ||
    combined.includes("fmd") ||
    combined.includes("fever")
  ) {
    const isBloat = combined.includes("bloat") || combined.includes("afra") || combined.includes("swollen belly");
    return {
      domain: "veterinary",
      patientType: "Bovine / Cattle Emergency (Pashu Swasthya)",
      severity: isBloat ? "Code Red" : "Code Orange",
      priorityScore: isBloat ? 95 : 82,
      dangerSigns: [
        isBloat
          ? "Rumen distension causing severe lung compression and asphyxiation within 1-2 hours"
          : "Rapid dehydration, drop in milk yield, and contagious herd transmission risk",
        "High danger of recumbency and inability to stand",
      ],
      firstAidSteps: [
        {
          step: 1,
          title: isBloat ? "Immediate Anti-Bloat Intervention (Tympany / Afra)" : "Isolation & Comfort",
          detail: isBloat
            ? "Administer 500ml mustard oil mixed with 30ml turpentine oil orally via drenching bottle. Keep animal standing with front feet elevated on a mound to relieve diaphragm pressure. Place a wooden bit in mouth to induce belching."
            : "Separate sick cow from herd immediately. Provide soft, digestible green fodder and fresh cool drinking water mixed with jaggery and electrolytes.",
          warning: isBloat ? "Do NOT allow cattle to sit or lie down on left side. If animal collapses gasping, emergency trocarization by a vet is required immediately." : "Do not force-feed grain or concentrates.",
        },
        {
          step: 2,
          title: "Hoof & Mouth Protocol (if ulcers/salivation)",
          detail: "Wash mouth lesions and hooves twice daily with 1% potassium permanganate (Lal Dawai) solution or neem decoction. Apply boric acid with glycerin to oral sores.",
        },
        {
          step: 3,
          title: "Dispatch Mobile Veterinary Unit (Helpline 1962)",
          detail: "Call National Animal Emergency Helpline 1962 or dispatch local veterinary officer via the 1-Click SOS button below for antibiotic and calcium/saline injection.",
        },
      ],
      matchedFacilities: facilities,
      requiresImmediateSos: true,
      disclaimer: "Bovine emergency first response. Contact National Animal Helpline 1962 or your local veterinary dispensary immediately.",
    };
  }

  // Code Orange: Limb fracture, severe maggot wound, dehydrated stray
  return {
    domain: "veterinary",
    patientType: `${species} (Orthopedic / Wound Management)`,
    severity: "Code Orange",
    priorityScore: 76,
    dangerSigns: [
      "Open fracture prone to septic bone infection",
      "Tissue necrosis from maggot infestations",
    ],
    firstAidSteps: [
      {
        step: 1,
        title: "Immobilize without Forcing Alignment",
        detail: "Do not attempt to push bone fragments back into place. Wrap the injured limb in cotton or rolled cloth, then support with rigid cardboard on the outer side and tape gently.",
      },
      {
        step: 2,
        title: "Maggot Wound First Aid",
        detail: "Spray turpentine oil or neem oil directly onto infected wound to expel larvae. Cover lightly with sterile gauze to prevent fly access.",
        warning: "Do not apply harsh chemicals like kerosene directly to deep open muscle wounds.",
      },
      {
        step: 3,
        title: "Safe Rescue Dispatch Mobilization",
        detail: "Alert registered animal volunteers via the button below to bring a transport crate and antiseptic kit.",
      },
    ],
    matchedFacilities: facilities,
    requiresImmediateSos: true,
    disclaimer: "Animal welfare triage protocol. Connect immediately with registered rescue personnel.",
  };
}

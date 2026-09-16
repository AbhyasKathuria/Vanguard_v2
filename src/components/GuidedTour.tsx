"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Play,
  Users,
  ShieldCheck,
  Sliders,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface TourTranslations {
  title: string;
  subtitle: string;
  stepPrefix: string;
  ofPrefix: string;
  prevBtn: string;
  nextBtn: string;
  actorLabel: string;
}

const TOUR_I18N: Record<string, TourTranslations> = {
  en: {
    title: "2-Minute Evaluator Guided Tour",
    subtitle: "Step-by-step walkthrough demonstrating the full end-to-end rural dispatch lifecycle.",
    stepPrefix: "Step",
    ofPrefix: "of",
    prevBtn: "Previous",
    nextBtn: "Next Step",
    actorLabel: "Actor",
  },
  hi: {
    title: "2-मिनट मार्गदर्शित मूल्यांकन टूर",
    subtitle: "ग्रामीण सेवा प्रेषण जीवनचक्र का चरण-दर-चरण विस्तृत प्रदर्शन।",
    stepPrefix: "चरण",
    ofPrefix: "का",
    prevBtn: "पिछला",
    nextBtn: "अगला चरण",
    actorLabel: "भूमिका",
  },
  kn: {
    title: "2-ನಿಮಿಷಗಳ ಮೌಲ್ಯಮಾಪನ ಪ್ರವಾಸ",
    subtitle: "ಗ್ರಾಮೀಣ ಸೇವಾ ರವಾನೆಯ ಸಂಪೂರ್ಣ ಹಂತ-ಹಂತದ ಪ್ರಾತ್ಯಕ್ಷಿಕೆ.",
    stepPrefix: "ಹಂತ",
    ofPrefix: "ರಲ್ಲಿ",
    prevBtn: "ಹಿಂದಿನ",
    nextBtn: "ಮುಂದಿನ ಹಂತ",
    actorLabel: "ಪಾತ್ರ",
  },
  ta: {
    title: "2-நிமிட வழிகாட்டப்பட்ட மதிப்பீட்டுப் பயணம்",
    subtitle: "கிராமப்புற சேவை ஒதுக்கீட்டின் முழுமையான படிநிலை செயல்முறை விளக்கம்.",
    stepPrefix: "படி",
    ofPrefix: "இல்",
    prevBtn: "முந்தைய",
    nextBtn: "அடுத்த படி",
    actorLabel: "செயலாளர்",
  },
  te: {
    title: "2-నిమిషాల మార్గదర్శక మూల్యాంకన పర్యటన",
    subtitle: "గ్రామీణ సేవా పంపిణీ పూర్తి ప్రక్రియ దశలవారీ ప్రదర్శన.",
    stepPrefix: "దశ",
    ofPrefix: "లో",
    prevBtn: "మునుపటి",
    nextBtn: "తదుపరి దశ",
    actorLabel: "పాత్ర",
  },
  bn: {
    title: "২-মিনিটের নির্দেশিত মূল্যায়ন ভ্রমণ",
    subtitle: "গ্রামীণ সেবা প্রেরণের সম্পূর্ণ প্রক্রিয়ার ধাপে ধাপে প্রদর্শনী।",
    stepPrefix: "ধাপ",
    ofPrefix: "এর",
    prevBtn: "পূর্ববর্তী",
    nextBtn: "পরবর্তী ধাপ",
    actorLabel: "অভিনেতা",
  },
  mr: {
    title: "२-मिनिटांचा मार्गदर्शित दौरा",
    subtitle: "ग्रामीण सेवा वितरण प्रक्रियेचे टप्प्याटप्प्याने प्रात्यक्षिक.",
    stepPrefix: "टप्पा",
    ofPrefix: "पैकी",
    prevBtn: "मागील",
    nextBtn: "पुढील टप्पा",
    actorLabel: "पात्र",
  },
  es: {
    title: "Recorrido Guiado de Evaluación de 2 Minutos",
    subtitle: "Demostración paso a paso del ciclo completo de despacho rural.",
    stepPrefix: "Paso",
    ofPrefix: "de",
    prevBtn: "Anterior",
    nextBtn: "Siguiente Paso",
    actorLabel: "Actor",
  },
  fr: {
    title: "Visite Guidée d'Évaluation de 2 Minutes",
    subtitle: "Démonstration étape par étape du cycle complet de répartition rurale.",
    stepPrefix: "Étape",
    ofPrefix: "sur",
    prevBtn: "Précédent",
    nextBtn: "Étape Suivante",
    actorLabel: "Acteur",
  },
  de: {
    title: "2-Minuten-Geführte Evaluierungstour",
    subtitle: "Schritt-für-Schritt-Demonstration des ländlichen Service-Routing-Prozesses.",
    stepPrefix: "Schritt",
    ofPrefix: "von",
    prevBtn: "Zurück",
    nextBtn: "Nächster Schritt",
    actorLabel: "Akteur",
  },
  ar: {
    title: "جولة تقييم إرشادية مدتها دقيقتان",
    subtitle: "عرض توضيحي خطوة بخطوة لدورة حياة توجيه الخدمات الريفية الشاملة.",
    stepPrefix: "الخطوة",
    ofPrefix: "من",
    prevBtn: "السابق",
    nextBtn: "الخطوة التالية",
    actorLabel: "المسؤول",
  },
};

export default function GuidedTour() {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);

  const i18n = TOUR_I18N[locale] || TOUR_I18N[locale.split("-")[0]] || TOUR_I18N.en;

  const steps = [
    {
      title: locale === "hi"
        ? "चरण 1: नागरिक द्वारा समस्या दर्ज करना और प्राथमिकता निर्धारण"
        : locale === "kn"
        ? "ಹಂತ 1: ನಾಗರಿಕರಿಂದ ಸಮಸ್ಯೆ ಸಲ್ಲಿಕೆ ಮತ್ತು ಆದ್ಯತೆ ನಿರ್ಣಯ"
        : locale === "ta"
        ? "படி 1: குடிமக்கள் கோரிக்கை சமர்ப்பித்தல் & முன்னுரிமை ஒதுக்கீடு"
        : locale === "es"
        ? "Paso 1: Envío de Problema Ciudadano y Mapeo de Prioridad"
        : "Step 1: Citizen Issue Submission & Priority Mapping",
      role: "citizen",
      phone: "9876543210",
      targetPath: "/citizen/new-request",
      actor: "Ramesh Sharma (Citizen, Rampur)",
      description: locale === "hi"
        ? "नागरिक रमेश के रूप में लॉग इन करें। साधारण शब्दों में सेवा अनुरोध दर्ज करें (जैसे: 'गाँव के स्कूल के पास बिजली का तार टूट गया है')। सिस्टम प्राथमिकता को मध्यम में मैप करता है।"
        : locale === "kn"
        ? "ನಾಗರಿಕ ರಮೇಶ್ ಆಗಿ ಲಾಗಿನ್ ಆಗಿ. ಸಾಮಾನ್ಯ ಪಠ್ಯದಲ್ಲಿ ಸಮಸ್ಯೆಯನ್ನು ಸಲ್ಲಿಸಿ. ವ್ಯವಸ್ಥೆಯು ಆದ್ಯತೆಯನ್ನು ನಿಗದಿಪಡಿಸುತ್ತದೆ."
        : locale === "es"
        ? "Inicie sesión como el ciudadano Ramesh. Envíe una solicitud en texto sencillo. El motor evalúa y asigna prioridad MEDIA."
        : "Log in as Citizen Ramesh. Submit a service request in plain text (e.g. 'Broken electrical wire near village school'). The engine evaluates the category and maps it to MEDIUM Priority.",
      actionLabel: locale === "hi"
        ? "चरण 1 का डेमो शुरू करें (नागरिक पोर्टल)"
        : locale === "kn"
        ? "ಹಂತ 1 ಡೆಮೊ ಪ್ರಾರಂಭಿಸಿ (ನಾಗರಿಕ ಪೋರ್ಟಲ್)"
        : locale === "es"
        ? "Iniciar Demo Paso 1 (Portal Ciudadano)"
        : "Launch Step 1 Demo (Citizen Portal)",
    },
    {
      title: locale === "hi"
        ? "चरण 2: निकटतम सत्यापित कार्यकर्ता का स्वचालित आवंटन"
        : locale === "kn"
        ? "ಹಂತ 2: ಹತ್ತಿರದ ಪರಿಶೀಲಿಸಿದ ಕಾರ್ಯಕರ್ತನಿಗೆ ಸ್ವಯಂಚಾಲಿತ ನಿಯೋಜನೆ"
        : locale === "es"
        ? "Paso 2: Asignación Determinista al Candidato Más Cercano"
        : "Step 2: Deterministic Nearest-Candidate Dispatch",
      role: "citizen",
      phone: "9876543210",
      targetPath: "/citizen/request/req_101",
      actor: "Deterministic Routing Engine & Geocoder",
      description: locale === "hi"
        ? "देखें कि कैसे सिस्टम हैवर्सिन दूरी (< 15 किमी) की गणना करता है और निकटतम सत्यापित इलेक्ट्रीशियन सुनील को स्वचालित रूप से आवंटित करता है।"
        : locale === "kn"
        ? "ವ್ಯವಸ್ಥೆಯು ದೂರವನ್ನು ಲೆಕ್ಕಹಾಕಿ ಹತ್ತಿರದ ಪರಿಶೀಲಿಸಿದ ಕಾರ್ಮಿಕನಿಗೆ ಸ್ವಯಂ-ನಿಯೋಜಿಸುವುದನ್ನು ವೀಕ್ಷಿಸಿ."
        : locale === "es"
        ? "Observe cómo el motor calcula la distancia Haversine y auto-asigna al electricista verificado más cercano (Sunil)."
        : "Observe how the engine computes Haversine distance (< 15km) and auto-assigns the nearest verified worker (Sunil Electrician). Inspect the live Leaflet GIS map with dispatch coverage radius.",
      actionLabel: locale === "hi"
        ? "लाइव टाइमलाइन और जीआईएस पिन देखें"
        : locale === "kn"
        ? "ಲೈವ್ ಟೈಮ್‌ಲೈನ್ ಮತ್ತು ಜಿಐಎಸ್ ಪಿನ್ ವೀಕ್ಷಿಸಿ"
        : locale === "es"
        ? "Ver Línea de Tiempo y Mapa GIS"
        : "View Live Request Timeline & GIS Pin",
    },
    {
      title: locale === "hi"
        ? "चरण 3: कार्यकर्ता की प्रगति और कार्य समाधान"
        : locale === "kn"
        ? "ಹಂತ 3: ಕಾರ್ಯಕರ್ತನ ಕೆಲಸದ ಪ್ರಗತಿ ಮತ್ತು ಪರಿಹಾರ"
        : locale === "es"
        ? "Paso 3: Progreso del Trabajador y Resolución en Sitio"
        : "Step 3: Worker Progress & Site Resolution",
      role: "worker",
      phone: "9876543211",
      targetPath: "/worker/dashboard",
      actor: "Sunil Electrician (Verified Field Worker)",
      description: locale === "hi"
        ? "सुनील इलेक्ट्रीशियन के रूप में लॉग इन करें। मौसम सलाह की जांच करें, 'कार्य प्रारंभ' और फिर 'पूर्ण' दर्ज करें।"
        : locale === "kn"
        ? "ಸುನಿಲ್ ಎಲೆಕ್ಟ್ರಿಷಿಯನ್ ಆಗಿ ಲಾಗಿನ್ ಆಗಿ. ಕೆಲಸ ಪ್ರಾರಂಭಿಸಿ ಮತ್ತು ಪೂರ್ಣಗೊಳಿಸಿ."
        : locale === "es"
        ? "Inicie sesión como el electricista Sunil. Revise el clima, inicie el trabajo y márquelo como resuelto."
        : "Log in as Sunil Electrician. Check the live weather advisory for storm risks, click 'Start Work' (IN_PROGRESS), and then 'Mark Complete' (RESOLVED) with an on-site resolution note.",
      actionLabel: locale === "hi"
        ? "चरण 3 का डेमो शुरू करें (कार्यकर्ता डैशबोर्ड)"
        : locale === "kn"
        ? "ಹಂತ 3 ಡೆಮೊ ಪ್ರಾರಂಭಿಸಿ (ಕಾರ್ಯಕರ್ತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್)"
        : locale === "es"
        ? "Iniciar Demo Paso 3 (Panel Trabajador)"
        : "Launch Step 3 Demo (Worker Dashboard)",
    },
    {
      title: locale === "hi"
        ? "चरण 4: स्थानीय प्राधिकरण समीक्षा और सत्यापन गेट"
        : locale === "kn"
        ? "ಹಂತ 4: ಸ್ಥಳೀಯ ಪ್ರಾಧಿಕಾರದ ಪರಿಶೀಲನೆ ಮತ್ತು ಗೇಟ್"
        : locale === "es"
        ? "Paso 4: Triaje de Autoridad Local y Puerta de Verificación"
        : "Step 4: Local Authority Triage & Verification Gate",
      role: "authority",
      phone: "9876543213",
      targetPath: "/authority/dashboard",
      actor: "Officer Suresh Verma (Local Authority, Rampur)",
      description: locale === "hi"
        ? "स्थानीय प्राधिकरण अधिकारी के रूप में लॉग इन करें। लंबित अनुरोधों की समीक्षा करें और कार्यकर्ताओं को सत्यापित करें।"
        : locale === "kn"
        ? "ಸ್ಥಳೀಯ ಪ್ರಾಧಿಕಾರಿಯಾಗಿ ಲಾಗಿನ್ ಆಗಿ. ವಿನಂತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸಿಬ್ಬಂದಿಯನ್ನು ಪರಿಶೀಲಿಸಿ."
        : locale === "es"
        ? "Inicie sesión como Autoridad Local. Revise solicitudes abiertas y verifique personal de campo."
        : "Log in as Local Authority. Review open requests awaiting triage, manually assign staff across villages, and toggle personnel verification status (enforcing the Hard Gate).",
      actionLabel: locale === "hi"
        ? "चरण 4 का डेमो शुरू करें (प्राधिकरण केंद्र)"
        : locale === "kn"
        ? "ಹಂತ 4 ಡೆಮೊ ಪ್ರಾರಂಭಿಸಿ (ಪ್ರಾಧಿಕಾರ ಕೇಂದ್ರ)"
        : locale === "es"
        ? "Iniciar Demo Paso 4 (Centro Autoridad)"
        : "Launch Step 4 Demo (Authority Center)",
    },
    {
      title: locale === "hi"
        ? "चरण 5: सुपर एडमिन राज्य-स्तरीय निगरानी और एपीआई टेलीमेट्री"
        : locale === "kn"
        ? "ಹಂತ 5: ಸೂಪರ್ ಅಡ್ಮಿನ್ ರಾಜ್ಯ ಮೇಲ್ವಿಚಾರಣೆ"
        : locale === "es"
        ? "Paso 5: Supervisión Estatal del Super Admin y Diagnósticos API"
        : "Step 5: Super Admin State Oversight & API Diagnostics",
      role: "super_admin",
      phone: "9876543200",
      targetPath: "/superadmin/dashboard",
      actor: "Officer Rajeshwar Rao (Super Admin, State HQ)",
      description: locale === "hi"
        ? "सुपर एडमिन के रूप में लॉग इन करें। सभी 6 जिलों के प्रदर्शन और 6 एकीकृत एपीआई की लाइव स्थिति देखें।"
        : locale === "kn"
        ? "ಸೂಪರ್ ಅಡ್ಮಿನ್ ಆಗಿ ಲಾಗಿನ್ ಆಗಿ. ಎಲ್ಲಾ 6 ಜಿಲ್ಲೆಗಳ ಪ್ರಗತಿ ಮತ್ತು ಎಪಿಐ ಸ್ಥಿತಿಯನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ."
        : locale === "es"
        ? "Inicie sesión como Super Admin. Monitoree las 6 regiones y los diagnósticos de API en tiempo real."
        : "Log in as Super Admin. Monitor aggregate resolution rates across all 6 districts (Rampur, Sitapur, Mandya, Shivamogga, Kolar, Belagavi) and inspect real-time API adapter diagnostics.",
      actionLabel: locale === "hi"
        ? "चरण 5 का डेमो शुरू करें (सुपर एडमिन मुख्यालय)"
        : locale === "kn"
        ? "ಹಂತ 5 ಡೆಮೊ ಪ್ರಾರಂಭಿಸಿ (ಸೂಪರ್ ಅಡ್ಮಿನ್ ಹೆಡ್‌ಕ್ವಾರ್ಟರ್ಸ್)"
        : locale === "es"
        ? "Iniciar Demo Paso 5 (HQ Super Admin)"
        : "Launch Step 5 Demo (Super Admin HQ)",
    },
    {
      title: locale === "hi"
        ? "चरण 6: व्हाट्सएप बॉट सेवा अनुरोध प्रवाह"
        : locale === "kn"
        ? "ಹಂತ 6: ವಾಟ್ಸಾಪ್ ಬಾಟ್ ಸೇವಾ ಹರಿವು"
        : locale === "es"
        ? "Paso 6: Flujo del Bot de WhatsApp de Bajo Ancho de Banda"
        : "Step 6: Low-Bandwidth WhatsApp Bot Workflow",
      role: "bot",
      phone: "",
      targetPath: "",
      actor: "Meta Cloud API / WhatsApp Simulator",
      description: locale === "hi"
        ? "निचले दाएं कोने में हरे रंग के 'व्हाट्सएप बॉट डेमो' बटन पर क्लिक करें। 'नमस्ते' लिखें और बॉट से अनुरोध दर्ज करें।"
        : locale === "kn"
        ? "ಕೆಳಗಿನ ಬಲ ಮೂಲೆಯಲ್ಲಿರುವ ಹಸಿರು ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ. 'ನಮಸ್ಕಾರ' ಎಂದು ಕಳುಹಿಸಿ."
        : locale === "es"
        ? "Haga clic en el botón verde de WhatsApp en la esquina inferior. Escriba 'Hola' y pruebe el despacho automático."
        : "Click the green 'WhatsApp Bot Demo' button in the bottom right corner. Type 'HI', select category '1', provide issue details, and observe instant bot dispatch & worker SMS resolution.",
      actionLabel: locale === "hi"
        ? "व्हाट्सएप सिम्युलेटर खोलें"
        : locale === "kn"
        ? "ವಾಟ್ಸಾಪ್ ಸಿಮ್ಯುಲೇಟರ್ ತೆರೆಯಿರಿ"
        : locale === "es"
        ? "Abrir Simulador WhatsApp"
        : "Open WhatsApp Simulator",
      isSimulatorTrigger: true,
    },
  ];

  const handleStepAction = async (step: (typeof steps)[0]) => {
    if (step.isSimulatorTrigger) {
      const floatingBtn = document.querySelector('button[title="Open WhatsApp Bot Simulator"]') as HTMLButtonElement;
      if (floatingBtn) floatingBtn.click();
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: step.phone, password: "password123" }),
      });

      if (res.ok) {
        window.location.href = step.targetPath;
      }
    } catch (err) {
      console.error("Step action error:", err);
    }
  };

  const current = steps[activeStep];

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#dcdcdc] shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#262626] text-white p-2 rounded-xl shadow-xs">
            <Compass className="w-5 h-5 text-[#53bdeb]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#262626] flex items-center gap-1.5">
              {i18n.title}
              <Sparkles className="w-4 h-4 text-[#25D366]" />
            </h2>
            <p className="text-xs text-[#707070]">{i18n.subtitle}</p>
          </div>
        </div>

        {/* Step counter */}
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f0f0f0] text-[#404040]">
          {i18n.stepPrefix} {activeStep + 1} {i18n.ofPrefix} {steps.length}
        </span>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-6 gap-1.5">
        {steps.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setActiveStep(idx)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              idx === activeStep
                ? "bg-[#262626] w-full"
                : idx < activeStep
                ? "bg-[#25D366]"
                : "bg-[#e5e5e5]"
            }`}
            title={s.title}
          />
        ))}
      </div>

      {/* Active Step Content Card */}
      <div className="bg-[#f9f9f9] p-5 rounded-2xl border border-[#e5e5e5] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[#262626]">{current.title}</h3>
          <span className="text-[11px] font-semibold text-[#707070] bg-white px-2 py-0.5 rounded-md border border-[#dcdcdc]">
            {i18n.actorLabel}: {current.actor}
          </span>
        </div>

        <p className="text-xs text-[#545454] leading-relaxed">{current.description}</p>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className="px-3 py-1.5 rounded-xl border border-[#dcdcdc] text-xs font-semibold text-[#707070] disabled:opacity-30 bg-white hover:bg-[#f0f0f0] cursor-pointer"
            >
              {i18n.prevBtn}
            </button>
            <button
              onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
              disabled={activeStep === steps.length - 1}
              className="px-3 py-1.5 rounded-xl border border-[#dcdcdc] text-xs font-semibold text-[#707070] disabled:opacity-30 bg-white hover:bg-[#f0f0f0] cursor-pointer"
            >
              {i18n.nextBtn}
            </button>
          </div>

          <button
            onClick={() => handleStepAction(current)}
            className="px-4 py-2 bg-[#262626] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            {current.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

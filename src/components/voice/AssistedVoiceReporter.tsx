"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Camera,
  MapPin,
  Sparkles,
} from "lucide-react";

interface StepQuestion {
  step: number;
  questionHi: string;
  questionEn: string;
  hintHi: string;
  hintEn: string;
  field: "problem" | "location" | "duration" | "media";
}

const QUESTIONS: StepQuestion[] = [
  {
    step: 1,
    questionHi: "क्या समस्या है? (समस्या का नाम बोलें)",
    questionEn: "What is the problem? (Describe the issue)",
    hintHi: "उदा. हैंडपंप खराब है, बिजली का खंभा झुक गया है, सड़क पर गड्ढा है...",
    hintEn: "e.g. Handpump broken, electric pole bent, massive pothole...",
    field: "problem",
  },
  {
    step: 2,
    questionHi: "यह कहाँ हुआ है? (गाँव, मोहल्ला, या लैंडमार्क बोलें)",
    questionEn: "Where did it happen? (Village, ward, or landmark)",
    hintHi: "उदा. रामपुर, वार्ड 4, प्राथमिक विद्यालय के पास...",
    hintEn: "e.g. Dhamora village, near primary school, Ram Mandir road...",
    field: "location",
  },
  {
    step: 3,
    questionHi: "यह समस्या कितने दिनों से है?",
    questionEn: "Since how many days has this issue existed?",
    hintHi: "उदा. 3 दिन से, 1 हफ्ते से, आज सुबह से...",
    hintEn: "e.g. 3 days, 1 week, since this morning...",
    field: "duration",
  },
  {
    step: 4,
    questionHi: "फ़ोटो या सुबूत जोड़ें (वैकल्पिक)",
    questionEn: "Attach photo evidence (Optional)",
    hintHi: "कैमरा से फ़ोटो लें या बिना फ़ोटो के आगे बढ़ें",
    hintEn: "Snap photo from camera or proceed without photo",
    field: "media",
  },
];

interface AssistedVoiceReporterProps {
  onSuccess?: (complaintId: string) => void;
  onCancel?: () => void;
}

export default function AssistedVoiceReporter({ onSuccess, onCancel }: AssistedVoiceReporterProps) {
  const [lang, setLang] = useState<"hi" | "en">("hi");
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Form states collected via voice
  const [problemText, setProblemText] = useState("");
  const [locationText, setLocationText] = useState("");
  const [durationText, setDurationText] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("");

          if (currentStepIdx === 0) setProblemText(transcript);
          else if (currentStepIdx === 1) setLocationText(transcript);
          else if (currentStepIdx === 2) setDurationText(transcript);
        };

        recognition.onerror = (err: any) => {
          console.warn("Speech recognition error:", err);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }
  }, [lang, currentStepIdx]);

  // Read question aloud using TTS
  const speakQuestion = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speak question when step changes
  useEffect(() => {
    const q = QUESTIONS[currentStepIdx];
    const textToSpeak = lang === "hi" ? q.questionHi : q.questionEn;
    speakQuestion(textToSpeak);
  }, [currentStepIdx, lang]);

  const toggleListening = () => {
    if (!speechSupported) {
      alert(
        lang === "hi"
          ? "आपका ब्राउज़र स्पीच रिकग्निशन को सपोर्ट नहीं करता। कृपया टेक्स्ट टाइप करें।"
          : "Speech recognition not supported in this browser. Please type below."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = lang === "hi" ? "hi-IN" : "en-IN";
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (e) {
        console.warn("Speech start failed:", e);
      }
    }
  };

  // Handle Photo Capture simulation
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Submit Complaint via Voice Draft
  const handleFinalSubmit = async () => {
    try {
      setSubmitting(true);
      setErrorMessage("");

      const category = problemText.toLowerCase().includes("पानी") || problemText.toLowerCase().includes("water")
        ? "Water"
        : problemText.toLowerCase().includes("बिजली") || problemText.toLowerCase().includes("electric")
        ? "Electricity"
        : problemText.toLowerCase().includes("सड़क") || problemText.toLowerCase().includes("road")
        ? "Roads"
        : problemText.toLowerCase().includes("गाय") || problemText.toLowerCase().includes("पशु") || problemText.toLowerCase().includes("animal")
        ? "Animal Welfare"
        : "Infrastructure";

      const title = problemText.length > 50 ? problemText.slice(0, 47) + "..." : problemText || "Voice Reported Civic Issue";
      const fullDesc = `[Voice-Assisted Grievance]\nIssue: ${problemText}\nLocation: ${locationText}\nDuration: ${durationText}`;

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          urgency: "High",
          priority: "High",
          description: fullDesc,
          location: locationText || "Gram Panchayat Jurisdiction",
          village: locationText.split(",")[0] || "Rampur",
          district: "Rampur",
          mediaUrl: photoPreview || null,
          isAnonymous: false,
        }),
      });

      const data = await res.json();
      if (res.ok && data.complaint) {
        setSubmittedId(data.complaint.id);
        if (onSuccess) onSuccess(data.complaint.id);
      } else {
        setErrorMessage(data.error || "Failed to submit grievance.");
      }
    } catch (err: any) {
      console.error("Grievance submission error:", err);
      setErrorMessage("Network error submitting complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = QUESTIONS[currentStepIdx];

  if (submittedId) {
    return (
      <div className="bg-[#171717] rounded-3xl border border-emerald-500/30 p-6 sm:p-8 text-white text-center shadow-2xl animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black mb-1">
          {lang === "hi" ? "शिकायत सफलतापूर्वक दर्ज हुई!" : "Grievance Successfully Registered!"}
        </h3>
        <p className="text-xs text-neutral-400 font-mono mb-4">Ticket ID: {submittedId}</p>
        <p className="text-xs text-neutral-300 max-w-md mx-auto mb-6">
          {lang === "hi"
            ? "संबंधित ग्राम पंचायत अधिकारी व लाइनमैन को सूचना भेज दी गई है। प्रगति आप डैशबोर्ड पर देख सकते हैं।"
            : "Forwarded to the designated Gram Panchayat Officer & Field Lineman. Track updates in your dashboard."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <a
            href={`/citizen/request/${submittedId}`}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-colors"
          >
            {lang === "hi" ? "शिकायत की स्थिति देखें" : "View Ticket Timeline"}
          </a>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 text-xs font-bold transition-colors"
            >
              {lang === "hi" ? "वापस जाएँ" : "Close"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#171717] rounded-3xl border border-white/10 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
      {/* Language and Step Header */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-base text-white flex items-center gap-1.5">
              <span>{lang === "hi" ? "आवाज से शिकायत दर्ज करें" : "Voice-Assisted Grievance Guide"}</span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold border border-sky-500/30">
                4 Simple Steps
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              {lang === "hi" ? "बोलकर बताएं, AI आपकी शिकायत खुद लिखेगा" : "Speak naturally, AI transcribes and files your ticket"}
            </p>
          </div>
        </div>

        {/* Language switch */}
        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setLang("hi")}
            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
              lang === "hi" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
              lang === "en" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {QUESTIONS.map((q, idx) => (
          <div
            key={q.step}
            className={`h-1.5 rounded-full transition-all ${
              idx <= currentStepIdx ? "bg-sky-500 shadow-sm shadow-sky-500/50" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Question Card */}
      <div className="bg-[#262626] rounded-2xl p-5 border border-white/10 mb-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-sky-400">
            Step {currentQ.step} of 4
          </span>
          <button
            onClick={() => speakQuestion(lang === "hi" ? currentQ.questionHi : currentQ.questionEn)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Read question again"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-white leading-snug mb-2">
          {lang === "hi" ? currentQ.questionHi : currentQ.questionEn}
        </h2>
        <p className="text-xs text-neutral-400">
          {lang === "hi" ? currentQ.hintHi : currentQ.hintEn}
        </p>
      </div>

      {/* Input / Voice area for Current Step */}
      <div className="space-y-4 mb-6">
        {currentStepIdx === 0 && (
          <div>
            <textarea
              rows={3}
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder={lang === "hi" ? "यहाँ बोलें या लिखें..." : "Speak or type problem here..."}
              className="w-full bg-[#1f1f1f] border border-white/15 rounded-2xl p-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        )}

        {currentStepIdx === 1 && (
          <div>
            <input
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder={lang === "hi" ? "गाँव / वार्ड / लैंडमार्क..." : "Village / ward / landmark..."}
              className="w-full bg-[#1f1f1f] border border-white/15 rounded-2xl p-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        )}

        {currentStepIdx === 2 && (
          <div>
            <input
              type="text"
              value={durationText}
              onChange={(e) => setDurationText(e.target.value)}
              placeholder={lang === "hi" ? "उदा. 2 दिन, 1 हफ्ता..." : "e.g. 2 days, 1 week..."}
              className="w-full bg-[#1f1f1f] border border-white/15 rounded-2xl p-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        )}

        {currentStepIdx === 3 && (
          <div className="bg-[#1f1f1f] border border-dashed border-white/20 rounded-2xl p-6 text-center">
            {photoPreview ? (
              <div className="space-y-3">
                <img
                  src={photoPreview}
                  alt="Evidence Preview"
                  className="max-h-48 mx-auto rounded-xl object-contain border border-white/10"
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="text-xs text-red-400 hover:text-red-300 font-bold"
                >
                  {lang === "hi" ? "फ़ोटो हटाएं" : "Remove Photo"}
                </button>
              </div>
            ) : (
              <div>
                <Camera className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors">
                  <span>{lang === "hi" ? "फ़ोटो खींचें या चुनें" : "Capture / Select Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-neutral-500 mt-2">
                  {lang === "hi" ? "(वैकल्पिक) आप बिना फ़ोटो के भी जमा कर सकते हैं" : "(Optional) You can submit without photo"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Big Mic Speaking Button */}
        {currentStepIdx < 3 && (
          <div className="flex flex-col items-center justify-center py-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
                isListening
                  ? "bg-red-600 text-white animate-pulse ring-8 ring-red-600/30"
                  : "bg-sky-600 hover:bg-sky-500 text-white hover:scale-105"
              }`}
            >
              {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>
            <span className="text-xs font-bold text-neutral-300 mt-2">
              {isListening
                ? lang === "hi"
                  ? "सुन रहे हैं... बोलिए"
                  : "Listening... Speak now"
                : lang === "hi"
                ? "माइक दबाकर बोलें"
                : "Tap microphone to speak"}
            </span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          disabled={currentStepIdx === 0}
          onClick={() => setCurrentStepIdx((prev) => Math.max(prev - 1, 0))}
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-neutral-300 text-xs font-bold transition-colors"
        >
          {lang === "hi" ? "← पिछला" : "← Previous"}
        </button>

        {currentStepIdx < 3 ? (
          <button
            type="button"
            onClick={() => setCurrentStepIdx((prev) => Math.min(prev + 1, 3))}
            className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <span>{lang === "hi" ? "अगला →" : "Next →"}</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting || !problemText.trim()}
            onClick={handleFinalSubmit}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-600/30"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-emerald-200" />
            )}
            <span>{lang === "hi" ? "शिकायत दर्ज करें (Submit)" : "Submit Grievance"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  HelpCircle,
  X,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Camera,
  Radio,
  HeartPulse,
  MapPin,
  Bot,
  Send,
  ExternalLink,
} from "lucide-react";

interface GuideStep {
  title: string;
  instruction: string;
  tip?: string;
  actionLabel?: string;
  actionUrl?: string;
}

const ROUTE_GUIDES: Record<string, { title: string; steps: GuideStep[] }> = {
  "/smart-complaint": {
    title: "How to Use AI Vision Auto-Draft",
    steps: [
      {
        title: "Step 1: Upload Incident Photo",
        instruction: "Drag & drop or snap a photo of any civic defect, road pothole, damaged wire, or injured stray animal.",
        tip: "You can click any of the 4 sample scenario buttons for instant 1-click test data!",
      },
      {
        title: "Step 2: Run Multimodal Analysis",
        instruction: "Click 'Run Multimodal AI Vision Analysis'. The vision model evaluates defect depth, structural danger, and urgency level.",
        tip: "Notice the calculated composite Public Risk Index (0-100).",
      },
      {
        title: "Step 3: Review & Transmit",
        instruction: "Review the auto-drafted grievance subject and formal tone description. Edit any fields if desired, then click 'Confirm & Transmit'.",
        tip: "A linked request will be routed immediately to local district personnel.",
      },
    ],
  },
  "/dispatch/simulator": {
    title: "How to Test AI Voice Dispatch",
    steps: [
      {
        title: "Step 1: Select Incident Scenario",
        instruction: "Choose from 5 preset emergencies: Hit-and-Run, Injured Stray Dog, LPG Gas Leak, Transformer Fire, or Elderly Cardiac Distress.",
      },
      {
        title: "Step 2: Call or Run Auto-Simulation",
        instruction: "Click the green Call button to speak via microphone, or click 'Simulate Full Automated Call' for a 20-second hands-free demo.",
        tip: "Toggle Voice Speech on the top bar to hear the AI dispatcher speak aloud with Web Speech TTS.",
      },
      {
        title: "Step 3: Mobilize Unit & Log",
        instruction: "Once incident details are confirmed, observe the dispatcher trigger an official mobilization record with real ETA and unit code.",
      },
    ],
  },
  "/emergency/triage": {
    title: "Dual Emergency & Animal Triage Guide",
    steps: [
      {
        title: "Step 1: Choose Domain (Human vs Animal)",
        instruction: "Toggle between Human Medical First Aid and Veterinary Animal Rescue tabs at the top.",
      },
      {
        title: "Step 2: Triage Assessment",
        instruction: "Select symptoms or injury types to calculate Code Red, Orange, Yellow, or Green urgency.",
        tip: "Human tab features an interactive 110 BPM CPR pulse metronome!",
      },
      {
        title: "Step 3: 1-Click SOS Dispatch",
        instruction: "Hit 'Transmit Emergency SOS Alert' to notify nearest hospitals, PHCs, or registered animal rescue shelters.",
      },
    ],
  },
  "/threat-matrix": {
    title: "Interpreting the Threat Matrix Heatmap",
    steps: [
      {
        title: "Step 1: Geographic Heatmap View",
        instruction: "Inspect color-coded pins across Rampur, Sitapur, Mandya, and Shivamogga. Red pins indicate Critical structural failure.",
      },
      {
        title: "Step 2: Time-to-Decay Math",
        instruction: "Review the Vulnerability Index formula: unaddressed hazards deteriorate exponentially over time based on days active.",
        tip: "Use the filter bar to isolate Electrical, Structural, or Hydrological threats.",
      },
      {
        title: "Step 3: Deploy Mitigation",
        instruction: "Select any critical hazard card to inspect the proposed engineering mitigation plan.",
      },
    ],
  },
  "/citizen/new-request": {
    title: "Raising a Citizen Request",
    steps: [
      {
        title: "Step 1: Choose Routing Category",
        instruction: "Select Civic, Health, Emergency, or Farming. Each category has deterministic priority mapping.",
      },
      {
        title: "Step 2: Pin Location",
        instruction: "Click 'GPS Pin' to auto-detect your coordinates or type your village/district name.",
      },
      {
        title: "Step 3: Submit & Track",
        instruction: "Submit to immediately match the nearest verified worker or volunteer in your district.",
      },
    ],
  },
};

export default function AIGuideCopilot() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "assistant" | "user"; text: string; actionUrl?: string; actionLabel?: string }[]
  >([
    {
      role: "assistant",
      text: "👋 Hi! I am your VANGUARD Interactive Co-Pilot. How can I guide your emergency, civic, or threat management workflow today?",
    },
  ]);

  // Determine current contextual guide
  const currentGuide =
    ROUTE_GUIDES[pathname] || {
      title: "VANGUARD AI Platform Tour",
      steps: [
        {
          title: "Explore Multimodal Complaint Box",
          instruction: "Upload an image of civic damage or animal emergencies for automated defect diagnosis.",
          actionLabel: "Go to Vision Complaint",
          actionUrl: "/smart-complaint",
        },
        {
          title: "Test Voice Dispatch Simulator",
          instruction: "Simulate emergency incoming calls with real-time waveform audio and dispatch routing.",
          actionLabel: "Open Voice Simulator",
          actionUrl: "/dispatch/simulator",
        },
        {
          title: "Dual Emergency & Animal Triage",
          instruction: "Access CPR metronome, bleed control, and animal rescue shelter directories.",
          actionLabel: "Open Emergency Triage",
          actionUrl: "/emergency/triage",
        },
        {
          title: "Civic Threat Matrix & Heatmap",
          instruction: "Inspect structural vulnerabilities and exponential time-to-decay calculations.",
          actionLabel: "Open Threat Matrix",
          actionUrl: "/threat-matrix",
        },
      ],
    };

  // Reset step on route change
  useEffect(() => {
    setActiveStepIdx(0);
  }, [pathname]);

  // Listen for global open event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("vanguard:open-guide", handleOpen);
    return () => window.removeEventListener("vanguard:open-guide", handleOpen);
  }, []);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.trim().toLowerCase();
    const userMsg = chatInput.trim();
    setChatInput("");

    let reply = "I can guide you through filing complaints, testing voice dispatch, or exploring emergency triage!";
    let actionUrl: string | undefined;
    let actionLabel: string | undefined;

    if (query.includes("complaint") || query.includes("photo") || query.includes("image") || query.includes("vision") || query.includes("pothole")) {
      reply = "The Multimodal Vision Complaint Box inspects photos of damage and drafts formal complaints automatically!";
      actionUrl = "/smart-complaint";
      actionLabel = "Open Vision Complaint Box";
    } else if (query.includes("call") || query.includes("voice") || query.includes("dispatch") || query.includes("phone")) {
      reply = "Our AI Voice Dispatch Simulator lets you test emergency calls with realistic audio waveforms and TTS speech!";
      actionUrl = "/dispatch/simulator";
      actionLabel = "Open AI Calling Simulator";
    } else if (query.includes("animal") || query.includes("dog") || query.includes("medical") || query.includes("cpr") || query.includes("triage")) {
      reply = "The Dual Emergency Assistant has dedicated human medical triage (with CPR metronome) and stray animal rescue!";
      actionUrl = "/emergency/triage";
      actionLabel = "Open Emergency Triage";
    } else if (query.includes("threat") || query.includes("map") || query.includes("decay") || query.includes("risk")) {
      reply = "The Threat Matrix maps structural hazards with an interactive heatmap and calculates exponential time-to-decay!";
      actionUrl = "/threat-matrix";
      actionLabel = "Open Threat Matrix";
    }

    setChatMessages((prev) => [
      ...prev,
      { role: "user", text: userMsg },
      { role: "assistant", text: reply, actionUrl, actionLabel },
    ]);
  };

  const activeStep = currentGuide.steps[activeStepIdx] || currentGuide.steps[0];

  return (
    <>
      {/* Floating Co-Pilot Drawer / Modal (Anchored on bottom-right above dock) */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 bg-white rounded-3xl border border-[#404040] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#262626] text-white p-4 flex items-center justify-between border-b border-[#404040]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#53bdeb] text-[#111] flex items-center justify-center font-black shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-white">VANGUARD AI Co-Pilot</h3>
                <span className="text-[10px] text-[#a6a6a6] block">Context-Aware Walkthrough</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-[#a6a6a6] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contextual Interactive Walkthrough Card */}
          <div className="p-4 bg-[#f9f9f9] border-b border-[#dcdcdc] space-y-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-extrabold text-[#262626] uppercase tracking-wider">
                {currentGuide.title}
              </span>
              <span className="font-mono text-[#707070]">
                Step {activeStepIdx + 1} of {currentGuide.steps.length}
              </span>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-[#dcdcdc] shadow-2xs space-y-2">
              <h4 className="font-bold text-xs text-[#262626] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {activeStep.title}
              </h4>
              <p className="text-xs text-[#545454] leading-relaxed">
                {activeStep.instruction}
              </p>
              {activeStep.tip && (
                <div className="text-[11px] p-2 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 font-medium">
                  💡 {activeStep.tip}
                </div>
              )}
              {activeStep.actionUrl && (
                <button
                  type="button"
                  onClick={() => {
                    router.push(activeStep.actionUrl!);
                    setIsOpen(false);
                  }}
                  className="mt-1 w-full py-1.5 px-2.5 bg-[#262626] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <span>{activeStep.actionLabel || "Proceed"}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                disabled={activeStepIdx === 0}
                onClick={() => setActiveStepIdx((prev) => Math.max(0, prev - 1))}
                className="px-2.5 py-1 text-xs font-bold text-[#707070] hover:text-[#262626] disabled:opacity-30 cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </button>
              <button
                type="button"
                disabled={activeStepIdx === currentGuide.steps.length - 1}
                onClick={() => setActiveStepIdx((prev) => Math.min(currentGuide.steps.length - 1, prev + 1))}
                className="px-3 py-1 bg-[#262626] hover:bg-black text-white text-xs font-bold rounded-lg shadow-2xs disabled:opacity-30 cursor-pointer flex items-center gap-1"
              >
                Next Step
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Mini Conversational Assist Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 max-h-48 scrollbar-thin">
            {chatMessages.map((m, idx) => (
              <div
                key={idx}
                className={`text-xs p-2.5 rounded-xl ${
                  m.role === "assistant"
                    ? "bg-[#f5f5f5] text-[#404040] border border-[#dcdcdc]"
                    : "bg-[#262626] text-white ml-auto max-w-[85%]"
                }`}
              >
                <p>{m.text}</p>
                {m.actionUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      router.push(m.actionUrl!);
                      setIsOpen(false);
                    }}
                    className="mt-1.5 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <span>{m.actionLabel || "Open Page"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Quick Chat Input */}
          <form onSubmit={handleSendMessage} className="p-2.5 border-t border-[#dcdcdc] bg-white flex items-center gap-1.5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask co-pilot anything..."
              className="flex-1 px-3 py-1.5 text-xs border border-[#dcdcdc] rounded-xl outline-none focus:border-[#404040] bg-[#f5f5f5] text-[#404040]"
            />
            <button
              type="submit"
              className="p-2 bg-[#262626] hover:bg-black text-white rounded-xl shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

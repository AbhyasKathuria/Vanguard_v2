"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  HeartPulse,
  Activity,
  AlertTriangle,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  Volume2,
  VolumeX,
  Navigation,
  MapPin,
  Clock,
  Loader2,
  Stethoscope,
  Info,
  Shield,
  Siren,
  Dog,
  Cat,
  Flame,
  Droplet,
} from "lucide-react";
import { evaluateHumanTriage, evaluateVeterinaryTriage } from "@/lib/ai/triageEngine";
import { TriageDomain, TriageEvaluation, EmergencyFacility } from "@/lib/types";

export default function DualEmergencyTriage() {
  const [activeTab, setActiveTab] = useState<TriageDomain>("human");
  const [district, setDistrict] = useState("Rampur");
  const [location, setLocation] = useState("District Hub");

  // Human Triage State
  const [selectedHumanSymptoms, setSelectedHumanSymptoms] = useState<string[]>([
    "Chest Pain / Cardiac Pressure",
  ]);
  const [humanNotes, setHumanNotes] = useState("");
  const [humanEvaluation, setHumanEvaluation] = useState<TriageEvaluation | null>(null);

  // Veterinary Triage State
  const [selectedSpecies, setSelectedSpecies] = useState("Stray Canine / Dog");
  const [selectedAnimalInjury, setSelectedAnimalInjury] = useState(
    "Vehicular Collision / Hit-and-Run"
  );
  const [vetNotes, setVetNotes] = useState("");
  const [vetEvaluation, setVetEvaluation] = useState<TriageEvaluation | null>(null);

  // CPR Metronome State
  const [cprActive, setCprActive] = useState(false);
  const [cprBeepCount, setCprBeepCount] = useState(0);
  const [cprMuted, setCprMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const cprIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // SOS state
  const [sosDispatched, setSosDispatched] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosToken, setSosToken] = useState<string | null>(null);

  // Run triage calculations whenever selections change
  useEffect(() => {
    const evalHuman = evaluateHumanTriage(selectedHumanSymptoms, district, humanNotes);
    setHumanEvaluation(evalHuman);
  }, [selectedHumanSymptoms, district, humanNotes]);

  useEffect(() => {
    const evalVet = evaluateVeterinaryTriage(selectedSpecies, selectedAnimalInjury, district, vetNotes);
    setVetEvaluation(evalVet);
  }, [selectedSpecies, selectedAnimalInjury, district, vetNotes]);

  // CPR 110 BPM Metronome using Web Audio API
  const toggleCprMetronome = () => {
    if (cprActive) {
      if (cprIntervalRef.current) clearInterval(cprIntervalRef.current);
      setCprActive(false);
      return;
    }

    if (typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx && !audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
    }

    setCprActive(true);
    // 110 BPM = 60000ms / 110 = ~545ms per compression
    const intervalMs = Math.round(60000 / 110);

    cprIntervalRef.current = setInterval(() => {
      setCprBeepCount((prev) => (prev % 30) + 1);

      if (!cprMuted && audioCtxRef.current && audioCtxRef.current.state === "running") {
        try {
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(800, audioCtxRef.current.currentTime);
          gain.gain.setValueAtTime(0.15, audioCtxRef.current.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);
          osc.start();
          osc.stop(audioCtxRef.current.currentTime + 0.08);
        } catch {
          // ignore audio failure
        }
      }
    }, intervalMs);
  };

  useEffect(() => {
    return () => {
      if (cprIntervalRef.current) clearInterval(cprIntervalRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // 1-Click SOS Dispatch
  const handleTriggerSos = async () => {
    try {
      setSosLoading(true);
      const isVet = activeTab === "veterinary";

      const res = await fetch("/api/ai/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: activeTab,
          symptoms: isVet ? [selectedAnimalInjury] : selectedHumanSymptoms,
          species: selectedSpecies,
          injuryType: selectedAnimalInjury,
          district,
          additionalNotes: isVet ? vetNotes : humanNotes,
          triggerSos: true,
          location,
        }),
      });

      const data = await res.json();
      setSosDispatched(true);
      setSosToken(`SOS-${district.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
    } catch (err) {
      console.error("SOS trigger error:", err);
    } finally {
      setSosLoading(false);
    }
  };

  const getTriageBadge = (sev: string) => {
    switch (sev) {
      case "Code Red":
        return "bg-red-600 text-white border-red-700 animate-pulse";
      case "Code Orange":
        return "bg-orange-500 text-white border-orange-600";
      case "Code Yellow":
        return "bg-amber-500 text-white border-amber-600";
      case "Code Green":
      default:
        return "bg-emerald-600 text-white border-emerald-700";
    }
  };

  const currentEval = activeTab === "human" ? humanEvaluation : vetEvaluation;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-[#262626] text-white p-6 sm:p-8 rounded-3xl border border-[#404040] shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-bold uppercase tracking-wider text-[#dcdcdc] border border-white/15 inline-flex items-center gap-1.5">
            <HeartPulse className="w-3 h-3 text-red-400" />
            Dual Emergency Assistant
          </span>
          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
            Human Medical + Animal Rescue
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Emergency First-Response Triage &amp; SOS Dispatch
        </h1>
        <p className="text-xs sm:text-sm text-[#a6a6a6] mt-1.5 max-w-2xl leading-relaxed">
          Immediate clinical triage logic for human life-safety and stray/domestic animal trauma. Step-by-step stabilization, interactive 110 BPM CPR pacing, and proximity matching with registered hospitals and animal shelters.
        </p>
      </div>

      {/* Domain Mode Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#dcdcdc] shadow-xs">
        <button
          type="button"
          onClick={() => {
            setActiveTab("human");
            setSosDispatched(false);
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "human"
              ? "bg-[#262626] text-white shadow-xs"
              : "text-[#707070] hover:text-[#262626] hover:bg-[#f5f5f5]"
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Human Medical Emergency</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("veterinary");
            setSosDispatched(false);
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "veterinary"
              ? "bg-[#262626] text-white shadow-xs"
              : "text-[#707070] hover:text-[#262626] hover:bg-[#f5f5f5]"
          }`}
        >
          <Dog className="w-4 h-4" />
          <span>Veterinary &amp; Animal Rescue</span>
        </button>
      </div>

      {/* District & Location Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#dcdcdc] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#404040]">
          <MapPin className="w-4 h-4 text-[#707070]" />
          <span>Emergency Location:</span>
        </div>
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="px-3 py-1.5 text-xs border border-[#dcdcdc] rounded-xl bg-[#f5f5f5] text-[#404040] outline-none"
          >
            <option value="Rampur">Rampur District (UP)</option>
            <option value="Sitapur">Sitapur District (UP)</option>
            <option value="Mandya">Mandya District (KA)</option>
            <option value="Shivamogga">Shivamogga District (KA)</option>
          </select>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Village name or landmark..."
            className="flex-1 px-3 py-1.5 text-xs border border-[#dcdcdc] rounded-xl bg-[#f5f5f5] text-[#404040] outline-none"
          />
        </div>
      </div>

      {/* Main Dual Domain Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Symptom / Hazard Checklist */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#dcdcdc] shadow-xs space-y-5">
          {activeTab === "human" ? (
            <>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#707070] block mb-2">
                  Select Observed Human Symptoms
                </span>
                <div className="space-y-2">
                  {[
                    "Unresponsive / Loss of Consciousness",
                    "Chest Pain / Cardiac Pressure",
                    "Severe Breathing Difficulty / Choking",
                    "Heavy Uncontrolled Bleeding",
                    "Suspected Bone Fracture / Trauma",
                    "Severe Thermal Burn / Scald",
                    "Heatstroke / Acute Dehydration",
                    "Minor Cuts / Wounds",
                  ].map((sym) => {
                    const isSelected = selectedHumanSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedHumanSymptoms(selectedHumanSymptoms.filter((s) => s !== sym));
                          } else {
                            setSelectedHumanSymptoms([...selectedHumanSymptoms, sym]);
                          }
                        }}
                        className={`w-full p-2.5 text-left rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-[#262626] text-white border-black shadow-xs"
                            : "bg-[#f5f5f5] text-[#404040] border-[#dcdcdc] hover:bg-[#eaeaea]"
                        }`}
                      >
                        <span>{sym}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#707070] mb-1">
                  Additional Casualty Observations
                </label>
                <textarea
                  value={humanNotes}
                  onChange={(e) => setHumanNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Pale skin, patient is elderly, clutching left arm..."
                  className="w-full p-3 text-xs border border-[#dcdcdc] rounded-xl outline-none focus:border-[#404040] bg-[#f5f5f5] text-[#404040]"
                />
              </div>

              {/* Interactive CPR Metronome Tool */}
              <div className="p-4 rounded-2xl bg-[#1a1a1a] text-white border border-[#333] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <HeartPulse className="w-4 h-4 animate-pulse" />
                    CPR 110 BPM Metronome
                  </span>
                  <button
                    type="button"
                    onClick={() => setCprMuted(!cprMuted)}
                    className="text-xs text-[#a6a6a6] hover:text-white"
                  >
                    {cprMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-[#a6a6a6] leading-tight">
                  Cardiopulmonary rhythm: Push down 2 inches in center of chest at 110 beats per minute. 30 compressions : 2 rescue breaths.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={toggleCprMetronome}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      cprActive
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-white text-[#262626] hover:bg-[#dcdcdc]"
                    }`}
                  >
                    {cprActive ? "Stop CPR Metronome" : "Start 110 BPM Metronome"}
                  </button>
                  {cprActive && (
                    <span className="font-mono text-xs font-bold text-red-400">
                      Compression: {cprBeepCount} / 30
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Veterinary Controls */}
              {/* Quick Rural Livestock Emergency Button */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-black text-xs text-amber-300 flex items-center gap-1.5">
                    <span>🐄</span>
                    <span>मेरी गाय बीमार है (Cattle Emergency)</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80">
                    Instant triage for Cow, Buffalo, Calf bloat, fever, or injury
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpecies("Bovine (Cow / Calf)");
                    setSelectedAnimalInjury("Acute Rumen Bloat / Afra (Swollen Left Flank)");
                    setVetNotes("Cow is in pain, left flank swollen, breathing rapidly");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-colors cursor-pointer"
                >
                  Select Bovine
                </button>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#707070] block mb-2">
                  1. Target Animal Species
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Bovine (Cow / Calf)",
                    "Stray Canine / Dog",
                    "Domestic / Stray Cat",
                    "Goat / Sheep / Livestock",
                  ].map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setSelectedSpecies(sp)}
                      className={`p-2.5 text-left rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedSpecies === sp
                          ? "bg-[#262626] text-white border-black shadow-xs"
                          : "bg-[#f5f5f5] text-[#404040] border-[#dcdcdc] hover:bg-[#eaeaea]"
                      }`}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#707070] block mb-2">
                  2. Observed Animal Injury / Threat
                </span>
                <div className="space-y-2">
                  {(selectedSpecies.includes("Bovine") || selectedSpecies.includes("Goat")
                    ? [
                        "Acute Rumen Bloat / Afra (Swollen Left Flank)",
                        "Foot & Mouth Lesions / Excessive Salivation",
                        "Milk Fever / Hypocalcemia (Unable to Stand)",
                        "Vehicular Collision / Highway Hit-and-Run",
                        "Severe Maggot Wound / Horn Fracture",
                        "Severe Heatstroke / Dehydration",
                      ]
                    : [
                        "Vehicular Collision / Hit-and-Run",
                        "Open Limb Fracture / Cannot Walk",
                        "Suspected Poisoning / Toxic Ingestion",
                        "Severe Maggot Wound / Tissue Necrosis",
                        "Severe Heatstroke / Tremors",
                      ]
                  ).map((inj) => (
                    <button
                      key={inj}
                      type="button"
                      onClick={() => setSelectedAnimalInjury(inj)}
                      className={`w-full p-2.5 text-left rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-between ${
                        selectedAnimalInjury === inj
                          ? "bg-[#262626] text-white border-black shadow-xs"
                          : "bg-[#f5f5f5] text-[#404040] border-[#dcdcdc] hover:bg-[#eaeaea]"
                      }`}
                    >
                      <span>{inj}</span>
                      {selectedAnimalInjury === inj && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#707070] mb-1">
                  Location Specifics &amp; Temperament
                </label>
                <textarea
                  value={vetNotes}
                  onChange={(e) => setVetNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Whimpering beside ditch, not aggressive, bleeding from left paw..."
                  className="w-full p-3 text-xs border border-[#dcdcdc] rounded-xl outline-none focus:border-[#404040] bg-[#f5f5f5] text-[#404040]"
                />
              </div>
            </>
          )}

          {/* 1-Click SOS Dispatch Trigger */}
          <div className="pt-2 border-t border-[#dcdcdc]">
            <button
              type="button"
              disabled={sosLoading || sosDispatched}
              onClick={handleTriggerSos}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                sosDispatched
                  ? "bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white animate-pulse"
              }`}
            >
              {sosLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transmitting Emergency Coordinates...</span>
                </>
              ) : sosDispatched ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Emergency SOS Alert Dispatched! ({sosToken})</span>
                </>
              ) : (
                <>
                  <Siren className="w-4 h-4 text-white" />
                  <span>
                    Transmit Instant {activeTab === "human" ? "Ambulance SOS" : "Animal Rescue SOS"} Alert
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Triage Scoring, Steps, and Facilities */}
        <div className="lg:col-span-7 space-y-5">
          {currentEval && (
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#dcdcdc] shadow-xs space-y-6">
              {/* Triage Code Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dcdcdc] pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">
                    Evaluated Triage Classification
                  </span>
                  <h3 className="text-lg font-black text-[#262626] mt-0.5">
                    {currentEval.patientType}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#707070] block">
                      Priority Index
                    </span>
                    <span className="text-base font-black text-red-600">
                      {currentEval.priorityScore}/100
                    </span>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase border shadow-2xs ${getTriageBadge(currentEval.severity)}`}>
                    {currentEval.severity}
                  </span>
                </div>
              </div>

              {/* Danger Signs Callout */}
              {currentEval.dangerSigns.length > 0 && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-950 text-xs space-y-1">
                  <span className="font-bold flex items-center gap-1 text-red-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    Critical Risk Factors Detected:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-red-900 font-medium">
                    {currentEval.dangerSigns.map((ds, idx) => (
                      <li key={idx}>{ds}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Step-by-step First Aid Protocol */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#707070] block">
                  Step-by-Step Immediate Stabilization Protocol
                </span>
                <div className="space-y-3">
                  {currentEval.firstAidSteps.map((step) => (
                    <div
                      key={step.step}
                      className="p-4 rounded-2xl bg-[#f9f9f9] border border-[#dcdcdc] space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#262626] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                          {step.step}
                        </span>
                        <h4 className="font-bold text-xs text-[#262626]">{step.title}</h4>
                      </div>
                      <p className="text-xs text-[#545454] leading-relaxed pl-7">
                        {step.detail}
                      </p>
                      {step.warning && (
                        <div className="ml-7 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
                          ⚠️ {step.warning}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Registered Facilities Directory */}
              <div className="space-y-3 pt-2 border-t border-[#dcdcdc]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#707070] flex items-center justify-between">
                  <span>Matched Emergency Units &amp; Shelters ({district})</span>
                  <span className="text-[11px] text-emerald-700 font-semibold">24/7 Response</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentEval.matchedFacilities.map((fac) => (
                    <div
                      key={fac.id}
                      className="p-3.5 rounded-2xl bg-[#f5f5f5] border border-[#dcdcdc] space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h5 className="font-bold text-xs text-[#262626] leading-tight">{fac.name}</h5>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-[#707070] border border-[#dcdcdc] font-mono shrink-0">
                          {fac.distanceKm} km
                        </span>
                      </div>
                      <p className="text-[11px] text-[#707070]">{fac.location}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-bold text-emerald-700">
                          {fac.operatingHours}
                        </span>
                        <a
                          href={`tel:${fac.phone}`}
                          className="px-2.5 py-1 rounded-lg bg-[#262626] hover:bg-black text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call {fac.phone}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mandatory Medical Disclaimer */}
              <div className="p-3 rounded-xl bg-gray-100 text-gray-600 text-[11px] leading-relaxed flex items-start gap-2">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-500" />
                <span>{currentEval.disclaimer}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

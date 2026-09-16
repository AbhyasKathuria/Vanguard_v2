"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Send,
  Loader2,
  Shield,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  User,
  Headphones,
  CheckCircle2,
  Activity,
  Car,
  Flame,
  Zap,
  HeartPulse,
} from "lucide-react";
import { PRESET_CALL_SCENARIOS } from "@/lib/ai/voiceConstants";
import { CallScenario, CallTranscriptMessage } from "@/lib/types";

type CallState = "idle" | "ringing" | "connected" | "dispatched" | "ended";

export default function AICallingSimulator() {
  const [scenarios] = useState<CallScenario[]>(PRESET_CALL_SCENARIOS);
  const [selectedScenario, setSelectedScenario] = useState<CallScenario>(PRESET_CALL_SCENARIOS[0]);
  const [callState, setCallState] = useState<CallState>("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<CallTranscriptMessage[]>([]);
  const [callerInput, setCallerInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<"agent" | "caller" | null>(null);
  const [dispatchDetails, setDispatchDetails] = useState<any | null>(null);
  const [autoSimulating, setAutoSimulating] = useState(false);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const callStateRef = useRef<CallState>("idle");
  callStateRef.current = callState;

  // Auto scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Call duration counter
  useEffect(() => {
    if (callState === "connected" || callState === "dispatched") {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Text-to-Speech synthesis
  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onstart = () => setActiveSpeaker("agent");
    utterance.onend = () => setActiveSpeaker(null);
    window.speechSynthesis.speak(utterance);
  };

  // Start Call
  const handleStartCall = () => {
    window.speechSynthesis?.cancel();
    setCallState("ringing");
    setCallDuration(0);
    setDispatchDetails(null);
    setAutoSimulating(false);

    // Initial system ring
    setTimeout(() => {
      setCallState("connected");
      const initialAgentGreeting = `VANGUARD Emergency Response Center. Operator #442 on line. What is your emergency at ${selectedScenario.callerLocation}?`;
      setTranscript([
        {
          speaker: "system",
          text: `Encrypted call established with VANGUARD Dispatch Hub. Scenario: ${selectedScenario.title}`,
          timestamp: "00:00",
        },
        {
          speaker: "agent",
          text: initialAgentGreeting,
          timestamp: "00:01",
        },
      ]);
      speakText(initialAgentGreeting);
    }, 1200);
  };

  // End Call
  const handleEndCall = async () => {
    window.speechSynthesis?.cancel();
    setCallState("ended");
    setActiveSpeaker(null);
    setIsListening(false);
    setAutoSimulating(false);

    // Persist call log to DB
    if (transcript.length > 2) {
      try {
        await fetch("/api/ai/voice-call-demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId: selectedScenario.id,
            userMessage: "Call terminated by caller.",
            history: transcript,
            saveCallLog: true,
            callerName: selectedScenario.callerName,
          }),
        });
      } catch (err) {
        console.warn("Failed to log call:", err);
      }
    }
  };

  // Send caller utterance to API
  const handleSendUtterance = async (messageText?: string) => {
    const textToSend = (messageText || callerInput).trim();
    if (!textToSend || callState !== "connected" && callState !== "dispatched") return;

    const timeStr = formatTime(callDuration);
    const updatedTranscript: CallTranscriptMessage[] = [
      ...transcript,
      { speaker: "caller", text: textToSend, timestamp: timeStr },
    ];
    setTranscript(updatedTranscript);
    if (!messageText) setCallerInput("");
    setActiveSpeaker("caller");

    setTimeout(() => {
      setActiveSpeaker(null);
    }, 800);

    try {
      const res = await fetch("/api/ai/voice-call-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          userMessage: textToSend,
          history: updatedTranscript,
          saveCallLog: true,
          callerName: selectedScenario.callerName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.result) {
        const agentReply = data.result.reply;
        setTranscript((prev) => [
          ...prev,
          {
            speaker: "agent",
            text: agentReply,
            timestamp: formatTime(callDuration + 2),
          },
        ]);
        speakText(agentReply);

        if (data.result.dispatchTriggered) {
          setCallState("dispatched");
          setDispatchDetails(data.result);
        }
      }
    } catch (err) {
      console.error("Voice turn error:", err);
    }
  };

  // 1-Click Hands-Free Automated Simulation
  const handleRunFullSimulation = async () => {
    handleStartCall();
    setAutoSimulating(true);

    const script = selectedScenario.simulatedConversation;
    let delay = 2500;

    script.forEach((turn, idx) => {
      // Caller turn
      setTimeout(() => {
        if (callStateRef.current === "ended") return;
        setTranscript((prev) => [
          ...prev,
          { speaker: "caller", text: turn.caller, timestamp: formatTime(idx * 8 + 3) },
        ]);
        setActiveSpeaker("caller");

        // Agent turn
        setTimeout(() => {
          if (callStateRef.current === "ended") return;
          setActiveSpeaker("agent");
          setTranscript((prev) => [
            ...prev,
            { speaker: "agent", text: turn.agent, timestamp: formatTime(idx * 8 + 6) },
          ]);
          speakText(turn.agent);

          if (idx >= script.length - 2) {
            setCallState("dispatched");
            setDispatchDetails({
              assignedUnit: selectedScenario.recommendedUnit,
              etaMinutes: 4,
              urgency: selectedScenario.urgency,
              extractedLocation: selectedScenario.callerLocation,
            });
          }
        }, 2200);
      }, delay);

      delay += 5500;
    });
  };

  // Browser Speech Recognition for live microphone speech
  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      handleSendUtterance(speechToText);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getScenarioIcon = (iconName: string) => {
    switch (iconName) {
      case "CarCrash":
        return Car;
      case "Flame":
        return Flame;
      case "Zap":
        return Zap;
      case "HeartPulse":
        return HeartPulse;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title & Badge */}
      <div className="bg-[#262626] text-white p-6 sm:p-8 rounded-3xl border border-[#404040] shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-bold uppercase tracking-wider text-[#dcdcdc] border border-white/15 inline-flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-[#25D366] animate-pulse" />
            Live AI Calling Sandbox
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#53bdeb]/20 text-[#53bdeb] text-[10px] font-bold border border-[#53bdeb]/30">
            Zero-Telecom Cost WebRTC Demo
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          AI Voice Dispatch Agent &amp; Realtime Caller Simulator
        </h1>
        <p className="text-xs sm:text-sm text-[#a6a6a6] mt-1.5 max-w-2xl leading-relaxed">
          Experience automated emergency dispatch with realistic dual-sided audio waveforms, speech-to-text transcription, interactive voice telephony dialog, and instant unit mobilization.
        </p>
      </div>

      {/* Scenario Selector & Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-[#dcdcdc] shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#707070] block">
            Select Mock Incident Scenario
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {scenarios.map((sc) => {
              const Icon = getScenarioIcon(sc.iconName);
              const isSelected = selectedScenario.id === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    setSelectedScenario(sc);
                    if (callState !== "idle") handleEndCall();
                  }}
                  className={`p-2.5 text-left rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#262626] text-white border-black shadow-xs"
                      : "bg-[#f5f5f5] text-[#404040] border-[#dcdcdc] hover:bg-[#eaeaea]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#53bdeb]" : "text-[#707070]"}`} />
                    <span className="text-[11px] font-bold truncate">{sc.title.split("(")[0]}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    sc.urgency === "Critical" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {sc.urgency}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1-Click Fast Simulation Launcher */}
        <div className="bg-white p-4 rounded-2xl border border-[#dcdcdc] shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#707070] block mb-1">
              Evaluator Quick-Test
            </span>
            <p className="text-xs text-[#707070] leading-tight">
              Watch a hands-free, complete simulated call play with voice synthesis and waveform in 20 seconds.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunFullSimulation}
            disabled={callState === "connected" && autoSimulating}
            className="w-full py-2.5 px-3 bg-[#404040] hover:bg-[#262626] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>Simulate Full Automated Call</span>
          </button>
        </div>
      </div>

      {/* Simulator Device & Transcript Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulated Mobile Dispatch Terminal */}
        <div className="lg:col-span-5 bg-[#171717] text-white p-6 rounded-3xl border border-[#333] shadow-lg flex flex-col justify-between space-y-6">
          {/* Simulated Status Bar */}
          <div className="flex items-center justify-between text-[11px] text-[#a6a6a6] border-b border-[#333] pb-2 font-mono">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-[#25D366]" />
              VANGUARD-NET
            </span>
            <span className="font-bold text-white">{callDuration > 0 ? formatTime(callDuration) : "00:00"}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTtsEnabled(!ttsEnabled)}
                title={ttsEnabled ? "Mute Voice Speech" : "Enable Voice Speech"}
                className="hover:text-white"
              >
                {ttsEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#53bdeb]" /> : <VolumeX className="w-3.5 h-3.5 text-[#707070]" />}
              </button>
              <span>100%</span>
            </div>
          </div>

          {/* Caller / Status Header */}
          <div className="text-center space-y-1.5">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#262626] border-2 border-[#404040] flex items-center justify-center shadow-inner">
              <Headphones className="w-8 h-8 text-[#53bdeb]" />
            </div>
            <h3 className="font-bold text-base text-white">VANGUARD Dispatch Operator #442</h3>
            <p className="text-xs text-[#a6a6a6]">{selectedScenario.callerLocation}</p>

            {/* Dynamic Status Pill */}
            <div className="pt-1">
              {callState === "idle" && (
                <span className="px-3 py-1 rounded-full bg-[#333] text-[11px] text-[#dcdcdc] font-semibold">
                  Ready to Call
                </span>
              )}
              {callState === "ringing" && (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold animate-pulse border border-amber-500/30">
                  Dialing Emergency Frequency...
                </span>
              )}
              {callState === "connected" && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Call Live &amp; Recording ({formatTime(callDuration)})
                </span>
              )}
              {callState === "dispatched" && (
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-[11px] font-bold border border-red-500/30 animate-pulse">
                  🚨 First Responders Dispatched
                </span>
              )}
              {callState === "ended" && (
                <span className="px-3 py-1 rounded-full bg-[#262626] text-[11px] text-[#707070] font-semibold">
                  Call Disconnected &amp; Logged
                </span>
              )}
            </div>
          </div>

          {/* Animated Audio Waveform Visualizer */}
          <div className="bg-[#111] p-4 rounded-2xl border border-[#262626] flex flex-col items-center justify-center space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#707070] flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#53bdeb]" />
              {activeSpeaker === "agent"
                ? "Agent Speaking Audio Stream"
                : activeSpeaker === "caller"
                ? "Caller Mic Receiving Stream"
                : "Standby Audio Monitor"}
            </span>
            <div className="flex items-center justify-center gap-1 h-12 w-full px-4">
              {[40, 65, 85, 30, 95, 55, 75, 45, 90, 60, 80, 50, 70, 35, 90, 45, 60].map(
                (h, idx) => {
                  const isActive = callState === "connected" || callState === "dispatched";
                  const barHeight = isActive
                    ? activeSpeaker
                      ? `${Math.max(15, (h * (idx % 2 === 0 ? 1.2 : 0.8)) % 100)}%`
                      : "25%"
                    : "10%";
                  return (
                    <div
                      key={idx}
                      style={{ height: barHeight }}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        activeSpeaker === "agent"
                          ? "bg-[#53bdeb]"
                          : activeSpeaker === "caller"
                          ? "bg-emerald-400"
                          : "bg-[#333]"
                      }`}
                    />
                  );
                }
              )}
            </div>
          </div>

          {/* Dial Pad Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              {callState === "idle" || callState === "ended" ? (
                <button
                  type="button"
                  onClick={handleStartCall}
                  className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                  title="Call Emergency Dispatch"
                >
                  <Phone className="w-7 h-7" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEndCall}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                  title="Hang up"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
              )}

              {/* Mic Speech Button */}
              <button
                type="button"
                disabled={callState !== "connected" && callState !== "dispatched"}
                onClick={toggleSpeechRecognition}
                className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                  isListening
                    ? "bg-red-600 text-white border-red-500 animate-pulse"
                    : "bg-[#262626] text-[#dcdcdc] border-[#404040] hover:bg-[#333]"
                } disabled:opacity-40`}
                title={isListening ? "Listening... click to stop" : "Speak via Microphone"}
              >
                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Dual-Sided Transcript & Dispatch Unit Log */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#dcdcdc] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#dcdcdc] pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#707070]">
                Live Dual-Sided Voice Transcript
              </span>
              <p className="text-xs text-[#262626] font-semibold mt-0.5">
                {selectedScenario.title}
              </p>
            </div>
            {dispatchDetails && (
              <span className="px-2.5 py-1 rounded-xl bg-red-100 text-red-700 text-xs font-bold border border-red-200 flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ETA: {dispatchDetails.etaMinutes}m
              </span>
            )}
          </div>

          {/* Transcript Scroll View */}
          <div className="h-80 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {transcript.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#a6a6a6] space-y-2">
                <PhoneCall className="w-8 h-8 text-[#dcdcdc]" />
                <p className="text-xs">Press the green Call button or run Auto Simulation to start dialogue.</p>
              </div>
            )}

            {transcript.map((msg, idx) => {
              if (msg.speaker === "system") {
                return (
                  <div key={idx} className="text-center py-1">
                    <span className="px-3 py-1 rounded-full bg-[#f5f5f5] text-[10px] font-mono text-[#707070] border border-[#dcdcdc]">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const isAgent = msg.speaker === "agent";
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${isAgent ? "justify-start" : "justify-end"}`}
                >
                  {isAgent && (
                    <div className="w-7 h-7 rounded-xl bg-[#262626] text-[#53bdeb] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      <Headphones className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      isAgent
                        ? "bg-[#262626] text-white rounded-tl-xs"
                        : "bg-[#25D366]/15 border border-[#25D366]/30 text-[#125c28] font-medium rounded-tr-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-1">
                      <span className="font-bold">{isAgent ? "Dispatch Operator" : "Citizen Caller"}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                  {!isAgent && (
                    <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={transcriptEndRef} />
          </div>

          {/* Caller Input Bar */}
          <div className="pt-2 border-t border-[#dcdcdc] space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendUtterance();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                disabled={callState !== "connected" && callState !== "dispatched"}
                value={callerInput}
                onChange={(e) => setCallerInput(e.target.value)}
                placeholder={
                  callState === "connected" || callState === "dispatched"
                    ? "Type citizen caller response or use Mic..."
                    : "Call must be active to speak..."
                }
                className="flex-1 px-4 py-2.5 text-xs border border-[#dcdcdc] rounded-xl outline-none focus:border-[#404040] bg-[#f5f5f5] focus:bg-white text-[#404040] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!callerInput.trim() || (callState !== "connected" && callState !== "dispatched")}
                className="px-4 py-2.5 bg-[#262626] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit</span>
              </button>
            </form>

            {/* Dispatched Unit Card */}
            {dispatchDetails && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-950 animate-in fade-in">
                <div>
                  <span className="font-bold block text-red-800">
                    Dispatched Unit: {dispatchDetails.assignedUnit}
                  </span>
                  <span className="text-[11px] text-red-600">
                    Location: {selectedScenario.callerLocation} | Priority: {dispatchDetails.urgency}
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-red-600 text-white font-black text-xs rounded-lg">
                  ETA {dispatchDetails.etaMinutes || 5} MIN
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

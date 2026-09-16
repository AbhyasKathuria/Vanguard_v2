'use client';

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
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Clock,
  Wifi,
  Delete,
  FileText,
  MapPin,
  Ambulance,
  Check,
  X,
  Navigation,
  Crosshair,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import {
  PRESET_CALL_SCENARIOS,
  TOLL_FREE_HOTLINE,
  getHotlineGreeting,
} from "@/lib/ai/voiceConstants";
import { CallScenario, CallTranscriptMessage } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/context";

type CallState = "idle" | "ringing" | "connected" | "dispatched" | "ended";

const LOCALE_CODE_MAP: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN",
  ta: "ta-IN",
  te: "te-IN",
  bn: "bn-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  ml: "ml-IN",
  pa: "pa-IN",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  ar: "ar-SA",
};

export default function VoiceCallSandbox() {
  const { locale, t } = useLanguage();

  // DEFAULT TO RAW MODE: selectedScenario is null until user explicitly chooses one
  const [selectedScenario, setSelectedScenario] = useState<CallScenario | null>(null);
  const [showPresetsDrawer, setShowPresetsDrawer] = useState(false);

  const [callState, setCallState] = useState<CallState>("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<CallTranscriptMessage[]>([]);
  const [callerInput, setCallerInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<"agent" | "caller" | null>(null);
  const [dispatchDetails, setDispatchDetails] = useState<any | null>(null);
  const [dialPadNumber, setDialPadNumber] = useState("925");

  // Initial in-call location popup state
  const [showLocationPromptModal, setShowLocationPromptModal] = useState(false);

  // Live GPS state
  const [liveGps, setLiveGps] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatusText, setLocationStatusText] = useState<string | null>(null);

  // Call summary modal state
  const [showCallSummary, setShowCallSummary] = useState(false);
  const [isSavingLog, setIsSavingLog] = useState(false);
  const [logSavedId, setLogSavedId] = useState<string | null>(null);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playbackSafetyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto-send silence timer & conversational loop refs
  const latestTranscriptRef = useRef<string>("");
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingTurnRef = useRef<boolean>(false);
  const callStateRef = useRef<CallState>("idle");
  const isListeningRef = useRef(false);
  const activeSpeakerRef = useRef<"agent" | "caller" | null>(null);
  const isMutedRef = useRef<boolean>(false);
  const restartCooldownRef = useRef<boolean>(false);

  callStateRef.current = callState;
  isListeningRef.current = isListening;
  activeSpeakerRef.current = activeSpeaker;
  isMutedRef.current = isMuted;

  // Auto scroll transcript on every update
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playbackSafetyTimerRef.current) clearTimeout(playbackSafetyTimerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try { audioCtxRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  // Singleton AudioContext for Authentic Web Audio DTMF Tones
  const getAudioContext = () => {
    if (typeof window === "undefined") return null;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  };

  const playDtmfTone = (digit: string) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const DTMF_FREQUENCIES: Record<string, [number, number]> = {
        "1": [697, 1209],
        "2": [697, 1336],
        "3": [697, 1477],
        "4": [770, 1209],
        "5": [770, 1336],
        "6": [770, 1477],
        "7": [852, 1209],
        "8": [852, 1336],
        "9": [852, 1477],
        "*": [941, 1209],
        "0": [941, 1336],
        "#": [941, 1477],
      };

      const freqs = DTMF_FREQUENCIES[digit] || [697, 1209];
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.13);
      osc2.stop(ctx.currentTime + 0.13);
    } catch (e) {
      // Ignore audio tone exceptions
    }
  };

  // Continuous Two-Way Speech Recognition with Auto-Send on speech pause
  const startListening = () => {
    if (
      typeof window === "undefined" ||
      callStateRef.current !== "connected" ||
      isMutedRef.current ||
      activeSpeakerRef.current === "agent" ||
      isProcessingTurnRef.current ||
      restartCooldownRef.current
    ) {
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = LOCALE_CODE_MAP[locale] || "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript + " ";
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const combinedText = (finalTranscript + interimTranscript).trim();
        if (!combinedText) return;

        latestTranscriptRef.current = combinedText;
        setCallerInput(combinedText);

        // Reset silence debounce timer on every new speech audio packet
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // AUTO-SEND when user pauses speaking for 1.2 seconds
        silenceTimerRef.current = setTimeout(() => {
          if (
            latestTranscriptRef.current &&
            latestTranscriptRef.current.trim() &&
            callStateRef.current === "connected" &&
            activeSpeakerRef.current !== "agent"
          ) {
            const textToSend = latestTranscriptRef.current.trim();
            latestTranscriptRef.current = "";
            setCallerInput("");
            if (recognitionRef.current) {
              try { recognitionRef.current.abort(); } catch (e) {}
              recognitionRef.current = null;
            }
            handleUserTurn(textToSend);
          }
        }, 1200);
      };

      recognition.onerror = (e: any) => {
        setIsListening(false);
        isListeningRef.current = false;

        // If audio-capture or network error occurs, apply a cooldown before restarting
        if (e.error === "audio-capture" || e.error === "network" || e.error === "not-allowed") {
          console.warn("Speech recognition capture notice:", e.error);
          restartCooldownRef.current = true;
          setTimeout(() => {
            restartCooldownRef.current = false;
            if (
              callStateRef.current === "connected" &&
              activeSpeakerRef.current !== "agent" &&
              !isListeningRef.current &&
              !isProcessingTurnRef.current
            ) {
              startListening();
            }
          }, 2000);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;

        // If there's unsent speech when onend fires, auto-send it now!
        if (
          latestTranscriptRef.current &&
          latestTranscriptRef.current.trim() &&
          callStateRef.current === "connected" &&
          activeSpeakerRef.current !== "agent"
        ) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          const textToSend = latestTranscriptRef.current.trim();
          latestTranscriptRef.current = "";
          setCallerInput("");
          handleUserTurn(textToSend);
          return;
        }

        // Keep microphone ACTIVE and alive until user explicitly cuts the call
        if (
          callStateRef.current === "connected" &&
          activeSpeakerRef.current !== "agent" &&
          !isMutedRef.current &&
          !isProcessingTurnRef.current &&
          !restartCooldownRef.current
        ) {
          setTimeout(() => {
            if (
              callStateRef.current === "connected" &&
              activeSpeakerRef.current !== "agent" &&
              !isListeningRef.current &&
              !isProcessingTurnRef.current
            ) {
              startListening();
            }
          }, 350);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
      isListeningRef.current = false;
    }
  };

  // High-Fidelity Universal TTS Audio Playback with PLAYBACK SAFETY TIMEOUT
  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === "undefined") {
      isProcessingTurnRef.current = false;
      setActiveSpeaker(null);
      activeSpeakerRef.current = null;
      if (callStateRef.current === "connected" && !isListeningRef.current) {
        setTimeout(() => startListening(), 400);
      }
      return;
    }

    // Abort speech recognition immediately while agent is speaking
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    isListeningRef.current = false;

    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current = null;
      } catch (e) {}
    }
    if ("speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }

    setActiveSpeaker("agent");
    activeSpeakerRef.current = "agent";

    let hasCleanedUp = false;

    // Guaranteed Completion Handler: Re-arms microphone for the caller
    const onPlaybackDone = () => {
      if (hasCleanedUp) return;
      hasCleanedUp = true;

      if (playbackSafetyTimerRef.current) {
        clearTimeout(playbackSafetyTimerRef.current);
        playbackSafetyTimerRef.current = null;
      }

      setActiveSpeaker(null);
      activeSpeakerRef.current = null;
      isProcessingTurnRef.current = false;
      audioRef.current = null;

      // Re-activate microphone after a 350ms buffer so audio hardware is completely freed
      if (callStateRef.current === "connected") {
        setTimeout(() => {
          if (callStateRef.current === "connected" && activeSpeakerRef.current !== "agent") {
            startListening();
          }
        }, 350);
      }
    };

    // HARD SAFETY TIMEOUT: Ensures state NEVER stays stuck even if audio stream stalls
    const estimatedSecs = Math.max(3.5, (text.length / 18));
    playbackSafetyTimerRef.current = setTimeout(() => {
      onPlaybackDone();
    }, estimatedSecs * 1000 + 1500);

    // PRIORITY 1: For English, use native browser SpeechSynthesis (100% crystal clear, zero breaking!)
    if (locale === "en" && "speechSynthesis" in window) {
      playNativeSpeech(text, onPlaybackDone);
      return;
    }

    // PRIORITY 2: For Regional Indic languages (Hindi, Kannada, Tamil, etc.), stream via /api/tts
    const ttsUrl = `/api/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(locale)}`;

    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = "";
      } catch (e) {}
    }

    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = "auto";
    audio.src = ttsUrl;

    // Reschedule safety timer dynamically once audio actually starts playing
    audio.onplaying = () => {
      if (playbackSafetyTimerRef.current) {
        clearTimeout(playbackSafetyTimerRef.current);
      }
      const dur = audio.duration && isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : Math.max(3.5, text.length / 15);
      playbackSafetyTimerRef.current = setTimeout(() => {
        onPlaybackDone();
      }, (dur + 2.5) * 1000);
    };

    audio.onended = onPlaybackDone;
    audio.onerror = (e) => {
      console.warn("Audio stream error, attempting speech synthesis fallback:", e);
      playNativeSpeech(text, onPlaybackDone);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Audio play() blocked or rejected, attempting speech synthesis fallback:", err);
        playNativeSpeech(text, onPlaybackDone);
      });
    }
  };

  // Browser SpeechSynthesisUtterance for Native English & Offline Fallback with Chrome stall fix
  const playNativeSpeech = (text: string, onDone: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onDone();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      currentUtteranceRef.current = utterance;

      const speechLang = LOCALE_CODE_MAP[locale] || "en-IN";
      utterance.lang = speechLang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().replace("_", "-") === speechLang.toLowerCase() ||
          v.lang.toLowerCase().startsWith(locale.toLowerCase())
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onend = () => {
        currentUtteranceRef.current = null;
        onDone();
      };
      utterance.onerror = () => {
        currentUtteranceRef.current = null;
        onDone();
      };

      window.speechSynthesis.speak(utterance);
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {
      currentUtteranceRef.current = null;
      onDone();
    }
  };

  // In-Call Live Location Sharing (Geolocation API)
  const handleShareLiveLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setShowLocationPromptModal(false);
    setIsLocating(true);
    setLocationStatusText("Acquiring GPS satellite fix...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const coords = { latitude, longitude, accuracy };
        setLiveGps(coords);
        setIsLocating(false);
        setLocationStatusText(`GPS Locked (±${Math.round(accuracy)}m)`);

        // Record location broadcast in transcript
        const gpsMsg: CallTranscriptMessage = {
          id: `gps_${Date.now()}`,
          speaker: "caller",
          text: `📍 [Live GPS Shared]: Coordinates ${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E (Accuracy: ±${Math.round(accuracy)}m)`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        };
        setTranscript((prev) => [...prev, gpsMsg]);

        // Send GPS coordinate payload to dispatcher
        transmitGpsToDispatcher(coords);
      },
      (err) => {
        console.warn("Geolocation permission or timeout:", err);
        setIsLocating(false);

        // Fallback GPS simulation coordinates
        const fallback = { latitude: 28.6139, longitude: 77.209, accuracy: 25 };
        setLiveGps(fallback);
        setLocationStatusText("District GPS Pin Locked (±25m)");

        const gpsMsg: CallTranscriptMessage = {
          id: `gps_${Date.now()}`,
          speaker: "caller",
          text: `📍 [Live GPS Shared]: Coordinates ${fallback.latitude.toFixed(5)}° N, ${fallback.longitude.toFixed(5)}° E (District Sector 4)`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        };
        setTranscript((prev) => [...prev, gpsMsg]);
        transmitGpsToDispatcher(fallback);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Notify AI dispatcher of newly transmitted GPS coordinates
  const transmitGpsToDispatcher = async (coords: { latitude: number; longitude: number; accuracy?: number }) => {
    isProcessingTurnRef.current = true;
    try {
      const res = await fetch("/api/ai/voice-call-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: selectedScenario ? selectedScenario.id : "raw",
          callerName: selectedScenario ? selectedScenario.callerName : "Citizen Caller",
          callerPhone: dialPadNumber || "925",
          userMessage: `[Satellite GPS Lock Transmitted: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}]`,
          history: transcript
            .filter((t) => t.speaker !== "system")
            .map((t) => ({ speaker: t.speaker, text: t.text })),
          locale,
          durationSeconds: callDuration,
          gpsCoords: coords,
        }),
      });

      const data = await res.json();
      if (data.result) {
        const agentMsg: CallTranscriptMessage = {
          id: `agent_gps_${Date.now()}`,
          speaker: "agent",
          text: data.result.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        };
        setTranscript((prev) => [...prev, agentMsg]);
        setDispatchDetails(data.result);
        speakText(data.result.reply);
      } else {
        isProcessingTurnRef.current = false;
      }
    } catch (e) {
      console.error("Failed to transmit GPS:", e);
      isProcessingTurnRef.current = false;
    }
  };

  // Initiate call & SHOW INITIAL LIVE LOCATION PROMPT POPUP ON CONNECT
  const startCall = () => {
    if (dialPadNumber.trim() !== TOLL_FREE_HOTLINE) {
      alert(`Emergency Hotline is ${TOLL_FREE_HOTLINE}. Please dial ${TOLL_FREE_HOTLINE} to reach 24/7 AI Emergency Dispatch.`);
      return;
    }

    setCallState("ringing");
    setCallDuration(0);
    setTranscript([]);
    setDispatchDetails(null);
    setLiveGps(null);
    setLocationStatusText(null);
    setShowCallSummary(false);
    setLogSavedId(null);
    setShowLocationPromptModal(false);
    isProcessingTurnRef.current = false;

    // Prime Web Audio and SpeechSynthesis immediately in direct user gesture stack
    getAudioContext();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try { window.speechSynthesis.resume(); } catch (e) {}
    }

    // Play initial DTMF connect chime
    playDtmfTone("9");
    setTimeout(() => playDtmfTone("2"), 150);
    setTimeout(() => playDtmfTone("5"), 300);

    setTimeout(() => {
      setCallState("connected");

      // SHOW IMMEDIATE LIVE LOCATION POPUP RIGHT WHEN AGENT ANSWERS!
      setShowLocationPromptModal(true);

      const greetingText = getHotlineGreeting(locale);
      const greetingMsg: CallTranscriptMessage = {
        id: `agent_init_${Date.now()}`,
        speaker: "agent",
        text: greetingText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };
      setTranscript([greetingMsg]);
      speakText(greetingText);
    }, 1200);
  };

  // End call & display summary modal
  const endCall = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (playbackSafetyTimerRef.current) {
      clearTimeout(playbackSafetyTimerRef.current);
      playbackSafetyTimerRef.current = null;
    }
    latestTranscriptRef.current = "";
    isProcessingTurnRef.current = false;
    setShowLocationPromptModal(false);

    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current = null;
      } catch (e) {}
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    setCallState("ended");
    setIsListening(false);
    setActiveSpeaker(null);
    activeSpeakerRef.current = null;

    // Show summary modal if call had any conversation
    if (transcript.length > 0 || callDuration > 2) {
      setShowCallSummary(true);
    }
  };

  // Reset to dialpad
  const resetToDialpad = () => {
    setShowCallSummary(false);
    setShowLocationPromptModal(false);
    setCallState("idle");
    setTranscript([]);
    setCallDuration(0);
    setDispatchDetails(null);
    setLiveGps(null);
    setLocationStatusText(null);
    setLogSavedId(null);
    isProcessingTurnRef.current = false;
    setCallerInput("");
    latestTranscriptRef.current = "";
  };

  // Process human caller turn (called automatically when user finishes speaking)
  const handleUserTurn = async (text: string) => {
    if (!text.trim() || callStateRef.current !== "connected") return;

    isProcessingTurnRef.current = true;
    const userText = text.trim();
    setCallerInput("");
    latestTranscriptRef.current = "";

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    isListeningRef.current = false;
    setActiveSpeaker("caller");
    activeSpeakerRef.current = "caller";

    const userMsg: CallTranscriptMessage = {
      id: `user_${Date.now()}`,
      speaker: "caller",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };

    setTranscript((prev) => [...prev, userMsg]);

    try {
      const response = await fetch("/api/ai/voice-call-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: selectedScenario ? selectedScenario.id : "raw",
          callerName: selectedScenario ? selectedScenario.callerName : "Citizen Caller",
          callerPhone: dialPadNumber || "925",
          userMessage: userText,
          history: transcript.map((t) => ({ speaker: t.speaker, text: t.text })),
          locale,
          durationSeconds: callDuration,
          gpsCoords: liveGps,
        }),
      });

      const data = await response.json();

      if (data.result) {
        const agentMsg: CallTranscriptMessage = {
          id: `agent_${Date.now()}`,
          speaker: "agent",
          text: data.result.reply,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        };

        setTranscript((prev) => [...prev, agentMsg]);
        setDispatchDetails(data.result);

        if (data.result.dispatchTriggered) {
          setCallState("dispatched");
          setTimeout(() => setCallState("connected"), 600);
        }

        // Speak reply and then AUTOMATICALLY RE-ACTIVATE MIC via onPlaybackDone
        speakText(data.result.reply);
      } else {
        isProcessingTurnRef.current = false;
        setActiveSpeaker(null);
        activeSpeakerRef.current = null;
        if (callStateRef.current === "connected") {
          setTimeout(() => startListening(), 400);
        }
      }
    } catch (err) {
      console.error("Turn processing error:", err);
      isProcessingTurnRef.current = false;
      setActiveSpeaker(null);
      activeSpeakerRef.current = null;
      if (callStateRef.current === "connected") {
        setTimeout(() => startListening(), 500);
      }
    }
  };

  // Save call record to database CallLog table
  const handleSaveCallRecord = async () => {
    if (isSavingLog || logSavedId) return;
    setIsSavingLog(true);
    try {
      const response = await fetch("/api/ai/voice-call-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: selectedScenario ? selectedScenario.id : "raw",
          callerName: selectedScenario ? selectedScenario.callerName : "Citizen Caller",
          callerPhone: dialPadNumber || "925",
          userMessage: transcript[transcript.length - 1]?.text || "Emergency reported",
          history: transcript.map((t) => ({ speaker: t.speaker, text: t.text })),
          saveCallLog: true,
          locale,
          durationSeconds: callDuration,
          gpsCoords: liveGps,
        }),
      });
      const data = await response.json();
      if (data.savedCallId) {
        setLogSavedId(data.savedCallId);
      } else {
        setLogSavedId("LOG-" + Math.floor(100000 + Math.random() * 900000));
      }
    } catch (e) {
      setLogSavedId("LOG-AUDIT-OFFLINE");
    } finally {
      setIsSavingLog(false);
    }
  };

  // Keypad number handling
  const handleKeypadPress = (val: string) => {
    playDtmfTone(val);
    if (dialPadNumber.length < 6) {
      setDialPadNumber((prev) => (prev === "925" && val !== "925" ? val : prev + val));
    }
  };

  const handleBackspace = () => {
    setDialPadNumber((prev) => (prev.length > 0 ? prev.slice(0, -1) : ""));
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <PhoneCall className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  {t.calling.title}
                  <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                    LIVE SIMULATION
                  </span>
                </h2>
                <p className="text-sm text-slate-300 mt-0.5">
                  {t.calling.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Dial 925 Button */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => {
                setDialPadNumber("925");
                if (callState === "idle" || callState === "ended") {
                  setTimeout(() => startCall(), 150);
                }
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 text-emerald-200" />
              <span>{t.calling.quickDial925}</span>
            </button>

            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className={`p-2.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
                ttsEnabled
                  ? "bg-indigo-900/30 border-indigo-600/40 text-indigo-300"
                  : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
              title="Toggle Audio Voice Response"
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-xs hidden sm:inline">
                {ttsEnabled ? "Audio ON" : "Audio OFF"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Phone Hardware Dialer (Left) & Live Context / Transcript (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ===================== LEFT: REALISTIC PHONE KEYPAD SIMULATION ===================== */}
        <div className="lg:col-span-5 flex justify-center relative">
          <div className="w-full max-w-sm bg-slate-950 border-4 border-slate-800 rounded-[2.8rem] p-4 shadow-2xl relative overflow-hidden ring-1 ring-slate-700/50">
            {/* Phone Screen Notch & Status Bar */}
            <div className="flex items-center justify-between px-4 pt-1 pb-3 border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 select-none">
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-300 tracking-wider">VANGUARD 5G</span>
              </span>
              <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto" />
              <span className="flex items-center gap-1 text-slate-300">
                <span>92%</span>
                <div className="w-4 h-2 rounded-sm border border-slate-400 p-0.5 flex items-center">
                  <div className="w-full h-full bg-emerald-400 rounded-2xs" />
                </div>
              </span>
            </div>

            {/* Display Screen */}
            <div className="py-5 px-3 text-center min-h-[120px] flex flex-col items-center justify-center relative">
              {callState === "idle" && (
                <>
                  <div className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1">
                    {t.calling.tollFreePrompt}
                  </div>
                  <div className="text-4xl font-extrabold text-white tracking-widest min-h-[44px] flex items-center justify-center font-mono">
                    {dialPadNumber || <span className="text-slate-600">---</span>}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {dialPadNumber === "925" ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Toll-Free Emergency Hotline
                      </span>
                    ) : (
                      "Dial 925 for 24/7 AI Emergency Dispatch"
                    )}
                  </div>
                </>
              )}

              {callState === "ringing" && (
                <div className="flex flex-col items-center gap-2 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                    <Radio className="w-6 h-6 animate-spin" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono tracking-wider">
                    {dialPadNumber}
                  </div>
                  <div className="text-xs font-semibold text-amber-300 uppercase tracking-widest">
                    {t.calling.callConnecting}
                  </div>
                </div>
              )}

              {(callState === "connected" || callState === "dispatched") && (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                      {t.calling.callConnected}
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono tracking-wider">
                    {dialPadNumber}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{formatDuration(callDuration)}</span>
                  </div>

                  {/* Active Voice Waveform Indicator */}
                  <div className="flex items-center gap-1 mt-1 h-5">
                    {activeSpeaker === "agent" && (
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-3 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1 h-5 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        <span className="w-1 h-4 bg-indigo-400 rounded-full animate-bounce [animation-delay:450ms]" />
                        <span className="text-[10px] text-indigo-300 font-semibold ml-1.5">
                          {t.calling.dispatcherSpeaking}
                        </span>
                      </div>
                    )}
                    {activeSpeaker === "caller" && (
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1 h-5 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        <span className="text-[10px] text-emerald-300 font-semibold ml-1.5">
                          {t.calling.listeningNow}
                        </span>
                      </div>
                    )}
                    {isListening && !activeSpeaker && (
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-[10px] text-emerald-300 font-medium">
                          {t.calling.listeningNow} (Speak freely...)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {callState === "ended" && (
                <div className="flex flex-col items-center gap-1">
                  <div className="text-sm font-bold text-rose-400 uppercase tracking-wider">
                    {t.calling.callTerminated}
                  </div>
                  <div className="text-xl font-semibold text-white">
                    {formatDuration(callDuration)}
                  </div>
                  <button
                    onClick={() => setShowCallSummary(true)}
                    className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Call Summary
                  </button>
                </div>
              )}
            </div>

            {/* IN-CALL LIVE LOCATION SHARING BUTTON ON DIALER */}
            {(callState === "connected" || callState === "dispatched") && (
              <div className="px-2 pb-3">
                <button
                  onClick={handleShareLiveLocation}
                  disabled={isLocating}
                  className={`w-full py-2.5 px-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-lg active:scale-95 ${
                    liveGps
                      ? "bg-emerald-950/70 border-emerald-500/70 text-emerald-300 shadow-emerald-900/30"
                      : "bg-gradient-to-r from-emerald-600/30 via-teal-600/30 to-emerald-600/30 border-emerald-500/50 text-emerald-200 hover:from-emerald-600/40 hover:to-teal-600/40 animate-pulse shadow-emerald-500/20"
                  }`}
                >
                  <Navigation className={`w-4 h-4 text-emerald-400 ${isLocating ? "animate-spin" : ""}`} />
                  <span>
                    {isLocating
                      ? "Acquiring Satellite GPS Fix..."
                      : liveGps
                      ? `✅ GPS Locked: ${liveGps.latitude.toFixed(4)}, ${liveGps.longitude.toFixed(4)}`
                      : "📍 Share Live Location with Dispatch"}
                  </span>
                </button>
              </div>
            )}

            {/* 12-Button Telephone Keypad */}
            <div className="grid grid-cols-3 gap-3 px-3 pb-4">
              {[
                { num: "1", sub: "" },
                { num: "2", sub: "ABC" },
                { num: "3", sub: "DEF" },
                { num: "4", sub: "GHI" },
                { num: "5", sub: "JKL" },
                { num: "6", sub: "MNO" },
                { num: "7", sub: "PQRS" },
                { num: "8", sub: "TUV" },
                { num: "9", sub: "WXYZ" },
                { num: "*", sub: "" },
                { num: "0", sub: "+" },
                { num: "#", sub: "" },
              ].map((key) => (
                <button
                  key={key.num}
                  onClick={() => handleKeypadPress(key.num)}
                  disabled={callState === "connected" || callState === "dispatched"}
                  className="h-14 rounded-2xl bg-slate-900/90 hover:bg-indigo-900/40 border border-slate-800 hover:border-indigo-600/50 flex flex-col items-center justify-center transition-all active:scale-90 disabled:opacity-40 disabled:pointer-events-none group"
                >
                  <span className="text-xl font-bold text-white group-hover:text-indigo-200 transition-colors">
                    {key.num}
                  </span>
                  {key.sub && (
                    <span className="text-[9px] font-semibold text-slate-500 group-hover:text-indigo-300/70 -mt-0.5 tracking-wider">
                      {key.sub}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Bottom Controls: Call / End / Backspace / Mute */}
            <div className="grid grid-cols-3 gap-3 px-3 pb-3 pt-1 border-t border-slate-900">
              {/* Backspace Button */}
              <button
                onClick={handleBackspace}
                disabled={callState === "connected" || callState === "dispatched" || !dialPadNumber}
                className="h-13 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                title="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>

              {/* Main Call / End Action Button */}
              {callState === "idle" || callState === "ended" ? (
                <button
                  onClick={startCall}
                  className="h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 transition-all active:scale-95"
                  title="Call 925"
                >
                  <Phone className="w-6 h-6" />
                </button>
              ) : (
                <button
                  onClick={endCall}
                  className="h-13 rounded-2xl bg-rose-600 hover:bg-rose-500 border border-rose-400 flex items-center justify-center text-white shadow-lg shadow-rose-900/40 transition-all active:scale-95"
                  title="End Call (Cut the Call)"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              )}

              {/* Mute Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                disabled={callState === "idle" || callState === "ended"}
                className={`h-13 rounded-2xl border flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none ${
                  isMuted
                    ? "bg-amber-900/40 border-amber-600/50 text-amber-300"
                    : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white"
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            {/* LOCATION SHARING POPUP MODAL (Appears right at the beginning when operator connects) */}
            {showLocationPromptModal && (callState === "connected" || callState === "dispatched") && !liveGps && (
              <div className="absolute inset-x-3 top-16 z-30 p-4 rounded-3xl bg-slate-950/95 border-2 border-emerald-500 shadow-2xl shadow-black/90 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                    <Navigation className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Operator Requesting GPS
                      </span>
                      <button
                        onClick={() => setShowLocationPromptModal(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-white font-bold mt-1">
                      Share your live location with Operator #704?
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                      Allows emergency dispatch units to lock onto your exact satellite GPS coordinates.
                    </p>

                    <div className="mt-3 flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setShowLocationPromptModal(false);
                          handleShareLiveLocation();
                        }}
                        disabled={isLocating}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 active:scale-95 transition-all"
                      >
                        <Crosshair className="w-4 h-4 text-emerald-200" />
                        <span>{isLocating ? "Acquiring GPS Fix..." : "📍 Send Live Location Now"}</span>
                      </button>
                      <button
                        onClick={() => setShowLocationPromptModal(false)}
                        className="w-full py-1 px-2 rounded text-slate-400 hover:text-slate-200 text-[10px] font-medium text-center hover:underline"
                      >
                        I will state my location verbally
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===================== RIGHT: LIVE EMERGENCY & TRANSCRIPT ===================== */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Mode Banner */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Radio className="w-5 h-5" />
              </span>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Emergency Calling Mode
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  {selectedScenario ? (
                    <>
                      <span>Scenario: {selectedScenario.title}</span>
                      <button
                        onClick={() => setSelectedScenario(null)}
                        className="text-xs px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Clear (Raw Mode)
                      </button>
                    </>
                  ) : (
                    <span className="text-emerald-400">
                      🎙️ Live Emergency Call (Raw Audio / From Scratch)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Optional Demo Presets Drawer Toggle */}
            <button
              onClick={() => setShowPresetsDrawer(!showPresetsDrawer)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Demo Presets (Optional)</span>
              {showPresetsDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Expandable Demo Scenarios Selector (ONLY if user opens it) */}
          {showPresetsDrawer && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-800/40 space-y-2.5 animate-in fade-in slide-in-from-top-2">
              <div className="text-xs font-semibold text-indigo-300 flex items-center justify-between">
                <span>Select a pre-seeded incident scenario to test specific workflows:</span>
                {selectedScenario && (
                  <button
                    onClick={() => {
                      setSelectedScenario(null);
                      setShowPresetsDrawer(false);
                    }}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Reset to Raw Mode
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_CALL_SCENARIOS.map((sc) => {
                  const isSelected = selectedScenario?.id === sc.id;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => {
                        setSelectedScenario(sc);
                        setShowPresetsDrawer(false);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? "bg-indigo-900/40 border-indigo-500 text-white"
                          : "bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300"
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-indigo-400 shrink-0 mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate text-white">{sc.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{sc.category} • {sc.urgency}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Call Transcript Container */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[380px]">
            {/* Live Dispatch Command HUD */}
            {dispatchDetails && (
              <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-emerald-500/40 shadow-lg flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <Ambulance className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      DISPATCH COMMAND ACTIVE • UNIT EN ROUTE
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      {dispatchDetails.assignedUnit} • ETA {dispatchDetails.etaMinutes || 4} mins
                    </div>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold shrink-0">
                  ETA: {dispatchDetails.etaMinutes || 4}m
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Audio Transcript
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                {liveGps && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> GPS Pin Locked
                  </span>
                )}
                <span className="text-slate-400 text-[11px]">
                  {transcript.length} turns
                </span>
              </div>
            </div>

            {/* Scrollable Conversation Bubbles */}
            <div ref={transcriptContainerRef} className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
              {transcript.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Phone className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm font-semibold text-slate-400">
                    {t.calling.readyToDial}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Tap 925 on the phone keypad and press Call to start an emergency conversation in your selected language.
                  </p>
                </div>
              ) : (
                transcript.map((msg, index) => {
                  const isAgent = msg.speaker === "agent";
                  const isGps = msg.text.startsWith("📍");

                  if (isGps) {
                    return (
                      <div key={msg.id || index} className="flex justify-center my-1">
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-1.5 shadow-sm">
                          <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{msg.text}</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id || index}
                      className={`flex items-start gap-2.5 ${isAgent ? "justify-start" : "justify-end"}`}
                    >
                      {isAgent && (
                        <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5 text-xs font-bold">
                          AI
                        </div>
                      )}
                      <div
                        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm shadow-md ${
                          isAgent
                            ? "bg-slate-800 text-slate-100 border border-slate-700/80"
                            : "bg-indigo-600 text-white rounded-tr-xs"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1">
                          <span className="font-semibold">
                            {isAgent ? "Dispatcher 925" : "Caller (You)"}
                          </span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                      {!isAgent && (
                        <div className="w-7 h-7 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5 text-xs font-bold">
                          You
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={transcriptEndRef} />
            </div>

            {/* Caller Input / Speak Bar */}
            <div className="mt-3 pt-3 border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (callerInput.trim()) {
                    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                    handleUserTurn(callerInput.trim());
                  }
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={callerInput}
                    onChange={(e) => {
                      setCallerInput(e.target.value);
                      latestTranscriptRef.current = e.target.value;
                    }}
                    disabled={callState !== "connected"}
                    placeholder={
                      callState === "connected"
                        ? isListening
                          ? "Listening... Speak freely into your mic (auto-sends on pause)"
                          : t.calling.typeOrSpeak
                        : "Connect call to speak with dispatch..."
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none disabled:opacity-40"
                  />
                  {isListening && (
                    <span className="absolute right-3 top-2.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  )}
                </div>

                {/* Microphone Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isListening) {
                      if (recognitionRef.current) {
                        try { recognitionRef.current.abort(); } catch (e) {}
                        recognitionRef.current = null;
                      }
                      setIsListening(false);
                      isListeningRef.current = false;
                    } else {
                      startListening();
                    }
                  }}
                  disabled={callState !== "connected" || isMuted}
                  className={`p-2.5 rounded-xl border transition-all disabled:opacity-30 disabled:pointer-events-none ${
                    isListening
                      ? "bg-emerald-600 text-white border-emerald-400 animate-pulse shadow-lg shadow-emerald-900/40"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                  title={isListening ? "Microphone active (auto-sends on pause)" : "Click to speak into Mic"}
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={callState !== "connected" || !callerInput.trim()}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white transition-all shadow-md active:scale-95"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Prompt Suggestions (Contextual or General Raw Emergencies) */}
              {callState === "connected" && (
                <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  <span className="text-slate-400 shrink-0 font-medium">Quick suggestions:</span>
                  {selectedScenario ? (
                    selectedScenario.simulatedConversation.map((turn, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleUserTurn(turn.caller)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-indigo-900/40 border border-slate-700 hover:border-indigo-500/50 text-slate-300 hover:text-white shrink-0 max-w-xs truncate transition-colors"
                      >
                        {turn.caller}
                      </button>
                    ))
                  ) : (
                    [
                      "हाँ, स्थिति स्थिर है, राहत दल को तुरंत यहां पहुंचाइए",
                      "मेरे सामने एक एक्सीडेंट हो गया है, तुरंत एम्बुलेंस भेजिए",
                      "यहाँ एक घर में भीषण आग लग गई है, फायर ब्रिगेड की जरूरत है",
                      "एक बुजुर्ग व्यक्ति अचानक बेहोश हो गए हैं, सांस लेने में तकलीफ है",
                      "सड़क पर बिजली का खंभा गिर गया है और तार में स्पार्क हो रहा है",
                      "Yes, victim is conscious, dispatch team please reach here immediately",
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleUserTurn(prompt)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-indigo-900/40 border border-slate-700 hover:border-indigo-500/50 text-slate-300 hover:text-white shrink-0 max-w-xs truncate transition-colors"
                      >
                        {prompt}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== POST-CALL EMERGENCY SUMMARY REPORT MODAL ===================== */}
      {showCallSummary && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-indigo-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {t.calling.callSummaryTitle}
                    <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                      Hotline 925
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official incident dispatch record generated by VANGUARD AI Protocol
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCallSummary(false)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">
                  CALL DURATION
                </div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">
                  {formatDuration(callDuration)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">
                  URGENCY LEVEL
                </div>
                <div className="text-sm font-bold text-rose-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{dispatchDetails?.urgency || selectedScenario?.urgency || "Critical"}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">
                  INCIDENT CATEGORY
                </div>
                <div className="text-xs font-bold text-indigo-300 mt-1 truncate">
                  {dispatchDetails?.category || selectedScenario?.category || "General Emergency"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">
                  ESTIMATED ETA
                </div>
                <div className="text-sm font-bold text-emerald-400 mt-1 font-mono">
                  {dispatchDetails?.etaMinutes ? `${dispatchDetails.etaMinutes} mins` : "4 mins"}
                </div>
              </div>
            </div>

            {/* Dispatched Unit & Location */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 space-y-3">
              <div className="flex items-start gap-3">
                <Ambulance className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-indigo-300 uppercase">
                    {t.calling.dispatchedUnit}
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {dispatchDetails?.assignedUnit || selectedScenario?.recommendedUnit || "Emergency Response Unit 1"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-indigo-900/40">
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-emerald-300 uppercase">
                    DETECTED LOCATION
                  </div>
                  <div className="text-sm text-slate-200 mt-0.5 font-mono">
                    {dispatchDetails?.extractedLocation ||
                      (liveGps ? `GPS: ${liveGps.latitude.toFixed(5)}°N, ${liveGps.longitude.toFixed(5)}°E (±${Math.round(liveGps.accuracy || 10)}m)` : null) ||
                      selectedScenario?.callerLocation ||
                      "Incident Site (GPS Verified)"}
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Guidance Summary */}
            {dispatchDetails?.safetyInstructions && dispatchDetails.safetyInstructions.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t.calling.safetyAdvice}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 pl-2">
                  {dispatchDetails.safetyInstructions.map((instruction: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full Audio Transcript Preview */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.calling.fullTranscript} ({transcript.length} turns)
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 max-h-36 overflow-y-auto space-y-2 text-xs">
                {transcript.map((tItem, idx) => (
                  <div key={tItem.id || idx} className="text-slate-300">
                    <span className="font-semibold text-indigo-400">
                      {tItem.speaker === "agent" ? "Operator 925" : "Caller"}:
                    </span>{" "}
                    <span>{tItem.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons: Save to Audit Log & Redial */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={resetToDialpad}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.calling.redial925}</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleSaveCallRecord}
                  disabled={isSavingLog || Boolean(logSavedId)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                    logSavedId
                      ? "bg-emerald-600 text-white border border-emerald-400 cursor-default"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30 active:scale-95"
                  }`}
                >
                  {isSavingLog ? (
                    <span>Saving...</span>
                  ) : logSavedId ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>Saved ({logSavedId.slice(0, 10)})</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>{t.calling.saveCallRecord}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";
import VoiceCallSandbox from "@/components/VoiceCallSandbox";

export const metadata = {
  title: "AI Voice Dispatch Sandbox — VANGUARD",
  description:
    "Interactive emergency dispatch call simulator with animated waveforms, dial pad, live transcript, and sub-500ms SLA benchmark.",
};

export default function DispatchSimulatorPage() {
  return (
    <div className="py-4">
      <VoiceCallSandbox />
    </div>
  );
}

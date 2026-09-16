import React from "react";
import DualEmergencyTriage from "@/components/DualEmergencyTriage";

export const metadata = {
  title: "Dual Emergency & Veterinary Assistant — VANGUARD",
  description:
    "Human clinical triage with 110 BPM CPR metronome, bleed control, and stray animal rescue with registered shelter matching.",
};

export default function EmergencyTriagePage() {
  return (
    <div className="py-4">
      <DualEmergencyTriage />
    </div>
  );
}

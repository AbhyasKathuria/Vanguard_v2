import React from "react";
import FarmerHub from "@/components/farmer/FarmerHub";

export const metadata = {
  title: "Agrarian Farmer Hub & Cattle Care — VANGUARD",
  description:
    "AI crop disease diagnosis, cattle emergency veterinary triage, APMC mandi rates, canal water schedule, and PM Fasal Bima assistance.",
};

export default function FarmerPage() {
  return (
    <div className="py-4">
      <FarmerHub />
    </div>
  );
}

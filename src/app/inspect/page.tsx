import React from "react";
import CivicAssetInspection from "@/components/inspection/CivicAssetInspection";

export const metadata = {
  title: "Civic Asset & School Inspection Audit — VANGUARD",
  description:
    "Standardized verification checklists for visiting officers, Panchayats, and BDOs with tamper-proof GPS & timestamp watermarked evidence.",
};

export default function InspectPage() {
  return (
    <div className="py-4 max-w-5xl mx-auto">
      <CivicAssetInspection />
    </div>
  );
}

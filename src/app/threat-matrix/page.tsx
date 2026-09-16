import React from "react";
import GeospatialCommandCenter from "@/components/dashboard/GeospatialCommandCenter";

export const metadata = {
  title: "Civic Threat Matrix & Geospatial Command Center — VANGUARD",
  description:
    "Spatial risk scoring, MapTiler thematic hazard heatmaps, village health matrices (RAG), and time-to-decay calculations for rural infrastructure.",
};

export default function ThreatMatrixPage() {
  return (
    <div className="py-4">
      <GeospatialCommandCenter />
    </div>
  );
}

import React from "react";
import MeshRelaySimulator from "@/components/offline/MeshRelaySimulator";

export const metadata = {
  title: "Peer-to-Peer Emergency Mesh Relay — VANGUARD",
  description:
    "Zero-cellular emergency communication simulator demonstrating packet forwarding across rural mesh nodes during flood and cyclone outages.",
};

export default function MeshPage() {
  return (
    <div className="py-4 max-w-5xl mx-auto">
      <MeshRelaySimulator />
    </div>
  );
}

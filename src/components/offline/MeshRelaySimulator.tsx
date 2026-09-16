"use client";

import React, { useState } from "react";
import {
  Radio,
  Wifi,
  WifiOff,
  Shield,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Siren,
  Smartphone,
  Share2,
  Layers,
  Sparkles,
} from "lucide-react";

interface MeshNode {
  id: string;
  name: string;
  type: string;
  distanceKm: number;
  battery: string;
  protocol: string;
  isOnline: boolean;
  status: "idle" | "receiving" | "relayed";
}

const INITIAL_NODES: MeshNode[] = [
  {
    id: "node_1",
    name: "Citizen Phone (Zero Bars)",
    type: "Originator (Offline)",
    distanceKm: 0,
    battery: "68%",
    protocol: "BLE / Wi-Fi Direct",
    isOnline: true,
    status: "idle",
  },
  {
    id: "node_2",
    name: "Solar Handpump Mesh Beacon",
    type: "Edge Micro-Relay",
    distanceKm: 0.8,
    battery: "94% (Solar)",
    protocol: "BLE Mesh 5.3",
    isOnline: true,
    status: "idle",
  },
  {
    id: "node_3",
    name: "Gram Panchayat Hub",
    type: "Local Aggregator",
    distanceKm: 2.3,
    battery: "UPS Battery",
    protocol: "802.11ah HaLow",
    isOnline: true,
    status: "idle",
  },
  {
    id: "node_4",
    name: "Hilltop Solar Repeater",
    type: "Long-Range LoRa Bridge",
    distanceKm: 6.5,
    battery: "100%",
    protocol: "LoRa 865-867 MHz",
    isOnline: true,
    status: "idle",
  },
  {
    id: "node_5",
    name: "VANGUARD Cloud Gateway",
    type: "District Command (Online)",
    distanceKm: 14.2,
    battery: "Grid Powered",
    protocol: "Satellite / 5G Fiber",
    isOnline: true,
    status: "idle",
  },
];

export default function MeshRelaySimulator() {
  const [nodes, setNodes] = useState<MeshNode[]>(INITIAL_NODES);
  const [isRelaying, setIsRelaying] = useState(false);
  const [currentHop, setCurrentHop] = useState<number>(-1);
  const [logs, setLogs] = useState<string[]>([]);
  const [packetDelivered, setPacketDelivered] = useState(false);
  const [packetHash, setPacketHash] = useState<string | null>(null);

  const toggleNodeOnline = (nodeId: string) => {
    if (isRelaying) return;
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, isOnline: !n.isOnline } : n))
    );
  };

  const runSimulation = async () => {
    setIsRelaying(true);
    setPacketDelivered(false);
    setCurrentHop(0);
    const hash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
    setPacketHash(hash);

    const logMessages: string[] = [
      `[00:00.00] 🚨 SOS Broadcast initiated from Citizen Node 1 (Cellular: 0 Bars). Encrypted Payload Hash: ${hash}`,
    ];
    setLogs([...logMessages]);

    // Iterate through hops
    for (let i = 0; i < nodes.length; i++) {
      setCurrentHop(i);
      const currentNode = nodes[i];

      if (!currentNode.isOnline) {
        logMessages.push(
          `[00:0${i + 1}.20] ⚠️ LINK FAILURE at ${currentNode.name}! Node unreachable. Attempting dynamic multi-hop reroute...`
        );
        setLogs([...logMessages]);
        await new Promise((r) => setTimeout(r, 900));

        // Multi-hop jump over dead node if possible
        if (i < nodes.length - 1 && nodes[i + 1].isOnline) {
          logMessages.push(
            `[00:0${i + 1}.80] 🔀 Multi-Hop bypass: Re-routed directly to ${nodes[i + 1].name} using high-gain radio transceiver.`
          );
          setLogs([...logMessages]);
        } else {
          logMessages.push(`[00:0${i + 1}.99] ❌ Mesh path broken. Packet held in store-and-forward buffer.`);
          setLogs([...logMessages]);
          setIsRelaying(false);
          return;
        }
      } else {
        logMessages.push(
          `[00:0${i + 1}.15] 📡 Hop ${i + 1}/${nodes.length}: Packet received by [${currentNode.name}] via ${currentNode.protocol} (${currentNode.distanceKm} km).`
        );
        setLogs([...logMessages]);
        await new Promise((r) => setTimeout(r, 650));
      }
    }

    logMessages.push(
      `[00:06.40] ✅ PACKET DELIVERED! District Command Center received verified SOS packet. Proximity auto-dispatch triggered.`
    );
    setLogs([...logMessages]);
    setPacketDelivered(true);
    setIsRelaying(false);
  };

  return (
    <div className="bg-[#171717] rounded-3xl border border-white/10 p-5 sm:p-7 shadow-2xl text-white space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              Peer-to-Peer Emergency Mesh Relay Simulator
            </h2>
          </div>
          <p className="text-xs text-neutral-400">
            Simulates zero-cellular disaster communications: hop-by-hop forwarding from offline dead zones to online gateway
          </p>
        </div>

        <button
          onClick={runSimulation}
          disabled={isRelaying}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-red-600/30"
        >
          {isRelaying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Siren className="w-4 h-4" />}
          <span>Broadcast SOS via Mesh</span>
        </button>
      </div>

      {/* Topology Flowchart */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
          <span>Mesh Topology (Click any node to toggle power / simulate link failure)</span>
          <span className="text-[11px] text-neutral-500 font-mono">Store-and-Forward Protocol</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {nodes.map((node, idx) => {
            const isCurrent = currentHop === idx && isRelaying;
            const isCompleted = currentHop > idx;
            return (
              <div
                key={node.id}
                onClick={() => toggleNodeOnline(node.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  !node.isOnline
                    ? "bg-red-950/20 border-red-500/40 opacity-70"
                    : isCurrent
                    ? "bg-sky-500/20 border-sky-400 ring-2 ring-sky-400/50 shadow-lg shadow-sky-500/30 scale-102"
                    : isCompleted
                    ? "bg-emerald-950/20 border-emerald-500/40"
                    : "bg-[#212121] border-white/10 hover:border-white/20"
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-sky-400 animate-ping m-2" />
                )}

                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 mb-1">
                    <span>Hop {idx + 1}</span>
                    <span
                      className={`font-mono px-1.5 py-0.5 rounded ${
                        node.isOnline ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {node.isOnline ? "Active" : "Down"}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white leading-tight mb-1">{node.name}</h4>
                  <div className="text-[11px] text-neutral-400">{node.type}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 space-y-0.5 text-[10px] font-mono text-neutral-400">
                  <div>Dist: {node.distanceKm} km</div>
                  <div>Link: {node.protocol}</div>
                  <div>Power: {node.battery}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Packet Delivery Success Banner */}
      {packetDelivered && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-200 animate-in zoom-in-95">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-black text-sm text-white">
                Packet Successfully Reached Cloud Gateway!
              </div>
              <div>End-to-End Latency: 420ms across 4 mesh relays • Cryptographic integrity verified.</div>
            </div>
          </div>
          <span className="font-mono text-[10px] bg-black/40 px-2.5 py-1 rounded text-neutral-300">
            Hash: {packetHash?.slice(0, 14)}...
          </span>
        </div>
      )}

      {/* Live Hop-by-Hop Transmission Console */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
          <span>Relay Telemetry Console</span>
          <button
            onClick={() => setLogs([])}
            className="text-[10px] text-neutral-400 hover:text-white"
          >
            Clear Console
          </button>
        </div>

        <div className="bg-black/60 rounded-2xl p-4 border border-white/10 font-mono text-xs text-neutral-300 space-y-1.5 h-44 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-neutral-500 italic py-8 text-center">
              Click "Broadcast SOS via Mesh" to initiate packet traversal simulation...
            </div>
          ) : (
            logs.map((log, i) => (
              <div
                key={i}
                className={
                  log.includes("FAILURE")
                    ? "text-red-400"
                    : log.includes("DELIVERED")
                    ? "text-emerald-400 font-bold"
                    : log.includes("Hop")
                    ? "text-sky-300"
                    : "text-neutral-300"
                }
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

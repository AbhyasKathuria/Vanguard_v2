"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wrench,
  HeartPulse,
  Siren,
  Sprout,
  Layers,
  Clock,
  MapPin,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Phone,
  Zap,
} from "lucide-react";

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const serviceCategories = [
    {
      id: "civic",
      title: "Civic & Public Infrastructure",
      priority: "MEDIUM Priority",
      sla: "Within 4 Hours",
      radiusKm: 15,
      icon: Wrench,
      badgeColor: "bg-[#dcdcdc] text-[#262626]",
      description:
        "Restoring vital village physical infrastructure including low-voltage power lines, drainage overflows, transformer sparking, and broken public water valves.",
      examples: [
        "Snapped streetlight power line near school",
        "Blocked village drainage canal overflowing onto road",
        "Broken communal handpump and pipeline valve leakage",
        "Cracked solar street pole inverter malfunction",
      ],
      qualifications: "Certified Wireman, Licensed Plumber, or Municipal Lineworker",
      verificationRequired: true,
    },
    {
      id: "health",
      title: "Health & Primary Care Support",
      priority: "HIGH Priority",
      sla: "Within 60 Minutes",
      radiusKm: 20,
      icon: HeartPulse,
      badgeColor: "bg-[#404040] text-white",
      description:
        "Immediate community healthcare logistics including acute medication delivery, elderly triage, maternal care transport, and clinic escort.",
      examples: [
        "Urgent asthma inhaler or insulin delivery to remote farm",
        "Elderly citizen bedridden with high fever and dehydration",
        "Maternal healthcare transport escort to PHC clinic",
        "Basic wound dressing and antiseptic care post injury",
      ],
      qualifications: "Registered Nurse, Certified First Responder, or ASHA Liaison Volunteer",
      verificationRequired: true,
    },
    {
      id: "emergency",
      title: "Emergency Response & Trauma",
      priority: "HIGH Priority",
      sla: "Immediate (< 30 Minutes)",
      radiusKm: 30,
      icon: Siren,
      badgeColor: "bg-[#262626] text-white animate-pulse",
      description:
        "Highest tier crisis routing for road accidents, electrical fire hazards, sudden structural collapse, and acute medical evacuations.",
      examples: [
        "Highway motorcycle accident requiring immediate tourniquet",
        "Transformer burst and active electrical brush fire",
        "Flash flood water ingress threatening village grain depot",
        "Severe venomous snake bite requiring anti-venom dispatch",
      ],
      qualifications: "Red Cross Rural Volunteer, Civil Defense Staff, or Certified Medic",
      verificationRequired: true,
    },
    {
      id: "farming",
      title: "Farming & Agricultural Labor",
      priority: "LOW Priority",
      sla: "Within 24 Hours",
      radiusKm: 25,
      icon: Sprout,
      badgeColor: "bg-[#f5f5f5] text-[#404040]",
      description:
        "Agronomic labor dispatch, irrigation channel breach repair, tractor/tiller mechanical assistance, and seasonal harvest labor coordination.",
      examples: [
        "Canal feeder embankment breach flooding sugarcane bed",
        "Borewell pump motor capacitor burnt during dry spell",
        "Emergency paddy harvest labor crew during unseasonal rain",
        "Tractor hydraulic leak repair during field tilling",
      ],
      qualifications: "Irrigation Mason, Agricultural Technician, or Farm Labor Leader",
      verificationRequired: true,
    },
    {
      id: "other",
      title: "Community Assistance & Public Need",
      priority: "MEDIUM Priority",
      sla: "Within 8 Hours",
      radiusKm: 15,
      icon: Layers,
      badgeColor: "bg-[#f5f5f5] text-[#707070]",
      description:
        "Miscellaneous public welfare needs, lost livestock coordination, ration distribution assistance, and village elder aid.",
      examples: [
        "Pension document delivery for disabled senior citizen",
        "Community hall repair assistance prior to village meeting",
        "Temporary water tanker coordination during dry week",
        "Village waste cleanup coordination near water body",
      ],
      qualifications: "Registered Gram Seva Volunteer or Youth Club Member",
      verificationRequired: true,
    },
  ];

  const filteredServices =
    selectedCategory === "all"
      ? serviceCategories
      : serviceCategories.filter((s) => s.id === selectedCategory);

  return (
    <div className="space-y-8 py-4">
      {/* Hero */}
      <div className="bg-[#1e1e1e] text-white p-7 sm:p-9 rounded-3xl border border-[#383838] shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#53bdeb]/20 text-[#53bdeb] border border-[#53bdeb]/40">
            Public Service Directory
          </span>
          <span className="text-[11px] text-[#a6a6a6]">5 Standard Rural Categories</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          VANGUARD Service Specifications &amp; Routing SLAs
        </h1>
        <p className="text-xs text-[#a6a6a6] max-w-2xl leading-relaxed">
          Every request submitted to VANGUARD is evaluated 100% deterministically. Priority mappings, maximum dispatch radii, and worker verification gates ensure rural citizens receive fast, accountable assistance.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
            selectedCategory === "all" ? "bg-[#262626] text-white shadow-xs" : "bg-white text-[#707070] border border-[#dcdcdc]"
          }`}
        >
          All Categories
        </button>
        {serviceCategories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === c.id ? "bg-[#262626] text-white shadow-xs" : "bg-white text-[#707070] border border-[#dcdcdc]"
            }`}
          >
            {c.title.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredServices.map((svc) => {
          const Icon = svc.icon;
          return (
            <div
              key={svc.id}
              className="bg-white p-6 rounded-2xl border border-[#dcdcdc] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#a6a6a6] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-[#262626] text-white shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#262626]">{svc.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${svc.badgeColor}`}>
                        {svc.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#545454] leading-relaxed">{svc.description}</p>

                {/* Specs Box */}
                <div className="grid grid-cols-2 gap-2 bg-[#f9f9f9] p-3 rounded-xl border border-[#e5e5e5] text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#707070] block">Response Target (SLA)</span>
                    <span className="font-bold text-[#262626] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-[#707070]" />
                      {svc.sla}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#707070] block">Dispatch Radius</span>
                    <span className="font-bold text-[#262626] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#707070]" />
                      Up to {svc.radiusKm} km
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-[#e5e5e5]">
                    <span className="text-[10px] font-bold uppercase text-[#707070] block">Required Qualification</span>
                    <span className="font-semibold text-[#404040] text-[11px]">{svc.qualifications}</span>
                  </div>
                </div>

                {/* Sample Issues */}
                <div>
                  <span className="text-[11px] font-bold text-[#404040] block mb-1">Typical Service Requests:</span>
                  <ul className="space-y-1">
                    {svc.examples.map((ex, i) => (
                      <li key={i} className="text-xs text-[#707070] flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366] shrink-0 mt-0.5" />
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-[#f0f0f0] flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#707070] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#262626]" />
                  Authority Verified Gate
                </span>
                <Link
                  href="/citizen/new-request"
                  className="px-3.5 py-1.5 bg-[#262626] hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  Raise {svc.title.split(" ")[0]} Request
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Matrix Section */}
      <div className="bg-white p-6 rounded-2xl border border-[#dcdcdc] shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[#262626]">Deterministic Routing Dispatch Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f0f0f0] text-[#707070] uppercase font-bold text-[10px] tracking-wider border-b border-[#dcdcdc]">
              <tr>
                <th className="py-2.5 px-3">Problem Category</th>
                <th className="py-2.5 px-3">Engine Priority</th>
                <th className="py-2.5 px-3">SLA Target</th>
                <th className="py-2.5 px-3">Dispatch Radius</th>
                <th className="py-2.5 px-3">Target Personnel</th>
                <th className="py-2.5 px-3">Unverified Gate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5]">
              <tr>
                <td className="py-2.5 px-3 font-bold">Emergency</td>
                <td className="py-2.5 px-3 font-black text-red-600">HIGH</td>
                <td className="py-2.5 px-3">&lt; 30 Mins</td>
                <td className="py-2.5 px-3">30 km</td>
                <td className="py-2.5 px-3">Volunteers &amp; Medics</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">Strictly Blocked</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold">Health / Medical</td>
                <td className="py-2.5 px-3 font-black text-red-600">HIGH</td>
                <td className="py-2.5 px-3">&lt; 60 Mins</td>
                <td className="py-2.5 px-3">20 km</td>
                <td className="py-2.5 px-3">Volunteers &amp; Nurses</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">Strictly Blocked</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold">Civic / Infrastructure</td>
                <td className="py-2.5 px-3 font-bold text-amber-600">MEDIUM</td>
                <td className="py-2.5 px-3">&lt; 4 Hours</td>
                <td className="py-2.5 px-3">15 km</td>
                <td className="py-2.5 px-3">Skilled Trades (Electrician/Plumber)</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">Strictly Blocked</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold">Farming / Agriculture</td>
                <td className="py-2.5 px-3 font-bold text-blue-600">LOW</td>
                <td className="py-2.5 px-3">&lt; 24 Hours</td>
                <td className="py-2.5 px-3">25 km</td>
                <td className="py-2.5 px-3">Masons &amp; Labor Crews</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">Strictly Blocked</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold">General / Other</td>
                <td className="py-2.5 px-3 font-bold text-amber-600">MEDIUM</td>
                <td className="py-2.5 px-3">&lt; 8 Hours</td>
                <td className="py-2.5 px-3">15 km</td>
                <td className="py-2.5 px-3">Community Volunteers</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">Strictly Blocked</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

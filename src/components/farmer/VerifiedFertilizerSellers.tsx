"use client";

import React, { useState } from "react";
import VerifiedResourceCard, { ResourceItemStock } from "@/components/shared/VerifiedResourceCard";
import { Wheat, ShieldAlert, CheckCircle2, AlertTriangle, FileText, Search } from "lucide-react";
import Link from "next/link";

interface SellerRecord {
  id: string;
  name: string;
  license: string;
  distanceKm: number;
  location: string;
  district: string;
  phone: string;
  stock: ResourceItemStock[];
}

const VERIFIED_SELLERS: SellerRecord[] = [
  {
    id: "fert_1",
    name: "IFFCO Kisan Seva Kendra (Milak Mandi)",
    license: "Govt Auth #UP-AGR-40192 • PACS Partner",
    distanceKm: 2.1,
    location: "Mandi Samiti Gate, Milak",
    district: "Rampur",
    phone: "+91 595 234 1102",
    stock: [
      { name: "Neem Coated Urea", statusOrPrice: "₹266.50 / 45kg", badgeType: "success" },
      { name: "DAP (18:46:0)", statusOrPrice: "₹1,350.00 / 50kg", badgeType: "success" },
      { name: "NPK (12:32:16)", statusOrPrice: "₹1,470.00 / 50kg", badgeType: "success" },
      { name: "MOP (Potash)", statusOrPrice: "₹1,650.00 / 50kg", badgeType: "neutral" },
    ],
  },
  {
    id: "fert_2",
    name: "PACS Primary Cooperative Society (Dhamora)",
    license: "Govt Auth #PACS-RAMP-044 • Subsidized Quota",
    distanceKm: 4.8,
    location: "Main Tiraha, Dhamora GP",
    district: "Rampur",
    phone: "+91 595 248 9910",
    stock: [
      { name: "Neem Coated Urea", statusOrPrice: "₹266.50 / 45kg", badgeType: "success" },
      { name: "DAP Subsidized", statusOrPrice: "₹1,350.00 / 50kg", badgeType: "success" },
      { name: "Zinc Sulphate 33%", statusOrPrice: "₹450.00 / 10kg", badgeType: "neutral" },
      { name: "Single Super Phosphate", statusOrPrice: "₹480.00 / 50kg", badgeType: "success" },
    ],
  },
  {
    id: "fert_3",
    name: "Mandya Raitha Sahakari Kendra (Maddur Link)",
    license: "Govt Auth #KA-AGRI-1089 • State Apex Federation",
    distanceKm: 3.2,
    location: "APMC Yard Road, Maddur Gate",
    district: "Mandya",
    phone: "+91 8232 245 611",
    stock: [
      { name: "Neem Coated Urea", statusOrPrice: "₹266.50 / 45kg", badgeType: "success" },
      { name: "DAP (18:46:0)", statusOrPrice: "₹1,350.00 / 50kg", badgeType: "success" },
      { name: "Complex NPK", statusOrPrice: "₹1,470.00 / 50kg", badgeType: "success" },
      { name: "Bio-Fertilizer Culture", statusOrPrice: "₹180.00 / pack", badgeType: "neutral" },
    ],
  },
  {
    id: "fert_4",
    name: "Kribhco Krishak Bharati Sewa Kendra (Sitapur)",
    license: "Govt Auth #KRIB-UP-3312 • Certified Depot",
    distanceKm: 5.6,
    location: "Laharpur Road, Bypass Junction",
    district: "Sitapur",
    phone: "+91 5862 251 400",
    stock: [
      { name: "Neem Coated Urea", statusOrPrice: "₹266.50 / 45kg", badgeType: "success" },
      { name: "DAP (18:46:0)", statusOrPrice: "₹1,350.00 / 50kg", badgeType: "success" },
      { name: "Liquid Nano Urea", statusOrPrice: "₹225.00 / 500ml", badgeType: "success" },
      { name: "Liquid Nano DAP", statusOrPrice: "₹600.00 / 500ml", badgeType: "success" },
    ],
  },
  {
    id: "fert_5",
    name: "Shivamogga TAPCMS Agricultural Depot",
    license: "Govt Auth #KA-SHIV-890 • Cooperative Society",
    distanceKm: 3.9,
    location: "Bhadravati Road, APMC Market",
    district: "Shivamogga",
    phone: "+91 8182 234 890",
    stock: [
      { name: "Neem Coated Urea", statusOrPrice: "₹266.50 / 45kg", badgeType: "success" },
      { name: "DAP (18:46:0)", statusOrPrice: "₹1,350.00 / 50kg", badgeType: "success" },
      { name: "Micronutrient Mix", statusOrPrice: "₹380.00 / 5kg", badgeType: "neutral" },
      { name: "Organic Compost", statusOrPrice: "₹250.00 / 40kg", badgeType: "success" },
    ],
  },
];

export default function VerifiedFertilizerSellers() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [reportedShop, setReportedShop] = useState<string | null>(null);

  const filtered = VERIFIED_SELLERS.filter((s) => {
    if (selectedDistrict !== "all" && s.district !== selectedDistrict) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Official Price Cap Advisory Banner */}
      <div className="bg-emerald-900/90 text-white p-5 rounded-3xl border-2 border-emerald-600 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Official Government MRP Cap Guidelines • उर्वरक मूल्य नियंत्रण</span>
        </div>
        <h3 className="text-base sm:text-lg font-black tracking-tight">
          Strictly Enforced Maximum Retail Prices (MRP)
        </h3>
        <p className="text-xs text-emerald-100 leading-relaxed">
          Under Department of Fertilizers regulations, selling above these subsidized rates is a punishable offense under the Essential Commodities Act. Only purchase from authorized cooperative and retail points displaying the verification badge.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-500/40 text-xs">
            <span className="text-[10px] text-emerald-300 block font-bold">Urea (45 kg)</span>
            <span className="text-sm font-black">Max ₹266.50</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-500/40 text-xs">
            <span className="text-[10px] text-emerald-300 block font-bold">DAP (50 kg)</span>
            <span className="text-sm font-black">Max ₹1,350.00</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-500/40 text-xs">
            <span className="text-[10px] text-emerald-300 block font-bold">NPK (50 kg)</span>
            <span className="text-sm font-black">Max ₹1,470.00</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-500/40 text-xs">
            <span className="text-[10px] text-emerald-300 block font-bold">Nano Urea (500ml)</span>
            <span className="text-sm font-black">Max ₹225.00</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified seller by name or locality..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl outline-none focus:border-emerald-600 dark:text-white"
          />
        </div>

        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="w-full sm:w-56 px-3 py-2.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl outline-none text-neutral-900 dark:text-white"
        >
          <option value="all">All Districts (सभी जिले)</option>
          <option value="Rampur">Rampur District</option>
          <option value="Sitapur">Sitapur District</option>
          <option value="Mandya">Mandya District</option>
          <option value="Shivamogga">Shivamogga District</option>
        </select>
      </div>

      {/* Reported Overcharging Confirmation Modal */}
      {reportedShop && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/80 border-2 border-amber-400 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-black">Overcharging Incident Flagged for: {reportedShop}</span>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                A high-priority complaint ticket has been prepared for the District Agriculture Officer.
              </p>
            </div>
          </div>
          <Link
            href="/smart-complaint"
            className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shrink-0 shadow-sm"
          >
            Submit Evidence Photo
          </Link>
        </div>
      )}

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((seller) => (
          <VerifiedResourceCard
            key={seller.id}
            title={seller.name}
            subTitle={seller.license}
            verificationBadge="✓ Government Authorized"
            distanceKm={seller.distanceKm}
            location={seller.location}
            district={seller.district}
            phone={seller.phone}
            items={seller.stock}
            itemSectionTitle="Authorized Stock & Subsidized Prices"
            reportLabel="कालाबाज़ारी रिपोर्ट"
            onReportClick={() => setReportedShop(seller.name)}
          />
        ))}
      </div>
    </div>
  );
}

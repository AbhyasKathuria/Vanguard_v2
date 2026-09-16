"use client";

import React, { useState } from "react";
import VerifiedResourceCard, { ResourceItemStock } from "@/components/shared/VerifiedResourceCard";
import { HeartPulse, Droplets, ShieldCheck, Search, PlusCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface BloodCenterRecord {
  id: string;
  name: string;
  license: string;
  distanceKm: number;
  location: string;
  district: string;
  phone: string;
  stock: ResourceItemStock[];
}

const VERIFIED_BLOOD_CENTERS: BloodCenterRecord[] = [
  {
    id: "bb_1",
    name: "District Hospital Red Cross Blood Centre (Rampur)",
    license: "Govt Lic #UP-BB-1029 • DGHS & NABH Accredited",
    distanceKm: 1.8,
    location: "Civil Lines, Near Dist Hospital Campus",
    district: "Rampur",
    phone: "+91 595 235 0108",
    stock: [
      { name: "A+ Positive", statusOrPrice: "12 Units In Stock", badgeType: "success" },
      { name: "B+ Positive", statusOrPrice: "18 Units In Stock", badgeType: "success" },
      { name: "O+ Positive", statusOrPrice: "15 Units In Stock", badgeType: "success" },
      { name: "O- Negative", statusOrPrice: "3 Units (Critical)", badgeType: "danger" },
    ],
  },
  {
    id: "bb_2",
    name: "Mandya Institute of Medical Sciences (MIMS) Blood Bank",
    license: "Govt Lic #KA-MIMS-402 • State Apex Centre",
    distanceKm: 2.7,
    location: "MIMS Campus, Bengaluru-Mysuru Highway",
    district: "Mandya",
    phone: "+91 8232 224 091",
    stock: [
      { name: "A+ Positive", statusOrPrice: "14 Units In Stock", badgeType: "success" },
      { name: "B+ Positive", statusOrPrice: "20 Units In Stock", badgeType: "success" },
      { name: "O+ Positive", statusOrPrice: "22 Units In Stock", badgeType: "success" },
      { name: "AB+ Positive", statusOrPrice: "6 Units In Stock", badgeType: "neutral" },
    ],
  },
  {
    id: "bb_3",
    name: "Sitapur District Eye & General Hospital Blood Centre",
    license: "Govt Lic #UP-SIT-0881 • Certified Voluntary Donor Centre",
    distanceKm: 3.4,
    location: "Station Road, Sadar Bazar",
    district: "Sitapur",
    phone: "+91 5862 242 108",
    stock: [
      { name: "A+ Positive", statusOrPrice: "9 Units In Stock", badgeType: "success" },
      { name: "B+ Positive", statusOrPrice: "14 Units In Stock", badgeType: "success" },
      { name: "O+ Positive", statusOrPrice: "11 Units In Stock", badgeType: "success" },
      { name: "B- Negative", statusOrPrice: "2 Units (Urgent Call)", badgeType: "warning" },
    ],
  },
  {
    id: "bb_4",
    name: "McGann District Teaching Hospital Blood Centre (Shivamogga)",
    license: "Govt Lic #KA-SHIV-203 • 24x7 Component Separation Unit",
    distanceKm: 4.1,
    location: "Sagar Road, Medical College Area",
    district: "Shivamogga",
    phone: "+91 8182 222 990",
    stock: [
      { name: "Packed RBC", statusOrPrice: "35 Units Available", badgeType: "success" },
      { name: "Platelet Concentrates", statusOrPrice: "12 Units Available", badgeType: "success" },
      { name: "O- Negative", statusOrPrice: "2 Units (Emergency)", badgeType: "danger" },
      { name: "Fresh Frozen Plasma", statusOrPrice: "24 Bags Available", badgeType: "neutral" },
    ],
  },
];

export default function BloodBankDirectory() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = VERIFIED_BLOOD_CENTERS.filter((c) => {
    if (selectedDistrict !== "all" && c.district !== selectedDistrict) return false;
    if (selectedBloodGroup !== "all") {
      const hasGroup = c.stock.some((s) => s.name.toLowerCase().includes(selectedBloodGroup.toLowerCase()));
      if (!hasGroup) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Emergency Request Banner */}
      <div className="bg-rose-950/90 text-white p-5 rounded-3xl border-2 border-rose-600 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-900 text-rose-200 border border-rose-700 text-xs font-black">
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span>24x7 Emergency Blood Requisition</span>
          </div>
          <h3 className="text-base sm:text-lg font-black tracking-tight">
            Urgent Blood Needed for Patient or Surgery?
          </h3>
          <p className="text-xs text-rose-200 max-w-xl leading-relaxed">
            Broadcast an immediate requisition to registered voluntary blood donors within your district radius.
          </p>
        </div>

        <Link
          href="/citizen/new-request"
          className="px-5 py-3 rounded-xl bg-white hover:bg-neutral-200 text-rose-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 shrink-0 transition-all hover:scale-105 active:scale-95"
        >
          <Droplets className="w-4 h-4 text-rose-600 fill-rose-600" />
          <span>Raise Blood Requisition</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blood bank by hospital name or area..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl outline-none focus:border-rose-600 dark:text-white"
            />
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full sm:w-56 px-3 py-2.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl outline-none text-neutral-900 dark:text-white"
          >
            <option value="all">All Districts</option>
            <option value="Rampur">Rampur District</option>
            <option value="Sitapur">Sitapur District</option>
            <option value="Mandya">Mandya District</option>
            <option value="Shivamogga">Shivamogga District</option>
          </select>
        </div>

        {/* Quick Blood Group Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-xs font-bold text-neutral-500 mr-1">Blood Group:</span>
          {["all", "A+", "B+", "O+", "AB+", "O-", "B-"].map((grp) => (
            <button
              key={grp}
              type="button"
              onClick={() => setSelectedBloodGroup(grp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedBloodGroup === grp
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200"
              }`}
            >
              {grp === "all" ? "All Groups" : grp}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((center) => (
          <VerifiedResourceCard
            key={center.id}
            title={center.name}
            subTitle={center.license}
            verificationBadge="✓ Certified Blood Center"
            distanceKm={center.distanceKm}
            location={center.location}
            district={center.district}
            phone={center.phone}
            items={center.stock}
            itemSectionTitle="Live Stock Telemetry by Blood Group"
            reportLabel="Report Availability"
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  FileText,
  Building,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Coins,
} from "lucide-react";

interface SchemeItem {
  id: string;
  name: string;
  hindiName: string;
  ministry: string;
  benefit: string;
  description: string;
  criteria: string[];
  documents: string[];
  portalUrl: string;
  isMatch: boolean;
}

const ALL_SCHEMES: SchemeItem[] = [
  {
    id: "pm_kisan",
    name: "PM-Kisan Samman Nidhi",
    hindiName: "प्रधानमंत्री किसान सम्मान निधि",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    benefit: "₹6,000 / year (3 installments of ₹2,000 directly into bank account)",
    description: "Income support scheme for all landholding farmer families across the country.",
    criteria: ["Cultivable landholding in applicant's name", "Non-institutional landholder"],
    documents: ["Aadhaar Card", "Land Khatauni / Khasra Record", "Aadhaar-seeded Bank Passbook"],
    portalUrl: "https://pmkisan.gov.in",
    isMatch: true,
  },
  {
    id: "pm_kusum",
    name: "PM-KUSUM Solar Agricultural Pumps",
    hindiName: "पीएम कुसुम सौर पंप योजना",
    ministry: "Ministry of New and Renewable Energy",
    benefit: "Up to 90% subsidy on installation of stand-alone solar agriculture pumps",
    description: "Provides energy and water security to farmers, replacing expensive diesel pump sets with subsidized solar power.",
    criteria: ["Agricultural land available for pump installation", "Existing grid connection optional"],
    documents: ["Land Ownership Document", "Identity Proof (Aadhaar)", "Bank Account Details"],
    portalUrl: "https://pmkusum.mnre.gov.in",
    isMatch: true,
  },
  {
    id: "pmay_g",
    name: "PM Awas Yojana - Gramin (PMAY-G)",
    hindiName: "प्रधानमंत्री आवास योजना - ग्रामीण",
    ministry: "Ministry of Rural Development",
    benefit: "₹1,20,000 assistance in plains / ₹1,30,000 in hilly areas + 90 days MGNREGA wages",
    description: "Financial assistance to houseless households and those living in kutcha/dilapidated houses to build pucca houses.",
    criteria: ["Houseless or living in kutcha house (0, 1, or 2 rooms)", "SECC Deprivation Score verified"],
    documents: ["Aadhaar Card", "Ration Card", "Bank Account Details", "Land or site allotment record"],
    portalUrl: "https://pmayg.nic.in",
    isMatch: true,
  },
  {
    id: "ayushman",
    name: "Ayushman Bharat PM-JAY Health Cover",
    hindiName: "आयुष्मान भारत जन आरोग्य योजना",
    ministry: "National Health Authority (NHA)",
    benefit: "Cashless secondary and tertiary hospitalization cover up to ₹5,00,000 per family/year",
    description: "World's largest health assurance scheme providing cashless inpatient treatment across empaneled public and private hospitals.",
    criteria: ["Identified in SECC 2011 rural deprivation criteria or state ration beneficiary lists"],
    documents: ["Aadhaar Card", "Ration Card (NFSA/BPL)"],
    portalUrl: "https://beneficiary.nha.gov.in",
    isMatch: true,
  },
  {
    id: "pmfby",
    name: "PM Fasal Bima Yojana (Crop Insurance)",
    hindiName: "प्रधानमंत्री फसल बीमा योजना",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    benefit: "Full financial compensation for non-preventable natural crop loss (Flood, Drought, Hail)",
    description: "Lowest subsidized premium rates (2% Kharif, 1.5% Rabi, 5% Commercial crops) with direct insurance payout.",
    criteria: ["Farmers growing notified crops in notified areas (both loanee and non-loanee)"],
    documents: ["Sowing Certificate", "Land Khasra", "Bank Passbook", "Aadhaar"],
    portalUrl: "https://pmfby.gov.in",
    isMatch: true,
  },
  {
    id: "mgnrega",
    name: "MGNREGA 100 Days Wage Guarantee",
    hindiName: "मनरेगा 100 दिवस रोजगार गारंटी",
    ministry: "Ministry of Rural Development",
    benefit: "100 days of guaranteed wage employment per financial year at statutory state rates",
    description: "Enhances livelihood security in rural areas by providing at least 100 days of wage employment for manual work.",
    criteria: ["Adult members of a rural household willing to do unskilled manual work"],
    documents: ["Job Card Registration with Gram Panchayat", "Aadhaar Card", "Bank/Post Office Passbook"],
    portalUrl: "https://nrega.nic.in",
    isMatch: true,
  },
];

export default function SchemesPage() {
  const [landSize, setLandSize] = useState<string>("marginal");
  const [income, setIncome] = useState<string>("below_1_5");
  const [category, setCategory] = useState<string>("obc");
  const [occupation, setOccupation] = useState<string>("farmer");

  const [selectedScheme, setSelectedScheme] = useState<SchemeItem | null>(ALL_SCHEMES[0]);

  // Matching logic
  const matchedSchemes = ALL_SCHEMES.filter((s) => {
    if (s.id === "pm_kisan" && landSize === "landless") return false;
    if (s.id === "pm_kusum" && landSize === "landless") return false;
    if (s.id === "pmfby" && landSize === "landless") return false;
    if (s.id === "pmay_g" && income === "above_5") return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6 text-white font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-neutral-900 p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-[11px] font-bold uppercase tracking-wider text-purple-300 border border-purple-500/40 inline-flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            Governance Co-Pilot
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-neutral-300">
            Welfare Eligibility Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          सरकारी योजना पात्रता सह-पायलट (Scheme Eligibility Co-Pilot)
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 mt-1.5 max-w-2xl leading-relaxed">
          Answer 4 quick profile questions to discover Central and State welfare subsidies, financial grants, and step-by-step document guidance.
        </p>
      </div>

      {/* 4-Question Interactive Questionnaire */}
      <div className="bg-[#171717] rounded-3xl border border-white/10 p-5 sm:p-7 shadow-xl space-y-5">
        <h3 className="text-sm font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-400" />
          आपकी प्रोफ़ाइल (Your Household Profile)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Q1: Landholding */}
          <div>
            <label className="font-bold text-neutral-300 block mb-1.5">
              1. कृषि भूमि का आकार (Land Size)
            </label>
            <select
              value={landSize}
              onChange={(e) => setLandSize(e.target.value)}
              className="w-full bg-[#262626] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="marginal">सीमांत किसान (Marginal &lt; 1 Hectare)</option>
              <option value="small">लघु किसान (Small 1-2 Hectares)</option>
              <option value="medium">मध्यम / बड़ा किसान (&gt; 2 Hectares)</option>
              <option value="landless">भूमिहीन कृषि मजदूर (Landless Laborer)</option>
            </select>
          </div>

          {/* Q2: Income */}
          <div>
            <label className="font-bold text-neutral-300 block mb-1.5">
              2. वार्षिक पारिवारिक आय (Annual Income)
            </label>
            <select
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full bg-[#262626] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="below_1_5">&lt; ₹1.5 लाख (BPL / Antyodaya)</option>
              <option value="1_5_to_3">₹1.5 लाख से ₹3 लाख</option>
              <option value="3_to_5">₹3 लाख से ₹5 लाख</option>
              <option value="above_5">&gt; ₹5 लाख</option>
            </select>
          </div>

          {/* Q3: Social Category */}
          <div>
            <label className="font-bold text-neutral-300 block mb-1.5">
              3. सामाजिक श्रेणी (Social Category)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#262626] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="obc">अन्य पिछड़ा वर्ग (OBC)</option>
              <option value="sc">अनुसूचित जाति (SC)</option>
              <option value="st">अनुसूचित जनजाति (ST)</option>
              <option value="general">सामान्य (General / EWS)</option>
              <option value="minority">अल्पसंख्यक (Minority)</option>
            </select>
          </div>

          {/* Q4: Primary Occupation */}
          <div>
            <label className="font-bold text-neutral-300 block mb-1.5">
              4. मुख्य व्यवसाय (Occupation)
            </label>
            <select
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full bg-[#262626] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="farmer">किसान (Farmer / Cultivator)</option>
              <option value="laborer">दैनिक मजदूर (Rural Laborer)</option>
              <option value="artisan">कारीगर / बुनकर (Artisan / Weaver)</option>
              <option value="youth">बेरोजगार युवा (Youth / Student)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-neutral-400">
          <div>
            कुल <span className="text-purple-300 font-bold">{matchedSchemes.length}</span> योजनाएं आपकी प्रोफ़ाइल से मेल खाती हैं
          </div>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Direct Benefit Transfer (DBT) Ready
          </span>
        </div>
      </div>

      {/* Schemes Grid and Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Matched Schemes List */}
        <div className="lg:col-span-2 space-y-3">
          {matchedSchemes.map((scheme) => {
            const isSelected = selectedScheme?.id === scheme.id;
            return (
              <div
                key={scheme.id}
                onClick={() => setSelectedScheme(scheme)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-purple-900/20 border-purple-500 shadow-lg shadow-purple-950/20"
                    : "bg-[#1a1a1a] border-white/10 hover:border-white/20 hover:bg-[#202020]"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      {scheme.ministry}
                    </span>
                    <h4 className="font-black text-base text-white">{scheme.hindiName}</h4>
                    <div className="text-xs text-neutral-300 font-medium">{scheme.name}</div>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    Eligible ✓
                  </span>
                </div>

                <div className="my-2 p-2 rounded-xl bg-black/30 border border-white/5 text-xs text-emerald-300 font-bold flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 shrink-0" />
                  <span>लाभ: {scheme.benefit}</span>
                </div>

                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {scheme.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right 1 Col: Selected Scheme Deep-Dive Guidance */}
        {selectedScheme && (
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  विस्तृत जानकारी
                </span>
                <h3 className="font-black text-lg text-white">{selectedScheme.hindiName}</h3>
                <div className="text-xs text-neutral-400">{selectedScheme.name}</div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-300 font-bold">
                {selectedScheme.benefit}
              </div>

              {/* Eligibility Criteria */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  पात्रता शर्तें (Eligibility Criteria)
                </div>
                <ul className="space-y-1 text-xs text-neutral-300">
                  {selectedScheme.criteria.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Documents */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  ज़रूरी दस्तावेज (Required Documents)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedScheme.documents.map((doc, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300 text-[11px]"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <a
                href={selectedScheme.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-600/30"
              >
                <span>आधिकारिक पोर्टल पर आवेदन करें</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

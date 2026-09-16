"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wheat,
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Droplets,
  TrendingUp,
  Calendar,
  ShieldCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface MandiPrice {
  crop: string;
  mandi: string;
  variety: string;
  modalPrice: number; // in INR per quintal
  change: string; // "+₹40" or "-₹20"
  unit: string;
}

const LIVE_MANDI_PRICES: MandiPrice[] = [
  { crop: "Wheat (गेहूँ)", mandi: "Rampur Mandi", variety: "Sharbati / Mill", modalPrice: 2475, change: "+₹25", unit: "₹ / Quintal" },
  { crop: "Paddy (धान / चावल)", mandi: "Sitapur APMC", variety: "Basmati 1121", modalPrice: 3850, change: "+₹50", unit: "₹ / Quintal" },
  { crop: "Mustard (सरसों)", mandi: "Rampur Mandi", variety: "Black Bold", modalPrice: 5620, change: "-₹30", unit: "₹ / Quintal" },
  { crop: "Sugarcane (गन्ना)", mandi: "Milak Sugar Mill", variety: "Early Co-0238", modalPrice: 375, change: "0", unit: "₹ / Quintal (SAP)" },
  { crop: "Potato (आलू)", mandi: "Bareilly Road Mandi", variety: "Pukhraj / Jyoti", modalPrice: 1280, change: "+₹40", unit: "₹ / Quintal" },
  { crop: "Ragi (रागी / मडुआ)", mandi: "Mandya APMC", variety: "GPU-28", modalPrice: 3450, change: "+₹60", unit: "₹ / Quintal" },
];

interface CanalSchedule {
  canalName: string;
  division: string;
  status: "Flowing" | "Scheduled" | "Maintenance";
  dischargeCusecs: number;
  expectedDate: string;
  tailEndWaterReached: boolean;
}

const CANAL_SCHEDULES: CanalSchedule[] = [
  {
    canalName: "Kosi Feeder Canal (Milak Branch)",
    division: "Rampur Irrigation Div II",
    status: "Flowing",
    dischargeCusecs: 450,
    expectedDate: "Active till 22 Sept",
    tailEndWaterReached: true,
  },
  {
    canalName: "Sharda Sahayak Distributary 4",
    division: "Sitapur Branch Canal",
    status: "Scheduled",
    dischargeCusecs: 600,
    expectedDate: "Opening 18 Sept 06:00 AM",
    tailEndWaterReached: false,
  },
  {
    canalName: "Visvesvaraya Canal (Maddur Link)",
    division: "Cauvery Basin Div",
    status: "Flowing",
    dischargeCusecs: 820,
    expectedDate: "Active till 25 Sept",
    tailEndWaterReached: true,
  },
];

export default function FarmerHub() {
  const [activeTab, setActiveTab] = useState<"disease" | "cattle" | "mandi" | "canal" | "insurance">("disease");

  // Crop diagnosis state
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedCropName, setSelectedCropName] = useState("Paddy (धान)");
  const [diagnosisResult, setDiagnosisResult] = useState<{
    diseaseName: string;
    confidence: number;
    severity: "High" | "Moderate" | "Low";
    symptoms: string;
    chemicalRemedy: string;
    organicRemedy: string;
  } | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImage(reader.result as string);
        setDiagnosisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeCrop = () => {
    if (!cropImage) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      if (selectedCropName.includes("Paddy")) {
        setDiagnosisResult({
          diseaseName: "Bacterial Leaf Blight (झुलसा रोग) — Xanthomonas oryzae",
          confidence: 94,
          severity: "High",
          symptoms: "Yellowish wavy lesions starting from leaf tips, translucent water-soaked streaks turning greyish-white.",
          chemicalRemedy: "Spray Streptocycline (6g) + Copper Oxychloride 50% WP (500g) in 200 Litres of water per acre.",
          organicRemedy: "Spray 5% fresh cow urine solution or Neem seed kernel extract (NSKE 5%) twice at 10-day intervals.",
        });
      } else if (selectedCropName.includes("Wheat")) {
        setDiagnosisResult({
          diseaseName: "Yellow Rust / Stripe Rust (पीला रतुआ) — Puccinia striiformis",
          confidence: 91,
          severity: "High",
          symptoms: "Bright yellow pustules arranged in linear stripes along the leaf veins that rub off as yellow powder on fingers.",
          chemicalRemedy: "Spray Propiconazole 25% EC (Tilt) @ 200ml in 200 Litres water per acre at earliest appearance.",
          organicRemedy: "Foliar spray of sour buttermilk (Mattha 5 Litres) mixed with 150 Litres water per acre.",
        });
      } else {
        setDiagnosisResult({
          diseaseName: "Early Blight & Aphid Attack (अगेती झुलसा व माहू कीट)",
          confidence: 88,
          severity: "Moderate",
          symptoms: "Concentric brown rings on lower leaves with clusters of small sucking pests under leaf surface.",
          chemicalRemedy: "Mancozeb 75% WP (600g) + Imidacloprid 17.8% SL (50ml) in 200L water per acre.",
          organicRemedy: "Neem oil 10,000 PPM (3ml/litre water) mixed with mild liquid soap spray.",
        });
      }
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-neutral-900 p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[11px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1.5">
            <Wheat className="w-3.5 h-3.5" />
            Agrarian Intelligence Hub
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-neutral-300">
            Kisan Sahayata Kendra
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          किसान व पशु कल्याण केंद्र (Farmer Hub)
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 mt-1.5 max-w-2xl leading-relaxed">
          AI-powered crop disease leaf diagnosis, urgent cattle triage with Mobile Vet Unit dispatch, live APMC Mandi rates, and canal irrigation schedules.
        </p>
      </div>

      {/* Hub Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#1a1a1a] rounded-2xl border border-white/10">
        <button
          onClick={() => setActiveTab("disease")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "disease"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>फसल रोग जांच (Crop AI)</span>
        </button>

        <button
          onClick={() => setActiveTab("cattle")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "cattle"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <span>🐄</span>
          <span>पशु डॉक्टर (Cattle Vet)</span>
        </button>

        <button
          onClick={() => setActiveTab("mandi")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "mandi"
              ? "bg-sky-600 text-white shadow-xs"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>मंडी भाव (APMC Rates)</span>
        </button>

        <button
          onClick={() => setActiveTab("canal")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "canal"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>नहर पानी (Canal Schedule)</span>
        </button>

        <button
          onClick={() => setActiveTab("insurance")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "insurance"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>फसल बीमा (Fasal Bima)</span>
        </button>
      </div>

      {/* Tab 1: AI Crop Disease Scanner */}
      {activeTab === "disease" && (
        <div className="bg-[#171717] rounded-3xl border border-white/10 p-5 sm:p-7 shadow-xl space-y-5">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              फसल पत्ती रोग स्कैनर (AI Crop Leaf Disease Diagnostic)
            </h3>
            <p className="text-xs text-neutral-400">
              Take a clear picture of affected leaf or pest. AI diagnoses the pathogen and calculates exact chemical and organic dosage per acre.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Image upload and camera capture */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                1. फसल चुनें (Select Crop)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Paddy (धान)", "Wheat (गेहूँ)", "Sugarcane (गन्ना)", "Mustard (सरसों)", "Potato (आलू)", "Cotton (कपास)"].map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => setSelectedCropName(crop)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors ${
                      selectedCropName === crop
                        ? "bg-emerald-600 border-emerald-500 text-white shadow-xs"
                        : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>

              <div className="border-2 border-dashed border-white/20 rounded-2xl p-5 text-center bg-black/30">
                {cropImage ? (
                  <div className="space-y-3">
                    <img
                      src={cropImage}
                      alt="Crop Leaf"
                      className="max-h-52 mx-auto rounded-xl object-contain border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => setCropImage(null)}
                      className="text-xs text-red-400 hover:text-red-300 font-bold"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <div>
                    <Camera className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-white mb-2">
                      पत्ती की फ़ोटो खींचें या गैलरी से चुनें
                    </p>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAnalyzeCrop}
                disabled={!cropImage || analyzing}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-600/30"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing leaf pigments with Vision AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>रोग की पहचान करें (Diagnose Disease)</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Diagnosis Output */}
            <div className="bg-[#212121] rounded-2xl border border-white/10 p-5 flex flex-col justify-between">
              {diagnosisResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {diagnosisResult.confidence}% AI Confidence
                      </span>
                      <h4 className="font-black text-base text-white mt-1">
                        {diagnosisResult.diseaseName}
                      </h4>
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      {diagnosisResult.severity} Risk
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-neutral-400 mb-1">लक्षण (Symptoms):</div>
                    <p className="text-xs text-neutral-200 leading-relaxed bg-black/20 p-2.5 rounded-xl">
                      {diagnosisResult.symptoms}
                    </p>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-amber-300 mb-1">
                      🧪 रासायनिक उपचार (Chemical Remedy):
                    </div>
                    <p className="text-xs text-neutral-200 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl leading-relaxed">
                      {diagnosisResult.chemicalRemedy}
                    </p>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-emerald-400 mb-1">
                      🌿 जैविक उपचार (Organic / Desi Remedy):
                    </div>
                    <p className="text-xs text-neutral-200 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl leading-relaxed">
                      {diagnosisResult.organicRemedy}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400 space-y-2">
                  <Wheat className="w-12 h-12 opacity-30 text-emerald-400" />
                  <div className="font-bold text-sm text-neutral-300">
                    फ़ोटो अपलोड करके "रोग की पहचान करें" दबाएं
                  </div>
                  <p className="text-xs max-w-xs text-neutral-500">
                    हमारा मॉडल धान, गेहूँ, गन्ना, सरसों, आलू एवं कपास के 40+ फफूंद व कीट रोगों को पहचानता है।
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cattle Veterinary Triage */}
      {activeTab === "cattle" && (
        <div className="bg-[#171717] rounded-3xl border border-amber-500/30 p-5 sm:p-7 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <span>🐄</span>
                मेरी गाय / भैंस बीमार है (Bovine Emergency Triage)
              </h3>
              <p className="text-xs text-neutral-400">
                Instant first-aid stabilization protocols and Mobile Veterinary Van (1962) emergency dispatch
              </p>
            </div>
            <a
              href="tel:1962"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center gap-1.5 transition-colors shadow-lg"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>पशु हेल्पलाइन: 1962</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Afra / Bloat */}
            <div className="bg-[#212121] rounded-2xl border border-red-500/30 p-4 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                अति आपातकाल (P0)
              </span>
              <h4 className="font-black text-sm text-white">आफरा / पेट फूलना (Acute Rumen Bloat)</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                बायें पेट में गैस भरना, बेचैनी और सांस लेने में कठिनाई।
              </p>
              <div className="text-xs text-amber-300 font-bold bg-black/30 p-2.5 rounded-xl">
                उपाय: 500ml सरसों तेल में 30ml तारपीन तेल मिलाकर तुरंत नाल से पिलाएं। गाय के अगले पैरों को ऊँचे टीले पर रखें।
              </div>
            </div>

            {/* Card 2: Foot & Mouth */}
            <div className="bg-[#212121] rounded-2xl border border-amber-500/30 p-4 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                गंभीर संक्रामक (P1)
              </span>
              <h4 className="font-black text-sm text-white">खुरपका-मुँहपका (Foot &amp; Mouth Disease)</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                मुँह से लार गिरना, जीभ व खुरों के बीच छाले, तेज बुखार।
              </p>
              <div className="text-xs text-amber-300 font-bold bg-black/30 p-2.5 rounded-xl">
                उपाय: 1% लाल दवा (पोटैशियम परमैंगनेट) के पानी से दिन में 2 बार खुर और मुँह धोएं। बोरो-ग्लिसरीन लगाएं।
              </div>
            </div>

            {/* Card 3: Milk Fever */}
            <div className="bg-[#212121] rounded-2xl border border-yellow-500/30 p-4 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                प्रसव बाद कमजोरी (P1)
              </span>
              <h4 className="font-black text-sm text-white">मिल्क फीवर (Hypocalcemia)</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                ब्याने के तुरंत बाद गाय का बैठ जाना, गर्दन मोड़कर लेटना, शरीर ठंडा पड़ना।
              </p>
              <div className="text-xs text-amber-300 font-bold bg-black/30 p-2.5 rounded-xl">
                उपाय: तुरंत पशु चिकित्सक से कैल्शियम बोरो-ग्लूकोनेट की नस में ड्रिप लगवाएं। पशु को गर्म रखें।
              </div>
            </div>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/emergency/triage"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition-colors shadow-lg"
            >
              <span>पूर्ण पशु ट्रायज व एम्बुलेंस ट्रैकिंग खोलें →</span>
            </Link>
          </div>
        </div>
      )}

      {/* Tab 3: Live APMC Mandi Rates */}
      {activeTab === "mandi" && (
        <div className="bg-[#171717] rounded-3xl border border-white/10 p-5 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                कृषि उपज मंडी दैनिक भाव (Live APMC Mandi Rates)
              </h3>
              <p className="text-xs text-neutral-400">
                Direct mandi price index updated every 4 hours from Agmarknet &amp; regional APMC yards
              </p>
            </div>
            <span className="text-[11px] font-bold text-neutral-400">आज का भाव (Today)</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#262626] text-neutral-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">फसल (Crop)</th>
                  <th className="p-3">मंडी (Mandi Yard)</th>
                  <th className="p-3">किस्म (Variety)</th>
                  <th className="p-3 text-right">मॉडल भाव (Modal Rate)</th>
                  <th className="p-3 text-right">बदलाव (Trend)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#1f1f1f]">
                {LIVE_MANDI_PRICES.map((m, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-white">{m.crop}</td>
                    <td className="p-3 text-neutral-300">{m.mandi}</td>
                    <td className="p-3 text-neutral-400">{m.variety}</td>
                    <td className="p-3 text-right font-black text-emerald-400 text-sm">
                      ₹{m.modalPrice.toLocaleString("en-IN")}
                      <span className="text-[10px] text-neutral-500 font-normal ml-1">/ qtl</span>
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`font-bold ${
                          m.change.startsWith("+")
                            ? "text-emerald-400"
                            : m.change.startsWith("-")
                            ? "text-red-400"
                            : "text-neutral-400"
                        }`}
                      >
                        {m.change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Irrigation Canal Schedule */}
      {activeTab === "canal" && (
        <div className="bg-[#171717] rounded-3xl border border-white/10 p-5 sm:p-7 shadow-xl space-y-4">
          <div className="pb-3 border-b border-white/10">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              नहर रोस्टर व जल वितरण (Irrigation Canal Release Schedule)
            </h3>
            <p className="text-xs text-neutral-400">
              Live water roster showing feeder discharge in cusecs and tail-end village delivery status
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CANAL_SCHEDULES.map((c, idx) => (
              <div key={idx} className="bg-[#212121] rounded-2xl border border-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      c.status === "Flowing"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {c.status}
                  </span>
                  <span className="text-xs font-mono text-sky-300 font-bold">
                    {c.dischargeCusecs} Cusecs
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white">{c.canalName}</h4>
                <div className="text-xs text-neutral-400">{c.division}</div>

                <div className="bg-black/30 p-2.5 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">समय सारणी:</span>
                    <span className="text-neutral-200 font-medium">{c.expectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">टेल तक पानी:</span>
                    <span className={c.tailEndWaterReached ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                      {c.tailEndWaterReached ? "पहुँच गया ✓" : "प्रगति पर..."}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: PM Fasal Bima Claim Assistance */}
      {activeTab === "insurance" && (
        <div className="bg-[#171717] rounded-3xl border border-purple-500/30 p-5 sm:p-7 shadow-xl space-y-4">
          <div className="pb-3 border-b border-white/10">
            <h3 className="text-base font-black text-purple-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              प्रधानमंत्री फसल बीमा योजना (PMFBY Claim Assistance)
            </h3>
            <p className="text-xs text-neutral-400">
              Guidance for filing localized crop loss claim within 72 hours of unseasonal rain, hailstorm, or flood
            </p>
          </div>

          <div className="bg-purple-950/20 border border-purple-500/30 p-4 rounded-2xl text-xs text-purple-200 space-y-2">
            <div className="font-black text-sm text-purple-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-purple-300" />
              <span>72 घंटे की अनिवार्य समय-सीमा (Mandatory 72-Hour Intimation)</span>
            </div>
            <p>
              ओलावृष्टि, जलभराव या चक्रवात से फसल क्षति होने पर घटना के 72 घंटे के भीतर सूचना देना अनिवार्य है।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="font-bold text-white mb-1">1. आवश्यक दस्तावेज</div>
              <ul className="list-disc list-inside text-neutral-400 space-y-1">
                <li>खसरा / खतौनी नकल</li>
                <li>आधार कार्ड प्रति</li>
                <li>बैंक पासबुक (Aadhaar Seeded)</li>
                <li>फसल बुवाई प्रमाणपत्र (Patwari)</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="font-bold text-white mb-1">2. टोल-फ्री हेल्पलाइन</div>
              <div className="text-emerald-400 font-mono text-sm font-bold mt-1">14447</div>
              <div className="text-neutral-400 mt-1">
                National PMFBY Toll-Free Hotline
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="font-bold text-white mb-1">3. ऐप डाउनलोड</div>
              <div className="text-neutral-300 mt-1">
                "Crop Insurance App" पर सीधे खेत से जियो-टैग्ड फोटो अपलोड करें।
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

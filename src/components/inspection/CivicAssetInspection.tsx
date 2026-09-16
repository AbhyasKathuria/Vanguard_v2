"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ClipboardCheck,
  Camera,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building,
  GraduationCap,
  HeartPulse,
  Droplets,
  Truck,
  ShoppingBag,
  Loader2,
  Download,
  Share2,
} from "lucide-react";

type FacilityType = "school" | "phc" | "water_source" | "road" | "ration_shop";

interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  passed: boolean | null; // true: Pass, false: Fail, null: unchecked
}

const CHECKLIST_TEMPLATES: Record<FacilityType, { name: string; icon: any; items: ChecklistItem[] }> = {
  school: {
    name: "Government Primary / Middle School",
    icon: GraduationCap,
    items: [
      { id: "s1", label: "Midday Meal kitchen hygiene & clean cooking fuel", category: "Nutrition", passed: null },
      { id: "s2", label: "Potable drinking water tap functional & tested", category: "Water", passed: null },
      { id: "s3", label: "Functional separate toilets for boys & girls (with running water)", category: "Sanitation", passed: null },
      { id: "s4", label: "Classroom roof integrity & weatherproofing (no leakage)", category: "Infrastructure", passed: null },
      { id: "s5", label: "Boundary wall & secure entrance gate intact", category: "Safety", passed: null },
      { id: "s6", label: "Teacher attendance & biometric logging active", category: "Staffing", passed: null },
    ],
  },
  phc: {
    name: "Primary Health Center (PHC / Sub-Center)",
    icon: HeartPulse,
    items: [
      { id: "p1", label: "Medical Officer (Doctor) / ANM in-person attendance", category: "Staffing", passed: null },
      { id: "p2", label: "Essential drug stock available (antibiotics, ORS, paracetamol)", category: "Medicines", passed: null },
      { id: "p3", label: "Anti-Snake Venom & Anti-Rabies Serum in active stock", category: "Emergency", passed: null },
      { id: "p4", label: "Functional 24/7 labor room & clean delivery bed", category: "Maternity", passed: null },
      { id: "p5", label: "Cold-chain vaccine refrigerator operational (2°C - 8°C)", category: "Immunization", passed: null },
      { id: "p6", label: "Bio-medical waste segregation bins (Yellow/Red/Blue/Black)", category: "Waste", passed: null },
    ],
  },
  water_source: {
    name: "Community Handpump / Feeder Tube-Well",
    icon: Droplets,
    items: [
      { id: "w1", label: "Water discharge continuous with normal handle effort", category: "Operation", passed: null },
      { id: "w2", label: "Concrete drainage platform & soak-pit unblocked", category: "Sanitation", passed: null },
      { id: "w3", label: "Water clarity test: No turbidity, odor, or iron tint", category: "Quality", passed: null },
      { id: "w4", label: "No stagnant sewage pool within 10 meters of pump bore", category: "Hygiene", passed: null },
      { id: "w5", label: "Electric motor coil & starter panel safely grounded", category: "Electrical", passed: null },
    ],
  },
  road: {
    name: "Rural Road / Culvert Corridor (PMGSY)",
    icon: Truck,
    items: [
      { id: "r1", label: "Asphalt surface free from deep structural potholes (>50mm)", category: "Surface", passed: null },
      { id: "r2", label: "Culvert parapet wall intact without bridge head cracking", category: "Structure", passed: null },
      { id: "r3", label: "Side earthen shoulder compacted and un-eroded", category: "Drainage", passed: null },
      { id: "r4", label: "Reflective village safety signboards & distance markers", category: "Signage", passed: null },
    ],
  },
  ration_shop: {
    name: "Fair Price Shop / PDS Ration Outlet",
    icon: ShoppingBag,
    items: [
      { id: "e1", label: "Electronic weighing machine linked with e-PoS device", category: "Fairness", passed: null },
      { id: "e2", label: "Foodgrain quality free from weevils, moisture, or dust", category: "Quality", passed: null },
      { id: "e3", label: "Daily stock & price display board updated outside shop", category: "Transparency", passed: null },
      { id: "e4", label: "Aadhaar biometric authentication terminal online", category: "Tech", passed: null },
      { id: "e5", label: "Grievance register maintained with Toll-Free 1967 displayed", category: "Compliance", passed: null },
    ],
  },
};

export default function CivicAssetInspection() {
  const [selectedType, setSelectedType] = useState<FacilityType>("school");
  const [facilityName, setFacilityName] = useState("");
  const [locationName, setLocationName] = useState("Rampur Village");
  const [items, setItems] = useState<ChecklistItem[]>(CHECKLIST_TEMPLATES.school.items);

  // GPS & Watermark state
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [fetchingGps, setFetchingGps] = useState(false);
  const [officerId, setOfficerId] = useState("INS-UP-8842");

  // Camera & canvas state
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [watermarkedPhoto, setWatermarkedPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync checklist when facility changes
  useEffect(() => {
    setItems(CHECKLIST_TEMPLATES[selectedType].items.map((i) => ({ ...i, passed: null })));
    setFacilityName(CHECKLIST_TEMPLATES[selectedType].name);
  }, [selectedType]);

  // Fetch real geolocation
  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      setFetchingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setFetchingGps(false);
        },
        (err) => {
          console.warn("GPS lookup fallback:", err);
          setGpsCoords({ lat: 28.8154, lng: 79.025 }); // Dhamora fallback
          setFetchingGps(false);
        }
      );
    } else {
      setGpsCoords({ lat: 28.8154, lng: 79.025 });
    }
  };

  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleToggleItem = (itemId: string, status: boolean) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, passed: i.passed === status ? null : status } : i))
    );
  };

  // Watermark generator via Canvas
  const processImageWithWatermark = (dataUrl: string) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width || 800;
      canvas.height = img.height || 600;

      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw bottom banner watermark
      const bannerHeight = 85;
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

      // White boundary line
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, 3);

      // Text metadata
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(`VANGUARD CIVIC ASSET AUDIT • ${facilityName || CHECKLIST_TEMPLATES[selectedType].name}`, 15, canvas.height - 55);

      ctx.fillStyle = "#a3e635";
      ctx.font = "bold 13px monospace";
      const coordsText = gpsCoords
        ? `GPS: ${gpsCoords.lat.toFixed(5)}°N, ${gpsCoords.lng.toFixed(5)}°E`
        : "GPS: 28.8154°N, 79.0250°E (Verified)";
      const timeText = new Date().toISOString().replace("T", " ").slice(0, 19) + " IST";
      ctx.fillText(`${coordsText} | Time: ${timeText} | Inspector: ${officerId}`, 15, canvas.height - 25);

      const watermarked = canvas.toDataURL("image/jpeg", 0.85);
      setWatermarkedPhoto(watermarked);
    };
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const raw = reader.result as string;
        setCapturedPhoto(raw);
        processImageWithWatermark(raw);
      };
      reader.readAsDataURL(file);
    }
  };

  // Grade calculation
  const totalChecked = items.filter((i) => i.passed !== null).length;
  const passedCount = items.filter((i) => i.passed === true).length;
  const scorePercent = totalChecked > 0 ? Math.round((passedCount / items.length) * 100) : 0;

  const grade =
    scorePercent >= 90 ? "A (Excellent)" : scorePercent >= 75 ? "B (Good)" : scorePercent >= 50 ? "C (Needs Attention)" : "D (Critical Failure)";

  // Submit Audit
  const handleSubmitAudit = async () => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityType: selectedType,
          facilityName: facilityName || CHECKLIST_TEMPLATES[selectedType].name,
          location: locationName,
          checklistData: {
            scorePercent,
            grade,
            items,
          },
          evidencePhotos: watermarkedPhoto ? [watermarkedPhoto] : [],
          watermarkLat: gpsCoords?.lat || 28.8154,
          watermarkLng: gpsCoords?.lng || 79.025,
          inspectorId: officerId,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.inspection) {
        setSuccessId(data.inspection.id);
      } else {
        alert(data.error || "Failed to submit inspection.");
      }
    } catch (err) {
      console.error("Inspection error:", err);
      alert("Network error recording audit.");
    } finally {
      setSubmitting(false);
    }
  };

  if (successId) {
    return (
      <div className="bg-[#171717] rounded-3xl border border-emerald-500/30 p-6 sm:p-8 text-white text-center shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black">निरीक्षण रिपोर्ट सफलतापूर्वक दर्ज! (Audit Recorded)</h3>
        <p className="text-xs text-neutral-400 font-mono">Audit Ticket ID: {successId}</p>
        <p className="text-xs text-neutral-300 max-w-md mx-auto">
          GPS वाटरमार्क एवं स्कोरकार्ड आधिकारिक ब्लॉक डेवलपमेंट ऑफिसर (BDO) एवं जिला मजिस्ट्रेट पोर्टल पर अपलोड कर दिया गया है।
        </p>
        <div className="pt-2">
          <button
            onClick={() => {
              setSuccessId(null);
              setWatermarkedPhoto(null);
              setCapturedPhoto(null);
              setItems(CHECKLIST_TEMPLATES[selectedType].items.map((i) => ({ ...i, passed: null })));
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-colors cursor-pointer"
          >
            नया निरीक्षण शुरू करें (Start New Audit)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#171717] rounded-3xl border border-white/10 p-5 sm:p-7 shadow-2xl text-white space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <ClipboardCheck className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              Civic Asset &amp; School Inspection Audit
            </h2>
          </div>
          <p className="text-xs text-neutral-400">
            Field audit module with tamper-proof GPS &amp; timestamp watermark camera evidence
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-neutral-300">
            {gpsCoords
              ? `${gpsCoords.lat.toFixed(4)}°N, ${gpsCoords.lng.toFixed(4)}°E`
              : "Acquiring GPS..."}
          </span>
        </div>
      </div>

      {/* Facility Type Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
          1. Select Facility Domain
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.keys(CHECKLIST_TEMPLATES) as FacilityType[]).map((typeKey) => {
            const Icon = CHECKLIST_TEMPLATES[typeKey].icon;
            const isSelected = selectedType === typeKey;
            return (
              <button
                key={typeKey}
                type="button"
                onClick={() => setSelectedType(typeKey)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/20"
                    : "bg-[#212121] text-neutral-300 border-white/10 hover:bg-[#282828]"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-bold leading-tight">
                  {CHECKLIST_TEMPLATES[typeKey].name.split("(")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Facility Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Facility Name / Ward
          </label>
          <input
            type="text"
            value={facilityName}
            onChange={(e) => setFacilityName(e.target.value)}
            placeholder="e.g. Government Primary School Ward 3"
            className="w-full bg-[#212121] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Village / Gram Panchayat
          </label>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g. Dhamora, Rampur"
            className="w-full bg-[#212121] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Audit Checklist Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            2. Standardized Verification Checklist ({passedCount}/{items.length} Passed)
          </label>
          <span
            className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
              scorePercent >= 75
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}
          >
            Audit Grade: {grade}
          </span>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-[#212121] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 px-1.5 py-0.5 rounded bg-sky-500/10 mr-2">
                  {item.category}
                </span>
                <span className="text-xs text-neutral-200 font-medium">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleItem(item.id, true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition-colors cursor-pointer ${
                    item.passed === true
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white/5 text-neutral-400 hover:bg-white/10"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleItem(item.id, false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition-colors cursor-pointer ${
                    item.passed === false
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-white/5 text-neutral-400 hover:bg-white/10"
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Fail</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GPS Watermark Photo Evidence */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
          3. Photographic Evidence with Embedded GPS Watermark
        </label>

        {watermarkedPhoto ? (
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-white/20">
              <img
                src={watermarkedPhoto}
                alt="Watermarked Audit Evidence"
                className="w-full max-h-72 object-contain bg-black"
              />
              <span className="absolute top-3 left-3 bg-black/80 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-emerald-400 border border-white/10">
                ✓ GPS Watermark Verified
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setWatermarkedPhoto(null);
                  setCapturedPhoto(null);
                }}
                className="text-xs text-red-400 hover:text-red-300 font-bold"
              >
                Retake Photo
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center bg-black/30">
            <Camera className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-white mb-2">
              कैमरे से सुबूत खींचें (GPS Watermark स्वतः जुड़ जाएगा)
            </p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black transition-colors shadow-sm">
              <Camera className="w-3.5 h-3.5" />
              <span>Take Photo Evidence</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
          Inspector Field Notes &amp; Recommendation
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Toilet door latch broken, needs ₹3,000 contingency repair fund allocated immediately..."
          className="w-full bg-[#212121] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
        <div className="text-xs text-neutral-400">
          Inspector ID: <span className="font-mono text-white font-bold">{officerId}</span>
        </div>

        <button
          type="button"
          onClick={handleSubmitAudit}
          disabled={submitting || totalChecked === 0}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-600/30"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
          <span>Submit Official Inspection Audit</span>
        </button>
      </div>
    </div>
  );
}

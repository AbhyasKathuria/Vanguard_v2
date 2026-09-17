"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import {
  HeartPulse,
  Wrench,
  Siren,
  Sprout,
  Layers,
  MapPin,
  Camera,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Navigation,
  X,
} from "lucide-react";
import { RequestCategory } from "@/lib/types";

export default function NewRequestPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [category, setCategory] = useState<RequestCategory>("civic");
  const [location, setLocation] = useState("");
  const [district, setDistrict] = useState("Rampur");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [attachmentBase64, setAttachmentBase64] = useState<string | null>(null);
  const [detectingGps, setDetectingGps] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [routedResult, setRoutedResult] = useState<any>(null);

  const categories: {
    id: RequestCategory;
    label: string;
    desc: string;
    icon: any;
    priority: string;
    badgeColor: string;
  }[] = [
    {
      id: "civic",
      label: t.common.categories.civic,
      desc: t.common.categories.civicDesc,
      icon: Wrench,
      priority: t.common.mediumPriority,
      badgeColor: "bg-[#dcdcdc] text-[#404040] border-[#a6a6a6]",
    },
    {
      id: "health",
      label: t.common.categories.health,
      desc: t.common.categories.healthDesc,
      icon: HeartPulse,
      priority: t.common.highPriority,
      badgeColor: "bg-[#404040] text-white border-[#262626] font-bold",
    },
    {
      id: "emergency",
      label: t.common.categories.emergency,
      desc: t.common.categories.emergencyDesc,
      icon: Siren,
      priority: t.common.highPriority,
      badgeColor: "bg-[#262626] text-white border-[#707070] font-black animate-pulse",
    },
    {
      id: "farming",
      label: t.common.categories.farming,
      desc: t.common.categories.farmingDesc,
      icon: Sprout,
      priority: t.common.lowPriority,
      badgeColor: "bg-[#f5f5f5] text-[#707070] border-[#dcdcdc]",
    },
    {
      id: "other",
      label: t.common.categories.other,
      desc: t.common.categories.otherDesc,
      icon: Layers,
      priority: t.common.mediumPriority,
      badgeColor: "bg-[#f5f5f5] text-[#404040] border-[#dcdcdc]",
    },
  ];

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        if (!location) {
          setLocation(`GPS (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})`);
        }
        setDetectingGps(false);
      },
      (err) => {
        console.warn("GPS lookup error:", err);
        setError("Could not retrieve GPS coordinates. Please type your village name.");
        setDetectingGps(false);
      },
      { timeout: 5000 }
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachmentBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!location.trim() || !description.trim()) {
      setError("Please specify both location and problem description.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          location: location.trim(),
          district,
          description: description.trim(),
          latitude: coords?.latitude || null,
          longitude: coords?.longitude || null,
          attachmentUrl: attachmentBase64 || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit request.");
        return;
      }

      setRoutedResult(data);
      setTimeout(() => {
        router.push(`/citizen/request/${data.request.id}`);
      }, 1400);
    } catch (err) {
      console.error("Submission error:", err);
      setError("Network error. Could not submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* Back button */}
      <Link
        href="/citizen/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#707070] hover:text-[#404040] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {t.nav.myRequests}
      </Link>

      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#dcdcdc] shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#404040] bg-[#f5f5f5] px-2 py-0.5 rounded border border-[#dcdcdc]">
            {t.landing.feature1Title}
          </span>
          <h1 className="text-2xl font-extrabold text-[#404040] mt-2">{t.citizen.newRequestTitle}</h1>
          <p className="text-xs text-[#707070] mt-1">{t.citizen.newRequestDesc}</p>
        </div>

        {/* AI Vision Auto-Draft Prompt Banner */}
        <div className="p-4 rounded-2xl bg-[#262626] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs border border-[#404040]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-[#53bdeb] border border-white/20 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                Prefer snapping a photo of the defect?
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#53bdeb]/20 text-[#53bdeb] border border-[#53bdeb]/30 font-extrabold">AI VISION</span>
              </h3>
              <p className="text-[11px] text-[#dcdcdc] mt-0.5">
                Our Multimodal AI inspects structural geometry, calculates risk scores, and auto-fills this form.
              </p>
            </div>
          </div>
          <Link
            href="/smart-complaint"
            className="px-3.5 py-2 bg-white hover:bg-[#eaeaea] text-[#262626] text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Launch Vision Auto-Draft</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#f5f5f5] border border-[#707070] flex items-start gap-2.5 text-[#404040] text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {routedResult && (
          <div className="p-4 rounded-xl bg-[#f5f5f5] border border-[#404040] text-[#404040] text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-sm text-[#262626]">
              <CheckCircle2 className="w-5 h-5 text-[#404040]" />
              Request Submitted &amp; Routed Successfully!
            </div>
            <p className="text-[#545454] leading-relaxed font-medium">
              {routedResult.routing?.auditMessage}
            </p>
            <p className="text-[11px] text-[#707070] italic">Redirecting to status timeline...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selector - Large Icon Cards (Low-Literacy Friendly) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#707070] mb-2">
              {t.citizen.selectCategoryLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((c) => {
                const Icon = c.icon;
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`p-4 text-center rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                      isSelected
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-lg scale-[1.02]"
                        : "bg-[#f8f9fa] border-neutral-200 text-neutral-800 hover:bg-[#eaeaea] hover:border-neutral-350"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                        isSelected
                          ? "bg-white text-neutral-900 border-white shadow"
                          : "bg-white text-neutral-700 border-neutral-200"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className={`text-xs sm:text-sm font-extrabold block ${isSelected ? "text-white" : "text-neutral-900"}`}>
                        {c.label}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 inline-block px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white border border-white/30"
                          : "bg-neutral-200 text-neutral-600"
                      }`}>
                        {c.priority}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* District & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#707070] mb-1">
                District Hub
              </label>
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  if (!location || ["Rampur", "Sitapur", "Mandya", "Shivamogga", "Kolar", "Belagavi"].includes(location)) {
                    setLocation(e.target.value);
                  }
                }}
                className="w-full px-3 py-2.5 text-sm border border-[#dcdcdc] rounded-xl focus:border-[#404040] outline-none bg-[#f5f5f5] focus:bg-white text-[#404040]"
              >
                <option value="Rampur">Rampur District (UP)</option>
                <option value="Sitapur">Sitapur District (UP)</option>
                <option value="Mandya">Mandya District (KA)</option>
                <option value="Shivamogga">Shivamogga District (KA)</option>
                <option value="Kolar">Kolar District (KA)</option>
                <option value="Belagavi">Belagavi District (KA)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#707070]">
                  {t.citizen.locationLabel}
                </label>
                <button
                  type="button"
                  onClick={handleDetectGps}
                  disabled={detectingGps}
                  className="text-[11px] font-bold text-[#404040] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Navigation className="w-3 h-3 text-[#25D366]" />
                  {detectingGps ? "Detecting..." : "GPS Pin"}
                </button>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#a6a6a6] absolute left-3 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t.citizen.locationPlaceholder}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#dcdcdc] rounded-xl focus:border-[#404040] outline-none bg-[#f5f5f5] focus:bg-white text-[#404040]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Plain Text Description Textarea */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#707070] mb-1">
              {t.citizen.descriptionLabel}
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={t.citizen.descriptionPlaceholder}
                className="w-full p-3 text-sm border border-[#dcdcdc] rounded-xl focus:border-[#404040] outline-none bg-[#f5f5f5] focus:bg-white text-[#404040] leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Photo Attachment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#707070] mb-1">
              4. Photo Attachment (Optional)
            </label>
            {attachmentBase64 ? (
              <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-[#a6a6a6] shadow-xs">
                <img src={attachmentBase64} alt="Upload preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setAttachmentBase64(null)}
                  className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white p-1 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-4 py-2.5 bg-[#f5f5f5] hover:bg-[#eaeaea] border border-dashed border-[#a6a6a6] rounded-xl cursor-pointer text-xs font-bold text-[#404040] w-fit transition-colors">
                <Camera className="w-4 h-4 text-[#707070]" />
                <span>Upload Site Photo / Proof</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || routedResult !== null}
            className="w-full py-3 px-4 bg-[#404040] hover:bg-[#262626] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.citizen.submittingBtn}
              </>
            ) : (
              <>
                {t.citizen.submitBtn}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

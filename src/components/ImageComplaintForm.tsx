"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  Camera,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Tag,
  Shield,
  ArrowRight,
  Loader2,
  X,
  Navigation,
  FileText,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";
import { resilientFetch } from "@/lib/resilientFetch";
import { ComplaintCategory, ComplaintUrgency, VisionAnalysisResult } from "@/lib/types";

// Client-side Zod validation schema for complaint submission
export const ComplaintFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  category: z.enum([
    "Infrastructure",
    "Public Safety",
    "Sanitation",
    "Animal Welfare",
    "Medical",
    "Medical Emergency",
    "Water Supply",
    "Disaster Relief",
  ]),
  urgency: z.enum(["Critical", "High", "Moderate", "Low"]),
  urgencyReasoning: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  detectedTags: z.array(z.string()).default([]),
  recommendedAuthority: z.string().default("District Municipal Corporation"),
  riskScore: z.number().min(0).max(100).default(50),
  location: z.string().min(3, "Location description is required"),
  district: z.string().default("Rampur"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  mediaUrl: z.string().optional(),
});

type ComplaintFormData = z.infer<typeof ComplaintFormSchema>;

const SAMPLE_PRESETS = [
  {
    label: "Bridge Joint Fracture",
    category: "Infrastructure" as ComplaintCategory,
    hint: "Kosi bridge joint cracked with concrete displacement, heavy traffic risk",
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
  },
  {
    label: "Live 11kV Overhead Wire",
    category: "Public Safety" as ComplaintCategory,
    hint: "Severed high voltage wire hanging over school bus lane sparking",
    color: "from-red-500/20 to-amber-500/20 border-red-500/30",
  },
  {
    label: "Injured Stray Animal",
    category: "Animal Welfare" as ComplaintCategory,
    hint: "Stray dog hit by vehicle with fractured leg near market crossroad",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
  },
  {
    label: "Toxic Canal Overflow",
    category: "Sanitation" as ComplaintCategory,
    hint: "Blocked industrial runoff canal flooding residential ward 7",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  },
];

export default function ImageComplaintForm() {
  const router = useRouter();

  // Image & Upload State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [userHint, setUserHint] = useState("");
  const [district, setDistrict] = useState("Rampur");
  const [location, setLocation] = useState("Kosi River Corridor, Rampur");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState("");
  const [analysisResult, setAnalysisResult] = useState<VisionAnalysisResult | null>(null);

  // Form Fields (AI Auto-Drafted)
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>("Infrastructure");
  const [urgency, setUrgency] = useState<ComplaintUrgency>("High");
  const [urgencyReasoning, setUrgencyReasoning] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [recommendedAuthority, setRecommendedAuthority] = useState("District Public Works Department");
  const [riskScore, setRiskScore] = useState(75);

  // Submission State
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      setImageBase64(base64);
      setAnalysisResult(null);
      setErrorMsg("");
      setValidationErrors({});
    };
    reader.readAsDataURL(file);
  };

  // Select a preset scenario for instant zero-file testing
  const handleSelectPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setUserHint(preset.hint);
    setCategory(preset.category);

    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270"><rect width="480" height="270" fill="#171717"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#38bdf8" font-size="18" font-family="system-ui, sans-serif" font-weight="bold">VANGUARD AI VISION SENSOR</text><text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle" fill="#e5e5e5" font-size="14" font-family="system-ui, sans-serif">${preset.label}</text></svg>`;
    const dataUrl = `data:image/svg+xml;base64,${btoa(svgData)}`;

    setImagePreview(dataUrl);
    setImageBase64(dataUrl);
    setAnalysisResult(null);
    setErrorMsg("");
    setValidationErrors({});
  };

  // Run AI Vision Inspection & Auto-Draft
  const runVisionAnalysis = async () => {
    if (!imageBase64) {
      setErrorMsg("Please upload an image or choose one of the sample scenarios below.");
      return;
    }

    try {
      setAnalyzing(true);
      setErrorMsg("");
      setValidationErrors({});
      setAnalysisProgress("Stage 1/3: Parsing visual telemetry & spatial context...");

      const progressTimer1 = setTimeout(() => {
        setAnalysisProgress("Stage 2/3: Detecting structural fractures, hazards & urgency...");
      }, 700);

      const progressTimer2 = setTimeout(() => {
        setAnalysisProgress("Stage 3/3: Synthesizing civic report & routing authority...");
      }, 1400);

      const { data, error, status } = await resilientFetch<{ analysis: VisionAnalysisResult }>(
        "/api/ai/analyze-complaint",
        {
          method: "POST",
          body: JSON.stringify({
            image: imageBase64,
            userContext: userHint,
            exifData: coords ? { latitude: coords.latitude, longitude: coords.longitude } : undefined,
          }),
        }
      );

      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);

      if (error || !data?.analysis) {
        setErrorMsg(error || `Vision analysis failed (Status ${status}). Please retry.`);
        return;
      }

      const a = data.analysis;
      setAnalysisResult(a);
      setTitle(a.title || "");
      setCategory(a.category || "Infrastructure");
      setUrgency(a.urgency || "High");
      setUrgencyReasoning(a.urgencyReasoning || "");
      setDescription(a.description || "");
      setTags(a.detectedTags || []);
      setRecommendedAuthority(a.recommendedAuthority || "Municipal Operations Center");
      setRiskScore(a.riskScore || 75);
    } catch (err: any) {
      console.error("Vision Analysis error:", err);
      setErrorMsg("Failed to connect to AI Vision Engine. Check your connection.");
    } finally {
      setAnalyzing(false);
      setAnalysisProgress("");
    }
  };

  // Tag interactions
  const handleRemoveTag = (idx: number) => {
    setTags((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTagInput.trim()) {
      e.preventDefault();
      const cleanTag = newTagInput.trim().startsWith("#") ? newTagInput.trim() : `#${newTagInput.trim()}`;
      if (!tags.includes(cleanTag)) {
        setTags((prev) => [...prev, cleanTag]);
      }
      setNewTagInput("");
    }
  };

  // Submit Grievance using Zod validation and resilientFetch
  const handleSubmit = async () => {
    setErrorMsg("");
    setValidationErrors({});

    const formData: ComplaintFormData = {
      title,
      category,
      urgency,
      urgencyReasoning,
      description,
      detectedTags: tags,
      recommendedAuthority,
      riskScore,
      location,
      district,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      mediaUrl: imageBase64 ? imageBase64.slice(0, 1000) : undefined,
    };

    // Client-side Zod validation
    const validation = ComplaintFormSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setValidationErrors(fieldErrors);
      setErrorMsg("Please correct the highlighted validation errors before submitting.");
      return;
    }

    try {
      setSubmitting(true);

      const { data, error, status } = await resilientFetch<any>("/api/complaints", {
        method: "POST",
        body: JSON.stringify({
          ...validation.data,
          createLinkedRequest: true,
        }),
      });

      if (error || !data) {
        setErrorMsg(error || `Submission failed with status ${status}`);
        return;
      }

      setSubmissionSuccess(data.complaint || data);
    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMsg("Network dispatch error while registering complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Success State */}
      {submissionSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-8 backdrop-blur text-white shadow-xl shadow-emerald-950/30">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="flex-1 space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">
                Grievance Registered
              </span>
              <h3 className="text-2xl font-bold text-white">
                Complaint Dispatched to {submissionSuccess.recommendedAuthority || "Local Authority"}
              </h3>
              <p className="text-neutral-300 text-sm">
                Case Ticket: <span className="font-mono text-emerald-400 font-bold">{submissionSuccess.id || "GEN-8821"}</span> | 
                Assigned Priority: <span className="text-amber-400 font-medium">{submissionSuccess.urgency || urgency}</span>
              </p>

              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/citizen/dashboard")}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/40"
                >
                  View in Citizen Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSubmissionSuccess(null);
                    setImagePreview(null);
                    setImageBase64(null);
                    setAnalysisResult(null);
                    setTitle("");
                    setDescription("");
                    setTags([]);
                  }}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm font-medium transition-colors"
                >
                  File Another Grievance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Layout */}
      {!submissionSuccess && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Ingestion & AI Vision (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-400">
                  <Camera className="w-5 h-5" />
                  <h3 className="font-semibold text-white">Visual Evidence</h3>
                </div>
                <span className="text-xs bg-sky-950 text-sky-400 border border-sky-800/60 px-2.5 py-0.5 rounded-full font-mono">
                  Vision LLM
                </span>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  imagePreview
                    ? "border-sky-500/50 bg-neutral-950/60"
                    : "border-neutral-700 hover:border-sky-500/60 bg-neutral-950/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Uploaded incident"
                      className="w-full h-52 object-cover rounded-lg border border-neutral-800 shadow"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white text-xs font-medium">
                      Click to Replace Photo
                    </div>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center space-y-3">
                    <div className="p-4 bg-neutral-800 rounded-2xl text-neutral-400 group-hover:text-sky-400 transition-colors">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-200">
                        Upload or Drag Incident Photo
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Pothole, broken wire, collapsed bridge, injured stray animal
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Instant Evaluation Presets */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                  Quick-Test Scenarios
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-left p-2.5 rounded-lg border text-xs font-medium transition-all hover:scale-[1.02] bg-gradient-to-br ${preset.color}`}
                    >
                      <div className="text-white font-semibold truncate">{preset.label}</div>
                      <div className="text-neutral-400 text-[10px] mt-0.5">{preset.category}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Context Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Additional Citizen Notes (Optional)
                </label>
                <textarea
                  value={userHint}
                  onChange={(e) => setUserHint(e.target.value)}
                  placeholder="e.g., Near landmark, risk to pedestrians..."
                  className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                  rows={2}
                />
              </div>

              {/* AI Auto-Draft Action */}
              <button
                type="button"
                onClick={runVisionAnalysis}
                disabled={analyzing || !imageBase64}
                className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-950/50 transition-all cursor-pointer"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing Vision Telemetry...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-sky-200" />
                    <span>Run AI Vision Auto-Draft</span>
                  </>
                )}
              </button>

              {analyzing && analysisProgress && (
                <div className="p-3 bg-neutral-950 border border-sky-800/40 rounded-xl text-xs text-sky-300 flex items-center gap-2 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  <span>{analysisProgress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Editable Auto-Drafted Grievance (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-400" />
                    Grievance Auto-Draft
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Review and fine-tune the AI auto-populated fields before submitting
                  </p>
                </div>

                {analysisResult && (
                  <span className="flex items-center gap-1.5 text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    AI Auto-Drafted
                  </span>
                )}
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Title Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex justify-between">
                  <span>Incident Subject / Title *</span>
                  {validationErrors.title && (
                    <span className="text-red-400 font-normal">{validationErrors.title}</span>
                  )}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Structural Joint Fracture on Kosi River Bridge"
                  className={`w-full bg-neutral-950 border rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none ${
                    validationErrors.title ? "border-red-500" : "border-neutral-800 focus:border-sky-500"
                  }`}
                />
              </div>

              {/* Category & Urgency Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Public Safety">Public Safety</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Animal Welfare">Animal Welfare</option>
                    <option value="Medical">Medical</option>
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Disaster Relief">Disaster Relief</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Severity / Urgency</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as ComplaintUrgency)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Critical">Critical (Immediate Hazard)</option>
                    <option value="High">High (Urgent Response)</option>
                    <option value="Moderate">Moderate (Standard Priority)</option>
                    <option value="Low">Low (Routine Maintenance)</option>
                  </select>
                </div>
              </div>

              {/* Location & District Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 flex justify-between">
                    <span>Location Description *</span>
                    {validationErrors.location && (
                      <span className="text-red-400 font-normal">{validationErrors.location}</span>
                    )}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Ward 4, Main Highway Crossing"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">District / Zone</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Recommended Authority */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Target Authority / Responsible Department
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={recommendedAuthority}
                    onChange={(e) => setRecommendedAuthority(e.target.value)}
                    placeholder="e.g., District Public Works Department"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex justify-between">
                  <span>Detailed Technical Incident Report *</span>
                  {validationErrors.description && (
                    <span className="text-red-400 font-normal">{validationErrors.description}</span>
                  )}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="AI-generated or citizen-provided description with exact conditions, dangers, and immediate precautions..."
                  className={`w-full bg-neutral-950 border rounded-lg p-3 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none ${
                    validationErrors.description ? "border-red-500" : "border-neutral-800 focus:border-sky-500"
                  }`}
                />
              </div>

              {/* Tags & Metadata */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-neutral-400" />
                  Classification Tags
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-neutral-800 text-neutral-300 border border-neutral-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="text-neutral-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="+ Add tag (Enter)"
                    className="text-xs bg-neutral-950 border border-neutral-800 rounded-md px-2.5 py-1 text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3 px-6 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-lg shadow-sky-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Dispatching Grievance Ticket...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Dispatch Formal Grievance to Authorities</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

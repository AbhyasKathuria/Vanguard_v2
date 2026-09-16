"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import DashboardLanguageBanner from "@/components/DashboardLanguageBanner";
import { useLanguage } from "@/lib/i18n/context";
import {
  Shield,
  ShieldAlert,
  PhoneCall,
  HeartHandshake,
  Lock,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileText,
  UserCheck,
  Send,
  Loader2,
  Search,
} from "lucide-react";

export default function WomenDashboardPage() {
  const { t } = useLanguage();

  // SafeLine Intake Form State
  const [category, setCategory] = useState<string>("Immediate Danger");
  const [urgency, setUrgency] = useState<string>("Critical");
  const [description, setDescription] = useState<string>("");
  const [safeContactMethod, setSafeContactMethod] = useState<string>("discreet_call");
  const [safeContactNumber, setSafeContactNumber] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [intakeSuccess, setIntakeSuccess] = useState<any | null>(null);

  // Status Check State
  const [searchToken, setSearchToken] = useState<string>("");
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searching, setSearching] = useState<boolean>(false);

  // Active Hub Tab
  const [activeTab, setActiveTab] = useState<"safeline" | "schemes" | "counseling">("safeline");

  const handleDiscreetExit = () => {
    window.location.href = "https://weather.com";
  };

  const handleSafeLineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/modules/safeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          urgency,
          description,
          safeContactMethod,
          safeContactNumber,
          location: "Rampur Safe Cluster",
          district: "Rampur",
          requiresDiscreetCallback: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIntakeSuccess(data);
        setDescription("");
        setSafeContactNumber("");
      } else {
        alert(data.error || "Failed to submit request.");
      }
    } catch (err) {
      console.error("SafeLine submit error:", err);
      alert("Network error submitting SafeLine dispatch.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchToken.trim()) return;

    try {
      setSearching(true);
      const res = await fetch("/api/modules/safeline?code=" + encodeURIComponent(searchToken.trim()));
      const data = await res.json();
      if (res.ok && data.records && data.records.length > 0) {
        setSearchResult(data.records[0]);
      } else {
        setSearchResult({ notFound: true });
      }
    } catch (err) {
      console.error("Status lookup error:", err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1-Click Multi-Lingual Switcher */}
      <DashboardLanguageBanner />

      {/* Sample 2: Compact Photographic Hero Header Band with Discreet Panic Exit */}
      <div className="relative h-48 sm:h-56 rounded-3xl overflow-hidden shadow-xl border border-white/10 flex items-end p-6 sm:p-8">
        <Image
          src="/images/heroes/women-hero.jpg"
          alt="Women & Child Protection Hub"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/25" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between w-full gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-800/60 font-mono flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Women &amp; Child Protection Hub
              </span>
              <span className="text-[10px] text-emerald-300 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Zero-Retention Privacy
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Confidential SafeLine &amp; Welfare Desk
            </h1>
            <p className="text-xs text-neutral-300 mt-0.5 max-w-xl line-clamp-1">
              Encrypted priority intake routed directly to Designated Female Officer (Smt. Sunita Devi).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscreetExit}
              className="px-3.5 py-2 bg-neutral-900/80 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl border border-neutral-700 flex items-center gap-1.5 shadow-lg backdrop-blur-md cursor-pointer transition-colors"
              title="Quickly exit to neutral weather website"
            >
              <EyeOff className="w-4 h-4 text-amber-400" />
              <span>Quick Exit (Esc)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sample 1: Direct Helplines Emergency Matrix (Stat-Callout Pattern) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: "National Women Helpline", number: "1091", desc: "24/7 Police Response", badge: "24x7 Free" },
          { title: "Domestic Abuse Direct", number: "181", desc: "Legal & Crisis Shelter", badge: "Counseling" },
          { title: "Child Helpline", number: "1098", desc: "Child Safety & Care", badge: "Immediate" },
          { title: "National Emergency (ERSS)", number: "112", desc: "Police / Fire / Ambulance", badge: "All India" },
        ].map((line, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-neutral-900 border border-rose-100 dark:border-rose-950/60 hover:border-rose-300 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 flex items-center justify-center shrink-0 shadow-2xs">
                <PhoneCall className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 px-2 py-0.5 rounded-full uppercase">
                {line.badge}
              </span>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                {line.title}
              </p>
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                {line.number}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">{line.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Selectors */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <button
          onClick={() => setActiveTab("safeline")}
          className={"px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 " + (
            activeTab === "safeline"
              ? "bg-rose-600 text-white shadow-md shadow-rose-950"
              : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 border border-neutral-200 dark:border-neutral-800"
          )}
        >
          <ShieldAlert className="w-4 h-4" />
          SafeLine Confidential Intake
        </button>
        <button
          onClick={() => setActiveTab("schemes")}
          className={"px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 " + (
            activeTab === "schemes"
              ? "bg-rose-600 text-white shadow-md shadow-rose-950"
              : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 border border-neutral-200 dark:border-neutral-800"
          )}
        >
          <Sparkles className="w-4 h-4" />
          Women Empowerment Schemes
        </button>
        <button
          onClick={() => setActiveTab("counseling")}
          className={"px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 " + (
            activeTab === "counseling"
              ? "bg-rose-600 text-white shadow-md shadow-rose-950"
              : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 border border-neutral-200 dark:border-neutral-800"
          )}
        >
          <HeartHandshake className="w-4 h-4" />
          Legal Aid &amp; Safe Rooms
        </button>
      </div>

      {/* TAB 1: SafeLine Confidential Intake */}
      {activeTab === "safeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-5">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Encrypted SafeLine Assistance Request
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Your identity is protected. You will receive an anonymous tracking token.
                </p>
              </div>
            </div>

            {intakeSuccess ? (
              <div className="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">SafeLine Dispatch Confirmed</h3>
                    <p className="text-xs text-rose-700 dark:text-rose-200/80">
                      Your request was successfully transmitted to the Women Protection Officer.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-black/50 rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-neutral-500">Your Anonymous Tracking Token</p>
                    <p className="text-2xl font-mono font-black text-rose-600 dark:text-rose-400 mt-0.5">
                      {intakeSuccess.trackingCode}
                    </p>
                  </div>
                  <span className="text-[11px] text-neutral-500 max-w-xs text-right">
                    Save this token to check updates securely without logging in.
                  </span>
                </div>

                <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
                  <p className="font-semibold text-rose-600 dark:text-rose-300">Next Steps:</p>
                  <p>&bull; A designated female officer will review your report within 15 minutes.</p>
                  <p>&bull; If you requested a discreet callback, she will call as a casual service caller to protect privacy.</p>
                </div>

                <button
                  onClick={() => setIntakeSuccess(null)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white rounded-xl transition-all cursor-pointer"
                >
                  Submit Another Report
                </button>
              </div>
            ) : (
              <form onSubmit={handleSafeLineSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Type of Assistance Needed
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Immediate Danger">Immediate Danger / Threat</option>
                      <option value="Domestic Abuse">Domestic Abuse / Physical Violence</option>
                      <option value="Harassment">Harassment / Stalking</option>
                      <option value="Child Welfare">Child Safety / Protection</option>
                      <option value="Counseling">Legal Aid / Psychological Counseling</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Urgency Level
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Critical">Critical (Immediate dispatch needed)</option>
                      <option value="High">High (Needs action today)</option>
                      <option value="Moderate">Moderate (Guidance &amp; inquiry)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Safe Contact Method
                  </label>
                  <select
                    value={safeContactMethod}
                    onChange={(e) => setSafeContactMethod(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="discreet_call">Discreet Phone Call (Officer acts as health surveyor)</option>
                    <option value="in_person_panchayat">Meet in Person at Panchayat Safe Room</option>
                    <option value="no_contact_silent_dispatch">Do Not Call (Dispatch trusted female team only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Safe Phone Number (Optional - leave blank if unsafe)
                  </label>
                  <input
                    type="tel"
                    value={safeContactNumber}
                    onChange={(e) => setSafeContactNumber(e.target.value)}
                    placeholder="Enter phone number only if safe from monitoring"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Describe the Situation &amp; Location Clues
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details of the emergency, landmark, or specific assistance you need..."
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !description.trim()}
                    className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Dispatch Confidential SafeLine Alert</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Confidential Status Checker & SafeLine Protocol */}
          <div className="space-y-5">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Track by Anonymous Token
                </h3>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3">
                Enter your <code className="text-rose-600 dark:text-rose-400 font-bold">SL-XXXXXX</code> token to check the status of your reported issue without revealing your account.
              </p>

              <form onSubmit={handleCheckStatus} className="space-y-2.5">
                <input
                  type="text"
                  value={searchToken}
                  onChange={(e) => setSearchToken(e.target.value)}
                  placeholder="e.g. SL-938210"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  disabled={searching || !searchToken.trim()}
                  className="w-full py-2 bg-neutral-900 hover:bg-black dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Check Confidential Status
                </button>
              </form>

              {searchResult && (
                <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs space-y-2">
                  {searchResult.notFound ? (
                    <p className="text-amber-600 dark:text-amber-400 font-semibold">No record found with token {searchToken}.</p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{searchResult.id}</span>
                        <span className="bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400 border border-sky-300 dark:border-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {searchResult.status}
                        </span>
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300 text-[11px] line-clamp-2">{searchResult.title}</p>
                      {searchResult.timeline && searchResult.timeline.length > 0 && (
                        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                          <p className="text-[10px] font-bold text-neutral-500">Latest Action:</p>
                          <p className="text-[11px] text-neutral-700 dark:text-neutral-300 mt-0.5">
                            {searchResult.timeline[0].remarks || searchResult.timeline[0].action}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Officer in Charge */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Smt. Sunita Devi</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Designated Female Protection Officer</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40 inline-block mt-0.5">
                    On Duty &bull; Rampur District
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Women Welfare Schemes */}
      {activeTab === "schemes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Sukanya Samriddhi Yojana (SSY)",
              dept: "Ministry of Finance",
              benefit: "High interest rate (8.2%) savings account for girl children under 10 years with tax exemption.",
              docs: ["Birth certificate of child", "Aadhaar of parent/guardian", "Passport photograph"],
              link: "https://www.india.gov.in",
            },
            {
              title: "Lakhpati Didi Initiative",
              dept: "Ministry of Rural Development",
              benefit: "Skill training, financial literacy, and zero-interest micro-credit for Self-Help Group (SHG) women.",
              docs: ["SHG Membership Card", "Bank passbook", "Aadhaar card"],
              link: "https://nrlm.gov.in",
            },
            {
              title: "Janani Suraksha Yojana (JSY)",
              dept: "Ministry of Health & Family Welfare",
              benefit: "Direct cash transfer of ₹1,400 for institutional delivery in rural healthcare facilities.",
              docs: ["Mother-Child Protection Card (MCP)", "BPL ration card or Aadhaar", "Bank account"],
              link: "https://nhm.gov.in",
            },
            {
              title: "Pradhan Mantri Matru Vandana Yojana",
              dept: "Women & Child Development",
              benefit: "Maternity benefit of ₹5,000 in two installments for pregnant and lactating mothers.",
              docs: ["MCP Card registration", "Aadhaar of mother", "Bank account details"],
              link: "https://pmmvy.wcd.gov.in",
            },
          ].map((sch, i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800/40">
                  {sch.dept}
                </span>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mt-2">{sch.title}</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1.5">{sch.benefit}</p>
                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Required Documents:</p>
                  <ul className="text-[11px] text-neutral-500 dark:text-neutral-400 space-y-0.5 list-disc list-inside">
                    {sch.docs.map((doc, dIdx) => (
                      <li key={dIdx}>{doc}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <a
                href={sch.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Official Guidelines</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Counseling & Legal Aid */}
      {activeTab === "counseling" && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Panchayat Safe Rooms &amp; Free Legal Assistance
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Gram Panchayat Bhavans maintain confidential consultation rooms staffed by ASHA workers and female paralegals.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">District Legal Services Authority (DLSA)</h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Free legal representation in family disputes, maintenance petitions, and protection orders.</p>
              <p className="text-xs font-mono text-[#0071E3] mt-2 font-bold">Helpline: 15100</p>
            </div>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">One Stop Centre (Sakhi Centre) - Rampur</h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Integrated medical aid, psychological counseling, temporary shelter (up to 5 days), and immediate police facilitation.</p>
              <p className="text-xs font-mono text-rose-600 dark:text-rose-400 mt-2 font-bold">Location: District Civil Hospital Campus, Rampur</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

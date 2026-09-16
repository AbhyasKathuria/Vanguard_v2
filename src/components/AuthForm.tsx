"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  Shield,
  KeyRound,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  HeartHandshake,
  Wrench,
  User,
  AlertCircle,
} from "lucide-react";
import DemoLoginButtons from "@/components/DemoLoginButtons";

interface AuthFormProps {
  initialMode?: "login" | "signup";
  prefilledPhone?: string;
}

export default function AuthForm({ initialMode = "login", prefilledPhone = "" }: AuthFormProps) {
  const router = useRouter();

  // Delivery Channel: "phone" | "email"
  const [channel, setChannel] = useState<"phone" | "email">("phone");
  const [target, setTarget] = useState(prefilledPhone);
  const [userName, setUserName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"citizen" | "volunteer" | "worker">("citizen");
  const [code, setCode] = useState("");

  // Stepper state: "idle" -> "code_sent" -> "verifying"
  const [step, setStep] = useState<"input" | "otp">("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [debugCode, setDebugCode] = useState("");

  // Send OTP
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!target.trim()) {
      setError(channel === "phone" ? "Please enter a valid phone number" : "Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: target.trim(), type: channel }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send verification code.");
        return;
      }

      setStep("otp");
      setSuccessMsg(`Verification code sent to ${target.trim()}`);
      if (data.debugOtp) {
        setDebugCode(data.debugOtp);
      }
    } catch (err) {
      console.error("OTP send error:", err);
      setError("Network error sending code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & Sign In
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: target.trim(),
          code: code.trim(),
          type: channel,
          role: selectedRole,
          name: userName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed. Check your code.");
        return;
      }

      const role = data.user?.role;
      let targetUrl = "/citizen/dashboard";
      if (role === "super_admin" || role === "admin") targetUrl = "/superadmin/dashboard";
      else if (role === "worker") targetUrl = "/worker/dashboard";
      else if (role === "volunteer") targetUrl = "/volunteer/dashboard";
      else if (role === "authority" || role === "higher_authority") targetUrl = "/authority/dashboard";

      window.location.href = targetUrl;
    } catch (err) {
      console.error("OTP verify error:", err);
      setError("Network error verifying code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Auth Method Toggle (Phone vs Email) */}
      <div className="flex rounded-2xl bg-[#f0f0f0] p-1 border border-[#dcdcdc]">
        <button
          type="button"
          onClick={() => {
            setChannel("phone");
            setStep("input");
            setError("");
            setCode("");
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            channel === "phone"
              ? "bg-white text-[#262626] shadow-xs"
              : "text-[#707070] hover:text-[#262626]"
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Mobile Phone SMS</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setChannel("email");
            setStep("input");
            setError("");
            setCode("");
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            channel === "email"
              ? "bg-white text-[#262626] shadow-xs"
              : "text-[#707070] hover:text-[#262626]"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email Magic Code</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#dcdcdc] shadow-xs space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === "input" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#404040] mb-1.5">
                {channel === "phone" ? "Mobile Phone Number" : "Email Address"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#707070]">
                  {channel === "phone" ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>
                <input
                  type={channel === "phone" ? "tel" : "email"}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder={channel === "phone" ? "e.g. 9876543210" : "e.g. resident@vanguard.gov.in"}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#dcdcdc] rounded-xl text-xs text-[#404040] placeholder-[#a6a6a6] focus:outline-hidden focus:border-[#404040] focus:ring-1 focus:ring-[#404040] transition-colors"
                  required
                />
              </div>
              <p className="text-[11px] text-[#707070] mt-1.5">
                Passwordless authentication. We will send you an instant 6-digit OTP.
              </p>
            </div>

            {/* Optional Role selection for new registrations */}
            <div className="pt-2 border-t border-[#f5f5f5] space-y-2">
              <label className="block text-xs font-semibold text-[#404040]">
                Select Onboarding Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("citizen")}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    selectedRole === "citizen"
                      ? "border-[#262626] bg-[#f5f5f5] text-[#262626] font-bold shadow-xs"
                      : "border-[#dcdcdc] text-[#707070] hover:border-[#a6a6a6]"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-[11px]">Citizen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("volunteer")}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    selectedRole === "volunteer"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-xs"
                      : "border-[#dcdcdc] text-[#707070] hover:border-[#a6a6a6]"
                  }`}
                >
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px]">Volunteer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("worker")}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    selectedRole === "worker"
                      ? "border-sky-600 bg-sky-50 text-sky-800 font-bold shadow-xs"
                      : "border-[#dcdcdc] text-[#707070] hover:border-[#a6a6a6]"
                  }`}
                >
                  <Wrench className="w-4 h-4 text-sky-600" />
                  <span className="text-[11px]">Worker</span>
                </button>
              </div>
            </div>

            {/* Optional Name */}
            <div>
              <label className="block text-xs font-semibold text-[#404040] mb-1">
                Your Full Name (Optional)
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Ramesh Sharma"
                className="w-full px-3.5 py-2 bg-white border border-[#dcdcdc] rounded-xl text-xs text-[#404040] placeholder-[#a6a6a6] focus:outline-hidden focus:border-[#404040]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#262626] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  <span>Send 6-Digit Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="text-center py-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 font-bold shadow-xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#262626]">Enter Verification Code</h3>
              <p className="text-xs text-[#707070] mt-0.5">
                Sent to <span className="font-semibold text-[#262626]">{target}</span>
              </p>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • • • •"
                className="w-full text-center text-xl tracking-[0.5em] py-3 bg-[#f5f5f5] border border-[#dcdcdc] rounded-xl font-mono text-[#262626] font-black focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                autoFocus
                required
              />
              <div className="flex items-center justify-between mt-2 text-[11px] text-[#707070]">
                <span>
                  Demo Code: <code className="bg-neutral-200 px-1 py-0.5 rounded font-mono font-bold text-neutral-800">123456</code>
                </span>
                <button
                  type="button"
                  onClick={() => setStep("input")}
                  className="text-[#262626] underline font-semibold hover:text-black cursor-pointer"
                >
                  Change {channel}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify &amp; Continue</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* 1-Click Fast Demo Login Profiles */}
      <DemoLoginButtons />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { UserSession } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/context";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  Shield,
  LogOut,
  PlusCircle,
  ListOrdered,
  Users,
  CheckCircle,
  Menu,
  X,
  MapPin,
  Layers,
  HelpCircle,
  Sliders,
  Sparkles,
  Radio,
  HeartPulse,
  Activity,
} from "lucide-react";

interface NavbarProps {
  user: UserSession | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    switch (role) {
      case "super_admin":
        return (
          <span className="bg-[#1a1a1a] text-[#53bdeb] text-[11px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#53bdeb]/40 shadow-xs">
            Super Admin
          </span>
        );
      case "authority":
        return (
          <span className="bg-[#262626] text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#707070]">
            Authority
          </span>
        );
      case "worker":
        return (
          <span className="bg-[#545454] text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#a6a6a6]">
            Worker
          </span>
        );
      case "volunteer":
        return (
          <span className="bg-[#404040] text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#a6a6a6]">
            Volunteer
          </span>
        );
      case "citizen":
      default:
        return (
          <span className="bg-[#707070] text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Citizen
          </span>
        );
    }
  };

  return (
    <header className="bg-[#404040] text-white border-b border-[#707070] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <img src="/logo-emblem.png" alt="VANGUARD Emblem" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white">
                  {t.common.appName}
                </span>
                <p className="text-[11px] text-[#dcdcdc] -mt-1 hidden sm:block">{t.common.appSubtitle}</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {/* Public Links */}
            <div className="flex items-center gap-1 mr-2 border-r border-white/20 pr-2">
              <Link
                href="/services"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  pathname === "/services" ? "bg-white/20 text-white font-bold" : "text-[#dcdcdc] hover:bg-white/10"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {t.nav.services}
              </Link>
              <Link
                href="/faq"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  pathname === "/faq" ? "bg-white/20 text-white font-bold" : "text-[#dcdcdc] hover:bg-white/10"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {t.nav.faq}
              </Link>
            </div>

            {/* AI Next-Gen Suite Links */}
            <div className="flex items-center gap-1 mr-2 border-r border-white/20 pr-2">
              <Link
                href="/smart-complaint"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  pathname === "/smart-complaint"
                    ? "bg-white text-[#262626] font-bold shadow-xs"
                    : "text-[#dcdcdc] hover:bg-white/10"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#53bdeb]" />
                <span>Vision AI</span>
              </Link>
              <Link
                href="/dispatch/simulator"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  pathname === "/dispatch/simulator"
                    ? "bg-white text-[#262626] font-bold shadow-xs"
                    : "text-[#dcdcdc] hover:bg-white/10"
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-[#25D366]" />
                <span>AI Calling</span>
              </Link>
              <Link
                href="/emergency/triage"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  pathname === "/emergency/triage"
                    ? "bg-red-600 text-white font-bold shadow-xs"
                    : "text-[#dcdcdc] hover:bg-white/10"
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5 text-red-400" />
                <span>Triage</span>
              </Link>
              <Link
                href="/threat-matrix"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  pathname === "/threat-matrix"
                    ? "bg-amber-500 text-white font-bold shadow-xs"
                    : "text-[#dcdcdc] hover:bg-white/10"
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-amber-300" />
                <span>Threat Matrix</span>
              </Link>
              <Link
                href="/farmer"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  pathname === "/farmer"
                    ? "bg-emerald-600 text-white font-bold shadow-xs"
                    : "text-[#dcdcdc] hover:bg-white/10"
                }`}
              >
                <span>🌾</span>
                <span>Kisan Hub</span>
              </Link>
              <Link
                href="/simple-mode"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition-colors ${
                  pathname === "/simple-mode"
                    ? "bg-sky-500 text-white shadow-xs"
                    : "text-sky-300 hover:bg-sky-500/20"
                }`}
              >
                <span>🎙️</span>
                <span>{t.nav.simpleMode}</span>
              </Link>
            </div>

            {user && (
              <nav className="flex items-center gap-1.5">
                {user.role === "citizen" && (
                  <>
                    <Link
                      href="/citizen/dashboard"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        pathname === "/citizen/dashboard" ? "bg-[#262626] text-white" : "text-[#dcdcdc] hover:bg-white/10"
                      }`}
                    >
                      <ListOrdered className="w-4 h-4 text-[#dcdcdc]" />
                      {t.nav.myRequests}
                    </Link>
                    <Link
                      href="/citizen/new-request"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        pathname === "/citizen/new-request"
                          ? "bg-white text-[#404040] font-bold shadow-xs"
                          : "bg-white/15 text-white hover:bg-white/25 border border-white/20"
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      {t.nav.raiseRequest}
                    </Link>
                  </>
                )}

                {user.role === "worker" && (
                  <Link
                    href="/worker/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      pathname === "/worker/dashboard" ? "bg-[#262626] text-white" : "text-[#dcdcdc] hover:bg-white/10"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-[#dcdcdc]" />
                    {t.nav.assignedJobs}
                  </Link>
                )}

                {user.role === "volunteer" && (
                  <>
                    <Link
                      href="/volunteer/dashboard"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        pathname === "/volunteer/dashboard" ? "bg-[#262626] text-white" : "text-[#dcdcdc] hover:bg-white/10"
                      }`}
                    >
                      <Users className="w-4 h-4 text-[#dcdcdc]" />
                      {t.nav.volunteerHub}
                    </Link>
                    <Link
                      href="/citizen/new-request"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-[#dcdcdc] hover:bg-white/10"
                    >
                      <PlusCircle className="w-4 h-4" />
                      {t.nav.raiseForCitizen}
                    </Link>
                  </>
                )}

                {user.role === "authority" && (
                  <Link
                    href="/authority/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      pathname === "/authority/dashboard" ? "bg-[#262626] text-white" : "text-[#dcdcdc] hover:bg-white/10"
                    }`}
                  >
                    <Shield className="w-4 h-4 text-[#dcdcdc]" />
                    {t.nav.authorityCenter}
                  </Link>
                )}

                {user.role === "super_admin" && (
                  <Link
                    href="/superadmin/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      pathname === "/superadmin/dashboard"
                        ? "bg-[#262626] text-[#53bdeb] font-bold border border-[#53bdeb]/40"
                        : "text-[#dcdcdc] hover:bg-white/10"
                    }`}
                  >
                    <Sliders className="w-4 h-4 text-[#53bdeb]" />
                    {t.nav.superAdminCenter}
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* User Profile Info & Language Switcher & Logout */}
          <div className="flex items-center gap-2.5">
            {/* Multi-Language Dropdown */}
            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white">{user.name}</span>
                    {getRoleBadge(user.role)}
                  </div>
                  <span className="text-[11px] text-[#dcdcdc] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#a6a6a6]" />
                    {user.district || user.location}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  title="Log out"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#dcdcdc] hover:text-white bg-[#262626] hover:bg-black border border-[#707070] rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.common.logout}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#262626] hover:bg-black rounded-lg border border-[#707070] transition-colors"
                >
                  {t.common.signIn}
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 text-xs font-bold text-[#404040] bg-[#f5f5f5] hover:bg-white rounded-lg shadow-xs transition-colors"
                >
                  {t.common.signUp}
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-[#262626] text-[#dcdcdc] hover:text-white border border-[#707070]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#707070] space-y-2">
            {user && (
              <div className="px-2 py-1.5 bg-[#262626] rounded-lg mb-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{user.name}</p>
                  <p className="text-[11px] text-[#dcdcdc]">{user.district || user.location}</p>
                </div>
                {getRoleBadge(user.role)}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-white/10">
              <Link
                href="/smart-complaint"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#53bdeb] hover:bg-[#262626] flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Vision AI
              </Link>
              <Link
                href="/dispatch/simulator"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#25D366] hover:bg-[#262626] flex items-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" />
                AI Calling
              </Link>
              <Link
                href="/emergency/triage"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-[#262626] flex items-center gap-1.5"
              >
                <HeartPulse className="w-3.5 h-3.5" />
                Triage SOS
              </Link>
              <Link
                href="/threat-matrix"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:bg-[#262626] flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" />
                Threat Matrix
              </Link>
              <Link
                href="/farmer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-[#262626] flex items-center gap-1.5"
              >
                <span>🌾</span>
                {t.nav.farmerHub}
              </Link>
              <Link
                href="/simple-mode"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-400 hover:bg-[#262626] flex items-center gap-1.5"
              >
                <span>🎙️</span>
                {t.nav.simpleMode}
              </Link>
              <Link
                href="/schemes"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-400 hover:bg-[#262626] flex items-center gap-1.5"
              >
                <span>📋</span>
                {t.nav.govtSchemes}
              </Link>
              <Link
                href="/inspect"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400 hover:bg-[#262626] flex items-center gap-1.5"
              >
                <span>🔍</span>
                {t.nav.assetInspect}
              </Link>
              <Link
                href="/mesh"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 hover:bg-[#262626] flex items-center gap-1.5"
              >
                <span>📡</span>
                Mesh Relay
              </Link>
              <Link
                href="/services"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#dcdcdc] hover:bg-[#262626]"
              >
                🛠️ {t.nav.services}
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#dcdcdc] hover:bg-[#262626]"
              >
                ❓ {t.nav.faq}
              </Link>
            </div>

            {user?.role === "citizen" && (
              <>
                <Link
                  href="/citizen/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs font-semibold text-[#dcdcdc] hover:bg-[#262626]"
                >
                  📋 {t.nav.myRequests}
                </Link>
                <Link
                  href="/citizen/new-request"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs font-semibold bg-white text-[#404040] font-bold"
                >
                  ➕ {t.nav.raiseRequest}
                </Link>
              </>
            )}

            {user?.role === "worker" && (
              <Link
                href="/worker/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-xs font-semibold text-[#dcdcdc] hover:bg-[#262626]"
              >
                🛠️ {t.nav.assignedJobs}
              </Link>
            )}

            {user?.role === "volunteer" && (
              <>
                <Link
                  href="/volunteer/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs font-semibold text-[#dcdcdc] hover:bg-[#262626]"
                >
                  🤝 {t.nav.volunteerHub}
                </Link>
                <Link
                  href="/citizen/new-request"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs font-semibold text-[#dcdcdc] hover:bg-[#262626]"
                >
                  ➕ {t.nav.raiseForCitizen}
                </Link>
              </>
            )}

            {user?.role === "authority" && (
              <Link
                href="/authority/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-xs font-semibold text-[#dcdcdc] hover:bg-[#262626]"
              >
                🏛️ {t.nav.authorityCenter}
              </Link>
            )}

            {user?.role === "super_admin" && (
              <Link
                href="/superadmin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-xs font-bold text-[#53bdeb] bg-[#262626] border border-[#53bdeb]/40"
              >
                ⚡ {t.nav.superAdminCenter}
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

"use client";

import React, { useState, useEffect } from "react";
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
  Wheat,
  Mic,
  FileText,
  ClipboardCheck,
  ChevronRight,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Compass,
  MessageSquare,
  Bot,
} from "lucide-react";

interface AppShellProps {
  user: UserSession | null;
  children: React.ReactNode;
}

export default function AppShell({ user, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

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
    if (user?.subRole === "ward_member") {
      return (
        <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-indigo-500/40">
          Ward {user.wardScope || "Member"}
        </span>
      );
    }
    if (user?.subRole === "medical_officer") {
      return (
        <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-rose-500/40">
          Medical Command
        </span>
      );
    }
    if (user?.citizenProfile === "women") {
      return (
        <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-rose-500/40">
          Women Hub
        </span>
      );
    }
    switch (role) {
      case "super_admin":
        return (
          <span className="bg-sky-500/20 text-sky-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-sky-500/40">
            {t.nav.superAdminCenter || "Super Admin"}
          </span>
        );
      case "authority":
        return (
          <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-500/40">
            {t.authority.badge || "Authority"}
          </span>
        );
      case "worker":
        return (
          <span className="bg-neutral-600/40 text-neutral-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/20">
            {t.worker.badge || "Worker"}
          </span>
        );
      case "volunteer":
        return (
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/40">
            {t.volunteer.badge || "Volunteer"}
          </span>
        );
      case "citizen":
      default:
        return (
          <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/20">
            {t.citizen.portalBadge || "Citizen"}
          </span>
        );
    }
  };

  const navLinkClasses = (href: string) => {
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
    return `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
      isActive
        ? "bg-white text-black shadow-sm"
        : "text-neutral-300 hover:text-white hover:bg-white/10"
    }`;
  };

  // Full-screen minimalist landing experience on root "/"
  if (pathname === "/") {
    return <main className="min-h-screen bg-black text-white">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans">
      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden animate-in fade-in"
        />
      )}

      {/* ===================== SIDEBAR ===================== */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#1a1a1a] border-r border-white/10 flex flex-col transition-all duration-300 ${
          mobileSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"
        } ${desktopCollapsed ? "md:w-20" : "md:w-64"}`}
      >
        {/* Sidebar Header (Logo) */}
        <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden group">
            <div className="w-9 h-9 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img src="/logo-emblem.png" alt="VANGUARD Emblem" className="w-8 h-8 object-contain" />
            </div>
            {!desktopCollapsed && (
              <div className="truncate">
                <span className="font-extrabold text-base tracking-tight text-white">
                  VANGUARD
                </span>
                <p className="text-[10px] text-neutral-400 -mt-0.5 truncate">{t.common.brandSubtitle}</p>
              </div>
            )}
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1 rounded-lg text-neutral-400 hover:text-white md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Access Action Pills (Simple Mode & Triage) */}
        {!desktopCollapsed && (
          <div className="p-3 border-b border-white/10 space-y-2 shrink-0">
            <Link
              href="/simple-mode"
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-black flex items-center justify-between shadow-md transition-all"
            >
              <span className="flex items-center gap-2">
                <Mic className="w-3.5 h-3.5 animate-pulse" />
                <span>{t.nav.simpleMode}</span>
              </span>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded">{t.common.voiceBadge}</span>
            </Link>

            <Link
              href="/emergency/triage"
              className="w-full py-2 px-3 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-black flex items-center justify-between shadow-md transition-all"
            >
              <span className="flex items-center gap-2">
                <HeartPulse className="w-3.5 h-3.5 animate-pulse" />
                <span>{t.nav.emergencyTriage}</span>
              </span>
              <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded">{t.common.sosBadge}</span>
            </Link>
          </div>
        )}

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {/* Section 1: User Role Workspace */}
          {user && (
            <div className="space-y-1">
              {!desktopCollapsed && (
                <div className="px-2 text-[10px] font-black uppercase tracking-wider text-neutral-400">
                  {t.nav.yourWorkspace}
                </div>
              )}

              {user.role === "citizen" && (
                <>
                  <Link href="/citizen/dashboard" className={navLinkClasses("/citizen/dashboard")}>
                    <ListOrdered className="w-4 h-4 text-sky-400 shrink-0" />
                    {!desktopCollapsed && <span>{t.nav.myRequests || "My Grievance Hub"}</span>}
                  </Link>
                  <Link href="/citizen/women" className={navLinkClasses("/citizen/women")}>
                    <Shield className="w-4 h-4 text-rose-400 shrink-0" />
                    {!desktopCollapsed && <span>Women Hub (SafeLine)</span>}
                  </Link>
                  <Link href="/farmer" className={navLinkClasses("/farmer")}>
                    <Wheat className="w-4 h-4 text-emerald-400 shrink-0" />
                    {!desktopCollapsed && <span>{t.nav.farmerHub}</span>}
                  </Link>
                  <Link href="/citizen/new-request" className={navLinkClasses("/citizen/new-request")}>
                    <PlusCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    {!desktopCollapsed && <span>{t.nav.raiseRequest}</span>}
                  </Link>
                </>
              )}

              {user.role === "worker" && (
                <Link href="/worker/dashboard" className={navLinkClasses("/worker/dashboard")}>
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  {!desktopCollapsed && <span>{t.nav.assignedJobs}</span>}
                </Link>
              )}

              {user.role === "volunteer" && (
                <>
                  <Link href="/volunteer/dashboard" className={navLinkClasses("/volunteer/dashboard")}>
                    <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                    {!desktopCollapsed && <span>{t.nav.volunteerHub}</span>}
                  </Link>
                  <Link href="/citizen/new-request" className={navLinkClasses("/citizen/new-request")}>
                    <PlusCircle className="w-4 h-4 text-sky-400 shrink-0" />
                    {!desktopCollapsed && <span>{t.nav.raiseForCitizen}</span>}
                  </Link>
                </>
              )}

              {(user.role === "authority" || user.role === "higher_authority") && (
                <>
                  <Link href="/authority/dashboard" className={navLinkClasses("/authority/dashboard")}>
                    <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                    {!desktopCollapsed && (
                      <span>
                        {user.subRole === "ward_member" ? `Ward ${user.wardScope || "4"} Center` : (t.nav.authorityCenter || "Command Center")}
                      </span>
                    )}
                  </Link>
                  <Link href="/inspect" className={navLinkClasses("/inspect")}>
                    <ClipboardCheck className="w-4 h-4 text-blue-400 shrink-0" />
                    {!desktopCollapsed && <span>Public Asset Watch</span>}
                  </Link>
                </>
              )}

              {user.role === "super_admin" && (
                <>
                  <Link href="/higher-official/dashboard" className={navLinkClasses("/higher-official/dashboard")}>
                    <HeartPulse className="w-4 h-4 text-rose-400 shrink-0" />
                    {!desktopCollapsed && <span>Medical & Blood Command</span>}
                  </Link>
                  <Link href="/superadmin/dashboard" className={navLinkClasses("/superadmin/dashboard")}>
                    <Sliders className="w-4 h-4 text-sky-400 shrink-0" />
                    {!desktopCollapsed && <span>State HQ Governance</span>}
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Section 2: AI & Emergency Hub */}
          <div className="space-y-1">
            {!desktopCollapsed && (
              <div className="px-2 text-[10px] font-black uppercase tracking-wider text-neutral-400">
                {t.nav.aiEmergencyHub}
              </div>
            )}
            <Link href="/emergency/triage" className={navLinkClasses("/emergency/triage")}>
              <HeartPulse className="w-4 h-4 text-red-400 shrink-0" />
              {!desktopCollapsed && <span>{t.nav.emergencyTriage}</span>}
            </Link>
            <Link href="/threat-matrix" className={navLinkClasses("/threat-matrix")}>
              <Activity className="w-4 h-4 text-amber-400 shrink-0" />
              {!desktopCollapsed && <span>{t.nav.threatHeatmap}</span>}
            </Link>
            <Link href="/smart-complaint" className={navLinkClasses("/smart-complaint")}>
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
              {!desktopCollapsed && <span>{t.nav.visionAiReport}</span>}
            </Link>
            <Link href="/dispatch/simulator" className={navLinkClasses("/dispatch/simulator")}>
              <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
              {!desktopCollapsed && <span>{t.nav.aiCallingDispatch}</span>}
            </Link>
            <Link href="/mesh" className={navLinkClasses("/mesh")}>
              <Radio className="w-4 h-4 text-purple-400 shrink-0" />
              {!desktopCollapsed && <span>{t.nav.meshRelay}</span>}
            </Link>

            {/* Interactive Assistants Triggers */}
            <button
              type="button"
              onClick={() => {
                setMobileSidebarOpen(false);
                window.dispatchEvent(new CustomEvent("vanguard:open-guide"));
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:bg-white/10 hover:text-white transition-all text-left cursor-pointer"
              title="Interactive AI Guide"
            >
              <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
              {!desktopCollapsed && <span>{t.nav.aiGuide}</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileSidebarOpen(false);
                window.dispatchEvent(new CustomEvent("vanguard:open-whatsapp"));
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:bg-white/10 hover:text-white transition-all text-left cursor-pointer"
              title="WhatsApp Bot Simulator"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              {!desktopCollapsed && <span>{t.nav.whatsAppDemo}</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileSidebarOpen(false);
                window.dispatchEvent(new CustomEvent("vanguard:open-regional-ai"));
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:bg-white/10 hover:text-white transition-all text-left cursor-pointer"
              title="Regional AI Copilot"
            >
              <Bot className="w-4 h-4 text-indigo-400 shrink-0" />
              {!desktopCollapsed && <span>{t.nav.regionalAi}</span>}
            </button>
          </div>

          {/* Section 3: Rural Governance & Agrarian Hub */}
          <div className="space-y-1">
            {!desktopCollapsed && (
              <div className="px-2 text-[10px] font-black uppercase tracking-wider text-neutral-400">
                {t.nav.ruralFarmerServices}
              </div>
            )}
            <Link href="/simple-mode" className={navLinkClasses("/simple-mode")}>
              <Mic className="w-4 h-4 text-sky-400 shrink-0" />
              {!desktopCollapsed && <span>{t.nav.simpleMode}</span>}
            </Link>
            <Link href="/farmer" className={navLinkClasses("/farmer")}>
              <Wheat className="w-4 h-4 text-emerald-400 shrink-0" />
              {!desktopCollapsed && <span>{t.nav.farmerHub}</span>}
            </Link>
            <Link href="/schemes" className={navLinkClasses("/schemes")}>
              <FileText className="w-4 h-4 text-purple-400 shrink-0" />
              {!desktopCollapsed && <span>{t.nav.govtSchemes}</span>}
            </Link>
            <Link href="/inspect" className={navLinkClasses("/inspect")}>
              <ClipboardCheck className="w-4 h-4 text-blue-400 shrink-0" />
              {!desktopCollapsed && <span>{t.nav.assetInspect}</span>}
            </Link>
          </div>

          {/* Section 4: Public Directory */}
          <div className="space-y-1">
            {!desktopCollapsed && (
              <div className="px-2 text-[10px] font-black uppercase tracking-wider text-neutral-400">
                {t.nav.infoHelp}
              </div>
            )}
            <Link href="/services" className={navLinkClasses("/services")}>
              <Layers className="w-4 h-4 text-neutral-400 shrink-0" />
              {!desktopCollapsed && <span>{t.nav.services}</span>}
            </Link>
            <Link href="/faq" className={navLinkClasses("/faq")}>
              <HelpCircle className="w-4 h-4 text-neutral-400 shrink-0" />
              {!desktopCollapsed && <span>{t.nav.faq}</span>}
            </Link>
          </div>
        </div>

        {/* Sidebar Footer: User Profile / Logout */}
        <div className="p-3 border-t border-white/10 bg-[#151515] shrink-0">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 font-black text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {!desktopCollapsed && (
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{user.name}</div>
                      <div className="text-[10px] text-neutral-400 truncate flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        {user.district || user.location}
                      </div>
                    </div>
                  )}
                </div>
                {!desktopCollapsed && getRoleBadge(user.role)}
              </div>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-white/5"
              >
                <LogOut className="w-3.5 h-3.5" />
                {!desktopCollapsed && <span>{t.common.logout}</span>}
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Link
                href="/login"
                className="w-full py-2 px-3 rounded-xl bg-white text-black font-black text-xs flex items-center justify-center transition-colors"
              >
                {!desktopCollapsed ? t.common.signIn : <User className="w-4 h-4" />}
              </Link>
              {!desktopCollapsed && (
                <Link
                  href="/signup"
                  className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center transition-colors border border-white/10"
                >
                  {t.common.signUp}
                </Link>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ===================== MAIN CONTENT WRAPPER ===================== */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          desktopCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        {/* ===================== TOP HEADER ===================== */}
        <header className="h-16 bg-[#1a1a1a] border-b border-white/10 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
          {/* Left: Sidebar Toggle & Section Title */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white md:hidden transition-colors"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Collapse / Expand Toggle */}
            <button
              onClick={() => setDesktopCollapsed(!desktopCollapsed)}
              className="hidden md:flex p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
              title={desktopCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {desktopCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            <div className="hidden sm:block">
              <div className="text-xs font-bold text-neutral-400">
                {t.common.topbarTitle}
              </div>
            </div>
          </div>

          {/* Right: ONLY Language Switcher (Prominent & Clean!) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 hidden sm:inline font-medium">
                {t.common.languageLabel}
              </span>
              {/* Language Switcher Dropdown */}
              <LanguageSwitcher />
            </div>

            {/* If user logged in, small visual badge */}
            {user && (
              <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-white/10 text-xs">
                <span className="font-bold text-white truncate max-w-[120px]">{user.name}</span>
                {getRoleBadge(user.role)}
              </div>
            )}
          </div>
        </header>

        {/* ===================== PAGE CONTENT ===================== */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* ===================== FOOTER ===================== */}
        <footer className="bg-[#181818] border-t border-white/10 py-6 text-xs text-neutral-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-semibold text-neutral-300">
              {t.common.footerTitle}
            </p>
            <p className="text-neutral-500">
              {t.common.footerSubtitle}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

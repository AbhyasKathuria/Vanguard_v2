import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import FloatingAssistantDock from "@/components/FloatingAssistantDock";
import RegionalAIChatbot from "@/components/RegionalAIChatbot";
import WhatsAppSimulator from "@/components/WhatsAppSimulator";
import AIGuideCopilot from "@/components/AIGuideCopilot";
import { LanguageProvider, LanguageLocale } from "@/lib/i18n/context";
import OfflineSyncProvider from "@/components/offline/OfflineSyncProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "VANGUARD — Rural Service Routing Platform",
  description: "Empowering rural citizens with instant rule-based service routing, worker dispatch, and civic protection.",
  icons: {
    icon: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("vanguard_locale")?.value;
  const initialLocale: LanguageLocale = cookieLocale || user?.language || "en";

  return (
    <html lang={initialLocale}>
      <body className="bg-[#f5f5f5] text-[#262626] min-h-screen antialiased selection:bg-neutral-300">
        <LanguageProvider initialLocale={initialLocale}>
          <OfflineSyncProvider>
            <AppShell user={user}>
              {children}
            </AppShell>
            {/* Unified Floating Assistant Dock on Bottom-Right */}
            <FloatingAssistantDock />
            {/* Interactive WhatsApp Phone Modal */}
            <WhatsAppSimulator />
            {/* Regional Multi-Lingual AI Copilot Drawer */}
            <RegionalAIChatbot />
            {/* Floating Interactive Step-by-Step AI Guide Co-Pilot */}
            <AIGuideCopilot />
          </OfflineSyncProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

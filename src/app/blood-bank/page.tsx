import React from "react";
import BloodBankDirectory from "@/components/blood-bank/BloodBankDirectory";

export const metadata = {
  title: "Area Blood Bank & Donation Centre Directory — VANGUARD",
  description: "Verified government-authorized blood banks, live unit stock telemetry, and emergency donor broadcast.",
};

export default function BloodBankPage() {
  return (
    <div className="max-w-6xl mx-auto py-4 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight">
          Verified Blood Banks &amp; Emergency Supply
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          Government-authorized blood centres, live blood group stocks, and direct emergency dispatch.
        </p>
      </div>

      <BloodBankDirectory />
    </div>
  );
}

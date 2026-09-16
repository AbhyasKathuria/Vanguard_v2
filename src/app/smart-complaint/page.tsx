import React from "react";
import ImageComplaintForm from "@/components/ImageComplaintForm";

export const metadata = {
  title: "Multimodal AI Complaint Engine — VANGUARD",
  description:
    "Direct image upload, automatic vision inspection, defect diagnosis, and auto-drafted civic grievance dispatch.",
};

export default function SmartComplaintPage() {
  return (
    <div className="py-4">
      <ImageComplaintForm />
    </div>
  );
}

import { NextResponse } from "next/server";
import { evaluateHumanTriage, evaluateVeterinaryTriage } from "@/lib/ai/triageEngine";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      domain = "human",
      symptoms = [],
      species = "Stray Canine",
      injuryType = "Hit-and-Run Trauma",
      district = "Rampur",
      additionalNotes = "",
      triggerSos = false,
      location = "District Center",
    } = body;

    let evaluation;
    if (domain === "veterinary") {
      evaluation = evaluateVeterinaryTriage(species, injuryType, district, additionalNotes);
    } else {
      evaluation = evaluateHumanTriage(symptoms, district, additionalNotes);
    }

    let triageLogId: string | null = null;
    if (triggerSos) {
      try {
        const log = await prisma.triageLog.create({
          data: {
            type: domain,
            patientType: evaluation.patientType,
            symptoms: domain === "veterinary" ? `${species}: ${injuryType}` : symptoms.join(", "),
            severity: evaluation.severity,
            priorityScore: evaluation.priorityScore,
            vitalSigns: JSON.stringify({ dangerSigns: evaluation.dangerSigns }),
            firstAidProtocol: evaluation.firstAidSteps.map((s) => `${s.step}. ${s.title}: ${s.detail}`).join(" | "),
            matchedServices: JSON.stringify(evaluation.matchedFacilities),
            dispatchedSos: true,
            location: location || district,
          },
        });
        triageLogId = log.id;
      } catch (logErr) {
        console.warn("[API triage] Could not save TriageLog:", logErr);
      }
    }

    return NextResponse.json({
      success: true,
      evaluation,
      triageLogId,
    });
  } catch (error: any) {
    console.error("[API triage] Error:", error);
    return NextResponse.json({ error: "Failed to evaluate triage." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { evaluateHumanTriage, evaluateVeterinaryTriage } from "@/lib/ai/triageEngine";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { determineRoutingAndAssignment } from "@/lib/routing";
import { sendEmergencyPush } from "@/lib/integrations/notifications";
import { geocodeLocation } from "@/lib/geo";

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
      latitude,
      longitude,
    } = body;

    let evaluation;
    if (domain === "veterinary") {
      evaluation = evaluateVeterinaryTriage(species, injuryType, district, additionalNotes);
    } else {
      evaluation = evaluateHumanTriage(symptoms, district, additionalNotes);
    }

    let triageLogId: string | null = null;
    let createdRequestId: string | null = null;
    let assignedResponderName: string | null = null;

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

      // --- End-to-End Emergency Dispatch Pipeline ---
      try {
        // 1. Resolve Reporter User
        const sessionUser = await getCurrentUser();
        let reporterId = sessionUser?.id;
        if (!reporterId) {
          const defaultCitizen = await prisma.user.findFirst({
            where: { role: "citizen" },
          });
          reporterId = defaultCitizen ? defaultCitizen.id : "usr_citizen_1";
        }

        // 2. Resolve Geospatial Coordinates
        let coords =
          latitude && longitude
            ? { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
            : await geocodeLocation(location || district);

        if (!coords) {
          const dLow = (district || "").toLowerCase();
          coords = dLow.includes("sitapur")
            ? { latitude: 27.5656, longitude: 80.6829 }
            : dLow.includes("mandya")
            ? { latitude: 12.5234, longitude: 76.8973 }
            : dLow.includes("shivamogga")
            ? { latitude: 13.9299, longitude: 75.5681 }
            : { latitude: 28.8154, longitude: 79.025 };
        }

        // 3. Format Incident Description
        const sosTitle =
          domain === "veterinary"
            ? `ANIMAL RESCUE SOS: ${species} (${injuryType})`
            : `AMBULANCE EMERGENCY SOS: ${evaluation.patientType}`;

        const sosDescription =
          domain === "veterinary"
            ? `Immediate veterinary rescue at ${location || district}. Species: ${species}, Trauma: ${injuryType}. Notes: ${additionalNotes || "Urgent assistance required."}`
            : `Critical emergency triage (${evaluation.severity}) at ${location || district}. Suspected: ${evaluation.patientType}. Danger Signs: ${evaluation.dangerSigns.join(", ") || "Acute distress"}. Symptoms: ${symptoms.join(", ")}.`;

        // 4. Geospatial Proximity Match via Routing Engine
        const routingResult = await determineRoutingAndAssignment(
          "emergency",
          location || district,
          sosDescription,
          coords
        );

        // 5. Create Active Emergency Request
        const newRequest = await prisma.request.create({
          data: {
            userId: reporterId,
            category: "emergency",
            description: sosDescription,
            priority: "high",
            location: location || `${district} Emergency Sector`,
            district: district || "Rampur",
            latitude: coords.latitude,
            longitude: coords.longitude,
            status: routingResult.status,
            assignedToId: routingResult.assignedToId,
            updates: {
              create: [
                {
                  userId: reporterId,
                  status: "open",
                  message: `Emergency SOS triggered via Clinical Triage (${evaluation.patientType} • ${evaluation.severity}).`,
                },
                ...(routingResult.assignedToId
                  ? [
                      {
                        userId: routingResult.assignedToId,
                        status: "assigned",
                        message: routingResult.auditMessage,
                      },
                    ]
                  : []),
              ],
            },
          },
        });

        createdRequestId = newRequest.id;
        assignedResponderName = routingResult.matchedPersonnelName || null;

        // 6. Real-Time Audible / Vibration Push Dispatch to Responder
        if (routingResult.assignedToId) {
          sendEmergencyPush({
            responderId: routingResult.assignedToId,
            responderName: routingResult.matchedPersonnelName,
            incidentTitle: sosTitle,
            location: location || district,
            distanceKm: routingResult.distanceKm,
            actionUrl: routingResult.matchedRole?.includes("Worker")
              ? "/worker/dashboard"
              : "/volunteer/dashboard",
          }).catch((pushErr) => {
            console.warn("[API triage] Push dispatch error:", pushErr);
          });
        }
      } catch (dispatchErr) {
        console.error("[API triage] Full emergency dispatch error:", dispatchErr);
      }
    }

    return NextResponse.json({
      success: true,
      evaluation,
      triageLogId,
      requestId: createdRequestId,
      assignedResponder: assignedResponderName,
    });
  } catch (error: any) {
    console.error("[API triage] Error:", error);
    return NextResponse.json({ error: "Failed to evaluate triage." }, { status: 500 });
  }
}

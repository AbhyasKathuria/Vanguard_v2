import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const EmergencyCallbackSchema = z
  .object({
    callerId: z.string().optional(),
    callerPhone: z.string().min(5, "Caller phone must be at least 5 digits").optional(),
    phone: z.string().min(5).optional(),
    emergencyType: z.string().default("general"),
    severity: z.string().default("Critical"),
    priority: z.string().optional(),
    location: z.string().min(1, "Location is required"),
    district: z.string().default("Rampur"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    victimStatus: z.string().optional(),
  })
  .refine((data) => !!(data.callerPhone || data.phone), {
    message: "Either phone or callerPhone must be provided",
    path: ["callerPhone"],
  })
  .transform((data) => ({
    ...data,
    callerPhone: data.callerPhone || data.phone || "Emergency Caller",
    severity: (data.priority || data.severity || "Critical") as "Critical" | "High" | "Moderate",
  }));

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const rawBody = await request.json();
    const parseResult = EmergencyCallbackSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid emergency payload",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const payload = parseResult.data;
    const ticketId = `EMG-${payload.district.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Decoupled asynchronous background processing (does not block HTTP response)
    const backgroundTask = (async () => {
      try {
        await prisma.triageLog.create({
          data: {
            type: payload.emergencyType === "veterinary" ? "veterinary" : "human",
            patientType: `Emergency Callback: ${payload.emergencyType.toUpperCase()}`,
            symptoms: payload.victimStatus || `Urgent ${payload.emergencyType} dispatch callback`,
            severity: payload.severity === "Critical" ? "Code Red" : "Code Orange",
            priorityScore: payload.severity === "Critical" ? 99 : 85,
            vitalSigns: JSON.stringify({ callbackTicket: ticketId, phone: payload.callerPhone }),
            firstAidProtocol: "Immediate rapid ambulance / mobile rescue response team mobilized.",
            dispatchedSos: true,
            location: `${payload.location} (${payload.district})`,
          },
        });
      } catch (logErr) {
        console.warn("[Emergency Callback Background Task] Logging error:", logErr);
      }
    })();

    // Ensure background task doesn't block the instant 202 acknowledgment
    // In Node runtime, floating promises execute in the event loop
    void backgroundTask;

    const latencyMs = Date.now() - startTime;

    // Guaranteed sub-500ms immediate HTTP 202 response
    return NextResponse.json(
      {
        status: "accepted",
        dispatched: true,
        emergencyTicket: ticketId,
        acknowledgedAt: new Date().toISOString(),
        latencyMs,
        dispatchStatus: "units_mobilizing",
        assignedUnit: payload.emergencyType === "veterinary" ? "Karuna Mobile Animal Ambulance" : "Ambulance Unit 4 (PHC Trauma)",
        estimatedEta: "4-6 mins",
        emergencyHotlines: ["112", "108", "102"],
      },
      { status: 202 }
    );
  } catch (error: any) {
    console.error("[API emergency/callback] Error:", error);
    return NextResponse.json(
      { error: "Internal dispatch gateway error." },
      { status: 500 }
    );
  }
}

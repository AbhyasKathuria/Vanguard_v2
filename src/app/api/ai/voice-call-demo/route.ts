import { NextResponse } from "next/server";
import { getEmergencyScenarios, processVoiceCallTurn } from "@/lib/ai/voiceDispatch";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const scenarios = getEmergencyScenarios();
    return NextResponse.json({ success: true, scenarios });
  } catch (error: any) {
    console.error("[API voice-call-demo GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch scenarios." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      scenarioId = "raw",
      userMessage,
      history = [],
      saveCallLog = false,
      callerName,
      callerPhone = "925",
      locale = "en",
      durationSeconds = 0,
      gpsCoords = null,
    } = body;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json(
        { error: "userMessage is required." },
        { status: 400 }
      );
    }

    const result = await processVoiceCallTurn(
      scenarioId,
      userMessage,
      history,
      locale,
      gpsCoords
    );

    let savedCallId: string | null = null;

    if (saveCallLog) {
      try {
        const fullTranscript = [
          ...history,
          { speaker: "caller", text: userMessage, timestamp: new Date().toLocaleTimeString() },
          { speaker: "agent", text: result.reply, timestamp: new Date().toLocaleTimeString() },
        ];

        const log = await prisma.callLog.create({
          data: {
            callerName: callerName || "Citizen Caller (Hotline 925)",
            callerPhone: callerPhone || "925",
            scenarioTitle: result.incidentSummary || (scenarioId === "raw" ? "Live Emergency Report" : scenarioId),
            urgency: result.urgency,
            status: result.dispatchTriggered ? "dispatched" : "completed",
            transcriptJson: JSON.stringify(fullTranscript),
            dispatchUnit: result.assignedUnit || "Rapid Response Unit",
            estimatedEta: result.etaMinutes ? `${result.etaMinutes} mins` : "4 mins",
            location: result.extractedLocation || "District Hub",
            durationSeconds: Number(durationSeconds) || 30,
          },
        });
        savedCallId = log.id;
      } catch (dbErr) {
        console.warn("[API voice-call-demo] Failed to save CallLog:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      result,
      savedCallId,
    });
  } catch (error: any) {
    console.error("[API voice-call-demo POST] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process call turn." },
      { status: 500 }
    );
  }
}

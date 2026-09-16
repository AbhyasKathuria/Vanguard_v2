import { NextResponse } from "next/server";
import { analyzeComplaintImage } from "@/lib/ai/vision";
import { z } from "zod";

export const dynamic = "force-dynamic";

const AnalyzeComplaintSchema = z.object({
  image: z.string().min(10, "Image payload must be a valid base64 data string or image URL"),
  userContext: z.string().max(1000, "User context cannot exceed 1000 characters").optional(),
  exifData: z
    .object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      timestamp: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    let rawBody: any;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON format in request body." },
        { status: 400 }
      );
    }

    const validation = AnalyzeComplaintSchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed on complaint payload.",
          issues: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { image, userContext, exifData } = validation.data;
    const analysis = await analyzeComplaintImage(image, userContext, exifData);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error("[API analyze-complaint] Error:", error);
    return NextResponse.json(
      { error: "Failed to perform vision analysis on image." },
      { status: 500 }
    );
  }
}

import { fetchLocationWeather } from "@/lib/integrations/weather";
import { geocodeLocation } from "@/lib/geo";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const loc = searchParams.get("location");

    let finalLat = lat ? parseFloat(lat) : null;
    let finalLon = lon ? parseFloat(lon) : null;

    if ((!finalLat || !finalLon) && loc) {
      const coords = await geocodeLocation(loc);
      if (coords) {
        finalLat = coords.latitude;
        finalLon = coords.longitude;
      }
    }

    if (!finalLat || !finalLon) {
      // Default to Rampur
      finalLat = 28.8154;
      finalLon = 79.025;
    }

    const weather = await fetchLocationWeather(finalLat, finalLon);
    return NextResponse.json({ weather });
  } catch (error: any) {
    console.error("Weather API error:", error);
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
  }
}

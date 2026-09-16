/**
 * Geographic distance calculations and OpenStreetMap Nominatim geocoding resolver
 * for VANGUARD's rural service routing engine.
 */

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  displayName?: string;
}

// Configurable dispatch radius by problem category (in kilometers)
export const CATEGORY_DISPATCH_RADIUS_KM: Record<string, number> = {
  emergency: 30, // 30 km wide radius for urgent life-safety / NGO ambulance response
  health: 20,    // 20 km for rural health workers & first aid
  civic: 15,     // 15 km for electricians, plumbers, utility workers
  farming: 25,   // 25 km for farm equipment & canal technicians
  other: 15,     // 15 km default
};

// Known coordinates dictionary for rural seed districts & demo villages (fast zero-latency cache/fallback)
const KNOWN_RURAL_COORDINATES: Record<string, GeoCoordinates> = {
  rampur: { latitude: 28.8154, longitude: 79.025, displayName: "Rampur, Uttar Pradesh" },
  "rampur ward 4": { latitude: 28.8154, longitude: 79.025, displayName: "Rampur Ward 4, Uttar Pradesh" },
  "rampur east": { latitude: 28.825, longitude: 79.035, displayName: "Rampur East, Uttar Pradesh" },
  sitapur: { latitude: 27.5684, longitude: 80.6829, displayName: "Sitapur, Uttar Pradesh" },
  "sitapur north": { latitude: 27.5784, longitude: 80.6929, displayName: "Sitapur North, Uttar Pradesh" },
  mandya: { latitude: 12.5218, longitude: 76.8951, displayName: "Mandya, Karnataka" },
  "mandya rural": { latitude: 12.5218, longitude: 76.8951, displayName: "Mandya Rural, Karnataka" },
  shivamogga: { latitude: 13.9299, longitude: 75.5681, displayName: "Shivamogga, Karnataka" },
  "shivamogga rural": { latitude: 13.9299, longitude: 75.5681, displayName: "Shivamogga Rural, Karnataka" },
  kolar: { latitude: 13.1367, longitude: 78.1291, displayName: "Kolar, Karnataka" },
  belagavi: { latitude: 15.8497, longitude: 74.4977, displayName: "Belagavi, Karnataka" },
  dharwad: { latitude: 15.4589, longitude: 75.0078, displayName: "Dharwad, Karnataka" },
  bengaluru: { latitude: 12.9716, longitude: 77.5946, displayName: "Bengaluru, Karnataka" },
  bangalore: { latitude: 12.9716, longitude: 77.5946, displayName: "Bengaluru, Karnataka" },
};

/**
 * Calculates Haversine distance between two coordinates in kilometers.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Rounded to 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Geocodes a free-text location query to latitude/longitude coordinates.
 * 1. Checks in-memory dictionary for known rural demo villages.
 * 2. Queries OpenStreetMap Nominatim API (free, no-key required).
 * 3. Gracefully degrades to null if network is unavailable.
 */
export async function geocodeLocation(query: string): Promise<GeoCoordinates | null> {
  if (!query || !query.trim()) return null;

  const normalized = query.trim().toLowerCase();

  // 1. Fast Dictionary Lookup
  for (const [key, coords] of Object.entries(KNOWN_RURAL_COORDINATES)) {
    if (normalized === key || normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }

  // 2. OpenStreetMap Nominatim Live Geocoding API
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&countrycodes=in&limit=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s strict timeout

    const res = await fetch(url, {
      headers: {
        "User-Agent": "VANGUARD-Rural-Service-Routing-Platform/1.0",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          return {
            latitude: lat,
            longitude: lon,
            displayName: item.display_name,
          };
        }
      }
    }
  } catch {
    // Graceful fallback to null on timeout or offline state
  }

  return null;
}

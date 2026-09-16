import { prisma } from "./prisma";
import { RequestCategory, RequestPriority } from "./types";
import { calculateDistanceKm, geocodeLocation, CATEGORY_DISPATCH_RADIUS_KM, GeoCoordinates } from "./geo";

export function getCategoryDefaultPriority(category: RequestCategory): RequestPriority {
  switch (category) {
    case "emergency":
    case "health":
      return "high";
    case "civic":
    case "other":
      return "medium";
    case "farming":
      return "low";
    default:
      return "medium";
  }
}

export interface RoutingMatchResult {
  assignedToId: string | null;
  status: "assigned" | "open";
  auditMessage: string;
  matchedPersonnelName?: string;
  matchedRole?: string;
  distanceKm?: number;
  coordinates?: GeoCoordinates | null;
}

/**
 * Deterministic Rule-Based & Geolocation-Aware Routing Algorithm
 * 1. Matches category to default priority (HIGH/MEDIUM/LOW).
 * 2. Resolves request location coordinates via Nominatim / rural dictionary.
 * 3. Applies strict verification gate (availability: true AND verified: true).
 * 4. Ranks verified candidates within category dispatch radius by nearest Haversine distance.
 * 5. Falls back to exact/substring location matching if coordinates are unavailable.
 * 6. Queues for Local Authority triage if no verified candidate is within coverage radius.
 */
export async function determineRoutingAndAssignment(
  category: RequestCategory,
  location: string,
  description: string,
  providedCoords?: GeoCoordinates | null
): Promise<RoutingMatchResult> {
  const normLocation = location.trim().toLowerCase();
  const maxRadius = CATEGORY_DISPATCH_RADIUS_KM[category] || 15;

  // Resolve coordinates if not explicitly provided
  const coords = providedCoords || (await geocodeLocation(location));

  // 1. If Civic / Health / Farming, search Workers first
  if (category === "civic" || category === "health" || category === "farming") {
    const candidateWorkers = await prisma.workerProfile.findMany({
      where: {
        availability: true,
        verified: true, // Hard Verification Gate
      },
      include: {
        user: true,
      },
    });

    // Geo-radius candidate matching (if request has coordinates)
    if (coords && coords.latitude && coords.longitude) {
      const workersWithDistance = candidateWorkers
        .filter((w) => w.latitude !== null && w.longitude !== null)
        .map((w) => {
          const dist = calculateDistanceKm(
            coords.latitude,
            coords.longitude,
            w.latitude!,
            w.longitude!
          );
          return { worker: w, distance: dist };
        })
        .filter((item) => item.distance <= maxRadius)
        .sort((a, b) => a.distance - b.distance);

      if (workersWithDistance.length > 0) {
        const nearest = workersWithDistance[0];
        return {
          assignedToId: nearest.worker.userId,
          status: "assigned",
          matchedPersonnelName: nearest.worker.user.name,
          matchedRole: `Worker (${nearest.worker.profession})`,
          distanceKm: nearest.distance,
          coordinates: coords,
          auditMessage: `Auto-routed to nearest verified worker ${nearest.worker.user.name} (${nearest.worker.profession}) in ${nearest.worker.location} (${nearest.distance} km away).`,
        };
      }
    }

    // Fallback: String matching (for legacy or un-geocoded locations)
    const matchedWorker = candidateWorkers.find((w) => {
      const workerLoc = w.location.trim().toLowerCase();
      return workerLoc === normLocation || workerLoc.includes(normLocation) || normLocation.includes(workerLoc);
    });

    if (matchedWorker) {
      return {
        assignedToId: matchedWorker.userId,
        status: "assigned",
        matchedPersonnelName: matchedWorker.user.name,
        matchedRole: `Worker (${matchedWorker.profession})`,
        coordinates: coords,
        auditMessage: `Auto-routed to verified local worker ${matchedWorker.user.name} (${matchedWorker.profession}) in ${matchedWorker.location}.`,
      };
    }
  }

  // 2. If Emergency, Other, or no worker matched: search Volunteers
  const candidateVolunteers = await prisma.volunteerProfile.findMany({
    where: {
      availability: true,
      verified: true, // Hard Verification Gate
    },
    include: {
      user: true,
    },
  });

  // Geo-radius candidate matching for volunteers
  if (coords && coords.latitude && coords.longitude) {
    const volunteersWithDistance = candidateVolunteers
      .filter((v) => v.latitude !== null && v.longitude !== null)
      .map((v) => {
        const dist = calculateDistanceKm(
          coords.latitude,
          coords.longitude,
          v.latitude!,
          v.longitude!
        );
        return { volunteer: v, distance: dist };
      })
      .filter((item) => item.distance <= maxRadius)
      .sort((a, b) => a.distance - b.distance);

    if (volunteersWithDistance.length > 0) {
      const nearest = volunteersWithDistance[0];
      return {
        assignedToId: nearest.volunteer.userId,
        status: "assigned",
        matchedPersonnelName: nearest.volunteer.user.name,
        matchedRole: `Volunteer (${nearest.volunteer.organization})`,
        distanceKm: nearest.distance,
        coordinates: coords,
        auditMessage: `Auto-routed to nearest verified volunteer ${nearest.volunteer.user.name} (${nearest.volunteer.organization}) in ${nearest.volunteer.area} (${nearest.distance} km away).`,
      };
    }
  }

  // Fallback: String matching for volunteers
  const matchedVolunteer = candidateVolunteers.find((v) => {
    const volArea = v.area.trim().toLowerCase();
    return volArea === normLocation || volArea.includes(normLocation) || normLocation.includes(volArea);
  });

  if (matchedVolunteer) {
    return {
      assignedToId: matchedVolunteer.userId,
      status: "assigned",
      matchedPersonnelName: matchedVolunteer.user.name,
      matchedRole: `Volunteer (${matchedVolunteer.organization})`,
      coordinates: coords,
      auditMessage: `Auto-routed to verified local volunteer ${matchedVolunteer.user.name} (${matchedVolunteer.organization}) for area ${matchedVolunteer.area}.`,
    };
  }

  // 3. Fallback: Queue for Local Authority triage
  return {
    assignedToId: null,
    status: "open",
    coordinates: coords,
    auditMessage: `Request submitted. No verified available personnel found within ${maxRadius} km coverage in "${location}". Queued for Local Authority review and manual dispatch.`,
  };
}

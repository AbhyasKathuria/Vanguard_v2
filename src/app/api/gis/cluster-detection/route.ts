import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtFilter = searchParams.get("district");
    const radiusKm = parseFloat(searchParams.get("radius") || "3.5");

    // Fetch active/unresolved complaints
    const whereClause: any = {
      status: { not: "resolved" },
    };
    if (districtFilter && districtFilter !== "all") {
      whereClause.district = districtFilter;
    }

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    // Group complaints with valid GPS coordinates into clusters
    const validComplaints = complaints.filter(
      (c) => c.latitude !== null && c.longitude !== null
    );

    const visited = new Set<string>();
    const clusters: Array<{
      clusterId: string;
      title: string;
      category: string;
      district: string;
      centroidLat: number;
      centroidLng: number;
      incidentCount: number;
      severity: "Critical" | "High" | "Moderate";
      suggestedRootCause: string;
      actionRecommended: string;
      affectedEstimate: number;
      incidents: Array<{
        id: string;
        title: string;
        village?: string | null;
        createdAt: Date;
        urgency: string;
      }>;
    }> = [];

    const standalone: Array<any> = [];

    for (let i = 0; i < validComplaints.length; i++) {
      const target = validComplaints[i];
      if (visited.has(target.id)) continue;

      const group = [target];
      visited.add(target.id);

      for (let j = i + 1; j < validComplaints.length; j++) {
        const other = validComplaints[j];
        if (visited.has(other.id)) continue;

        // Same or related category
        const catMatch =
          target.category.toLowerCase() === other.category.toLowerCase() ||
          target.category.includes(other.category) ||
          other.category.includes(target.category);

        if (catMatch && target.latitude && target.longitude && other.latitude && other.longitude) {
          const dist = haversine(target.latitude, target.longitude, other.latitude, other.longitude);
          if (dist <= radiusKm) {
            group.push(other);
            visited.add(other.id);
          }
        }
      }

      if (group.length >= 2) {
        // Compute centroid
        const avgLat = group.reduce((sum, item) => sum + (item.latitude || 0), 0) / group.length;
        const avgLng = group.reduce((sum, item) => sum + (item.longitude || 0), 0) / group.length;

        const maxRisk = Math.max(...group.map((g) => g.riskScore || 50));
        const severity = maxRisk >= 80 ? "Critical" : maxRisk >= 60 ? "High" : "Moderate";

        // Generate synthetic root-cause hypothesis based on category
        const cat = target.category.toLowerCase();
        let suggestedRootCause = "Multiple correlated failure reports in close vicinity.";
        let actionRecommended = "Deploy technical inspection unit to investigate hub node.";

        if (cat.includes("water")) {
          suggestedRootCause = `Sub-surface trunk pipeline failure or high-capacity borewell feeder breakdown affecting ${group.length} locations.`;
          actionRecommended = "Isolate valve sector 4 and dispatch Jal Sansthan pump repair crew.";
        } else if (cat.includes("electr")) {
          suggestedRootCause = `11kV Distribution Transformer overload or feeder line insulator trip.`;
          actionRecommended = "Inspect sub-station transformer coil and dispatch Lineman crew with safety kit.";
        } else if (cat.includes("road") || cat.includes("infra")) {
          suggestedRootCause = `Severe monsoon culvert erosion or continuous asphalt subsidence corridor.`;
          actionRecommended = "Erect safety barricades and initiate emergency aggregate stone backfilling.";
        } else if (cat.includes("health") || cat.includes("sanitat")) {
          suggestedRootCause = `Localized water contamination / vector-borne outbreak alert (${group.length} health alerts).`;
          actionRecommended = "Dispatch mobile medical van with ORS/antidotes and commence chlorine bleaching.";
        }

        clusters.push({
          clusterId: `cluster_${target.category.toLowerCase().slice(0, 3)}_${Math.round(avgLat * 100)}_${Math.round(avgLng * 100)}`,
          title: `${group.length}x ${target.category} Outbreak Cluster (${target.village || target.district})`,
          category: target.category,
          district: target.district,
          centroidLat: Math.round(avgLat * 10000) / 10000,
          centroidLng: Math.round(avgLng * 10000) / 10000,
          incidentCount: group.length,
          severity,
          suggestedRootCause,
          actionRecommended,
          affectedEstimate: group.length * 280,
          incidents: group.map((g) => ({
            id: g.id,
            title: g.title,
            village: g.village,
            createdAt: g.createdAt,
            urgency: g.urgency,
          })),
        });
      } else {
        standalone.push(target);
      }
    }

    return NextResponse.json({
      success: true,
      totalActiveComplaints: complaints.length,
      clusteredCount: validComplaints.length - standalone.length,
      clusterCount: clusters.length,
      clusters,
      standaloneCount: standalone.length,
    });
  } catch (error: any) {
    console.error("Cluster detection error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze incident clusters." },
      { status: 500 }
    );
  }
}

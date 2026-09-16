import { VulnerabilityItem } from "@/lib/types";

/**
 * Population density weighting multipliers
 */
export function getPopulationDensityScore(density: string): number {
  switch (density.toLowerCase()) {
    case "dense urban":
      return 95;
    case "market hub":
      return 85;
    case "residential":
      return 65;
    case "rural hamlet":
    default:
      return 45;
  }
}

/**
 * Calculates dynamic Threat / Vulnerability Index with exponential time-to-decay
 *
 * Vulnerability Index = min(100,
 *   (Base Threat * 0.40) +
 *   (Population Density Factor * 0.35) +
 *   (Decay Multiplier^(Days Active / 15) * 0.25 * Base Threat)
 * )
 */
export function calculateVulnerabilityIndex(
  baseThreat: number,
  populationDensity: string,
  daysActive: number = 0,
  decayFactor: number = 1.25
): number {
  const popFactor = getPopulationDensityScore(populationDensity);

  // Time-to-decay exponential expansion: unattended structural hazards deteriorate faster over time
  const decayExponent = Math.min(daysActive / 15, 3.5); // cap exponential growth to avoid infinity
  const timeDecayTerm = Math.pow(decayFactor, decayExponent) * 20;

  const rawScore = baseThreat * 0.4 + popFactor * 0.35 + Math.min(timeDecayTerm, 40) * 0.25;

  return Math.min(100, Math.max(10, Math.round(rawScore * 10) / 10));
}

/**
 * Categorize composite score into standard risk tiers
 */
export function categorizeThreatLevel(score: number): "Critical" | "High" | "Moderate" | "Low" {
  if (score >= 85) return "Critical";
  if (score >= 70) return "High";
  if (score >= 50) return "Moderate";
  return "Low";
}

export interface DistrictThreatSummary {
  district: string;
  totalThreats: number;
  criticalCount: number;
  highCount: number;
  averageRiskIndex: number;
  highestRiskVulnerability: string;
}

/**
 * Aggregates vulnerabilities by district
 */
export function aggregateThreatsByDistrict(
  vulnerabilities: VulnerabilityItem[]
): DistrictThreatSummary[] {
  const map: Record<string, VulnerabilityItem[]> = {};

  for (const v of vulnerabilities) {
    const d = v.district || "Rampur";
    if (!map[d]) map[d] = [];
    map[d].push(v);
  }

  const summaries: DistrictThreatSummary[] = Object.keys(map).map((district) => {
    const list = map[district];
    const totalThreats = list.length;
    let criticalCount = 0;
    let highCount = 0;
    let totalRisk = 0;
    let highestRiskScore = -1;
    let highestTitle = "";

    for (const item of list) {
      const computed = item.computedRiskIndex || item.threatScore;
      totalRisk += computed;
      if (computed >= 85) criticalCount++;
      else if (computed >= 70) highCount++;

      if (computed > highestRiskScore) {
        highestRiskScore = computed;
        highestTitle = item.title;
      }
    }

    return {
      district,
      totalThreats,
      criticalCount,
      highCount,
      averageRiskIndex: totalThreats > 0 ? Math.round((totalRisk / totalThreats) * 10) / 10 : 0,
      highestRiskVulnerability: highestTitle,
    };
  });

  return summaries.sort((a, b) => b.averageRiskIndex - a.averageRiskIndex);
}

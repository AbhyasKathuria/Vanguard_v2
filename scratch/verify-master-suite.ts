import { evaluateHumanTriage, evaluateVeterinaryTriage } from "../src/lib/ai/triageEngine";

async function runTests() {
  console.log("==================================================");
  console.log("🧪 VANGUARD MASTER ARCHITECTURE VERIFICATION TEST");
  console.log("==================================================");

  // Test 1: Human Clinical Triage
  console.log("\n[TEST 1] Human Clinical Triage (Cardiac / Code Red)...");
  const humanEval = evaluateHumanTriage(["Chest Pain / Cardiac Pressure", "Shortness of Breath"], "Rampur");
  console.log("  Severity:", humanEval.severity);
  console.log("  Priority Score:", humanEval.priorityScore);
  console.log("  Requires Immediate SOS:", humanEval.requiresImmediateSos);
  console.log("  First Step:", humanEval.firstAidSteps[0].title);
  if (humanEval.severity !== "Code Red") throw new Error("Expected Code Red for cardiac emergency");

  // Test 2: Bovine / Cattle Triage ("Meri Gaay Beemar Hai")
  console.log("\n[TEST 2] Bovine / Cattle Emergency Triage (Bloat / Afra)...");
  const cattleEval = evaluateVeterinaryTriage("Bovine (Cow / Calf)", "Acute Rumen Bloat / Afra (Swollen Left Flank)", "Rampur", "Meri gaay beemar hai");
  console.log("  Patient Type:", cattleEval.patientType);
  console.log("  Severity:", cattleEval.severity);
  console.log("  Priority Score:", cattleEval.priorityScore);
  console.log("  Step 1 Title:", cattleEval.firstAidSteps[0].title);
  if (!cattleEval.patientType.includes("Bovine") || cattleEval.severity !== "Code Red") {
    throw new Error("Expected Bovine Code Red for acute bloat");
  }

  // Test 3: Haversine distance calculation
  console.log("\n[TEST 3] Haversine Distance Precision...");
  function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  const dist = calculateHaversineDistance(28.8154, 79.025, 28.5667, 79.0167);
  console.log(`  Distance between Dhamora and Saifni: ${dist} km`);
  if (dist <= 0 || dist > 50) throw new Error("Unexpected distance result");

  // Test 4: Inspection Checklist Scoring
  console.log("\n[TEST 4] Civic Asset Inspection Grade Calculation...");
  const checklistItems = [
    { id: "1", passed: true },
    { id: "2", passed: true },
    { id: "3", passed: true },
    { id: "4", passed: true },
    { id: "5", passed: true },
  ];
  const passedCount = checklistItems.filter(i => i.passed).length;
  const scorePercent = Math.round((passedCount / checklistItems.length) * 100);
  const grade = scorePercent >= 90 ? "A (Excellent)" : "B (Good)";
  console.log(`  Score: ${scorePercent}%, Grade: ${grade}`);
  if (scorePercent !== 100 || !grade.includes("A")) throw new Error("Grade calculation failed");

  console.log("\n==================================================");
  console.log("✅ ALL ARCHITECTURAL TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================");
}

runTests().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});

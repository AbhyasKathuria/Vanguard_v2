import { prisma } from "../src/lib/prisma";
import { determineRoutingAndAssignment, getCategoryDefaultPriority } from "../src/lib/routing";

async function runTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING RURAL SERVICE ROUTING E2E INTEGRATION TESTS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // TEST 1: Category -> Priority Mapping
  console.log("\n[Test Suite 1: Priority Mapping]");
  assert(getCategoryDefaultPriority("emergency") === "high", "Emergency maps to HIGH priority");
  assert(getCategoryDefaultPriority("health") === "high", "Health maps to HIGH priority");
  assert(getCategoryDefaultPriority("civic") === "medium", "Civic maps to MEDIUM priority");
  assert(getCategoryDefaultPriority("farming") === "low", "Farming maps to LOW priority");
  assert(getCategoryDefaultPriority("other") === "medium", "Other maps to MEDIUM priority");

  // TEST 2: Verified Worker Auto-Routing in Rampur
  console.log("\n[Test Suite 2: Verified Worker Auto-Routing]");
  const workerMatch = await determineRoutingAndAssignment("civic", "Rampur", "Broken wire near school");
  assert(workerMatch.status === "assigned", "Civic issue in Rampur is assigned");
  assert(workerMatch.assignedToId === "usr_worker_1", "Assigned to verified Sunil Electrician (usr_worker_1)");
  assert(workerMatch.auditMessage.includes("Sunil Electrician"), "Audit message contains worker name");

  // TEST 3: Verification Gate Test (Unverified candidates must NOT be matched)
  console.log("\n[Test Suite 3: Verification Gate Test - Unverified candidates ignored]");
  // Manoj Plumber is in Rampur, but verified: false.
  // Vikas Volunteer is in Sitapur, but verified: false.
  const unverifiedGateMatch = await determineRoutingAndAssignment("civic", "Sitapur", "Water leak in village hall");
  assert(
    unverifiedGateMatch.status === "open",
    "Routing engine skips unverified candidates (Vikas Volunteer) in Sitapur -> stays OPEN"
  );
  assert(unverifiedGateMatch.assignedToId === null, "AssignedTo is null when only unverified candidates exist");
  assert(
    unverifiedGateMatch.auditMessage.includes("Queued for Local Authority"),
    "Queued for Authority review when no verified candidates exist"
  );

  // TEST 4: Verification Toggle Effect (Verify Sitapur Volunteer -> auto-match succeeds)
  console.log("\n[Test Suite 4: Authority Verification Dynamic Effect]");
  // Authority verifies Vikas Volunteer
  await prisma.volunteerProfile.update({
    where: { userId: "usr_volunteer_2" },
    data: { verified: true },
  });

  const verifiedMatchAfterToggle = await determineRoutingAndAssignment("emergency", "Sitapur", "Urgent first aid");
  assert(
    verifiedMatchAfterToggle.status === "assigned",
    "After Authority verification, Sitapur request is now ASSIGNED"
  );
  assert(
    verifiedMatchAfterToggle.assignedToId === "usr_volunteer_2",
    "Assigned to newly verified volunteer Vikas (usr_volunteer_2)"
  );

  // Reset back to unverified for test consistency
  await prisma.volunteerProfile.update({
    where: { userId: "usr_volunteer_2" },
    data: { verified: false },
  });

  // TEST 5: Complete Request Lifecycle with Updates & Helper Profile Trust
  console.log("\n[Test Suite 5: Complete Request Lifecycle & Helper Profile Exposure]");
  const citizen = await prisma.user.findUnique({ where: { phone: "9876543210" } });
  const worker = await prisma.user.findUnique({
    where: { phone: "9876543211" },
    include: { workerProfile: true },
  });

  if (!citizen || !worker) {
    console.error("Seed users not found!");
    process.exit(1);
  }

  // Create
  const testReq = await prisma.request.create({
    data: {
      userId: citizen.id,
      category: "civic",
      description: "Transformer sparking on pole 14",
      priority: "medium",
      location: "Rampur",
      status: workerMatch.status,
      assignedToId: workerMatch.assignedToId,
      updates: {
        create: [
          {
            userId: citizen.id,
            message: "Request raised by citizen.",
            status: "open",
          },
          {
            userId: worker.id,
            message: workerMatch.auditMessage,
            status: "assigned",
          },
        ],
      },
    },
    include: {
      assignedTo: {
        include: { workerProfile: true, volunteerProfile: true },
      },
      updates: true,
    },
  });

  assert(testReq.status === "assigned", "New request created as ASSIGNED");
  assert(testReq.assignedTo?.name === "Sunil Electrician", "Helper name is exposed as 'Sunil Electrician'");
  assert(testReq.assignedTo?.role === "worker", "Helper role is exposed as 'worker'");
  assert(
    testReq.assignedTo?.workerProfile?.profession === "Electrician",
    "Helper profession is exposed as 'Electrician'"
  );
  assert(testReq.assignedTo?.phone === "9876543211", "Helper contact is exposed");

  // Update to In Progress
  const inProgReq = await prisma.request.update({
    where: { id: testReq.id },
    data: {
      status: "in_progress",
      updates: {
        create: {
          userId: worker.id,
          status: "in_progress",
          message: "Worker arrived at site with toolset.",
        },
      },
    },
    include: { updates: true },
  });
  assert(inProgReq.status === "in_progress", "Status updated to IN_PROGRESS");

  // Update to Resolved
  const resReq = await prisma.request.update({
    where: { id: testReq.id },
    data: {
      status: "resolved",
      updates: {
        create: {
          userId: worker.id,
          status: "resolved",
          message: "Wiring replaced and tested. Safe.",
        },
      },
    },
    include: { updates: { orderBy: { timestamp: "asc" } } },
  });
  assert(resReq.status === "resolved", "Status updated to RESOLVED");
  assert(resReq.updates.length === 4, "4 chronological audit updates recorded");

  // Clean up test request
  await prisma.requestUpdate.deleteMany({ where: { requestId: testReq.id } });
  await prisma.request.delete({ where: { id: testReq.id } });

  // TEST 6: Geolocation & Nearest-Candidate Radius Matching
  console.log("\n[Test Suite 6: Geolocation & Nearest-Candidate Radius Matching]");
  // Test Mandya farming request matches verified Mandya worker Devraj Mason
  const mandyaMatch = await determineRoutingAndAssignment(
    "farming",
    "Mandya",
    "Irrigation canal breach near sugarcane field"
  );
  assert(mandyaMatch.status === "assigned", "Farming request in Mandya is ASSIGNED via geo matching");
  assert(mandyaMatch.assignedToId === "usr_worker_3", "Assigned to verified Mandya worker Devraj Mason (usr_worker_3)");
  assert(
    mandyaMatch.auditMessage.includes("Devraj Mason") && mandyaMatch.auditMessage.includes("km away"),
    "Audit message includes distance calculation (km away)"
  );

  // Test Emergency in Shivamogga matches verified Shivamogga volunteer Sowmya Red Cross
  const shivamoggaMatch = await determineRoutingAndAssignment(
    "emergency",
    "Shivamogga",
    "Urgent first aid assistance"
  );
  assert(shivamoggaMatch.status === "assigned", "Emergency in Shivamogga is ASSIGNED to verified volunteer");
  assert(shivamoggaMatch.assignedToId === "usr_volunteer_4", "Assigned to Sowmya Red Cross (usr_volunteer_4)");

  // TEST 7: Out-of-Radius Fallback Test
  console.log("\n[Test Suite 7: Out-of-Radius Candidate Gating]");
  // Belagavi has no verified workers/volunteers seeded in our dataset
  const outOfRadiusMatch = await determineRoutingAndAssignment(
    "civic",
    "Belagavi",
    "Streetlight broken in remote ward"
  );
  assert(
    outOfRadiusMatch.status === "open",
    "Request in area with no verified candidate in radius (Belagavi) stays OPEN"
  );
  assert(outOfRadiusMatch.assignedToId === null, "AssignedTo is null for out-of-radius request");

  // TEST 8: Super Admin System Role & Cross-District Query
  console.log("\n[Test Suite 8: Super Admin Privileges & Multi-District Scope]");
  const superAdmin = await prisma.user.findUnique({
    where: { phone: "9876543200" },
  });
  assert(superAdmin !== null, "Super Admin user exists in database");
  assert(superAdmin?.role === "super_admin", "Super Admin has 'super_admin' role");

  const totalRequestsAcrossDistricts = await prisma.request.count();
  assert(totalRequestsAcrossDistricts >= 6, "Super Admin can query aggregate requests across all districts");

  // TEST 9: External API Integrations with Graceful Degradation
  console.log("\n[Test Suite 9: External API Integrations & Zero-Key Fallbacks]");
  const { fetchLocationWeather } = await import("../src/lib/integrations/weather");
  const { sendVerificationOtp, verifyOtp } = await import("../src/lib/integrations/otp");
  const { checkAllIntegrationsHealth } = await import("../src/lib/integrations/health");

  // 1. Weather
  const weather = await fetchLocationWeather(28.8154, 79.025);
  assert(typeof weather.temperatureC === "number", "Weather returns valid temperature");
  assert(typeof weather.condition === "string", "Weather returns condition description");
  assert(typeof weather.advisory === "string", "Weather returns agronomic/rural advisory");

  // 2. OTP
  const otpRes = await sendVerificationOtp("9876543210");
  assert(otpRes.success === true, "OTP service generates code successfully");
  assert(verifyOtp("9876543210", otpRes.debugOtp || "123456") === true, "OTP verification succeeds with generated code");
  assert(verifyOtp("9876543210", "999999") === false, "OTP verification rejects invalid code");

  // 3. Health check
  const healthList = checkAllIntegrationsHealth();
  assert(healthList.length === 6, "Health check covers all 6 platform integrations");
  assert(healthList.every((s) => s.isZeroKeyWorking), "All 6 integrations function zero-config without keys");

  // TEST 10: WhatsApp Webhook Bot Flow
  console.log("\n[Test Suite 10: WhatsApp Bot Webhook Flow]");
  const { POST: handleWhatsAppPost } = await import("../src/app/api/webhook/whatsapp/route");

  // 1. Step 1: Start HI
  const reqHi = new Request("http://localhost:3000/api/webhook/whatsapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: "919876543999", text: "HI" }),
  });
  const resHi = await (await handleWhatsAppPost(reqHi as any)).json();
  assert(resHi.reply.includes("VANGUARD"), "WhatsApp bot replies to HI with category menu");

  // 2. Step 2: Category '1' (Civic)
  const reqCat = new Request("http://localhost:3000/api/webhook/whatsapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: "919876543999", text: "1" }),
  });
  const resCat = await (await handleWhatsAppPost(reqCat as any)).json();
  assert(resCat.reply.includes("CIVIC"), "WhatsApp bot confirms category selection");

  // 3. Step 3: Description
  const reqDesc = new Request("http://localhost:3000/api/webhook/whatsapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: "919876543999", text: "Main drainage channel blocked near village square" }),
  });
  const resDesc = await (await handleWhatsAppPost(reqDesc as any)).json();
  assert(resDesc.reply.includes("Village"), "WhatsApp bot prompts for location");

  // 4. Step 4: Location 'Rampur' -> creates real Request
  const reqLoc = new Request("http://localhost:3000/api/webhook/whatsapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: "919876543999", text: "Rampur" }),
  });
  const resLoc = await (await handleWhatsAppPost(reqLoc as any)).json();
  assert(resLoc.success === true, "WhatsApp bot created service request successfully");
  assert(resLoc.requestId !== undefined, "WhatsApp bot returns real Request ID");

  // Verify created request in DB
  const waCreatedReq = await prisma.request.findUnique({
    where: { id: resLoc.requestId },
    include: { updates: true },
  });
  assert(waCreatedReq !== null, "WhatsApp created request exists in SQLite database");
  assert(waCreatedReq?.status === "assigned", "WhatsApp request was auto-routed to verified worker in Rampur");

  // 5. Worker update command via WhatsApp ("DONE <id>")
  const reqDone = new Request("http://localhost:3000/api/webhook/whatsapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: "919876543211", text: `DONE ${resLoc.requestId} Cleared drainage completely` }),
  });
  const resDone = await (await handleWhatsAppPost(reqDone as any)).json();
  assert(resDone.reply.includes("RESOLVED"), "Worker WhatsApp command marks request RESOLVED");

  // Clean up test request
  if (resLoc.requestId) {
    await prisma.requestUpdate.deleteMany({ where: { requestId: resLoc.requestId } });
    await prisma.request.delete({ where: { id: resLoc.requestId } });
  }

  // TEST 11: Multi-Language i18n Verification
  console.log("\n[Test Suite 11: Multi-Language i18n Support]");
  const { en } = await import("../src/lib/i18n/dictionaries/en");
  const { hi } = await import("../src/lib/i18n/dictionaries/hi");
  const { kn } = await import("../src/lib/i18n/dictionaries/kn");

  assert(en.common.appName === "VANGUARD", "English dictionary loaded with standard branding");
  assert(hi.common.appName.includes("वांगार्ड"), "Hindi dictionary loaded with Hindi branding");
  assert(kn.common.appName.includes("ವ್ಯಾನ್‌ಗಾರ್ಡ್"), "Kannada dictionary loaded with Kannada branding");
  assert(Object.keys(en.common.categories).length === 10, "All category titles & descriptions defined in English");
  assert(Object.keys(hi.common.categories).length === 10, "All category titles & descriptions defined in Hindi");
  assert(Object.keys(kn.common.categories).length === 10, "All category titles & descriptions defined in Kannada");

  // TEST 12: Universal Multi-Language Dictionaries & Dynamic Gateway
  console.log("\n[Test Suite 12: Universal Multi-Language (Indian & Global Languages)]");
  const { ta } = await import("../src/lib/i18n/dictionaries/ta");
  const { te } = await import("../src/lib/i18n/dictionaries/te");
  const { bn } = await import("../src/lib/i18n/dictionaries/bn");
  const { mr } = await import("../src/lib/i18n/dictionaries/mr");
  const { gu } = await import("../src/lib/i18n/dictionaries/gu");
  const { ml } = await import("../src/lib/i18n/dictionaries/ml");
  const { pa } = await import("../src/lib/i18n/dictionaries/pa");
  const { es } = await import("../src/lib/i18n/dictionaries/es");
  const { fr } = await import("../src/lib/i18n/dictionaries/fr");
  const { ar } = await import("../src/lib/i18n/dictionaries/ar");
  const { de } = await import("../src/lib/i18n/dictionaries/de");
  const { SUPPORTED_LANGUAGES } = await import("../src/lib/i18n/languages");
  const { detectLanguageFromGreeting, translateText } = await import("../src/lib/integrations/translator");

  // 1. Dictionaries assertions
  assert(SUPPORTED_LANGUAGES.length >= 22, "Universal registry contains 22+ languages");
  assert(ta.common.appName.includes("வான்கார்ட்"), "Tamil dictionary loaded");
  assert(te.common.appName.includes("వాన్‌గార్డ్"), "Telugu dictionary loaded");
  assert(bn.common.appName.includes("ভ্যানগার্ড"), "Bengali dictionary loaded");
  assert(mr.common.appName.includes("व्हॅनगार्ड"), "Marathi dictionary loaded");
  assert(gu.common.appName.includes("વાનગાર્ડ"), "Gujarati dictionary loaded");
  assert(ml.common.appName.includes("വാൻഗാർഡ്"), "Malayalam dictionary loaded");
  assert(pa.common.appName.includes("ਵੈਨਗਾਰਡ"), "Punjabi dictionary loaded");
  assert(es.common.categories.civic.includes("Cívicos"), "Spanish dictionary loaded");
  assert(fr.common.categories.health.includes("Santé"), "French dictionary loaded");
  assert(ar.common.categories.emergency.includes("الطوارئ"), "Arabic dictionary loaded");
  assert(de.common.categories.farming.includes("Landwirtschaft"), "German dictionary loaded");

  // 2. Language greeting detection assertions
  assert(detectLanguageFromGreeting("வணக்கம்") === "ta", "Detects Tamil greeting (வணக்கம்)");
  assert(detectLanguageFromGreeting("ನಮಸ್ಕಾರ") === "kn", "Detects Kannada greeting (ನಮಸ್ಕಾರ)");
  assert(detectLanguageFromGreeting("नमस्ते") === "hi", "Detects Hindi greeting (नमस्ते)");
  assert(detectLanguageFromGreeting("Hola") === "es", "Detects Spanish greeting (Hola)");
  assert(detectLanguageFromGreeting("Bonjour") === "fr", "Detects French greeting (Bonjour)");

  // 3. Multi-lingual WhatsApp bot greeting test
  const reqTamilHi = new Request("http://localhost:3000/api/webhook/whatsapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: "919876543888", text: "வணக்கம்" }),
  });
  const resTamilHi = await (await handleWhatsAppPost(reqTamilHi as any)).json();
  assert(resTamilHi.reply.includes("வான்கார்ட்"), "WhatsApp bot replies in Tamil to Tamil greeting");

  const reqSpanishHi = new Request("http://localhost:3000/api/webhook/whatsapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from: "919876543777", text: "Hola" }),
  });
  const resSpanishHi = await (await handleWhatsAppPost(reqSpanishHi as any)).json();
  assert(resSpanishHi.reply.includes("Bienvenido"), "WhatsApp bot replies in Spanish to Spanish greeting");

  // 4. Dynamic translation gateway assertion
  const transRes = await translateText({ text: "broken wire", targetLang: "hi" });
  assert(transRes.translatedText.includes("तार"), "Dynamic translation gateway translates terms accurately");

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


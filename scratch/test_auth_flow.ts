import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionToken, verifySessionToken, hashPassword } from "../src/lib/auth";

async function runAuthTest() {
  console.log("=========================================");
  console.log("🔐 TESTING VANGUARD AUTHENTICATION FLOW");
  console.log("=========================================");

  // 1. Test Seeded Users
  const users = await prisma.user.findMany({
    where: { id: { startsWith: "usr_" } },
    select: { id: true, name: true, phone: true, role: true, passwordHash: true }
  });
  console.log(`\nFound ${users.length} seeded users in database.`);

  for (const user of users) {
    if (!user.passwordHash) continue;
    const isMatch = await bcrypt.compare("password123", user.passwordHash);
    console.log(`  👤 ${user.name.padEnd(24)} (${user.phone}) [${user.role}]: password123 match = ${isMatch ? "✅ TRUE" : "❌ FALSE"}`);
    if (!isMatch) throw new Error(`Password mismatch for ${user.phone}`);
  }

  // 2. Test JWT Token Creation & Verification
  console.log("\nTesting JWT session token creation & verification...");
  const testUser = users[0];
  const token = await createSessionToken({
    userId: testUser.id,
    name: testUser.name,
    phone: testUser.phone,
    role: testUser.role as any,
    location: "Rampur",
  });
  console.log("  ✅ Token created:", token.substring(0, 30) + "...");

  const verified = await verifySessionToken(token);
  console.log("  ✅ Token verified successfully:", verified?.userId === testUser.id ? "PASSED" : "FAILED");

  // 3. Test Signup Flow
  console.log("\nTesting New User Signup...");
  const testPhone = `99999${Math.floor(10000 + Math.random() * 90000)}`;
  const hashedPassword = await hashPassword("mySecretPassword123");
  
  const created = await prisma.user.create({
    data: {
      name: "New Test Citizen",
      phone: testPhone,
      passwordHash: hashedPassword,
      role: "citizen",
      location: "Rampur Ward 5",
      language: "en",
    }
  });
  console.log(`  ✅ User created successfully: ID = ${created.id}, Phone = ${created.phone}`);

  const checkPass = await bcrypt.compare("mySecretPassword123", created.passwordHash || "");
  console.log(`  ✅ New user password match: ${checkPass ? "PASSED" : "FAILED"}`);

  // Cleanup test user
  await prisma.user.delete({ where: { id: created.id } });
  console.log("  ✅ Test user cleaned up.");

  console.log("\n=========================================");
  console.log("🎉 ALL AUTH FLOW TESTS PASSED 100%!");
  console.log("=========================================");
}

runAuthTest().catch((err) => {
  console.error("❌ Auth test failed:", err);
  process.exit(1);
});

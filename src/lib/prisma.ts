import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Initialize SQLite database location for serverless environments (e.g., Vercel)
function resolveDatabaseUrl(): string {
  // Only use /tmp on actual serverless environments like Vercel or AWS Lambda
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    const tmpDir = "/tmp";
    const tmpDb = path.join(tmpDir, "dev.db");

    if (!fs.existsSync(tmpDb)) {
      try {
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }

        const searchPaths = [
          path.join(process.cwd(), "prisma", "dev.db"),
          path.join(process.cwd(), "dev.db"),
          path.resolve("./prisma/dev.db"),
          path.resolve("./dev.db"),
          path.join(__dirname, "dev.db"),
          path.join(__dirname, "..", "dev.db"),
          path.join(__dirname, "..", "prisma", "dev.db"),
        ];

        for (const p of searchPaths) {
          if (fs.existsSync(p)) {
            try {
              fs.copyFileSync(p, tmpDb);
              console.log(`[Prisma] Successfully initialized /tmp/dev.db from ${p}`);
              break;
            } catch (copyErr) {
              console.warn(`[Prisma] Failed to copy from ${p}:`, copyErr);
            }
          }
        }
      } catch (err) {
        console.warn("[Prisma] Serverless /tmp initialization warning:", err);
      }
    }

    if (fs.existsSync(tmpDb)) {
      return `file:${tmpDb}`;
    }
  }

  // Local development or local build
  return process.env.DATABASE_URL && process.env.DATABASE_URL.trim()
    ? process.env.DATABASE_URL
    : "file:./dev.db";
}

process.env.DATABASE_URL = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolveDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

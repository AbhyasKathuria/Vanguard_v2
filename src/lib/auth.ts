import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { JWTPayload, UserRole, UserSession } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "vanguard_rural_routing_secret_key_2026_super_secure";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = "vanguard_auth_token";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(payload: JWTPayload) {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return token;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.userId) return null;

    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          workerProfile: true,
          volunteerProfile: true,
        },
      });

      // If user was created on a different serverless lambda instance, sync to this instance's SQLite DB
      if (!user && payload.phone) {
        user = await prisma.user.upsert({
          where: { phone: payload.phone },
          update: {},
          create: {
            id: payload.userId,
            name: payload.name || "Citizen",
            phone: payload.phone,
            passwordHash: "$2a$10$wE99N502/KszZ1aWbA4lFuhQe56N63f35JmX99b8/qK2f2qY8fCwe",
            role: payload.role || "citizen",
            location: payload.location || "Rampur",
            district: payload.district || "Rampur",
            language: "en",
          },
          include: {
            workerProfile: true,
            volunteerProfile: true,
          },
        });
      }
    } catch (dbErr) {
      console.warn("[Auth] DB lookup error in getCurrentUser, falling back to verified JWT payload:", dbErr);
    }

    if (user) {
      return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role as UserRole,
        language: user.language || "en",
        location: user.location || "Rampur",
        district: user.district || "Rampur",
        active: user.active ?? true,
        workerProfile: user.workerProfile,
        volunteerProfile: user.volunteerProfile,
      };
    }

    // Fallback directly from cryptographically verified JWT payload
    return {
      id: payload.userId,
      name: payload.name || "User",
      phone: payload.phone || "",
      role: (payload.role as UserRole) || "citizen",
      language: "en",
      location: payload.location || "Rampur",
      district: payload.district || "Rampur",
      active: true,
      workerProfile: null,
      volunteerProfile: null,
    };
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE" || error?.message?.includes("Dynamic server usage")) {
      return null;
    }
    console.error("Error retrieving current session user:", error);
    return null;
  }
}

import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { JWTPayload } from "./lib/types";

const JWT_SECRET = process.env.JWT_SECRET || "vanguard_rural_routing_secret_key_2026_super_secure";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = "vanguard_auth_token";

export function getRoleDashboard(session: JWTPayload): string {
  if (session.role === "citizen") {
    if (session.citizenProfile === "farmer") return "/farmer";
    if (session.citizenProfile === "women") return "/citizen/women";
    return "/citizen/dashboard";
  }
  if (session.role === "worker") return "/worker/dashboard";
  if (session.role === "volunteer") return "/volunteer/dashboard";
  if (session.role === "authority" || session.role === "higher_authority") return "/authority/dashboard";
  if (session.role === "super_admin" || session.role === "admin") return "/superadmin/dashboard";
  return "/citizen/dashboard";
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Fast-bail: never intercept Next.js internal static assets or files
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/static") ||
      pathname.startsWith("/favicon") ||
      pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;

    let session: JWTPayload | null = null;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        if (payload && payload.userId && payload.role) {
          session = payload as unknown as JWTPayload;
        }
      } catch {
        session = null;
      }
    }

    const isPublicRoute =
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname.startsWith("/auth/");

    // If unauthenticated and trying to access any protected route, redirect to /login
    if (!session && !isPublicRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If authenticated and visiting landing / auth screens, redirect to their role dashboard
    if (session && (pathname === "/" || pathname === "/login" || pathname === "/signup" || pathname.startsWith("/auth/"))) {
      const target = getRoleDashboard(session);
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Dynamic central /dashboard route
    if (pathname === "/dashboard") {
      if (!session) {
        return NextResponse.redirect(new URL("/login?from=/dashboard", request.url));
      }
      const target = getRoleDashboard(session);
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Direct dashboard alias rewrites
    if (pathname === "/dashboard/citizen") {
      if (!session) return NextResponse.redirect(new URL("/login?from=/dashboard/citizen", request.url));
      return NextResponse.rewrite(new URL("/citizen/dashboard", request.url));
    }
    if (pathname === "/dashboard/volunteer") {
      if (!session) return NextResponse.redirect(new URL("/login?from=/dashboard/volunteer", request.url));
      return NextResponse.rewrite(new URL("/volunteer/dashboard", request.url));
    }
    if (pathname === "/dashboard/authority") {
      if (!session) return NextResponse.redirect(new URL("/login?from=/dashboard/authority", request.url));
      return NextResponse.rewrite(new URL("/authority/dashboard", request.url));
    }

    // Role-specific enforcement for protected sub-routes
    if (session) {
      const isCitizenRoute = pathname.startsWith("/citizen");
      const isWorkerRoute = pathname.startsWith("/worker");
      const isVolunteerRoute = pathname.startsWith("/volunteer");
      const isAuthorityRoute = pathname.startsWith("/authority");
      const isSuperAdminRoute = pathname.startsWith("/superadmin");

      // UNIVERSAL ACCESS EXCEPTION:
      // Allow all authenticated roles to view incident details, audit timeline, and dispatch map on /citizen/request/*
      if (pathname.startsWith("/citizen/request/")) {
        return NextResponse.next();
      }

      const userDashboard = getRoleDashboard(session);
      const isHigherAuth =
        session.role === "authority" ||
        session.role === "higher_authority" ||
        session.role === "super_admin" ||
        session.role === "admin";
      const isAdmin = session.role === "super_admin" || session.role === "admin";

      if (isCitizenRoute && session.role !== "citizen") {
        return NextResponse.redirect(new URL(userDashboard, request.url));
      }
      if (isWorkerRoute && session.role !== "worker") {
        return NextResponse.redirect(new URL(userDashboard, request.url));
      }
      if (isVolunteerRoute && session.role !== "volunteer") {
        return NextResponse.redirect(new URL(userDashboard, request.url));
      }
      if (isAuthorityRoute && !isHigherAuth) {
        return NextResponse.redirect(new URL(userDashboard, request.url));
      }
      if (isSuperAdminRoute && !isAdmin) {
        return NextResponse.redirect(new URL(userDashboard, request.url));
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware error:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons, logos (.png, .jpg, .jpeg, .svg, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

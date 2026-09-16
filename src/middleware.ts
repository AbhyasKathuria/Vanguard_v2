import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { JWTPayload, UserRole } from "./lib/types";

const JWT_SECRET = process.env.JWT_SECRET || "vanguard_rural_routing_secret_key_2026_super_secure";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = "vanguard_auth_token";

const roleDashboardMap: Record<string, string> = {
  super_admin: "/superadmin/dashboard",
  admin: "/superadmin/dashboard",
  citizen: "/citizen/dashboard",
  worker: "/worker/dashboard",
  volunteer: "/volunteer/dashboard",
  authority: "/authority/dashboard",
  higher_authority: "/authority/dashboard",
};

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

    // Direct dashboard aliases support: /dashboard/citizen, /dashboard/volunteer, /dashboard/authority
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

    // If user is already logged in and visits /login or /signup, redirect to their role dashboard
    if (session && (pathname === "/login" || pathname === "/signup" || pathname.startsWith("/auth/"))) {
      const target = roleDashboardMap[session.role] || "/citizen/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Protected route prefixes
    const isCitizenRoute = pathname.startsWith("/citizen");
    const isWorkerRoute = pathname.startsWith("/worker");
    const isVolunteerRoute = pathname.startsWith("/volunteer");
    const isAuthorityRoute = pathname.startsWith("/authority");
    const isSuperAdminRoute = pathname.startsWith("/superadmin");

    const isProtected =
      isCitizenRoute ||
      isWorkerRoute ||
      isVolunteerRoute ||
      isAuthorityRoute ||
      isSuperAdminRoute;

    if (isProtected) {
      if (!session) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // UNIVERSAL ACCESS EXCEPTION:
      // Allow all authenticated roles (citizen, volunteer, worker, authority, super_admin)
      // to view the incident details, audit timeline, and dispatch map on /citizen/request/*
      if (pathname.startsWith("/citizen/request/")) {
        return NextResponse.next();
      }

      // Role-specific enforcement
      const userDashboard = roleDashboardMap[session.role] || "/login";
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
    "/",
    "/login",
    "/signup",
    "/auth/:path*",
    "/dashboard/:path*",
    "/citizen/:path*",
    "/worker/:path*",
    "/volunteer/:path*",
    "/authority/:path*",
    "/superadmin/:path*",
  ],
};

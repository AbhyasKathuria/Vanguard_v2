import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { determineRoutingAndAssignment, getCategoryDefaultPriority } from "@/lib/routing";
import { RequestCategory } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const categoryFilter = searchParams.get("category");
    const tabFilter = searchParams.get("tab"); // "assigned" | "unassigned" for volunteers

    let whereClause: any = {};

    if (user.role === "citizen") {
      whereClause.userId = user.id;
    } else if (user.role === "worker") {
      whereClause.assignedToId = user.id;
    } else if (user.role === "volunteer") {
      if (tabFilter === "unassigned") {
        whereClause.status = "open";
        whereClause.assignedToId = null;
      } else if (tabFilter === "assigned") {
        whereClause.assignedToId = user.id;
      } else {
        // Return both assigned and open pool
        whereClause.OR = [
          { assignedToId: user.id },
          { status: "open", assignedToId: null },
        ];
      }
    } else if (user.role === "authority" || user.role === "super_admin") {
      // Authority / Super Admin can view all requests with optional filters
      const districtFilter = searchParams.get("district");
      if (districtFilter && districtFilter !== "all") {
        whereClause.district = districtFilter;
      } else if (user.role === "authority" && user.district && user.district !== "All Districts") {
        whereClause.district = user.district;
      }

      if (statusFilter && statusFilter !== "all") {
        whereClause.status = statusFilter;
      }
      if (categoryFilter && categoryFilter !== "all") {
        whereClause.category = categoryFilter;
      }
    }

    const requests = await prisma.request.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, phone: true, location: true, district: true },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            workerProfile: true,
            volunteerProfile: true,
          },
        },
        updates: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error("Fetch requests error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Citizens and Volunteers (on behalf of citizens) can raise requests
    if (user.role !== "citizen" && user.role !== "volunteer") {
      return NextResponse.json(
        { error: "Only citizens and volunteers can submit service requests." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { category, description, location, district, latitude, longitude, attachmentUrl } = body;

    if (!category || !description || !location) {
      return NextResponse.json(
        { error: "Category, description, and location are required." },
        { status: 400 }
      );
    }

    const validCategories: RequestCategory[] = ["health", "civic", "emergency", "farming", "other"];
    if (!validCategories.includes(category as RequestCategory)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    const priority = getCategoryDefaultPriority(category as RequestCategory);

    const providedCoords =
      latitude !== undefined && longitude !== undefined
        ? { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
        : null;

    // Run Rule-Based Routing Engine with Geolocation support
    const routingResult = await determineRoutingAndAssignment(
      category as RequestCategory,
      location,
      description,
      providedCoords
    );

    const finalDistrict = district || user.district || "Rampur";
    const finalLat = routingResult.coordinates?.latitude || providedCoords?.latitude || null;
    const finalLon = routingResult.coordinates?.longitude || providedCoords?.longitude || null;

    // Ensure user exists in current lambda's SQLite database for foreign key relation
    try {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          name: user.name,
          phone: user.phone || `98765${Math.floor(10000 + Math.random() * 90000)}`,
          passwordHash: "$2a$10$wE99N502/KszZ1aWbA4lFuhQe56N63f35JmX99b8/qK2f2qY8fCwe",
          role: user.role,
          location: user.location || "Rampur",
          district: finalDistrict,
          language: user.language || "en",
        },
      });
    } catch (upsertErr) {
      console.warn("[Requests] User upsert notice:", upsertErr);
    }

    // Create the Request and its initial audit trail update atomically
    const newRequest = await prisma.request.create({
      data: {
        userId: user.id,
        category,
        description,
        priority,
        location,
        district: finalDistrict,
        latitude: finalLat,
        longitude: finalLon,
        attachmentUrl: attachmentUrl || null,
        status: routingResult.status,
        assignedToId: routingResult.assignedToId,
        updates: {
          create: [
            {
              userId: user.id,
              message: `Request created by ${user.name} (${user.role}). Priority assigned as ${priority.toUpperCase()}.`,
              status: "open",
            },
            ...(routingResult.status === "assigned"
              ? [
                  {
                    userId: routingResult.assignedToId!,
                    message: routingResult.auditMessage,
                    status: "assigned",
                  },
                ]
              : [
                  {
                    userId: user.id,
                    message: routingResult.auditMessage,
                    status: "open",
                  },
                ]),
          ],
        },
      },
      include: {
        user: true,
        assignedTo: true,
        updates: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      request: newRequest,
      routing: routingResult,
    });
  } catch (error: any) {
    console.error("Create request error:", error);
    return NextResponse.json({ error: error.message || "Failed to create request" }, { status: 500 });
  }
}

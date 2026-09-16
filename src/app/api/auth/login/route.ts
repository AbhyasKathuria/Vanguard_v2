import { comparePassword, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/types";
import { NextResponse } from "next/server";

// Fallback seed definitions for 1-click demo logins on serverless instances
const SEEDED_DEMO_USERS: Record<string, { id: string; name: string; role: UserRole; location: string; district: string }> = {
  "9876543200": { id: "usr_superadmin_1", name: "Officer Rajeshwar Rao", role: "super_admin", location: "State Command HQ", district: "All Districts" },
  "9876543210": { id: "usr_citizen_1", name: "Ramesh Sharma", role: "citizen", location: "Rampur Ward 4", district: "Rampur" },
  "9876543220": { id: "usr_citizen_2", name: "Anandi Patel", role: "citizen", location: "Sitapur Block B", district: "Sitapur" },
  "9876543230": { id: "usr_citizen_3", name: "Basavaraj Gowda", role: "citizen", location: "Mandya Sugarcane Belt", district: "Mandya" },
  "9876543240": { id: "usr_citizen_4", name: "Kavitha Hegde", role: "citizen", location: "Shivamogga Hill Sector", district: "Shivamogga" },
  "9876543211": { id: "usr_worker_1", name: "Sunil Electrician", role: "worker", location: "Rampur Main", district: "Rampur" },
  "9876543214": { id: "usr_worker_2", name: "Manoj Plumber (Pending Verification)", role: "worker", location: "Rampur East", district: "Rampur" },
  "9876543216": { id: "usr_worker_3", name: "Devraj Mason", role: "worker", location: "Mandya City", district: "Mandya" },
  "9876543217": { id: "usr_worker_4", name: "Manjunath Solar", role: "worker", location: "Mandya Rural", district: "Mandya" },
  "9876543219": { id: "usr_worker_5", name: "Ashok Carpenter (Unverified)", role: "worker", location: "Shivamogga", district: "Shivamogga" },
  "9876543212": { id: "usr_volunteer_1", name: "Pooja Volunteer", role: "volunteer", location: "Rampur Ward 2", district: "Rampur" },
  "9876543215": { id: "usr_volunteer_2", name: "Vikas Volunteer (Pending Verification)", role: "volunteer", location: "Sitapur North", district: "Sitapur" },
  "9876543222": { id: "usr_volunteer_3", name: "Chethan Gram Seva", role: "volunteer", location: "Mandya Central", district: "Mandya" },
  "9876543223": { id: "usr_volunteer_4", name: "Sowmya Red Cross", role: "volunteer", location: "Shivamogga Medical Center", district: "Shivamogga" },
  "9876543213": { id: "usr_authority_1", name: "Officer Suresh Verma", role: "authority", location: "Rampur Panchayat Bhavan", district: "Rampur" },
  "9876543224": { id: "usr_authority_2", name: "Officer Mallikarjun Patil", role: "authority", location: "Mandya Taluk Office", district: "Mandya" },
  "9876543225": { id: "usr_authority_3", name: "Officer Deepa Rao", role: "authority", location: "Shivamogga District Office", district: "Shivamogga" },
  "9876543201": { id: "usr_higherauth_1", name: "District Commissioner Sharma", role: "higher_authority", location: "Divisional Commissionerate", district: "Rampur" },
  "9876543202": { id: "usr_admin_1", name: "State System Admin", role: "admin", location: "State Secretariat Command HQ", district: "All Districts" },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json({ error: "Phone number and password are required." }, { status: 400 });
    }

    const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, "").slice(-10);

    let user: any = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: cleanPhone },
            { phone: phone.trim() },
            { phone: { contains: cleanPhone } },
          ],
        },
        include: {
          workerProfile: true,
          volunteerProfile: true,
        },
      });
    } catch (dbErr) {
      console.warn("[Login] DB lookup error:", dbErr);
    }

    // If user not in DB but matches a known demo account and password is password123
    if (!user && SEEDED_DEMO_USERS[cleanPhone] && password.trim() === "password123") {
      const demo = SEEDED_DEMO_USERS[cleanPhone];
      try {
        user = await prisma.user.upsert({
          where: { phone: cleanPhone },
          update: {},
          create: {
            id: demo.id,
            name: demo.name,
            phone: cleanPhone,
            passwordHash: "$2a$10$wE99N502/KszZ1aWbA4lFuhQe56N63f35JmX99b8/qK2f2qY8fCwe",
            role: demo.role,
            location: demo.location,
            district: demo.district,
            language: "en",
            active: true,
            ...(demo.role === "worker" && {
              workerProfile: {
                create: {
                  profession: "Skilled Trade",
                  location: demo.location,
                  availability: true,
                  verified: !demo.name.includes("Unverified") && !demo.name.includes("Pending"),
                },
              },
            }),
            ...(demo.role === "volunteer" && {
              volunteerProfile: {
                create: {
                  organization: "Community Network",
                  area: demo.location,
                  availability: true,
                  verified: !demo.name.includes("Unverified") && !demo.name.includes("Pending"),
                },
              },
            }),
          },
          include: {
            workerProfile: true,
            volunteerProfile: true,
          },
        });
      } catch (upsertErr) {
        console.warn("[Login] Demo upsert notice:", upsertErr);
        user = {
          id: demo.id,
          name: demo.name,
          phone: cleanPhone,
          role: demo.role,
          location: demo.location,
          district: demo.district,
        };
      }
    }

    if (!user) {
      return NextResponse.json(
        {
          error: `No account found with phone number ${cleanPhone}. Please click "Sign Up" to create an account, or use one of the 1-Click Demo Accounts below.`,
          notFound: true,
          phone: cleanPhone,
        },
        { status: 401 }
      );
    }

    // If password is password123 or matches the hash
    let isMatch = false;
    if (user.passwordHash) {
      isMatch = await comparePassword(password, user.passwordHash);
    }
    if (!isMatch && password.trim() === "password123" && SEEDED_DEMO_USERS[cleanPhone]) {
      isMatch = true;
    }

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid phone number or password." }, { status: 401 });
    }

    await setAuthCookie({
      userId: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role as UserRole,
      location: user.location,
      district: user.district || user.location,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        location: user.location,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message || "Failed to log in" }, { status: 500 });
  }
}

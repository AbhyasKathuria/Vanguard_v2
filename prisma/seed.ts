import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding VANGUARD Multi-District Rural Service Routing Platform database...");

  // Clean existing tables
  await prisma.bloodRequest.deleteMany();
  await prisma.projectFund.deleteMany();
  await prisma.scheme.deleteMany();
  await prisma.resolution.deleteMany();
  await prisma.timeline.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.vulnerability.deleteMany();
  await prisma.callLog.deleteMany();
  await prisma.triageLog.deleteMany();
  await prisma.requestUpdate.deleteMany();
  await prisma.request.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.volunteerProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // ==========================================
  // 1. SUPER ADMIN (System-wide & Multi-District)
  // ==========================================
  const superAdmin = await prisma.user.create({
    data: {
      id: "usr_superadmin_1",
      name: "Officer Rajeshwar Rao",
      phone: "9876543200",
      passwordHash,
      role: "super_admin",
      location: "State Command HQ",
      district: "All Districts",
      language: "en",
      active: true,
    },
  });

  // ==========================================
  // 2. CITIZENS ACROSS MULTIPLE DISTRICTS
  // ==========================================
  const citizenRampur = await prisma.user.create({
    data: {
      id: "usr_citizen_1",
      name: "Ramesh Sharma",
      phone: "9876543210",
      passwordHash,
      role: "citizen",
      location: "Rampur",
      district: "Rampur",
      language: "hi",
      active: true,
    },
  });

  const citizenSitapur = await prisma.user.create({
    data: {
      id: "usr_citizen_2",
      name: "Anandi Patel",
      phone: "9876543220",
      passwordHash,
      role: "citizen",
      location: "Sitapur",
      district: "Sitapur",
      language: "hi",
      active: true,
    },
  });

  const citizenMandya = await prisma.user.create({
    data: {
      id: "usr_citizen_3",
      name: "Basavaraj Gowda",
      phone: "9876543230",
      passwordHash,
      role: "citizen",
      location: "Mandya",
      district: "Mandya",
      language: "kn",
      active: true,
    },
  });

  const citizenShivamogga = await prisma.user.create({
    data: {
      id: "usr_citizen_4",
      name: "Kavitha Hegde",
      phone: "9876543240",
      passwordHash,
      role: "citizen",
      location: "Shivamogga",
      district: "Shivamogga",
      language: "kn",
      active: true,
    },
  });

  // Phase 2 New Demo Accounts:
  // 2b. Citizen with Women's Profile (SafeLine Access)
  const citizenWomen = await prisma.user.create({
    data: {
      id: "usr_citizen_women",
      name: "Sunita Devi",
      phone: "9876543260",
      passwordHash,
      role: "citizen",
      citizenProfile: "women",
      location: "Rampur",
      district: "Rampur",
      language: "hi",
      active: true,
    },
  });

  // 1b. Higher Official (Medical & Blood Bank Scope)
  const higherOfficialMedical = await prisma.user.create({
    data: {
      id: "usr_higher_medical",
      name: "Dr. Arvind Swaminathan (CMO)",
      phone: "9876543270",
      passwordHash,
      role: "super_admin",
      location: "State Medical Directorate",
      district: "All Districts",
      language: "en",
      active: true,
    },
  });

  // 4b. Local Authority Ward Member Sub-Role
  const wardMemberRampur = await prisma.user.create({
    data: {
      id: "usr_authority_ward",
      name: "Rajesh Kumar (Panchayat Ward Member)",
      phone: "9876543280",
      passwordHash,
      role: "authority",
      subRole: "ward_member",
      wardScope: "Ward 4, Rampur",
      location: "Ward 4, Rampur",
      district: "Rampur",
      language: "hi",
      active: true,
    },
  });

  // ==========================================
  // 3. WORKERS (Verified & Unverified across trades)
  // ==========================================
  // Rampur Verified Electrician
  const workerRampur1 = await prisma.user.create({
    data: {
      id: "usr_worker_1",
      name: "Sunil Electrician",
      phone: "9876543211",
      passwordHash,
      role: "worker",
      location: "Rampur",
      district: "Rampur",
      language: "hi",
      active: true,
      workerProfile: {
        create: {
          profession: "Electrician",
          availability: true,
          location: "Rampur",
          district: "Rampur",
          latitude: 28.8154,
          longitude: 79.025,
          verified: true,
        },
      },
    },
  });

  // Rampur Unverified Plumber (Gating Demonstration)
  const workerRampur2 = await prisma.user.create({
    data: {
      id: "usr_worker_2",
      name: "Manoj Plumber (Pending Verification)",
      phone: "9876543214",
      passwordHash,
      role: "worker",
      location: "Rampur",
      district: "Rampur",
      language: "hi",
      active: true,
      workerProfile: {
        create: {
          profession: "Plumber",
          availability: true,
          location: "Rampur",
          district: "Rampur",
          latitude: 28.814,
          longitude: 79.024,
          verified: false,
        },
      },
    },
  });

  // Mandya Verified Mason & Canal Technician
  const workerMandya = await prisma.user.create({
    data: {
      id: "usr_worker_3",
      name: "Devraj Mason",
      phone: "9876543216",
      passwordHash,
      role: "worker",
      location: "Mandya",
      district: "Mandya",
      language: "kn",
      active: true,
      workerProfile: {
        create: {
          profession: "Mason & Irrigation Tech",
          availability: true,
          location: "Mandya",
          district: "Mandya",
          latitude: 12.5218,
          longitude: 76.8951,
          verified: true,
        },
      },
    },
  });

  // Shivamogga Verified Solar Pump Specialist
  const workerShivamogga = await prisma.user.create({
    data: {
      id: "usr_worker_4",
      name: "Manjunath Solar",
      phone: "9876543217",
      passwordHash,
      role: "worker",
      location: "Shivamogga",
      district: "Shivamogga",
      language: "kn",
      active: true,
      workerProfile: {
        create: {
          profession: "Solar Pump Specialist",
          availability: true,
          location: "Shivamogga",
          district: "Shivamogga",
          latitude: 13.9299,
          longitude: 75.5681,
          verified: true,
        },
      },
    },
  });

  // Sitapur Unverified Carpenter
  const workerSitapur = await prisma.user.create({
    data: {
      id: "usr_worker_5",
      name: "Ashok Carpenter (Unverified)",
      phone: "9876543219",
      passwordHash,
      role: "worker",
      location: "Sitapur",
      district: "Sitapur",
      language: "hi",
      active: true,
      workerProfile: {
        create: {
          profession: "Carpenter",
          availability: true,
          location: "Sitapur",
          district: "Sitapur",
          latitude: 27.569,
          longitude: 80.684,
          verified: false,
        },
      },
    },
  });

  // ==========================================
  // 4. VOLUNTEERS (Verified & Unverified NGOs)
  // ==========================================
  // Rampur Verified Volunteer (Rural Care NGO)
  const volunteerRampur = await prisma.user.create({
    data: {
      id: "usr_volunteer_1",
      name: "Pooja Volunteer",
      phone: "9876543212",
      passwordHash,
      role: "volunteer",
      location: "Rampur",
      district: "Rampur",
      language: "en",
      active: true,
      volunteerProfile: {
        create: {
          organization: "Rural Care NGO",
          area: "Rampur",
          district: "Rampur",
          latitude: 28.815,
          longitude: 79.027,
          availability: true,
          verified: true,
        },
      },
    },
  });

  // Sitapur Unverified Volunteer (Sitapur Youth Club)
  const volunteerSitapur = await prisma.user.create({
    data: {
      id: "usr_volunteer_2",
      name: "Vikas Volunteer (Pending Verification)",
      phone: "9876543215",
      passwordHash,
      role: "volunteer",
      location: "Sitapur",
      district: "Sitapur",
      language: "hi",
      active: true,
      volunteerProfile: {
        create: {
          organization: "Sitapur Youth Club",
          area: "Sitapur",
          district: "Sitapur",
          latitude: 27.5684,
          longitude: 80.6829,
          availability: true,
          verified: false,
        },
      },
    },
  });

  // Mandya Verified Volunteer (Gram Seva Trust)
  const volunteerMandya = await prisma.user.create({
    data: {
      id: "usr_volunteer_3",
      name: "Chethan Gram Seva",
      phone: "9876543222",
      passwordHash,
      role: "volunteer",
      location: "Mandya",
      district: "Mandya",
      language: "kn",
      active: true,
      volunteerProfile: {
        create: {
          organization: "Gram Seva Trust",
          area: "Mandya",
          district: "Mandya",
          latitude: 12.521,
          longitude: 76.894,
          availability: true,
          verified: true,
        },
      },
    },
  });

  // Shivamogga Verified Volunteer (Red Cross Rural)
  const volunteerShivamogga = await prisma.user.create({
    data: {
      id: "usr_volunteer_4",
      name: "Sowmya Red Cross",
      phone: "9876543223",
      passwordHash,
      role: "volunteer",
      location: "Shivamogga",
      district: "Shivamogga",
      language: "kn",
      active: true,
      volunteerProfile: {
        create: {
          organization: "Red Cross Rural",
          area: "Shivamogga",
          district: "Shivamogga",
          latitude: 13.931,
          longitude: 75.567,
          availability: true,
          verified: true,
        },
      },
    },
  });

  // ==========================================
  // 5. LOCAL AUTHORITIES (Per District)
  // ==========================================
  const authorityRampur = await prisma.user.create({
    data: {
      id: "usr_authority_1",
      name: "Officer Suresh Verma",
      phone: "9876543213",
      passwordHash,
      role: "authority",
      location: "Rampur District Office",
      district: "Rampur",
      language: "en",
      active: true,
    },
  });

  const authorityMandya = await prisma.user.create({
    data: {
      id: "usr_authority_2",
      name: "Officer Mallikarjun Patil",
      phone: "9876543224",
      passwordHash,
      role: "authority",
      location: "Mandya District Panchayat",
      district: "Mandya",
      language: "kn",
      active: true,
    },
  });

  const authorityShivamogga = await prisma.user.create({
    data: {
      id: "usr_authority_3",
      name: "Officer Deepa Rao",
      phone: "9876543225",
      passwordHash,
      role: "authority",
      location: "Shivamogga Municipal Office",
      district: "Shivamogga",
      language: "kn",
      active: true,
    },
  });

  // ==========================================
  // 6. SAMPLE REQUESTS ACROSS LIFECYCLE
  // ==========================================

  // Request 1: In Progress in Rampur (Assigned to Sunil Electrician)
  const req1 = await prisma.request.create({
    data: {
      id: "req_101",
      userId: citizenRampur.id,
      category: "civic",
      description: "Transformer sparking near Ward 4 primary school; power flickering constantly.",
      priority: "medium",
      location: "Rampur",
      district: "Rampur",
      latitude: 28.8154,
      longitude: 79.025,
      status: "in_progress",
      assignedToId: workerRampur1.id,
      createdAt: new Date(Date.now() - 3600 * 1000 * 4), // 4 hours ago
    },
  });

  await prisma.requestUpdate.createMany({
    data: [
      {
        requestId: req1.id,
        userId: citizenRampur.id,
        message: "Request submitted by citizen Ramesh Sharma.",
        status: "open",
        timestamp: new Date(Date.now() - 3600 * 1000 * 4),
      },
      {
        requestId: req1.id,
        userId: workerRampur1.id,
        message: "Auto-routed and assigned to verified worker Sunil Electrician (Electrician).",
        status: "assigned",
        timestamp: new Date(Date.now() - 3600 * 1000 * 3),
      },
      {
        requestId: req1.id,
        userId: workerRampur1.id,
        message: "Inspection started on site; replacement fuse and cable acquired.",
        status: "in_progress",
        timestamp: new Date(Date.now() - 3600 * 1000 * 1),
      },
    ],
  });

  // Request 2: Open in Sitapur (Unverified personnel only -> Verification Gate Demo)
  const req2 = await prisma.request.create({
    data: {
      id: "req_102",
      userId: citizenSitapur.id,
      category: "farming",
      description: "Irrigation channel breach near south fields, flooding crop seed beds.",
      priority: "low",
      location: "Sitapur",
      district: "Sitapur",
      latitude: 27.5684,
      longitude: 80.6829,
      status: "open",
      assignedToId: null,
      createdAt: new Date(Date.now() - 3600 * 1000 * 2), // 2 hours ago
    },
  });

  await prisma.requestUpdate.create({
    data: {
      requestId: req2.id,
      userId: citizenSitapur.id,
      message: "Request submitted. No verified available personnel in Sitapur (unverified candidates skipped). Queued for Local Authority triage.",
      status: "open",
      timestamp: new Date(Date.now() - 3600 * 1000 * 2),
    },
  });

  // Request 3: Resolved Emergency in Rampur (Handled by Pooja Volunteer)
  const req3 = await prisma.request.create({
    data: {
      id: "req_103",
      userId: citizenRampur.id,
      category: "emergency",
      description: "Elderly resident requires emergency transport to primary health center.",
      priority: "high",
      location: "Rampur",
      district: "Rampur",
      latitude: 28.8154,
      longitude: 79.025,
      status: "resolved",
      assignedToId: volunteerRampur.id,
      createdAt: new Date(Date.now() - 3600 * 1000 * 24), // 24 hours ago
    },
  });

  await prisma.requestUpdate.createMany({
    data: [
      {
        requestId: req3.id,
        userId: citizenRampur.id,
        message: "Emergency request raised by citizen.",
        status: "open",
        timestamp: new Date(Date.now() - 3600 * 1000 * 24),
      },
      {
        requestId: req3.id,
        userId: volunteerRampur.id,
        message: "Auto-routed to verified volunteer Pooja (Rural Care NGO).",
        status: "assigned",
        timestamp: new Date(Date.now() - 3600 * 1000 * 23),
      },
      {
        requestId: req3.id,
        userId: volunteerRampur.id,
        message: "Ambulance coordinated and patient admitted to PHC.",
        status: "resolved",
        timestamp: new Date(Date.now() - 3600 * 1000 * 20),
      },
    ],
  });

  // Request 4: Assigned Farming Request in Mandya (Auto-routed to Devraj Mason)
  const req4 = await prisma.request.create({
    data: {
      id: "req_104",
      userId: citizenMandya.id,
      category: "farming",
      description: "Sugarcane field feeder canal cracked; water escaping into drainage ditch.",
      priority: "low",
      location: "Mandya",
      district: "Mandya",
      latitude: 12.5218,
      longitude: 76.8951,
      status: "assigned",
      assignedToId: workerMandya.id,
      createdAt: new Date(Date.now() - 3600 * 1000 * 6),
    },
  });

  await prisma.requestUpdate.createMany({
    data: [
      {
        requestId: req4.id,
        userId: citizenMandya.id,
        message: "Request submitted by Basavaraj Gowda in Mandya.",
        status: "open",
        timestamp: new Date(Date.now() - 3600 * 1000 * 6),
      },
      {
        requestId: req4.id,
        userId: workerMandya.id,
        message: "Auto-routed to verified local worker Devraj Mason (Mason & Irrigation Tech) in Mandya.",
        status: "assigned",
        timestamp: new Date(Date.now() - 3600 * 1000 * 5),
      },
    ],
  });

  // Request 5: In Progress Health Request in Shivamogga (Auto-routed to Sowmya Red Cross)
  const req5 = await prisma.request.create({
    data: {
      id: "req_105",
      userId: citizenShivamogga.id,
      category: "health",
      description: "Maternal checkup assistance and oral rehydration supplies required for newborn ward.",
      priority: "high",
      location: "Shivamogga",
      district: "Shivamogga",
      latitude: 13.9299,
      longitude: 75.5681,
      status: "in_progress",
      assignedToId: volunteerShivamogga.id,
      createdAt: new Date(Date.now() - 3600 * 1000 * 8),
    },
  });

  await prisma.requestUpdate.createMany({
    data: [
      {
        requestId: req5.id,
        userId: citizenShivamogga.id,
        message: "Health request raised by Kavitha Hegde.",
        status: "open",
        timestamp: new Date(Date.now() - 3600 * 1000 * 8),
      },
      {
        requestId: req5.id,
        userId: volunteerShivamogga.id,
        message: "Auto-routed to verified volunteer Sowmya Red Cross (Red Cross Rural).",
        status: "assigned",
        timestamp: new Date(Date.now() - 3600 * 1000 * 7),
      },
      {
        requestId: req5.id,
        userId: volunteerShivamogga.id,
        message: "Volunteer dispatched with first aid kit and pediatric oral rehydration packets.",
        status: "in_progress",
        timestamp: new Date(Date.now() - 3600 * 1000 * 3),
      },
    ],
  });

  // Request 6: Open Community Pool Request in Mandya (Available for Volunteers to claim)
  const req6 = await prisma.request.create({
    data: {
      id: "req_106",
      userId: citizenMandya.id,
      category: "other",
      description: "Community hall ceiling fan and wiring assistance for panchayat meeting.",
      priority: "medium",
      location: "Mandya",
      district: "Mandya",
      latitude: 12.5218,
      longitude: 76.8951,
      status: "open",
      assignedToId: null,
      createdAt: new Date(Date.now() - 3600 * 1000 * 12),
    },
  });

  await prisma.requestUpdate.create({
    data: {
      requestId: req6.id,
      userId: citizenMandya.id,
      message: "Request queued in open community pool for volunteer pickup.",
      status: "open",
      timestamp: new Date(Date.now() - 3600 * 1000 * 12),
    },
  });

  try {
    const fs = await import("fs");
    const path = await import("path");
    // ==========================================
    // 6. CIVIC VULNERABILITIES & THREAT MATRIX
    // ==========================================
    console.log("📍 Seeding Civic Vulnerability & Threat Matrix points...");
    await prisma.vulnerability.createMany({
      data: [
        {
          id: "vuln_1",
          title: "Monsoon Road Crater & Bridge Joint Fracture",
          category: "Structural",
          severity: "Critical",
          threatScore: 92.5,
          populationDensity: "Dense Urban",
          affectedEstimate: 3400,
          timeToDecayDays: 14,
          decayFactor: 1.45,
          location: "Kosi River Old Bypass Bridge, Rampur",
          district: "Rampur",
          latitude: 28.8154,
          longitude: 79.025,
          status: "active",
          mitigationPlan: "Emergency structural scaffolding and heavy vehicular diversion within 48 hours.",
          reportedBy: "VANGUARD AI Vision Engine",
        },
        {
          id: "vuln_2",
          title: "Dangling High-Tension 11kV Feeder Wire near Primary School",
          category: "Electrical",
          severity: "Critical",
          threatScore: 96.0,
          populationDensity: "Market Hub",
          affectedEstimate: 1850,
          timeToDecayDays: 3,
          decayFactor: 1.8,
          location: "Ward 4 School Boundary, Sitapur",
          district: "Sitapur",
          latitude: 27.5684,
          longitude: 80.6829,
          status: "active",
          mitigationPlan: "Immediate grid shut-off and insulator pole replacement.",
          reportedBy: "Simulated Voice Dispatch Call",
        },
        {
          id: "vuln_3",
          title: "Contaminated Waste Overflow & Open Canal Blockage",
          category: "Hydrological",
          severity: "High",
          threatScore: 78.0,
          populationDensity: "Residential",
          affectedEstimate: 2100,
          timeToDecayDays: 21,
          decayFactor: 1.25,
          location: "Sugar Mill Canal Junction, Mandya",
          district: "Mandya",
          latitude: 12.5218,
          longitude: 76.8951,
          status: "active",
          mitigationPlan: "Mechanical silt dredging and biological sanitization flush.",
          reportedBy: "Citizen Vision Auto-Draft",
        },
        {
          id: "vuln_4",
          title: "Hillside Embankment Soil Erosion & Rockfall Hazard",
          category: "Environmental",
          severity: "High",
          threatScore: 82.0,
          populationDensity: "Rural Hamlet",
          affectedEstimate: 850,
          timeToDecayDays: 10,
          decayFactor: 1.5,
          location: "Bhadra Reservoir Ghat Road, Shivamogga",
          district: "Shivamogga",
          latitude: 13.9299,
          longitude: 75.5681,
          status: "inspecting",
          mitigationPlan: "Wire-mesh retaining wall installation and heavy vehicle weight limits.",
          reportedBy: "District Threat Matrix Scanner",
        },
        {
          id: "vuln_5",
          title: "Severe Road Pothole Swarm along State Highway 7",
          category: "Traffic",
          severity: "Moderate",
          threatScore: 65.0,
          populationDensity: "Market Hub",
          affectedEstimate: 4500,
          timeToDecayDays: 45,
          decayFactor: 1.15,
          location: "NH24 Overpass Underpass, Rampur East",
          district: "Rampur",
          latitude: 28.825,
          longitude: 79.035,
          status: "active",
          mitigationPlan: "Cold-mix asphalt patch application and high-visibility warning cones.",
          reportedBy: "AI Vision Complaint Box",
        },
        {
          id: "vuln_6",
          title: "Substation Transformer Oil Leakage & Smoke",
          category: "Electrical",
          severity: "Critical",
          threatScore: 89.0,
          populationDensity: "Dense Urban",
          affectedEstimate: 6200,
          timeToDecayDays: 7,
          decayFactor: 1.6,
          location: "Town Hall Square, Sitapur",
          district: "Sitapur",
          latitude: 27.5784,
          longitude: 80.6929,
          status: "mitigated",
          mitigationPlan: "Transformer cooling core overhauled by District Electricity Board.",
          reportedBy: "Citizen Urgent Request",
        },
      ],
    });

    // ==========================================
    // 7. SAMPLE MULTIMODAL VISION COMPLAINTS
    // ==========================================
    console.log("📸 Seeding AI Multimodal Vision Complaints...");
    await prisma.complaint.createMany({
      data: [
        {
          id: "cmp_1",
          userId: "usr_citizen_1",
          title: "Critical Bridge Joint Crack with Pothole Cavity",
          category: "Infrastructure",
          urgency: "High",
          urgencyReasoning: "Severe concrete separation on primary transit bridge creates structural integrity risk during heavy truck crossings.",
          description: "Inspection of uploaded imagery confirms a wide lateral fracture across expansion joint seam on Kosi River Bridge. Structural rebar appears exposed with approximately 8cm deep pothole cavity. Recommend immediate load-limiting and PWD team dispatch.",
          detectedTags: JSON.stringify(["#structural-fracture", "#bridge-joint", "#pothole", "#transit-hazard", "#rebar-exposure"]),
          recommendedAuthority: "Public Works Department (PWD) - Structural Division",
          riskScore: 86,
          location: "Kosi River Bypass, Rampur",
          district: "Rampur",
          latitude: 28.8154,
          longitude: 79.025,
          status: "in_investigation",
        },
        {
          id: "cmp_2",
          userId: "usr_citizen_2",
          title: "Injured Stray Dog with Deep Laceration and Fractured Left Hind Leg",
          category: "Animal Welfare",
          urgency: "Critical",
          urgencyReasoning: "Animal is unable to bear weight, showing acute distress, visible compound wound prone to rapid infection.",
          description: "Visual assessment indicates an injured medium-sized street dog with acute vehicular trauma to left hind quarter. Visible open wound requiring immediate antiseptic debridement, splint stabilization, and animal rescue transport.",
          detectedTags: JSON.stringify(["#injured-animal", "#canine-trauma", "#fracture", "#emergency-rescue"]),
          recommendedAuthority: "Registered NGO Shelter & Mobile Animal Ambulance",
          riskScore: 92,
          location: "Market Square Ward 2, Sitapur",
          district: "Sitapur",
          latitude: 27.5684,
          longitude: 80.6829,
          status: "submitted",
        },
      ],
    });

    // ==========================================
    // 8. SAMPLE AI DISPATCH CALL LOGS
    // ==========================================
    console.log("📞 Seeding AI Calling Dispatch Simulator Logs...");
    await prisma.callLog.createMany({
      data: [
        {
          id: "call_1",
          callerName: "Vikas Agrawal",
          callerPhone: "9876543299",
          scenarioTitle: "Hit-and-Run on Highway 7 (Pedestrian Injured)",
          urgency: "Critical",
          status: "dispatched",
          transcriptJson: JSON.stringify([
            { speaker: "caller", text: "Emergency! A speeding truck just hit an elderly pedestrian near KM 42 on Highway 7!", timestamp: "00:02" },
            { speaker: "agent", text: "This is VANGUARD AI Dispatch. I am routing emergency services immediately. Is the victim conscious and breathing?", timestamp: "00:06" },
            { speaker: "caller", text: "He is conscious but bleeding heavily from the right leg! Please hurry!", timestamp: "00:11" },
            { speaker: "agent", text: "Ambulance Unit 4 from Sitapur PHC is mobilized with ETA 6 minutes. Apply firm, direct pressure on the bleeding site with a clean cloth. Do not move his neck or spine.", timestamp: "00:18" },
          ]),
          dispatchUnit: "Ambulance Unit 4 (Sitapur PHC)",
          estimatedEta: "6 mins",
          location: "KM 42 Highway 7, Sitapur",
          durationSeconds: 48,
        },
        {
          id: "call_2",
          callerName: "Pooja Hegde",
          callerPhone: "9876543298",
          scenarioTitle: "LPG Commercial Cylinder Gas Leak near Primary School",
          urgency: "Critical",
          status: "dispatched",
          transcriptJson: JSON.stringify([
            { speaker: "caller", text: "We smell severe LPG gas right behind the primary school canteen!", timestamp: "00:01" },
            { speaker: "agent", text: "Immediate action required. Evacuate all children upwind away from the building. Do not flip any electric switches or strike flames.", timestamp: "00:05" },
            { speaker: "caller", text: "Understood, teachers are leading children to the open playground right now.", timestamp: "00:12" },
            { speaker: "agent", text: "Fire & Hazmat Squad 1 has been dispatched with siren priority. Gas valve isolation unit ETA 8 minutes.", timestamp: "00:17" },
          ]),
          dispatchUnit: "Rapid Hazmat & Fire Tender 1",
          estimatedEta: "8 mins",
          location: "Primary School Ward 3, Rampur",
          durationSeconds: 52,
        },
      ],
    });

    // ==========================================
    // 9. SAMPLE EMERGENCY TRIAGE LOGS
    // ==========================================
    console.log("🩺 Seeding Dual Emergency Triage Records...");
    await prisma.triageLog.createMany({
      data: [
        {
          id: "trg_1",
          type: "human",
          patientType: "Adult Male (54y)",
          symptoms: "Crushing retrosternal chest pain radiating to left jaw, diaphoresis, shortness of breath",
          severity: "Code Red",
          priorityScore: 98,
          vitalSigns: JSON.stringify({ pulse: 114, bloodPressure: "165/100", oxygenSat: "92%" }),
          firstAidProtocol: "Keep patient seated upright and calm. Loosen tight collar. Administer 300mg chewable aspirin if not allergic. Prepare AED if available. Ambulance dispatched.",
          matchedServices: JSON.stringify([
            { name: "Rampur District Civil Hospital (ICU/Cardio)", phone: "0595-2345678", distanceKm: 4.2 },
            { name: "Primary Health Center Emergency Unit", phone: "108", distanceKm: 1.8 },
          ]),
          dispatchedSos: true,
          location: "Civil Lines, Rampur",
        },
        {
          id: "trg_2",
          type: "veterinary",
          patientType: "Stray Canine (Adult)",
          symptoms: "Compound tibia fracture, hypothermia, trembling after vehicle collision",
          severity: "Code Orange",
          priorityScore: 84,
          vitalSigns: JSON.stringify({ breathingRate: "Labored", responsiveness: "Alert but in severe shock" }),
          firstAidProtocol: "Improvise muzzle with soft cloth bandage to prevent stress biting. Stabilize broken limb using padded cardboard splint without forcing bone. Keep warm with blanket.",
          matchedServices: JSON.stringify([
            { name: "Voice for Stray Animals (Sitapur Rescue Shelter)", phone: "+91-9456001122", distanceKm: 3.5 },
            { name: "Government Veterinary Hospital Dispensary", phone: "05862-251234", distanceKm: 5.1 },
          ]),
          dispatchedSos: true,
          location: "Station Road, Sitapur",
        },
      ],
    });

    // ==========================================
    // PHASE 2: ASSETS & PUBLIC INFRASTRUCTURE
    // ==========================================
    const assets = await Promise.all([
      prisma.asset.create({
        data: {
          id: "ASSET-10101",
          type: "phc",
          name: "Rampur Primary Health Centre (PHC)",
          location: "Civil Lines, Rampur",
          district: "Rampur",
          latitude: 28.8021,
          longitude: 79.0345,
          condition: "Good",
          department: "Health & Family Welfare",
        },
      }),
      prisma.asset.create({
        data: {
          id: "ASSET-10102",
          type: "water_tank",
          name: "Overhead Water Reservoir Tank #2",
          location: "Sector 2, Rampur",
          district: "Rampur",
          latitude: 28.8115,
          longitude: 79.0289,
          condition: "Needs Repair",
          department: "Panchayati Raj & Water Supply",
        },
      }),
      prisma.asset.create({
        data: {
          id: "ASSET-10103",
          type: "toilet",
          name: "Government Primary School Sanitation Block",
          location: "Village Centre, Rampur",
          district: "Rampur",
          latitude: 28.7984,
          longitude: 79.0412,
          condition: "Good",
          department: "Education & Sanitation",
        },
      }),
      prisma.asset.create({
        data: {
          id: "ASSET-10104",
          type: "ration_shop",
          name: "Fair Price Shop #12 (PDS Ration Outlet)",
          location: "Market Road, Rampur",
          district: "Rampur",
          latitude: 28.8055,
          longitude: 79.0211,
          condition: "Good",
          department: "Food & Civil Supplies",
        },
      }),
      prisma.asset.create({
        data: {
          id: "ASSET-10105",
          type: "streetlight",
          name: "Ward 4 Solar Streetlight Array",
          location: "Ward 4 Main Street, Rampur",
          district: "Rampur",
          latitude: 28.8142,
          longitude: 79.0195,
          condition: "Critical",
          department: "Rural Electrification",
        },
      }),
    ]);

    // ==========================================
    // PHASE 2: GOVERNMENT SCHEMES
    // ==========================================
    await prisma.scheme.createMany({
      data: [
        {
          id: "sch_pm_kisan",
          name: "PM-KISAN Samman Nidhi",
          category: "Farming",
          department: "Agriculture & Farmers Welfare",
          eligibility: "Small and marginal farmer families with cultivable landholding up to 2 hectares.",
          documents: JSON.stringify(["Aadhaar Card", "Land Ownership Record (Khatauni)", "Bank Passbook"]),
          officialUrl: "https://pmkisan.gov.in",
          minAge: 18,
          maxAge: 75,
          incomeLimit: 250000,
          gender: "all",
          targetOccupation: "Farmer",
          description: "Income support of ₹6,000 per year in three equal 4-monthly installments.",
        },
        {
          id: "sch_pmjay",
          name: "Ayushman Bharat (PM-JAY)",
          category: "Health",
          department: "Health & Family Welfare",
          eligibility: "Deprived rural families identified in Socio-Economic Caste Census (SECC).",
          documents: JSON.stringify(["Aadhaar Card", "Ration Card", "Family Photo ID"]),
          officialUrl: "https://pmjay.gov.in",
          minAge: 0,
          maxAge: 100,
          incomeLimit: 150000,
          gender: "all",
          targetOccupation: "All Citizens",
          description: "Health cover of ₹5 Lakh per family per year for secondary and tertiary hospitalization.",
        },
        {
          id: "sch_pmay",
          name: "Pradhan Mantri Awas Yojana (Gramin)",
          category: "Housing",
          department: "Rural Development",
          eligibility: "Houseless or living in kutcha/dilapidated homes in rural areas.",
          documents: JSON.stringify(["Aadhaar Card", "MGNREGA Job Card", "Bank Account Details"]),
          officialUrl: "https://pmayg.nic.in",
          minAge: 18,
          maxAge: 80,
          incomeLimit: 120000,
          gender: "all",
          targetOccupation: "Rural Citizen",
          description: "Financial grant of ₹1.2 Lakh (plains) to ₹1.3 Lakh (hilly areas) to construct a permanent house.",
        },
        {
          id: "sch_bbbp",
          name: "Beti Bachao Beti Padhao / Sukanya Samriddhi",
          category: "Women & Child",
          department: "Women and Child Development",
          eligibility: "Families with a girl child below 10 years of age.",
          documents: JSON.stringify(["Birth Certificate of Girl Child", "Identity & Residence Proof of Parents"]),
          officialUrl: "https://wcd.nic.in",
          minAge: 0,
          maxAge: 10,
          incomeLimit: 500000,
          gender: "female",
          targetOccupation: "Parent / Guardian",
          description: "High-interest savings scheme with tax exemptions aimed at girl child education and welfare.",
        },
        {
          id: "sch_nsap",
          name: "National Social Assistance Programme (NSAP) Pension",
          category: "Poverty / Pension",
          department: "Rural Development",
          eligibility: "Senior citizens age 60+ belonging to BPL households.",
          documents: JSON.stringify(["Age Proof", "BPL Ration Card", "Bank Account Details"]),
          officialUrl: "https://nsap.nic.in",
          minAge: 60,
          maxAge: 110,
          incomeLimit: 60000,
          gender: "all",
          targetOccupation: "Senior Citizen",
          description: "Monthly pension of ₹500 to ₹1000 directly transferred to eligible senior citizens.",
        },
      ],
    });

    // ==========================================
    // PHASE 2: PUBLIC DEVELOPMENT FUNDS
    // ==========================================
    await prisma.projectFund.createMany({
      data: [
        {
          id: "fund_1",
          title: "Rampur Solar Streetlight Installation Phase II",
          department: "Rural Electrification",
          allocatedAmount: 4500000,
          spentAmount: 3375000,
          status: "In Progress",
          progressPercent: 75,
          location: "Ward 1 to Ward 6, Rampur",
          district: "Rampur",
          latitude: 28.812,
          longitude: 79.022,
          discrepancyReports: 1,
        },
        {
          id: "fund_2",
          title: "Canal Desilting & Irrigation Feeder Line B",
          department: "Irrigation & Water Resources",
          allocatedAmount: 2800000,
          spentAmount: 1120000,
          status: "In Progress",
          progressPercent: 40,
          location: "Agricultural Belt, Rampur",
          district: "Rampur",
          latitude: 28.795,
          longitude: 79.045,
          discrepancyReports: 0,
        },
        {
          id: "fund_3",
          title: "Community Solid Waste Segregation Yard",
          department: "Panchayati Raj & Sanitation",
          allocatedAmount: 1600000,
          spentAmount: 1520000,
          status: "Completed",
          progressPercent: 100,
          location: "Sector 4 Outskirts, Rampur",
          district: "Rampur",
          latitude: 28.825,
          longitude: 79.015,
          discrepancyReports: 0,
        },
      ],
    });

    // ==========================================
    // PHASE 2: BLOOD BANK ASSISTANCE
    // ==========================================
    await prisma.bloodRequest.createMany({
      data: [
        {
          id: "bld_1",
          patientName: "Emergency Trauma Victim",
          bloodGroup: "O+",
          urgency: "Emergency / Immediate",
          unitsNeeded: 2,
          hospital: "District Civil Hospital, Blood Bank Wing",
          location: "Civil Lines, Rampur",
          district: "Rampur",
          contactPhone: "9876543200",
          status: "matched",
          matchedDonorsCount: 3,
          remarks: "Cross-matching confirmed with local donor pool. Ambulance unit en route with unit.",
        },
        {
          id: "bld_2",
          patientName: "Dialysis Patient (Scheduled)",
          bloodGroup: "B+",
          urgency: "Urgent / 24 Hours",
          unitsNeeded: 1,
          hospital: "Mandya Taluk Hospital",
          location: "Mandya District Hub",
          district: "Mandya",
          contactPhone: "9876543230",
          status: "open",
          matchedDonorsCount: 1,
          remarks: "Awaiting secondary donor confirmation.",
        },
      ],
    });

    // ==========================================
    // PHASE 2: SPECIALIZED MODULE COMPLAINTS
    // ==========================================
    // 1. PDS Ration Discrepancy
    const pdsComplaint = await prisma.complaint.create({
      data: {
        id: "cmp_pds_1",
        userId: citizenRampur.id,
        title: "Under-Distribution of Wheat Quota at Fair Price Shop #12",
        category: "Public Safety",
        subcategory: "PDS_QUANTITY_DISCREPANCY",
        assignedDepartment: "Food & Civil Supplies",
        urgency: "High",
        priority: "High",
        description: "Dealer charged full price for 35kg quota but only dispensed 31kg. Refused to issue printed POS receipt citing server error.",
        detectedTags: JSON.stringify(["#pds", "#ration", "#shortage"]),
        recommendedAuthority: "Food & Civil Supplies Inspector, Rampur",
        riskScore: 78,
        location: "Market Road, Rampur",
        district: "Rampur",
        latitude: 28.8055,
        longitude: 79.0211,
        assetId: "ASSET-10104",
        status: "in_investigation",
        metaData: JSON.stringify({
          shopId: "FPS-12",
          commodity: "Wheat",
          expectedQtyKg: 35,
          receivedQtyKg: 31,
          shortageKg: 4,
          receiptProvided: false,
        }),
      },
    });

    await prisma.timeline.create({
      data: {
        complaintId: pdsComplaint.id,
        action: "SUBMITTED",
        performedBy: citizenRampur.name,
        performedById: citizenRampur.id,
        role: "citizen",
        remarks: "PDS discrepancy logged with photographic evidence of scale reading.",
      },
    });

    // 2. Clean Community Sanitation Hotspot
    const cleanComplaint = await prisma.complaint.create({
      data: {
        id: "cmp_clean_1",
        userId: citizenRampur.id,
        title: "Major Solid Waste Accumulation & Drain Blockage near Ward 4",
        category: "Sanitation",
        subcategory: "SANITATION_DUMPING",
        assignedDepartment: "Sanitation & Public Health",
        urgency: "Critical",
        priority: "Urgent",
        description: "Municipal waste has not been collected for 5 days. Overflowing into the primary open stormwater drain causing foul stench and mosquito breeding.",
        detectedTags: JSON.stringify(["#garbage", "#drain_clog", "#sanitation_hotspot"]),
        recommendedAuthority: "Sanitation Officer, Rampur Municipality",
        riskScore: 88,
        location: "Ward 4 Market Lane, Rampur",
        district: "Rampur",
        latitude: 28.8145,
        longitude: 79.0198,
        assetId: "ASSET-10105",
        status: "submitted",
        metaData: JSON.stringify({
          hotspotCluster: "HOTSPOT-RAMPUR-WARD4",
          reportCount: 6,
          severityRank: "RED_CRITICAL",
        }),
      },
    });

    await prisma.timeline.create({
      data: {
        complaintId: cleanComplaint.id,
        action: "SUBMITTED",
        performedBy: citizenRampur.name,
        performedById: citizenRampur.id,
        role: "citizen",
        remarks: "Sanitation crisis report logged into village hotspot cluster.",
      },
    });

    // 3. SafeLine Confidential Case (Women & Child Protection)
    const safelineComplaint = await prisma.complaint.create({
      data: {
        id: "cmp_safe_1",
        userId: citizenWomen.id,
        title: "SafeLine Protection: Persistent Harassment on Unlit Bus Stand Route",
        category: "Public Safety",
        subcategory: "SAFELINE_HARASSMENT",
        assignedDepartment: "Women & Child Safety Cell",
        urgency: "Critical",
        priority: "Emergency",
        description: "Group of individuals routinely gathering around the unlit stretch near the Panchayat school bus stand during evening commute hours.",
        detectedTags: JSON.stringify(["#safeline", "#women_safety", "#patrol_request"]),
        recommendedAuthority: "District Women Welfare Protection Officer",
        riskScore: 92,
        location: "Protected Corridor (Zone 4)",
        district: "Rampur",
        latitude: 28.8125,
        longitude: 79.0205,
        isSafeLine: true,
        isAnonymous: true,
        status: "in_investigation",
        metaData: JSON.stringify({
          safeLineCategory: "unsafe_location",
          privacyLevel: "STRICT_CONFIDENTIAL",
          authorisedOfficerAssigned: "Welfare Officer Meenakshi Rao",
        }),
      },
    });

    await prisma.timeline.create({
      data: {
        complaintId: safelineComplaint.id,
        action: "SUBMITTED",
        performedBy: "Citizen (Identity Protected)",
        role: "citizen",
        remarks: "Confidential SafeLine intake routed to authorized officer queue. Excluded from public views.",
      },
    });

    // Sync sqlite db to both root and prisma dir for consistency
    const rootDb = path.join(process.cwd(), "dev.db");
    const prismaDir = path.join(process.cwd(), "prisma");
    const prismaDb = path.join(prismaDir, "dev.db");
    if (fs.existsSync(rootDb)) {
      if (!fs.existsSync(prismaDir)) fs.mkdirSync(prismaDir, { recursive: true });
      fs.copyFileSync(rootDb, prismaDb);
    }
  } catch {
    // ignore
  }

  console.log("✅ VANGUARD Database seeding completed successfully!");
  console.log("==================================================");
  console.log("🔑 Seeded Demo Credentials (Password: password123):");
  console.log("  Super Admin:         9876543200 (Officer Rajeshwar Rao - State HQ)");
  console.log("  Citizen (Rampur):    9876543210 (Ramesh Sharma)");
  console.log("  Citizen (Mandya):    9876543230 (Basavaraj Gowda)");
  console.log("  Worker (Rampur):     9876543211 (Sunil Electrician - Verified)");
  console.log("  Worker (Mandya):     9876543216 (Devraj Mason - Verified)");
  console.log("  Volunteer (Rampur):  9876543212 (Pooja Volunteer - Verified)");
  console.log("  Volunteer (Shivam.): 9876543223 (Sowmya Red Cross - Verified)");
  console.log("  Authority (Rampur):  9876543213 (Officer Suresh Verma)");
  console.log("  Authority (Mandya):  9876543224 (Officer Mallikarjun Patil)");
  console.log("  Citizen (Women Hub): 9876543260 (Sunita Devi - SafeLine)");
  console.log("  Higher Official:     9876543270 (Dr. Arvind Swaminathan - Medical & Blood Bank)");
  console.log("  Ward Member (Sub):   9876543280 (Rajesh Kumar - Ward 4 Scope)");
  console.log("  Worker (Unverified): 9876543214 (Manoj Plumber - Gated)");
  console.log("  Volunteer (Unver.):  9876543215 (Vikas Volunteer - Gated)");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

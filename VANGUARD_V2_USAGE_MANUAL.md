# VANGUARD V2 — Rural Governance & Emergency Ecosystem
## Comprehensive Official Usage Manual & Operator Guide

---

## ⚡ 1. Quickstart & 1-Click Launching

VANGUARD V2 includes automated Windows batch launchers that handle dependency verification, database synchronization, port cleanup, and browser launching.

### Method A: Instant Development Launch (`start.bat`)
Simply **double-click `start.bat`** in the root directory.
- Checks Node.js runtime.
- Automatically kills any orphaned process blocking **Port 3000**.
- Synchronizes SQLite database (`dev.db`) if needed.
- Automatically launches your default web browser to **`http://localhost:3000`** in 3 seconds.
- Starts Next.js development server.

### Method B: Interactive Master Control Runner (`run_and_test.bat`)
Double-click **`run_and_test.bat`** for a dedicated operations menu:
```text
==============================================================================
              VANGUARD V2 - Rural Governance & Emergency Ecosystem
==============================================================================
  [1] Start VANGUARD Local Server & Auto-Launch Browser (http://localhost:3000)
  [2] Run Master Automated Verification Tests (Triage, GIS, Haversine, Grades)
  [3] Reset, Sync & Re-Seed Database (SQLite dev.db with multi-district data)
  [4] Run Next.js Production Build Test (Compiles all 48 static/dynamic routes)
  [5] Run Full Diagnostics & Launch (Test + Build + Start Server)
  [6] Open Official Documentation & Usage Guide
  [7] Exit
==============================================================================
```

---

## 🔑 2. Pre-Seeded Personas & Demo Credentials

The platform includes **1-Click Demo Login buttons** on the home page (`/`) and login screen (`/login`). You can log in with a single click or use the phone numbers below:

| Persona & Role | Name | Phone Number | District / Jurisdiction | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **⚡ Super Admin** | Officer Rajeshwar Rao | `9876543200` | State Headquarters | State-wide telemetry, authority provisioning, API diagnostics |
| **🏛️ District Authority** | Officer Suresh Verma | `9876543213` | Rampur (UP) | Rampur triage matrix, manual worker dispatch, inspection reports |
| **🏛️ District Authority** | Officer Mallikarjun Patil | `9876543224` | Mandya (KA) | Mandya agrarian hub, irrigation dispatch, authority verification |
| **👷 Field Worker (Verified)**| Sunil Electrician | `9876543211` | Rampur (UP) | High-voltage repairs, transformer maintenance, weather widget |
| **👷 Field Worker (Verified)**| Devraj Mason | `9876543216` | Mandya (KA) | Canal sluice gates, masonry repairs, school building restoration |
| **🤝 Emergency Volunteer** | Pooja Volunteer | `9876543212` | Rampur (UP) | High-priority SOS siren takeover, trauma dispatch, patient transport |
| **🤝 Emergency Volunteer** | Sowmya (Red Cross) | `9876543223` | Shivamogga (KA) | Veterinary rescue, antivenom supply, village medical outreach |
| **👨‍🌾 Rural Citizen** | Ramesh Sharma | `9876543210` | Rampur (UP) | Voice-assisted grievance, simple mode, cattle triage, scheme check |
| **👨‍🌾 Rural Citizen** | Basavaraj Gowda | `9876543230` | Mandya (KA) | Multilingual filing (Kannada), crop disease check, mandi prices |

> **Passwordless OTP Note:** When prompted for an SMS OTP or Email Magic Code, use demo bypass code **`123456`** or **`000000`** to log in instantly.

---

## 🧭 3. Feature Breakdown & Live Test Scenarios

---

### Feature 1: Passwordless Phone SMS & Email OTP Authentication
- **Routes:** [`/login`](http://localhost:3000/login), [`/signup`](http://localhost:3000/signup), [`/auth/login`](http://localhost:3000/auth/login), [`/auth/register`](http://localhost:3000/auth/register)
- **Problem Solved:** Eliminates forgotten password deadlocks and registration mismatches in field conditions.
- **How to Test:**
  1. Open [`http://localhost:3000/login`](http://localhost:3000/login).
  2. Select the **"Phone SMS OTP"** or **"Email Magic Code"** tab.
  3. Enter any 10-digit mobile number (e.g. `9876543210`) or email.
  4. Click **"Send Verification Code"**.
  5. Enter code **`123456`** and click **"Verify & Sign In"**.
  6. **Result:** You are authenticated with a secure JWT cookie and instantly redirected to your role dashboard.

---

### Feature 2: High-Priority SOS Emergency Siren & Proximity Auto-Dispatch
- **Component:** `src/components/SOSScreenPopup.tsx`
- **APIs:** [`POST /api/emergency/auto-dispatch`](http://localhost:3000/api/emergency/auto-dispatch), [`GET /api/emergency/active-sos`](http://localhost:3000/api/emergency/active-sos)
- **Problem Solved:** Critical health emergencies now instantly alert nearby field volunteers with an audible alarm and automatic assignment.
- **How to Test:**
  1. Log in as **Pooja Volunteer** (`9876543212`) on [`/volunteer/dashboard`](http://localhost:3000/volunteer/dashboard).
  2. Ensure your sound is unmuted.
  3. When an active SOS incident is detected (or simulated from `/emergency/triage`), the **Synthesized Web Audio Dual-Tone Ambulance Siren (880Hz / 440Hz)** sounds automatically.
  4. A pulsating crimson screen takeover modal displays:
     - Patient Name & direct telephone dial link
     - Exact GPS coordinates & calculated Haversine distance (in km)
     - Medical emergency type & risk score
  5. Click **"Accept & Route Instantly"**: Auto-claims the ticket and opens turn-by-turn GIS navigation.
  6. Click **"Mute Siren"** at any time to silence audio without dismissing the modal.

---

### Feature 3: Universal 4-Stage Progress Stepper
- **Component:** `src/components/Timeline.tsx`
- **Route:** [`/citizen/request/[id]`](http://localhost:3000/citizen/request/cm_w1)
- **Problem Solved:** Middleware previously blocked non-citizen roles from viewing `/citizen/request/*`. Whitelisting now allows all roles to track progress without redirection loops.
- **How to Test:**
  1. From any dashboard (Volunteer, Worker, Authority, or Citizen), click **"View Timeline"** on any ticket.
  2. Observe the 4-stage visual progression stepper:
     - **Stage 1: Incident Logged** (Amber)
     - **Stage 2: Responder Assigned** (Indigo — displays responder name & proximity)
     - **Stage 3: In-Progress On-Site** (Sky Blue with active pulse)
     - **Stage 4: Resolved & Verified** (Emerald)
  3. Responders can click **"Start On-Site Work"** or **"Mark Resolved"** directly in the action bar, attaching custom notes that immediately append to the public audit log.

---

### Feature 4: Geospatial Command Center & MapTiler Thematic Clusters
- **Route:** [`/threat-matrix`](http://localhost:3000/threat-matrix)
- **Components:** `GeospatialCommandCenter.tsx`, `RuralIssueHeatmap.tsx`, `VillageHealthMatrix.tsx`
- **Features Included:**
  1. **MapTiler Thematic Clusters:**
     - High-resolution vector map tiles (`key=FFz6XYIUl8sR73ixvbvM`).
     - Thematic category colors:
       - 💧 Drinking Water: Sky Blue (`#0284c7`)
       - ⚡ Electricity Grid: Amber / Yellow (`#eab308`)
       - 🏥 Health / PHC: Crimson (`#dc2626`)
       - 🛣️ Roads & Bridges: Orange (`#ea580c`)
       - 🌾 Agriculture & Cattle: Green (`#16a34a`)
     - Category filter pills, district selector, and 1-tap **"Auto-Dispatch"** button inside marker drawers.
  2. **Village Health Matrix (RAG Scorecards):**
     - Multi-pillar health scores (0-100) across Drinking Water, Electricity, Roads, School, Health, Sanitation, and Irrigation.
     - RAG Badges: 🟢 Healthy (&ge;80%), 🟡 Degraded (50-79%), 🔴 Critical Breakdown (&lt;50%).
     - Real-time recalculation based on open complaint tallies.
     - 1-click **"Audit Village"** button routing to the inspection module.
  3. **Zero-Dropdown Administrative Hierarchy:**
     - [`GET /api/gis/administrative-hierarchy?lat=28.8154&lng=79.025`](http://localhost:3000/api/gis/administrative-hierarchy?lat=28.8154&lng=79.025) converts GPS coordinates into Village &rarr; Gram Panchayat &rarr; Block &rarr; District &rarr; Department &rarr; Jurisdictional Officer.
  4. **Incident Cluster Detection:**
     - [`GET /api/gis/cluster-detection`](http://localhost:3000/api/gis/cluster-detection) aggregates correlated complaints within 3.5 km into single "Root Infrastructure Failure Events".

---

### Feature 5: 4-Tier Smart Emergency Triage & Cattle Care ("Meri Gaay Beemar Hai")
- **Route:** [`/emergency/triage`](http://localhost:3000/emergency/triage)
- **Component:** `DualEmergencyTriage.tsx`
- **Features Included:**
  1. **4-Tier Classification:**
     - 🔴 **Emergency (P0):** Obstetric hemorrhage, cardiac arrest, active electrical wire on ground &rarr; Triggers instant SOS siren broadcast.
     - 🟠 **Urgent (P1):** Bovine acute rumen bloat, village blackout, ruptured water trunk line.
     - 🟡 **High (P2):** School structural hazard, bridge culvert damage, crop pest outbreak.
     - 🟢 **Normal (P3):** Streetlight out, pension delay, road pothole.
  2. **Human Clinical Assistant:**
     - 110 BPM CPR audio metronome (30 compressions : 2 rescue breaths).
     - Arterial bleed control & burn management.
     - Proximity matching with Civil Hospitals & 24/7 PHCs.
  3. **Bovine Cattle Emergency Care ("मेरी गाय बीमार है"):**
     - Click the quick-select button **"मेरी गाय बीमार है (Cattle Emergency)"**.
     - Life-saving first aid for:
       - **Acute Rumen Bloat / Afra:** 500ml mustard oil + 30ml turpentine oil orally, elevate front hooves, avoid left-side recumbency.
       - **Foot & Mouth Disease (FMD):** 1% potassium permanganate wash, neem extract, isolation.
       - **Milk Fever:** Intravenous calcium borogluconate drip emergency.
     - 1-tap call to National Animal Emergency Helpline **`1962`** and Mobile Veterinary Unit dispatch.
  4. **Automated SLA Escalation Engine:**
     - [`GET /api/emergency/sla-escalation`](http://localhost:3000/api/emergency/sla-escalation) scans open complaints and automatically escalates:
       - Day 0 &rarr; Gram Panchayat Officer
       - Day 2 &rarr; Block Development Officer (BDO)
       - Day 5 &rarr; District Magistrate (DM) / Collector

---

### Feature 6: Rural Citizen Accessibility "Simple Mode"
- **Route:** [`/simple-mode`](http://localhost:3000/simple-mode)
- **Features Included:**
  - Designed specifically for elderly or low-literacy rural citizens.
  - Large, high-contrast, high-touch buttons with clear iconographic cues:
    - 🎙️ **बोलकर शिकायत दर्ज करें** (Speak to Report)
    - 🚨 **आपातकालीन सहायता (SOS)**
    - 🏥 **108 एम्बुलेंस कॉल**
    - 💧 **पीने का पानी / हैंडपंप**
    - ⚡ **बिजली गुल / तार टूटा**
    - 🌾 **किसान व पशु सहायता**
    - 📋 **सरकारी योजनाएं जांचें**
  - **"सुनें (Listen)"** audio guidance button reading instructions aloud in Hindi.
  - Direct 1-tap emergency speed dial: **112** (All Emergency), **108** (Ambulance), **1962** (Pashu Chikitsa), **1077** (Disaster Relief).

---

### Feature 7: Voice-Assisted Grievance Guide
- **Component:** `src/components/voice/AssistedVoiceReporter.tsx`
- **Accessible From:** `/simple-mode` & floating voice buttons
- **Features Included:**
  - 4-question guided interview in Hindi or English:
    1. *"क्या समस्या है?"* ("What is the problem?")
    2. *"यह कहाँ हुआ है?"* ("Where did it happen?")
    3. *"यह समस्या कितने दिनों से है?"* ("Since how many days?")
    4. *"फ़ोटो या सुबूत जोड़ें"* ("Attach photo evidence — optional")
  - Web Speech API speech-to-text recognition with audio feedback.
  - Automatically parses voice transcripts into category, title, urgency, and location, filing a ticket to `/api/complaints`.

---

### Feature 8: Agrarian Farmer Hub
- **Route:** [`/farmer`](http://localhost:3000/farmer)
- **Component:** `FarmerHub.tsx`
- **Features Included:**
  1. **AI Crop Leaf Disease Scanner:**
     - Select crop (Paddy, Wheat, Sugarcane, Mustard, Potato, Cotton).
     - Upload or take a picture of affected leaf.
     - Vision AI diagnoses pathogens (e.g. Bacterial Leaf Blight, Yellow Rust, Early Blight) with confidence percentage.
     - Calculates exact chemical pesticide dosage per acre and organic/desi remedies (Neem kernel extract, sour buttermilk spray).
  2. **Pashu Doctor (Cattle Vet):**
     - Quick first-aid guide for cattle bloat, foot-and-mouth, and milk fever.
     - Direct dial to **1962** animal ambulance.
  3. **Live APMC Mandi Rates:**
     - Live modal price index for Wheat, Paddy (Basmati), Mustard, Sugarcane (SAP), Potato, and Ragi across regional mandis (Rampur, Sitapur, Mandya, Bareilly).
  4. **Canal Irrigation Water Schedule:**
     - Live roster showing feeder canal discharge in Cusecs and tail-end village water delivery status.
  5. **PM Fasal Bima Yojana (PMFBY) Claims:**
     - 72-hour mandatory intimation guide for unseasonal rain, hailstorm, or flood crop damage with toll-free **14447** instructions.

---

### Feature 9: Government Scheme Eligibility Co-Pilot
- **Route:** [`/schemes`](http://localhost:3000/schemes)
- **Features Included:**
  - Interactive 4-question household profile questionnaire:
    1. Agricultural landholding size (Marginal, Small, Medium/Large, Landless)
    2. Annual household income (< ₹1.5L, ₹1.5-3L, ₹3-5L, > ₹5L)
    3. Social / Caste category (OBC, SC, ST, General/EWS, Minority)
    4. Primary occupation (Farmer, Laborer, Artisan, Youth)
  - Instantly filters and matches Central & State schemes:
    - **PM-Kisan Samman Nidhi** (₹6,000 / year DBT)
    - **PM-KUSUM Solar Pumps** (Up to 90% subsidy)
    - **PM Awas Yojana - Gramin** (₹1,20,000 housing grant)
    - **Ayushman Bharat PM-JAY** (₹5,00,000 cashless hospitalization)
    - **PM Fasal Bima Yojana** (Subsidized crop insurance)
    - **MGNREGA** (100 days guaranteed wage employment)
  - Details required verification documents (Aadhaar, Land Khasra, Bank Passbook, Ration Card) with direct official portal links.

---

### Feature 10: Civic Asset & School Inspection Audit
- **Route:** [`/inspect`](http://localhost:3000/inspect)
- **Component:** `CivicAssetInspection.tsx`
- **Features Included:**
  - Tailored inspection checklists for:
    - 🏫 **Government Primary / Middle School:** Midday Meal hygiene, drinking water tap, separate toilets, classroom roof integrity, boundary wall, teacher attendance.
    - 🏥 **Primary Health Center (PHC):** Medical Officer attendance, essential medicines, antivenom stock, labor room, cold-chain vaccine fridge, bio-medical waste bins.
    - 💧 **Community Handpump / Tube-Well:** Continuous discharge, platform drainage, water clarity/odor test, motor grounding.
    - 🛣️ **Rural Road / Culvert (PMGSY):** Pothole depth, culvert parapet integrity, side shoulders, safety signboards.
    - 🛍️ **Fair Price Ration Shop (PDS):** Electronic weighing scale, foodgrain quality, daily stock board, e-PoS terminal.
  - **Camera with Live GPS & Timestamp Watermark:**
    - HTML5 Canvas embeds Inspector ID, Facility Name, Lat/Lng coordinates, and ISO timestamp directly into the photo pixels.
  - **Automatic Compliance Grading:** Calculates audit percentage and assigns Grade A (Excellent), B (Good), C (Needs Attention), or D (Critical Failure).
  - Submits directly to [`/api/inspections`](http://localhost:3000/api/inspections).

---

### Feature 11: Offline-First Architecture & Emergency Mesh Relay
- **Component:** `OfflineSyncProvider.tsx` (wrapped globally in root layout)
- **Simulator Route:** [`/mesh`](http://localhost:3000/mesh)
- **Features Included:**
  1. **Global Offline Sync Manager:**
     - Listens to browser network status (`navigator.onLine`).
     - Enqueues complaints and emergency requests in local storage when in cellular blackouts.
     - Displays persistent bottom badge: 🟢 "Online & Synced" or 🟡 "Offline Mode (X queued)".
     - Automatically flushes and syncs offline queue when network reconnects.
  2. **Peer-to-Peer Mesh Relay Simulator (`/mesh`):**
     - Simulates multi-hop emergency packet forwarding across 5 topological nodes:
       `Citizen Phone (0 Bars)` &rarr; `Handpump Solar Beacon (BLE)` &rarr; `Panchayat Hub (Wi-Fi)` &rarr; `Hilltop Repeater (LoRa)` &rarr; `Cloud Gateway (Satellite)`.
     - Interactive **"Broadcast SOS via Mesh"** button showing hop-by-hop traversal, latency, and encryption verification.
     - Click any node to simulate link failure and witness dynamic multi-path rerouting.

---

## 🗺️ 4. Complete Application Routes Directory

### Public & Citizen Routes
- `/` — Homepage with hero, live statistics, demo matrix, and quick links
- `/simple-mode` — High-contrast, large-touch accessibility portal
- `/farmer` — Agrarian Farmer Hub & Cattle Doctor
- `/schemes` — Welfare scheme eligibility questionnaire
- `/inspect` — Field officer civic asset & school audit
- `/mesh` — Disaster emergency mesh relay simulator
- `/emergency/triage` — Human CPR & cattle veterinary clinical triage
- `/threat-matrix` — Geospatial Command Center (MapTiler Heatmap & RAG Matrix)
- `/smart-complaint` — Multimodal AI vision photo complaint filing
- `/dispatch/simulator` — Real-time AI outbound phone calling sandbox
- `/services` — Directory of civil and emergency services
- `/faq` — Multilingual rural governance FAQ

### Authentication Routes
- `/login` — Passwordless Phone SMS / Email OTP login
- `/signup` — Citizen, Volunteer, or Worker registration
- `/auth/login` — Official auth alias
- `/auth/register` — Official registration alias

### Role-Protected Dashboards
- `/citizen/dashboard` — Personal complaints, timeline tracking, and GPS status
- `/citizen/new-request` — Standard ticket creation form
- `/citizen/request/[id]` — Universal 4-stage audit stepper & dispatch routing map
- `/worker/dashboard` — Assigned jobs, Open-Meteo weather widget, status actions
- `/volunteer/dashboard` — Live emergency queue, SOS siren listener, community pool
- `/authority/dashboard` — District triage matrix, worker dispatch, personnel approvals
- `/superadmin/dashboard` — State-wide HQ telemetry, authority provisioning, API diagnostics

### Backend API Endpoints
- `POST /api/auth/otp/send` — Dispatches SMS / Email OTP verification codes
- `POST /api/auth/otp/verify` — Validates OTP and issues JWT session cookie
- `POST /api/auth/login` — Traditional password authentication fallback
- `POST /api/auth/logout` — Clears authentication cookie
- `GET /api/auth/me` — Returns current authenticated user session
- `GET /api/complaints` — Lists and filters complaints
- `POST /api/complaints` — Submits new complaint ticket
- `GET /api/emergency/active-sos` — Queries critical incidents for emergency siren broadcast
- `POST /api/emergency/auto-dispatch` — Haversine great-circle proximity auto-dispatch
- `POST /api/emergency/heartbeat` — Records live responder GPS location
- `GET /api/emergency/sla-escalation` — Scans tickets for Day 0 &rarr; Day 2 &rarr; Day 5 SLA escalations
- `GET /api/gis/administrative-hierarchy` — Zero-dropdown spatial coordinate auto-resolution
- `GET /api/gis/cluster-detection` — Groups co-located incidents into root infrastructure failures
- `GET /api/inspections` — Lists past field audits
- `POST /api/inspections` — Records new audit with embedded GPS watermark
- `GET /api/threats` — Feeds infrastructure vulnerability threat matrix
- `GET /api/weather` — Real-time Open-Meteo rural weather forecasting
- `POST /api/ai/analyze-complaint` — Vision AI multimodal complaint auto-drafting
- `POST /api/ai/triage` — AI triage categorization engine

---

## 🧪 5. Verification & Testing

To run the full automated verification test suite, execute:
```bash
npx tsx scratch/verify-master-suite.ts
```
Expected output:
```text
==================================================
🧪 VANGUARD MASTER ARCHITECTURE VERIFICATION TEST
==================================================

[TEST 1] Human Clinical Triage (Cardiac / Code Red)...
  Severity: Code Red
  Priority Score: 98
  Requires Immediate SOS: true
  First Step: Check Responsiveness & Breathing

[TEST 2] Bovine / Cattle Emergency Triage (Bloat / Afra)...
  Patient Type: Bovine / Cattle Emergency (Pashu Swasthya)
  Severity: Code Red
  Priority Score: 95
  Step 1 Title: Immediate Anti-Bloat Intervention (Tympany / Afra)

[TEST 3] Haversine Distance Precision...
  Distance between Dhamora and Saifni: 27.7 km

[TEST 4] Civic Asset Inspection Grade Calculation...
  Score: 100%, Grade: A (Excellent)

==================================================
✅ ALL ARCHITECTURAL TESTS PASSED SUCCESSFULLY!
==================================================
```

To run the Next.js production build test:
```bash
npm run build
```
Result: All **48 static and dynamic routes** compile cleanly with **0 errors**.

---

## 📐 6. Modern Sidebar & Top Header Navigation Architecture

### The Alignment Problem Solved
Previously, over 15 links (Vision AI, AI Calling, Triage, Threat Matrix, Kisan Hub, Simple Mode, My Requests, Raise Request, Language Dropdown, User Badge, and Logout) were crammed horizontally into a single top navigation bar, causing text wrapping, misalignments, and overflow.

### The New Architecture
- **Persistent Collapsible Left Sidebar ([`AppShell.tsx`](file:///c:/Users/kathu/Downloads/VANGUARD_V2/VANGUARD-main/src/components/AppShell.tsx))**:
  - **Header:** VANGUARD Shield branding (clean logo, zero MVP clutter).
  - **Quick Action Buttons:** Direct high-visibility links for `🎙️ सरल मोड (Voice Mode)` and `🚨 Emergency Triage (SOS)`.
  - **User Workspace:** Dynamically adapts to active role (Citizen: My Requests & Raise Request; Worker: Assigned Jobs; Volunteer: Volunteer Hub; Authority: Authority Center; SuperAdmin: State HQ).
  - **AI & Emergency Hub:** Emergency Triage, Threat Matrix & Heatmap, Vision AI, AI Calling, Mesh Relay, plus interactive triggers for AI Guide, WhatsApp Simulator, and Regional AI Copilot.
  - **Rural Citizen Services:** सरल मोड, Kisan Hub, Schemes Co-Pilot, Asset Inspection.
  - **Information & Help:** Services Directory, FAQ.
  - **Sidebar Footer:** User profile card with avatar, role badge, district location, and one-click Logout.
  - **Collapsible Support:** Desktop toggle button (`PanelLeftClose` / `PanelLeftOpen`) smoothly transitions between full `w-64` and compact `w-20` icon mode.
  - **Mobile Support:** Smooth slide-out drawer with backdrop overlay.

- **Unified Floating Assistant Dock ([`FloatingAssistantDock.tsx`](file:///c:/Users/kathu/Downloads/VANGUARD_V2/VANGUARD-main/src/components/FloatingAssistantDock.tsx))**:
  - Positioned on `fixed bottom-5 right-4 sm:right-6 z-40` — completely clear of the left sidebar to prevent any UI overlaps.
  - Hosts `Guide by AI`, `WhatsApp Demo`, and `Regional AI Copilot` in a responsive flex dock.
  - Compact icon-only view on mobile phones, full interactive badges on desktop.

- **Minimalist Top Header (Language Only)**:
  - The top navbar is now exclusively reserved for the **Multi-Language Switcher (`<LanguageSwitcher />`)** and sidebar toggle, ensuring plenty of breathing room, zero horizontal scrolling, and crystal-clear alignment.


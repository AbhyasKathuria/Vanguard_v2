# VANGUARD V2 — Rural Governance & Emergency Ecosystem
## Complete User & Usage Guide

> 📖 **Comprehensive V2 Manual:** For full documentation on all newly deployed modules (Geospatial Command Center, 4-Tier Cattle Triage, Accessibility Simple Mode, Farmer Hub, Schemes Co-Pilot, GPS Watermarked Inspections, and Mesh Relay), see [VANGUARD_V2_USAGE_MANUAL.md](file:///c:/Users/kathu/Downloads/VANGUARD_V2/VANGUARD-main/VANGUARD_V2_USAGE_MANUAL.md).

---

## ⚡ 1-Click Startup & Interactive Runner

### Option 1: Fast Launch (`start.bat`)
Simply double-click **`start.bat`** in the project root directory. It automatically frees Port 3000, checks the SQLite database, starts Next.js, and opens **`http://localhost:3000`** in your browser.

### Option 2: Interactive Testing & Control Menu (`run_and_test.bat`)
Double-click **`run_and_test.bat`** to run automated verification tests, rebuild the production bundle, re-seed database fixtures, or launch the development server from an interactive menu.

---

## 🔑 Pre-Seeded Multi-District Demo Matrix

The application includes **1-Click Demo Login buttons** on the home page (`/`) and login page (`/login`). You can click any role button to log in immediately without typing passwords (default password: `password123`):

| Persona & District | Name & Role | Phone Number | Key Capabilities & Verification |
| :--- | :--- | :--- | :--- |
| **⚡ Super Admin (Global)** | Vikram Rao (Director) | `9876543200` | State-wide telemetry across 6 hubs, API health diagnostics, authority provisioning |
| **🏛️ Authority (Rampur UP)** | Amit District Officer | `9876543214` | Rampur triage matrix, manual worker dispatch, personnel verification manager |
| **🏛️ Authority (Mandya KA)** | Priya District Officer | `9876543201` | Mandya triage matrix, agricultural & irrigation canal dispatch |
| **👷 Worker (Rampur UP)** | Sunil Electrician | `9876543211` | Verified Electrician: civic tasks, storm safety alerts, on-site status updates |
| **👷 Worker (Mandya KA)** | Devraj Mason | `9876543220` | Verified Mason: irrigation canal repair, farming labor dispatch |
| **🤝 Volunteer (Rampur UP)** | Anita (Rural Care NGO) | `9876543213` | Verified Volunteer: emergency response, claim open community pool requests |
| **🤝 Volunteer (Shivamogga)** | Sowmya (Red Cross Rural) | `9876543223` | Verified Medic/Volunteer: trauma care, ambulance dispatch |
| **👨‍🌾 Citizen (Rampur UP)** | Ramesh Kumar (Hindi Native) | `9876543210` | Submit plain-text service requests, view Leaflet GIS map & helper trust card |
| **👨‍🌾 Citizen (Mandya KA)** | Basavaraj Gowda (Kannada) | `9876543216` | Submit farming requests in Kannada, track real-time resolution timeline |

---

## 🧭 Step-by-Step Live Demo Scenarios

### Scenario 1: Citizen Submits Request & Auto-Routing Assigns Worker
1. Open [http://localhost:3000](http://localhost:3000).
2. Click **"Citizen Demo (Ramesh Kumar)"**.
3. Click **"Raise New Request"**.
4. Select **"Civic / Infrastructure"** (Notice priority badge automatically maps to `MEDIUM`).
5. Choose District: **`Rampur`**, Location: **`Rampur Ward 4`** (or click **"GPS Pin"** for auto-detection).
6. Upload a site photo (optional) and describe: *"Streetlight cable snapped near village school pond."*
7. Click **"Submit & Route Request"**.
8. **Result**: The routing engine computes distance (< 15km), matches verified **Sunil Electrician**, sets status to **`ASSIGNED`**, and renders the **Leaflet GIS Map Pin View** connecting citizen and worker coordinates.

---

### Scenario 2: Field Worker Checks Weather & Resolves On-Site
1. Switch account to **"Sunil Electrician"** (`9876543211`).
2. On the Worker Dashboard (`/worker/dashboard`), view the live **Open-Meteo Weather Widget** (inspecting temperature and electrical storm advisories).
3. Inspect the citizen's photo attachment and location.
4. Click **"Start Work"** (status moves to `IN PROGRESS`).
5. Click **"Mark Complete"**, type resolution note (*"Replaced 40m insulated line and re-anchored pole safely"*), and submit (`RESOLVED`).

---

### Scenario 3: Super Admin State-Wide HQ & API Health Telemetry
1. Log in as **"Super Admin (Vikram Rao)"** (`9876543200`).
2. Navigate to **`/superadmin/dashboard`**.
3. Inspect aggregate metrics across all 6 districts:
   - **District Operations Breakdown**: Rampur, Sitapur, Mandya, Shivamogga, Kolar, Belagavi.
   - **Cross-District Requests Table**: Filter by district or search across the entire state.
   - **API Integrations Diagnostic Panel**: View live operational status for Geocoding, Open-Meteo Weather, SMS/OTP, WhatsApp Cloud, FCM Push, and Firebase Storage.
   - **Authority Management**: Click **"Add District Authority"** to provision a new commissioner account with 1 click.

---

### Scenario 4: WhatsApp Bot & In-Browser Simulator
1. Click the green floating **"WhatsApp Bot Demo"** button in the bottom right corner.
2. In the simulator, click preset **"1. Start Wizard (HI)"**.
3. Click preset **"2. Category (Civic)"** (sends `1`).
4. Click preset **"3. Issue Description"** (sends description).
5. Click preset **"4. Location (Rampur)"** (sends `Rampur`).
6. **Result**: The WhatsApp bot invokes the deterministic routing engine and returns a formal WhatsApp receipt with Request ID, Status, and Helper Phone!
7. Switch simulated sender to **Worker Sunil** and click preset **"6. Worker Done"** (sends `DONE <req_id> Wire secured`).
8. The request is immediately marked **`RESOLVED`** in the SQLite database and citizen timeline!

---

### Scenario 5: Universal Multi-Language Support (22+ Languages)
1. Use the **Dashboard Language Banner** or the **Language Switcher** in the top navigation bar.
2. Select any quick language (e.g. **हिन्दी**, **ಕನ್ನಡ**, **தமிழ்**, **తెలుగు**, **বাংলা**, **मराठी**, **Español**, **Français**, **العربية**, **Deutsch**) or click **"More (22+)..."** to search across all 22+ Indian and global languages.
3. The whole application (homepage, 2-minute tour, demo matrix, authentication, citizen portal, worker dashboard, authority hub, and audit timelines) instantly translates.
4. Your language preference is automatically synced to your `User.language` account profile!
5. In the **WhatsApp Bot**, greet in your language (e.g. `வணக்கம்`, `नमस्ते`, `ನಮಸ್ಕಾರ`, `Hola`, `Bonjour`) or text `LANG <code|name>` to chat entirely in your native language.

---

## 🛠️ Developer Commands & Extended Testing

```bash
# 1. Push database schema
npm run prisma:push

# 2. Seed multi-district test data
npm run prisma:seed

# 3. Run full 73-point automated integration test suite
npx tsx scratch/test_routing_and_roles.ts

# 4. Run production build
npm run build
```

---

## 🛡️ Key Architectural Guarantees
- **100% Deterministic**: Zero opaque ML/AI hallucinations in the core dispatch loop.
- **Hard Verification Gate**: Unverified or inactive workers are strictly blocked from auto-assignment.
- **Geometric GIS Radius**: Haversine distance calculations ensure dispatches stay within strict category limits.
- **Zero-Cloud Fallback**: All 6 API integrations degrade gracefully to safe offline/mock modes with zero external keys required.

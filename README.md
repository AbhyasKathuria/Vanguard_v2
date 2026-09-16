# VANGUARD — Rural Service Routing Platform

> **Core Concept**: A rural citizen submits a service request (health, civic, emergency, or farming) in plain text. The platform automatically maps category to priority, runs a deterministic rule-based routing algorithm to find the nearest available verified worker/volunteer via geometric GIS radius, and provides role-enforced dashboards with an audit timeline for every status transition.

---

## 🚀 Instant Quickstart & Demo Setup

### Prerequisites
- Node.js v18+ or v20+
- npm v10+

### 1. Install & Setup Database
```bash
# 1. Install dependencies
npm install

# 2. Push Prisma SQLite schema
npm run prisma:push

# 3. Seed demo accounts & multi-district workflow requests
npm run prisma:seed
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser or double-click `start.bat`.

---

## 🔑 Pre-Seeded Multi-District Demo Accounts (1-Click Login)

The home and login pages include **1-Click Demo Login buttons** for instant evaluation of all 5 platform roles across all 6 district hubs:

| Role & Hub | Name | Phone Number | Password | Verification Status & Scope |
| :--- | :--- | :--- | :--- | :--- |
| **⚡ Super Admin (Global)** | Officer Rajeshwar Rao | `9876543200` | `password123` | **Super Admin**: State-wide telemetry across 6 hubs, API health diagnostics, authority provisioning |
| **🏛️ Authority (Rampur UP)** | Officer Suresh Verma | `9876543213` | `password123` | **Authority**: Full triage matrix, manual dispatch, verify/revoke worker & volunteer credentials |
| **🏛️ Authority (Mandya KA)** | Officer Mallikarjun Patil | `9876543224` | `password123` | **Authority**: Mandya command center, agricultural canal & farming dispatch |
| **👷 Worker (Rampur UP)** | Sunil Electrician | `9876543211` | `password123` | **Verified Worker**: Receives auto-routed jobs in Rampur, storm safety alerts, updates status to *In Progress* / *Resolved* |
| **👷 Worker (Mandya KA)** | Devraj Mason | `9876543216` | `password123` | **Verified Worker**: Mason & canal repair, farming labor dispatch |
| **🤝 Volunteer (Rampur UP)** | Pooja Volunteer | `9876543212` | `password123` | **Verified Volunteer**: Receives emergency alerts in Rampur, claims open community pool tasks |
| **🤝 Volunteer (Shivamogga)**| Sowmya Red Cross | `9876543223` | `password123` | **Verified Volunteer**: Trauma & medical care assistance pool |
| **👨‍🌾 Citizen (Rampur UP)** | Ramesh Sharma | `9876543210` | `password123` | **Citizen**: Submit plain-text requests, inspect assigned helper trust card & live Leaflet GIS map |
| **👨‍🌾 Citizen (Mandya KA)** | Basavaraj Gowda | `9876543230` | `password123` | **Citizen**: Submit sugarcane & irrigation issues in Kannada, track real-time resolution timeline |
| **👷 Worker (Unverified)** | Manoj Plumber | `9876543214` | `password123` | **Unverified**: Gated by routing engine (skipped until Authority verifies in dashboard) |
| **🤝 Volunteer (Unverified)**| Vikas Volunteer | `9876543215` | `password123` | **Unverified**: Gated by routing engine in Sitapur until verified |

---

## 🌍 Universal Multi-Language Support (22+ Languages)

VANGUARD provides complete, full-interface localization and dynamic neural translation across:
- **13 Indian Languages**: English (`en`), Hindi (`hi`), Kannada (`kn`), Tamil (`ta`), Telugu (`te`), Bengali (`bn`), Marathi (`mr`), Gujarati (`gu`), Malayalam (`ml`), Punjabi (`pa`), Odia (`or`), Urdu (`ur`), Assamese (`as`).
- **9 Global Languages**: Spanish (`es`), French (`fr`), German (`de`), Arabic (`ar`), Portuguese (`pt`), Russian (`ru`), Swahili (`sw`), Chinese (`zh`), Japanese (`ja`).
- **1-Click Dashboard Banner & Search Modal**: Searchable language modal with native script recognition and instant dashboard switcher.
- **Multi-Lingual WhatsApp Bot**: Native greeting detection (`வணக்கம்` ➔ Tamil, `नमस्ते` ➔ Hindi, `ನಮಸ್ಕಾರ` ➔ Kannada, `Hola` ➔ Spanish).

---

## 🛡️ Verification Gate & Helper Trust Architecture

### 1. Verification Gate
- The routing engine queries candidate workers and volunteers matching `where: { availability: true, verified: true }`.
- Requests raised in areas where only unverified personnel exist (e.g. Sitapur) are skipped by the auto-router and left in `OPEN` status, queued for the Local Authority.
- Local Authorities can verify personnel with 1 click in `/authority/dashboard` under the **Manage Personnel Verification** tab, after which candidate matching activates.

### 2. Assigned Helper Trust Story
- On the Citizen Tracking page ([`/citizen/request/[id]`](file:///c:/Users/kathu/Desktop/projects/VANGUARD/src/app/citizen/request/[id]/page.tsx)), citizens see an **Assigned Service Handler** trust card displaying:
  - **Full Name** (`assignedTo.name`)
  - **Role Badge** (`Worker` or `Volunteer`)
  - **Profession / Organization** (`Electrician`, `Rural Care NGO`)
  - **Direct Contact Link** (`tel:...`) to call the handler directly.

---

## 🧪 Automated E2E Integration Test Suite

Run the full automated test suite:
```bash
npx tsx scratch/test_routing_and_roles.ts
```
**73 / 73 assertions passing (100% Success Rate)** across all 12 test suites:
- Priority Mapping (5)
- Verified Worker Auto-Routing (3)
- Verification Gate Test (3)
- Dynamic Authority Verification Effect (2)
- Request Lifecycle & Trust Card Profile Exposure (8)
- Geolocation & Nearest-Candidate Radius Matching (5)
- Out-of-Radius Candidate Gating (2)
- Super Admin System Role & Cross-District Query (3)
- External API Integrations with Zero-Key Fallbacks (8)
- WhatsApp Bot Webhook Flow (8)
- Base Language i18n Dictionaries (6)
- Universal Multi-Language Support & Translation Gateway (20)

---

## 📄 Documentation Reference

- **[`OFFICIAL_DOCUMENTATION.md`](file:///c:/Users/kathu/Desktop/projects/VANGUARD/OFFICIAL_DOCUMENTATION.md)**: Full 15-section system architecture specification.
- **[`USAGE_GUIDE.md`](file:///c:/Users/kathu/Desktop/projects/VANGUARD/USAGE_GUIDE.md)**: Step-by-step evaluation guide and WhatsApp testing instructions.
- **[`CHANGELOG.md`](file:///c:/Users/kathu/Desktop/projects/VANGUARD/CHANGELOG.md)**: Chronological milestone release log.

---

## 📄 License
MIT License

# VANGUARD Development Changelog

This changelog records milestone progress, architectural enhancements, and development decisions for the VANGUARD Rural Service Routing Platform.

---

## [Phase 1] - Schema & Multi-District Data Foundation
- **Super Admin Role**: Added `super_admin` to user roles with system-wide oversight, cross-district stats, and authority account management capabilities.
- **Geographic Schema Extension**: Added `district`, `latitude`, `longitude`, `active`, and `attachmentUrl` fields across `User`, `WorkerProfile`, `VolunteerProfile`, and `Request` models in `prisma/schema.prisma`.
- **Rich Multi-District Seed Dataset**: Expanded `prisma/seed.ts` with 6 realistic geographic hubs (Rampur, Sitapur, Mandya, Shivamogga, Kolar, Belagavi), workers across diverse skilled trades (Electrician, Plumber, Mason/Irrigation, Solar Specialist, Carpenter), volunteers across registered NGOs (Rural Care NGO, Gram Seva Trust, Red Cross Rural, Sitapur Youth Club), and complete request lifecycles.
- **Verification Integrity**: Preserved 100% test passing rate on existing 21-point integration suite.

## [Phase 2] - Geocoding & Radius-Based Nearest Candidate Routing
- **Haversine Distance Matching**: Implemented real geometric distance calculations (`calculateDistanceKm`) in `src/lib/geo.ts`.
- **Category Radius Configuration**: Configured category-specific maximum dispatch radii (Emergency: 30km, Health: 20km, Farming: 25km, Civic/Other: 15km).
- **Hard Verification Gate**: Candidate sorting by nearest distance strictly applies *after* verifying `availability: true` and `verified: true`.
- **Graceful Fallbacks**: OpenStreetMap Nominatim resolver with in-memory rural coordinates cache and automatic fallback to string matching for un-geocoded areas.
- **Interactive GIS Map Component**: Created `MapPinView` with Leaflet & OpenStreetMap tiles displaying citizen pin, helper pin, connection line, and radius circle.
- **Integration Test Expansion**: Extended `scratch/test_routing_and_roles.ts` from 21 to 31 assertions covering distance ranking, out-of-radius gating, and super admin privileges (100% passing).

## [Phase 3] - External API Integrations (5+) with Graceful Degradation
- **Open-Meteo Weather Service**: Integrated live meteorological data (`src/lib/integrations/weather.ts`) with agricultural advisories, precipitation risk flags, and safe offline simulation. Added `/api/weather` endpoint.
- **Pluggable OTP Verification**: Created multi-provider authentication adapter (`src/lib/integrations/otp.ts`) supporting Mock development mode (zero config), Twilio SMS, and MSG91.
- **WhatsApp Cloud API Dispatcher**: Built Meta Graph API messaging client (`src/lib/integrations/whatsapp.ts`) with template formatting and development logger.
- **Firebase Push & Storage**: Implemented FCM notification dispatcher (`src/lib/integrations/notifications.ts`) and media upload service (`src/lib/integrations/storage.ts`) with Base64 data-URL fallback.
- **Integration Health Checker**: Added `checkAllIntegrationsHealth` in `src/lib/integrations/health.ts` providing real-time diagnostics on all 6 integrations.
- **Test Suite Extended**: Added Test Suite 9 in `scratch/test_routing_and_roles.ts`, bringing total passed assertions to 39.

## [Phase 4] - WhatsApp Bot Integration & Webhook Handler
- **Meta Cloud API Webhook**: Implemented `/api/webhook/whatsapp` with GET token challenge verification and POST message parsing.
- **Multi-Step Conversational State Machine**: Guided WhatsApp citizen triage wizard (Category Selection ➔ Issue Description ➔ Village Location ➔ Deterministic Routing Dispatch).
- **Worker Remote Updates**: Enabled WhatsApp SMS commands for field workers (`START <req_id>`, `DONE <req_id> [note]`, `STATUS <req_id>`) that update the SQLite database and audit trail in real time.
- **In-Browser Interactive Simulator**: Built `src/components/WhatsAppSimulator.tsx` allowing instant zero-setup demonstration with quick presets and live message dispatch.
- **Test Suite Extended**: Added Test Suite 10 with 8 new assertions verifying end-to-end bot request creation, deterministic routing, and worker resolution via WhatsApp (47 assertions passed).

## [Phase 5] - Multi-Language i18n Support (English, Hindi, Kannada)
- **Typed Localization Dictionaries**: Created complete dictionaries in English (`src/lib/i18n/dictionaries/en.ts`), Hindi (`hi.ts`), and Kannada (`kn.ts`) covering all app navigation, form labels, role dashboards, and category explanations.
- **Language Context & Hook**: Built `LanguageProvider` and `useLanguage()` (`src/lib/i18n/context.tsx`) with client persistence and automatic syncing to `User.language` via PATCH `/api/user/language`.
- **Global Language Switcher**: Added accessible `LanguageSwitcher` dropdown component into main navigation bar.
- **Test Suite Extended**: Added Test Suite 11 in `scratch/test_routing_and_roles.ts` verifying all 3 localized dictionaries and category translations (53 assertions passed).

## [Phase 6] - UI/UX & Dashboard Pass & Super Admin Command Center
- **Super Admin Command Center**: Created `/superadmin/dashboard` with multi-district telemetry, resolution rates, API integration diagnostics, and district authority credentials management.
- **Authority Lifecycle API**: Added `/api/superadmin/authorities` for creating and suspending district authority accounts.
- **Live Weather & Disaster Telemetry**: Built `WeatherWidget.tsx` integrating Open-Meteo temperature, condition, wind, and field advisories across Citizen, Worker, Volunteer, and Authority dashboards.
- **Photo Attachments**: Added photo upload with live preview and base64 encoding to citizen request form and helper task cards.
- **GPS Coordinates Auto-Detection**: Integrated browser Geolocation API with manual district picker in request form.

## [Phase 7] - Brand Logo, Services Directory & FAQ Knowledge Base
- **Brand SVG Logo**: Created `VanguardLogo.tsx` representing rural routing shield, geo-nodes, and civic infrastructure.
- **Services Directory**: Built `/services` page detailing specifications, SLAs, dispatch radii, and qualifications for all 5 standard rural categories with comparison matrix.
- **Interactive FAQ Knowledge Base**: Built `/faq` page featuring categorized accordions and instant live search answering core architectural, security, and low-bandwidth questions.

## [Phase 8] - Demo Matrix & Guided Tour Evaluation Mode
- **Multi-District 1-Click Demo Launcher**: Expanded `DemoLoginButtons.tsx` covering all 5 roles across multiple districts (Super Admin, 3 Local Authorities, 3 Skilled Workers, 3 NGO Volunteers, and 3 Multi-lingual Citizens) with district hub filtering.
- **2-Minute Evaluator Guided Tour**: Created `GuidedTour.tsx` with an interactive 6-step workflow guiding evaluators through the complete request creation, auto-routing, worker resolution, authority triage, and WhatsApp bot channels.

## [Phase 9] - Full Verification, Extended Documentation & Release Delivery
- **System Documentation**: Completely updated `OFFICIAL_DOCUMENTATION.md` with 15 comprehensive technical sections covering the 5-role matrix, mathematical radius routing, external API adapters with graceful fallbacks, WhatsApp bot state machine, and multi-lingual architecture.
- **User & Evaluator Guide**: Updated `USAGE_GUIDE.md` with 5 step-by-step walkthrough scenarios, developer commands, and key architectural guarantees.
- **Extended Test Suite**: Completed 11 test suites in `scratch/test_routing_and_roles.ts` with 53/53 assertions passing (100% success rate).
- **Zero-Config Production Build**: Verified complete Next.js compilation, database migration push, and multi-district seed hydration.

## [Phase 10] - Universal Multi-Language Support (22+ Languages) & Groq AI Expansion
- **Universal Multi-Language Registry**: Added `src/lib/i18n/languages.ts` registering 13 Indian languages (Hindi, Kannada, Tamil, Telugu, Bengali, Marathi, Gujarati, Malayalam, Punjabi, Odia, Urdu, Assamese, English) and 9 global languages (Spanish, French, German, Arabic, Portuguese, Russian, Swahili, Chinese, Japanese).
- **Searchable Language Selector Modal**: Built `LanguageSelectorModal.tsx` supporting search across native scripts and country regions.
- **1-Click Dashboard Language Switcher**: Embedded `DashboardLanguageBanner.tsx` across Citizen, Worker, Volunteer, Authority, and Super Admin dashboards.
- **100% Full-Site Interface Localization**: Replaced all hardcoded text across homepage, 2-minute guided tour, demo matrix, login/signup forms, and request tracking views with dynamic locale bindings.
- **Multi-Lingual WhatsApp Webhook Engine**: Auto-detection of language greetings (`வணக்கம்`, `नमस्ते`, `ನಮಸ್ಕಾರ`, `Hola`, `Bonjour`) and localized reply templates.
- **Groq AI Multi-Key Rotation Pool**: Added multi-key failover and rotation in `src/lib/groq.ts` powering the VanguardBot FAQ assistant and Neural Translator.
- **Automated Test Suite Expansion**: Added Test Suite 12 to `scratch/test_routing_and_roles.ts`, scaling verified assertions from 53 to 73 (100% pass rate).

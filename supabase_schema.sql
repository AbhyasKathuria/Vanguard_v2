-- ==============================================================================
-- VANGUARD SUPABASE POSTGRESQL MIGRATION SCHEMA
-- Production-Ready RBAC, Profiles Sync Trigger, RLS Policies & Indexes
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('citizen', 'volunteer', 'authority', 'higher_authority', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE complaint_urgency AS ENUM ('Low', 'Moderate', 'High', 'Critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('pending', 'assigned', 'in_progress', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT UNIQUE,
    email TEXT UNIQUE,
    role user_role NOT NULL DEFAULT 'citizen',
    language TEXT NOT NULL DEFAULT 'en',
    location TEXT NOT NULL DEFAULT 'Rampur',
    district TEXT NOT NULL DEFAULT 'Rampur',
    avatar_url TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    is_online BOOLEAN NOT NULL DEFAULT false,
    last_known_lat DOUBLE PRECISION,
    last_known_lng DOUBLE PRECISION,
    last_heartbeat TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Geospatial Indexes for live proximity querying
CREATE INDEX IF NOT EXISTS idx_profiles_geo_online ON public.profiles(is_online, last_known_lat, last_known_lng) WHERE is_online = true;

-- 4. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Infrastructure', 'Public Safety', 'Sanitation', 'Animal Welfare', 'Medical'
    urgency complaint_urgency NOT NULL DEFAULT 'Moderate',
    urgency_reasoning TEXT,
    description TEXT NOT NULL,
    detected_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_authority TEXT,
    risk_score INTEGER NOT NULL DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
    location TEXT NOT NULL,
    district TEXT NOT NULL DEFAULT 'Rampur',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    media_url TEXT,
    status task_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TASK ASSIGNMENTS TABLE (Complaints ↔ Volunteers relation)
CREATE TABLE IF NOT EXISTS public.task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status task_status NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium',
    notes TEXT,
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. VULNERABILITIES TABLE (Civic Threat Matrix)
CREATE TABLE IF NOT EXISTS public.vulnerabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    threat_score DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    population_density TEXT NOT NULL DEFAULT 'Market Hub',
    affected_estimate INTEGER NOT NULL DEFAULT 500,
    time_to_decay_days INTEGER NOT NULL DEFAULT 30,
    decay_factor DOUBLE PRECISION NOT NULL DEFAULT 1.25,
    location TEXT NOT NULL,
    district TEXT NOT NULL DEFAULT 'Rampur',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    mitigation_plan TEXT,
    reported_by TEXT DEFAULT 'AI Threat Engine',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CALL LOGS TABLE (AI Dispatch Telephony)
CREATE TABLE IF NOT EXISTS public.call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caller_name TEXT,
    caller_phone TEXT,
    scenario_title TEXT NOT NULL,
    urgency TEXT NOT NULL,
    status TEXT NOT NULL,
    transcript_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    dispatch_unit TEXT,
    estimated_eta TEXT,
    location TEXT,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TRIAGE LOGS TABLE (Emergency First-Response)
CREATE TABLE IF NOT EXISTS public.triage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'human' or 'veterinary'
    patient_type TEXT,
    symptoms TEXT NOT NULL,
    severity TEXT NOT NULL,
    priority_score INTEGER NOT NULL DEFAULT 50,
    vital_signs JSONB,
    first_aid_protocol TEXT NOT NULL,
    matched_services JSONB,
    dispatched_sos BOOLEAN NOT NULL DEFAULT false,
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 9. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_district ON public.profiles(district);
CREATE INDEX IF NOT EXISTS idx_complaints_district ON public.complaints(district);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_urgency ON public.complaints(urgency);
CREATE INDEX IF NOT EXISTS idx_task_assignments_volunteer ON public.task_assignments(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_complaint ON public.task_assignments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_status ON public.task_assignments(status);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_district ON public.vulnerabilities(district);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triage_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch request user's role
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are readable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- COMPLAINTS POLICIES
CREATE POLICY "Complaints are readable by all authenticated users"
ON public.complaints FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Citizens and volunteers can create complaints"
ON public.complaints FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR public.get_auth_role() IN ('citizen', 'volunteer', 'admin'));

CREATE POLICY "Authorities and admins can update all complaints"
ON public.complaints FOR UPDATE
TO authenticated
USING (public.get_auth_role() IN ('authority', 'higher_authority', 'admin') OR auth.uid() = user_id);

-- TASK ASSIGNMENTS POLICIES
CREATE POLICY "Task assignments readable by authenticated users"
ON public.task_assignments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Volunteers can claim and update tasks assigned to them"
ON public.task_assignments FOR UPDATE
TO authenticated
USING (volunteer_id = auth.uid() OR public.get_auth_role() IN ('authority', 'higher_authority', 'admin'));

CREATE POLICY "Authorities can assign tasks"
ON public.task_assignments FOR INSERT
TO authenticated
WITH CHECK (public.get_auth_role() IN ('authority', 'higher_authority', 'admin'));

-- VULNERABILITIES & LOGS POLICIES
CREATE POLICY "Vulnerabilities readable by all authenticated"
ON public.vulnerabilities FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Vulnerabilities manageable by authorities and admins"
ON public.vulnerabilities FOR ALL
TO authenticated
USING (public.get_auth_role() IN ('authority', 'higher_authority', 'admin'));

CREATE POLICY "Call and Triage logs readable by authorities and admins"
ON public.call_logs FOR SELECT
TO authenticated
USING (public.get_auth_role() IN ('authority', 'higher_authority', 'admin'));

CREATE POLICY "Triage logs readable by authorities and admins"
ON public.triage_logs FOR SELECT
TO authenticated
USING (public.get_auth_role() IN ('authority', 'higher_authority', 'admin'));

-- ==============================================================================
-- 11. AUTOMATED ON_AUTH_USER_CREATED TRIGGER
-- Syncs Supabase auth.users directly into public.profiles upon signup
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role user_role := 'citizen';
    meta_role TEXT;
BEGIN
    -- Check user metadata for requested role
    meta_role := new.raw_user_meta_data->>'role';
    IF meta_role IN ('citizen', 'volunteer', 'authority', 'higher_authority', 'admin') THEN
        default_role := meta_role::user_role;
    END IF;

    INSERT INTO public.profiles (
        id,
        name,
        phone,
        email,
        role,
        language,
        location,
        district
    ) VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', 'Citizen'),
        COALESCE(new.phone, new.raw_user_meta_data->>'phone', null),
        COALESCE(new.email, new.raw_user_meta_data->>'email', null),
        default_role,
        COALESCE(new.raw_user_meta_data->>'language', 'en'),
        COALESCE(new.raw_user_meta_data->>'location', 'Rampur'),
        COALESCE(new.raw_user_meta_data->>'district', 'Rampur')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 9. HAVERSINE GEOSPATIAL PROXIMITY DISPATCH FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_closest_online_responder(
    incident_lat DOUBLE PRECISION,
    incident_lng DOUBLE PRECISION,
    max_radius_km DOUBLE PRECISION DEFAULT 10.0
)
RETURNS TABLE (
    responder_id UUID,
    responder_name TEXT,
    responder_phone TEXT,
    responder_role user_role,
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS responder_id,
        p.name AS responder_name,
        p.phone AS responder_phone,
        p.role AS responder_role,
        (
            6371 * acos(
                LEAST(1.0, GREATEST(-1.0, 
                    cos(radians(incident_lat)) * cos(radians(p.last_known_lat)) *
                    cos(radians(p.last_known_lng) - radians(incident_lng)) +
                    sin(radians(incident_lat)) * sin(radians(p.last_known_lat))
                ))
            )
        ) AS distance_km
    FROM public.profiles p
    WHERE p.role IN ('volunteer', 'worker')
      AND p.is_online = true
      AND p.last_known_lat IS NOT NULL
      AND p.last_known_lng IS NOT NULL
      AND (
          6371 * acos(
              LEAST(1.0, GREATEST(-1.0,
                  cos(radians(incident_lat)) * cos(radians(p.last_known_lat)) *
                  cos(radians(p.last_known_lng) - radians(incident_lng)) +
                  sin(radians(incident_lat)) * sin(radians(p.last_known_lat))
              ))
          )
      ) <= max_radius_km
    ORDER BY distance_km ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 10. ADMINISTRATIVE GIS HIERARCHY & RURAL CIVIC INFRASTRUCTURE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.administrative_divisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  block TEXT NOT NULL,
  panchayat TEXT NOT NULL,
  village TEXT NOT NULL,
  boundary_geom geometry(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Complaints / Grievance Table Extension
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('Emergency', 'Urgent', 'High', 'Normal')) DEFAULT 'Normal';
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS village TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS panchayat TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS block TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS escalation_level INT DEFAULT 0; -- 0: Panchayat, 1: Block, 2: District
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS cluster_id UUID;

-- Inspection Records
CREATE TABLE IF NOT EXISTS public.inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES public.profiles(id),
  facility_type TEXT CHECK (facility_type IN ('school', 'phc', 'water_source', 'road', 'ration_shop')),
  checklist_data JSONB NOT NULL,
  evidence_photos TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Village Health Score Aggregate View
CREATE OR REPLACE VIEW public.village_health_scores AS
SELECT 
  village,
  panchayat,
  block,
  COUNT(*) FILTER (WHERE category = 'Water' AND status != 'Resolved') AS open_water_issues,
  COUNT(*) FILTER (WHERE category = 'Electricity' AND status != 'Resolved') AS open_power_issues,
  COUNT(*) FILTER (WHERE category = 'Health' AND status != 'Resolved') AS open_health_issues,
  COUNT(*) FILTER (WHERE category = 'Roads' AND status != 'Resolved') AS open_road_issues,
  COUNT(*) FILTER (WHERE priority = 'Emergency' AND status != 'Resolved') AS critical_emergencies
FROM public.complaints
GROUP BY village, panchayat, block;

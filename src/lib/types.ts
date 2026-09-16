export type UserRole =
  | "citizen"
  | "worker"
  | "authority"
  | "higher_authority"
  | "volunteer"
  | "admin"
  | "super_admin";

export type RequestCategory = "health" | "civic" | "emergency" | "farming" | "other";

export type RequestPriority = "low" | "medium" | "high";

export type RequestStatus = "open" | "assigned" | "in_progress" | "resolved";

export type TaskStatus = "pending" | "assigned" | "in_progress" | "resolved";

export interface TaskAssignmentItem {
  id: string;
  complaintId: string;
  volunteerId?: string | null;
  status: TaskStatus;
  priority: string;
  notes?: string | null;
  acceptedAt?: string | Date | null;
  completedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  volunteer?: {
    id: string;
    name: string;
    phone: string;
  } | null;
  complaint?: ComplaintItem | null;
}

export interface RouteOption {
  id: string;
  name: string;
  distanceKm: number;
  durationMinutes: number;
  summary: string;
  coordinates: [number, number][]; // [lat, lng]
  color: string;
}

export interface JWTPayload {
  userId: string;
  name: string;
  phone: string;
  role: UserRole;
  location: string;
  district?: string;
}

export interface UserSession {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  language: string;
  location: string;
  district?: string;
  active?: boolean;
  workerProfile?: {
    profession: string;
    availability: boolean;
    location: string;
    district?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    verified: boolean;
  } | null;
  volunteerProfile?: {
    organization: string;
    area: string;
    district?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    availability: boolean;
    verified: boolean;
  } | null;
}

// ----------------------------------------------------------------------
// AI Multimodal Vision Complaint Types
// ----------------------------------------------------------------------
export type ComplaintCategory =
  | "Infrastructure"
  | "Public Safety"
  | "Sanitation"
  | "Animal Welfare"
  | "Medical"
  | "Medical Emergency"
  | "Water Supply"
  | "Disaster Relief";

export type ComplaintUrgency = "Low" | "Moderate" | "High" | "Critical";

export interface VisionAnalysisResult {
  title: string;
  category: ComplaintCategory;
  urgency: ComplaintUrgency;
  urgencyReasoning: string;
  description: string;
  detectedTags: string[];
  recommendedAuthority: string;
  riskScore: number; // 0 - 100
  hazardFeatures?: string[];
  suggestedAction?: string;
}

export interface ComplaintItem {
  id: string;
  userId?: string | null;
  title: string;
  category: string;
  urgency: string;
  urgencyReasoning?: string | null;
  description: string;
  detectedTags: string; // JSON array or comma separated
  recommendedAuthority?: string | null;
  riskScore: number;
  location: string;
  district: string;
  latitude?: number | null;
  longitude?: number | null;
  mediaUrl?: string | null;
  status: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

// ----------------------------------------------------------------------
// Vulnerability & Civic Threat Matrix Types
// ----------------------------------------------------------------------
export type VulnerabilitySeverity = "Critical" | "High" | "Moderate" | "Low";

export interface VulnerabilityItem {
  id: string;
  title: string;
  category: "Structural" | "Electrical" | "Hydrological" | "Environmental" | "Traffic" | string;
  severity: VulnerabilitySeverity | string;
  threatScore: number; // 0 - 100 base score
  populationDensity: "Dense Urban" | "Market Hub" | "Residential" | "Rural Hamlet" | string;
  affectedEstimate: number;
  timeToDecayDays: number;
  decayFactor: number;
  location: string;
  district: string;
  latitude: number;
  longitude: number;
  status: "active" | "mitigated" | "inspecting" | string;
  mitigationPlan?: string | null;
  reportedBy?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  computedRiskIndex?: number;
}

// ----------------------------------------------------------------------
// AI Calling Dispatch Simulator Types
// ----------------------------------------------------------------------
export interface CallTranscriptMessage {
  id?: string;
  speaker: "agent" | "caller" | "system";
  text: string;
  timestamp: string;
}

export interface CallScenario {
  id: string;
  title: string;
  category: string;
  urgency: "Critical" | "High" | "Moderate";
  iconName: string;
  description: string;
  callerName: string;
  callerLocation: string;
  initialCallerAudioText: string;
  recommendedUnit: string;
  simulatedConversation: { caller: string; agent: string }[];
  suggestedUserResponses?: string[];
}

export interface CallLogItem {
  id: string;
  callerName?: string | null;
  callerPhone?: string | null;
  scenarioTitle: string;
  urgency: string;
  status: string;
  transcriptJson: string;
  dispatchUnit?: string | null;
  estimatedEta?: string | null;
  location?: string | null;
  durationSeconds: number;
  createdAt: string | Date;
}

// ----------------------------------------------------------------------
// Dual Emergency Triage Types
// ----------------------------------------------------------------------
export type TriageDomain = "human" | "veterinary";

export type TriageCode = "Code Red" | "Code Orange" | "Code Yellow" | "Code Green";

export interface EmergencyFacility {
  id: string;
  name: string;
  type: "Hospital" | "PHC" | "NGO Animal Shelter" | "Veterinary Hospital" | "Wildlife Rescue";
  location: string;
  district: string;
  phone: string;
  distanceKm: number;
  availableAmbulance: boolean;
  operatingHours: string;
}

export interface TriageEvaluation {
  domain: TriageDomain;
  patientType: string;
  severity: TriageCode;
  priorityScore: number; // 0 - 100
  dangerSigns: string[];
  firstAidSteps: {
    step: number;
    title: string;
    detail: string;
    warning?: string;
  }[];
  matchedFacilities: EmergencyFacility[];
  requiresImmediateSos: boolean;
  disclaimer: string;
}


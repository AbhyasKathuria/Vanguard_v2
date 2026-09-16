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
  language?: string;
  location: string;
  district?: string;
  citizenProfile?: string | null;
  subRole?: string | null;
  wardScope?: string | null;
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
  citizenProfile?: string | null;
  subRole?: string | null;
  wardScope?: string | null;
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

// ----------------------------------------------------------------------
// Phase 2 Unified Engine Types
// ----------------------------------------------------------------------

export type ScamRiskLevel = "High Risk" | "Suspicious" | "Needs Verification" | "Likely Legitimate";

export interface ScamCheckResult {
  riskLevel: ScamRiskLevel;
  riskScore: number; // 0 to 100 (0=safe, 100=extreme risk)
  hedgedSummary: string;
  matchedIndicators: string[];
  safetyRecommendations: string[];
  verifiedOfficialChannels?: string[];
}

export interface SchemeItem {
  id: string;
  code: string;
  name: string;
  department: string;
  category: string;
  description: string;
  benefits: string;
  eligibilityCriteria: string; // JSON string
  requiredDocuments: string; // JSON string
  applicationUrl?: string | null;
  helpline?: string | null;
  active: boolean;
}

export interface SchemeEligibilityCheck {
  age?: number;
  annualIncome?: number;
  landHoldingAcres?: number;
  gender?: "female" | "male" | "other" | "any";
  occupation?: string;
  category?: string;
  state?: string;
}

export interface AssetItem {
  id: string;
  name: string;
  category: string;
  department: string;
  location: string;
  district: string;
  latitude?: number | null;
  longitude?: number | null;
  condition: "good" | "needs_repair" | "critical_failure";
  qrCode?: string | null;
  installationDate?: string | Date | null;
  lastInspectedAt?: string | Date | null;
  complaintsCount?: number;
  activeComplaints?: any[];
}

export interface ProjectFundItem {
  id: string;
  projectCode: string;
  projectName: string;
  department: string;
  district: string;
  allocatedAmount: number;
  spentAmount: number;
  completionPercent: number;
  contractorName?: string | null;
  startDate?: string | Date | null;
  targetEndDate?: string | Date | null;
  status: "proposed" | "in_progress" | "completed" | "delayed";
  isDiscrepancyFlagged: boolean;
  discrepancyNote?: string | null;
}

export interface BloodRequestItem {
  id: string;
  patientName: string;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  units: number;
  hospitalName: string;
  location: string;
  district: string;
  contactPhone: string;
  urgency: "emergency" | "urgent" | "routine";
  status: "pending" | "matched" | "fulfilled" | "cancelled";
  matchedDonorsCount?: number;
  createdAt: string | Date;
}

export interface SafeLineIntakePayload {
  anonymousCode?: string;
  category: "Domestic Abuse" | "Harassment" | "Child Welfare" | "Stalking" | "Immediate Danger" | "Counseling";
  urgency: "Critical" | "High" | "Moderate";
  description: string;
  safeContactMethod?: string;
  safeContactNumber?: string;
  location?: string;
  district?: string;
  requiresDiscreetCallback?: boolean;
}

export interface TimelineItem {
  id: string;
  complaintId: string;
  stage: string;
  status: string;
  notes?: string | null;
  actorRole: string;
  actorName?: string | null;
  createdAt: string | Date;
}


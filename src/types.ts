export type UrgencyLevel = 'emergency' | 'within_24_hours' | 'routine_visit' | 'self_care';

export type UserRole = 'patient' | 'doctor';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  specialty?: string;
  department?: string;
  licenseNumber?: string;
  age?: number;
  gender?: string;
  phone?: string;
}

export interface DoctorPatientCase {
  id: string;
  caseId: string;
  patientName: string;
  age: number;
  gender: string;
  timestamp: string;
  urgencyLevel: UrgencyLevel;
  severity: number;
  symptoms: string;
  duration: string;
  medicalHistory: string[];
  redFlagFired: boolean;
  status: 'pending_review' | 'in_consultation' | 'completed' | 'transferred';
  sbar: SBARHandover;
}

export interface PatientProfile {
  symptoms: string;
  duration: string;
  severity: number; // 1-10
  age: number;
  gender: string;
  medicalHistory: string[];
  currentMedications: string;
  language: string;
  redFlagChecklist: {
    chestPainPressure: boolean;
    shortnessOfBreath: boolean;
    facialDroopSpeechSlur: boolean;
    suddenSevereHeadache: boolean;
    coughingVomitingBlood: boolean;
    anaphylaxisSigns: boolean;
  };
}

export interface PossibleCause {
  condition: string;
  probability: 'High' | 'Moderate' | 'Low';
  description: string;
  whySuspected: string;
}

export interface TriageResult {
  urgencyLevel: UrgencyLevel;
  urgencyTitle: string;
  confidenceScore: number;
  safetyDowngradeApplied: boolean;
  safetyDowngradeReason?: string | null;
  redFlagTriggered: boolean;
  matchedRedFlags: string[];
  jargonFreeExplanation: string;
  urgencyRationale: string;
  possibleCauses: PossibleCause[];
  immediateInstructions: string[];
  homeCareTips: string[];
  warningSignsToWatch: string[];
  recommendedSpecialist: string;
  suggestedTimeframe: string;
  suggestedCareType: string;
  timestamp?: string;
}

export interface SBARHandover {
  caseId: string;
  timestamp: string;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  pertinentPositives: string[];
  pertinentNegatives: string[];
  telehealthUrgency: 'High' | 'Medium' | 'Low';
  estimatedWaitMinutes: number;
}

export interface Clinic {
  id: string;
  name: string;
  type: 'Trauma & Emergency' | 'Urgent Care' | 'Primary Care Clinic' | 'Community Health Center';
  distance: string;
  address: string;
  phone: string;
  openHours: string;
  is24x7: boolean;
  estimatedWaitMinutes: number;
  rating: number;
  suitableFor: UrgencyLevel[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  quickReplies?: string[];
}

export interface TriageFeedback {
  rating: number; // 1-5
  anxietyReduced: boolean;
  clarityRating: number; // 1-5
  actionPlanClear: boolean;
  comments: string;
  timestamp: string;
}

export type NavigationTab = 
  | 'welcome'
  | 'clinic-flow'
  | 'home'
  | 'consultation'
  | 'live-sign'
  | 'upload-video'
  | 'learn-sasl'
  | 'clinic-map'
  | 'staff-view';

// ==========================================
// CLINIC SESSION & CONTINUITY OF CARE TYPES
// ==========================================

export interface PractitionerProfile {
  name?: string;
  practisingNumber?: string; // e.g. HPCSA or SANC number
  role?: string;
  facilityId?: string;
}

export interface PatientVisit {
  id: string;
  date: string; // e.g. "12 August 2026"
  practitionerName: string;
  practisingNumber?: string;
  reason: string; // e.g. "Pain", "Follow-up", "Hypertension check"
  location?: string; // e.g. "Left side", "Chest", "Abdomen"
  notes: string; // Relevant clinical notes from previous consultation
  vitalSummary?: string;
  prescriptions?: string[];
  status?: 'completed' | 'in_progress';
}

export interface PatientProfile {
  id: string; // Patient folder / reference number e.g. "WC-8924"
  fullName: string;
  dateOfBirth: string; // e.g. "1991-05-18"
  contactNumber: string;
  preferredLanguage: string; // e.g. "South African Sign Language (SASL)", "isiXhosa", "English", "Afrikaans"
  visits: PatientVisit[];
  clinicConsentGranted: boolean;
  clinicConsentTimestamp?: string;
}

export interface ClinicSession {
  id: string;
  practitioner: PractitionerProfile;
  patient: PatientProfile;
  // Not collected at check-in — the practitioner determines this
  // together with the patient during the consultation itself.
  todayReason?: string;
  todayLocation?: string;
  todayNotes?: string;
  startTime: string;
  facilityId: string;
  status: 'active' | 'completed';
}

export type ConsultationMode = 'two-way' | 'patient-sign' | 'patient-read';

export type SpeechLanguage = 'auto' | 'en-ZA' | 'xh-ZA' | 'zu-ZA' | 'af-ZA';

export interface ConsultationMessage {
  id: string;
  sender: 'patient' | 'healthcare';
  text: string;
  timestamp: string;
  source: 'sasl' | 'speech' | 'manual';
  confidence?: number;
  signLabel?: string;
  urgent?: boolean;
}

export type TranslationState = 
  | 'ready'       // "I'm ready — start signing"
  | 'detecting'   // "Watching for signs..."
  | 'found'       // "I UNDERSTOOD: [translated sentence]"
  | 'unclear'     // "I'm not sure I understood that. Please sign again."
  | 'confirmed';  // "✓ Translation confirmed"

export interface TranscriptEntry {
  id: string;
  label: string;
  timestamp: string;
  confidence: number;
  confirmed?: boolean;
}

export interface RecognitionResult {
  label: string;
  conf: number;
  timestamp?: number;
}

export type AppMode = 'live' | 'upload';

export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
}

export interface SASLSignData {
  id: string;
  word: string;
  category: 'calendar' | 'clinic' | 'everyday' | 'phrases';
  description: string;
  visualTip: string;
  verified: boolean;
  level: number;
  illustrationSvg?: string;
}

export interface LearningProgress {
  level: number;
  completedSignIds: string[];
  totalScore: number;
  gamesPlayed: number;
  accuracy: number;
}

export interface MatchSignQuestion {
  id: string;
  signId: string;
  word: string;
  hint: string;
  visualDescription: string;
  options: string[];
  correctAnswer: string;
}

export interface CompletePhraseQuestion {
  id: string;
  phraseTemplate: string;
  missingWord: string;
  options: string[];
  contextMeaning: string;
}

export interface ClinicDestination {
  id: string;
  name: string;
  signName: string;
  iconName: string;
  zone: string;
  floor: string;
  directions: string[];
  signTip: string;
}

export interface StaffCommunication {
  id: string;
  patientMessage: string;
  timestamp: string;
  status: 'pending' | 'acknowledged' | 'in_consultation' | 'completed';
  urgent: boolean;
  staffNotes?: string;
}

export interface AnonymizedTrainingSample {
  id: string;
  timestamp: string;
  signPrompt: string;
  predictedLabel: string;
  userConfirmed: boolean;
  landmarksSampleCount: number;
  consentGranted: boolean;
  reviewStatus: 'pending_review' | 'approved' | 'rejected';
}

export interface POPIAConsentState {
  hasAnswered: boolean;
  allowModelImprovement: boolean;
  timestamp?: string;
}

// ==========================================
// SASL COMMUNITY HUB TYPES
// ==========================================

export type ProvinceType = 
  | 'Western Cape'
  | 'Gauteng'
  | 'KwaZulu-Natal'
  | 'Eastern Cape'
  | 'Free State'
  | 'Limpopo'
  | 'Mpumalanga'
  | 'North West'
  | 'Northern Cape'
  | 'National / Pan-SA';

export type HandshapeType = 
  | 'Open Palm (5)'
  | 'Fist (A/S)'
  | 'Index Point (1)'
  | 'V-Shape (2)'
  | 'Flat B'
  | 'Bent O / Cup (C)'
  | 'Pinch / O'
  | 'Thumbs Up (A+)'
  | 'Claw (5-bent)'
  | 'ILY / Horns';

export type BodyLocationType = 
  | 'Forehead'
  | 'Face / Chin'
  | 'Chest / Torso'
  | 'Shoulder'
  | 'Hands / Neutral Space'
  | 'Wrist / Arm';

export type MovementType = 
  | 'Circular'
  | 'Repeated'
  | 'Up / Down'
  | 'Side to Side'
  | 'Forward / Outward'
  | 'Stationary / Hold';

export interface SASLCommunityVote {
  common: number;     // e.g. "Common in my region"
  olderGen: number;   // e.g. "Older generation"
  slang: number;      // e.g. "Slang / Modern"
  total: number;
  userVote?: 'common' | 'olderGen' | 'slang';
}

export interface SASLRegionalSign {
  id: string;
  conceptName: string;
  province: ProvinceType;
  city?: string;
  originFacility?: string;
  context: 'Everyday' | 'Slang & Pop Culture' | 'Technology & Social Media' | 'Healthcare' | 'Work & School' | 'Transport';
  description: string;
  handshape: HandshapeType;
  location: BodyLocationType;
  movement: MovementType;
  tags: string[];
  votes: SASLCommunityVote;
  contributor: {
    name: string;
    province: string;
    isDeafNative?: boolean;
    badge?: string;
  };
  durationSeconds: number;
  videoIllustrationText?: string;
  otherRegionalVariations?: {
    province: ProvinceType;
    variationNote: string;
  }[];
  reported?: boolean;
  createdAt: string;
}

export interface HealthcareFacility {
  id: string;
  name: string;
  type: 'Public Hospital' | 'Community Health Centre' | 'District Clinic' | 'Day Hospital';
  province: ProvinceType;
  city: string;
  address: string;
  phone: string;
  whatsapp?: string;
  openingHours: string;
  services: string[];
  accessibility: {
    saslInterpreter: 'On-Site Available' | 'On-Call Scheduled' | 'Video Relay Only';
    videoRelay: boolean;
    visualQueue: boolean;
    smsBooking: boolean;
    wheelchair: boolean;
  };
  verifiedDeafFriendly: boolean;
  notes?: string;
}

export interface HealthcareEvent {
  id: string;
  title: string;
  facilityId: string;
  facilityName: string;
  province: ProvinceType;
  city: string;
  date: string;
  time: string;
  location: string;
  category: 'Screening Drive' | 'Awareness Day' | 'Deaf Health Workshop' | 'Mobile Clinic' | 'Maternal & Child Health' | 'General Health';
  description: string;
  accessibilityInfo: string;
  saslSupport: string;
  rsvpCount: number;
  isRegistered?: boolean;
  imageUrl?: string;
}

export interface ClinicNotice {
  id: string;
  facilityId: string;
  title: string;
  category: 'Queue Update' | 'Service Notice' | 'Interpreter On-Duty' | 'Health Campaign' | 'Urgent Notice';
  message: string;
  timestamp: string;
  isUrgent?: boolean;
}

export interface AppointmentPrepCard {
  id: string;
  topic: string;
  category: 'Vitals' | 'Symptoms & Pain' | 'Medication' | 'Patient Rights' | 'Emergency';
  keyQuestion: string;
  saslTip: string;
  steps: string[];
  commonMistakeTip: string;
}

export interface SASLChallengePrompt {
  id: string;
  type: 'classifier_nmf' | 'speed_relay';
  title: string;
  prompt: string;
  scenarioDescription: string;
  timeLimitSeconds: number;
  focusElements: string[];
  category: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Fluent Signer';
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  challengeTitle: string;
  signerName: string;
  signerCity: string;
  province: ProvinceType;
  timestamp: string;
  durationSeconds: number;
  ratings: {
    clarity: number;        // out of 5
    storytelling: number;   // out of 5
    expression: number;     // out of 5 (facial / NMF)
    naturalness: number;    // out of 5
    totalReviews: number;
  };
  userVoted?: boolean;
  reported?: boolean;
}

export interface CommunityMemberProfile {
  name: string;
  province: ProvinceType;
  isNativeSigner: boolean;
  points: number;
  streakDays: number;
  completedChallengesCount: number;
  submittedSignsCount: number;
  peerReviewsGivenCount: number;
  badges: {
    id: string;
    title: string;
    icon: string;
    description: string;
    unlocked: boolean;
  }[];
}


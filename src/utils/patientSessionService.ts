import type { PatientProfile, PatientVisit, ClinicSession, PractitionerProfile } from '../types';

const PATIENTS_STORAGE_KEY = 'khona_clinic_patients_records_v1';
const ACTIVE_SESSION_STORAGE_KEY = 'khona_active_clinic_session_v1';

// Initial pre-configured returning patients for the Western Cape 4-clinic pilot
const INITIAL_PILOT_PATIENTS: PatientProfile[] = [
  {
    id: 'WC-8924',
    fullName: 'Sipho Khumalo',
    dateOfBirth: '1988-04-14',
    contactNumber: '+27 72 456 7890',
    preferredLanguage: 'South African Sign Language (SASL)',
    clinicConsentGranted: true,
    clinicConsentTimestamp: '2026-08-12T08:30:00Z',
    visits: [
      {
        id: 'visit-8924-1',
        date: '12 August 2026',
        practitionerName: 'Dr. N. Dlamini',
        practisingNumber: 'HPCSA MP-072891',
        reason: 'Acute Sharp Pain',
        location: 'Left abdomen / flank',
        notes: 'Patient presented with 3-day sharp localized pain on left side, aggravated by movement. Vitals BP 128/82. Palpation showed mild tenderness. Prescribed anti-inflammatory and ordered routine urine dipstick. Scheduled follow-up in 1 week.',
        vitalSummary: 'BP: 128/82 mmHg | Pulse: 74 bpm | Temp: 36.6°C',
        prescriptions: ['Ibuprofen 400mg TDS', 'Paracetamol 1g PRN'],
        status: 'completed',
      },
      {
        id: 'visit-8924-2',
        date: '19 August 2026',
        practitionerName: 'Sr. B. Mthembu',
        practisingNumber: 'SANC 14892210',
        reason: 'Follow-up — Left side pain review',
        location: 'Left abdomen / flank',
        notes: 'Follow-up review. Patient signed that pain severity decreased by approximately 70%. Mild residual stiffness remaining in morning. Urinalysis clear. Advised gentle stretching, finish prescription course, return if symptoms flare up.',
        vitalSummary: 'BP: 122/78 mmHg | Pulse: 70 bpm | Temp: 36.5°C',
        prescriptions: ['Paracetamol 500mg as needed'],
        status: 'completed',
      },
    ],
  },
  {
    id: 'WC-4190',
    fullName: 'Zola Ntloko',
    dateOfBirth: '1974-11-23',
    contactNumber: '+27 83 901 2345',
    preferredLanguage: 'South African Sign Language (SASL)',
    clinicConsentGranted: true,
    clinicConsentTimestamp: '2026-07-15T09:15:00Z',
    visits: [
      {
        id: 'visit-4190-1',
        date: '15 July 2026',
        practitionerName: 'Dr. K. Van Wyk',
        practisingNumber: 'HPCSA MP-061142',
        reason: 'Chronic Diabetes & Hypertension Review',
        location: 'General / Metabolic',
        notes: 'Routine 6-month chronic review. Fasting blood glucose 6.4 mmol/L, HbA1c stable at 6.8%. Foot examination normal with intact sensation. Renewed 6-month chronic script for clinic pharmacy collection.',
        vitalSummary: 'BP: 134/84 mmHg | Glucose: 6.4 mmol/L | Weight: 78 kg',
        prescriptions: ['Metformin 850mg BD', 'Amlodipine 5mg Daily', 'Enalapril 10mg Daily'],
        status: 'completed',
      },
    ],
  },
  {
    id: 'WC-6032',
    fullName: 'Anathi Adams',
    dateOfBirth: '1995-02-09',
    contactNumber: '+27 61 234 5678',
    preferredLanguage: 'South African Sign Language (SASL)',
    clinicConsentGranted: true,
    clinicConsentTimestamp: '2026-08-05T10:00:00Z',
    visits: [
      {
        id: 'visit-6032-1',
        date: '05 August 2026',
        practitionerName: 'Sister F. Jacobs (Midwife)',
        practisingNumber: 'SANC 19283411',
        reason: 'Antenatal Checkup — 28 Weeks',
        location: 'Obstetrics / Maternal',
        notes: 'Routine 28-week antenatal ultrasound check. Symphysis fundal height 28cm, fetal heart rate 142 bpm regular. Blood pressure within normal limits. Discussed birth plan and SASL interpreter standby for delivery.',
        vitalSummary: 'BP: 116/74 mmHg | FHR: 142 bpm | SFH: 28 cm',
        prescriptions: ['Ferrous Sulphate 200mg Daily', 'Folic Acid 5mg Daily', 'Calcium Carbonate 500mg BD'],
        status: 'completed',
      },
    ],
  },
];

/**
 * Patient Continuity of Care Service
 */
export const getStoredPatients = (): PatientProfile[] => {
  try {
    const raw = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read patients records:', err);
  }
  return INITIAL_PILOT_PATIENTS;
};

export const saveStoredPatients = (patients: PatientProfile[]) => {
  try {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
  } catch (err) {
    console.error('Failed to persist patients records:', err);
  }
};

const PRACTITIONER_STORAGE_KEY = 'khona_clinic_practitioner_profile_v1';

export const DEFAULT_PRACTITIONER: PractitionerProfile = {
  name: 'Dr. N. Dlamini',
  practisingNumber: 'HPCSA MP-072891',
  role: 'Attending Medical Officer',
  facilityId: 'clinic-groote-schuur',
};

export const getStoredPractitioner = (): PractitionerProfile => {
  try {
    const raw = localStorage.getItem(PRACTITIONER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read practitioner profile:', err);
  }
  return DEFAULT_PRACTITIONER;
};

export const saveStoredPractitioner = (profile: PractitionerProfile) => {
  try {
    localStorage.setItem(PRACTITIONER_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to persist practitioner profile:', err);
  }
};

/**
 * Authenticates/identifies a patient by Folder Number (e.g. WC-8924), Phone number, or Name
 */
export const authenticatePatient = (identifier: string): PatientProfile | null => {
  const clean = identifier.trim().toLowerCase();
  if (!clean) return null;
  const patients = getStoredPatients();
  
  const match = patients.find(
    (p) =>
      p.id.toLowerCase() === clean ||
      p.id.toLowerCase().replace(/[^a-z0-9]/g, '') === clean.replace(/[^a-z0-9]/g, '') ||
      p.contactNumber.replace(/\D/g, '').endsWith(clean.replace(/\D/g, '')) && clean.replace(/\D/g, '').length >= 6 ||
      p.fullName.toLowerCase() === clean ||
      p.fullName.toLowerCase().includes(clean)
  );

  return match || null;
};

export const searchPatients = (query: string): PatientProfile[] => {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];
  const patients = getStoredPatients();
  return patients.filter(
    (p) =>
      p.id.toLowerCase().includes(clean) ||
      p.fullName.toLowerCase().includes(clean) ||
      p.dateOfBirth.includes(clean) ||
      p.contactNumber.replace(/\s+/g, '').includes(clean.replace(/\s+/g, ''))
  );
};

export const registerNewPatient = (newPatient: Omit<PatientProfile, 'id' | 'visits'>): PatientProfile => {
  const patients = getStoredPatients();
  const nextId = `WC-${Math.floor(1000 + Math.random() * 9000)}`;
  const patient: PatientProfile = {
    ...newPatient,
    id: nextId,
    visits: [],
  };
  const updated = [patient, ...patients];
  saveStoredPatients(updated);
  return patient;
};

export const saveActiveSession = (session: ClinicSession) => {
  try {
    localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to save active clinic session:', err);
  }
};

export const getActiveSession = (): ClinicSession | null => {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to get active clinic session:', err);
  }
  return null;
};

export const clearActiveSession = () => {
  try {
    localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear active clinic session:', err);
  }
};

export const recordConsultationToPatientHistory = (
  patientId: string,
  session: ClinicSession,
  consultationSummaryNotes: string,
  prescriptionsList?: string[]
): PatientProfile | null => {
  const patients = getStoredPatients();
  const patientIndex = patients.findIndex((p) => p.id === patientId);
  if (patientIndex === -1) return null;

  const targetPatient = patients[patientIndex];
  const todayFormatted = new Intl.DateTimeFormat('en-ZA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const newVisit: PatientVisit = {
    id: `visit-${targetPatient.id}-${targetPatient.visits.length + 1}`,
    date: todayFormatted,
    practitionerName: session.practitioner.name || 'Attending Practitioner',
    practisingNumber: session.practitioner.practisingNumber,
    reason: session.todayReason || 'Clinic Consultation',
    location: session.todayLocation || 'Consultation Room',
    notes: consultationSummaryNotes.trim() || session.todayNotes || 'Consultation completed successfully via KHONA SASL assistant.',
    prescriptions: prescriptionsList || [],
    status: 'completed',
  };

  const updatedVisits = [...targetPatient.visits, newVisit];
  const updatedPatient: PatientProfile = {
    ...targetPatient,
    visits: updatedVisits,
  };

  patients[patientIndex] = updatedPatient;
  saveStoredPatients(patients);
  return updatedPatient;
};

export const recordCompletedConsultation = (
  patientId: string,
  reason: string,
  notes: string,
  location?: string,
  prescriptions?: string[]
): PatientProfile | null => {
  const active = getActiveSession();
  if (active) {
    return recordConsultationToPatientHistory(patientId, active, notes, prescriptions);
  }

  const dummySession: ClinicSession = {
    id: `session-${Date.now()}`,
    practitioner: {
      name: 'Medical Officer',
      practisingNumber: 'HPCSA Verified',
      role: 'Attending Practitioner',
      facilityId: 'clinic-mapongwana-khayelitsha',
    },
    patient: {
      id: patientId,
      fullName: 'Patient',
      dateOfBirth: '',
      contactNumber: '',
      preferredLanguage: 'SASL',
      clinicConsentGranted: true,
      visits: [],
    },
    todayReason: reason,
    todayLocation: location || 'Consultation Room',
    todayNotes: notes,
    startTime: new Date().toISOString(),
    facilityId: 'clinic-mapongwana-khayelitsha',
    status: 'completed',
  };

  return recordConsultationToPatientHistory(patientId, dummySession, notes, prescriptions);
};


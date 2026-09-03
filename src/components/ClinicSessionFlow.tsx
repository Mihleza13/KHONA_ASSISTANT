import React, { useState } from 'react';
import { 
  Stethoscope, 
  User, 
  UserPlus, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Lock,
  AlertCircle,
  Building2
} from 'lucide-react';
import type { 
  PatientProfile, 
  ClinicSession, 
  PractitionerProfile 
} from '../types';
import { 
  WESTERN_CAPE_PILOT_CLINICS 
} from '../data/communityData';
import { 
  registerNewPatient, 
  saveActiveSession,
  authenticatePatient,
  getStoredPractitioner,
  saveStoredPractitioner
} from '../utils/patientSessionService';
import { LanguageSelector } from './LanguageSelector';
import { useTheme } from '../theme/ThemeContext';
import { KhonaLogo } from './KhonaLogo';

interface ClinicSessionFlowProps {
  onStartConsultation: (session: ClinicSession) => void;
  onCancel: () => void;
}

type AuthView = 'identify' | 'register' | 'intake' | 'practitioner_settings';

export const ClinicSessionFlow: React.FC<ClinicSessionFlowProps> = ({
  onStartConsultation,
  onCancel,
}) => {
  const { isDark } = useTheme();

  // Practitioner State (persisted / editable)
  const [practitioner, setPractitioner] = useState<PractitionerProfile>(() => getStoredPractitioner());
  const [editPractitionerName, setEditPractitionerName] = useState(practitioner.name || 'Dr. N. Dlamini');
  const [editPractisingNumber, setEditPractisingNumber] = useState(practitioner.practisingNumber || 'HPCSA MP-072891');
  const [editRole, setEditRole] = useState(practitioner.role || 'Attending Medical Officer');
  const [selectedFacilityId, setSelectedFacilityId] = useState(practitioner.facilityId || 'clinic-groote-schuur');

  // Sub-view
  const [authView, setAuthView] = useState<AuthView>('identify');

  // Patient identification
  const [identifierInput, setIdentifierInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);

  // New patient registration form state
  const [newFullName, setNewFullName] = useState<string>('');
  const [newDob, setNewDob] = useState<string>('');
  const [newContact, setNewContact] = useState<string>('');
  const [newLanguage, setNewLanguage] = useState<string>('South African Sign Language (SASL)');

  const currentFacility = 
    WESTERN_CAPE_PILOT_CLINICS.find((c) => c.id === selectedFacilityId) || WESTERN_CAPE_PILOT_CLINICS[0];

  // Handle Patient Authentication check (secure, no public patient listing)
  const handleIdentifySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);

    const query = identifierInput.trim();
    if (!query) {
      setAuthError('Please enter your patient folder number or phone number');
      return;
    }

    const matched = authenticatePatient(query);
    if (matched) {
      setSelectedPatient(matched);
      setAuthView('intake');
    } else {
      setAuthError(`No record found for "${query}". Please check the folder number or register as a new patient.`);
    }
  };

  // Handle New Patient Registration
  const handleCreateNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newDob.trim()) {
      setAuthError('Full name and date of birth are required');
      return;
    }

    const created = registerNewPatient({
      fullName: newFullName.trim(),
      dateOfBirth: newDob,
      contactNumber: newContact.trim() || '072 000 0000',
      preferredLanguage: newLanguage,
      clinicConsentGranted: true,
      clinicConsentTimestamp: new Date().toISOString(),
    });

    setSelectedPatient(created);
    setAuthView('intake');
  };

  // Save Practitioner changes
  const handleSavePractitioner = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PractitionerProfile = {
      name: editPractitionerName.trim() || 'Medical Staff',
      practisingNumber: editPractisingNumber.trim() || 'HPCSA / SANC',
      role: editRole.trim() || 'Attending Medical Officer',
      facilityId: selectedFacilityId,
    };
    setPractitioner(updated);
    saveStoredPractitioner(updated);
    setAuthView('identify');
  };

  // Launch Active Consultation
  const handleLaunchConsultation = () => {
    if (!selectedPatient) return;

    const session: ClinicSession = {
      id: `clinic_sess_${Date.now()}`,
      practitioner: practitioner,
      patient: selectedPatient,
      // Reason for the visit is not asked at check-in. The practitioner
      // establishes this with the patient once the consultation begins.
      startTime: new Date().toISOString(),
      facilityId: selectedFacilityId,
      status: 'active',
    };

    saveActiveSession(session);
    onStartConsultation(session);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-4 sm:p-8 transition-colors duration-200 ${
      isDark ? 'bg-[#090d14] text-white' : 'bg-[#f8fafc] text-zinc-900'
    }`}>
      {/* Top Header Bar */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              isDark 
                ? 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white' 
                : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 shadow-2xs'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Welcome</span>
          </button>
          <KhonaLogo variant="compact" size="sm" showTagline={false} />
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelector variant="compact" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto w-full flex-1 pt-4 pb-6">
        {/* VIEW 1: PATIENT IDENTIFICATION / SECURE SIGN-IN */}
        {authView === 'identify' && (
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 transition-all ${
            isDark ? 'bg-[#101722] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            {/* Attending Practitioner Status Header */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
              isDark ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-100 text-zinc-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-xs font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>
                    {practitioner.name || 'Dr. N. Dlamini'}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-medium">
                    {currentFacility.name} • {practitioner.practisingNumber}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAuthView('practitioner_settings')}
                className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Title & Prompt */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Clinic check-in
              </h1>
              <p className={`text-xs sm:text-sm font-normal mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Enter your patient folder number or phone number to begin.
              </p>
            </div>

            {/* Patient Identification Input Form */}
            <form onSubmit={handleIdentifySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                  Patient folder number or phone
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 z-10" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. WC-8924 or 072 458 9120"
                    value={identifierInput}
                    onChange={(e) => {
                      setIdentifierInput(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    className={`khona-input-pill !pl-10 ${
                      isDark 
                        ? '!bg-zinc-900 !border-zinc-800 !text-white placeholder-zinc-500' 
                        : '!bg-zinc-50 !border-zinc-200 !text-zinc-900 placeholder-zinc-400'
                    }`}
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Continue Button */}
              <button
                type="submit"
                className="khona-btn-primary mt-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Link to Register New Patient */}
            <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-normal">New patient at this clinic?</span>
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setAuthView('register');
                }}
                className="font-semibold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register new record</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: REGISTER NEW PATIENT */}
        {authView === 'register' && (
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 transition-all ${
            isDark ? 'bg-[#101722] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  New patient profile
                </h2>
                <p className="text-xs text-zinc-500 font-normal">
                  Create a secure patient record for SASL healthcare
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateNewPatient} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Full legal name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lindiwe Nkosi"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Date of birth
                  </label>
                  <input
                    type="date"
                    required
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Contact phone number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 072 123 4567"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Communication & language preference
                </label>
                <select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                  }`}
                >
                  <option value="South African Sign Language (SASL)">South African Sign Language (SASL)</option>
                  <option value="isiXhosa">isiXhosa</option>
                  <option value="English">English</option>
                  <option value="Afrikaans">Afrikaans</option>
                  <option value="isiZulu">isiZulu</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAuthView('identify')}
                  className="text-xs text-zinc-400 hover:text-white font-semibold cursor-pointer"
                >
                  ← Back to check-in
                </button>

                <button
                  type="submit"
                  className="khona-btn-primary !w-auto px-6 py-3 text-xs"
                >
                  Create record
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 3: INTAKE & TODAY'S VISIT */}
        {authView === 'intake' && selectedPatient && (
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 transition-all ${
            isDark ? 'bg-[#101722] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            {/* Authenticated Patient Identification Pill */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  isDark ? 'bg-zinc-800 text-cyan-400' : 'bg-zinc-100 text-cyan-600'
                }`}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-100">{selectedPatient.fullName}</span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 dark:bg-zinc-100 text-cyan-400 dark:text-cyan-700">
                      #{selectedPatient.id}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 font-normal mt-0.5">
                    {selectedPatient.preferredLanguage} • {selectedPatient.visits.length} past visits on file
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedPatient(null);
                  setAuthView('identify');
                }}
                className="text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Switch
              </button>
            </div>

            {/* Ready to begin — no pre-consultation symptom questions.
                What brings the patient in is established with the
                practitioner once the consultation starts. */}
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">
                Ready to begin
              </h2>
              <p className="text-xs text-zinc-500 font-normal">
                {practitioner.name} · {currentFacility.name}
              </p>
            </div>

            {/* Launch Consultation Button */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSelectedPatient(null);
                  setAuthView('identify');
                }}
                className="text-xs text-zinc-400 hover:text-white font-semibold cursor-pointer"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleLaunchConsultation}
                className="khona-btn-primary !w-auto px-6"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Start consultation</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: PRACTITIONER SETTINGS */}
        {authView === 'practitioner_settings' && (
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 transition-all ${
            isDark ? 'bg-[#101722] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Medical practitioner setup
                </h2>
                <p className="text-xs text-zinc-500 font-normal">
                  Configure attending healthcare practitioner and facility
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePractitioner} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Practitioner name
                </label>
                <input
                  type="text"
                  required
                  value={editPractitionerName}
                  onChange={(e) => setEditPractitionerName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    HPCSA / SANC registration
                  </label>
                  <input
                    type="text"
                    required
                    value={editPractisingNumber}
                    onChange={(e) => setEditPractisingNumber(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Clinical role
                  </label>
                  <input
                    type="text"
                    required
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Healthcare facility
                </label>
                <select
                  value={selectedFacilityId}
                  onChange={(e) => setSelectedFacilityId(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                  }`}
                >
                  {WESTERN_CAPE_PILOT_CLINICS.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name} ({facility.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAuthView('identify')}
                  className="text-xs text-zinc-400 hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="khona-btn-primary !w-auto px-6 py-3 text-xs"
                >
                  Save profile
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer Security Badge */}
      <footer className="max-w-xl mx-auto w-full text-center text-xs text-zinc-500 flex items-center justify-center gap-1.5 py-2">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
        <span>POPIA Certified • Confidential Patient Consultation</span>
      </footer>
    </div>
  );
};

export default ClinicSessionFlow;

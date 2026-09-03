import React from 'react';
import { 
  ShieldCheck, 
  LogOut, 
  Stethoscope, 
  Globe, 
  Phone
} from 'lucide-react';
import type { ClinicSession, PatientProfile, POPIAConsentState } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface PatientProfileViewProps {
  patient: PatientProfile;
  activeSession?: ClinicSession | null;
  popiaConsent: POPIAConsentState;
  onOpenPrivacy: () => void;
  onOpenHelp: () => void;
  onSignOut: () => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patient,
  activeSession,
  onOpenPrivacy,
  onSignOut,
}) => {
  const { isDark } = useTheme();

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24 md:pb-12 animate-in fade-in duration-200">
      {/* Header Profile Card */}
      <div className={`p-6 rounded-2xl border space-y-4 ${
        isDark ? 'bg-[#101722] border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-2xs'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500 text-black flex items-center justify-center font-bold text-lg shrink-0">
            {patient.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {patient.fullName}
              </h1>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              DOB: {patient.dateOfBirth} • Preferred: {patient.preferredLanguage}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className={`p-3.5 rounded-xl border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs ${
          isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-cyan-500 shrink-0" />
            <div>
              <span className="text-zinc-400 text-[10px] uppercase font-medium block">Contact</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{patient.contactNumber}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-cyan-500 shrink-0" />
            <div>
              <span className="text-zinc-400 text-[10px] uppercase font-medium block">Communication</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{patient.preferredLanguage}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attending Clinical Team */}
      {activeSession && (
        <div className={`p-5 rounded-2xl border space-y-2.5 ${
          isDark ? 'bg-[#101722] border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-2xs'
        }`}>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
            <Stethoscope className="w-4 h-4" />
            <span>Attending medical officer</span>
          </div>

          <div className="text-sm font-semibold text-zinc-900 dark:text-white">
            {activeSession.practitioner.name}
          </div>
          <div className="text-xs text-zinc-500">
            {activeSession.practitioner.role} • Groote Schuur Hospital
          </div>
        </div>
      )}

      {/* Privacy & POPIA Rights */}
      <div className={`p-5 rounded-2xl border space-y-2.5 ${
        isDark ? 'bg-[#101722] border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-2xs'
      }`}>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Patient privacy & POPIA compliance</span>
        </div>

        <p className="text-xs text-zinc-500 font-normal">
          Your sign language video stream is processed in real time and is never stored without clinical consent.
        </p>

        <button
          type="button"
          onClick={onOpenPrivacy}
          className="text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline pt-1 cursor-pointer block"
        >
          Manage privacy preferences →
        </button>
      </div>

      {/* Sign Out / Exit Session */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSignOut}
          className={`w-full p-3.5 rounded-xl border font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isDark 
              ? 'bg-zinc-900/80 border-zinc-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30' 
              : 'bg-white border-zinc-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-2xs'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out / Return to welcome screen</span>
        </button>
      </div>
    </div>
  );
};

export default PatientProfileView;

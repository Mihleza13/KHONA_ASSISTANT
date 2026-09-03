import React from 'react';
import {
  Calendar,
  Stethoscope,
  Pill,
  MessageSquare,
} from 'lucide-react';
import type { ClinicSession, PatientProfile } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface PatientVisitsViewProps {
  patient: PatientProfile;
  activeSession?: ClinicSession | null;
  onStartConsultation: () => void;
}

export const PatientVisitsView: React.FC<PatientVisitsViewProps> = ({
  patient,
  activeSession,
  onStartConsultation,
}) => {
  const { isDark } = useTheme();

  const cardBase = isDark
    ? 'bg-[#12161d] border-zinc-800 text-white'
    : 'bg-white border-zinc-200 text-zinc-900';

  return (
    <div className="max-w-md mx-auto w-full px-5 py-6 space-y-5 pb-28 md:pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Visits</h1>
        <p className="text-xs text-zinc-500 font-normal mt-0.5">
          {patient.visits.length} previous {patient.visits.length === 1 ? 'consultation' : 'consultations'}
        </p>
      </div>

      {/* Active Today Visit Banner if present */}
      {activeSession && (
        <button
          type="button"
          onClick={onStartConsultation}
          className={`w-full text-left p-4 rounded-2xl border flex items-center gap-3 transition-colors cursor-pointer ${cardBase} ${
            isDark ? 'hover:bg-[#171c25]' : 'hover:bg-zinc-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isDark ? 'bg-zinc-800 text-cyan-400' : 'bg-zinc-100 text-cyan-600'
          }`}>
            <MessageSquare className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">In progress</span>
            </div>
            <div className="text-sm font-semibold truncate mt-0.5">
              {activeSession.todayReason || "Today's visit"}
            </div>
            <div className="text-xs text-zinc-500 truncate">
              {activeSession.practitioner.name}
            </div>
          </div>
        </button>
      )}

      {/* Timeline of Past Visits */}
      <div className="space-y-2.5">
        {patient.visits.length === 0 ? (
          <div className={`p-6 text-center rounded-2xl border text-zinc-500 text-xs ${cardBase}`}>
            No previous consultation records yet.
          </div>
        ) : (
          [...patient.visits].reverse().map((visit, index) => (
            <div
              key={visit.id || index}
              className={`p-4 rounded-2xl border space-y-2.5 ${cardBase}`}
            >
              {/* Top meta */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{visit.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-normal">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>{visit.practitionerName}</span>
                </div>
              </div>

              {/* Reason */}
              <div>
                <div className="text-sm font-semibold">{visit.reason}</div>
                {visit.location && (
                  <div className="text-xs text-zinc-500 mt-0.5">{visit.location}</div>
                )}
              </div>

              {/* Notes */}
              {visit.notes && (
                <div className={`p-3 rounded-xl text-xs font-normal leading-relaxed ${
                  isDark ? 'bg-zinc-900/70 text-zinc-300' : 'bg-zinc-50 text-zinc-700'
                }`}>
                  {visit.notes}
                </div>
              )}

              {/* Prescriptions */}
              {visit.prescriptions && visit.prescriptions.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <Pill className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <span className="text-xs text-zinc-500">
                    {visit.prescriptions.join(', ')}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientVisitsView;

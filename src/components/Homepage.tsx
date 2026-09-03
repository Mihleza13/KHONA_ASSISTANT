import React from 'react';
import {
  MessageSquare,
  Stethoscope,
  ShieldCheck,
  HelpCircle,
  Phone,
  MapPin,
  ChevronRight,
  Pill,
} from 'lucide-react';
import type { ClinicSession } from '../types';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n/LanguageContext';

interface HomepageProps {
  onNavigate: (tab: any) => void;
  onOpenClinicMap: () => void;
  onOpenPrivacy: () => void;
  onOpenHelp: () => void;
  onOpenStaffView: () => void;
  activeSession?: ClinicSession | null;
  onStartNewSession?: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({
  onNavigate,
  onOpenClinicMap,
  onOpenPrivacy,
  onOpenHelp,
  activeSession,
}) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();

  const fullName = activeSession?.patient?.fullName || 'Patient';
  const firstName = fullName.split(' ')[0] || fullName;
  const recentVisit = activeSession?.patient?.visits?.[activeSession.patient.visits.length - 1];

  const cardBase = isDark
    ? 'bg-[#12161d] border-zinc-800 text-white'
    : 'bg-white border-zinc-200 text-zinc-900';

  return (
    <div className="w-full max-w-md mx-auto px-5 py-6 pb-28 md:pb-12 animate-in fade-in duration-200">
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-[26px] font-semibold tracking-tight leading-tight">
          Hi {firstName}
        </h1>
        <p className="text-xs text-zinc-500 font-normal mt-0.5">
          {activeSession?.practitioner?.name || 'Dr. N. Dlamini'} · Groote Schuur Hospital
        </p>
      </div>

      {/* Up next */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Up next</h2>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          In progress
        </span>
      </div>

      <div className={`rounded-2xl border overflow-hidden mb-6 ${cardBase}`}>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm ${
              isDark ? 'bg-zinc-800 text-cyan-400' : 'bg-zinc-100 text-zinc-700'
            }`}>
              {(activeSession?.practitioner?.name || 'ND').split(' ').map(w => w[0]).slice(-2).join('')}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                {activeSession?.todayReason || "Today's visit"}
              </div>
              <div className="text-xs text-zinc-500 truncate">
                {activeSession?.practitioner?.name || 'Dr. N. Dlamini'}
                {activeSession?.todayLocation ? ` · ${activeSession.todayLocation}` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Quick action row */}
        <div className={`grid grid-cols-3 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
          <button
            type="button"
            onClick={onOpenHelp}
            className={`flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium cursor-pointer transition-colors ${
              isDark ? 'text-zinc-400 hover:bg-zinc-900' : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <Phone className="w-4 h-4" />
            Reception
          </button>
          <button
            type="button"
            onClick={onOpenClinicMap}
            className={`flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium cursor-pointer border-x transition-colors ${
              isDark ? 'text-zinc-400 hover:bg-zinc-900 border-zinc-800' : 'text-zinc-600 hover:bg-zinc-50 border-zinc-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Directions
          </button>
          <button
            type="button"
            id="action-start-consultation"
            onClick={() => onNavigate('consultation')}
            className="flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-semibold cursor-pointer text-cyan-600 dark:text-cyan-400 transition-colors hover:bg-cyan-500/5"
          >
            <MessageSquare className="w-4 h-4" />
            Start
          </button>
        </div>
      </div>

      {/* Previous visits */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Previous visits</h3>
        <button
          type="button"
          id="action-view-all-visits"
          onClick={() => onNavigate('history')}
          className="text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          See all
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recentVisit ? (
        <button
          type="button"
          onClick={() => onNavigate('history')}
          className={`w-full text-left p-4 rounded-2xl border transition-colors cursor-pointer flex items-center gap-3 ${cardBase} ${
            isDark ? 'hover:bg-[#171c25]' : 'hover:bg-zinc-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
          }`}>
            <Stethoscope className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold line-clamp-2">{recentVisit.reason}</div>
            <div className="text-xs text-zinc-500 truncate">
              {recentVisit.date} · {recentVisit.practitionerName}
            </div>
            {recentVisit.prescriptions && recentVisit.prescriptions.length > 0 && (
              <div className="flex items-center gap-1 mt-1.5">
                <Pill className="w-3 h-3 text-cyan-500 shrink-0" />
                <span className="text-[11px] text-zinc-500 truncate">
                  {recentVisit.prescriptions.join(', ')}
                </span>
              </div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
        </button>
      ) : (
        <div className={`p-5 text-center rounded-2xl border text-zinc-500 text-xs ${cardBase}`}>
          No previous consultation records yet.
        </div>
      )}

      {/* Footer links */}
      <div className={`mt-8 pt-5 border-t flex items-center justify-between text-xs text-zinc-500 font-medium ${
        isDark ? 'border-zinc-800' : 'border-zinc-200'
      }`}>
        <button
          type="button"
          id="home-help-guide"
          onClick={onOpenHelp}
          className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Sign guide
        </button>

        <button
          type="button"
          id="home-privacy-notice"
          onClick={onOpenPrivacy}
          className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
          POPIA notice
        </button>
      </div>
    </div>
  );
};

export default Homepage;

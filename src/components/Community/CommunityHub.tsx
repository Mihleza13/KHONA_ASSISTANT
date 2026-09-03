import React, { useState } from 'react';
import { 
  ArrowLeft,
  Stethoscope,
  Hand,
  Building2
} from 'lucide-react';
import type { 
  SASLRegionalSign, 
  POPIAConsentState, 
  SpeechLanguage 
} from '../../types';
import { INITIAL_REGIONAL_SIGNS } from '../../data/communityData';
import { RegionalSignsSection } from './RegionalSignsSection';
import { HealthcareSection } from './HealthcareSection';
import { useTheme } from '../../theme/ThemeContext';

interface CommunityHubProps {
  popiaConsent: POPIAConsentState;
  currentLanguage?: SpeechLanguage;
  onNavigateToTab?: (tabId: any) => void;
  onBackToWelcome?: () => void;
  onProceedToClinicSession?: () => void;
}

export const CommunityHub: React.FC<CommunityHubProps> = ({
  popiaConsent,
  currentLanguage = 'en',
  onNavigateToTab,
  onBackToWelcome,
  onProceedToClinicSession,
}) => {
  const { isDark } = useTheme();
  // Main Pillar Tabs: 'regional' | 'healthcare'
  const [activePillar, setActivePillar] = useState<'regional' | 'healthcare'>('regional');

  // Regional Signs State with LocalStorage Persistence
  const [signs, setSigns] = useState<SASLRegionalSign[]>(() => {
    try {
      const saved = localStorage.getItem('khona_community_signs_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_REGIONAL_SIGNS;
  });

  const saveSigns = (updatedSigns: SASLRegionalSign[]) => {
    setSigns(updatedSigns);
    try {
      localStorage.setItem('khona_community_signs_v2', JSON.stringify(updatedSigns));
    } catch {
      // ignore
    }
  };

  const handleVoteSign = (signId: string, voteType: 'common' | 'olderGen' | 'slang') => {
    const updated = signs.map((sign) => {
      if (sign.id !== signId) return sign;

      const currentVote = sign.votes.userVote;
      const votes = { ...sign.votes };

      // Revert previous vote if different
      if (currentVote && currentVote !== voteType) {
        votes[currentVote] = Math.max(0, votes[currentVote] - 1);
        votes.total = Math.max(0, votes.total - 1);
      }

      // Apply new vote if not already voted the same
      if (currentVote !== voteType) {
        votes[voteType] += 1;
        votes.total += 1;
        votes.userVote = voteType;
      }

      return { ...sign, votes };
    });

    saveSigns(updated);
  };

  const handleSubmitNewSign = (newSign: SASLRegionalSign) => {
    const updated = [newSign, ...signs];
    saveSigns(updated);
  };

  const handleReportSign = (signId: string, reason: string) => {
    const updated = signs.map((sign) =>
      sign.id === signId ? { ...sign, reported: true } : sign
    );
    saveSigns(updated);
  };

  return (
    <div className={`w-full min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-[#0b0e13] text-white' : 'bg-[#f7f7f8] text-zinc-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5 animate-in fade-in duration-200">
        {/* Top Header Navigation Bar */}
        <div className="flex items-center justify-between gap-3">
          {onBackToWelcome && (
            <button
              type="button"
              onClick={onBackToWelcome}
              className={`p-2.5 rounded-full border transition-colors flex items-center justify-center cursor-pointer shrink-0 ${
                isDark
                  ? 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
                  : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <h1 className="text-base font-semibold tracking-tight flex-1 text-center sm:text-left">
            SASL Community
          </h1>

          {onProceedToClinicSession && (
            <button
              type="button"
              onClick={onProceedToClinicSession}
              className="px-3.5 py-2 rounded-full bg-zinc-950 dark:bg-white hover:opacity-90 text-white dark:text-zinc-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Stethoscope className="w-3.5 h-3.5 text-cyan-400 dark:text-cyan-600" />
              <span className="hidden sm:inline">Continue to clinic</span>
              <span className="sm:hidden">Clinic</span>
            </button>
          )}
        </div>

        {/* Segmented pillar switcher */}
        <div className={`inline-flex p-1 rounded-full border ${
          isDark ? 'bg-[#12161d] border-zinc-800' : 'bg-white border-zinc-200'
        }`}>
          <button
            id="pillar-tab-regional"
            type="button"
            onClick={() => setActivePillar('regional')}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activePillar === 'regional'
                ? isDark ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            Regional signs
          </button>

          <button
            id="pillar-tab-healthcare"
            type="button"
            onClick={() => setActivePillar('healthcare')}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activePillar === 'healthcare'
                ? isDark ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Clinic health
          </button>
        </div>

        {/* Pillar content */}
        <div className="pt-1">
          {activePillar === 'regional' && (
            <RegionalSignsSection
              signs={signs}
              onVoteSign={handleVoteSign}
              onSubmitNewSign={handleSubmitNewSign}
              onReportSign={handleReportSign}
            />
          )}

          {activePillar === 'healthcare' && (
            <HealthcareSection />
          )}
        </div>
      </div>
    </div>
  );
};

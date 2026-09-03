import React, { useState } from 'react';
import {
  Stethoscope,
  Users,
  ArrowRight,
  ShieldCheck,
  Settings,
  HeartHandshake,
} from 'lucide-react';
import { KhonaLogo } from './KhonaLogo';
import { LanguageSelector } from './LanguageSelector';
import { AppearanceSettingsModal } from './AppearanceSettingsModal';
import { PhotoTile } from './PhotoTile';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n/LanguageContext';

interface WelcomeScreenProps {
  onContinueToClinic?: () => void;
  onOpenCommunity?: () => void;
  onStartClinicSession?: () => void;
  onOpenCommunityHub?: () => void;
  onOpenPrivacy?: () => void;
  onOpenHelp?: () => void;
  onOpenClinicMap?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onContinueToClinic,
  onOpenCommunity,
  onStartClinicSession,
  onOpenCommunityHub,
}) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleClinicClick = onContinueToClinic || onStartClinicSession;
  const handleCommunityClick = onOpenCommunity || onOpenCommunityHub;

  return (
    <div
      className={`w-full min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-[#0b0e13] text-white' : 'bg-[#f7f7f8] text-zinc-900'
      }`}
    >
      {/* Top Bar */}
      <header className="max-w-md mx-auto w-full flex items-center justify-between px-5 pt-5">
        <KhonaLogo variant="compact" size="sm" />

        <div className="flex items-center gap-2">
          <LanguageSelector variant="compact" />
          <button
            type="button"
            id="welcome-btn-settings"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Appearance settings"
            className={`p-2 rounded-full border transition-colors cursor-pointer ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
                : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-md mx-auto w-full px-5 pt-6 pb-10 flex-1 flex flex-col">
        {/* Editorial hero — a real photo of a consultation belongs here;
            this is a duotone placeholder standing in for it. */}
        <div className="relative w-full aspect-[4/5] rounded-[28px] overflow-hidden">
          <PhotoTile icon={HeartHandshake} tone="teal" className="w-full h-full">
            <div className="relative h-full flex flex-col justify-end p-6">
              <span className="self-start px-2.5 py-1 rounded-full bg-white/10 backdrop-blur text-white text-[11px] font-medium mb-auto mt-1">
                Western Cape · Pilot
              </span>

              <div className="space-y-1.5">
                <h1 className="text-3xl font-semibold tracking-tight text-white leading-tight">
                  {t.welcome?.tagline || 'Sign. Translate. Understand.'}
                </h1>
                <p className="text-sm text-white/70 font-normal leading-snug max-w-[85%]">
                  {t.welcome?.subtitle || 'Your hands. Their words. One conversation.'}
                </p>
              </div>
            </div>
          </PhotoTile>
        </div>

        {/* Action rows */}
        <div className="w-full mt-6 space-y-2.5">
          <button
            type="button"
            id="welcome-btn-clinic"
            onClick={() => handleClinicClick?.()}
            className={`w-full group rounded-2xl p-4 border-2 transition-all duration-150 cursor-pointer flex items-center justify-between gap-4 active:scale-[0.99] ${
              isDark
                ? 'bg-[#12161d] hover:bg-[#171c25] border-cyan-500/60 text-white'
                : 'bg-white hover:bg-zinc-50 border-cyan-500 text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-400 flex items-center justify-center text-zinc-950 shrink-0">
                <Stethoscope className="w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-semibold text-left">
                {t.welcome?.continueToClinic || 'Continue to clinic'}
              </span>
            </div>
            <ArrowRight className={`w-4 h-4 group-hover:translate-x-0.5 transition-transform ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
          </button>

          <button
            type="button"
            id="welcome-btn-community"
            onClick={() => handleCommunityClick?.()}
            className={`w-full group rounded-2xl p-4 border transition-all duration-150 cursor-pointer flex items-center justify-between gap-4 active:scale-[0.99] ${
              isDark
                ? 'bg-[#12161d] hover:bg-[#171c25] border-zinc-800 text-white'
                : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-zinc-900 text-cyan-400' : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                <Users className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-semibold block">
                  {t.welcome?.saslCommunity || 'SASL Community'}
                </span>
                <span className={`text-xs font-normal ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  Browse while you wait
                </span>
              </div>
            </div>
            <ArrowRight className={`w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'} group-hover:translate-x-0.5 transition-transform`} />
          </button>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 flex items-center justify-between text-xs text-zinc-500 font-normal">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
            <span>{t.welcome?.popiaCompliant || 'POPIA Compliant'}</span>
          </div>
          <span>{t.welcome?.southAfrica || 'SASL South Africa'}</span>
        </div>
      </main>

      <AppearanceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
export default WelcomeScreen;

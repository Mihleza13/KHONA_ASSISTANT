import React, { useState } from 'react';
import { 
  MessageSquare, 
  ArrowLeft, 
  HelpCircle, 
  User, 
  Settings,
  ClipboardList,
  Home
} from 'lucide-react';
import type { NavigationTab, ClinicSession } from '../types';
import { KhonaLogo } from './KhonaLogo';
import { LanguageSelector } from './LanguageSelector';
import { AppearanceSettingsModal } from './AppearanceSettingsModal';
import { useTheme } from '../theme/ThemeContext';

interface NavbarProps {
  currentTab: NavigationTab | 'community' | 'history' | 'profile';
  onNavigate: (tab: any) => void;
  ttsEnabled?: boolean;
  onToggleTTS?: () => void;
  onOpenPrivacy?: () => void;
  onOpenHelp?: () => void;
  onOpenClinicMap?: () => void;
  onOpenStaffView?: () => void;
  activePatientMessageCount?: number;
  activeSession?: ClinicSession | null;
  onExitToWelcome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenHelp,
  activeSession,
  onExitToWelcome,
}) => {
  const { isDark } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <nav className={`border-b sticky top-0 z-40 transition-colors ${
      isDark 
        ? 'bg-[#090d14]/90 backdrop-blur-md border-zinc-800 text-white' 
        : 'bg-white/90 backdrop-blur-md border-zinc-200 text-zinc-900 shadow-2xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo & Back Control */}
        <div className="flex items-center gap-3">
          {currentTab !== 'home' ? (
            <button
              id="nav-back-home"
              type="button"
              onClick={() => onNavigate('home')}
              className={`p-2 -ml-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 ${
                isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
              title="Home"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>Back</span>
            </button>
          ) : onExitToWelcome ? (
            <button
              id="nav-exit-welcome"
              type="button"
              onClick={onExitToWelcome}
              className={`p-2 -ml-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 ${
                isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
              title="Welcome Screen"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Welcome</span>
            </button>
          ) : null}

          <button
            id="nav-logo-btn"
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center text-left group focus:outline-none cursor-pointer"
          >
            <KhonaLogo
              variant="compact"
              size="md"
              showTagline={false}
            />
          </button>
        </div>

        {/* Center: Desktop Navigation Tabs (HOME | VISITS | TALK) */}
        <div className={`hidden md:flex items-center gap-1 p-1 rounded-2xl border transition-colors ${
          isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
        }`}>
          <button
            id="nav-tab-home"
            type="button"
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              currentTab === 'home'
                ? isDark ? 'bg-white text-zinc-950 shadow-xs' : 'bg-zinc-950 text-white shadow-xs'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Home
          </button>

          <button
            id="nav-tab-visits"
            type="button"
            onClick={() => onNavigate('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              currentTab === 'history'
                ? isDark ? 'bg-white text-zinc-950 shadow-xs' : 'bg-zinc-950 text-white shadow-xs'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Visits
          </button>

          <button
            id="nav-tab-talk"
            type="button"
            onClick={() => onNavigate('consultation')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'consultation' || currentTab === 'live-sign'
                ? isDark ? 'bg-white text-zinc-950 shadow-xs' : 'bg-zinc-950 text-white shadow-xs'
                : isDark ? 'text-cyan-400 hover:bg-cyan-500/10' : 'text-cyan-700 hover:bg-cyan-50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Talk</span>
          </button>
        </div>

        {/* Right: Active Patient Status, Language Selector, Settings & Help */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activeSession && (
            <button
              id="nav-patient-profile-btn"
              type="button"
              onClick={() => onNavigate('profile')}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                isDark ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-cyan-500/50 hover:text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate max-w-[110px]">{activeSession.patient.fullName.split(' ')[0]}</span>
            </button>
          )}

          <LanguageSelector variant="compact" />

          {/* Settings Icon -> Appearance */}
          <button
            id="nav-settings-btn"
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Settings and Appearance"
            title="Appearance Settings"
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark 
                ? 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/40' 
                : 'bg-white border-zinc-200 text-zinc-600 hover:text-cyan-600 hover:border-cyan-400 shadow-2xs'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {onOpenHelp && (
            <button
              id="nav-help-btn"
              type="button"
              onClick={onOpenHelp}
              className="p-2 rounded-xl text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer"
              title="Sign Reference Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <AppearanceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </nav>
  );
};

export default Navbar;

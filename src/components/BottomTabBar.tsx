import React from 'react';
import { 
  Home, 
  ClipboardList, 
  User, 
  MessageSquare
} from 'lucide-react';
import type { NavigationTab } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface BottomTabBarProps {
  currentTab: NavigationTab | 'community' | 'history' | 'profile';
  onNavigate: (tab: any) => void;
  hasActiveSession?: boolean;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onNavigate,
  hasActiveSession,
}) => {
  const { isDark } = useTheme();

  return (
    <nav 
      aria-label="Mobile Navigation"
      className={`fixed bottom-0 left-0 right-0 z-40 border-t md:hidden transition-colors ${
        isDark 
          ? 'bg-[#090d14]/95 backdrop-blur-md border-zinc-800/80 text-zinc-400' 
          : 'bg-white/95 backdrop-blur-md border-zinc-200/80 text-zinc-600 shadow-lg'
      }`}
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {/* Tab 1: Home */}
        <button
          type="button"
          id="mobile-tab-home"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer transition-colors ${
            currentTab === 'home'
              ? isDark ? 'text-white font-semibold' : 'text-zinc-950 font-semibold'
              : isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Tab 2: Visits History */}
        <button
          type="button"
          id="mobile-tab-visits"
          onClick={() => onNavigate('history')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer transition-colors ${
            currentTab === 'history'
              ? isDark ? 'text-white font-semibold' : 'text-zinc-950 font-semibold'
              : isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <ClipboardList className={`w-5 h-5 ${currentTab === 'history' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight">Visits</span>
        </button>

        {/* Tab 3: Talk (Consultation) */}
        <button
          type="button"
          id="mobile-tab-talk"
          onClick={() => onNavigate('consultation')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer transition-colors ${
            currentTab === 'consultation' || currentTab === 'live-sign'
              ? isDark ? 'text-white font-semibold' : 'text-zinc-950 font-semibold'
              : isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <MessageSquare className={`w-5 h-5 ${currentTab === 'consultation' || currentTab === 'live-sign' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight">Talk</span>
        </button>

        {/* Tab 4: Profile */}
        <button
          type="button"
          id="mobile-tab-profile"
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer transition-colors ${
            currentTab === 'profile'
              ? isDark ? 'text-white font-semibold' : 'text-zinc-950 font-semibold'
              : isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <User className={`w-5 h-5 ${currentTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};

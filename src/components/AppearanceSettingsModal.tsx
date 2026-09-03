import React from 'react';
import { X, Moon, Sun, Monitor, Palette } from 'lucide-react';
import { useTheme, ThemeMode } from '../theme/ThemeContext';

interface AppearanceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppearanceSettingsModal: React.FC<AppearanceSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { themeMode, setThemeMode, isDark } = useTheme();

  if (!isOpen) return null;

  const modes: { id: ThemeMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'system', label: 'System', icon: Monitor },
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-sm rounded-2xl p-5 sm:p-6 shadow-2xl border transition-all ${
          isDark 
            ? 'bg-[#0e141f] border-zinc-800 text-white' 
            : 'bg-white border-zinc-200 text-zinc-900 shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-700/30">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-50 text-cyan-600'
            }`}>
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Appearance</h2>
              <p className="text-xs text-zinc-500">Theme preference</p>
            </div>
          </div>
          <button
            type="button"
            id="close-settings-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {modes.map((item) => {
            const Icon = item.icon;
            const isSelected = themeMode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`theme-option-${item.id}`}
                onClick={() => setThemeMode(item.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 font-semibold'
                      : 'bg-cyan-50/80 border-cyan-600 text-cyan-950 font-semibold'
                    : isDark
                    ? 'bg-zinc-900/50 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/60'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Radio Indicator */}
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'border-cyan-400 bg-cyan-400' 
                      : isDark ? 'border-zinc-600 bg-transparent' : 'border-zinc-400 bg-white'
                  }`}>
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                    )}
                  </div>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-zinc-400'}`} />
                  <span className="text-sm">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            id="done-settings-modal"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

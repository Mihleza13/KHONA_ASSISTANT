import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';

interface LanguageSelectorProps {
  variant?: 'header' | 'compact' | 'hero';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { language, setLanguage, supportedLanguages } = useTranslation();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        id="btn-language-selector"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer select-none active:scale-95 border ${
          isDark
            ? 'bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-200 border-zinc-800 hover:border-cyan-500/40'
            : variant === 'header'
            ? 'bg-slate-100/90 hover:bg-slate-200/90 text-slate-800 border-slate-200/60'
            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
        }`}
        aria-expanded={isOpen}
        aria-label="Select Language"
      >
        <span className="font-sans font-medium">{currentLangObj.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDark ? 'text-zinc-400' : 'text-slate-400'} ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl border py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
          isDark 
            ? 'bg-[#0e141f] border-zinc-800 text-white' 
            : 'bg-white border-slate-200/80 text-slate-900'
        }`}>
          <div className={`px-3.5 py-1.5 border-b ${isDark ? 'border-zinc-800' : 'border-slate-100'}`}>
            <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-400'}`}>
              Language
            </span>
          </div>

          <div className="py-1">
            {supportedLanguages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 text-left text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-cyan-500/15 text-cyan-300 font-bold'
                        : 'bg-sky-50 text-sky-950 font-bold'
                      : isDark
                      ? 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white font-medium'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{lang.nativeName}</span>
                    <span className={`text-[10px] font-sans ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>{lang.name}</span>
                  </div>
                  {isSelected && <Check className={`w-4 h-4 shrink-0 ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


import React from 'react';
import { Volume2, VolumeX, Sparkles, HelpCircle } from 'lucide-react';

interface HeaderProps {
  ttsEnabled: boolean;
  onToggleTTS: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ ttsEnabled, onToggleTTS, onOpenGuide }) => {
  return (
    <header className="flex flex-wrap items-baseline justify-between gap-4 mb-2">
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="font-display font-semibold text-3xl sm:text-4xl text-[#182420] tracking-tight m-0">
          KHONA Assistant
        </h1>
        <span className="font-mono text-xs text-[#0B5D52] bg-[#0B5D52]/10 font-medium px-2 py-0.5 rounded">
          SASL recognition — prototype
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenGuide}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#182420] bg-white border border-[#DCD7C9] hover:bg-[#F7F5F0] transition-colors shadow-xs"
          title="Sign Guide & Tips"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#0B5D52]" />
          <span>Sign Reference</span>
        </button>

        <button
          type="button"
          onClick={onToggleTTS}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shadow-xs ${
            ttsEnabled
              ? 'bg-[#0B5D52]/10 border-[#0B5D52]/30 text-[#0B5D52]'
              : 'bg-white border-[#DCD7C9] text-[#6B7570] hover:bg-[#F7F5F0]'
          }`}
          title={ttsEnabled ? 'Speech Output Enabled' : 'Speech Output Muted'}
        >
          {ttsEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>Voice Muted</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Flag, 
  Play, 
  Building2,
  ThumbsUp,
  Check
} from 'lucide-react';
import type { SASLRegionalSign } from '../../types';
import { useTheme } from '../../theme/ThemeContext';

interface SignDetailModalProps {
  sign: SASLRegionalSign | null;
  isOpen: boolean;
  onClose: () => void;
  onVote: (signId: string, voteType: 'common' | 'olderGen' | 'slang') => void;
  onReport: (signId: string, reason: string) => void;
}

export const SignDetailModal: React.FC<SignDetailModalProps> = ({
  sign,
  isOpen,
  onClose,
  onVote,
  onReport,
}) => {
  const { isDark } = useTheme();
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasReported, setHasReported] = useState(false);

  if (!isOpen || !sign) return null;

  const totalVotes = Math.max(1, sign.votes.total);
  const commonPct = Math.round((sign.votes.common / totalVotes) * 100);
  const olderGenPct = Math.round((sign.votes.olderGen / totalVotes) * 100);
  const slangPct = Math.max(0, 100 - commonPct - olderGenPct);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-lg rounded-2xl p-6 border shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 ${
          isDark ? 'bg-[#0e141f] border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
              isDark ? 'bg-cyan-500/15 text-cyan-300' : 'bg-cyan-50 text-cyan-800'
            }`}>
              {sign.originFacility || sign.city || 'Western Cape'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Concept Name */}
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wide">
            {sign.conceptName}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-medium leading-relaxed">
            {sign.description}
          </p>
        </div>

        {/* Video Demonstration Box */}
        <div className="aspect-video bg-black rounded-xl border border-zinc-800 flex flex-col items-center justify-center p-6 text-center space-y-3 relative">
          <div className="w-12 h-12 rounded-xl bg-cyan-500 text-black flex items-center justify-center">
            <Play className="w-6 h-6 fill-current ml-1" />
          </div>
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
            {sign.durationSeconds}s Video Demonstration
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            Contributor: {sign.contributor.name}
          </div>
        </div>

        {/* Linguistic Tags */}
        <div className="flex flex-wrap gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
            isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-zinc-100 text-zinc-800'
          }`}>
            ✋ {sign.handshape}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
            isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-zinc-100 text-zinc-800'
          }`}>
            📍 {sign.location}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
            isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-zinc-100 text-zinc-800'
          }`}>
            🔄 {sign.movement}
          </span>
        </div>

        {/* Community Consensus Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
            <span>Community Consensus</span>
            <span>{totalVotes} Votes</span>
          </div>

          <div className="w-full h-2 rounded-full bg-zinc-800 flex overflow-hidden">
            <div style={{ width: `${commonPct}%` }} className="bg-cyan-400 h-full" />
            <div style={{ width: `${olderGenPct}%` }} className="bg-amber-400 h-full" />
            <div style={{ width: `${slangPct}%` }} className="bg-purple-400 h-full" />
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-cyan-400">Common: {commonPct}%</span>
            <span className="text-amber-400">Older: {olderGenPct}%</span>
            <span className="text-purple-400">Slang: {slangPct}%</span>
          </div>
        </div>

        {/* 1-Touch Vote Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => onVote(sign.id, 'common')}
            className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer ${
              sign.votes.userVote === 'common'
                ? 'bg-cyan-500 text-black'
                : isDark
                ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
            }`}
          >
            Common
          </button>
          <button
            type="button"
            onClick={() => onVote(sign.id, 'olderGen')}
            className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer ${
              sign.votes.userVote === 'olderGen'
                ? 'bg-amber-400 text-black'
                : isDark
                ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
            }`}
          >
            Older Gen
          </button>
          <button
            type="button"
            onClick={() => onVote(sign.id, 'slang')}
            className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer ${
              sign.votes.userVote === 'slang'
                ? 'bg-purple-500 text-white'
                : isDark
                ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
            }`}
          >
            Slang
          </button>
        </div>
      </div>
    </div>
  );
};

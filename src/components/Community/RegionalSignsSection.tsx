import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Play, 
  RotateCcw,
  Building2,
  Layers
} from 'lucide-react';
import type { 
  SASLRegionalSign
} from '../../types';
import { 
  HANDSHAPES_LIST, 
  BODY_LOCATIONS_LIST, 
  MOVEMENT_TYPES_LIST 
} from '../../data/communityData';
import { SignDetailModal } from './SignDetailModal';
import { SubmitSignModal } from './SubmitSignModal';
import { PhotoTile } from '../PhotoTile';
import { useTheme } from '../../theme/ThemeContext';

interface RegionalSignsSectionProps {
  signs: SASLRegionalSign[];
  onVoteSign: (signId: string, voteType: 'common' | 'olderGen' | 'slang') => void;
  onSubmitNewSign: (newSign: SASLRegionalSign) => void;
  onReportSign: (signId: string, reason: string) => void;
}

export const RegionalSignsSection: React.FC<RegionalSignsSectionProps> = ({
  signs,
  onVoteSign,
  onSubmitNewSign,
  onReportSign,
}) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('Western Cape');
  const [selectedHandshape, setSelectedHandshape] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedMovement, setSelectedMovement] = useState<string>('All');
  const [selectedContext, setSelectedContext] = useState<string>('All');
  const [showVisualFilters, setShowVisualFilters] = useState(false);

  // Modals
  const [activeDetailSign, setActiveDetailSign] = useState<SASLRegionalSign | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Filter logic
  const filteredSigns = useMemo(() => {
    return signs.filter((sign) => {
      if (sign.reported) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = sign.conceptName.toLowerCase().includes(q);
        const matchesDesc = sign.description.toLowerCase().includes(q);
        const matchesTags = sign.tags.some((t) => t.toLowerCase().includes(q));
        const matchesProv = sign.province.toLowerCase().includes(q);
        const matchesCity = sign.city ? sign.city.toLowerCase().includes(q) : false;
        const matchesFacility = sign.originFacility ? sign.originFacility.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesDesc && !matchesTags && !matchesProv && !matchesCity && !matchesFacility) return false;
      }

      if (selectedProvince !== 'All' && sign.province !== selectedProvince) {
        return false;
      }

      if (selectedHandshape !== 'All' && sign.handshape !== selectedHandshape) {
        return false;
      }

      if (selectedLocation !== 'All' && sign.location !== selectedLocation) {
        return false;
      }

      if (selectedMovement !== 'All' && sign.movement !== selectedMovement) {
        return false;
      }

      if (selectedContext !== 'All' && sign.context !== selectedContext) {
        return false;
      }

      return true;
    });
  }, [
    signs,
    searchQuery,
    selectedProvince,
    selectedHandshape,
    selectedLocation,
    selectedMovement,
    selectedContext,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedProvince('Western Cape');
    setSelectedHandshape('All');
    setSelectedLocation('All');
    setSelectedMovement('All');
    setSelectedContext('All');
  };

  const hasActiveFilters = 
    selectedProvince !== 'Western Cape' || 
    selectedHandshape !== 'All' || 
    selectedLocation !== 'All' || 
    selectedMovement !== 'All' || 
    selectedContext !== 'All' ||
    Boolean(searchQuery.trim());

  return (
    <div className="space-y-5">
      {/* 1. Header & Quick Actions Bar */}
      <div className={`p-5 sm:p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isDark ? 'bg-[#101722] border-zinc-800' : 'bg-white border-zinc-200 shadow-2xs'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Regional signs
            </h2>
            <span className="text-xs font-semibold text-zinc-500">
              {filteredSigns.length} signs recorded for Western Cape
            </span>
          </div>
        </div>

        <button
          id="btn-submit-sign"
          type="button"
          onClick={() => setIsSubmitModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-zinc-950 dark:bg-white hover:opacity-90 text-white dark:text-zinc-950 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
          <span>Add sign</span>
        </button>
      </div>

      {/* 2. Search & Visual Filter Bar */}
      <div className={`p-4 rounded-2xl border space-y-3.5 ${
        isDark ? 'bg-[#101722] border-zinc-800' : 'bg-white border-zinc-200 shadow-2xs'
      }`}>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              id="search-concepts-input"
              type="text"
              placeholder="Search signs (Loadshedding, TikTok, AI, Clinic Card...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition-colors ${
                isDark 
                  ? 'bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-cyan-500' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-cyan-500'
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowVisualFilters((prev) => !prev)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                showVisualFilters || selectedHandshape !== 'All' || selectedLocation !== 'All' || selectedMovement !== 'All'
                  ? isDark
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                    : 'bg-cyan-50 border-cyan-600 text-cyan-900'
                  : isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2.5 rounded-xl text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Visual Filters */}
        {showVisualFilters && (
          <div className={`pt-3 border-t grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150 ${
            isDark ? 'border-zinc-800' : 'border-zinc-100'
          }`}>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400 block">
                Handshape
              </label>
              <select
                value={selectedHandshape}
                onChange={(e) => setSelectedHandshape(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                }`}
              >
                <option value="All">All Handshapes</option>
                {HANDSHAPES_LIST.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400 block">
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                }`}
              >
                <option value="All">All Locations</option>
                {BODY_LOCATIONS_LIST.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400 block">
                Movement
              </label>
              <select
                value={selectedMovement}
                onChange={(e) => setSelectedMovement(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                }`}
              >
                <option value="All">All Movements</option>
                {MOVEMENT_TYPES_LIST.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 3. Cards Grid: Video-led, metadata as caption */}
      {filteredSigns.length === 0 ? (
        <div className={`p-10 text-center rounded-2xl border space-y-3 ${
          isDark ? 'bg-[#101722] border-zinc-800' : 'bg-white border-zinc-200'
        }`}>
          <Search className="w-8 h-8 text-zinc-500 mx-auto" />
          <h3 className="text-base font-bold">No signs match your search</h3>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSigns.map((sign) => (
            <div
              key={sign.id}
              className={`rounded-2xl border overflow-hidden transition-all group ${
                isDark
                  ? 'bg-[#101722] border-zinc-800 hover:border-zinc-700'
                  : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-2xs'
              }`}
            >
              {/* Video thumbnail — the sign itself is the content */}
              <button
                type="button"
                onClick={() => setActiveDetailSign(sign)}
                className="relative w-full aspect-[4/5] cursor-pointer"
              >
                <PhotoTile icon={Layers} tone="indigo" className="w-full h-full">
                  <div className="relative h-full flex flex-col justify-between p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur text-white text-[10px] font-medium">
                        {sign.originFacility || sign.city || 'Western Cape'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur text-white text-[10px] font-medium">
                        {sign.durationSeconds}s
                      </span>
                    </div>

                    <div className="flex items-center justify-center flex-1">
                      <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <Play className="w-5 h-5 text-zinc-900 fill-current ml-0.5" />
                      </div>
                    </div>

                    <h3 className="text-white text-base font-semibold tracking-tight leading-tight">
                      {sign.conceptName}
                    </h3>
                  </div>
                </PhotoTile>
              </button>

              {/* Caption row */}
              <div className="p-3.5 flex items-center justify-between gap-2">
                <span className="text-[11px] text-zinc-500 truncate">{sign.context}</span>

                <div className="flex items-center gap-1 shrink-0">
                  {(['common', 'olderGen', 'slang'] as const).map((voteType) => {
                    const label = voteType === 'common' ? 'Common' : voteType === 'olderGen' ? 'Older' : 'Slang';
                    const active = sign.votes.userVote === voteType;
                    return (
                      <button
                        key={voteType}
                        type="button"
                        onClick={() => onVoteSign(sign.id, voteType)}
                        className={`px-2 py-1 rounded-full text-[10px] font-semibold border transition-colors cursor-pointer ${
                          active
                            ? 'bg-cyan-500 text-black border-cyan-500'
                            : isDark
                            ? 'border-zinc-800 text-zinc-500 hover:text-white'
                            : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {activeDetailSign && (
        <SignDetailModal
          sign={activeDetailSign}
          isOpen={Boolean(activeDetailSign)}
          onClose={() => setActiveDetailSign(null)}
          onVoteSign={onVoteSign}
          onReportSign={onReportSign}
        />
      )}

      <SubmitSignModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={onSubmitNewSign}
      />
    </div>
  );
};

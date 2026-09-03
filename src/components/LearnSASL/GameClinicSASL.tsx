import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle, 
  ChevronRight, 
  Hand, 
  Sparkles,
  Stethoscope
} from 'lucide-react';
import { SASL_VOCABULARY } from '../../data/saslVocabulary';
import type { SASLSignData } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface GameClinicSASLProps {
  onBackToMenu: () => void;
}

export const GameClinicSASL: React.FC<GameClinicSASLProps> = ({ onBackToMenu }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSign, setSelectedSign] = useState<SASLSignData>(
    SASL_VOCABULARY.find((s) => s.category === 'clinic') || SASL_VOCABULARY[0]
  );

  const filteredSigns = SASL_VOCABULARY.filter((sign) => {
    const matchesCategory = selectedCategory === 'all' || sign.category === selectedCategory;
    const matchesSearch =
      sign.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sign.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-lg shadow-xs">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 font-sans">
              {t.learnSasl.game4Title}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t.learnSasl.game4Desc}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToMenu}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          {t.learnSasl.backToHubBtn}
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {[
            { id: 'all', label: t.learnSasl.allCategories },
            { id: 'clinic', label: t.learnSasl.clinicCategory },
            { id: 'calendar', label: t.learnSasl.calendarCategory },
            { id: 'everyday', label: t.learnSasl.everydayCategory },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.learnSasl.searchDictionaryPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
          />
        </div>
      </div>

      {/* Master/Detail View */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Sign List */}
        <div className="md:col-span-5 space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
          {filteredSigns.map((sign) => {
            const isSelected = selectedSign.id === sign.id;
            return (
              <div
                key={sign.id}
                onClick={() => setSelectedSign(sign)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedSign(sign)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-base">
                      {sign.word}
                    </span>
                    {sign.verified && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {t.learnSasl.verifiedSignBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                    {sign.visualTip}
                  </p>
                </div>
                <ChevronRight className={`w-5 h-5 ${isSelected ? 'text-emerald-600' : 'text-slate-300'}`} />
              </div>
            );
          })}
        </div>

        {/* Right: Selected Sign Detailed Flashcard */}
        <div className="md:col-span-7 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg border border-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                SASL Healthcare Vocabulary &bull; {t.common.level} {selectedSign.level}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans mt-1">
                {selectedSign.word}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <Hand className="w-6 h-6" />
            </div>
          </div>

          {/* Detailed Movement Instructions */}
          <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 space-y-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
              How to perform this sign:
            </span>
            <p className="text-base text-slate-200 leading-relaxed font-medium">
              {selectedSign.description}
            </p>
          </div>

          {/* Visual Memory Anchor */}
          <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs sm:text-sm flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300">{t.signGuide.tipPrefix}</strong> {selectedSign.visualTip}
            </div>
          </div>

          {/* Quick Confirmation */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 font-mono">
            <span>{t.learnSasl.verifiedSignBadge}</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Verified for Clinic Use</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Hand, Sparkles, Search } from 'lucide-react';
import { SASL_VOCABULARY } from '../data/saslVocabulary';
import { useTranslation } from '../i18n/LanguageContext';

interface SignGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignGuideModal: React.FC<SignGuideModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredSigns = SASL_VOCABULARY.filter(
    (sign) =>
      sign.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sign.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="khona-backdrop-in fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="khona-pop-in bg-white rounded-t-[28px] sm:rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border-2 border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="khona-sheet-handle sm:hidden -mt-2 mb-1" />
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Hand className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-sky-700 font-bold">
                {t.signGuide.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans mt-0.5">
                {t.signGuide.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-600">
          {t.signGuide.description}
        </p>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
          <input
            type="text"
            placeholder={t.signGuide.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="khona-input-pill !pl-10 !bg-slate-50 !border-slate-200 focus:!bg-white"
          />
        </div>

        {/* Signs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredSigns.map((sign) => (
            <div
              key={sign.id}
              className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-white transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 font-sans">
                  {sign.word}
                </h3>
                <span className="text-[11px] font-mono font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  {sign.category.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {sign.description}
              </p>

              <div className="pt-2 border-t border-slate-200/80 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{t.signGuide.tipPrefix} {sign.visualTip}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            {t.signGuide.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

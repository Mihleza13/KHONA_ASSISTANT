import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, FileCheck, Check } from 'lucide-react';
import type { POPIAConsentState } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  popiaConsent: POPIAConsentState;
  onSetConsent: (allow: boolean) => void;
}

export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({
  isOpen,
  onClose,
  popiaConsent,
  onSetConsent,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleChoice = (allow: boolean) => {
    onSetConsent(allow);
    onClose();
  };

  return (
    <div className="khona-backdrop-in fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="khona-pop-in bg-white rounded-t-[28px] sm:rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border-2 border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="khona-sheet-handle sm:hidden -mt-2 mb-1" />
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-800 font-bold">
                {t.privacy.badge}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 font-sans mt-0.5">
                {t.privacy.title}
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

        {/* Core Privacy Guarantees */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">{t.privacy.onDeviceTitle}</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {t.privacy.onDeviceDesc}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">{t.privacy.zeroBiometricsTitle}</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {t.privacy.zeroBiometricsDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Section: Help Improve KHONA (POPIA Consent) */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white font-sans">
              {t.privacy.popiaSectionTitle}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t.privacy.popiaSectionDesc}
          </p>

          {/* User Consent Status Pill */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-1">
            <span>{t.privacy.statusLabel}</span>
            <span className={popiaConsent.allowModelImprovement ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {popiaConsent.allowModelImprovement ? t.privacy.optedInStatus : t.privacy.optedOutStatus}
            </span>
          </div>

          {/* Action Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleChoice(true)}
              className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>{t.privacy.acceptBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => handleChoice(false)}
              className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>{t.privacy.declineBtn}</span>
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            {t.privacy.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

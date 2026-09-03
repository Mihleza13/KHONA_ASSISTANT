import React, { useState } from 'react';
import { 
  X, 
  Stethoscope, 
  CheckCircle2, 
  RotateCcw, 
  PlusCircle, 
  Clock, 
  AlertCircle,
  Send
} from 'lucide-react';
import type { StaffCommunication } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface StaffViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  communications: StaffCommunication[];
  onAcknowledge: (id: string) => void;
  onClearAll: () => void;
  onSendStaffPromptToPatient?: (text: string) => void;
}

export const StaffViewModal: React.FC<StaffViewModalProps> = ({
  isOpen,
  onClose,
  communications,
  onAcknowledge,
  onClearAll,
  onSendStaffPromptToPatient,
}) => {
  const { t } = useTranslation();
  const [activePromptFeedback, setActivePromptFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const latestComm = communications[0];
  const quickQuestions = t.staffView.prompts && t.staffView.prompts.length > 0 
    ? t.staffView.prompts 
    : [
      'Where is your pain located?',
      'Do you have your clinic green book or ID card?',
      'Are you currently taking any prescription medicine?',
      'Please take a seat in waiting area B — the doctor will call you shortly.',
      'Is someone accompanying you today?',
    ];

  const handleSendPrompt = (prompt: string) => {
    if (onSendStaffPromptToPatient) {
      onSendStaffPromptToPatient(prompt);
    }
    setActivePromptFeedback(prompt);
    setTimeout(() => setActivePromptFeedback(null), 3000);
  };

  return (
    <div className="khona-backdrop-in fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="khona-pop-in bg-white rounded-t-[28px] sm:rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border-2 border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="khona-sheet-handle sm:hidden -mt-2 mb-1" />
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-teal-700 font-bold">
                {t.staffView.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans mt-0.5">
                {t.staffView.title}
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

        {/* Current Patient Communication Section */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-bold">
              {t.staffView.currentPatientTitle}
            </span>

            {latestComm?.urgent && (
              <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500 text-red-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{t.staffView.urgentBadge}</span>
              </span>
            )}
          </div>

          {/* Confirmed Message */}
          <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 space-y-2">
            {latestComm ? (
              <>
                <p className="text-2xl sm:text-3xl font-extrabold text-white font-sans leading-relaxed">
                  &ldquo;{latestComm.patientMessage}&rdquo;
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono pt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t.staffView.receivedLabel}: {latestComm.timestamp}</span>
                  </span>
                  <span>&bull;</span>
                  <span className={latestComm.status === 'acknowledged' ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                    {t.staffView.statusLabel}: {latestComm.status.toUpperCase()}
                  </span>
                </div>
              </>
            ) : (
              <div className="py-6 text-center text-slate-400 italic text-sm">
                {t.staffView.noMessageReceived}
              </div>
            )}
          </div>

          {/* Staff Action Buttons */}
          {latestComm && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => onAcknowledge(latestComm.id)}
                className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.staffView.confirmReceivedBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendPrompt('Please sign your request again')}
                className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.staffView.askSignAgainBtn}</span>
              </button>

              <button
                type="button"
                onClick={onClearAll}
                className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t.staffView.newPatientSessionBtn}</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Staff Questions to Display on Patient Kiosk */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
              {t.staffView.quickPromptsTitle}
            </span>
            {activePromptFeedback && (
              <span className="text-xs text-emerald-700 font-bold animate-pulse">
                {t.staffView.displayedFeedback}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quickQuestions.map((question, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendPrompt(question)}
                className="p-3 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-400 text-left text-xs font-semibold text-slate-800 flex items-center justify-between gap-2 transition-colors cursor-pointer"
              >
                <span>{question}</span>
                <Send className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            {t.staffView.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

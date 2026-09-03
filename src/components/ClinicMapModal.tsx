import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  AlertTriangle, 
  ClipboardList, 
  Bath, 
  LogOut, 
  Navigation,
  Sparkles
} from 'lucide-react';
import { CLINIC_DESTINATIONS } from '../data/saslVocabulary';
import type { ClinicDestination } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface ClinicMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicMapModal: React.FC<ClinicMapModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [selectedDest, setSelectedDest] = useState<ClinicDestination>(CLINIC_DESTINATIONS[0]);

  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope':
        return <Stethoscope className="w-5 h-5" />;
      case 'Pill':
        return <Pill className="w-5 h-5" />;
      case 'FlaskConical':
        return <FlaskConical className="w-5 h-5" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'ClipboardList':
        return <ClipboardList className="w-5 h-5" />;
      case 'Bath':
        return <Bath className="w-5 h-5" />;
      case 'LogOut':
        return <LogOut className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const localizedDest = t.clinicMap.destinations[selectedDest.id as keyof typeof t.clinicMap.destinations] || {
    name: selectedDest.name,
    signName: selectedDest.signName,
    zone: selectedDest.zone,
    floor: selectedDest.floor,
    directions: selectedDest.directions,
    tip: selectedDest.signTip,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-sky-700 font-bold">
              {t.clinicMap.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans mt-0.5">
              {t.clinicMap.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t.clinicMap.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Destination Touch Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CLINIC_DESTINATIONS.map((dest) => {
            const isSelected = selectedDest.id === dest.id;
            const destLoc = t.clinicMap.destinations[dest.id as keyof typeof t.clinicMap.destinations];
            const displayName = destLoc ? destLoc.name : dest.name;
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => setSelectedDest(dest)}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
                  isSelected
                    ? 'border-sky-600 bg-sky-50 text-slate-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {getIcon(dest.iconName)}
                  </div>
                  {dest.id === 'emergency' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  )}
                </div>
                <span className="font-bold text-sm mt-2">{displayName}</span>
              </button>
            );
          })}
        </div>

        {/* Destination Map Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-mono mb-2">
                <Navigation className="w-3.5 h-3.5" />
                <span>{localizedDest.zone} &bull; {localizedDest.floor}</span>
              </div>
              <h3 className="text-3xl font-extrabold text-white font-sans">
                {localizedDest.name}
              </h3>
              <p className="text-xs text-sky-400 font-mono mt-1">
                SASL Sign: {localizedDest.signName}
              </p>
            </div>
          </div>

          {/* Step-by-Step Wayfinding */}
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              {t.clinicMap.directionsTitle}
            </span>
            <ul className="space-y-2 text-sm text-slate-200">
              {localizedDest.directions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* SASL / Healthcare Tip */}
          <div className="p-4 rounded-2xl bg-sky-950/60 border border-sky-800 text-sky-200 text-xs sm:text-sm flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong>{t.clinicMap.signTipTitle}:</strong> {localizedDest.tip}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            {t.clinicMap.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

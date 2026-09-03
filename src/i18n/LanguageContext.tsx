import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type { SupportedLanguage, TranslationSchema, LanguageInfo } from './types';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getTranslation } from './index';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationSchema;
  supportedLanguages: LanguageInfo[];
  formatHealthcarePhrase: (signKey: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'khona_kiosk_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'en' || saved === 'xh' || saved === 'zu' || saved === 'af')) {
        return saved as SupportedLanguage;
      }
    } catch {
      // ignore
    }
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const t = useMemo(() => getTranslation(language), [language]);

  const formatHealthcarePhrase = (signKey: string): string => {
    const key = signKey.toLowerCase().trim();
    const phrases = t.phrases;

    switch (key) {
      case 'monday':
        return phrases.monday;
      case 'tuesday':
        return phrases.tuesday;
      case 'wednesday':
        return phrases.wednesday;
      case 'thursday':
        return phrases.thursday;
      case 'friday':
        return phrases.friday;
      case 'doctor':
        return phrases.doctor;
      case 'nurse':
        return phrases.nurse;
      case 'hospital':
        return phrases.hospital;
      case 'clinic':
        return phrases.clinic;
      case 'pharmacy':
        return phrases.pharmacy;
      case 'medicine':
        return phrases.medicine;
      case 'pain':
        return phrases.pain;
      case 'emergency':
        return phrases.emergency;
      case 'appointment':
        return phrases.appointment;
      case 'help':
        return phrases.help;
      case 'sick':
        return phrases.sick;
      case 'where':
        return phrases.where;
      case 'when':
        return phrases.when;
      case 'today':
        return phrases.today;
      case 'tomorrow':
        return phrases.tomorrow;
      default:
        return signKey;
    }
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      supportedLanguages: SUPPORTED_LANGUAGES,
      formatHealthcarePhrase,
    }),
    [language, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useTranslation(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

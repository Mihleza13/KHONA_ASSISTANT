import { en } from './en';
import { xh } from './xh';
import { zu } from './zu';
import { af } from './af';
import type { SupportedLanguage, LanguageInfo, TranslationSchema } from './types';

export * from './types';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flagLabel: 'EN',
  },
  {
    code: 'xh',
    name: 'isiXhosa',
    nativeName: 'isiXhosa',
    flagLabel: 'XH',
  },
  {
    code: 'zu',
    name: 'isiZulu',
    nativeName: 'isiZulu',
    flagLabel: 'ZU',
  },
  {
    code: 'af',
    name: 'Afrikaans',
    nativeName: 'Afrikaans',
    flagLabel: 'AF',
  },
];

export const translations: Record<SupportedLanguage, TranslationSchema> = {
  en,
  xh,
  zu,
  af,
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export function getTranslation(lang: SupportedLanguage): TranslationSchema {
  return translations[lang] || translations[DEFAULT_LANGUAGE];
}

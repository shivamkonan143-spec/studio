
import en from './en.json';
import hi from './hi.json';

export type Locale = 'en' | 'hi';

type Translations = typeof en;

export const translations: Record<Locale, Translations> = {
  en,
  hi,
};

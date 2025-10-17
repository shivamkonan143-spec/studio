'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Locale } from '@/app/locales/translations';

// --- Language Context ---
interface LanguageContextType {
  locale: Locale;
  changeLocale: (newLocale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('en');

  const changeLocale = (newLocale: Locale) => {
    if (translations[newLocale]) {
      setLocale(newLocale);
    }
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLocale }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};


// --- Layout Context ---
interface PreviewState {
  id: string;
  isShort: boolean;
}

interface LayoutContextType {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  preview: PreviewState | null;
  setPreview: (preview: PreviewState | null) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  return (
    <LayoutContext.Provider value={{ isMenuOpen, setIsMenuOpen, preview, setPreview }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type LanguageCode,
  defaultLanguage,
  LANGUAGE_STORAGE_KEY,
  isValidLanguageCode,
  getLanguageInfo,
} from "@/lib/i18n/config";
import { getTranslations, type Translations } from "@/lib/i18n/translations";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: LanguageCode;
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<LanguageCode>(
    initialLanguage || defaultLanguage
  );
  const [mounted, setMounted] = useState(false);

  // Load language from storage on mount
  useEffect(() => {
    setMounted(true);

    // Try to get language from localStorage
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && isValidLanguageCode(stored)) {
      setLanguageState(stored);
    } else {
      // Try to detect from browser
      const browserLang = navigator.language.split("-")[0];
      if (isValidLanguageCode(browserLang)) {
        setLanguageState(browserLang);
      }
    }
  }, []);

  // Update document direction when language changes
  useEffect(() => {
    if (mounted) {
      const info = getLanguageInfo(language);
      document.documentElement.dir = info.dir;
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

    // Also set a cookie for server-side access
    document.cookie = `${LANGUAGE_STORAGE_KEY}=${lang};path=/;max-age=31536000;samesite=lax`;
  }, []);

  const t = getTranslations(language);
  const dir = getLanguageInfo(language).dir;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Hook to get just the translations
export function useTranslations() {
  const { t } = useLanguage();
  return t;
}

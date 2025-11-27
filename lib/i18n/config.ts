// Supported languages with their metadata
export const languages = {
  en: {
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    dir: "ltr",
  },
  es: {
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    dir: "ltr",
  },
  fr: {
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    dir: "ltr",
  },
  de: {
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    dir: "ltr",
  },
  it: {
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
    dir: "ltr",
  },
  pt: {
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇧🇷",
    dir: "ltr",
  },
  ar: {
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    dir: "rtl",
  },
  zh: {
    name: "Chinese",
    nativeName: "中文",
    flag: "🇨🇳",
    dir: "ltr",
  },
  ja: {
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    dir: "ltr",
  },
  ko: {
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
    dir: "ltr",
  },
  ru: {
    name: "Russian",
    nativeName: "Русский",
    flag: "🇷🇺",
    dir: "ltr",
  },
  hi: {
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    dir: "ltr",
  },
  tr: {
    name: "Turkish",
    nativeName: "Türkçe",
    flag: "🇹🇷",
    dir: "ltr",
  },
  fa: {
    name: "Persian",
    nativeName: "فارسی",
    flag: "🇮🇷",
    dir: "rtl",
  },
} as const;

export type LanguageCode = keyof typeof languages;
export const defaultLanguage: LanguageCode = "en";
export const languageCodes = Object.keys(languages) as LanguageCode[];

// Cookie/localStorage key for storing language preference
export const LANGUAGE_STORAGE_KEY = "phenotype-language";

// Get language display info
export function getLanguageInfo(code: LanguageCode) {
  return languages[code] || languages[defaultLanguage];
}

// Validate language code
export function isValidLanguageCode(code: string): code is LanguageCode {
  return code in languages;
}

// Export all translations
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { de } from "./de";
import { ar } from "./ar";
import { it } from "./it";
import { pt } from "./pt";
import { zh } from "./zh";
import { ja } from "./ja";
import { ko } from "./ko";
import { ru } from "./ru";
import { hi } from "./hi";
import { tr } from "./tr";
import { fa } from "./fa";
import type { LanguageCode } from "../config";
import type { Translations } from "../types";

// Deep merge helper to fill in missing translations with English fallbacks
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceValue = source[key];
    const targetValue = target[key];
    if (sourceValue !== undefined) {
      if (
        typeof sourceValue === "object" &&
        sourceValue !== null &&
        typeof targetValue === "object" &&
        targetValue !== null &&
        !Array.isArray(sourceValue)
      ) {
        result[key] = deepMerge(targetValue as object, sourceValue as object) as T[keyof T];
      } else {
        result[key] = sourceValue as T[keyof T];
      }
    }
  }
  return result;
}

// All translations mapped by language code - using English as base for any missing keys
export const translations: Record<LanguageCode, Translations> = {
  en,
  es: deepMerge(en, es as unknown as Partial<Translations>),
  fr: deepMerge(en, fr as unknown as Partial<Translations>),
  de: deepMerge(en, de as unknown as Partial<Translations>),
  ar: deepMerge(en, ar as unknown as Partial<Translations>),
  it: deepMerge(en, it as unknown as Partial<Translations>),
  pt: deepMerge(en, pt as unknown as Partial<Translations>),
  zh: deepMerge(en, zh as unknown as Partial<Translations>),
  ja: deepMerge(en, ja as unknown as Partial<Translations>),
  ko: deepMerge(en, ko as unknown as Partial<Translations>),
  ru: deepMerge(en, ru as unknown as Partial<Translations>),
  hi: deepMerge(en, hi as unknown as Partial<Translations>),
  tr: deepMerge(en, tr as unknown as Partial<Translations>),
  fa: deepMerge(en, fa as unknown as Partial<Translations>),
};

// Get translations for a specific language
export function getTranslations(lang: LanguageCode): Translations {
  return translations[lang] || translations.en;
}

export type { Translations };

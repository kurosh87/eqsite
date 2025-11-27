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

// All translations mapped by language code
export const translations: Record<LanguageCode, Translations> = {
  en,
  es,
  fr,
  de,
  ar,
  it,
  pt,
  zh,
  ja,
  ko,
  ru,
  hi,
  tr,
  fa,
};

// Get translations for a specific language
export function getTranslations(lang: LanguageCode): Translations {
  return translations[lang] || translations.en;
}

export type { Translations };

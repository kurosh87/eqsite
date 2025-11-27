import { translations } from "@/lib/i18n/translations";
import type { Translations } from "@/lib/i18n/types";

describe("i18n Translations", () => {
  const languages = Object.keys(translations) as Array<keyof typeof translations>;

  it("should have all required languages", () => {
    const requiredLanguages = [
      "en", "es", "fr", "de", "ar", "it", "pt",
      "zh", "ja", "ko", "ru", "hi", "tr", "fa"
    ];
    requiredLanguages.forEach((lang) => {
      expect(translations).toHaveProperty(lang);
    });
  });

  it("should have matching keys across all languages", () => {
    const enKeys = getDeepKeys(translations.en);

    languages.forEach((lang) => {
      if (lang === "en") return;
      const langKeys = getDeepKeys(translations[lang]);

      enKeys.forEach((key) => {
        expect(langKeys).toContain(key);
      });
    });
  });

  it("should have non-empty values for common keys", () => {
    languages.forEach((lang) => {
      const t = translations[lang];
      expect(t.common.loading).toBeTruthy();
      expect(t.common.error).toBeTruthy();
      expect(t.common.save).toBeTruthy();
      expect(t.nav.home).toBeTruthy();
      expect(t.nav.dashboard).toBeTruthy();
    });
  });

  it("should have phenotypes translations in all languages", () => {
    languages.forEach((lang) => {
      const t = translations[lang];
      expect(t.phenotypes).toBeDefined();
      expect(t.phenotypes.connections).toBeTruthy();
      expect(t.phenotypes.description).toBeTruthy();
      expect(t.phenotypes.statistics).toBeTruthy();
    });
  });
});

// Helper function to get all nested keys as dot-notation paths
function getDeepKeys(obj: Record<string, any>, prefix = ""): string[] {
  const keys: string[] = [];

  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...getDeepKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

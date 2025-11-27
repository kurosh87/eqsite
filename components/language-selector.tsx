"use client";

import { useLanguage } from "@/components/language-provider";
import {
  languages,
  languageCodes,
  type LanguageCode,
} from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  variant?: "icon" | "full";
  align?: "start" | "center" | "end";
}

export function LanguageSelector({
  variant = "icon",
  align = "end",
}: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  const currentLang = languages[language];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={variant === "icon" ? "icon" : "default"}
          className={cn(
            variant === "icon" ? "h-9 w-9" : "h-9 px-3"
          )}
          aria-label={t.a11y.languageSelector}
        >
          {variant === "icon" ? (
            <>
              <span className="text-base" role="img" aria-label={currentLang.name}>
                {currentLang.flag}
              </span>
              <span className="sr-only">{t.nav.language}</span>
            </>
          ) : (
            <>
              <span className="text-base mr-2" role="img" aria-label={currentLang.name}>
                {currentLang.flag}
              </span>
              <span className="text-sm">{currentLang.nativeName}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56 max-h-80 overflow-y-auto">
        <DropdownMenuLabel className="text-sm font-medium">
          {t.nav.language}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languageCodes.map((code) => {
          const lang = languages[code];
          const isSelected = code === language;

          return (
            <DropdownMenuItem
              key={code}
              onClick={() => setLanguage(code)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 cursor-pointer",
                isSelected && "bg-accent"
              )}
            >
              <span
                className="text-lg"
                role="img"
                aria-label={lang.name}
              >
                {lang.flag}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {lang.nativeName}
                </div>
                {lang.nativeName !== lang.name && (
                  <div className="text-xs text-muted-foreground truncate">
                    {lang.name}
                  </div>
                )}
              </div>
              {isSelected && (
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact horizontal flag selector (alternative style)
export function LanguageFlagsCompact() {
  const { language, setLanguage, t } = useLanguage();

  // Show only most common languages in compact view
  const commonLanguages: LanguageCode[] = ["en", "es", "fr", "de", "zh", "ar"];

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={t.a11y.languageSelector}>
      {commonLanguages.map((code) => {
        const lang = languages[code];
        const isSelected = code === language;

        return (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            className={cn(
              "p-1.5 rounded-md transition-all hover:bg-accent",
              isSelected && "bg-accent ring-2 ring-primary ring-offset-1 ring-offset-background"
            )}
            title={`${lang.nativeName} (${lang.name})`}
            aria-label={`${t.a11y.languageSelector}: ${lang.name}`}
            role="radio"
            aria-checked={isSelected}
          >
            <span className="text-lg" role="img" aria-hidden="true">
              {lang.flag}
            </span>
          </button>
        );
      })}
    </div>
  );
}

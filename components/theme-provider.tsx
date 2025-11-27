"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ThemeName, themes } from "@/lib/themes";

type Theme = "light" | "dark";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultColorScheme?: ThemeName;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  colorScheme: ThemeName;
  setTheme: (theme: Theme) => void;
  setColorScheme: (colorScheme: ThemeName) => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  colorScheme: "purple",
  setTheme: () => null,
  setColorScheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  defaultColorScheme = "purple",
  storageKey = "pheno-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [colorScheme, setColorSchemeState] = useState<ThemeName>(defaultColorScheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Load saved preferences
    const savedTheme = localStorage.getItem(storageKey) as Theme;
    const savedColorScheme = localStorage.getItem(`${storageKey}-color`) as ThemeName;

    if (savedTheme) {
      setThemeState(savedTheme);
    }
    if (savedColorScheme && themes[savedColorScheme]) {
      setColorSchemeState(savedColorScheme);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;

    // Remove all theme classes
    root.classList.remove("light", "dark");

    // Add current theme class
    root.classList.add(theme);

    // Apply CSS variables for the current color scheme and theme mode
    const colors = themes[colorScheme][theme];

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Save preferences
    localStorage.setItem(storageKey, theme);
    localStorage.setItem(`${storageKey}-color`, colorScheme);
  }, [theme, colorScheme, storageKey, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setColorScheme = (newColorScheme: ThemeName) => {
    setColorSchemeState(newColorScheme);
  };

  const value = {
    theme,
    colorScheme,
    setTheme,
    setColorScheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

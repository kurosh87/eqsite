"use client";

import { useTheme } from "@/components/theme-provider";
import { ThemeName, themes, themeColors } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { theme, colorScheme, setTheme, setColorScheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {/* Light/Dark Mode Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="h-9 w-9"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Color Scheme Picker */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Palette className="h-4 w-4" />
            <span className="sr-only">Change color scheme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-sm font-medium">
            Color Scheme
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="grid grid-cols-2 gap-2 p-2">
            {Object.entries(themes).map(([key, value]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setColorScheme(key as ThemeName)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md transition-all",
                  colorScheme === key && "bg-accent"
                )}
              >
                <div
                  className={cn(
                    "h-5 w-5 rounded-full border-2 border-white shadow-md ring-2 ring-offset-2 ring-offset-background",
                    colorScheme === key ? "ring-primary" : "ring-transparent"
                  )}
                  style={{
                    backgroundColor: themeColors[key as ThemeName],
                  }}
                />
                <span className="text-sm font-medium flex-1">{value.name}</span>
                {colorScheme === key && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ThemeSwatchesCompact() {
  const { colorScheme, setColorScheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {Object.entries(themes).map(([key, value]) => (
        <button
          key={key}
          onClick={() => setColorScheme(key as ThemeName)}
          className={cn(
            "group relative h-8 w-8 rounded-full transition-all hover:scale-110",
            colorScheme === key && "ring-2 ring-primary ring-offset-2 ring-offset-background"
          )}
          title={value.name}
          aria-label={`Select ${value.name} color scheme`}
          aria-pressed={colorScheme === key}
        >
          <div
            className="h-full w-full rounded-full border-2 border-white shadow-md"
            style={{ backgroundColor: themeColors[key as ThemeName] }}
          />
          {colorScheme === key && (
            <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />
          )}
        </button>
      ))}
    </div>
  );
}

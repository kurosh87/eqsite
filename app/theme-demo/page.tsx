"use client";

import { useTheme } from "@/components/theme-provider";
import { ThemeName, themes, themeColors } from "@/lib/themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ThemeDemoPage() {
  const { theme, colorScheme, setTheme, setColorScheme } = useTheme();

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Theme Customization
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose your preferred color scheme and appearance mode
          </p>
        </div>

        {/* Current Theme Info */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current Theme
              <Badge variant="outline" className="text-sm px-3 py-1">
                {themes[colorScheme].name} · {theme === "light" ? "Light" : "Dark"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Your theme preference is saved automatically and synced across all pages
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Light/Dark Mode Toggle */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Appearance Mode</h2>
          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            <Card
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg border-2",
                theme === "light" && "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
              onClick={() => setTheme("light")}
            >
              <CardContent className="p-6 text-center">
                <Sun className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Light Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Bright and clear interface
                </p>
                {theme === "light" && (
                  <Check className="h-5 w-5 text-primary mx-auto mt-4" />
                )}
              </CardContent>
            </Card>

            <Card
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg border-2",
                theme === "dark" && "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
              onClick={() => setTheme("dark")}
            >
              <CardContent className="p-6 text-center">
                <Moon className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Dark Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Easy on the eyes
                </p>
                {theme === "dark" && (
                  <Check className="h-5 w-5 text-primary mx-auto mt-4" />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Color Schemes */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Color Schemes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(themes).map(([key, value]) => (
              <Card
                key={key}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-2",
                  colorScheme === key && "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
                onClick={() => setColorScheme(key as ThemeName)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="h-12 w-12 rounded-xl shadow-lg border-2 border-white"
                      style={{ backgroundColor: themeColors[key as ThemeName] }}
                    />
                    {colorScheme === key && (
                      <Check className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <CardTitle className="text-xl">{value.name}</CardTitle>
                  <CardDescription>
                    {key === "purple" && "Vibrant and modern"}
                    {key === "blue" && "Classic and professional"}
                    {key === "green" && "Fresh and natural"}
                    {key === "orange" && "Warm and energetic"}
                    {key === "rose" && "Elegant and refined"}
                    {key === "zinc" && "Minimal and clean"}
                    {key === "slate" && "Sophisticated gray"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Color Palette Preview */}
                  <div className="grid grid-cols-5 gap-2">
                    <div
                      className="h-10 rounded-md border"
                      style={{ backgroundColor: `hsl(${value.light.primary})` }}
                      title="Primary"
                    />
                    <div
                      className="h-10 rounded-md border"
                      style={{ backgroundColor: `hsl(${value.light.secondary})` }}
                      title="Secondary"
                    />
                    <div
                      className="h-10 rounded-md border"
                      style={{ backgroundColor: `hsl(${value.light.accent})` }}
                      title="Accent"
                    />
                    <div
                      className="h-10 rounded-md border"
                      style={{ backgroundColor: `hsl(${value.light.muted})` }}
                      title="Muted"
                    />
                    <div
                      className="h-10 rounded-md border"
                      style={{ backgroundColor: `hsl(${value.light.border})` }}
                      title="Border"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Component Preview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Component Preview</h2>
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Sample Components</CardTitle>
              <CardDescription>
                See how the theme looks with different UI elements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Buttons */}
              <div>
                <h3 className="text-sm font-medium mb-3">Buttons</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>

              {/* Badges */}
              <div>
                <h3 className="text-sm font-medium mb-3">Badges</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </div>

              {/* Cards */}
              <div>
                <h3 className="text-sm font-medium mb-3">Cards</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-gradient-to-br from-background via-background to-primary/5">
                    <h4 className="font-semibold mb-2">Card Title</h4>
                    <p className="text-sm text-muted-foreground">
                      Sample card content with gradient background
                    </p>
                  </Card>
                  <Card className="p-4 border-primary/30">
                    <h4 className="font-semibold mb-2">Highlighted</h4>
                    <p className="text-sm text-muted-foreground">
                      Card with primary border accent
                    </p>
                  </Card>
                  <Card className="p-4 hover:shadow-xl transition-all">
                    <h4 className="font-semibold mb-2">Interactive</h4>
                    <p className="text-sm text-muted-foreground">
                      Card with hover effects
                    </p>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

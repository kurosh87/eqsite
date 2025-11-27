"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brain, LayoutDashboard, LogOut, Settings, Gamepad2, Target } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSelector } from "@/components/language-selector";
import { useLanguage } from "@/components/language-provider";

interface ModernHeaderProps {
  user?: {
    displayName?: string | null;
    primaryEmail?: string | null;
    isAdmin?: boolean;
  } | null;
}

export function ModernHeader({ user }: ModernHeaderProps) {
  const { t } = useLanguage();
  const userInitials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.primaryEmail?.[0].toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Brain className="h-6 w-6" />
          </div>
          <span className="hidden font-bold text-xl sm:inline-block">
            EQ Platform
          </span>
        </Link>

        {/* Navigation */}
        {user && (
          <nav aria-label={t.a11y.mainNavigation} className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/assessment"
              className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1"
            >
              <Target className="h-4 w-4" />
              {t.nav.assessment}
            </Link>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {t.nav.dashboard}
            </Link>
            <Link
              href="/games"
              className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1"
            >
              <Gamepad2 className="h-4 w-4" />
              {t.nav.games}
            </Link>
          </nav>
        )}

        {/* User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector variant="icon" />
          <ThemeSwitcher />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                  aria-label={t.a11y.userMenu}
                >
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.displayName && (
                      <p className="font-medium">{user.displayName}</p>
                    )}
                    {user.primaryEmail && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.primaryEmail}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="me-2 h-4 w-4" />
                    {t.nav.dashboard}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <Settings className="me-2 h-4 w-4" />
                    {t.nav.settings}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/sign-out" className="cursor-pointer text-red-600">
                    <LogOut className="me-2 h-4 w-4" />
                    {t.nav.signOut}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost">{t.nav.signIn}</Button>
              </Link>
              <Link href="/sign-up">
                <Button>{t.nav.signUp}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { Dna } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Dna className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">Phenotype</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              {t.footer.description}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.product}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t.nav.upload}
                </Link>
              </li>
              <li>
                <Link href="/phenotypes" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t.nav.gallery}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t.nav.dashboard}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.legal}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t.legal.privacy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t.legal.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {t.footer.copyright.replace("2025", String(currentYear))}
          </p>
          <p className="text-xs text-muted-foreground">
            Results are for entertainment purposes only. Not a substitute for DNA testing.
          </p>
        </div>
      </div>
    </footer>
  );
}

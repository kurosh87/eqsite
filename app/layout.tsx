import "@/app/styles/globals.css";
import { ToastProvider } from "@/components/toast-provider";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { OrganizationSchema, WebApplicationSchema } from "@/components/structured-data";
import type { Metadata, Viewport } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://phenotype.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Phenotype - AI Ancestry & Heritage Analysis",
    template: "%s | Phenotype",
  },
  description:
    "Discover your ancestral heritage through advanced AI facial analysis. Get detailed phenotype matching, ancestry composition, and genetic heritage insights.",
  keywords: [
    "ancestry",
    "heritage",
    "phenotype",
    "AI analysis",
    "facial analysis",
    "genetic heritage",
    "ethnicity",
    "DNA",
    "genealogy",
  ],
  authors: [{ name: "Phenotype" }],
  creator: "Phenotype",
  publisher: "Phenotype",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Phenotype",
    title: "Phenotype - AI Ancestry & Heritage Analysis",
    description:
      "Discover your ancestral heritage through advanced AI facial analysis. Get detailed phenotype matching and genetic heritage insights.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Phenotype - AI Ancestry Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Phenotype - AI Ancestry & Heritage Analysis",
    description:
      "Discover your ancestral heritage through advanced AI facial analysis.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <OrganizationSchema />
        <WebApplicationSchema />
      </head>
      <body className={`min-h-screen flex flex-col antialiased`}>
        {/* Skip to content link for keyboard accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <ThemeProvider defaultTheme="light" defaultColorScheme="purple">
          <LanguageProvider>
            <AnalyticsProvider>
              <ToastProvider />
              {children}
            </AnalyticsProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

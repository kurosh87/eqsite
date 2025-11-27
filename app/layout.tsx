import "@/app/styles/globals.css";
import { ToastProvider } from "@/components/toast-provider";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { PWAProvider } from "@/components/pwa-provider";
import { OrganizationSchema, WebApplicationSchema } from "@/components/structured-data";
import type { Metadata, Viewport } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://eq-platform.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "EQ Platform - Emotional Intelligence Development",
    template: "%s | EQ Platform",
  },
  description:
    "Develop your emotional intelligence with personalized assessments, interactive games, AI coaching, and progress tracking. Master self-awareness, empathy, and social skills.",
  keywords: [
    "emotional intelligence",
    "EQ",
    "EI",
    "self-awareness",
    "empathy",
    "social skills",
    "emotional quotient",
    "personal development",
    "soft skills",
    "leadership",
  ],
  authors: [{ name: "EQ Platform" }],
  creator: "EQ Platform",
  publisher: "EQ Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "EQ Platform",
    title: "EQ Platform - Emotional Intelligence Development",
    description:
      "Develop your emotional intelligence with personalized assessments, AI coaching, and interactive learning. Master the 5 domains of EQ.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EQ Platform - Emotional Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EQ Platform - Emotional Intelligence Development",
    description:
      "Develop your emotional intelligence with personalized assessments and AI coaching.",
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
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EQ Platform",
  },
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
              <PWAProvider>
                <ToastProvider />
                {children}
              </PWAProvider>
            </AnalyticsProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

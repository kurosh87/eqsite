"use client";

import { useLanguage } from "@/components/language-provider";
import { ModernHeader } from "@/components/modern-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Brain,
  Shield,
  Heart,
  Flame,
  Users,
  Target,
  TrendingUp,
  Gamepad2,
  ChevronRight,
  Star,
  CheckCircle,
  Sparkles,
  BarChart3,
  BookOpen,
  Trophy,
} from "lucide-react";
import { Footer } from "@/components/footer";

interface HomePageContentProps {
  user: {
    displayName?: string | null;
    primaryEmail?: string | null;
  } | null;
}

const DOMAIN_DATA = [
  {
    icon: Brain,
    name: "Self-Awareness",
    description: "Recognize and understand your own emotions",
    color: "#8B5CF6",
  },
  {
    icon: Shield,
    name: "Self-Regulation",
    description: "Manage your emotions and impulses effectively",
    color: "#3B82F6",
  },
  {
    icon: Flame,
    name: "Motivation",
    description: "Harness your inner drive to achieve goals",
    color: "#F59E0B",
  },
  {
    icon: Heart,
    name: "Empathy",
    description: "Understand and share others' feelings",
    color: "#EC4899",
  },
  {
    icon: Users,
    name: "Social Skills",
    description: "Build strong, lasting relationships",
    color: "#10B981",
  },
];

export function HomePageContent({ user }: HomePageContentProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/20">
      <ModernHeader user={user} />

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 gradient-mesh opacity-50" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />

          <div className="container relative px-4 md:px-6 py-16 md:py-24 lg:py-32">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t.home.hero.badge}
                </div>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  {t.home.hero.title}
                  <span className="block text-primary mt-2">{t.home.hero.titleHighlight}</span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  {t.home.hero.subtitle}
                </p>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap justify-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{t.home.stats.users}</div>
                  <div className="text-sm text-muted-foreground">{t.home.stats.usersDesc}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{t.home.stats.assessments}</div>
                  <div className="text-sm text-muted-foreground">{t.home.stats.assessmentsDesc}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{t.home.stats.improvement}</div>
                  <div className="text-sm text-muted-foreground">{t.home.stats.improvementDesc}</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href={user ? "/assessment" : "/sign-up"}>
                  <Button size="lg" className="h-14 px-10 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                    {t.home.hero.cta}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {!user && (
                  <Link href="/sign-in">
                    <Button size="lg" variant="outline" className="h-14 px-10 text-base font-semibold">
                      {t.home.hero.ctaSignIn}
                    </Button>
                  </Link>
                )}
              </div>

              <p className="text-sm text-muted-foreground">{t.home.hero.freeTest}</p>
            </div>
          </div>
        </section>

        {/* 5 Domains Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">{t.home.domains.badge}</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                {t.home.domains.title}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t.home.domains.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {DOMAIN_DATA.map((domain) => {
                const Icon = domain.icon;
                return (
                  <Card
                    key={domain.name}
                    className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/30"
                  >
                    <div
                      className="h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: `${domain.color}20` }}
                    >
                      <Icon className="h-8 w-8" style={{ color: domain.color }} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{domain.name}</h3>
                    <p className="text-sm text-muted-foreground">{domain.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">{t.home.howItWorks.badge}</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                {t.home.howItWorks.title}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t.home.howItWorks.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                      <Target className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">{t.home.howItWorks.step1Title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.home.howItWorks.step1Desc}
                  </p>
                </div>
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary to-transparent" />
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                      <BarChart3 className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">{t.home.howItWorks.step2Title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.home.howItWorks.step2Desc}
                  </p>
                </div>
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary to-transparent" />
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                      <TrendingUp className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">{t.home.howItWorks.step3Title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t.home.howItWorks.step3Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">{t.home.features.badge}</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                {t.home.features.title}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t.home.features.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-purple-500/30">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t.home.features.scientificTitle}</h3>
                <p className="text-sm text-muted-foreground">{t.home.features.scientificDesc}</p>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-blue-500/30">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t.home.features.personalizedTitle}</h3>
                <p className="text-sm text-muted-foreground">{t.home.features.personalizedDesc}</p>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-green-500/30">
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t.home.features.progressTitle}</h3>
                <p className="text-sm text-muted-foreground">{t.home.features.progressDesc}</p>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-amber-500/30">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <Gamepad2 className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t.home.features.gamesTitle}</h3>
                <p className="text-sm text-muted-foreground">{t.home.features.gamesDesc}</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">{t.home.pricing.badge}</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                {t.home.pricing.title}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t.home.pricing.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <Card className="p-8 border-2">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold">{t.home.pricing.freeTitle}</h3>
                    <p className="text-4xl font-bold mt-2">{t.home.pricing.freePrice}</p>
                    <p className="text-sm text-muted-foreground">Forever free</p>
                  </div>
                  <ul className="space-y-3">
                    {t.home.pricing.freeFeatures.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={user ? "/assessment" : "/sign-up"} className="block">
                    <Button variant="outline" className="w-full" size="lg">
                      {t.home.pricing.startFree}
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Pro Plan */}
              <Card className="p-8 border-2 border-primary bg-primary/5 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    {t.home.pricing.recommended}
                  </Badge>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold">{t.home.pricing.proTitle}</h3>
                    <p className="text-4xl font-bold mt-2">{t.home.pricing.proPrice}</p>
                    <p className="text-sm text-muted-foreground">or {t.home.pricing.proYearlyPrice}</p>
                  </div>
                  <ul className="space-y-3">
                    {t.home.pricing.proFeatures.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={user ? "/dashboard" : "/sign-up"} className="block">
                    <Button className="w-full" size="lg">
                      {t.home.pricing.goPro}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <Card className="p-8 md:p-12 bg-gradient-to-br from-background via-background to-background border-2">
                <div className="text-center space-y-6">
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-xl md:text-2xl font-medium italic">
                    &ldquo;{t.home.testimonial.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">S</span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{t.home.testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{t.home.testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 gradient-mesh">
          <div className="container px-4 md:px-6">
            <Card className="max-w-3xl mx-auto p-12 text-center shadow-2xl bg-background/95 backdrop-blur">
              <div className="space-y-6">
                <Trophy className="h-12 w-12 text-primary mx-auto" />
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  {t.home.cta.title}
                </h2>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  {t.home.cta.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href={user ? "/assessment" : "/sign-up"}>
                    <Button size="lg" className="h-14 px-10 text-base font-semibold shadow-lg">
                      {t.home.cta.button}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

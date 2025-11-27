"use client";

import { useLanguage } from "@/components/language-provider";
import { ModernHeader } from "@/components/modern-header";
import { SmartPhotoUploader } from "@/components/smart-photo-uploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Upload,
  Scan,
  FileText,
  Globe,
  Dna,
  Clock,
  ChevronRight,
  Star,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { Footer } from "@/components/footer";

interface HomePageContentProps {
  user: {
    displayName?: string | null;
    primaryEmail?: string | null;
  } | null;
}

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
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Text */}
              <div className="space-y-8 text-center lg:text-left">
                <div className="space-y-4">
                  <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                    <Shield className="mr-2 h-4 w-4" />
                    {t.home.hero.badge}
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    {t.home.hero.title}
                    <span className="block text-primary mt-2">{t.home.hero.titleHighlight}</span>
                  </h1>

                  <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                    {t.home.hero.subtitle}
                  </p>
                </div>

                {/* Value Props Row */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{t.home.stats.free}</div>
                      <div className="text-xs text-muted-foreground">{t.home.stats.freeDesc}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{t.home.stats.instant}</div>
                      <div className="text-xs text-muted-foreground">{t.home.stats.instantDesc}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{t.home.stats.ethnicities}</div>
                      <div className="text-xs text-muted-foreground">{t.home.stats.ethnicitiesDesc}</div>
                    </div>
                  </div>
                </div>

                {!user && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                    <Link href="/sign-up">
                      <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                        {t.home.hero.cta}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/sign-in">
                      <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold">
                        {t.home.hero.ctaSignIn}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Right Column - Upload */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-3xl blur-2xl opacity-50" />
                <div className="relative">
                  <SmartPhotoUploader />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-muted/30">
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
                      <Upload className="h-10 w-10 text-primary-foreground" />
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
                      <Scan className="h-10 w-10 text-primary-foreground" />
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
                      <FileText className="h-10 w-10 text-primary-foreground" />
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

        {/* Sample Results Preview */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">{t.reports.premium}</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                {t.analysis.title}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t.gallery.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Sample Match Card 1 */}
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/30">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      High Match
                    </Badge>
                    <span className="text-2xl font-bold text-primary">85%</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Mediterranean</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      Southern Europe
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    Olive skin tone, dark wavy hair, prominent nose bridge characteristic of
                    Southern European coastal populations...
                  </p>
                </div>
              </Card>

              {/* Sample Match Card 2 */}
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/30">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                      Strong Match
                    </Badge>
                    <span className="text-2xl font-bold text-primary">72%</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Levantine</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      Eastern Mediterranean
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    Aquiline nose, almond-shaped eyes, warm undertones typical of
                    ancient Phoenician and Canaanite populations...
                  </p>
                </div>
              </Card>

              {/* Sample Match Card 3 */}
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/30">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                      Notable Match
                    </Badge>
                    <span className="text-2xl font-bold text-primary">58%</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Anatolian</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      Asia Minor
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    High cheekbones, medium skin tone, mixing of European and
                    Near Eastern characteristics...
                  </p>
                </div>
              </Card>

              {/* Feature Card */}
              <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
                <div className="space-y-4 h-full flex flex-col justify-center text-center">
                  <Dna className="h-10 w-10 text-primary mx-auto" />
                  <h3 className="font-bold text-lg">Plus Much More</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• {t.analysis.haplogroups}</li>
                    <li>• {t.analysis.facialFeatures}</li>
                    <li>• Historical context</li>
                    <li>• {t.analysis.migrationStory}</li>
                  </ul>
                </div>
              </Card>
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

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-emerald-500/30 group">
                <div className="flex justify-center mb-6">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <Shield className="h-10 w-10 text-emerald-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {t.home.features.privateTitle}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t.home.features.privateDesc}
                </p>
              </Card>

              <Card className="p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-blue-500/30 group">
                <div className="flex justify-center mb-6">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <Zap className="h-10 w-10 text-blue-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {t.home.features.noDnaTitle}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t.home.features.noDnaDesc}
                </p>
              </Card>

              <Card className="p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-purple-500/30 group">
                <div className="flex justify-center mb-6">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <TrendingUp className="h-10 w-10 text-purple-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {t.home.features.scientificTitle}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t.home.features.scientificDesc}
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">{t.home.comparison.badge}</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                {t.home.comparison.title}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t.home.comparison.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Traditional DNA Tests */}
              <Card className="p-8 border-2 border-muted">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-muted-foreground">{t.home.comparison.dnaTitle}</h3>
                    <p className="text-3xl font-bold mt-2 text-muted-foreground">{t.home.comparison.dnaPrice}</p>
                  </div>
                  <ul className="space-y-3">
                    {t.home.comparison.dnaFeatures.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-muted-foreground">
                        <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs">✗</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* Phenotype Analysis */}
              <Card className="p-8 border-2 border-primary bg-primary/5 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">{t.home.comparison.recommended}</Badge>
                </div>
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold">{t.home.comparison.phenotypeTitle}</h3>
                    <p className="text-3xl font-bold mt-2 text-primary">{t.home.comparison.phenotypePrice}</p>
                  </div>
                  <ul className="space-y-3">
                    {t.home.comparison.phenotypeFeatures.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonial/Social Proof */}
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
                      <span className="text-lg font-bold text-primary">M</span>
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
                <Dna className="h-12 w-12 text-primary mx-auto" />
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  {t.home.cta.title}
                </h2>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  {t.home.cta.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  {user ? (
                    <Link href="/#upload">
                      <Button size="lg" className="h-14 px-10 text-base font-semibold">
                        <Upload className="mr-2 h-5 w-5" />
                        {t.home.cta.uploadButton}
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/sign-up">
                        <Button size="lg" className="h-14 px-10 text-base font-semibold shadow-lg">
                          {t.home.cta.startButton}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/sign-in">
                        <Button size="lg" variant="outline" className="h-14 px-10 text-base font-semibold">
                          {t.home.hero.ctaSignIn}
                        </Button>
                      </Link>
                    </>
                  )}
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

"use client";

import { useLanguage } from "@/components/language-provider";
import { ModernHeader } from "@/components/modern-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, MapPin, Network, Sparkles } from "lucide-react";
import LazyPhenotypeMap from "@/components/LazyPhenotypeMap";
import Image from "next/image";

interface PhenotypeDetailContentProps {
  user: {
    displayName?: string | null;
    primaryEmail?: string | null;
    isAdmin?: boolean;
  };
  phenotype: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    regions?: string[];
    countries?: string[];
    parentGroups?: string[];
    connectionScore: number;
    isBasic?: boolean;
    relatedPhenotypes?: any[];
    metadata?: any;
  };
}

export function PhenotypeDetailContent({ user, phenotype }: PhenotypeDetailContentProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-background">
      <ModernHeader user={user} />

      <main id="main-content" className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link href="/phenotypes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
              {t.common.back}
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {phenotype.name}
              </h1>
              {phenotype.regions && phenotype.regions.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {phenotype.regions.map((region: string) => (
                    <Badge key={region} variant="secondary">
                      {region}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 items-end">
              {phenotype.connectionScore > 0 && (
                <Badge className="bg-primary text-sm px-4 py-2">
                  <Network className="w-4 h-4 me-2" />
                  {phenotype.connectionScore} {t.phenotypes.connections}
                </Badge>
              )}

              {phenotype.isBasic && (
                <Badge className="bg-blue-500 text-sm px-4 py-2">
                  <Sparkles className="w-4 h-4 me-2" />
                  {t.phenotypes.basicGroup}
                </Badge>
              )}
            </div>
          </div>

          {phenotype.parentGroups && phenotype.parentGroups.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {t.phenotypes.parentGroups}:
              </h3>
              <div className="flex flex-wrap gap-2">
                {phenotype.parentGroups.map((group: string) => (
                  <Badge key={group} variant="outline" className="text-sm">
                    {group}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {phenotype.countries && phenotype.countries.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {t.phenotypes.countries}:
              </h3>
              <div className="flex flex-wrap gap-2">
                {phenotype.countries.map((country: string) => (
                  <Badge key={country} variant="outline" className="text-xs">
                    {country}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {phenotype.description && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-3">{t.phenotypes.description}</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {phenotype.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Related Phenotypes */}
        {phenotype.relatedPhenotypes && phenotype.relatedPhenotypes.length > 0 && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Network className="w-5 h-5 text-primary" />
                {t.phenotypes.relatedPhenotypes} ({phenotype.relatedPhenotypes.length})
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t.phenotypes.relatedDescription}
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {phenotype.relatedPhenotypes.map((related: any) => (
                  <Link
                    key={related.id}
                    href={`/phenotypes/${related.id}`}
                    className="block"
                  >
                    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-2 group cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={related.imageUrl}
                              alt={related.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                              {related.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant={
                                  related.relationType === "similar"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {related.relationType}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {(related.strength * 100).toFixed(0)}% {t.analysis.match}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Geographic Distribution Map */}
        {phenotype.metadata?.distributionGeojson && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">
                {t.phenotypes.geographicDistribution}
              </h2>
              <LazyPhenotypeMap
                geojson={phenotype.metadata.distributionGeojson}
                phenotypeName={phenotype.name}
                className="h-[400px] border border-border rounded-lg"
              />

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>{t.phenotypes.colorLegend}:</strong> {t.phenotypes.colorLegendDescription}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        {phenotype.metadata && Object.keys(phenotype.metadata).length > 0 && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">{t.phenotypes.statistics}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {phenotype.metadata.similar_count !== undefined && (
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {phenotype.metadata.similar_count}
                    </div>
                    <div className="text-sm text-muted-foreground">{t.phenotypes.similarTypes}</div>
                  </div>
                )}

                {phenotype.metadata.related_count !== undefined && (
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {phenotype.metadata.related_count}
                    </div>
                    <div className="text-sm text-muted-foreground">{t.phenotypes.relatedTypes}</div>
                  </div>
                )}

                {phenotype.metadata.total_connections !== undefined && (
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {phenotype.metadata.total_connections}
                    </div>
                    <div className="text-sm text-muted-foreground">{t.phenotypes.totalConnections}</div>
                  </div>
                )}

                {phenotype.connectionScore > 0 && (
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {phenotype.connectionScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">{t.phenotypes.connectionScore}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link href="/phenotypes" className="flex-1">
            <Button variant="outline" className="w-full">
              {t.phenotypes.browseMore}
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button className="w-full">
              <Sparkles className="w-4 h-4 me-2" />
              {t.phenotypes.tryYourPhoto}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

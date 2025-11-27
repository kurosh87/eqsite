/* eslint-disable @next/next/no-img-element -- phenotype listing surfaces remote imagery */

import { redirect } from "next/navigation";
import { stackServerApp } from "@/app/stack";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phenotype Gallery",
  description:
    "Browse our comprehensive database of ethnic phenotypes from around the world. Explore facial features, geographic origins, and ancestral heritage patterns.",
  openGraph: {
    title: "Phenotype Gallery - Explore World Phenotypes",
    description:
      "Browse our comprehensive database of ethnic phenotypes from around the world.",
  },
};
import { ModernHeader } from "@/components/modern-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhenotypeFilterControls } from "@/components/phenotype-filter-controls";
import Link from "next/link";
import { ArrowLeft, MapPin, Sparkles, Search, Network, TrendingUp } from "lucide-react";
import {
  getAllPhenotypes,
  getRegionsWithCounts,
  getTopConnectedPhenotypes,
} from "@/lib/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ region?: string; sort?: string; search?: string }>;
}

export default async function PhenotypesPage({ searchParams }: PageProps) {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const { region, sort, search } = params;

  // Fetch data
  const allPhenotypes = await getAllPhenotypes();
  const regions = await getRegionsWithCounts();
  const regionOptions = regions.map((region: any) => ({
    region: region.region,
    count: Number(region.count ?? 0),
  }));
  const topConnected = await getTopConnectedPhenotypes(10);

  // Filter phenotypes based on region
  let phenotypes = allPhenotypes;
  if (region && region !== "all") {
    phenotypes = allPhenotypes.filter((p: any) =>
      p.regions?.includes(region)
    );
  }

  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase();
    phenotypes = phenotypes.filter((p: any) =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower)
    );
  }

  // Sort phenotypes
  if (sort === "connection") {
    phenotypes.sort((a: any, b: any) =>
      (b.connectionScore || 0) - (a.connectionScore || 0)
    );
  } else if (sort === "name") {
    phenotypes.sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  const userData = {
    displayName: user.displayName,
    primaryEmail: user.primaryEmail,
    isAdmin: user.isAdmin,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ModernHeader user={userData} />

      <main className="flex-1 gradient-mesh">
        <div className="container mx-auto px-4 py-12 md:py-16">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <Link href="/">
              <Button variant="ghost" className="mb-6 hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    Phenotype Gallery
                  </h1>
                  <p className="text-muted-foreground text-lg mt-1">
                    Browse all {allPhenotypes.length} reference phenotypes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <Card className="mb-8 border-2 shadow-lg">
            <CardContent className="pt-6">
              <PhenotypeFilterControls
                totalPhenotypes={allPhenotypes.length}
                regions={regionOptions}
                initialSearch={search}
                initialRegion={region}
                initialSort={sort}
                enableSort
              />

              {/* Active Filters */}
              {(region || search) && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    Active filters:
                  </span>
                  {region && region !== "all" && (
                    <Badge variant="secondary">
                      <MapPin className="w-3 h-3 mr-1" />
                      {region}
                    </Badge>
                  )}
                  {search && (
                    <Badge variant="secondary">
                      <Search className="w-3 h-3 mr-1" />
                      &quot;{search}&quot;
                    </Badge>
                  )}
                  <Link href="/phenotypes">
                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                      Clear all
                    </Button>
                  </Link>
                </div>
              )}

              {/* Results Count */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Badge variant="outline" className="text-sm">
                  <Search className="w-3 h-3 mr-2" />
                  Showing {phenotypes.length} phenotypes
                </Badge>

                {topConnected.length > 0 && !sort && (
                  <Link href="/phenotypes?sort=connection">
                    <Button variant="ghost" size="sm" className="text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      View Most Connected
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Phenotype Grid */}
          {phenotypes.length === 0 ? (
            <Card className="border-2 shadow-lg">
              <CardContent className="py-16 text-center">
                <div className="flex justify-center mb-6">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Search className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  No phenotypes found
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Try adjusting your filters or search terms
                </p>
                <Link href="/phenotypes">
                  <Button size="lg">Clear Filters</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
              {phenotypes.map((phenotype: any) => (
                <Link key={phenotype.id} href={`/phenotypes/${phenotype.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 group cursor-pointer">
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={phenotype.imageUrl}
                        alt={phenotype.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Connection Score Badge */}
                      {phenotype.connectionScore > 0 && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-primary/90 backdrop-blur">
                            <Network className="w-3 h-3 mr-1" />
                            {phenotype.connectionScore}
                          </Badge>
                        </div>
                      )}

                      {/* Basic Group Badge */}
                      {phenotype.isBasic && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-blue-500/90 backdrop-blur">
                            Basic Group
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-5">
                      <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors">
                        {phenotype.name}
                      </h3>

                      {/* Regions */}
                      {phenotype.regions && phenotype.regions.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {phenotype.regions.slice(0, 2).map((region: string) => (
                            <Badge key={region} variant="secondary" className="text-xs font-medium">
                              <MapPin className="w-3 h-3 mr-1" />
                              {region}
                            </Badge>
                          ))}
                          {phenotype.regions.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{phenotype.regions.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      {phenotype.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {phenotype.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          {phenotypes.length > 0 && (
            <div className="mt-12 text-center animate-fade-in">
              <Link href="/">
                <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50 inline-block">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold mb-1">Try Your Own Photo</h3>
                      <p className="text-muted-foreground text-sm">
                        Upload a photo to find your phenotype matches
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dna,
  Globe,
  Calendar,
  Users,
  MapPin,
  BookOpen,
  Sparkles,
  ChevronRight,
  AlertCircle,
  History,
} from "lucide-react";
import { getHaplogroupColor, getHaplogroupColorWithOpacity } from "@/lib/haplogroup-colors";

interface FrequencyRegion {
  region: string;
  percentage: number;
  population?: string;
}

interface NotableFigure {
  name: string;
  description?: string;
  verified?: boolean;
}

interface RelatedHaplogroup {
  name: string;
  relationship: "parent" | "child" | "sibling";
}

interface ScientificDetails {
  snps?: string[];
  mutations?: string[];
  subclade_count?: number;
  discovery_year?: number;
}

interface HaplogroupData {
  id: string;
  name: string;
  type: "paternal" | "maternal";
  fullName?: string;
  shortDescription?: string;
  description?: string;
  originRegion?: string;
  estimatedAge?: string;
  peakFrequencyRegions?: FrequencyRegion[];
  migrationHistory?: string;
  notableFigures?: NotableFigure[];
  relatedHaplogroups?: RelatedHaplogroup[];
  associatedEthnicities?: string[];
  scientificDetails?: ScientificDetails;
  displayColor?: string;
}

interface HaplogroupSheetProps {
  haplogroupName: string | null;
  type: "paternal" | "maternal";
  onClose: () => void;
  isOpen: boolean;
}

export function HaplogroupSheet({
  haplogroupName,
  type,
  onClose,
  isOpen,
}: HaplogroupSheetProps) {
  const [data, setData] = useState<HaplogroupData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchType, setMatchType] = useState<string>("exact");
  const [matchedParent, setMatchedParent] = useState<string | null>(null);

  useEffect(() => {
    if (!haplogroupName || !isOpen) {
      setData(null);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setMatchType("exact");
      setMatchedParent(null);

      try {
        const response = await fetch(
          `/api/haplogroups?name=${encodeURIComponent(haplogroupName)}`
        );
        const result = await response.json();

        if (response.ok && result.haplogroup) {
          setData(result.haplogroup);
          setMatchType(result.matchType || "exact");
          setMatchedParent(result.matchedParent || null);
        } else {
          setError(result.error || "Haplogroup not found");
        }
      } catch (err) {
        setError("Failed to fetch haplogroup data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [haplogroupName, isOpen]);

  // Get haplogroup-specific color based on the name
  const haplogroupColor = haplogroupName
    ? getHaplogroupColor(haplogroupName, type)
    : type === "paternal" ? "#3B82F6" : "#EC4899";

  const haplogroupBgColor = haplogroupName
    ? getHaplogroupColorWithOpacity(haplogroupName, type, 0.1)
    : type === "paternal" ? "rgba(59, 130, 246, 0.1)" : "rgba(236, 72, 153, 0.1)";

  const haplogroupBorderColor = haplogroupName
    ? getHaplogroupColorWithOpacity(haplogroupName, type, 0.2)
    : type === "paternal" ? "rgba(59, 130, 246, 0.2)" : "rgba(236, 72, 153, 0.2)";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center border"
              style={{
                backgroundColor: haplogroupBgColor,
                borderColor: haplogroupBorderColor,
              }}
            >
              <Dna className="h-5 w-5" style={{ color: haplogroupColor }} />
            </div>
            <div>
              <span className="text-2xl font-bold">
                {haplogroupName || "Loading..."}
              </span>
              <Badge className="ms-2" style={{ backgroundColor: haplogroupColor }}>
                {type === "paternal" ? "Y-DNA" : "mtDNA"}
              </Badge>
            </div>
          </SheetTitle>
          {data?.shortDescription && (
            <SheetDescription className="text-base mt-2">
              {data.shortDescription}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          {error && (
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: haplogroupBgColor,
                borderColor: haplogroupBorderColor,
              }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5" style={{ color: haplogroupColor }} />
                <div>
                  <p className="font-medium">Haplogroup data not available</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error}. The AI-generated description is shown above.
                  </p>
                </div>
              </div>
            </div>
          )}

          {matchType === "parent" && matchedParent && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <span className="font-medium">Note:</span> Showing data for{" "}
                <span className="font-bold">{matchedParent}</span>, the parent
                haplogroup of {haplogroupName}.
              </p>
            </div>
          )}

          {data && !loading && (
            <>
              {/* Full Name */}
              {data.fullName && (
                <div className="text-sm text-muted-foreground">
                  Scientific name: <span className="font-mono">{data.fullName}</span>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                {data.originRegion && (
                  <div
                    className="p-3 rounded-lg border"
                    style={{
                      backgroundColor: haplogroupBgColor,
                      borderColor: haplogroupBorderColor,
                    }}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Globe className="h-3 w-3" />
                      Origin
                    </div>
                    <div className="font-medium text-sm">{data.originRegion}</div>
                  </div>
                )}
                {data.estimatedAge && (
                  <div
                    className="p-3 rounded-lg border"
                    style={{
                      backgroundColor: haplogroupBgColor,
                      borderColor: haplogroupBorderColor,
                    }}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3" />
                      Age
                    </div>
                    <div className="font-medium text-sm">{data.estimatedAge}</div>
                  </div>
                )}
              </div>

              {/* Description */}
              {data.description && (
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4" />
                    Overview
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {data.description}
                  </p>
                </div>
              )}

              <Separator />

              {/* Peak Frequency Regions */}
              {data.peakFrequencyRegions && data.peakFrequencyRegions.length > 0 && (
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4" />
                    Geographic Distribution
                  </h4>
                  <div className="space-y-3">
                    {data.peakFrequencyRegions.map((region, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>
                            {region.region}
                            {region.population && (
                              <span className="text-muted-foreground ml-1">
                                ({region.population})
                              </span>
                            )}
                          </span>
                          <span className="font-bold">{region.percentage}%</span>
                        </div>
                        <Progress
                          value={region.percentage}
                          className="h-2"
                          style={{
                            // @ts-ignore - custom CSS variable
                            "--progress-background": data.displayColor || haplogroupColor,
                          } as React.CSSProperties}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Migration History */}
              {data.migrationHistory && (
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <History className="h-4 w-4" />
                    Migration History
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {data.migrationHistory}
                  </p>
                </div>
              )}

              {/* Associated Ethnicities */}
              {data.associatedEthnicities && data.associatedEthnicities.length > 0 && (
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    Associated Populations
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.associatedEthnicities.map((ethnicity, idx) => (
                      <Badge key={idx} variant="secondary">
                        {ethnicity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Notable Figures */}
              {data.notableFigures && data.notableFigures.length > 0 && (
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4" />
                    Notable Carriers
                  </h4>
                  <div className="space-y-2">
                    {data.notableFigures.map((figure, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-sm"
                      >
                        <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">{figure.name}</span>
                          {figure.description && (
                            <span className="text-muted-foreground">
                              {" "}
                              — {figure.description}
                            </span>
                          )}
                          {figure.verified && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Haplogroups */}
              {data.relatedHaplogroups && data.relatedHaplogroups.length > 0 && (
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Dna className="h-4 w-4" />
                    Related Haplogroups
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.relatedHaplogroups.map((related, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted transition-colors"
                      >
                        {related.name}
                        <span className="ms-1 text-xs text-muted-foreground">
                          ({related.relationship})
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Scientific Details */}
              {data.scientificDetails && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-sm mb-3">
                    Scientific Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {data.scientificDetails.snps &&
                      data.scientificDetails.snps.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">
                            Defining SNPs:
                          </span>
                          <div className="font-mono text-xs mt-1">
                            {data.scientificDetails.snps.join(", ")}
                          </div>
                        </div>
                      )}
                    {data.scientificDetails.subclade_count && (
                      <div>
                        <span className="text-muted-foreground">Subclades:</span>
                        <div className="font-medium">
                          {data.scientificDetails.subclade_count}+
                        </div>
                      </div>
                    )}
                    {data.scientificDetails.discovery_year && (
                      <div>
                        <span className="text-muted-foreground">Discovered:</span>
                        <div className="font-medium">
                          {data.scientificDetails.discovery_year}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronRight, Globe, Dna, ExternalLink, Info, MapPin, List, Map, Earth } from "lucide-react";
import { HaplogroupSheet } from "./haplogroup-sheet";
import { AncestryMap } from "./ancestry-map";
import { HaplogroupWorldMap } from "./haplogroup-world-map";
import { cn } from "@/lib/utils";
import { getHaplogroupColor, getHaplogroupColorWithOpacity } from "@/lib/haplogroup-colors";

// Types for hierarchical ancestry data (23andMe-style)
interface Population {
  name: string;
  percentage: number;
}

interface Subregion {
  region: string;
  percentage: number;
  populations?: Population[];
}

interface AncestryRegion {
  region: string;
  percentage: number;
  color?: string;
  subregions?: Subregion[];
}

interface HaplogroupInfo {
  haplogroup: string;
  description: string;
}

interface Haplogroups {
  paternal?: HaplogroupInfo;
  maternal?: HaplogroupInfo;
}

// Flat structure for backwards compatibility
interface FlatAncestryComponent {
  region: string;
  percentage: number;
  confidence?: string;
}

interface AncestryCompositionProps {
  data: AncestryRegion[] | FlatAncestryComponent[];
  haplogroups?: Haplogroups | null;
}

// Default colors for regions - more vibrant 23andMe-style colors
const DEFAULT_REGION_COLORS: Record<string, string> = {
  "European": "#5B8DEF",
  "Northwestern European": "#5B8DEF",
  "Southern European": "#7BA3F0",
  "Eastern European": "#4A7DE0",
  "Sub-Saharan African": "#E67E22",
  "West African": "#E67E22",
  "East African": "#F39C12",
  "Central African": "#D35400",
  "East Asian": "#27AE60",
  "Chinese": "#27AE60",
  "Japanese": "#2ECC71",
  "Korean": "#1ABC9C",
  "Southeast Asian": "#16A085",
  "Indigenous American": "#9B59B6",
  "Native American": "#9B59B6",
  "Middle Eastern": "#F1C40F",
  "Western Asian": "#F1C40F",
  "North African": "#E59866",
  "South Asian": "#E74C3C",
  "Central Asian": "#C0392B",
  "Oceanian": "#3498DB",
  "Melanesian": "#2980B9",
};

const FALLBACK_COLORS = [
  "#5B8DEF", "#E67E22", "#27AE60", "#9B59B6",
  "#F1C40F", "#E74C3C", "#E59866", "#3498DB",
  "#16A085", "#E91E63", "#FF9800", "#00BCD4"
];

function getRegionColor(region: string, index: number, providedColor?: string): string {
  if (providedColor) return providedColor;

  // Check for partial matches in default colors
  for (const [key, color] of Object.entries(DEFAULT_REGION_COLORS)) {
    if (region.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(region.toLowerCase())) {
      return color;
    }
  }

  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function isHierarchical(data: AncestryRegion[] | FlatAncestryComponent[]): data is AncestryRegion[] {
  if (!data || data.length === 0) return false;
  return (data[0] as AncestryRegion).subregions !== undefined || (data[0] as AncestryRegion).color !== undefined;
}

// 23andMe-style ancestry percentage bar
function AncestryBar({ data }: { data: AncestryRegion[] }) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="relative mb-8">
      {/* Main ancestry bar */}
      <div className="h-12 rounded-xl overflow-hidden flex shadow-lg ring-1 ring-black/5 dark:ring-white/10">
        {sortedData.map((region, idx) => {
          const color = getRegionColor(region.region, idx, region.color);
          const isHovered = hoveredRegion === region.region;

          return (
            <div
              key={region.region}
              className={cn(
                "relative transition-all duration-300 cursor-pointer",
                isHovered && "z-10 scale-y-110"
              )}
              style={{
                width: `${region.percentage}%`,
                backgroundColor: color,
                minWidth: region.percentage > 0 ? "8px" : "0",
                boxShadow: isHovered ? `0 0 20px ${color}60` : undefined,
              }}
              onMouseEnter={() => setHoveredRegion(region.region)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              {/* Gradient overlay for depth */}
              <div
                className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"
                style={{ mixBlendMode: "overlay" }}
              />

              {/* Hover tooltip */}
              <div className={cn(
                "absolute bottom-full left-1/2 -translate-x-1/2 mb-3 transition-all duration-200",
                isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              )}>
                <div className="px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg shadow-xl border whitespace-nowrap">
                  <div className="font-semibold">{region.region}</div>
                  <div className="text-lg font-bold" style={{ color }}>{region.percentage.toFixed(1)}%</div>
                </div>
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-popover"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Percentage markers */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

// Region card for hierarchical display
function RegionCard({
  region,
  index,
  isExpanded,
  onToggle,
  expandedSubregions,
  onToggleSubregion,
}: {
  region: AncestryRegion;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  expandedSubregions: Set<string>;
  onToggleSubregion: (key: string) => void;
}) {
  const color = getRegionColor(region.region, index, region.color);
  const hasSubregions = region.subregions && region.subregions.length > 0;

  return (
    <div className="rounded-xl overflow-hidden border bg-card transition-all duration-300 hover:shadow-md">
      {/* Region header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 text-left transition-colors hover:bg-muted/50"
      >
        {/* Color indicator */}
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner"
          style={{ backgroundColor: `${color}20` }}
        >
          <div
            className="h-6 w-6 rounded-lg shadow-md"
            style={{ backgroundColor: color }}
          />
        </div>

        {/* Region info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg truncate">{region.region}</h3>
            {hasSubregions && (
              <Badge variant="secondary" className="text-xs">
                {region.subregions!.length} subregion{region.subregions!.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            {/* Mini progress bar */}
            <div className="h-2 flex-1 max-w-32 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${region.percentage}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {region.percentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Percentage badge */}
        <div
          className="text-2xl font-bold tabular-nums"
          style={{ color }}
        >
          {region.percentage.toFixed(1)}%
        </div>

        {/* Expand indicator */}
        {hasSubregions && (
          <div className="text-muted-foreground">
            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>
        )}
      </button>

      {/* Subregions */}
      {hasSubregions && isExpanded && (
        <div className="border-t bg-muted/30">
          {region.subregions!
            .sort((a, b) => b.percentage - a.percentage)
            .map((subregion) => {
              const subKey = `${region.region}-${subregion.region}`;
              const hasPopulations = subregion.populations && subregion.populations.length > 0;
              const subExpanded = expandedSubregions.has(subKey);

              return (
                <div key={subregion.region} className="border-b last:border-b-0">
                  {/* Subregion row */}
                  <button
                    onClick={() => hasPopulations && onToggleSubregion(subKey)}
                    className={cn(
                      "w-full px-6 py-3 flex items-center gap-3 text-left transition-colors",
                      hasPopulations && "hover:bg-muted/50 cursor-pointer"
                    )}
                  >
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color, opacity: 0.7 }}
                    />
                    <span className="font-medium flex-1">{subregion.region}</span>
                    <span className="text-sm font-semibold tabular-nums" style={{ color }}>
                      {subregion.percentage.toFixed(1)}%
                    </span>
                    {hasPopulations && (
                      <span className="text-muted-foreground">
                        {subExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </span>
                    )}
                  </button>

                  {/* Populations */}
                  {hasPopulations && subExpanded && (
                    <div className="bg-background/50 px-6 py-2 space-y-1">
                      {subregion.populations!
                        .sort((a, b) => b.percentage - a.percentage)
                        .map((pop) => (
                          <div key={pop.name} className="flex items-center gap-3 py-1.5 pl-6">
                            <div
                              className="h-2 w-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color, opacity: 0.5 }}
                            />
                            <span className="text-sm flex-1 text-muted-foreground">{pop.name}</span>
                            <span className="text-sm tabular-nums text-muted-foreground">
                              {pop.percentage.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

function HierarchicalAncestry({ data }: { data: AncestryRegion[] }) {
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(
    new Set(data.slice(0, 2).map(r => r.region)) // Expand top 2 by default
  );
  const [expandedSubregions, setExpandedSubregions] = useState<Set<string>>(new Set());

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => {
      const next = new Set(prev);
      if (next.has(region)) {
        next.delete(region);
      } else {
        next.add(region);
      }
      return next;
    });
  };

  const toggleSubregion = (subregion: string) => {
    setExpandedSubregions(prev => {
      const next = new Set(prev);
      if (next.has(subregion)) {
        next.delete(subregion);
      } else {
        next.add(subregion);
      }
      return next;
    });
  };

  // Sort by percentage descending
  const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="space-y-4">
      {/* Ancestry Bar */}
      <AncestryBar data={sortedData} />

      {/* Region Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {sortedData.map((region, idx) => {
          const color = getRegionColor(region.region, idx, region.color);
          return (
            <div key={region.region} className="flex items-center gap-2 text-sm">
              <div
                className="h-3 w-3 rounded-full shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-muted-foreground">{region.region}</span>
              <span className="font-semibold">{region.percentage.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>

      {/* Region Cards */}
      <div className="space-y-3">
        {sortedData.map((region, idx) => (
          <RegionCard
            key={region.region}
            region={region}
            index={idx}
            isExpanded={expandedRegions.has(region.region)}
            onToggle={() => toggleRegion(region.region)}
            expandedSubregions={expandedSubregions}
            onToggleSubregion={toggleSubregion}
          />
        ))}
      </div>

      {/* Expand/Collapse All */}
      <div className="flex justify-center gap-2 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpandedRegions(new Set(sortedData.map(r => r.region)))}
          className="text-xs"
        >
          Expand All
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setExpandedRegions(new Set());
            setExpandedSubregions(new Set());
          }}
          className="text-xs"
        >
          Collapse All
        </Button>
      </div>
    </div>
  );
}

function FlatAncestry({ data }: { data: FlatAncestryComponent[] }) {
  const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="space-y-4">
      {/* Visual Bar */}
      <div className="h-10 rounded-xl overflow-hidden flex shadow-lg ring-1 ring-black/5 dark:ring-white/10">
        {sortedData.map((comp, idx) => {
          const color = getRegionColor(comp.region, idx);
          return (
            <div
              key={comp.region}
              className="relative transition-all group cursor-pointer hover:brightness-110"
              style={{
                width: `${comp.percentage}%`,
                backgroundColor: color,
                minWidth: comp.percentage > 0 ? "4px" : "0"
              }}
              title={`${comp.region}: ${comp.percentage}%`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {sortedData.map((comp, idx) => {
          const color = getRegionColor(comp.region, idx);
          return (
            <div key={comp.region} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <div
                  className="h-5 w-5 rounded-lg"
                  style={{ backgroundColor: color }}
                />
              </div>
              <div className="flex-1">
                <div className="font-medium">{comp.region}</div>
                {comp.confidence && (
                  <Badge variant="outline" className="text-[10px] mt-1">
                    {comp.confidence} confidence
                  </Badge>
                )}
              </div>
              <span className="text-xl font-bold" style={{ color }}>
                {comp.percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// World DNA Tab with Y-DNA/mtDNA toggle
function WorldDNATab({ haplogroups }: { haplogroups?: Haplogroups | null }) {
  const [mapType, setMapType] = useState<"paternal" | "maternal">("paternal");

  const currentHaplogroup = mapType === "paternal"
    ? haplogroups?.paternal?.haplogroup
    : haplogroups?.maternal?.haplogroup;

  const bgColorClass = mapType === "paternal" ? "bg-blue-500/10 border-blue-500/20" : "bg-pink-500/10 border-pink-500/20";
  const textColorClass = mapType === "paternal" ? "text-blue-500" : "text-pink-500";
  const strongColorClass = mapType === "paternal" ? "text-blue-600 dark:text-blue-400" : "text-pink-600 dark:text-pink-400";

  return (
    <div className="space-y-4">
      {/* Y-DNA / mtDNA Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          World {mapType === "paternal" ? "Y-DNA" : "mtDNA"} haplogroup distribution
        </p>
        <div className="flex rounded-lg border overflow-hidden">
          <button
            onClick={() => setMapType("paternal")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium transition-colors",
              mapType === "paternal"
                ? "bg-blue-500 text-white"
                : "bg-background hover:bg-muted"
            )}
          >
            Y-DNA (Paternal)
          </button>
          <button
            onClick={() => setMapType("maternal")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium transition-colors",
              mapType === "maternal"
                ? "bg-pink-500 text-white"
                : "bg-background hover:bg-muted"
            )}
          >
            mtDNA (Maternal)
          </button>
        </div>
      </div>

      {/* Haplogroup indicator */}
      {currentHaplogroup && (
        <div className={cn("flex items-center gap-2 p-3 rounded-lg border", bgColorClass)}>
          <Dna className={cn("h-4 w-4", textColorClass)} />
          <span className="text-sm">
            Your {mapType === "paternal" ? "paternal" : "maternal"} haplogroup{" "}
            <strong className={strongColorClass}>{currentHaplogroup}</strong> is highlighted
          </span>
        </div>
      )}

      {/* Map */}
      <HaplogroupWorldMap
        key={mapType}
        mapType={mapType}
        highlightHaplogroup={currentHaplogroup}
      />
    </div>
  );
}

// Haplogroup Card Component
function HaplogroupCard({
  type,
  haplogroup,
  description,
  onClick,
}: {
  type: "paternal" | "maternal";
  haplogroup: string;
  description: string;
  onClick: () => void;
}) {
  // Get haplogroup-specific color
  const color = getHaplogroupColor(haplogroup, type);
  const bgColor = getHaplogroupColorWithOpacity(haplogroup, type, 0.1);
  const borderColorVal = getHaplogroupColorWithOpacity(haplogroup, type, 0.2);
  const hoverBgColor = getHaplogroupColorWithOpacity(haplogroup, type, 0.2);
  const hoverBorderColor = getHaplogroupColorWithOpacity(haplogroup, type, 0.4);

  return (
    <button
      onClick={onClick}
      className="w-full p-5 rounded-xl border text-left transition-all duration-200 group"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColorVal,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = hoverBgColor;
        e.currentTarget.style.borderColor = hoverBorderColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = bgColor;
        e.currentTarget.style.borderColor = borderColorVal;
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <Badge style={{ backgroundColor: color }}>
          {type === "paternal" ? "Paternal (Y-DNA)" : "Maternal (mtDNA)"}
        </Badge>
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="text-3xl font-bold mb-2" style={{ color }}>
        {haplogroup}
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {description}
      </p>
      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
        <Info className="h-3 w-3" />
        <span>Click to learn more</span>
      </div>
    </button>
  );
}

export function AncestryComposition({ data, haplogroups }: AncestryCompositionProps) {
  const [selectedHaplogroup, setSelectedHaplogroup] = useState<{
    name: string;
    type: "paternal" | "maternal";
  } | null>(null);

  if (!data || data.length === 0) return null;

  const hierarchical = isHierarchical(data);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-violet-500/5 border-b">
          <CardTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl">Ancestry Composition</h2>
              <p className="text-sm font-normal text-muted-foreground mt-0.5">
                Your genetic ancestry breakdown
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="breakdown" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 h-auto">
              <TabsTrigger value="breakdown" className="flex items-center gap-1.5 px-2 py-2.5 text-xs sm:text-sm sm:gap-2 sm:px-3">
                <List className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Breakdown</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-1.5 px-2 py-2.5 text-xs sm:text-sm sm:gap-2 sm:px-3">
                <Map className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Your Regions</span>
              </TabsTrigger>
              <TabsTrigger value="world" className="flex items-center gap-1.5 px-2 py-2.5 text-xs sm:text-sm sm:gap-2 sm:px-3">
                <Earth className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">World DNA</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="breakdown" className="animate-in fade-in-50 duration-300">
              {hierarchical ? (
                <HierarchicalAncestry data={data as AncestryRegion[]} />
              ) : (
                <FlatAncestry data={data as FlatAncestryComponent[]} />
              )}
            </TabsContent>

            <TabsContent value="map" className="animate-in fade-in-50 duration-300">
              <AncestryMap data={data as AncestryRegion[]} />
            </TabsContent>

            <TabsContent value="world" className="animate-in fade-in-50 duration-300">
              <WorldDNATab haplogroups={haplogroups} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Haplogroups Card */}
      {haplogroups && (haplogroups.paternal || haplogroups.maternal) && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500/5 to-pink-500/5 border-b">
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-pink-500/20 flex items-center justify-center">
                <Dna className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-xl">Haplogroups</h2>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  Your maternal and paternal lineage markers
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {haplogroups.paternal && (
                <HaplogroupCard
                  type="paternal"
                  haplogroup={haplogroups.paternal.haplogroup}
                  description={haplogroups.paternal.description}
                  onClick={() => setSelectedHaplogroup({
                    name: haplogroups.paternal!.haplogroup,
                    type: "paternal"
                  })}
                />
              )}
              {haplogroups.maternal && (
                <HaplogroupCard
                  type="maternal"
                  haplogroup={haplogroups.maternal.haplogroup}
                  description={haplogroups.maternal.description}
                  onClick={() => setSelectedHaplogroup({
                    name: haplogroups.maternal!.haplogroup,
                    type: "maternal"
                  })}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Haplogroup Detail Sheet */}
      <HaplogroupSheet
        haplogroupName={selectedHaplogroup?.name || null}
        type={selectedHaplogroup?.type || "paternal"}
        isOpen={selectedHaplogroup !== null}
        onClose={() => setSelectedHaplogroup(null)}
      />
    </div>
  );
}

// Export types for use in other components
export type { AncestryRegion, Subregion, Population, Haplogroups, HaplogroupInfo, FlatAncestryComponent };

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@/components/theme-provider";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import { getHaplogroupColor, MT_DNA_COLORS } from "@/lib/haplogroup-colors";
import { COUNTRY_HAPLOGROUPS } from "@/lib/haplogroup-regions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Loader2, Printer, AlertCircle, RefreshCw } from "lucide-react";

interface HaplogroupWorldMapProps {
  className?: string;
  highlightHaplogroup?: string;
  mapType?: "paternal" | "maternal";
  onRegionClick?: (country: string, haplogroup: string) => void;
  showControls?: boolean;
}

// Natural Earth GeoJSON URL (110m resolution for performance)
const GEOJSON_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

// Build match expression for MapLibre styling
function buildHaplogroupColorExpression(type: "paternal" | "maternal" = "paternal"): any[] {
  const expression: any[] = ["match", ["get", "ISO_A3"]];

  for (const [countryCode, data] of Object.entries(COUNTRY_HAPLOGROUPS)) {
    const color = getHaplogroupColor(data.dominant, type);
    expression.push(countryCode, color);
  }

  // Default color for countries without data
  expression.push("rgba(120, 120, 120, 0.3)");

  return expression;
}

// Get unique haplogroups for legend
function getUniqueDominantHaplogroups(): string[] {
  const haplogroups = new Set<string>();
  for (const data of Object.values(COUNTRY_HAPLOGROUPS)) {
    haplogroups.add(data.dominant);
  }
  return Array.from(haplogroups).sort();
}

// Group haplogroups by base letter for legend
function groupHaplogroupsByBase(): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  const haplogroups = getUniqueDominantHaplogroups();

  for (const hg of haplogroups) {
    const base = hg.charAt(0);
    if (!groups[base]) groups[base] = [];
    if (!groups[base].includes(hg)) {
      groups[base].push(hg);
    }
  }

  return groups;
}

export function HaplogroupWorldMap({
  className,
  highlightHaplogroup,
  mapType = "paternal",
  onRegionClick,
  showControls = true,
}: HaplogroupWorldMapProps) {
  const { theme } = useTheme();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [hoveredHaplogroup, setHoveredHaplogroup] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const isDark = theme === "dark";

  // Theme-aware colors
  const bgColor = isDark ? "#1e293b" : "#f8fafc";
  const oceanColor = isDark ? "#0f172a" : "#e0f2fe";
  const strokeColor = isDark ? "#334155" : "#ffffff";
  const strokeHoverColor = isDark ? "#94a3b8" : "#1f2937";

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {},
          layers: [
            {
              id: "background",
              type: "background",
              paint: {
                "background-color": bgColor,
              },
            },
          ],
        },
        center: [20, 30],
        zoom: 1.3,
        attributionControl: false,
        maxBounds: [[-180, -85], [180, 85]],
      });

      map.current.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right"
      );

      map.current.on("load", async () => {
        if (!map.current) return;

        try {
          // Fetch GeoJSON data
          const response = await fetch(GEOJSON_URL);
          if (!response.ok) throw new Error("Failed to fetch map data");
          const geojson = await response.json();

          // Add source
          map.current.addSource("countries", {
            type: "geojson",
            data: geojson,
          });

          // Add ocean layer
          map.current.addLayer({
            id: "ocean",
            type: "background",
            paint: {
              "background-color": oceanColor,
            },
          });

          // Add fill layer with haplogroup colors
          map.current.addLayer({
            id: "countries-fill",
            type: "fill",
            source: "countries",
            paint: {
              "fill-color": buildHaplogroupColorExpression(mapType) as any,
              "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                0.9,
                0.75,
              ],
            },
          });

          // Add stroke layer
          map.current.addLayer({
            id: "countries-stroke",
            type: "line",
            source: "countries",
            paint: {
              "line-color": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                strokeHoverColor,
                strokeColor,
              ],
              "line-width": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                2,
                0.5,
              ],
            },
          });

          setMapLoaded(true);
          setError(null);
        } catch (err) {
          console.error("Failed to load GeoJSON:", err);
          setError("Failed to load map data. Please try again.");
        }
      });

      map.current.on("error", (e) => {
        console.error("Map error:", e);
        setError("Map failed to load. Please refresh.");
      });
    } catch (err) {
      console.error("Failed to initialize map:", err);
      setError("Failed to initialize map.");
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [retryCount]);

  // Update map colors when theme changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    try {
      map.current.setPaintProperty("background", "background-color", bgColor);
      map.current.setPaintProperty("ocean", "background-color", oceanColor);
      map.current.setPaintProperty("countries-stroke", "line-color", [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        strokeHoverColor,
        strokeColor,
      ]);
    } catch (err) {
      console.error("Failed to update theme:", err);
    }
  }, [isDark, mapLoaded, bgColor, oceanColor, strokeColor, strokeHoverColor]);

  // Add hover and click interactions
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    let hoveredId: string | null = null;

    const handleMouseMove = (e: maplibregl.MapLayerMouseEvent) => {
      if (!map.current || !e.features?.length) return;

      const feature = e.features[0];
      if (!feature) return;

      const countryCode = feature.properties?.ISO_A3;
      const countryName = feature.properties?.NAME;

      if (hoveredId !== null) {
        map.current.setFeatureState(
          { source: "countries", id: hoveredId },
          { hover: false }
        );
      }

      hoveredId = feature.id as string;
      map.current.setFeatureState(
        { source: "countries", id: hoveredId },
        { hover: true }
      );

      map.current.getCanvas().style.cursor = "pointer";

      const haplogroupData = COUNTRY_HAPLOGROUPS[countryCode];
      setHoveredCountry(countryName || countryCode);
      setHoveredHaplogroup(haplogroupData?.dominant || null);
    };

    const handleMouseLeave = () => {
      if (!map.current) return;

      if (hoveredId !== null) {
        map.current.setFeatureState(
          { source: "countries", id: hoveredId },
          { hover: false }
        );
      }
      hoveredId = null;
      map.current.getCanvas().style.cursor = "";
      setHoveredCountry(null);
      setHoveredHaplogroup(null);
    };

    const handleClick = (e: maplibregl.MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;

      const countryCode = feature.properties?.ISO_A3;
      const haplogroupData = COUNTRY_HAPLOGROUPS[countryCode];

      if (haplogroupData && onRegionClick) {
        onRegionClick(countryCode, haplogroupData.dominant);
      }
    };

    map.current.on("mousemove", "countries-fill", handleMouseMove);
    map.current.on("mouseleave", "countries-fill", handleMouseLeave);
    map.current.on("click", "countries-fill", handleClick);

    return () => {
      if (!map.current) return;
      map.current.off("mousemove", "countries-fill", handleMouseMove);
      map.current.off("mouseleave", "countries-fill", handleMouseLeave);
      map.current.off("click", "countries-fill", handleClick);
    };
  }, [mapLoaded, onRegionClick]);

  // Highlight specific haplogroup
  useEffect(() => {
    if (!mapLoaded || !map.current || !highlightHaplogroup) return;

    const highlightExpression: any[] = ["match", ["get", "ISO_A3"]];

    for (const [countryCode, data] of Object.entries(COUNTRY_HAPLOGROUPS)) {
      if (data.dominant === highlightHaplogroup || data.dominant.startsWith(highlightHaplogroup)) {
        highlightExpression.push(countryCode, 0.9);
      } else {
        highlightExpression.push(countryCode, 0.2);
      }
    }
    highlightExpression.push(0.1);

    map.current.setPaintProperty("countries-fill", "fill-opacity", highlightExpression);

    return () => {
      if (!map.current) return;
      map.current.setPaintProperty("countries-fill", "fill-opacity", [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.9,
        0.75,
      ]);
    };
  }, [mapLoaded, highlightHaplogroup]);

  const resetView = useCallback(() => {
    map.current?.flyTo({
      center: [20, 30],
      zoom: 1.3,
      duration: 1000,
    });
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setMapLoaded(false);
    map.current?.remove();
    map.current = null;
    setRetryCount((c) => c + 1);
  }, []);

  const haplogroupGroups = groupHaplogroupsByBase();

  // Error state
  if (error) {
    return (
      <div className={cn("relative rounded-xl overflow-hidden", className)}>
        <div className="w-full h-[500px] bg-muted flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-xl overflow-hidden print:rounded-none", className)}>
      {/* Map container */}
      <div
        ref={mapContainer}
        className={cn(
          "w-full h-[500px] transition-colors duration-300",
          isDark ? "bg-slate-800" : "bg-sky-50"
        )}
      />

      {/* Hover info */}
      {hoveredCountry && (
        <div className="absolute top-3 left-3 px-3 py-2 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border print:hidden">
          <div className="font-semibold text-sm">{hoveredCountry}</div>
          {hoveredHaplogroup && (
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getHaplogroupColor(hoveredHaplogroup, mapType) }}
              />
              <span className="text-sm font-mono">{hoveredHaplogroup}</span>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <>
          {/* Top right controls */}
          <div className="absolute top-3 right-12 flex gap-2 print:hidden">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="px-2 py-1 text-xs bg-background/90 backdrop-blur-sm rounded shadow border hover:bg-muted transition-colors"
            >
              {showLegend ? "Hide" : "Show"} Legend
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 bg-background/90 backdrop-blur-sm rounded shadow border hover:bg-muted transition-colors"
              title="Print map"
            >
              <Printer className="h-4 w-4" />
            </button>
          </div>

          {/* Reset view button */}
          <button
            onClick={resetView}
            className="absolute bottom-3 left-3 px-3 py-1.5 text-xs bg-background/90 backdrop-blur-sm rounded-lg shadow-md border hover:bg-muted transition-colors print:hidden"
          >
            Reset View
          </button>
        </>
      )}

      {/* Compact Legend */}
      {showLegend && (
        <div className={cn(
          "absolute bottom-3 right-3 max-w-[200px] sm:max-w-[280px] p-2 sm:p-3 rounded-lg shadow-lg border max-h-[200px] sm:max-h-[350px] overflow-y-auto print:static print:max-w-none print:max-h-none print:shadow-none print:border-0 print:mt-4",
          isDark ? "bg-slate-900/95" : "bg-background/95",
          "backdrop-blur-sm print:backdrop-blur-none"
        )}>
          <div className="text-[10px] sm:text-xs font-semibold mb-2 sticky top-0 bg-inherit print:static">
            {mapType === "paternal" ? "Y-DNA" : "mtDNA"} Haplogroups
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 print:grid-cols-4 gap-x-2 sm:gap-x-3 gap-y-0.5 sm:gap-y-1">
            {Object.entries(haplogroupGroups)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([base, hgs]) => (
                <div key={base} className="flex flex-col">
                  {hgs.slice(0, 2).map((hg) => (
                    <div key={hg} className="flex items-center gap-1 sm:gap-1.5 py-0.5">
                      <div
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm flex-shrink-0 print:w-3 print:h-3"
                        style={{ backgroundColor: getHaplogroupColor(hg, mapType) }}
                      />
                      <span className="text-[9px] sm:text-[10px] font-mono truncate print:text-xs">{hg}</span>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {!mapLoaded && !error && (
        <div className={cn(
          "absolute inset-0 flex flex-col items-center justify-center",
          isDark
            ? "bg-gradient-to-b from-slate-800 to-slate-900"
            : "bg-gradient-to-b from-sky-50 to-sky-100"
        )}>
          <div className="relative">
            <Globe className={cn(
              "h-16 w-16 animate-pulse",
              isDark ? "text-slate-600" : "text-sky-300"
            )} />
            <Loader2 className="absolute -bottom-1 -right-1 h-6 w-6 text-primary animate-spin" />
          </div>
          <div className="mt-4 text-sm font-medium text-muted-foreground">Loading world map...</div>
          <div className="mt-2 flex gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}
    </div>
  );
}

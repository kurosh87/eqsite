"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";

interface AncestryRegion {
  region: string;
  percentage: number;
  color?: string;
}

interface AncestryMapProps {
  data: AncestryRegion[];
  className?: string;
}

// Map region names to geographic coordinates and bounds
const REGION_COORDINATES: Record<string, { center: [number, number]; zoom: number; bounds?: [[number, number], [number, number]] }> = {
  // European regions
  "European": { center: [10, 50], zoom: 3 },
  "Northwestern European": { center: [-2, 53], zoom: 4 },
  "Southern European": { center: [12, 42], zoom: 4 },
  "Eastern European": { center: [30, 52], zoom: 4 },
  "British & Irish": { center: [-4, 54], zoom: 5 },
  "French & German": { center: [7, 49], zoom: 5 },
  "Scandinavian": { center: [15, 62], zoom: 4 },
  "Italian": { center: [12, 43], zoom: 5 },
  "Iberian": { center: [-4, 40], zoom: 5 },
  "Balkan": { center: [21, 43], zoom: 5 },

  // African regions
  "Sub-Saharan African": { center: [20, 0], zoom: 3 },
  "West African": { center: [0, 10], zoom: 4 },
  "Nigerian": { center: [8, 9], zoom: 5 },
  "Ghanaian": { center: [-1, 8], zoom: 5 },
  "East African": { center: [38, 0], zoom: 4 },
  "Ethiopian": { center: [38, 9], zoom: 5 },
  "Kenyan": { center: [38, 0], zoom: 5 },
  "Central African": { center: [20, 0], zoom: 4 },
  "South African": { center: [25, -29], zoom: 4 },
  "North African": { center: [10, 30], zoom: 4 },

  // Asian regions
  "East Asian": { center: [115, 35], zoom: 3 },
  "Chinese": { center: [105, 35], zoom: 4 },
  "Japanese": { center: [138, 36], zoom: 5 },
  "Korean": { center: [127, 36], zoom: 5 },
  "Southeast Asian": { center: [110, 10], zoom: 4 },
  "Vietnamese": { center: [108, 16], zoom: 5 },
  "Thai": { center: [101, 15], zoom: 5 },
  "Filipino": { center: [122, 12], zoom: 5 },
  "Indonesian": { center: [118, -2], zoom: 4 },
  "South Asian": { center: [78, 22], zoom: 4 },
  "Indian": { center: [78, 22], zoom: 4 },
  "Pakistani": { center: [70, 30], zoom: 5 },
  "Bangladeshi": { center: [90, 24], zoom: 5 },
  "Central Asian": { center: [65, 42], zoom: 4 },
  "Middle Eastern": { center: [45, 30], zoom: 4 },
  "Western Asian": { center: [45, 30], zoom: 4 },
  "Arab": { center: [45, 25], zoom: 4 },
  "Persian": { center: [53, 32], zoom: 5 },
  "Jewish": { center: [35, 31], zoom: 5 },

  // Americas
  "Indigenous American": { center: [-100, 20], zoom: 2 },
  "Native American": { center: [-105, 40], zoom: 4 },
  "Mexican": { center: [-102, 23], zoom: 4 },
  "Central American": { center: [-85, 15], zoom: 4 },
  "South American": { center: [-60, -15], zoom: 3 },
  "Andean": { center: [-75, -10], zoom: 4 },
  "Amazonian": { center: [-60, -5], zoom: 4 },

  // Oceania
  "Oceanian": { center: [140, -10], zoom: 3 },
  "Melanesian": { center: [155, -6], zoom: 4 },
  "Polynesian": { center: [-150, -15], zoom: 4 },
  "Australian Aboriginal": { center: [134, -25], zoom: 4 },
};

// Default colors for regions
const DEFAULT_COLORS: Record<string, string> = {
  "European": "#5B8DEF",
  "Sub-Saharan African": "#E67E22",
  "East Asian": "#27AE60",
  "Indigenous American": "#9B59B6",
  "Middle Eastern": "#F1C40F",
  "South Asian": "#E74C3C",
  "North African": "#E59866",
  "Oceanian": "#3498DB",
  "Southeast Asian": "#16A085",
  "Central Asian": "#C0392B",
};

function getRegionColor(region: string, providedColor?: string): string {
  if (providedColor) return providedColor;

  for (const [key, color] of Object.entries(DEFAULT_COLORS)) {
    if (region.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(region.toLowerCase())) {
      return color;
    }
  }
  return "#6366F1";
}

function getRegionCoordinates(region: string): { center: [number, number]; zoom: number } | null {
  // Direct match
  if (REGION_COORDINATES[region]) {
    return REGION_COORDINATES[region];
  }

  // Partial match
  for (const [key, coords] of Object.entries(REGION_COORDINATES)) {
    if (region.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(region.toLowerCase())) {
      return coords;
    }
  }

  return null;
}

export function AncestryMap({ data, className }: AncestryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "raster-tiles": {
            type: "raster",
            tiles: [
              "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          },
        },
        layers: [
          {
            id: "simple-tiles",
            type: "raster",
            source: "raster-tiles",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [20, 20],
      zoom: 1.5,
      attributionControl: false,
    });

    map.current.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add markers when map is loaded and data changes
  useEffect(() => {
    if (!mapLoaded || !map.current || !data.length) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for each ancestry region
    const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);

    sortedData.forEach((region, index) => {
      const coords = getRegionCoordinates(region.region);
      if (!coords) return;

      const color = getRegionColor(region.region, region.color);

      // Create custom marker element
      const el = document.createElement("div");
      el.className = "ancestry-marker";
      el.style.cssText = `
        width: ${Math.max(30, Math.min(60, region.percentage * 0.8))}px;
        height: ${Math.max(30, Math.min(60, region.percentage * 0.8))}px;
        background: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: ${Math.max(10, Math.min(14, region.percentage * 0.2))}px;
        color: white;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        z-index: ${100 - index};
      `;
      el.textContent = `${Math.round(region.percentage)}%`;

      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.2)";
        el.style.boxShadow = `0 4px 20px ${color}80`;
        el.style.zIndex = "1000";
        setSelectedRegion(region.region);
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
        el.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
        el.style.zIndex = String(100 - index);
        setSelectedRegion(null);
      });

      el.addEventListener("click", () => {
        map.current?.flyTo({
          center: coords.center,
          zoom: coords.zoom,
          duration: 1500,
          essential: true,
        });
      });

      // Create popup
      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
      }).setHTML(`
        <div style="padding: 8px; min-width: 150px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: ${color};">${region.region}</div>
          <div style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">${region.percentage.toFixed(1)}%</div>
          <div style="font-size: 11px; color: #666;">Click to zoom</div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coords.center)
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener("mouseenter", () => marker.togglePopup());
      el.addEventListener("mouseleave", () => marker.togglePopup());

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      sortedData.forEach((region) => {
        const coords = getRegionCoordinates(region.region);
        if (coords) {
          bounds.extend(coords.center);
        }
      });

      // Add padding
      map.current.fitBounds(bounds, {
        padding: 60,
        maxZoom: 4,
        duration: 1000,
      });
    }
  }, [mapLoaded, data]);

  const flyToRegion = useCallback((region: string) => {
    const coords = getRegionCoordinates(region);
    if (coords && map.current) {
      map.current.flyTo({
        center: coords.center,
        zoom: coords.zoom,
        duration: 1500,
        essential: true,
      });
      setSelectedRegion(region);
    }
  }, []);

  const resetView = useCallback(() => {
    if (!map.current || !data.length) return;

    const bounds = new maplibregl.LngLatBounds();
    data.forEach((region) => {
      const coords = getRegionCoordinates(region.region);
      if (coords) {
        bounds.extend(coords.center);
      }
    });

    map.current.fitBounds(bounds, {
      padding: 60,
      maxZoom: 4,
      duration: 1000,
    });
    setSelectedRegion(null);
  }, [data]);

  return (
    <div className={cn("relative rounded-xl overflow-hidden", className)}>
      {/* Map container */}
      <div
        ref={mapContainer}
        className="w-full h-[350px] bg-muted"
      />

      {/* Controls overlay */}
      <div className="absolute top-3 left-3 flex flex-col gap-2">
        <button
          onClick={resetView}
          className="px-3 py-1.5 text-xs bg-background/90 backdrop-blur-sm rounded-lg shadow-md border hover:bg-muted transition-colors"
        >
          Reset View
        </button>
      </div>

      {/* Region chips */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="flex flex-wrap gap-2 justify-center">
          {data
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 6)
            .map((region) => {
              const color = getRegionColor(region.region, region.color);
              const isSelected = selectedRegion === region.region;

              return (
                <button
                  key={region.region}
                  onClick={() => flyToRegion(region.region)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full transition-all",
                    "bg-background/90 backdrop-blur-sm border shadow-sm",
                    isSelected && "ring-2 ring-primary scale-105"
                  )}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium truncate max-w-[100px]">{region.region}</span>
                  <span className="font-bold" style={{ color }}>
                    {region.percentage.toFixed(0)}%
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* Loading state */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-muted-foreground text-sm">Loading map...</div>
        </div>
      )}
    </div>
  );
}

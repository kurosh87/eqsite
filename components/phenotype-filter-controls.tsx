"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Network } from "lucide-react";

const STORAGE_KEY = "phenotype-filters";

export interface RegionOption {
  region: string;
  count: number;
}

interface PhenotypeFilterControlsProps {
  totalPhenotypes: number;
  regions: RegionOption[];
  initialSearch?: string | null;
  initialRegion?: string | null;
  initialSort?: string | null;
  enableSort?: boolean;
}

export function PhenotypeFilterControls({
  totalPhenotypes,
  regions,
  initialSearch = "",
  initialRegion,
  initialSort = "name",
  enableSort = true,
}: PhenotypeFilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(initialSearch || "");
  const [regionValue, setRegionValue] = useState(initialRegion || "all");
  const [sortValue, setSortValue] = useState(initialSort || "name");
  const [hydrated, setHydrated] = useState(false);

  const regionOptions = useMemo(
    () =>
      regions.map((region) => ({
        label: `${region.region} (${region.count})`,
        value: region.region,
      })),
    [regions]
  );

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
      router.refresh();
    });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      updateParams({ search: searchValue?.trim() || null });
    }, 350);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  useEffect(() => {
    if (initialRegion && initialRegion !== regionValue) {
      setRegionValue(initialRegion);
    }
  }, [initialRegion, regionValue]);

  useEffect(() => {
    if (initialSort && initialSort !== sortValue) {
      setSortValue(initialSort);
    }
  }, [initialSort, sortValue]);

  useEffect(() => {
    if (typeof window === "undefined" || hydrated) {
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          search?: string;
          region?: string;
          sort?: string;
        };
        const nextValues: Record<string, string | null> = {};

        if (!searchParams?.get("search") && parsed.search) {
          setSearchValue(parsed.search);
          nextValues.search = parsed.search;
        }

        if (!searchParams?.get("region") && parsed.region) {
          setRegionValue(parsed.region);
          nextValues.region = parsed.region;
        }

        if (!searchParams?.get("sort") && parsed.sort) {
          setSortValue(parsed.sort);
          nextValues.sort = parsed.sort;
        }

        if (Object.keys(nextValues).length > 0) {
          updateParams(nextValues);
        }
      } catch {
        // Ignore JSON errors and fall back to defaults
      }
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, searchParams]);

  useEffect(() => {
    if (typeof window === "undefined" || !hydrated) {
      return;
    }
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        search: searchValue,
        region: regionValue,
        sort: sortValue,
      })
    );
  }, [searchValue, regionValue, sortValue, hydrated]);

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search phenotypes..."
          value={searchValue}
          className="pl-10"
          onChange={(event) => setSearchValue(event.target.value)}
          aria-label="Search phenotypes"
        />
      </div>

      <Select
        value={regionValue || "all"}
        onValueChange={(value) => {
          setRegionValue(value);
          updateParams({ region: value });
        }}
      >
        <SelectTrigger aria-label="Filter by region">
          <SelectValue placeholder="All Regions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            All Regions ({totalPhenotypes})
          </SelectItem>
          {regionOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {enableSort && (
        <Select
          value={sortValue || "name"}
          onValueChange={(value) => {
            setSortValue(value);
            updateParams({ sort: value });
          }}
        >
          <SelectTrigger aria-label="Sort phenotypes">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">
              <div className="flex items-center gap-2">
                <Search className="w-3 h-3" />
                Name (A-Z)
              </div>
            </SelectItem>
            <SelectItem value="connection">
              <div className="flex items-center gap-2">
                <Network className="w-3 h-3" />
                Most Connected
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      )}

      {isPending && (
        <p className="sm:col-span-3 text-xs text-muted-foreground">
          Updating results…
        </p>
      )}
    </div>
  );
}

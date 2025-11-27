"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const PhenotypeDistributionMap = dynamic(
  () => import("@/components/PhenotypeDistributionMap"),
  {
    loading: () => (
      <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
        <div className="text-center">
          <Skeleton className="h-8 w-8 mx-auto mb-2 rounded-full" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

interface LazyPhenotypeMapProps {
  geojson: any;
  phenotypeName: string;
  className?: string;
}

export default function LazyPhenotypeMap({
  geojson,
  phenotypeName,
  className,
}: LazyPhenotypeMapProps) {
  return (
    <PhenotypeDistributionMap
      geojson={geojson}
      phenotypeName={phenotypeName}
      className={className}
    />
  );
}

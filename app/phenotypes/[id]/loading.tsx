import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PhenotypeDetailLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header skeleton */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* Back button */}
        <Skeleton className="h-9 w-40 mb-6" />

        {/* Header section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Image */}
          <div className="lg:col-span-1">
            <Card>
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>

          {/* Right column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>

            {/* Regions */}
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-24" />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Map placeholder */}
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

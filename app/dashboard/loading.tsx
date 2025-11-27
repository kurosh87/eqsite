import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
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

      <main className="flex-1 relative overflow-hidden">
        <div className="container relative mx-auto px-4 py-12 md:py-16">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-3">
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <div>
                <Skeleton className="h-10 w-48 mb-2" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
            <Skeleton className="h-5 w-96 mt-4" />
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-12 rounded-xl" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-16 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analysis History */}
          <Card>
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-8 w-40" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <Skeleton className="w-24 h-24 rounded-xl" />
                        <div className="flex-1">
                          <Skeleton className="h-6 w-48 mb-3" />
                          <Skeleton className="h-4 w-64 mb-3" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                        <Skeleton className="w-20 h-20 rounded-xl hidden sm:block" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
          <h1 className="text-3xl font-bold mb-3">Page not found</h1>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="default" className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Go home
            </Button>
          </Link>
          <Link href="/phenotypes">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4" />
              Browse phenotypes
            </Button>
          </Link>
        </div>

        <div className="mt-8">
          <Button variant="ghost" asChild className="text-muted-foreground">
            <Link href="javascript:history.back()" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

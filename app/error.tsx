"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Something went wrong</h1>
          <p className="text-muted-foreground mb-2">
            We encountered an unexpected error. Our team has been notified.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Go home
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          If this problem persists, please{" "}
          <a
            href="mailto:support@phenotype.app"
            className="text-primary hover:underline"
          >
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}

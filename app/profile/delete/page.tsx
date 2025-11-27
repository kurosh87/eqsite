"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

export default function DeleteAccountPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleted, setDeleted] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setDeleted(true);
        signOut().catch((err) =>
          console.error("Failed to clear local session after deletion:", err)
        );
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete account");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (!deleted) {
      return;
    }
    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.replace("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [deleted, router]);

  if (isPending || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (deleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center space-y-4 max-w-md">
          <AlertTriangle className="h-10 w-10 text-red-600 mx-auto" />
          <h1 className="text-2xl font-semibold">Account deleted</h1>
          <p className="text-muted-foreground">
            We removed your profile, uploads, and analysis history. Redirecting to the homepage in {redirectCountdown}s.
          </p>
          <Button onClick={() => router.replace("/")}>Go now</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <h1 className="text-2xl font-bold text-red-600">Delete Account</h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-red-900 mb-2">Warning</h2>
          <p className="text-sm text-red-800">
            This action <strong>cannot be undone</strong>. This will permanently delete:
          </p>
          <ul className="list-disc list-inside text-sm text-red-800 mt-2 space-y-1">
            <li>Your account and profile</li>
            <li>All your analysis history</li>
            <li>All your uploaded photos</li>
            <li>All your saved reports</li>
            <li>All your session data</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleDelete} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Confirm Your Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg font-mono"
              placeholder="DELETE"
              required
            />
          </div>

          <div className="flex gap-3">
            <Link href="/profile" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="destructive"
              className="flex-1"
              disabled={loading || confirmText !== "DELETE"}
            >
              {loading ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Changed your mind? <Link href="/profile" className="text-blue-600">Go back to profile</Link>
        </p>
      </Card>
    </div>
  );
}

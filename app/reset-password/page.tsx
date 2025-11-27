"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/sign-in"), 2000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow text-center">
          <div className="text-green-500 text-6xl">✓</div>
          <h2 className="text-2xl font-bold">Password Reset Successfully</h2>
          <p className="text-gray-600">
            Redirecting to sign in...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">Set New Password</h2>
          <p className="text-center text-gray-600 mt-2">
            Enter your new password below
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              New Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 8 characters required
            </p>
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !token}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
        <div className="text-center">
          <Link href="/sign-in" className="text-sm text-blue-600 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

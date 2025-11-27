"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Monitor, Smartphone, Tablet, MapPin, Clock } from "lucide-react";

interface SessionInfo {
  id: string;
  createdAt: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  isCurrent: boolean;
}

export default function SessionsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/sign-in");
      return;
    }
    fetchSessions();
  }, [session, router]);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/auth/sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const response = await fetch("/api/auth/revoke-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        fetchSessions();
      }
    } catch (error) {
      console.error("Failed to revoke session:", error);
    }
  };

  const revokeAllOther = async () => {
    try {
      const response = await fetch("/api/auth/revoke-all-sessions", {
        method: "POST",
      });

      if (response.ok) {
        fetchSessions();
      }
    } catch (error) {
      console.error("Failed to revoke sessions:", error);
    }
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return Monitor;
    if (userAgent.includes("Mobile")) return Smartphone;
    if (userAgent.includes("Tablet")) return Tablet;
    return Monitor;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Active Sessions</h1>
          <p className="text-muted-foreground">
            Manage your logged-in devices
          </p>
        </div>
        <Button onClick={revokeAllOther} variant="outline">
          Logout All Other Devices
        </Button>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => {
          const DeviceIcon = getDeviceIcon(session.userAgent);

          return (
            <Card key={session.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <DeviceIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {session.userAgent?.includes("Chrome")
                          ? "Chrome"
                          : session.userAgent?.includes("Firefox")
                          ? "Firefox"
                          : session.userAgent?.includes("Safari")
                          ? "Safari"
                          : "Unknown Browser"}
                      </h3>
                      {session.isCurrent && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1 mt-2">
                      {session.ipAddress && (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {session.ipAddress}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Last active:{" "}
                        {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs">
                        Expires: {new Date(session.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => revokeSession(session.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </Card>
          );
        })}

        {sessions.length === 0 && (
          <Card className="p-12 text-center text-muted-foreground">
            No active sessions found
          </Card>
        )}
      </div>
    </div>
  );
}

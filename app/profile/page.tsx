"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useLanguage } from "@/components/language-provider";
import { ModernHeader } from "@/components/modern-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  User,
  Lock,
  Trash2,
  CreditCard,
  Crown,
  ExternalLink,
  Settings,
  Shield,
  Calendar,
  CheckCircle
} from "lucide-react";

export default function ProfilePage() {
  const { t, language } = useLanguage();
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Subscription state
  const [subscription, setSubscription] = useState<{
    hasSubscription: boolean;
    status?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
  } | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      fetchSubscriptionStatus();
    }
  }, [session, isPending, router]);

  const fetchSubscriptionStatus = async () => {
    try {
      setSubscriptionLoading(true);
      const response = await fetch("/api/subscriptions/status");
      if (response.ok) {
        const data = await response.json();
        setSubscription({
          hasSubscription: data.hasSubscription,
          status: data.subscription?.status,
          currentPeriodEnd: data.subscription?.currentPeriodEnd,
          cancelAtPeriodEnd: data.subscription?.cancelAtPeriodEnd,
        });
      }
    } catch (err) {
      console.error("Failed to fetch subscription status:", err);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/subscriptions/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to open billing portal");
      }
    } catch {
      setError("Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/subscriptions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start checkout");
      }
    } catch {
      setError("Failed to start checkout");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        setMessage("Profile updated successfully!");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update profile");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        setMessage("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to change password");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (isPending || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const userData = {
    displayName: session.user?.name || null,
    primaryEmail: session.user?.email || null,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ModernHeader user={userData} />

      <main className="flex-1 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="container relative mx-auto px-4 py-12 md:py-16 max-w-5xl">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg">
                <Settings className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {t.profile.title}
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  {t.profile.account}
                </p>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {message && (
            <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
              <CheckCircle className="h-5 w-5" />
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-xl animate-fade-in">
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information */}
              <Card className="border-2 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-background via-background to-blue-500/5">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-500" />
                    </div>
                    <CardTitle>{t.profile.account}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t.profile.displayName}</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-xl bg-background focus:border-primary focus:outline-none transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t.profile.email}</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-xl bg-background focus:border-primary focus:outline-none transition-colors"
                        placeholder="your@email.com"
                      />
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        {session.user?.emailVerified ? (
                          <><CheckCircle className="h-3 w-3 text-emerald-500" /> Verified</>
                        ) : (
                          <><Shield className="h-3 w-3 text-amber-500" /> Not verified</>
                        )}
                      </p>
                    </div>
                    <Button type="submit" disabled={loading} className="h-11">
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Spinner className="h-4 w-4" />
                          Saving...
                        </span>
                      ) : (
                        t.common.save
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card className="border-2 hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-background via-background to-purple-500/5">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-purple-500" />
                    </div>
                    <CardTitle>Security</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-xl bg-background focus:border-primary focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-xl bg-background focus:border-primary focus:outline-none transition-colors"
                        minLength={8}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Minimum 8 characters
                      </p>
                    </div>
                    <Button type="submit" disabled={loading} className="h-11">
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Spinner className="h-4 w-4" />
                          Updating...
                        </span>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-2 border-red-500/20 hover:border-red-500/40 transition-all duration-300 bg-gradient-to-br from-background via-background to-red-500/5">
                <CardHeader className="border-b border-red-500/10 bg-red-500/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500/20 to-red-500/10 flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </div>
                    <CardTitle className="text-red-600">{t.profile.dangerZone}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    {t.profile.deleteWarning}
                  </p>
                  <a href="/profile/delete">
                    <Button variant="destructive" className="h-11">
                      {t.profile.deleteAccount}
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Subscription & Info */}
            <div className="space-y-6">
              {/* Subscription Card */}
              <Card className="border-2 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-background via-background to-emerald-500/5">
                <CardHeader className="border-b bg-muted/30 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-emerald-500" />
                    </div>
                    <CardTitle className="text-base">Subscription</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {subscriptionLoading ? (
                    <div className="flex items-center gap-2 py-4">
                      <Spinner className="h-3 w-3" />
                      <span className="text-xs text-muted-foreground">Loading...</span>
                    </div>
                  ) : subscription?.hasSubscription ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5">
                        <Crown className="h-3.5 w-3.5 text-yellow-500" />
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          {subscription.status === "trialing" ? "Trial" : "Pro"}
                        </Badge>
                      </div>

                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Status</span>
                          <span className="capitalize font-medium text-foreground">{subscription.status}</span>
                        </div>
                        {subscription.currentPeriodEnd && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>{subscription.cancelAtPeriodEnd ? "Ends" : "Renews"}</span>
                            <span className="font-medium text-foreground">
                              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {subscription.cancelAtPeriodEnd && (
                        <p className="text-[10px] text-amber-600 bg-amber-500/10 rounded px-2 py-1">
                          Cancels at period end
                        </p>
                      )}

                      <Button
                        onClick={handleManageBilling}
                        disabled={portalLoading}
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs"
                      >
                        {portalLoading ? (
                          <Spinner className="h-3 w-3" />
                        ) : (
                          <>
                            Manage
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </>
                        )}
                      </Button>
                      <p className="text-[9px] text-muted-foreground text-center">
                        Payment, invoices, cancel
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[11px] text-muted-foreground">
                        No active subscription
                      </p>
                      <div className="text-[10px] text-muted-foreground space-y-0.5">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-2.5 w-2.5 text-emerald-500" />
                          Unlimited analyses
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-2.5 w-2.5 text-emerald-500" />
                          Premium reports
                        </div>
                      </div>
                      <div className="text-[11px] font-medium">
                        $1 trial · $19/mo
                      </div>
                      <Button
                        onClick={handleSubscribe}
                        disabled={portalLoading}
                        size="sm"
                        className="w-full h-8 text-xs"
                      >
                        {portalLoading ? (
                          <Spinner className="h-3 w-3" />
                        ) : (
                          <>
                            <Crown className="h-3 w-3 mr-1" />
                            Subscribe
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card className="border-2 hover:border-primary/20 transition-all duration-300 bg-gradient-to-br from-background via-background to-primary/5">
                <CardHeader className="border-b bg-muted/30 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-base">{t.profile.account}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID</span>
                      <span className="font-mono text-[10px] truncate max-w-[120px]">{session.user?.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Joined</span>
                      <span>{new Date(session.user?.createdAt || "").toLocaleDateString(language)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Updated</span>
                      <span>{new Date(session.user?.updatedAt || "").toLocaleDateString(language)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

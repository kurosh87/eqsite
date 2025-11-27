"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Check,
  Loader2,
  Shield,
  Zap,
  Crown,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionPaywallProps {
  onSubscribed?: () => void;
  onCancel?: () => void;
  returnUrl?: string;
}

const features = [
  { icon: Sparkles, text: "Unlimited phenotype analysis" },
  { icon: Zap, text: "AI-powered ancestry insights" },
  { icon: Shield, text: "Detailed haplogroup reports" },
  { icon: Crown, text: "Premium facial feature analysis" },
];

export function SubscriptionPaywall({
  onSubscribed,
  onCancel,
  returnUrl,
}: SubscriptionPaywallProps) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check subscription status on mount
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch("/api/subscriptions/status");
        if (response.ok) {
          const data = await response.json();
          setHasSubscription(data.hasSubscription);
          if (data.hasSubscription && onSubscribed) {
            onSubscribed();
          }
        }
      } catch (err) {
        console.error("Error checking subscription:", err);
      } finally {
        setChecking(false);
      }
    };

    checkSubscription();
  }, [onSubscribed]);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/subscriptions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create checkout session");
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error("Subscription error:", err);
      setError(err.message || "Failed to start subscription. Please try again.");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Checking subscription status...</p>
      </Card>
    );
  }

  if (hasSubscription) {
    return null; // Don't show paywall if subscribed
  }

  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 text-center">
        <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
          <Crown className="h-3 w-3 mr-1" />
          Premium Required
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          Unlock Phenotype Analysis
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Start your 7-day trial for just $1, then $19/month for unlimited AI-powered analysis
        </p>
      </div>

      {/* Pricing */}
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl sm:text-5xl font-bold text-primary">$1</span>
              <span className="text-muted-foreground">/trial</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">7-day trial</p>
          </div>
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl sm:text-5xl font-bold">$19</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">After trial</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleSubscribe}
          disabled={loading}
          size="lg"
          className="w-full h-14 text-lg font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Redirecting to checkout...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Start $1 Trial
            </>
          )}
        </Button>

        {error && (
          <p className="mt-4 text-sm text-destructive text-center">{error}</p>
        )}

        {/* Trust badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>Secure payment</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="h-3 w-3" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>Instant access</span>
          </div>
        </div>

        {/* Cancel link */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        )}
      </div>
    </Card>
  );
}

/**
 * Hook to check subscription status
 */
export function useSubscription() {
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch("/api/subscriptions/status");
        if (response.ok) {
          const data = await response.json();
          setHasSubscription(data.hasSubscription);
          setSubscription(data.subscription);
        }
      } catch (err) {
        console.error("Error checking subscription:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, []);

  return { loading, hasSubscription, subscription };
}

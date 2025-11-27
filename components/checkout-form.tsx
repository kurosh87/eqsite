"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { CheckCircle, CreditCard, Loader2, AlertCircle } from "lucide-react";

// Initialize Stripe outside component to avoid recreating on each render
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface CheckoutFormProps {
  reportId: string;
  reportTitle: string;
  price: number; // in cents
}

// Inner form component that uses Stripe hooks
function StripePaymentForm({
  reportId,
  onSuccess,
  onError,
}: {
  reportId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/reports/${reportId}?payment=success`,
      },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay Now
          </>
        )}
      </Button>
    </form>
  );
}

export function CheckoutForm({ reportId, reportTitle, price }: CheckoutFormProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeAvailable, setStripeAvailable] = useState<boolean | null>(null);

  const priceInDollars = (price / 100).toFixed(2);

  // Check Stripe availability and create payment intent
  useEffect(() => {
    const initializePayment = async () => {
      // Check if Stripe is configured
      if (!stripePromise) {
        setStripeAvailable(false);
        return;
      }

      try {
        const response = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 503) {
            setStripeAvailable(false);
          } else {
            setError(data.error || "Failed to initialize payment");
          }
          return;
        }

        setClientSecret(data.clientSecret);
        setStripeAvailable(true);
      } catch (err) {
        setStripeAvailable(false);
      }
    };

    initializePayment();
  }, [reportId]);

  // Simulate payment (for testing without Stripe setup)
  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment simulation failed");
      }

      setSuccess(true);
      setTimeout(() => router.push(`/reports/${reportId}`), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to process payment");
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    setSuccess(true);
    setTimeout(() => router.push(`/reports/${reportId}`), 2000);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-16 pb-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Payment Successful!</h2>
          <p className="text-muted-foreground text-lg mb-6">
            Your premium report has been unlocked. Redirecting you now...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">Premium Phenotype Report</h3>
              <p className="text-sm text-muted-foreground mt-1">{reportTitle}</p>
            </div>
            <p className="text-2xl font-bold">${priceInDollars}</p>
          </div>

          <div className="border-t pt-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Complete genetic analysis</p>
              <p>✓ Historical and cultural insights</p>
              <p>✓ Interactive maps and visualizations</p>
              <p>✓ Downloadable PDF report</p>
              <p>✓ Lifetime access</p>
            </div>
          </div>

          <div className="border-t pt-4 flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>${priceInDollars} USD</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <p>{error}</p>
            </Alert>
          )}

          {/* Loading state */}
          {stripeAvailable === null && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Stripe Payment Form */}
          {stripeAvailable && clientSecret && stripePromise && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#8B5CF6",
                  },
                },
              }}
            >
              <StripePaymentForm
                reportId={reportId}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          )}

          {/* Test Mode - Only shown when Stripe is not available */}
          {stripeAvailable === false && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">Test Mode</h4>
                    <p className="text-sm text-amber-800">
                      Stripe is not configured. Use the button below to simulate a successful payment for testing.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Simulate Payment (Test Mode)"
                )}
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center pt-4">
            By completing this purchase, you agree to our{" "}
            <a href="/terms" className="underline hover:text-primary">
              terms and conditions
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

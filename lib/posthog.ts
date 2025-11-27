import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      loaded: (posthog) => {
        if (process.env.NODE_ENV === "development") posthog.debug();
      },
      capture_pageview: false, // We'll manually capture
      capture_pageleave: true,
    });
  }

  return posthog;
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== "undefined") {
    posthog.capture(eventName, properties);
  }
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window !== "undefined") {
    posthog.identify(userId, traits);
  }
}

export { posthog };

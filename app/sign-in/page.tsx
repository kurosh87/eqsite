"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useLanguage } from "@/components/language-provider";
import { SignInPage as SignInPageComponent, Testimonial } from "@/components/ui/sign-in";
import { toast } from "sonner";

const testimonials: Testimonial[] = [
  {
    avatarSrc: "/images/avatar-sarah.jpg",
    name: "Sarah Chen",
    handle: "@sarahchen",
    text: "Discovered my Scandinavian roots! The ancestry breakdown was surprisingly detailed and accurate."
  },
  {
    avatarSrc: "/images/avatar-marcus.jpg",
    name: "Marcus Williams",
    handle: "@marcusw",
    text: "As someone mixed race, I was curious about my heritage. This gave me fascinating insights into my background."
  },
  {
    avatarSrc: "/images/avatar-david.jpg",
    name: "David Martinez",
    handle: "@davidm",
    text: "The haplogroup analysis was a nice touch. Really enjoyed learning about my ancestral migration patterns."
  },
];

export default function SignInPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("rememberMe") === "on";

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });

      if (result.error) {
        toast.error("Sign in failed", {
          description: result.error.message || "Invalid email or password",
        });
      } else {
        toast.success("Welcome back!", {
          description: "Redirecting to dashboard...",
        });
        setTimeout(() => router.push("/dashboard"), 500);
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      toast.error("Sign in failed", {
        description: err?.message || "Invalid email or password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err: any) {
      toast.error("Google sign in failed", {
        description: err?.message || "Unable to sign in with Google",
      });
    }
  };

  const handleResetPassword = () => {
    router.push("/forgot-password");
  };

  const handleCreateAccount = () => {
    router.push("/sign-up");
  };

  return (
    <div className="bg-background text-foreground">
      <SignInPageComponent
        title={
          <span className="font-light text-foreground tracking-tighter">
            {t.auth.signIn.title}
          </span>
        }
        description={t.auth.signIn.subtitle}
        heroImageSrc="/images/hero-signin.jpg"
        testimonials={testimonials}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  );
}

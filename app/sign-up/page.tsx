"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useLanguage } from "@/components/language-provider";
import { SignUpPage as SignUpPageComponent, Feature } from "@/components/ui/sign-up";
import { toast } from "sonner";
import { Shield, Brain, Trophy } from "lucide-react";

export default function SignUpPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const features: Feature[] = [
    {
      icon: <Brain className="h-5 w-5 text-primary" />,
      title: "Discover Your EQ",
      description: "Measure your emotional intelligence across 5 domains"
    },
    {
      icon: <Trophy className="h-5 w-5 text-primary" />,
      title: "Track Progress",
      description: "Monitor your growth with detailed insights"
    },
    {
      icon: <Shield className="h-5 w-5 text-primary" />,
      title: "Private & Secure",
      description: "Your data is always protected"
    },
  ];

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        toast.error(t.common.error, {
          description: result.error.message || t.errors.generic,
        });
      } else {
        toast.success(t.auth.signUp.title, {
          description: t.common.loading,
        });
        setTimeout(() => router.push("/dashboard"), 500);
      }
    } catch (err: unknown) {
      console.error("Sign up error:", err);
      const errorMessage = err instanceof Error ? err.message : t.errors.generic;
      toast.error(t.common.error, {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t.errors.generic;
      toast.error(t.common.error, {
        description: errorMessage,
      });
    }
  };

  const handleSignIn = () => {
    router.push("/sign-in");
  };

  return (
    <div className="bg-background text-foreground">
      <SignUpPageComponent
        title={
          <span className="font-light text-foreground tracking-tighter">
            {t.auth.signUp.title}
          </span>
        }
        description={t.auth.signUp.subtitle}
        heroImageSrc="/images/hero-signup.jpg"
        features={features}
        onSignUp={handleSignUp}
        onGoogleSignUp={handleGoogleSignUp}
        onSignIn={handleSignIn}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useLanguage } from "@/components/language-provider";
import { SignUpPage as SignUpPageComponent, Feature } from "@/components/ui/sign-up";
import { toast } from "sonner";
import { Shield, Globe, Clock } from "lucide-react";

export default function SignUpPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const features: Feature[] = [
    {
      icon: <Clock className="h-5 w-5 text-primary" />,
      title: t.home.stats.instant,
      description: t.home.stats.instantDesc
    },
    {
      icon: <Globe className="h-5 w-5 text-primary" />,
      title: t.home.stats.ethnicities,
      description: t.home.stats.ethnicitiesDesc
    },
    {
      icon: <Shield className="h-5 w-5 text-primary" />,
      title: t.home.features.privateTitle,
      description: t.home.features.privateDesc.substring(0, 50) + "..."
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
    } catch (err: any) {
      console.error("Sign up error:", err);
      toast.error(t.common.error, {
        description: err?.message || t.errors.generic,
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
    } catch (err: any) {
      toast.error(t.common.error, {
        description: err?.message || t.errors.generic,
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

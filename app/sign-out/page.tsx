"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleSignOut = async () => {
      await signOut();
      router.push("/");
    };
    handleSignOut();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Signing out...</p>
      </div>
    </div>
  );
}

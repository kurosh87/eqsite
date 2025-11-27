"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);

// --- TYPE DEFINITIONS ---

export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface SignUpPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  features?: Feature[];
  onSignUp?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignUp?: () => void;
  onSignIn?: () => void;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
    {children}
  </div>
);

const FeatureCard = ({ feature, delay }: { feature: Feature, delay: string }) => (
  <div className={`animate-element ${delay} flex items-start gap-3 p-4 rounded-2xl bg-card/40 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/10`}>
    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
      {feature.icon}
    </div>
    <div>
      <p className="font-medium">{feature.title}</p>
      <p className="text-sm text-muted-foreground">{feature.description}</p>
    </div>
  </div>
);

// Password strength indicator
const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strength = getStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength ? strengthColors[strength - 1] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${strength < 3 ? "text-muted-foreground" : "text-green-500"}`}>
        {strengthLabels[strength - 1] || "Enter a password"}
      </p>
    </div>
  );
};

// --- MAIN COMPONENT ---

export const SignUpPage: React.FC<SignUpPageProps> = ({
  title = <span className="font-light text-foreground tracking-tighter">Create Account</span>,
  description = "Join us and start your journey today",
  heroImageSrc,
  features = [],
  onSignUp,
  onGoogleSignUp,
  onSignIn,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row w-[100dvw]">
      {/* Left column: sign-up form */}
      <section className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">{title}</h1>
            <p className="animate-element animate-delay-200 text-muted-foreground">{description}</p>

            <form className="space-y-5" onSubmit={onSignUp}>
              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <GlassInputWrapper>
                  <input name="name" type="text" placeholder="Enter your name" required className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none" />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <GlassInputWrapper>
                  <input name="email" type="email" placeholder="Enter your email address" required className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none" />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password (min. 8 characters)"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                      {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" /> : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
                <PasswordStrength password={password} />
              </div>

              <div className="animate-element animate-delay-600 flex items-start gap-3 text-sm">
                <input type="checkbox" name="terms" required className="custom-checkbox mt-0.5" />
                <span className="text-foreground/90">
                  I agree to the <a href="#" className="text-violet-400 hover:underline">Terms of Service</a> and <a href="#" className="text-violet-400 hover:underline">Privacy Policy</a>
                </span>
              </div>

              <button type="submit" className="animate-element animate-delay-700 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Create Account
              </button>
            </form>

            <div className="animate-element animate-delay-800 relative flex items-center justify-center">
              <span className="w-full border-t border-border"></span>
              <span className="px-4 text-sm text-muted-foreground bg-background absolute">Or continue with</span>
            </div>

            <button onClick={onGoogleSignUp} className="animate-element animate-delay-900 w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-4 hover:bg-secondary transition-colors">
                <GoogleIcon />
                Continue with Google
            </button>

            <p className="animate-element animate-delay-1000 text-center text-sm text-muted-foreground">
              Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onSignIn?.(); }} className="text-violet-400 hover:underline transition-colors">Sign In</a>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image + features */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center" style={{ backgroundImage: `url(${heroImageSrc})` }}>
            {/* Gradient overlay */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
          {features.length > 0 && (
            <div className="absolute bottom-8 left-8 right-8 flex flex-col gap-3">
              {features.slice(0, 3).map((feature, idx) => (
                <FeatureCard
                  key={idx}
                  feature={feature}
                  delay={`animate-delay-${1000 + idx * 200}`}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using Phenotype ancestry analysis service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: November 2024</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Phenotype, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              Phenotype provides AI-powered facial analysis to identify potential ancestral phenotypes
              and heritage. Our analysis is for entertainment and educational purposes only and should
              not be considered as scientific or medical advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Important Disclaimers</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Not DNA Testing:</strong> Our service analyzes visible facial features only.
                It is not a substitute for actual DNA or genetic testing.
              </li>
              <li>
                <strong>Entertainment Purpose:</strong> Results are generated using AI pattern recognition
                and should be treated as entertainment, not scientific fact.
              </li>
              <li>
                <strong>No Medical Advice:</strong> Our service does not provide medical, genetic counseling,
                or health-related advice.
              </li>
              <li>
                <strong>Accuracy:</strong> While we strive for accuracy, results may vary and should not
                be relied upon for legal, medical, or genealogical purposes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>You must be at least 18 years old to use this service</li>
              <li>You may only upload photos of yourself or photos you have permission to analyze</li>
              <li>You agree not to use the service for any unlawful purpose</li>
              <li>You are responsible for maintaining the security of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Subscription and Payments</h2>
            <p className="text-muted-foreground mb-4">
              Some features require a paid subscription. By subscribing, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Pay the fees associated with your chosen plan</li>
              <li>Automatic renewal unless cancelled before the renewal date</li>
              <li>Our refund policy as described in your subscription agreement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content, features, and functionality of Phenotype are owned by us and protected
              by international copyright, trademark, and other intellectual property laws.
              You retain ownership of photos you upload.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Phenotype is provided &quot;as is&quot; without warranties of any kind. We shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages resulting
              from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will notify users of
              significant changes via email or through the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, contact us at{" "}
              <a href="mailto:legal@phenotype.app" className="text-primary hover:underline">
                legal@phenotype.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

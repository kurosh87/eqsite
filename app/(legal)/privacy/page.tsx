import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Phenotype collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: November 2024</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              When you use Phenotype, we collect the following types of information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Account Information:</strong> Email address and name when you create an account</li>
              <li><strong>Photos:</strong> Images you upload for analysis (processed securely and not shared)</li>
              <li><strong>Analysis Results:</strong> The phenotype analysis results generated from your photos</li>
              <li><strong>Usage Data:</strong> How you interact with our service to improve your experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To provide and improve our phenotype analysis service</li>
              <li>To personalize your experience and save your analysis history</li>
              <li>To communicate with you about your account and updates</li>
              <li>To ensure the security and integrity of our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Photo Privacy</h2>
            <p className="text-muted-foreground mb-4">
              Your privacy is paramount. Here&apos;s how we handle your photos:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Photos are processed using secure, encrypted connections</li>
              <li>We do not sell or share your photos with third parties</li>
              <li>Photos are stored securely and can be deleted at any time</li>
              <li>AI analysis is performed in isolated, secure environments</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures including encryption in transit and at rest,
              secure authentication, and regular security audits to protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access your personal data</li>
              <li>Request deletion of your account and data</li>
              <li>Export your analysis history</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@phenotype.app" className="text-primary hover:underline">
                privacy@phenotype.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

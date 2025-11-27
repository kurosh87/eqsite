"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Download,
  Share2,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Copy,
  Brain,
} from "lucide-react";

interface CertificateData {
  id: string;
  title: string;
  description: string;
  recipientName: string;
  earnedAt: string;
  verificationCode: string;
  skills: string[];
  issuer: string;
}

// Mock certificate data
const MOCK_CERTIFICATE: CertificateData = {
  id: "eq-explorer",
  title: "EQ Explorer Certificate",
  description: "This certifies successful completion of the EQ Explorer program, demonstrating foundational knowledge of emotional intelligence principles and self-assessment capabilities.",
  recipientName: "Demo User",
  earnedAt: new Date().toISOString(),
  verificationCode: "EQ-2024-EXPL-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
  skills: [
    "Emotional Self-Awareness",
    "Basic Self-Assessment",
    "Understanding EQ Domains",
    "Mood Recognition",
  ],
  issuer: "EQ Platform",
};

export default function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // In production, fetch from API
    setTimeout(() => {
      setCertificate(MOCK_CERTIFICATE);
      setLoading(false);
    }, 500);
  }, [id]);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/certificates/${id}/verify`
    : "";

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: certificate?.title,
        text: `I earned the ${certificate?.title} on EQ Platform!`,
        url: shareUrl,
      });
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Certificate Not Found</h1>
        <p className="text-muted-foreground mb-4">
          This certificate doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Button asChild>
          <Link href="/certificates">View Your Certificates</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/certificates">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Certificate</h1>
      </div>

      {/* Certificate Card */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border-4 border-primary/20">
              <Award className="h-10 w-10 text-primary" />
            </div>
            <Badge className="mb-4">Certificate of Achievement</Badge>
            <h2 className="text-3xl font-bold mb-2">{certificate.title}</h2>
            <p className="text-muted-foreground">EQ Platform</p>
          </div>

          {/* Recipient */}
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground mb-1">This certifies that</p>
            <p className="text-2xl font-semibold">{certificate.recipientName}</p>
            <p className="text-sm text-muted-foreground mt-1">
              has successfully demonstrated proficiency in
            </p>
          </div>

          {/* Description */}
          <div className="bg-card/50 rounded-lg p-6 mb-8">
            <p className="text-center">{certificate.description}</p>
          </div>

          {/* Skills */}
          <div className="mb-8">
            <p className="text-sm font-medium text-center mb-3">Skills Demonstrated:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {certificate.skills.map((skill, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-6">
            <div>
              <p className="font-medium">Issue Date</p>
              <p>{new Date(certificate.earnedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</p>
            </div>
            <div className="text-center">
              <Brain className="h-8 w-8 mx-auto text-primary mb-1" />
              <p className="font-medium">{certificate.issuer}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">Verification Code</p>
              <p className="font-mono text-xs">{certificate.verificationCode}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Button className="flex-1" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Verification URL:</p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-background px-2 py-1 rounded flex-1 truncate">
                {shareUrl}
              </code>
              <Button size="sm" variant="ghost" asChild>
                <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add to LinkedIn */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-[#0077B5]/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#0077B5]" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Add to LinkedIn</h3>
              <p className="text-sm text-muted-foreground">
                Share your achievement on your LinkedIn profile
              </p>
            </div>
            <Button variant="outline">
              Add to Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

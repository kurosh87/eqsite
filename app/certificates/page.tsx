"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  Lock,
  CheckCircle,
  Brain,
  Heart,
  Shield,
  Flame,
  Users,
  Star,
  Trophy,
} from "lucide-react";

interface Certificate {
  id: string;
  type: string;
  title: string;
  description: string;
  earnedAt?: string;
  isEarned: boolean;
  progress: number;
  requirements: string[];
  icon: string;
  color: string;
}

const CERTIFICATES: Certificate[] = [
  {
    id: "eq-explorer",
    type: "milestone",
    title: "EQ Explorer",
    description: "Complete your first EQ assessment",
    isEarned: false,
    progress: 0,
    requirements: ["Complete 1 full assessment"],
    icon: "compass",
    color: "#3b82f6",
  },
  {
    id: "eq-practitioner",
    type: "milestone",
    title: "EQ Practitioner",
    description: "Demonstrate consistent EQ practice",
    isEarned: false,
    progress: 0,
    requirements: [
      "Complete 5 assessments",
      "Maintain a 7-day streak",
      "Complete 10 mood check-ins",
    ],
    icon: "medal",
    color: "#10b981",
  },
  {
    id: "self-awareness-specialist",
    type: "domain",
    title: "Self-Awareness Specialist",
    description: "Master the self-awareness domain",
    isEarned: false,
    progress: 0,
    requirements: [
      "Score 85%+ in Self-Awareness",
      "Complete 20 journal entries",
      "Finish all self-awareness exercises",
    ],
    icon: "brain",
    color: "#3b82f6",
  },
  {
    id: "empathy-specialist",
    type: "domain",
    title: "Empathy Specialist",
    description: "Master the empathy domain",
    isEarned: false,
    progress: 0,
    requirements: [
      "Score 85%+ in Empathy",
      "Complete empathy games with 90%+ accuracy",
      "Finish all empathy exercises",
    ],
    icon: "heart",
    color: "#ec4899",
  },
  {
    id: "eq-master",
    type: "mastery",
    title: "EQ Master",
    description: "Achieve mastery across all five EQ domains",
    isEarned: false,
    progress: 0,
    requirements: [
      "Score 80%+ in all 5 domains",
      "Complete 20 assessments",
      "Maintain a 30-day streak",
      "Earn all domain specialist certificates",
    ],
    icon: "crown",
    color: "#f59e0b",
  },
  {
    id: "eq-coach",
    type: "advanced",
    title: "EQ Coach",
    description: "Qualified to help others develop their EQ",
    isEarned: false,
    progress: 0,
    requirements: [
      "Earn EQ Master certificate",
      "Complete coaching module",
      "Help 5 users improve their scores",
      "Pass the coaching assessment",
    ],
    icon: "graduation",
    color: "#8b5cf6",
  },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  compass: <Star className="h-8 w-8" />,
  medal: <Award className="h-8 w-8" />,
  brain: <Brain className="h-8 w-8" />,
  heart: <Heart className="h-8 w-8" />,
  shield: <Shield className="h-8 w-8" />,
  flame: <Flame className="h-8 w-8" />,
  users: <Users className="h-8 w-8" />,
  crown: <Trophy className="h-8 w-8" />,
  graduation: <Award className="h-8 w-8" />,
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>(CERTIFICATES);
  const [loading, setLoading] = useState(false);

  // In production, fetch user's certificate progress from API
  useEffect(() => {
    // Mock: Mark first certificate as earned for demo
    setCertificates(prev => prev.map((cert, i) =>
      i === 0 ? { ...cert, isEarned: true, progress: 100, earnedAt: new Date().toISOString() } : cert
    ));
  }, []);

  const earnedCount = certificates.filter(c => c.isEarned).length;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Award className="h-8 w-8 text-amber-500" />
          Certificates
        </h1>
        <p className="text-muted-foreground">
          Earn certificates to validate your EQ expertise
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Your Progress</h3>
              <p className="text-sm text-muted-foreground">
                {earnedCount} of {certificates.length} certificates earned
              </p>
            </div>
            <div className="text-3xl font-bold text-primary">
              {Math.round((earnedCount / certificates.length) * 100)}%
            </div>
          </div>
          <Progress value={(earnedCount / certificates.length) * 100} className="h-3" />
        </CardContent>
      </Card>

      {/* Earned Certificates */}
      {earnedCount > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Earned Certificates
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {certificates.filter(c => c.isEarned).map(cert => (
              <Card key={cert.id} className="border-green-500/30 bg-green-500/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="h-16 w-16 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${cert.color}20`, color: cert.color }}
                    >
                      {ICON_MAP[cert.icon]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{cert.title}</h3>
                        <Badge variant="outline" className="text-green-600 border-green-500">
                          Earned
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {cert.description}
                      </p>
                      {cert.earnedAt && (
                        <p className="text-xs text-muted-foreground mb-3">
                          Earned on {new Date(cert.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/certificates/${cert.id}`}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-3 w-3 mr-1" />
                          Share
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Certificates */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          Available Certificates
        </h2>
        <div className="space-y-4">
          {certificates.filter(c => !c.isEarned).map(cert => (
            <Card key={cert.id} className="opacity-90">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="h-16 w-16 rounded-xl flex items-center justify-center opacity-50"
                    style={{ backgroundColor: `${cert.color}20`, color: cert.color }}
                  >
                    {ICON_MAP[cert.icon]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{cert.title}</h3>
                      <Badge variant="outline">
                        {cert.type === "milestone" && "Milestone"}
                        {cert.type === "domain" && "Domain Mastery"}
                        {cert.type === "mastery" && "Mastery"}
                        {cert.type === "advanced" && "Advanced"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {cert.description}
                    </p>

                    {/* Requirements */}
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Requirements:</p>
                      <ul className="space-y-1">
                        {cert.requirements.map((req, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-3">
                      <Progress value={cert.progress} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground w-12">
                        {cert.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

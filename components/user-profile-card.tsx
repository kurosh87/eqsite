"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Upload, FileText, Award, Calendar } from "lucide-react";

interface UserProfile {
  profile: {
    user_id: string;
    display_name: string;
    bio?: string;
    avatar_url?: string;
    is_public: boolean;
    created_at: string;
  };
  stats: {
    totalUploads: number;
    totalAnalyses: number;
    totalReports: number;
    paidReports: number;
    firstUpload?: string;
    lastUpload?: string;
  };
  badges: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
}

export function UserProfileCard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 bg-muted rounded-full"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
        </div>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  const memberSince = profile.profile.created_at
    ? new Date(profile.profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <Card className="p-6 space-y-6">
      {/* Profile Header */}
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.profile.avatar_url} />
          <AvatarFallback className="text-lg">
            {profile.profile.display_name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">
            {profile.profile.display_name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Calendar className="w-4 h-4" />
            <span>Member since {memberSince}</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.profile.bio && (
        <div className="text-sm text-muted-foreground">
          {profile.profile.bio}
        </div>
      )}

      <Separator />

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Upload className="w-4 h-4" />
            <span>Uploads</span>
          </div>
          <div className="text-2xl font-bold">{profile.stats.totalUploads}</div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>Analyses</span>
          </div>
          <div className="text-2xl font-bold">{profile.stats.totalAnalyses}</div>
        </div>
      </div>

      {/* Badges */}
      {profile.badges.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Award className="w-4 h-4" />
              <span>Achievements</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge) => (
                <Badge key={badge.id} variant="secondary" className="gap-1">
                  <span>{badge.icon}</span>
                  <span>{badge.name}</span>
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Premium Status */}
      {profile.stats.paidReports > 0 && (
        <>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Premium Reports</span>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
              ⭐ {profile.stats.paidReports} Premium
            </Badge>
          </div>
        </>
      )}
    </Card>
  );
}

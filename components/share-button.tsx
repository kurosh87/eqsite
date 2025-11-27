"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Twitter, Facebook, Link2, Check, Mail } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ShareButton({
  title,
  text,
  url,
  variant = "outline",
  size = "default",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied!", {
        description: "The link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy", {
        description: "Please try again.",
      });
    }
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, "_blank", "noopener,noreferrer");
  };

  const shareViaEmail = () => {
    const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + "\n\n" + shareUrl)}`;
    window.location.href = emailUrl;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="w-4 h-4 me-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={shareToTwitter}>
          <Twitter className="w-4 h-4 me-2" />
          Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook}>
          <Facebook className="w-4 h-4 me-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareViaEmail}>
          <Mail className="w-4 h-4 me-2" />
          Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <Check className="w-4 h-4 me-2 text-green-500" />
          ) : (
            <Link2 className="w-4 h-4 me-2" />
          )}
          {copied ? "Copied!" : "Copy link"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

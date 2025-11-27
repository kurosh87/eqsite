"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ThumbsUp, ThumbsDown, Star, CheckCircle2, Loader2 } from "lucide-react";

interface FeedbackDialogProps {
  analysisId: string;
  reportId?: string;
  children?: React.ReactNode;
}

export function FeedbackDialog({ analysisId, reportId, children }: FeedbackDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!feedbackType) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId,
          reportId,
          feedbackType,
          rating: rating > 0 ? rating : null,
          comment: comment.trim() || null,
          wasHelpful: feedbackType === 'accurate' || feedbackType === 'somewhat_accurate',
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => setIsOpen(false), 2000);
      } else {
        alert("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 me-2" />
            Give Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How accurate was this analysis?</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve our matching algorithm
          </DialogDescription>
        </DialogHeader>

        {!submitted ? (
          <div className="space-y-4">
            {/* Quick Feedback Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={feedbackType === 'accurate' ? 'default' : 'outline'}
                onClick={() => setFeedbackType('accurate')}
                className="h-auto py-4 flex-col gap-2"
              >
                <ThumbsUp className="w-6 h-6" />
                <span>Accurate</span>
              </Button>
              <Button
                variant={feedbackType === 'inaccurate' ? 'default' : 'outline'}
                onClick={() => setFeedbackType('inaccurate')}
                className="h-auto py-4 flex-col gap-2"
              >
                <ThumbsDown className="w-6 h-6" />
                <span>Inaccurate</span>
              </Button>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rate your experience (optional)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 hover:scale-110 transition-transform ${
                      rating >= star ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    <Star className={`w-6 h-6 ${rating >= star ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Box */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Additional comments (optional)
              </label>
              <Textarea
                placeholder="Tell us more about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <div className="font-medium">Thank you for your feedback!</div>
            <div className="text-sm text-muted-foreground">
              Your input helps us improve our accuracy
            </div>
          </div>
        )}

        {!submitted && (
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={!feedbackType || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

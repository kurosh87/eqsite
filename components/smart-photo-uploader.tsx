"use client";

/* eslint-disable @next/next/no-img-element -- live camera previews need plain <img> elements */

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SubscriptionPaywall } from "@/components/subscription-paywall";
import { useLanguage } from "@/components/language-provider";
import {
  Upload,
  X,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle,
  Camera,
  Lightbulb,
  ChevronDown,
  Lock,
} from "lucide-react";

interface ValidationResult {
  valid: boolean;
  reason: string;
  faceCount: number;
  quality: string;
  suggestions?: string;
  warning?: string;
}

interface AnalysisMatch {
  name: string;
  confidence?: number;
  reason?: string;
  phenotypeName?: string;
  imageUrl?: string;
  similarity?: number;
}

interface AnalysisResult {
  matches?: AnalysisMatch[];
  aiReport?: string;
  raw?: string | Record<string, unknown>;
  llmProvider?: string;
}

export function SmartPhotoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [uploadedBlob, setUploadedBlob] = useState<{ url: string; filename: string } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const router = useRouter();
  const { language } = useLanguage();
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.play().catch(() => {
        /* Ignore autoplay errors */
      });
    }
  }, [isCameraActive]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Check subscription status on mount and handle return from Stripe checkout
  useEffect(() => {
    const checkSubscription = async (sync = false) => {
      try {
        const url = sync ? "/api/subscriptions/status?sync=true" : "/api/subscriptions/status";
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setHasSubscription(data.hasSubscription);
          return data.hasSubscription;
        } else {
          setHasSubscription(false);
          return false;
        }
      } catch (err) {
        console.error("Error checking subscription:", err);
        setHasSubscription(false);
        return false;
      } finally {
        setCheckingSubscription(false);
      }
    };

    // Check if returning from Stripe checkout
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionResult = urlParams.get("subscription");

    if (subscriptionResult === "success") {
      // Sync with Stripe and update status
      checkSubscription(true)
        .then((isActive) => {
          if (isActive) {
            // Clean up URL params
            const url = new URL(window.location.href);
            url.searchParams.delete("subscription");
            url.searchParams.delete("session_id");
            window.history.replaceState({}, "", url.toString());
          }
        })
        .catch((err) => {
          console.error("Failed to sync subscription:", err);
        });
    } else {
      checkSubscription(false).catch((err) => {
        console.error("Failed to check subscription:", err);
      });
    }
  }, []);

  const deleteTemporaryUpload = useCallback(
    async (filename?: string) => {
      const target = filename || uploadedBlob?.filename;
      if (!target) return;

      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: target }),
        });
      } catch (deleteErr) {
        console.error("Failed to delete temporary upload:", deleteErr);
      }
    },
    [uploadedBlob]
  );

  const processFile = useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile);
      setError(null);
      setResult(null);
      setValidation(null);

      if (uploadedBlob) {
        await deleteTemporaryUpload(uploadedBlob.filename);
        setUploadedBlob(null);
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);

      setValidating(true);
      let uploadedFilename: string | null = null;

      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Upload failed");
        }

        const { url, filename } = await uploadResponse.json();
        uploadedFilename = filename;
        setUploadedBlob({ url, filename });

        const validationResponse = await fetch("/api/validate-face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: url }),
        });

        if (!validationResponse.ok) {
          throw new Error("Validation failed");
        }

        const validationResult = await validationResponse.json();
        setValidation(validationResult);

        if (!validationResult.valid) {
          setError(validationResult.reason);
          await deleteTemporaryUpload(uploadedFilename || undefined);
          setUploadedBlob(null);
          setFile(null);
          setPreview(null);
          setValidation(null);
        }
      } catch (err: any) {
        console.error("Validation error:", err);
        setError("Failed to validate image. Please try again.");
        if (uploadedFilename) {
          await deleteTemporaryUpload(uploadedFilename);
          setUploadedBlob(null);
        }
        setValidation(null);
      } finally {
        setValidating(false);
      }
    },
    [deleteTemporaryUpload, uploadedBlob]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        await processFile(selectedFile);
      }
      e.target.value = "";
    },
    [processFile]
  );

  const startCamera = useCallback(async () => {
    // Stop any existing stream before starting a new one
    stopCamera();
    setCameraError(null);
    setCameraStarting(true);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStarting(false);
      throw new Error("Camera API not available");
    }

    if (typeof window !== "undefined" && !window.isSecureContext) {
      // getUserMedia is blocked on insecure contexts except localhost/loopback
      const host = window.location.hostname || "";
      const isLoopback =
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "::1" ||
        host.endsWith(".localhost");
      if (!isLoopback) {
        setCameraStarting(false);
        throw new Error("Camera requires HTTPS or localhost/127.0.0.1. Open over https:// or localhost.");
      }
    }

    const constraintSets: MediaStreamConstraints[] = [
      { video: { facingMode: { ideal: "user" } }, audio: false },
      { video: { facingMode: { ideal: "environment" } }, audio: false },
      { video: true, audio: false },
    ];

    for (const constraints of constraintSets) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        return stream;
      } catch (err) {
        // Try next constraints
      }
    }

    setCameraStarting(false);
    throw new Error("Unable to access camera with any constraints");
  }, [stopCamera]);

  const handleTakePhoto = useCallback(
    async (event: React.MouseEvent) => {
      // CRITICAL: Stop propagation to prevent parent div's onClick from triggering
      event.preventDefault();
      event.stopPropagation();
      setError(null);

      if (typeof window === "undefined") {
        return;
      }

      if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function") {
        try {
          const stream = await startCamera();
          streamRef.current = stream;
          setCameraStarting(false);
          setIsCameraActive(true);
          // Bind stream immediately if video element is already mounted
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            void videoRef.current.play().catch(() => {
              /* ignore autoplay errors */
            });
          }
        } catch (err: any) {
          console.error("Camera access error:", err);
          setCameraStarting(false);
          if (err?.name === "NotAllowedError") {
            setError(
              "Camera access was denied. Please enable camera permissions or upload a photo instead."
            );
            setCameraError("Camera access denied in browser permissions.");
          } else {
            setError(
              err?.message ||
                "Unable to access your camera. Please try again, allow permissions, or upload a photo."
            );
            setCameraError(
              err?.message ||
                "Camera unavailable. Check browser permissions or use Upload instead."
            );
          }

          // Fallback: trigger native file picker (mobile capture) so user can still proceed
          cameraInputRef.current?.click();
        }
      } else if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        setError("Camera is not supported on this device. Please upload a photo instead.");
      }
    },
    [startCamera]
  );

  const handleCapturePhoto = useCallback(async () => {
    const video = videoRef.current;
    const stream = streamRef.current;

    if (!video || !stream) {
      setError("Unable to capture photo from camera. Please try again.");
      stopCamera();
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");

    if (!context) {
      setError("Camera capture failed. Please try again or upload a photo.");
      stopCamera();
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((result) => resolve(result), "image/jpeg", 0.95)
    );

    if (!blob) {
      setError("Unable to capture photo. Please try again.");
      stopCamera();
      return;
    }

    const capturedFile = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
    stopCamera();
    await processFile(capturedFile);
  }, [processFile, stopCamera]);

  const handleCancelCapture = useCallback(() => {
    stopCamera();
  }, [stopCamera]);


  const handleAnalyze = async () => {
    if (!file || !validation?.valid || !uploadedBlob) return;

    // Check subscription status before proceeding
    if (!hasSubscription) {
      setShowPaywall(true);
      return;
    }

    // Status messages to rotate through during analysis
    const statusMessages = [
      "Analyzing facial features...",
      "Detecting facial morphology...",
      "Identifying phenotype markers...",
      "Matching ethnic profiles...",
      "Analyzing bone structure...",
      "Processing genetic indicators...",
      "Calculating ancestry composition...",
      "Generating haplogroup predictions...",
      "Compiling scientific analysis...",
      "Finalizing results...",
    ];

    let statusIndex = 0;
    let currentProgress = 20;

    // Start animated progress
    const startProgress = () => {
      setProgress(currentProgress);
      setAnalysisStatus(statusMessages[0]);

      progressIntervalRef.current = setInterval(() => {
        // Increment progress slowly, cap at 90%
        if (currentProgress < 90) {
          currentProgress += Math.random() * 3 + 1;
          if (currentProgress > 90) currentProgress = 90;
          setProgress(Math.round(currentProgress));
        }

        // Rotate status messages
        statusIndex = (statusIndex + 1) % statusMessages.length;
        setAnalysisStatus(statusMessages[statusIndex]);
      }, 2000);
    };

    const stopProgress = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };

    try {
      setError(null);
      setAnalyzing(true);
      startProgress();

      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadedBlob.url, language }),
      });

      stopProgress();

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        // Handle rate limiting specifically
        if (analyzeResponse.status === 429) {
          throw new Error("Too many requests. Please wait a moment and try again.");
        }
        // Handle server errors
        if (analyzeResponse.status >= 500) {
          throw new Error("Server is temporarily unavailable. Please try again later.");
        }
        throw new Error(errorData.error || "Analysis failed");
      }

      const {
        analysisId,
        reportId,
        error,
        matches,
        aiReport,
        raw,
        llmProvider,
        facialAnalysis,
        traitBreakdown,
        ancestryComposition,
        haplogroups,
        geneticHeritageSummary,
        migrationStory,
        rareTraits,
        confidenceFactors,
        scientificNotes,
      } = await analyzeResponse.json();

      setAnalysisStatus("Complete!");
      setProgress(100);

      if (reportId) {
        setTimeout(() => {
          router.push(`/reports/${reportId}/preview`);
        }, 500);
      } else if (analysisId) {
        setTimeout(() => {
          router.push(`/analysis/${analysisId}`);
        }, 500);
      } else {
        if (uploadedBlob?.url) {
          const localId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const payload = {
            uploadedImageUrl: uploadedBlob.url,
            matches,
            aiReport,
            facialAnalysis,
            traitBreakdown,
            ancestryComposition,
            haplogroups,
            geneticHeritageSummary,
            migrationStory,
            rareTraits,
            confidenceFactors,
            scientificNotes,
            raw,
            llmProvider,
            createdAt: new Date().toISOString(),
            localId,
          };
          try {
            localStorage.setItem("localAnalysisResult", JSON.stringify(payload));
            localStorage.setItem(`localAnalysisResult:${localId}`, JSON.stringify(payload));
            router.push(`/reports/local/${localId}`);
          } catch (storageErr) {
            console.warn("Failed to persist local analysis result:", storageErr);
            setResult({ matches, aiReport, raw, llmProvider });
          }
        } else {
          setResult({ matches, aiReport, raw, llmProvider });
        }
        if (error) {
          setError(error);
        }
      }
    } catch (err: any) {
      stopProgress();
      console.error("Error:", err);
      setError(err.message || "An error occurred");
      setProgress(0);
      setAnalysisStatus("");
    } finally {
      setAnalyzing(false);
      stopProgress();
    }
  };

  const clearSelection = () => {
    if (uploadedBlob) {
      void deleteTemporaryUpload(uploadedBlob.filename);
      setUploadedBlob(null);
    }
    setFile(null);
    setPreview(null);
    setError(null);
    setResult(null);
    setValidation(null);
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile && droppedFile.type.startsWith("image/")) {
        await processFile(droppedFile);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const isProcessing = validating || analyzing;
  const canAnalyze = file && validation?.valid && uploadedBlob && !isProcessing;

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "bg-green-500/10 border-green-500/20 text-green-700";
      case "good":
        return "bg-blue-500/10 border-blue-500/20 text-blue-700";
      case "fair":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-700";
      case "poor":
        return "bg-red-500/10 border-red-500/20 text-red-700";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="overflow-hidden border-2 border-dashed hover:border-primary/50 transition-colors">
        {!preview ? (
          <div
            className="relative p-12 md:p-16 text-center cursor-pointer group"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Upload your photo</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Drag and drop your image here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  AI will validate your photo is suitable for analysis
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                <span className="px-3 py-1 rounded-full bg-muted">JPG</span>
                <span className="px-3 py-1 rounded-full bg-muted">PNG</span>
                <span className="px-3 py-1 rounded-full bg-muted">Max 5MB</span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  LLM Validated
                </span>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  variant="secondary"
                  className="sm:flex-1"
                >
                  <Upload className="w-4 h-4 me-2" />
                  Upload from device
                </Button>
                <Button
                  onClick={handleTakePhoto}
                  className="sm:flex-1"
                >
                  <Camera className="w-4 h-4 me-2" />
                  Take a photo
                </Button>
              </div>
              <div className="max-w-md mx-auto space-y-3 text-left">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Pre-upload checklist
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Front-facing headshot with your full face visible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Good, even lighting without harsh shadows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Only you in the frame—no group or obstructed photos</span>
                  </li>
                </ul>
              </div>
            </div>

            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
              aria-label="Select photo file from device"
            />
            <input
              ref={cameraInputRef}
              id="camera-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Capture photo using device camera"
            />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="relative group">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-96 object-cover rounded-lg"
              />
              {!isProcessing && (
                <button
                  onClick={clearSelection}
                  className="absolute top-4 right-4 h-10 w-10 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove selected photo"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Validation Status */}
            {validating && (
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Validating photo with AI...</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Checking if image is suitable for analysis
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {validation && !validating && (
              <Card
                className={`p-4 ${
                  validation.valid
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-destructive/10 border-destructive/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  {validation.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-sm font-medium">
                        {validation.valid ? "Photo Validated ✓" : "Photo Not Suitable"}
                      </span>
                      <div className="flex gap-2">
                        {validation.faceCount >= 0 && (
                          <Badge variant={validation.faceCount === 1 ? "default" : "secondary"}>
                            {validation.faceCount} {validation.faceCount === 1 ? "face" : "faces"}
                          </Badge>
                        )}
                        {validation.quality && validation.quality !== "unknown" && (
                          <Badge className={getQualityColor(validation.quality)}>
                            {validation.quality}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">{validation.reason}</p>
                      {validation.faceCount >= 0 && (
                        <div className="rounded-md bg-background/60 border border-border/60 px-3 py-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Face detection:</span>{" "}
                          {validation.faceCount === 0
                            ? "No faces detected"
                            : `${validation.faceCount} ${validation.faceCount === 1 ? "face" : "faces"} detected`}
                        </div>
                      )}
                      {validation.suggestions && (
                        <p className="text-xs text-muted-foreground italic">
                          💡 {validation.suggestions}
                        </p>
                      )}
                      {validation.warning && (
                        <p className="text-xs text-yellow-600">⚠️ {validation.warning}</p>
                      )}
                    </div>
                    {!validation.valid && (
                      <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                        <p className="font-medium">Portrait photos only.</p>
                        <p className="text-muted-foreground">
                          We currently accept a single, front-facing headshot. Please remove additional people, side profiles, or full-body images before retrying.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Analysis Progress */}
            {analyzing && (
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <div className="absolute inset-0 h-5 w-5 animate-ping text-primary opacity-20">
                          <Sparkles className="h-5 w-5" />
                        </div>
                      </div>
                      <span className="font-medium text-primary">
                        {analysisStatus || "Starting analysis..."}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-bold text-primary">{progress}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={progress} className="h-3" />
                    <div
                      className="absolute top-0 left-0 h-3 bg-primary/30 rounded-full animate-pulse"
                      style={{ width: `${Math.min(progress + 10, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <div className="flex space-x-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span>AI vision model processing your image</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            {!isProcessing && (
              <div className="flex gap-3">
                <Button variant="outline" onClick={clearSelection} className="flex-1">
                  Choose Different Photo
                </Button>
                <Button
                  onClick={handleAnalyze}
                  className="flex-1"
                  size="lg"
                  disabled={!canAnalyze || checkingSubscription}
                >
                  {checkingSubscription ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking access...
                    </>
                  ) : validation?.valid ? (
                    hasSubscription ? (
                      <>
                        <Sparkles className="w-4 h-4 me-2" />
                        Analyze Phenotype
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 me-2" />
                        Unlock Analysis
                      </>
                    )
                  ) : (
                    <>
                      <X className="w-4 h-4 me-2" />
                      Cannot Analyze
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Subscription Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <SubscriptionPaywall
              onSubscribed={() => {
                setShowPaywall(false);
                setHasSubscription(true);
                // Proceed with analysis after subscription
                handleAnalyze();
              }}
              onCancel={() => setShowPaywall(false)}
              returnUrl={typeof window !== "undefined" ? window.location.href : undefined}
            />
          </div>
        </div>
      )}

      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-xl">
            <div className="p-6 space-y-4">
              <div className="text-lg font-semibold text-center">Capture photo</div>
              {cameraStarting && (
                <div className="text-center text-sm text-muted-foreground">
                  Starting camera...
                </div>
              )}
              {cameraError && (
                <div className="text-center text-xs text-destructive">
                  {cameraError}
                </div>
              )}
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full rounded-lg bg-black"
                  playsInline
                  autoPlay
                  muted
                />
                {/* Face alignment overlay */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-48 w-48 rounded-full border-2 border-white/60 shadow-[0_0_40px_rgba(0,0,0,0.35)]" />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-white/80">
                  Center your face in the circle, look straight ahead, and ensure good lighting.
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleCapturePhoto} className="sm:flex-1" size="lg">
                  <Check className="w-4 h-4 me-2" />
                  Use this photo
                </Button>
                <Button
                  onClick={handleCancelCapture}
                  variant="outline"
                  className="sm:flex-1"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      {/* Portrait Guidance */}
      <Card className="mt-8">
        <details className="group [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex w-full cursor-pointer items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3 text-left">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lightbulb className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-base font-semibold">Portrait tips for better results</h4>
                <p className="text-sm text-muted-foreground">
                  Quick guidance to help your photo pass validation on the first try.
                </p>
              </div>
            </div>
            <ChevronDown className="h-5 w-5 text-primary transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t px-5 pb-5 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/60 p-4">
                <h5 className="text-sm font-semibold">Capture essentials</h5>
                <p className="mt-2 text-sm text-muted-foreground">
                  Hold the camera at eye level, keep a neutral background, and relax your expression to make your facial features easy to analyze.
                </p>
              </div>
              <div className="rounded-lg bg-muted/60 p-4">
                <h5 className="text-sm font-semibold">Lighting & focus</h5>
                <p className="mt-2 text-sm text-muted-foreground">
                  Stand near natural light or a soft lamp, avoid backlighting, and ensure the image is sharp without motion blur or heavy filters.
                </p>
              </div>
              <div className="rounded-lg bg-muted/60 p-4 sm:col-span-2">
                <h5 className="text-sm font-semibold">Retake if needed</h5>
                <p className="mt-2 text-sm text-muted-foreground">
                  If the validation flags issues, reshoot with small adjustments—clean lens, centered framing, and remove accessories that cover your face.
                </p>
              </div>
            </div>
          </div>
        </details>
      </Card>
      {/* Inline Result */}
      {result && (
        <Card className="mt-4 p-4 border">
          <h3 className="font-semibold text-lg mb-2">Analysis Result (local)</h3>
          {result.aiReport && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-2">{result.aiReport}</p>
          )}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Matches</h4>
            {(result.matches || []).map((m: AnalysisMatch, idx: number) => (
              <div key={idx} className="text-sm">
                <div className="font-medium">{m.name}</div>
                <div className="text-muted-foreground">
                  {typeof m.confidence === "number" ? `${Math.round(m.confidence)}%` : ""} {m.reason || ""}
                </div>
              </div>
            ))}
          </div>
          {result.raw && (
            <details className="text-xs mt-2">
              <summary className="cursor-pointer">Raw</summary>
              <pre className="whitespace-pre-wrap">
                {typeof result.raw === "string" ? result.raw : JSON.stringify(result.raw, null, 2)}
              </pre>
            </details>
          )}
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="mt-4 p-4 bg-destructive/10 border-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <p className="text-sm text-destructive flex-1">{error}</p>
          </div>
        </Card>
      )}

      {/* Info Grid */}
      <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold mb-1 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Validation
          </div>
          <div className="text-muted-foreground">GPT-4 Vision validates photos</div>
        </div>
        <div className="text-center">
          <div className="font-semibold mb-1">Fast Analysis</div>
          <div className="text-muted-foreground">Results in 30 seconds</div>
        </div>
        <div className="text-center">
          <div className="font-semibold mb-1">Private & Secure</div>
          <div className="text-muted-foreground">Encrypted storage</div>
        </div>
      </div>
    </div>
  );
}

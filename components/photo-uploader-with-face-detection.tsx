"use client";

/* eslint-disable @next/next/no-img-element -- uploader previews use blob URLs incompatible with next/image */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Check, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { detectFace, FaceDetectionResult } from "@/lib/face-detection";

export function PhotoUploaderWithFaceDetection() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectingFace, setDetectingFace] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [faceDetection, setFaceDetection] = useState<FaceDetectionResult | null>(null);
  const router = useRouter();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        await processFile(selectedFile);
      }
    },
    []
  );

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);
    setFaceDetection(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);

    // Run face detection
    setDetectingFace(true);
    try {
      const result = await detectFace(selectedFile);
      setFaceDetection(result);

      if (!result.hasFace) {
        setError(result.message);
      } else if (result.faceCount > 1) {
        // Warning but allow upload
        console.warn(result.message);
      }
    } catch (err) {
      console.error("Face detection failed:", err);
      // Fail-open: allow upload even if face detection fails
      setFaceDetection({
        hasFace: true,
        faceCount: -1,
        confidence: 0,
        message: "Face detection unavailable",
      });
    } finally {
      setDetectingFace(false);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;

    // Block upload if no face detected
    if (faceDetection && !faceDetection.hasFace) {
      setError("Please upload an image with a visible face.");
      return;
    }

    try {
      setError(null);
      setUploading(true);
      setProgress(20);

      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const { url } = await uploadResponse.json();
      setProgress(40);
      setUploading(false);
      setAnalyzing(true);

      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const { analysisId, reportId, error, matches, aiReport, raw, llmProvider } = await analyzeResponse.json();
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
        if (error) {
          setError(error);
        }
        setResult({ matches, aiReport, raw, llmProvider });
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "An error occurred");
      setUploading(false);
      setAnalyzing(false);
      setProgress(0);
    } finally {
      setAnalyzing(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setResult(null);
    setFaceDetection(null);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      await processFile(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const isProcessing = uploading || analyzing || detectingFace;
  const canUpload = file && faceDetection?.hasFace && !isProcessing;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="overflow-hidden border-2 border-dashed hover:border-primary/50 transition-colors">
        {!preview ? (
          <div
            className="relative p-12 md:p-16 text-center cursor-pointer group"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <div className="space-y-6">
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
                  Face detection will verify your photo before analysis
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                <span className="px-3 py-1 rounded-full bg-muted">JPG</span>
                <span className="px-3 py-1 rounded-full bg-muted">PNG</span>
                <span className="px-3 py-1 rounded-full bg-muted">Max 5MB</span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Validated
                </span>
              </div>
            </div>

            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
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
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              {/* Face detection overlay */}
              {faceDetection && faceDetection.boundingBoxes && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {faceDetection.boundingBoxes.map((box, i) => (
                    <rect
                      key={i}
                      x={box.x}
                      y={box.y}
                      width={box.width}
                      height={box.height}
                      fill="none"
                      stroke={faceDetection.faceCount === 1 ? "#22c55e" : "#f59e0b"}
                      strokeWidth="0.5"
                      className="opacity-75"
                    />
                  ))}
                </svg>
              )}
            </div>

            {/* Face Detection Status */}
            {detectingFace && (
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm font-medium">Detecting face...</span>
                </div>
              </Card>
            )}

            {faceDetection && !detectingFace && (
              <Card
                className={`p-4 ${
                  faceDetection.hasFace
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-destructive/10 border-destructive/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  {faceDetection.hasFace ? (
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {faceDetection.hasFace ? "Face Detected" : "No Face Detected"}
                      </span>
                      {faceDetection.hasFace && faceDetection.faceCount >= 0 && (
                        <Badge
                          variant={faceDetection.faceCount === 1 ? "default" : "secondary"}
                        >
                          {faceDetection.faceCount} {faceDetection.faceCount === 1 ? "face" : "faces"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{faceDetection.message}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Upload Progress */}
            {isProcessing && (
              <Card className="p-6 bg-muted/50">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="font-medium">
                        {uploading && "Uploading your photo..."}
                        {analyzing && "Analyzing phenotypes..."}
                        {detectingFace && "Detecting face..."}
                      </span>
                    </div>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    This may take 15-30 seconds
                  </p>
                </div>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Card className="p-4 bg-destructive/10 border-destructive">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive flex-1">{error}</p>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            {!isProcessing && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={clearSelection}
                  className="flex-1"
                >
                  Choose Different Photo
                </Button>
                <Button
                  onClick={handleUploadAndAnalyze}
                  className="flex-1"
                  size="lg"
                  disabled={!canUpload}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Analyze Photo
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Info Grid */}
      <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold mb-1 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Face Detection
          </div>
          <div className="text-muted-foreground">Validates photos before upload</div>
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

      {/* Inline Result */}
      {result && (
        <Card className="mt-4 p-4 border">
          <h3 className="font-semibold text-lg mb-2">Analysis Result (local)</h3>
          {result.aiReport && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-2">{result.aiReport}</p>
          )}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Matches</h4>
            {(result.matches || []).map((m: any, idx: number) => (
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
    </div>
  );
}

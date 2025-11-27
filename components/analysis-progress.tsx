"use client";

import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, Upload, Brain, Sparkles, FileCheck } from "lucide-react";
import { useState, useEffect } from "react";

export interface AnalysisStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'pending' | 'processing' | 'complete' | 'error';
  message?: string;
}

interface AnalysisProgressProps {
  currentStep?: number;
  totalSteps?: number;
  status?: 'uploading' | 'analyzing' | 'generating' | 'complete' | 'error';
  message?: string;
}

export function AnalysisProgress({
  currentStep = 0,
  totalSteps = 5,
  status = 'uploading',
  message,
}: AnalysisProgressProps) {
  const [progress, setProgress] = useState(0);

  const steps: AnalysisStep[] = [
    {
      id: 'upload',
      label: 'Uploading photo',
      icon: <Upload className="w-5 h-5" />,
      status: currentStep > 0 ? 'complete' : currentStep === 0 ? 'processing' : 'pending',
    },
    {
      id: 'embedding',
      label: 'Generating AI embedding',
      icon: <Brain className="w-5 h-5" />,
      status: currentStep > 1 ? 'complete' : currentStep === 1 ? 'processing' : 'pending',
    },
    {
      id: 'matching',
      label: 'Finding phenotype matches',
      icon: <Sparkles className="w-5 h-5" />,
      status: currentStep > 2 ? 'complete' : currentStep === 2 ? 'processing' : 'pending',
    },
    {
      id: 'measurements',
      label: 'Analyzing facial measurements',
      icon: <FileCheck className="w-5 h-5" />,
      status: currentStep > 3 ? 'complete' : currentStep === 3 ? 'processing' : 'pending',
    },
    {
      id: 'report',
      label: 'Generating analysis report',
      icon: <Sparkles className="w-5 h-5" />,
      status: currentStep > 4 ? 'complete' : currentStep === 4 ? 'processing' : 'pending',
    },
  ];

  useEffect(() => {
    const newProgress = (currentStep / totalSteps) * 100;
    setProgress(newProgress);
  }, [currentStep, totalSteps]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-6">
      {/* Main Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Analyzing your photo...</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step-by-Step Progress */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
              step.status === 'processing'
                ? 'bg-primary/10 border border-primary/20'
                : step.status === 'complete'
                ? 'bg-green-50 dark:bg-green-950/20'
                : 'bg-muted/30'
            }`}
          >
            {/* Icon */}
            <div className={`mt-0.5 ${
              step.status === 'processing' ? 'animate-pulse text-primary' :
              step.status === 'complete' ? 'text-green-600 dark:text-green-400' :
              'text-muted-foreground'
            }`}>
              {step.status === 'processing' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : step.status === 'complete' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                step.icon
              )}
            </div>

            {/* Label and Status */}
            <div className="flex-1 min-w-0">
              <div className={`font-medium ${
                step.status === 'processing' ? 'text-primary' :
                step.status === 'complete' ? 'text-green-700 dark:text-green-300' :
                'text-muted-foreground'
              }`}>
                {step.label}
              </div>
              {step.status === 'processing' && step.message && (
                <div className="text-sm text-muted-foreground mt-1">
                  {step.message}
                </div>
              )}
            </div>

            {/* Step Number */}
            <div className={`text-xs font-mono px-2 py-1 rounded ${
              step.status === 'complete' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
              step.status === 'processing' ? 'bg-primary/20 text-primary' :
              'bg-muted text-muted-foreground'
            }`}>
              {index + 1}/{totalSteps}
            </div>
          </div>
        ))}
      </div>

      {/* Current Message */}
      {message && (
        <div className="text-center text-sm text-muted-foreground italic">
          {message}
        </div>
      )}

      {/* Estimated Time */}
      {status === 'analyzing' && (
        <div className="text-center text-xs text-muted-foreground">
          Estimated time: 5-10 seconds
        </div>
      )}
    </div>
  );
}

/**
 * Compact progress indicator for inline use
 */
export function CompactProgress({ message = "Processing..." }: { message?: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
      <div>
        <div className="font-medium">{message}</div>
        <div className="text-xs text-muted-foreground">This may take a few seconds...</div>
      </div>
    </div>
  );
}

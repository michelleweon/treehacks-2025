"use client";

import type { Database } from "@/types/supabase";
import { useEffect, useRef, useState } from "react";

interface AnalysisCardProps {
  recordings: {
    filename: string;
    sample_index: number;
    green: number | null;
    red: number | null;
    ir: number | null;
    acc_x: number | null;
    acc_y: number | null;
    acc_z: number | null;
  }[];
  metadata: Database["public"]["Tables"]["metadata"]["Row"] | undefined;
  type: "afib" | "irregular" | "regular" | "unclassified";
}

interface AIClassification {
  classification: "regular" | "irregular" | "afib" | "unclassified";
  confidence: number;
}

interface ClassificationResponse {
  classification: "regular" | "irregular" | "afib" | "unclassified";
  confidence: number;
}

export default function AnalysisCard({ recordings, metadata, type }: AnalysisCardProps) {
  const [aiClassification, setAiClassification] = useState<AIClassification | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const hasAttemptedRef = useRef(false);
  const [perplexityAnalysis, setPerplexityAnalysis] = useState<string | null>(null);

  useEffect(() => {
    async function getClassification() {
      if (!metadata || isClassifying || aiClassification || hasAttemptedRef.current) return;

      hasAttemptedRef.current = true;
      setIsClassifying(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch("/api/classify-recording", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recordings, metadata }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (isClassificationResponse(data)) {
            setAiClassification({
              classification: data.classification,
              confidence: data.confidence,
            });
          } else {
            console.error("Unexpected response structure:", data);
          }
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Request timed out");
        } else {
          console.error("Failed to get AI classification:", error);
        }
      } finally {
        setIsClassifying(false);
      }
    }

    (async () => {
      await getClassification();
    })().catch((error) => {
      console.error("Error in classification effect:", error);
    });
  }, [recordings, metadata, isClassifying]);

  useEffect(() => {
    async function fetchPerplexityAnalysis() {
      if (!metadata || !recordings.length) return;

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recordings,
            metadata,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (isPerplexityAnalysisResponse(data)) {
            setPerplexityAnalysis(data.analysis);
          } else {
            console.error("Unexpected analysis structure:", data);
          }
        } else {
          console.error("Failed to fetch Perplexity AI analysis");
        }
      } catch (error) {
        console.error("Error fetching Perplexity AI analysis:", error);
      }
    }

    void fetchPerplexityAnalysis();
  }, [recordings, metadata]);

  if (!metadata) return null;

  // Calculate key metrics
  const totalSamples = recordings.length;
  const recordingDuration = totalSamples / 100; // Assuming 100Hz sampling rate

  // Calculate heart rate variability (using IR signal)
  const irValues = recordings.map((r) => r.ir).filter((v): v is number => v !== null);
  const hrv = calculateHRV(irValues);

  // Calculate motion intensity from accelerometer
  const motionIntensity = calculateMotionIntensity(recordings);

  // Determine risk level based on metadata and type
  const riskLevel = determineRiskLevel(metadata, type);

  return (
    <div className="rounded-lg border border-border bg-background p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-foreground">Analysis Summary</h4>
        <p className="text-sm text-muted-foreground">
          Based on {totalSamples} samples over {recordingDuration.toFixed(1)}s
        </p>
      </div>

      {/* Key Metrics */}
      <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="font-medium text-foreground">Heart Rate Variability:</p>
          <p className="text-muted-foreground">{hrv.toFixed(2)}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">Motion Intensity:</p>
          <p className="text-muted-foreground">{motionIntensity.toFixed(2)}</p>
        </div>
      </div>

      {/* AI Classification */}
      <div className="mb-4">
        <h5 className="mb-2 font-medium text-foreground">AI Classification</h5>
        {isClassifying ? (
          <p className="text-sm text-muted-foreground">Analyzing...</p>
        ) : aiClassification ? (
          <div>
            <div
              className={`
                mb-2 rounded-md px-2 py-1 text-sm font-medium
                ${
                  aiClassification.classification === "afib"
                    ? "bg-red-100 text-red-700"
                    : aiClassification.classification === "irregular"
                      ? "bg-yellow-100 text-yellow-700"
                      : aiClassification.classification === "unclassified"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                }
              `}
            >
              Classified as {aiClassification.classification.toUpperCase()}
              <span className="ml-2 text-xs">({(aiClassification.confidence * 100).toFixed(1)}% confidence)</span>
            </div>
            {aiClassification.classification !== type && (
              <p className="text-sm text-amber-600">Note: AI classification may differ from current classification</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Classification unavailable</p>
        )}
      </div>

      {/* Perplexity AI Analysis */}
      <div className="mb-4">
        <h5 className="mb-2 font-medium text-foreground">Perplexity AI Insights</h5>
        {perplexityAnalysis ? (
          <p className="text-sm text-muted-foreground">{perplexityAnalysis}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Loading insights...</p>
        )}
      </div>

      {/* Risk Assessment */}
      <div className="mb-4">
        <h5 className="mb-2 font-medium text-foreground">Risk Assessment</h5>
        <div
          className={`
          mb-2 rounded-md px-2 py-1 text-sm font-medium
          ${
            riskLevel === "High"
              ? "bg-red-100 text-red-700"
              : riskLevel === "Medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
          }
        `}
        >
          {riskLevel} Risk Level
        </div>
        {getRecommendations(type, metadata)}
      </div>

      {/* Metadata Highlights */}
      <div className="space-y-2 text-sm">
        <h5 className="font-medium text-foreground">Key Findings</h5>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-muted-foreground">AFib:</p>
            <p className="text-foreground">{(metadata.atrial_fibrillation ?? 0).toFixed(3)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Bradycardia:</p>
            <p className="text-foreground">{(metadata.bradycardia ?? 0).toFixed(3)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tachycardia:</p>
            <p className="text-foreground">{(metadata.tachycardia ?? 0).toFixed(3)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Extrasystoles:</p>
            <p className="text-foreground">{(metadata.extrasystoles_frequent ?? 0).toFixed(3)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function calculateHRV(values: number[]): number {
  if (values.length < 2) return 0;

  // Calculate RR intervals (time between peaks)
  const rrIntervals = [];
  for (let i = 1; i < values.length; i++) {
    const currentValue = values[i];
    const previousValue = values[i - 1];
    if (currentValue !== undefined && previousValue !== undefined) {
      const amplitude = Math.abs(currentValue - previousValue);
      if (amplitude > 0) {
        // Only consider significant changes
        rrIntervals.push(amplitude);
      }
    }
  }

  if (rrIntervals.length < 2) return 0;

  // Calculate RMSSD (Root Mean Square of Successive Differences)
  const squaredDifferences = [];
  for (let i = 1; i < rrIntervals.length; i++) {
    const currentInterval = rrIntervals[i];
    const previousInterval = rrIntervals[i - 1];
    if (currentInterval !== undefined && previousInterval !== undefined) {
      const diff = currentInterval - previousInterval;
      squaredDifferences.push(diff * diff);
    }
  }

  const meanSquaredDiff = squaredDifferences.reduce((sum, val) => sum + val, 0) / squaredDifferences.length;
  return Math.sqrt(meanSquaredDiff);
}

function calculateMotionIntensity(recordings: AnalysisCardProps["recordings"]): number {
  return (
    recordings.reduce((sum, r) => {
      const x = r.acc_x ?? 0;
      const y = r.acc_y ?? 0;
      const z = r.acc_z ?? 0;
      return sum + Math.sqrt(x * x + y * y + z * z);
    }, 0) / recordings.length
  );
}

function determineRiskLevel(
  metadata: NonNullable<AnalysisCardProps["metadata"]>,
  type: AnalysisCardProps["type"],
): "Low" | "Medium" | "High" {
  if (type === "afib" || (metadata.atrial_fibrillation ?? 0) > 50) return "High";
  if (type === "irregular" || (metadata.extrasystoles_frequent ?? 0) > 30) return "Medium";
  return "Low";
}

function getRecommendations(type: AnalysisCardProps["type"], metadata: NonNullable<AnalysisCardProps["metadata"]>) {
  const recommendations = [];

  if (type === "afib" || (metadata.atrial_fibrillation ?? 0) > 50) {
    recommendations.push("Immediate medical attention recommended");
  }
  if ((metadata.bradycardia ?? 0) > 30) {
    recommendations.push("Monitor for low heart rate episodes");
  }
  if ((metadata.tachycardia ?? 0) > 30) {
    recommendations.push("Monitor for high heart rate episodes");
  }

  return (
    <div className="mt-2 space-y-1">
      {recommendations.map((rec, i) => (
        <p key={i} className="text-sm text-muted-foreground">
          • {rec}
        </p>
      ))}
    </div>
  );
}

// Helper function to validate the response structure
function isClassificationResponse(data: unknown): data is ClassificationResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as ClassificationResponse).classification === "string" &&
    ["regular", "irregular", "afib", "unclassified"].includes((data as ClassificationResponse).classification) &&
    typeof (data as ClassificationResponse).confidence === "number"
  );
}
// Helper function to validate the response structure
function isPerplexityAnalysisResponse(data: unknown): data is { analysis: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "analysis" in data &&
    typeof (data as { analysis: unknown }).analysis === "string"
  );
}

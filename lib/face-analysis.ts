/**
 * Advanced face analysis using MediaPipe and custom measurements
 * Provides anthropometric measurements for hybrid matching
 */

import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import { createTimeoutSignal, TIMEOUTS } from "./timeout-utils";

let faceLandmarker: FaceLandmarker | null = null;

/**
 * Initialize MediaPipe Face Landmarker
 * Called once on first use
 */
async function initializeFaceLandmarker() {
  if (faceLandmarker) return faceLandmarker;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    runningMode: "IMAGE",
    numFaces: 1,
  });

  return faceLandmarker;
}

/**
 * Facial measurements interface
 */
export interface FacialMeasurements {
  // Basic measurements
  faceWidth: number;
  faceHeight: number;
  jawWidth: number;

  // Facial ratios (key anthropometric indicators)
  faceWidthToHeightRatio: number;
  jawToFaceWidthRatio: number;
  eyeSpacingRatio: number;
  noseWidthRatio: number;
  mouthWidthRatio: number;

  // Detailed measurements
  noseLength: number;
  noseWidth: number;
  eyeDistance: number;
  mouthWidth: number;
  foreheadHeight: number;

  // Angles (important for phenotype matching)
  nasofrontalAngle: number; // Nose-forehead angle
  gonialAngle: number; // Jaw angle

  // Additional features
  facialIndex: number; // Height/Width ratio
  nasalIndex: number; // Nose width/length ratio

  // Confidence scores
  confidence: number;
  landmarkCount: number;
}

/**
 * Calculate distance between two 3D points
 */
function calculateDistance(
  point1: { x: number; y: number; z: number },
  point2: { x: number; y: number; z: number }
): number {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) +
    Math.pow(point2.y - point1.y, 2) +
    Math.pow(point2.z - point1.z, 2)
  );
}

/**
 * Calculate angle between three points
 */
function calculateAngle(
  point1: { x: number; y: number; z: number },
  vertex: { x: number; y: number; z: number },
  point2: { x: number; y: number; z: number }
): number {
  const v1 = {
    x: point1.x - vertex.x,
    y: point1.y - vertex.y,
    z: point1.z - vertex.z,
  };
  const v2 = {
    x: point2.x - vertex.x,
    y: point2.y - vertex.y,
    z: point2.z - vertex.z,
  };

  const dotProduct = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const magnitude1 = Math.sqrt(v1.x ** 2 + v1.y ** 2 + v1.z ** 2);
  const magnitude2 = Math.sqrt(v2.x ** 2 + v2.y ** 2 + v2.z ** 2);

  return Math.acos(dotProduct / (magnitude1 * magnitude2)) * (180 / Math.PI);
}

/**
 * Extract facial measurements from MediaPipe landmarks
 * Returns anthropometric measurements for phenotype matching
 */
export async function extractFacialMeasurements(
  imageUrl: string
): Promise<FacialMeasurements | null> {
  try {
    // Initialize landmarker
    const landmarker = await initializeFaceLandmarker();

    // Fetch image with timeout
    const response = await fetch(imageUrl, {
      signal: createTimeoutSignal(TIMEOUTS.EXTERNAL_API),
    });
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);

    // Detect landmarks
    const result = landmarker.detect(imageBitmap);

    if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
      console.warn("No face detected in image");
      return null;
    }

    const landmarks = result.faceLandmarks[0]; // First face

    // Key landmark indices (MediaPipe 478-point model)
    const indices = {
      // Face outline
      leftCheek: 234,
      rightCheek: 454,
      topHead: 10,
      chin: 152,

      // Eyes
      leftEyeInner: 133,
      leftEyeOuter: 33,
      rightEyeInner: 362,
      rightEyeOuter: 263,

      // Nose
      noseTip: 1,
      noseTop: 6,
      noseLeftWing: 129,
      noseRightWing: 358,

      // Mouth
      mouthLeft: 61,
      mouthRight: 291,

      // Jaw
      leftJaw: 172,
      rightJaw: 397,

      // Forehead
      foreheadCenter: 10,
    };

    // Calculate basic measurements
    const faceWidth = calculateDistance(
      landmarks[indices.leftCheek],
      landmarks[indices.rightCheek]
    );

    const faceHeight = calculateDistance(
      landmarks[indices.topHead],
      landmarks[indices.chin]
    );

    const jawWidth = calculateDistance(
      landmarks[indices.leftJaw],
      landmarks[indices.rightJaw]
    );

    const noseLength = calculateDistance(
      landmarks[indices.noseTop],
      landmarks[indices.noseTip]
    );

    const noseWidth = calculateDistance(
      landmarks[indices.noseLeftWing],
      landmarks[indices.noseRightWing]
    );

    const eyeDistance = calculateDistance(
      landmarks[indices.leftEyeInner],
      landmarks[indices.rightEyeInner]
    );

    const mouthWidth = calculateDistance(
      landmarks[indices.mouthLeft],
      landmarks[indices.mouthRight]
    );

    const foreheadHeight = calculateDistance(
      landmarks[indices.foreheadCenter],
      landmarks[indices.noseTop]
    );

    // Calculate angles
    const nasofrontalAngle = calculateAngle(
      landmarks[indices.foreheadCenter],
      landmarks[indices.noseTop],
      landmarks[indices.noseTip]
    );

    const gonialAngle = calculateAngle(
      landmarks[indices.leftJaw],
      landmarks[indices.chin],
      landmarks[indices.rightJaw]
    );

    // Calculate ratios (normalized measurements)
    const faceWidthToHeightRatio = faceWidth / faceHeight;
    const jawToFaceWidthRatio = jawWidth / faceWidth;
    const eyeSpacingRatio = eyeDistance / faceWidth;
    const noseWidthRatio = noseWidth / faceWidth;
    const mouthWidthRatio = mouthWidth / faceWidth;
    const facialIndex = faceHeight / faceWidth;
    const nasalIndex = noseWidth / noseLength;

    return {
      // Basic measurements
      faceWidth,
      faceHeight,
      jawWidth,

      // Ratios (most important for matching)
      faceWidthToHeightRatio,
      jawToFaceWidthRatio,
      eyeSpacingRatio,
      noseWidthRatio,
      mouthWidthRatio,

      // Detailed measurements
      noseLength,
      noseWidth,
      eyeDistance,
      mouthWidth,
      foreheadHeight,

      // Angles
      nasofrontalAngle,
      gonialAngle,

      // Indices
      facialIndex,
      nasalIndex,

      // Metadata
      confidence: 0.95, // MediaPipe confidence is generally high
      landmarkCount: landmarks.length,
    };
  } catch (error) {
    console.error("Error extracting facial measurements:", error);
    return null;
  }
}

/**
 * Compare two sets of facial measurements
 * Returns similarity score (0-1, higher is more similar)
 */
export function compareFacialMeasurements(
  measurements1: FacialMeasurements,
  measurements2: FacialMeasurements
): number {
  // Weight different features by importance
  const weights = {
    faceWidthToHeightRatio: 0.20,
    jawToFaceWidthRatio: 0.15,
    eyeSpacingRatio: 0.12,
    noseWidthRatio: 0.12,
    mouthWidthRatio: 0.10,
    facialIndex: 0.12,
    nasalIndex: 0.10,
    nasofrontalAngle: 0.05,
    gonialAngle: 0.04,
  };

  let totalSimilarity = 0;
  let totalWeight = 0;

  for (const [feature, weight] of Object.entries(weights)) {
    const value1 = measurements1[feature as keyof FacialMeasurements] as number;
    const value2 = measurements2[feature as keyof FacialMeasurements] as number;

    if (value1 && value2) {
      // Calculate percentage difference (0-1, where 1 is identical)
      const percentDiff = Math.abs(value1 - value2) / Math.max(value1, value2);
      const similarity = 1 - Math.min(percentDiff, 1);

      totalSimilarity += similarity * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? totalSimilarity / totalWeight : 0;
}

/**
 * Analyze facial features for phenotype matching
 * Returns feature descriptions and characteristic patterns
 */
export function analyzeFacialFeatures(measurements: FacialMeasurements): {
  faceShape: string;
  noseType: string;
  jawType: string;
  proportions: string;
  characteristics: string[];
} {
  const characteristics: string[] = [];

  // Determine face shape based on width-to-height ratio
  let faceShape = "oval";
  if (measurements.faceWidthToHeightRatio > 0.85) {
    faceShape = "round";
    characteristics.push("Broad facial structure");
  } else if (measurements.faceWidthToHeightRatio < 0.70) {
    faceShape = "elongated";
    characteristics.push("Narrow, elongated facial structure");
  } else {
    characteristics.push("Balanced facial proportions");
  }

  // Determine nose type based on nasal index
  let noseType = "medium";
  if (measurements.nasalIndex > 0.85) {
    noseType = "broad";
    characteristics.push("Wider nasal structure");
  } else if (measurements.nasalIndex < 0.70) {
    noseType = "narrow";
    characteristics.push("Narrow nasal structure");
  }

  // Determine jaw type
  let jawType = "medium";
  if (measurements.jawToFaceWidthRatio > 0.90) {
    jawType = "wide";
    characteristics.push("Prominent jaw structure");
  } else if (measurements.jawToFaceWidthRatio < 0.75) {
    jawType = "narrow";
    characteristics.push("Delicate jaw structure");
  }

  // Analyze proportions
  let proportions = "balanced";
  if (measurements.facialIndex > 1.2) {
    proportions = "leptoprosopic (narrow and tall)";
    characteristics.push("Vertically elongated features");
  } else if (measurements.facialIndex < 0.9) {
    proportions = "euryprosopic (wide and short)";
    characteristics.push("Horizontally broad features");
  }

  // Add more specific characteristics
  if (measurements.eyeSpacingRatio > 0.45) {
    characteristics.push("Wide-set eyes");
  } else if (measurements.eyeSpacingRatio < 0.35) {
    characteristics.push("Close-set eyes");
  }

  if (measurements.nasofrontalAngle > 140) {
    characteristics.push("Prominent nasal bridge");
  } else if (measurements.nasofrontalAngle < 125) {
    characteristics.push("Flatter nasal profile");
  }

  return {
    faceShape,
    noseType,
    jawType,
    proportions,
    characteristics,
  };
}

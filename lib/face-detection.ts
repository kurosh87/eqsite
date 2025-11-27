/**
 * Face Detection using MediaPipe
 *
 * This utility detects faces in images before upload to ensure
 * users are uploading valid facial photos.
 */

import { FilesetResolver, FaceDetector } from "@mediapipe/tasks-vision";

let faceDetector: FaceDetector | null = null;

/**
 * Initialize the MediaPipe Face Detector
 * Downloads the model file on first use (cached by browser)
 */
export async function initializeFaceDetector(): Promise<FaceDetector> {
  if (faceDetector) return faceDetector;

  try {
    // Load MediaPipe vision tasks
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    // Create face detector with blazeface short-range model (optimized for selfies)
    faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
        delegate: "GPU", // Use GPU acceleration if available
      },
      runningMode: "IMAGE",
      minDetectionConfidence: 0.5, // 50% confidence threshold
    });

    return faceDetector;
  } catch (error) {
    console.error("Failed to initialize face detector:", error);
    throw new Error("Face detection could not be initialized");
  }
}

export interface FaceDetectionResult {
  hasFace: boolean;
  faceCount: number;
  confidence: number;
  message: string;
  boundingBoxes?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

/**
 * Detect faces in an image file or URL
 */
export async function detectFace(
  imageSource: File | string
): Promise<FaceDetectionResult> {
  try {
    const detector = await initializeFaceDetector();

    // Create image element
    const img = new Image();

    // Load image
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image"));

      if (typeof imageSource === "string") {
        img.src = imageSource;
      } else {
        img.src = URL.createObjectURL(imageSource);
      }
    });

    // Run face detection
    const detections = detector.detect(img);

    // Clean up object URL if we created one
    if (imageSource instanceof File) {
      URL.revokeObjectURL(img.src);
    }

    const faceCount = detections.detections.length;

    // Extract confidence scores
    const confidences = detections.detections.map(
      (d) => d.categories[0]?.score || 0
    );
    const avgConfidence = confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;

    // Extract bounding boxes
    const boundingBoxes = detections.detections.map((d) => ({
      x: d.boundingBox?.originX || 0,
      y: d.boundingBox?.originY || 0,
      width: d.boundingBox?.width || 0,
      height: d.boundingBox?.height || 0,
    }));

    // Determine result
    if (faceCount === 0) {
      return {
        hasFace: false,
        faceCount: 0,
        confidence: 0,
        message: "No face detected. Please upload a clear photo of your face.",
      };
    }

    if (faceCount === 1) {
      return {
        hasFace: true,
        faceCount: 1,
        confidence: avgConfidence,
        message: `Face detected with ${Math.round(avgConfidence * 100)}% confidence`,
        boundingBoxes,
      };
    }

    // Multiple faces
    return {
      hasFace: true,
      faceCount,
      confidence: avgConfidence,
      message: `${faceCount} faces detected. For best results, upload a photo with only one face.`,
      boundingBoxes,
    };
  } catch (error) {
    console.error("Face detection error:", error);

    // Return permissive result on error (fail-open)
    return {
      hasFace: true,
      faceCount: -1,
      confidence: 0,
      message: "Face detection unavailable. Upload will proceed without validation.",
    };
  }
}

/**
 * Validate that an image contains exactly one face
 */
export async function validateSingleFace(
  imageSource: File | string
): Promise<{ valid: boolean; message: string }> {
  const result = await detectFace(imageSource);

  if (!result.hasFace) {
    return {
      valid: false,
      message: result.message,
    };
  }

  if (result.faceCount > 1) {
    return {
      valid: false,
      message: result.message,
    };
  }

  if (result.confidence < 0.5) {
    return {
      valid: false,
      message: "Face detection confidence too low. Please upload a clearer photo.",
    };
  }

  return {
    valid: true,
    message: result.message,
  };
}

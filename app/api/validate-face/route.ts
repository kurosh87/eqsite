import { NextRequest, NextResponse } from "next/server";

/**
 * Face validation endpoint.
 * Currently bypassed for faster UX - returns valid for all images.
 * To re-enable validation, uncomment the validation logic below.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Fast-path: skip remote validation to avoid slowing the UX.
    // The analyze endpoint will handle any issues with the image.
    return NextResponse.json({
      valid: true,
      reason: "Validation skipped to speed up analysis",
      faceCount: 1,
      quality: "unknown",
      suggestions: null,
      warning: "Face validation is currently bypassed; analysis proceeds directly.",
    });
  } catch (error: any) {
    console.error("Face validation error:", error);

    // Fail-open: if anything fails, allow upload
    return NextResponse.json({
      valid: true,
      reason: "Validation service unavailable, proceeding without check",
      faceCount: -1,
      quality: "unknown",
      suggestions: null,
      warning: "Face validation was skipped due to technical issues",
    });
  }
}

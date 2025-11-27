import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

// Simple magic byte validation for images (no external dependencies)
function getImageType(buffer: Buffer): { mime: string; ext: string } | null {
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { mime: 'image/png', ext: 'png' };
  }
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return { mime: 'image/webp', ext: 'webp' };
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP address
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "anonymous";
    const rateLimit = await checkRateLimit(`upload:${ip}`);

    if (!rateLimit.success) {
      return NextResponse.json(
        rateLimitResponse(rateLimit.remaining, rateLimit.reset),
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.reset),
          }
        }
      );
    }

    // Check if blob storage is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('[Upload] BLOB_READ_WRITE_TOKEN not configured');
      return NextResponse.json(
        { error: "Storage not configured. Missing BLOB_READ_WRITE_TOKEN." },
        { status: 503 }
      );
    }

    // Get the uploaded file from form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size first (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Read file buffer for magic byte validation
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file type using magic bytes
    const fileType = getImageType(buffer);

    if (!fileType) {
      return NextResponse.json(
        { error: "Invalid image file. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Generate unique filename with sanitized name
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `uploads/${timestamp}-${sanitizedName}`;

    // Upload to Vercel Blob using the buffer
    console.log('[Upload] Starting blob upload:', { filename, size: buffer.length, contentType: fileType.mime });

    const blob = await put(filename, buffer, {
      access: "public",
      contentType: fileType.mime,
    });

    console.log('[Upload] Success:', { url: blob.url });

    return NextResponse.json({
      url: blob.url,
      filename: filename,
    });
  } catch (error: any) {
    // Log detailed error info
    console.error('[Upload Error]', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      cause: error?.cause,
      stack: error?.stack?.split('\n').slice(0, 5).join('\n'),
    });

    // Return more specific error info
    const errorMessage = error?.message || "Failed to upload image";
    const isConfigError = errorMessage.includes('BLOB') || errorMessage.includes('token') || errorMessage.includes('unauthorized');

    return NextResponse.json(
      {
        error: isConfigError
          ? "Storage not configured. Please check BLOB_READ_WRITE_TOKEN."
          : errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let filename: string | null = null;

    if (request.headers.get("content-type")?.includes("application/json")) {
      const body = await request.json();
      filename = body?.filename ?? null;
    } else {
      const { searchParams } = new URL(request.url);
      filename = searchParams.get("filename");
    }

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    // Only allow deleting files in uploads folder
    if (!filename.startsWith("uploads/")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 403 });
    }

    await del(filename);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Delete Error]', error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete upload. Please try again." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";

export async function GET() {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    envCheck: {
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN ? "set" : "missing",
      tokenPrefix: process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 10) + "...",
    },
  };

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({
      ...checks,
      status: "error",
      error: "BLOB_READ_WRITE_TOKEN not configured",
    }, { status: 503 });
  }

  // Try to upload a small test file
  try {
    const testData = Buffer.from("test-" + Date.now());
    const testFilename = `test/storage-check-${Date.now()}.txt`;

    console.log("[StorageCheck] Testing upload...");
    const blob = await put(testFilename, testData, {
      access: "public",
      contentType: "text/plain",
    });

    checks.uploadTest = {
      success: true,
      url: blob.url,
      filename: testFilename,
    };

    // Clean up test file
    try {
      await del(blob.url);
      checks.deleteTest = { success: true };
    } catch (delError: any) {
      checks.deleteTest = { success: false, error: delError.message };
    }

    return NextResponse.json({
      ...checks,
      status: "ok",
    });
  } catch (error: any) {
    console.error("[StorageCheck] Upload failed:", {
      message: error.message,
      name: error.name,
      code: error.code,
      cause: error.cause,
    });

    return NextResponse.json({
      ...checks,
      status: "error",
      uploadTest: {
        success: false,
        error: error.message,
        name: error.name,
        code: error.code,
      },
    }, { status: 500 });
  }
}

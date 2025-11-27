import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/stack";
import { getUserAnalysisHistory } from "@/lib/database";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { formatApiError } from "@/lib/error-handler";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        rateLimitResponse(rateLimitResult.remaining, rateLimitResult.reset),
        { status: 429 }
      );
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");

    // Validate limit is reasonable
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 100" },
        { status: 400 }
      );
    }

    const history = await getUserAnalysisHistory(user.id, limit);

    return NextResponse.json({ history });
  } catch (error: any) {
    return NextResponse.json(
      formatApiError(error, "Failed to fetch history. Please try again."),
      { status: 500 }
    );
  }
}

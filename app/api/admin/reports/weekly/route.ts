import { NextResponse } from "next/server";
import { sendWeeklyReport } from "@/lib/reports/automated-reports";

export async function GET() {
  try {
    const result = await sendWeeklyReport();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Weekly report error:", error);
    return NextResponse.json(
      { error: "Failed to generate weekly report" },
      { status: 500 }
    );
  }
}

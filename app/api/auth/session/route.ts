import { NextResponse } from "next/server";
import { stackServerApp } from "@/app/stack";

export async function GET() {
  const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user });
}

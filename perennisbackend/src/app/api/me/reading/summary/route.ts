// src/app/api/me/reading/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getReadingSummary } from "@/lib/reading/readingAnalytics";

export async function GET(req: NextRequest) {
  const auth = await verifyToken(req);
  if (!auth) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const summary = await getReadingSummary(auth.user.id);

  return NextResponse.json(summary);
}

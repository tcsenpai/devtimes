import { NextResponse } from "next/server";
import { lastRefreshTimestamp } from "@/lib/scheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { lastRefresh: lastRefreshTimestamp() },
    { headers: { "Cache-Control": "no-store" } }
  );
}

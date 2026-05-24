import { NextResponse } from "next/server";
import { getTopSources } from "@/lib/dailydev/cache";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 30), 100);
  try {
    const sources = await getTopSources(limit);
    return NextResponse.json({ data: sources });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

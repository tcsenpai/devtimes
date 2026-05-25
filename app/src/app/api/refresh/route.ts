import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { lastRefreshTimestamp, recordRefresh } from "@/lib/scheduler";
import { getPopular, getBySource } from "@/lib/dailydev/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.REFRESH_SECRET;
  if (!secret) return true; // unsecured if not configured (hackathon-friendly)
  const url = new URL(req.url);
  const provided =
    url.searchParams.get("key") ||
    req.headers.get("x-refresh-key") ||
    "";
  return provided === secret;
}

async function doRefresh() {
  revalidateTag("feed");
  await Promise.allSettled([
    getPopular({ limit: 50 }, { revalidate: 1 }),
    getPopular({ limit: 50, page: 1 }, { revalidate: 1 }),
    getBySource("community", { limit: 50 }, { revalidate: 1 }),
  ]);
  recordRefresh();
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await doRefresh();
  return NextResponse.json({
    ok: true,
    refreshedAt: new Date().toISOString(),
    lastRefresh: lastRefreshTimestamp() ? new Date(lastRefreshTimestamp()!).toISOString() : null,
  });
}

export async function POST(req: Request) {
  return GET(req);
}

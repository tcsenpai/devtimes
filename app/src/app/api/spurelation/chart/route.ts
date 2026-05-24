import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const src = url.searchParams.get("u");
  if (!src || !/^https:\/\/(www\.)?tylervigen\.com\//.test(src)) {
    return NextResponse.json({ error: "bad src" }, { status: 400 });
  }
  try {
    const res = await fetch(src, {
      headers: { "User-Agent": "TheDevTimes/1.0 (+https://devtimes.com)" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });
    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "image/svg+xml",
        "Cache-Control": "public, max-age=600",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

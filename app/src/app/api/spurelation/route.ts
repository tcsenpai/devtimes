import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Spurelation = {
  title: string;
  varA: string;
  varB: string;
  r: number | null;
  url: string;
  chartUrl: string | null;
};

async function fetchOne(): Promise<Spurelation | null> {
  const res = await fetch("https://www.tylervigen.com/spurious/random", {
    headers: { "User-Agent": "TheDevTimes/1.0 (+https://devtimes.com)" },
    redirect: "follow",
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;
  const html = await res.text();
  const finalUrl = res.url;

  // <title>X correlates with Y (r=0.957)</title>
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch) return null;
  const rawTitle = titleMatch[1].trim();

  let varA = "";
  let varB = "";
  let r: number | null = null;
  const parsed = rawTitle.match(/^(.+?)\s+correlates with\s+(.+?)\s*\(r=([\d.\-]+)\)\s*$/i);
  if (parsed) {
    varA = parsed[1].trim();
    varB = parsed[2].trim();
    r = Number(parsed[3]);
  } else {
    const looser = rawTitle.match(/^(.+?)\s+correlates with\s+(.+)$/i);
    if (looser) {
      varA = looser[1].trim();
      varB = looser[2].trim();
    }
  }

  if (!varA || !varB) return null;

  // chart SVG (mobile variant — smaller, fits our box)
  let chartUrl: string | null = null;
  const chartMatch = html.match(
    /src="([^"]*_mobile\.svg)"\s+id="mobile_svg_chart"/
  );
  if (chartMatch) {
    const rel = chartMatch[1];
    try {
      chartUrl = new URL(rel, finalUrl).toString();
    } catch {
      chartUrl = null;
    }
  } else {
    const largeMatch = html.match(/src="([^"]*\.svg)"\s+id="large_svg_chart"/);
    if (largeMatch) {
      try {
        chartUrl = new URL(largeMatch[1], finalUrl).toString();
      } catch {
        chartUrl = null;
      }
    }
  }

  return { title: rawTitle, varA, varB, r, url: finalUrl, chartUrl };
}

export async function GET() {
  try {
    // try twice in case of weird responses
    let s = await fetchOne();
    if (!s) s = await fetchOne();
    if (!s) return NextResponse.json({ error: "no data" }, { status: 502 });
    return NextResponse.json(s, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

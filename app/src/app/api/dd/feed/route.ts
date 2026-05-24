import { NextRequest, NextResponse } from "next/server";
import { getPopular, getForYou, getDiscussed, getByTag } from "@/lib/dailydev/client";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const kind = sp.get("kind") ?? "popular";
  const tag = sp.get("tag") ?? undefined;
  const limit = Number(sp.get("limit") ?? 20);
  const page = sp.get("page") ? Number(sp.get("page")) : undefined;
  const cursor = sp.get("cursor") ?? undefined;

  try {
    let feed;
    if (tag) feed = await getByTag(tag, { limit, page, cursor });
    else if (kind === "foryou") feed = await getForYou({ limit, page, cursor });
    else if (kind === "discussed") feed = await getDiscussed({ limit, page, cursor });
    else feed = await getPopular({ limit, page, cursor });
    return NextResponse.json(feed);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

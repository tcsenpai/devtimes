import { NextResponse } from "next/server";
import { insertLetter, listLetters } from "@/lib/letters/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// rudimentary in-memory rate limit per process: 5 per IP per hour
const recent: Map<string, number[]> = new Map();
const WINDOW = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function ipFromHeaders(h: Headers): string {
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    (h.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    "unknown"
  );
}

function allow(ip: string): boolean {
  const now = Date.now();
  const arr = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW);
  if (arr.length >= MAX_PER_WINDOW) return false;
  arr.push(now);
  recent.set(ip, arr);
  return true;
}

export async function GET() {
  try {
    return NextResponse.json({ data: await listLetters(20) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "unknown" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = ipFromHeaders(req.headers);
  if (!allow(ip)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }
  let payload: { penName?: unknown; body?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const penName = typeof payload.penName === "string" ? payload.penName : "";
  const body = typeof payload.body === "string" ? payload.body : "";
  const r = await insertLetter(penName, body);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ letter: r.letter });
}

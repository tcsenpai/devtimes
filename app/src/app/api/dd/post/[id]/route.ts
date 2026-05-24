import { NextResponse } from "next/server";
import { getPost } from "@/lib/dailydev/client";

export const runtime = "nodejs";
export const revalidate = 600;

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const post = await getPost(params.id);
    return NextResponse.json(post);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

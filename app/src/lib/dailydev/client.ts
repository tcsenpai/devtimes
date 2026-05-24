import { FeedSchema, PostEnvelopeSchema, type Feed, type Post } from "./types";

const API_BASE = "https://api.daily.dev/public/v1";

function getPat(): string {
  const pat = process.env.DAILY_DEV_PAT;
  if (!pat) throw new Error("DAILY_DEV_PAT env var missing");
  return pat;
}

type FetchOpts = {
  revalidate?: number;
  signal?: AbortSignal;
};

async function ddFetch<T>(
  path: string,
  schema: { parse: (x: unknown) => T },
  opts: FetchOpts = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getPat()}`,
      Accept: "application/json",
      "User-Agent": "TheDevTimes/1.0 (+https://devtimes.com)",
    },
    next: { revalidate: opts.revalidate ?? 300 },
    signal: opts.signal,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`daily.dev ${path} failed: ${res.status} ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  return schema.parse(json);
}

function qs(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (entries.length === 0) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of entries) sp.set(k, String(v));
  return `?${sp.toString()}`;
}

export type FeedQuery = {
  limit?: number;
  page?: number;
  cursor?: string;
};

function feedQs(q: FeedQuery) {
  return qs({ limit: q.limit ?? 20, page: q.page, cursor: q.cursor });
}

export async function getPopular(q: FeedQuery = {}, opts?: FetchOpts): Promise<Feed> {
  return ddFetch(`/feeds/popular${feedQs(q)}`, FeedSchema, opts);
}

export async function getForYou(q: FeedQuery = {}, opts?: FetchOpts): Promise<Feed> {
  return ddFetch(`/feeds/foryou${feedQs(q)}`, FeedSchema, opts);
}

export async function getDiscussed(q: FeedQuery = {}, opts?: FetchOpts): Promise<Feed> {
  return ddFetch(`/feeds/discussed${feedQs(q)}`, FeedSchema, opts);
}

export async function getByTag(
  tag: string,
  q: FeedQuery = {},
  opts?: FetchOpts
): Promise<Feed> {
  return ddFetch(`/feeds/tag/${encodeURIComponent(tag)}${feedQs(q)}`, FeedSchema, opts);
}

export async function getBySource(
  source: string,
  q: FeedQuery = {},
  opts?: FetchOpts
): Promise<Feed> {
  return ddFetch(
    `/feeds/source/${encodeURIComponent(source)}${feedQs(q)}`,
    FeedSchema,
    opts
  );
}

export async function getPost(id: string, opts?: FetchOpts): Promise<Post> {
  const env = await ddFetch(
    `/posts/${encodeURIComponent(id)}`,
    PostEnvelopeSchema,
    opts
  );
  return env.data;
}

export async function searchPosts(
  query: string,
  q: FeedQuery = {},
  opts?: FetchOpts
): Promise<Feed> {
  return ddFetch(
    `/search/posts${qs({ query, limit: q.limit ?? 20, page: q.page, cursor: q.cursor })}`,
    FeedSchema,
    opts
  );
}

import { getPopular } from "./client";
import type { Source } from "./types";

type CacheEntry<T> = { value: T; expires: number };

const memCache = new Map<string, CacheEntry<unknown>>();

export async function cached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<T> {
  const hit = memCache.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = await loader();
  memCache.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

export type TopSource = Source & { count: number };

const HOUR = 60 * 60 * 1000;

export function getTopSources(limit = 30): Promise<TopSource[]> {
  return cached(`top-sources:${limit}`, HOUR, async () => {
    const tally = new Map<string, TopSource>();
    // sample several pages of popular to widen source spread
    const pages = await Promise.all([
      getPopular({ limit: 50 }).catch(() => ({ data: [] })),
      getPopular({ limit: 50, page: 1 }).catch(() => ({ data: [] })),
      getPopular({ limit: 50, page: 2 }).catch(() => ({ data: [] })),
    ]);
    for (const page of pages) {
      for (const p of page.data) {
        if (!p.source) continue;
        const existing = tally.get(p.source.id);
        if (existing) existing.count++;
        else tally.set(p.source.id, { ...p.source, count: 1 });
      }
    }
    return Array.from(tally.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  });
}

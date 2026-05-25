/**
 * Process-resident scheduler that refreshes daily.dev-backed ISR pages
 * 3x/day (every 8h). Starts on first import (i.e. first request that
 * triggers the import graph).
 *
 * Idempotent: a global symbol guards against multiple intervals being
 * spawned in dev / HMR / multiple route imports.
 */

import { revalidateTag } from "next/cache";
import { getPopular, getBySource } from "./dailydev/client";

const STARTED_KEY = Symbol.for("devtimes.scheduler.started");
const REFRESH_KEY = Symbol.for("devtimes.scheduler.lastRefresh");

type GlobalWithFlags = typeof globalThis & {
  [STARTED_KEY]?: boolean;
  [REFRESH_KEY]?: number;
};

const REFRESH_INTERVAL_MS = 8 * 60 * 60 * 1000; // 8h → 3x/day

async function warmCaches() {
  try {
    // Pre-warm the two most common feeds users land on
    await Promise.allSettled([
      getPopular({ limit: 50 }, { revalidate: 1 }),
      getPopular({ limit: 50, page: 1 }, { revalidate: 1 }),
      getPopular({ limit: 50, page: 2 }, { revalidate: 1 }),
      getBySource("community", { limit: 50 }, { revalidate: 1 }),
      getBySource("community", { limit: 50, page: 1 }, { revalidate: 1 }),
    ]);
  } catch (e) {
    console.error("[scheduler] warm fail", e);
  }
}

async function refresh() {
  try {
    revalidateTag("feed");
    await warmCaches();
    (globalThis as GlobalWithFlags)[REFRESH_KEY] = Date.now();
    console.log(`[scheduler] refreshed @ ${new Date().toISOString()}`);
  } catch (e) {
    console.error("[scheduler] refresh fail", e);
  }
}

/**
 * Start the refresher. No-op on subsequent calls in the same process.
 * Called lazily from layout so it only runs server-side, in nodejs.
 */
export function ensureScheduler(): void {
  if (typeof window !== "undefined") return; // server only
  const g = globalThis as GlobalWithFlags;
  if (g[STARTED_KEY]) return;
  g[STARTED_KEY] = true;

  // first refresh shortly after boot (don't block the request that started us)
  setTimeout(() => {
    void refresh();
  }, 5_000);

  // recurring refresh
  const id = setInterval(() => {
    void refresh();
  }, REFRESH_INTERVAL_MS);
  // do not keep node alive only for this
  if (typeof id === "object" && id && "unref" in id) {
    (id as { unref?: () => void }).unref?.();
  }

  console.log(`[scheduler] started; refresh every ${REFRESH_INTERVAL_MS / 3_600_000}h`);
}

export function lastRefreshTimestamp(): number | null {
  return (globalThis as GlobalWithFlags)[REFRESH_KEY] ?? null;
}

export function recordRefresh(ts: number = Date.now()): void {
  (globalThis as GlobalWithFlags)[REFRESH_KEY] = ts;
}

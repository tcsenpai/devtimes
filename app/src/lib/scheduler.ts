/**
 * Process-resident scheduler that refreshes daily.dev-backed ISR pages
 * 3x/day (every 8h). Starts on first import (i.e. first request that
 * triggers the import graph).
 *
 * Idempotent: a global symbol guards against multiple intervals being
 * spawned in dev / HMR / multiple route imports.
 */

const STARTED_KEY = Symbol.for("devtimes.scheduler.started");
const REFRESH_KEY = Symbol.for("devtimes.scheduler.lastRefresh");

type GlobalWithFlags = typeof globalThis & {
  [STARTED_KEY]?: boolean;
  [REFRESH_KEY]?: number;
};

const REFRESH_INTERVAL_MS = 8 * 60 * 60 * 1000; // 8h → 3x/day

function refreshUrl(): string {
  // ALWAYS loopback for self-refresh — avoids the public URL / proxy / TLS round-trip
  const port = process.env.PORT || process.env.HOST_PORT || "3939";
  const host = process.env.HOSTNAME || process.env.HOST_BIND || "127.0.0.1";
  // HOSTNAME may be 0.0.0.0 in Docker; coerce to loopback
  const bindHost = host === "0.0.0.0" || host === "::" ? "127.0.0.1" : host;
  const key = process.env.REFRESH_SECRET;
  const qs = key ? `?key=${encodeURIComponent(key)}` : "";
  return `http://${bindHost}:${port}/api/refresh${qs}`;
}

async function refresh() {
  // revalidateTag must be called inside a request-scoped context, so we
  // self-fetch /api/refresh instead of importing it directly.
  try {
    const res = await fetch(refreshUrl(), {
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      console.error(`[scheduler] refresh HTTP ${res.status}`);
      return;
    }
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

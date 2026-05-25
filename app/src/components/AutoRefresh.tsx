"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const POLL_MS = 5 * 60 * 1000; // every 5 minutes

export function AutoRefresh() {
  const router = useRouter();
  const seen = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      if (cancelled) return;
      try {
        const res = await fetch("/api/refresh/status", { cache: "no-store" });
        if (!res.ok) return;
        const j = await res.json();
        const ts: number | null = typeof j.lastRefresh === "number" ? j.lastRefresh : null;
        if (ts == null) return;
        if (seen.current == null) {
          seen.current = ts;
          return;
        }
        if (ts > seen.current) {
          seen.current = ts;
          router.refresh();
        }
      } catch {
        /* network blips ignored */
      }
    }

    poll();
    const id = window.setInterval(poll, POLL_MS);
    // also re-poll on tab focus, so reopened tabs catch up quickly
    const onFocus = () => {
      poll();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [router]);

  return null;
}

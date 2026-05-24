"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Wraps page content. After mount, measures overflow and progressively hides
 * elements marked with [data-flex] (in DOM order, last-first) until content fits.
 *
 * Hide order (best-effort masonry):
 *  1. [data-flex="excerpt"] (paragraphs / summaries)
 *  2. [data-flex="image"] (figures / imgs)
 *  3. [data-flex="card"] (whole articles, from bottom up)
 *
 * Each pass tries 5 iterations max to avoid layout loops.
 */
export function AutoFitPage({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const raf1Ref = useRef<number | null>(null);
  const raf2Ref = useRef<number | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;

    function fit() {
      if (cancelled || !el) return;
      const overflow = () => el.scrollHeight - el.clientHeight;
      if (overflow() <= 4) return;

      const passes: string[] = ["excerpt", "image", "card"];
      for (const pass of passes) {
        const targets = Array.from(
          el.querySelectorAll<HTMLElement>(`[data-flex="${pass}"]:not([data-hidden])`)
        ).reverse();
        for (const t of targets) {
          if (overflow() <= 4) return;
          t.dataset.hidden = "1";
          t.style.display = "none";
        }
        if (overflow() <= 4) return;
      }
    }

    // run after layout settle
    raf1Ref.current = requestAnimationFrame(() => {
      raf2Ref.current = requestAnimationFrame(fit);
    });
    return () => {
      cancelled = true;
      if (raf1Ref.current != null) cancelAnimationFrame(raf1Ref.current);
      if (raf2Ref.current != null) cancelAnimationFrame(raf2Ref.current);
      raf1Ref.current = null;
      raf2Ref.current = null;
      // reset hidden so re-fit re-evaluates
      el.querySelectorAll<HTMLElement>("[data-hidden]").forEach((t) => {
        delete t.dataset.hidden;
        t.style.display = "";
      });
    };
  }, [tick]);

  useEffect(() => {
    function onResize() {
      setTick((n) => n + 1);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

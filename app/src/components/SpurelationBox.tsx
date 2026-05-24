"use client";

import { useEffect, useState } from "react";

type Spurelation = {
  title: string;
  varA: string;
  varB: string;
  r: number | null;
  url: string;
  chartUrl: string | null;
};

export function SpurelationBox() {
  const [s, setS] = useState<Spurelation | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/spurelation")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data && data.varA) setS(data);
        else setErr(true);
      })
      .catch(() => {
        if (!cancelled) setErr(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) return null;
  if (!s) {
    return (
      <aside className="mt-4 border-2 border-double border-rule p-2">
        <div className="kicker">— Statistician&apos;s Corner —</div>
        <p className="mt-1 text-[0.78rem] italic text-ink-soft">
          The desk is consulting Mr. Vigen&apos;s index…
        </p>
      </aside>
    );
  }

  const rText =
    s.r != null ? `r = ${s.r.toFixed(3)}` : "correlation confirmed by sheer vibes";

  return (
    <aside className="mt-4 break-inside-avoid border-2 border-double border-rule p-2 bg-paper-shade/30">
      <div className="kicker">— Statistician&apos;s Corner —</div>
      <h3 className="font-display text-[0.95rem] font-black leading-tight mt-1">
        Today&apos;s spurious correlation
      </h3>
      <p className="mt-1 text-[0.82rem] leading-snug">
        <span className="italic">{s.varA}</span>
        <span className="font-bold"> correlates with </span>
        <span className="italic">{s.varB}</span>.
      </p>
      {s.chartUrl && (
        <div className="mt-1.5 border border-rule/40 bg-paper p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/spurelation/chart?u=${encodeURIComponent(s.chartUrl)}`}
            alt="correlation chart"
            className="w-full"
            style={{ filter: "grayscale(1) contrast(1.05)", maxHeight: 120 }}
          />
        </div>
      )}
      <p className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft">
        {rText} ·{" "}
        <a
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          data-spurelation-source
        >
          source: tylervigen.com
        </a>
      </p>
      <p className="mt-1 text-[0.7rem] italic text-ink-soft">
        Correlation does not, of course, imply you should ship anything.
      </p>
    </aside>
  );
}

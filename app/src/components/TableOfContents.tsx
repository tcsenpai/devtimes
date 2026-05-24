"use client";

import { useEffect, useState } from "react";

export type TocEntry = {
  index: number; // 0-based page index
  label: string;
  kind?: "front" | "section" | "bonus" | "back";
};

type Props = {
  entries: TocEntry[];
  currentPage: number;
  onJump: (index: number) => void;
};

export function TableOfContents({ entries, currentPage, onJump }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [wiggle, setWiggle] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1400) {
      setCollapsed(true);
    }
  }, []);

  function triggerWiggle() {
    setWiggle(false);
    requestAnimationFrame(() => setWiggle(true));
    window.setTimeout(() => setWiggle(false), 380);
  }

  return (
    <aside
      className={`hidden lg:block fixed right-3 top-1/2 z-40 -translate-y-1/2 ${wiggle ? "toc-wiggle" : ""}`}
      style={{ width: collapsed ? 36 : 220 }}
    >
      {/* blur halo around tablet */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -m-3 rounded-[2rem]"
        style={{
          backdropFilter: "blur(8px) saturate(140%)",
          WebkitBackdropFilter: "blur(8px) saturate(140%)",
          background:
            "radial-gradient(ellipse at center, rgba(244,236,216,0.45) 0%, rgba(244,236,216,0.15) 60%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse at center, #000 30%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, #000 30%, transparent 90%)",
        }}
      />

      {/* tablet body */}
      <div
        className="relative flex flex-col rounded-[22px] bg-paper/95 backdrop-blur-sm"
        style={{
          border: "1.5px solid #cc785c",
          padding: collapsed ? "8px 4px" : "12px 10px",
          maxHeight: "78vh",
          boxShadow:
            "0 10px 22px rgba(0,0,0,0.14), 0 3px 6px rgba(0,0,0,0.10), 0 1px 0 rgba(255,245,220,0.4) inset",
        }}
      >
        {/* speaker grille (top) */}
        <div
          className="mx-auto mb-2 h-1 w-8 rounded-full"
          style={{ background: "rgba(40,30,10,0.25)" }}
        />

        {collapsed ? (
          <button
            onClick={() => {
              setCollapsed(false);
              triggerWiggle();
            }}
            aria-label="Show table of contents"
            title="Show contents"
            className="mx-auto text-sm text-ink hover:opacity-70"
          >
            ☰
          </button>
        ) : (
          <>
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="kicker">Index</span>
              <button
                onClick={() => {
                  setCollapsed(true);
                  triggerWiggle();
                }}
                aria-label="Hide table of contents"
                title="Hide"
                className="text-xs text-ink-soft hover:text-ink"
              >
                ⤢
              </button>
            </div>
            <div className="section-rule mb-2" />
            <nav className="min-h-0 flex-1 overflow-y-auto pr-1 text-[0.82rem]">
              <ul className="space-y-0.5">
                {entries.map((e) => {
                  const active = e.index === currentPage;
                  return (
                    <li key={e.index}>
                      <button
                        onClick={() => {
                          triggerWiggle();
                          onJump(e.index);
                        }}
                        className={`flex w-full items-baseline justify-between gap-2 rounded px-2 py-1 text-left ${
                          active
                            ? "bg-ink text-paper"
                            : "text-ink hover:bg-paper-shade"
                        }`}
                      >
                        <span className="truncate">
                          {e.label}
                        </span>
                        <span
                          className={`shrink-0 font-mono text-[10px] uppercase tracking-wider ${
                            active ? "text-paper/80" : "text-ink-soft"
                          }`}
                        >
                          {String(e.index + 1).padStart(2, "0")}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="mt-2 border-t border-rule/40 pt-1 text-center text-[10px] uppercase tracking-[0.18em] text-ink-soft">
              tap to jump
            </div>
          </>
        )}

        {/* home button (bottom) */}
        <div
          className="mx-auto mt-2 h-3 w-3 rounded-full"
          style={{ border: "1px solid rgba(40,30,10,0.3)", background: "rgba(40,30,10,0.05)" }}
        />
      </div>
    </aside>
  );
}

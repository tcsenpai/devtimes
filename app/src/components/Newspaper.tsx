"use client";

import Link from "next/link";
import { forwardRef, useEffect, useRef, useState, type ReactNode } from "react";
import HTMLFlipBook from "react-pageflip";
import { AutoFitPage } from "@/components/AutoFitPage";
import { Desk } from "@/components/desk/Desk";
import { StainLayer } from "@/components/Stain";
import { TableOfContents, type TocEntry } from "@/components/TableOfContents";
import { playPageTurn, playTypewriterBurst } from "@/lib/sfx";

const SFX_KEY = "devtimes.sfx.v1";

type Size = { w: number; h: number; single: boolean };

function computeSize(): Size {
  if (typeof window === "undefined") return { w: 600, h: 800, single: false };
  const pad = 24;
  const vw = window.innerWidth - pad * 2;
  const vh = window.innerHeight - pad * 2 - 60; // reserve space for control bar
  const single = vw < 900;
  const ratio = 1.32;
  if (single) {
    let w = Math.min(vw, 640);
    let h = Math.round(w * ratio);
    if (h > vh) {
      h = vh;
      w = Math.round(h / ratio);
    }
    return { w, h, single: true };
  }
  let pageW = Math.floor(vw / 2);
  let pageH = Math.round(pageW * ratio);
  if (pageH > vh) {
    pageH = vh;
    pageW = Math.round(pageH / ratio);
  }
  return { w: pageW, h: pageH, single: false };
}

const Page = forwardRef<HTMLDivElement, { children: ReactNode; index: number }>(function Page(
  { children, index },
  ref
) {
  return (
    <div ref={ref} className="book-page" data-page-index={index}>
      <AutoFitPage className="page-content p-4">{children}</AutoFitPage>
      <StainLayer pageIndex={index} />
    </div>
  );
});

type FlipBookHandle = {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    flip: (n: number, corner?: "top" | "bottom") => void;
    turnToPage: (n: number) => void;
    getPageCount: () => number;
    getCurrentPageIndex: () => number;
  };
};

export function Newspaper({
  children,
  title = "The Dev Times",
  toc,
}: {
  children: ReactNode[];
  title?: string;
  toc?: TocEntry[];
}) {
  const [size, setSize] = useState<Size | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(children.length);
  const [editingDesk, setEditingDesk] = useState(false);
  const [sfxOn, setSfxOn] = useState(false);
  const sfxRef = useRef(false);
  sfxRef.current = sfxOn;
  const bookRef = useRef<FlipBookHandle | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(SFX_KEY);
      setSfxOn(v === "1");
    } catch {
      /* noop */
    }
  }, []);

  function toggleSfx() {
    setSfxOn((v) => {
      const nv = !v;
      try {
        localStorage.setItem(SFX_KEY, nv ? "1" : "0");
      } catch {
        /* noop */
      }
      if (nv) playTypewriterBurst(3, 70);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("devtimes:sfx-toggled"));
      }
      return nv;
    });
  }

  useEffect(() => {
    document.body.classList.add("fullscreen-book");
    setSize(computeSize());
    function onResize() {
      setSize(computeSize());
    }
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      document.body.classList.remove("fullscreen-book");
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        bookRef.current?.pageFlip()?.flipPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        bookRef.current?.pageFlip()?.flipNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // sync URL hash <-> current page (deep linking)
  useEffect(() => {
    function readHash(): number | null {
      const m = window.location.hash.match(/page=(\d+)/);
      if (!m) return null;
      const n = parseInt(m[1], 10) - 1;
      return Number.isFinite(n) && n >= 0 ? n : null;
    }
    function applyHash() {
      const n = readHash();
      if (n != null) {
        const flip = bookRef.current?.pageFlip();
        if (flip) flip.turnToPage(Math.min(n, flip.getPageCount() - 1));
      }
    }
    // initial deep-link — wait a tick for flipbook init
    const t = window.setTimeout(applyHash, 200);
    window.addEventListener("hashchange", applyHash);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("hashchange", applyHash);
    };
  }, []);

  // write current page back to hash (debounced via state change)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const desired = `#page=${currentPage + 1}`;
    if (window.location.hash !== desired) {
      // replaceState avoids polluting back-stack on every flip
      window.history.replaceState(null, "", desired);
    }
  }, [currentPage]);

  if (!size) {
    return (
      <div className="fixed inset-0 flex items-center justify-center newsprint">
        <p className="text-xs italic text-ink-soft">Setting type, inking plates…</p>
      </div>
    );
  }

  const bookW = size.single ? size.w : size.w * 2;
  const barW = Math.min(window.innerWidth - 24, bookW + 120);

  function jumpToPage(idx: number) {
    const flip = bookRef.current?.pageFlip();
    if (!flip) return;
    const max = flip.getPageCount() - 1;
    const target = Math.max(0, Math.min(idx, max));
    const current = flip.getCurrentPageIndex();
    if (target === current) return;
    // animated flip; falls back to turnToPage if flip() unavailable
    if (typeof flip.flip === "function") {
      flip.flip(target);
    } else {
      flip.turnToPage(target);
    }
    // hard-sync state after animation (onFlip won't fire when target is same spread)
    window.setTimeout(() => {
      const live = flip.getCurrentPageIndex();
      if (Number.isFinite(live)) setCurrentPage(live);
    }, 850);
  }

  return (
    <div className="fixed inset-0 newsprint">
      <Desk editing={editingDesk} onExitEdit={() => setEditingDesk(false)} />
      {toc && toc.length > 0 && (
        <TableOfContents entries={toc} currentPage={currentPage} onJump={jumpToPage} />
      )}
      {/* Spotlight-style control bar with blurred halo */}
      <div
        className="absolute top-3 left-1/2 z-40 -translate-x-1/2"
        style={{ width: barW }}
      >
        {/* blur halo behind the bar */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -m-4 rounded-[3rem]"
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
        <div
          className="relative rounded-full bg-paper/95 px-3 py-1.5 shadow-xl backdrop-blur-sm"
          style={{ border: "1.5px solid #cc785c" }}
        >
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
              aria-label="Previous page"
              className="rounded-full px-3 py-1 text-sm text-ink hover:bg-paper-shade disabled:opacity-30"
              disabled={currentPage === 0}
            >
              ← Prev
            </button>
            <Link
              href="/"
              aria-label="Front page"
              className="flex-1 text-center hover:opacity-80"
            >
              <div className="font-display text-sm font-black tracking-tight text-ink">
                {title}
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                Page {currentPage + 1} of {pageCount}
              </div>
            </Link>
            <button
              onClick={() => bookRef.current?.pageFlip()?.flipNext()}
              aria-label="Next page"
              className="rounded-full px-3 py-1 text-sm text-ink hover:bg-paper-shade disabled:opacity-30"
              disabled={currentPage >= pageCount - 1}
            >
              Next →
            </button>
            <button
              onClick={toggleSfx}
              aria-label={sfxOn ? "Mute typewriter" : "Enable typewriter sound"}
              title={sfxOn ? "Mute typewriter" : "Enable typewriter sound"}
              className={`hidden lg:flex h-7 w-7 items-center justify-center rounded-full text-sm hover:bg-paper-shade ${
                sfxOn ? "bg-ink text-paper hover:bg-ink-soft" : "text-ink"
              }`}
            >
              {sfxOn ? "♪" : "♫"}
            </button>
            <button
              onClick={() => window.print()}
              aria-label="Print this edition"
              title="Print this edition"
              className="hidden lg:flex h-7 w-7 items-center justify-center rounded-full text-sm text-ink hover:bg-paper-shade"
            >
              ⎙
            </button>
            <button
              onClick={() => setEditingDesk((v) => !v)}
              aria-label="Customize desk"
              title={editingDesk ? "Done editing" : "Customize desk"}
              className={`hidden lg:flex h-7 w-7 items-center justify-center rounded-full text-sm hover:bg-paper-shade ${
                editingDesk ? "bg-ink text-paper hover:bg-ink-soft" : "text-ink"
              }`}
            >
              ⚙
            </button>
          </div>
        </div>
      </div>

      <div
        className="absolute"
        style={{
          left: `calc(50% - ${bookW / 2}px)`,
          top: `calc(50% - ${size.h / 2}px + 20px)`,
          width: bookW,
          height: size.h,
        }}
      >
        {/* @ts-expect-error react-pageflip props loose */}
        <HTMLFlipBook
          ref={bookRef}
          width={size.w}
          height={size.h}
          size="fixed"
          minWidth={280}
          maxWidth={2000}
          minHeight={360}
          maxHeight={2600}
          showCover={false}
          usePortrait={size.single}
          maxShadowOpacity={0.35}
          mobileScrollSupport
          drawShadow
          flippingTime={700}
          useMouseEvents={false}
          swipeDistance={30}
          autoSize={false}
          startPage={0}
          startZIndex={0}
          showPageCorners={false}
          disableFlipByClick={true}
          className="book-shadow"
          style={{}}
          onFlip={(e: { data: number }) => {
            setCurrentPage(e.data);
            if (sfxRef.current) playPageTurn(0.22);
            if (typeof window !== "undefined") {
              const total = bookRef.current?.pageFlip()?.getPageCount?.() ?? pageCount;
              window.dispatchEvent(
                new CustomEvent("devtimes:page-visit", { detail: { page: e.data, total } })
              );
            }
          }}
          onChangeState={(e: { data: string }) => {
            // 'read' = book idle; resync in case onFlip skipped
            if (e?.data === "read") {
              const live = bookRef.current?.pageFlip()?.getCurrentPageIndex();
              if (typeof live === "number") setCurrentPage(live);
            }
          }}
          onInit={(e: { data: { page: number } }) => {
            const flip = bookRef.current?.pageFlip();
            if (flip) {
              setPageCount(flip.getPageCount());
              setCurrentPage(e.data.page);
            }
          }}
        >
          {children.map((c, i) => (
            <Page key={i} index={i}>
              {c}
            </Page>
          ))}
        </HTMLFlipBook>
      </div>
    </div>
  );
}

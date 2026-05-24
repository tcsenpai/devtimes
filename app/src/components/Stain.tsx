"use client";

import { useEffect, useState } from "react";

const STAIN_KEY = "devtimes.stains.v1";

type Stain = {
  pageIndex: number;
  x: number; // 0..1
  y: number; // 0..1
  scale: number; // 0.7..1.4
  rotation: number; // deg
};

export function loadStains(): Stain[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STAIN_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is Stain =>
        s && typeof s.pageIndex === "number" && typeof s.x === "number" && typeof s.y === "number"
    );
  } catch {
    return [];
  }
}

export function addStain(s: Stain) {
  if (typeof window === "undefined") return;
  const cur = loadStains();
  cur.push(s);
  try {
    localStorage.setItem(STAIN_KEY, JSON.stringify(cur.slice(-50)));
    window.dispatchEvent(new CustomEvent("devtimes:stain-added", { detail: s }));
  } catch {
    /* ignore */
  }
}

/**
 * Deterministic pre-seeded stain for a few pages.
 * About 1 in 4 pages gets a faint pre-seeded ring.
 */
function seededFor(pageIndex: number): Stain | null {
  // hash by index
  const h = (pageIndex * 9301 + 49297) % 233280;
  const r = h / 233280;
  if (r > 0.25) return null;
  const seed2 = (pageIndex * 2654435761) >>> 0;
  return {
    pageIndex,
    x: 0.15 + ((seed2 & 0xff) / 255) * 0.7,
    y: 0.25 + (((seed2 >> 8) & 0xff) / 255) * 0.65,
    scale: 0.7 + (((seed2 >> 16) & 0xff) / 255) * 0.5,
    rotation: ((seed2 >> 24) & 0xff) * 1.4,
  };
}

function CoffeeRingSvg({ scale, rotation }: { scale: number; rotation: number }) {
  const size = Math.round(90 * scale);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <defs>
        <radialGradient id="ringGrad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(74,44,26,0)" />
          <stop offset="55%" stopColor="rgba(74,44,26,0)" />
          <stop offset="68%" stopColor="rgba(74,44,26,0.32)" />
          <stop offset="82%" stopColor="rgba(74,44,26,0.18)" />
          <stop offset="100%" stopColor="rgba(74,44,26,0)" />
        </radialGradient>
        <radialGradient id="ringInner" cx="0.55" cy="0.45" r="0.4">
          <stop offset="0%" stopColor="rgba(74,44,26,0.08)" />
          <stop offset="100%" stopColor="rgba(74,44,26,0)" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#ringGrad)" />
      <circle cx="50" cy="50" r="40" fill="url(#ringInner)" />
      {/* subtle drip */}
      <path
        d="M 70 50 Q 75 65 72 78"
        stroke="rgba(74,44,26,0.18)"
        strokeWidth="1.3"
        fill="none"
      />
    </svg>
  );
}

/**
 * Overlay component for a single book page.
 * Renders any seeded + user-added stains for that page index.
 */
export function StainLayer({ pageIndex }: { pageIndex: number }) {
  const [userStains, setUserStains] = useState<Stain[]>([]);

  useEffect(() => {
    function refresh() {
      setUserStains(loadStains().filter((s) => s.pageIndex === pageIndex));
    }
    refresh();
    window.addEventListener("devtimes:stain-added", refresh as EventListener);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("devtimes:stain-added", refresh as EventListener);
      window.removeEventListener("storage", refresh);
    };
  }, [pageIndex]);

  const seeded = seededFor(pageIndex);
  const all = seeded ? [seeded, ...userStains] : userStains;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ mixBlendMode: "multiply", opacity: 0.85 }}
    >
      {all.map((s, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${s.x * 100}%`,
            top: `${s.y * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <CoffeeRingSvg scale={s.scale} rotation={s.rotation} />
        </div>
      ))}
    </div>
  );
}

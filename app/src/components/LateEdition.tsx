"use client";

import { useEffect, useState } from "react";

export function LateEdition() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    function check() {
      const h = new Date().getHours();
      setShow(h >= 23 || h < 5);
    }
    check();
    const id = window.setInterval(check, 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);
  if (!show) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-3 top-12 z-10"
      style={{
        transform: "rotate(8deg)",
      }}
    >
      <div
        className="font-display text-xl font-black uppercase tracking-[0.18em] px-3 py-1"
        style={{
          color: "#8a1c1c",
          border: "3px double #8a1c1c",
          opacity: 0.85,
        }}
      >
        ★ Late Edition ★
      </div>
    </div>
  );
}

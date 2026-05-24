"use client";

import { useEffect, useState } from "react";
import { SECRETS, TOTAL_SECRETS, loadFound, type SecretId } from "@/lib/secrets";

type ToastState = { id: SecretId; idx: number; total: number; total_found: number } | null;

export function SecretToast() {
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    function onFound(e: Event) {
      const ce = e as CustomEvent<SecretId>;
      const id = ce.detail;
      if (!(id in SECRETS)) return;
      const found = loadFound();
      setToast({ id, idx: SECRETS[id].number, total: TOTAL_SECRETS, total_found: found.length });
      window.setTimeout(() => setToast(null), 7000);
    }
    window.addEventListener("devtimes:secret-found", onFound as EventListener);
    return () => window.removeEventListener("devtimes:secret-found", onFound as EventListener);
  }, []);

  if (!toast) return null;
  const sec = SECRETS[toast.id];
  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-paper/95 px-4 py-3 shadow-2xl backdrop-blur-sm"
      style={{ border: "1.5px solid #cc785c", maxWidth: 420 }}
      role="status"
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="kicker">Secret #{String(sec.number).padStart(2, "0")} of {String(toast.total).padStart(2, "0")}</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">
          {toast.total_found}/{toast.total} found
        </div>
      </div>
      <div className="font-display text-base font-black tracking-tight mt-0.5">{sec.title}</div>
      <p className="mt-1 text-[0.82rem] italic leading-snug">{sec.body}</p>
    </div>
  );
}

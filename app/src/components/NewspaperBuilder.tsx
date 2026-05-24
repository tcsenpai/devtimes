"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SourceItem = {
  id: string;
  name: string;
  handle: string;
  image?: string | null;
  count?: number;
};

const PRESETS: { handle: string; label: string }[] = [
  { handle: "community", label: "Community Picks" },
  { handle: "popular", label: "Most Popular (all)" },
];

export function NewspaperBuilder({ activeHandles }: { activeHandles: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<string[]>(activeHandles);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || sources.length > 0) return;
    setLoading(true);
    fetch("/api/dd/sources?limit=40")
      .then((r) => r.json())
      .then((j) => {
        if (Array.isArray(j.data)) setSources(j.data);
      })
      .finally(() => setLoading(false));
  }, [open, sources.length]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  function toggle(handle: string) {
    setPicked((cur) =>
      cur.includes(handle) ? cur.filter((h) => h !== handle) : [...cur, handle]
    );
  }

  function compose() {
    const handles = picked.filter(Boolean);
    const qs = handles.length === 0 ? "" : `?sources=${handles.join(",")}`;
    router.push(`/${qs}`);
    setOpen(false);
  }

  function reset() {
    setPicked(["community"]);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Compose your newspaper"
        className="fixed bottom-4 right-4 z-40 border border-rule bg-paper px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-ink shadow-md hover:bg-paper-shade"
      >
        ✎ Compose Edition
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            ref={panelRef}
            className="relative max-h-[85vh] w-full max-w-2xl overflow-hidden border-2 border-double border-rule bg-paper shadow-2xl"
          >
            <header className="border-b border-rule px-5 py-3">
              <div className="kicker">The Composing Room</div>
              <h2 className="font-display text-2xl font-black">Build your Edition</h2>
              <p className="mt-1 text-xs italic text-ink-soft">
                Pick the wires you want set in type today. Mix any number of sources;
                the front page recomposes itself.
              </p>
            </header>

            <div className="max-h-[55vh] overflow-y-auto px-5 py-3">
              <div className="mb-3">
                <div className="kicker mb-2">Presets</div>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.handle}
                      onClick={() => toggle(p.handle)}
                      className={`border px-3 py-1 text-xs uppercase tracking-[0.14em] ${
                        picked.includes(p.handle)
                          ? "border-ink bg-ink text-paper"
                          : "border-rule bg-paper-shade/50 text-ink hover:bg-paper-shade"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="kicker mb-2">Top Sources (refreshed hourly)</div>
                {loading && <p className="text-sm italic text-ink-soft">Counting bylines…</p>}
                <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
                  {sources.map((s) => {
                    const on = picked.includes(s.handle);
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggle(s.handle)}
                        className={`flex items-center gap-2 border px-2 py-1.5 text-left text-sm ${
                          on
                            ? "border-ink bg-ink/5"
                            : "border-rule/40 hover:bg-paper-shade/50"
                        }`}
                      >
                        {s.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.image}
                            alt=""
                            className="h-6 w-6 flex-shrink-0 object-cover"
                            style={{ filter: "grayscale(1) contrast(1.05)" }}
                          />
                        )}
                        <span className="flex-1 truncate">{s.name}</span>
                        {s.count != null && (
                          <span className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                            {s.count}
                          </span>
                        )}
                        <span className="text-xs">{on ? "✓" : "+"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <footer className="flex items-center justify-between border-t border-rule px-5 py-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">
                {picked.length} source{picked.length === 1 ? "" : "s"} selected
              </div>
              <div className="flex gap-2">
                <button
                  onClick={reset}
                  className="border border-rule px-3 py-1 text-xs uppercase tracking-[0.14em] hover:bg-paper-shade"
                >
                  Reset
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="border border-rule px-3 py-1 text-xs uppercase tracking-[0.14em] hover:bg-paper-shade"
                >
                  Cancel
                </button>
                <button
                  onClick={compose}
                  className="border border-ink bg-ink px-3 py-1 text-xs uppercase tracking-[0.14em] text-paper hover:bg-ink-soft"
                >
                  Set the Press
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

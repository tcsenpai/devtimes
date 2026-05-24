"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ITEM_LIBRARY, ITEM_TYPES, type DeskItemType } from "./items";
import { addStain } from "@/components/Stain";
import { markFound } from "@/lib/secrets";

export type DeskItem = {
  id: string;
  type: DeskItemType;
  x: number; // px from viewport left (top-left corner of item)
  y: number; // px from viewport top
  rotation: number; // degrees
};

const STORAGE_KEY = "devtimes.desk.v1";

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function defaultDesk(): DeskItem[] {
  if (typeof window === "undefined") return [];
  const W = window.innerWidth;
  const H = window.innerHeight;
  return [
    { id: uid(), type: "mug",       x: 28,         y: H - 124, rotation: -6 },
    { id: uid(), type: "notebook",  x: W - 216,    y: H - 158, rotation: 4 },
    { id: uid(), type: "pen",       x: W - 260,    y: H - 48,  rotation: -8 },
    { id: uid(), type: "glasses",   x: W - 154,    y: 80,      rotation: 12 },
    { id: uid(), type: "stamp",     x: 32,         y: 72,      rotation: -14 },
    { id: uid(), type: "paperclip", x: 60,         y: Math.round(H * 0.45), rotation: 22 },
  ];
}

function loadDesk(): DeskItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(
      (it): it is DeskItem =>
        it &&
        typeof it.id === "string" &&
        typeof it.x === "number" &&
        typeof it.y === "number" &&
        typeof it.rotation === "number" &&
        ITEM_TYPES.includes(it.type)
    );
  } catch {
    return null;
  }
}

function saveDesk(items: DeskItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

type Drag = {
  id: string;
  startPointerX: number;
  startPointerY: number;
  startItemX: number;
  startItemY: number;
};

export function Desk({
  editing,
  onExitEdit,
}: {
  editing: boolean;
  onExitEdit?: () => void;
}) {
  const [items, setItems] = useState<DeskItem[]>([]);
  const [drag, setDrag] = useState<Drag | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const dragRef = useRef<Drag | null>(null);
  dragRef.current = drag;

  useEffect(() => {
    const loaded = loadDesk();
    setItems(loaded && loaded.length > 0 ? loaded : defaultDesk());
  }, []);

  useEffect(() => {
    if (items.length > 0) saveDesk(items);
  }, [items]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      if (!editing) return;
      e.preventDefault();
      e.stopPropagation();
      const it = itemsRef.current.find((x) => x.id === id);
      if (!it) return;
      setDrag({
        id,
        startPointerX: e.clientX,
        startPointerY: e.clientY,
        startItemX: it.x,
        startItemY: it.y,
      });
    },
    [editing]
  );

  // global pointer listeners — ensures drag survives if pointer leaves item
  useEffect(() => {
    if (!editing) return;
    function clampX(x: number, w: number) {
      const max = window.innerWidth - 20;
      const min = -(w - 20);
      return Math.max(min, Math.min(max, x));
    }
    function clampY(y: number, h: number) {
      const max = window.innerHeight - 20;
      const min = -(h - 20);
      return Math.max(min, Math.min(max, y));
    }
    function move(e: PointerEvent) {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startPointerX;
      const dy = e.clientY - d.startPointerY;
      setItems((cur) =>
        cur.map((it) => {
          if (it.id !== d.id) return it;
          const spec = ITEM_LIBRARY[it.type];
          return {
            ...it,
            x: clampX(d.startItemX + dx, spec.width),
            y: clampY(d.startItemY + dy, spec.height),
          };
        })
      );
    }
    function rectsOverlap(a: DOMRect, b: DOMRect): boolean {
      return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
    }

    function up(e: PointerEvent) {
      const d = dragRef.current;
      if (!d) return;
      const item = itemsRef.current.find((x) => x.id === d.id);

      // ---- SECRETS: drag-end based ----
      if (item) {
        const moved = Math.hypot(e.clientX - d.startPointerX, e.clientY - d.startPointerY);

        // moved-mug
        if (item.type === "mug" && moved > 30) {
          markFound("moved-mug");
        }

        // perfectly-vertical-mug
        if (item.type === "mug") {
          const norm = ((item.rotation % 360) + 360) % 360;
          const deltaFromUpright = Math.min(norm, 360 - norm);
          if (deltaFromUpright <= 1) markFound("perfectly-vertical-mug");
        }

        // cassette-spin (rotation > 360 cumulative)
        if (item.type === "cassette" && Math.abs(item.rotation) >= 360) {
          markFound("cassette-spin");
        }

        // overlap-based: pen-on-notebook, glasses-on-notebook, cd-on-clip
        const droppedEl = document.querySelector<HTMLElement>(`[data-desk-id="${item.id}"]`);
        if (droppedEl) {
          const dr = droppedEl.getBoundingClientRect();
          const others = document.querySelectorAll<HTMLElement>("[data-desk-id]");
          others.forEach((other) => {
            if (other === droppedEl) return;
            const otherId = other.dataset.deskId;
            const otherItem = itemsRef.current.find((x) => x.id === otherId);
            if (!otherItem) return;
            const or = other.getBoundingClientRect();
            if (!rectsOverlap(dr, or)) return;

            const pair = new Set([item.type, otherItem.type]);
            if (pair.has("pen") && pair.has("notebook")) markFound("pen-on-notebook");
            if (pair.has("glasses") && pair.has("notebook")) markFound("glasses-on-notebook");
            if (pair.has("cd") && pair.has("paperclip")) markFound("cd-on-clip");
          });
        }
      }

      if (item && item.type === "mug") {
        // temporarily hide ALL desk items from hit-testing so we can see the book page beneath
        const itemEls = document.querySelectorAll<HTMLElement>("[data-desk-item]");
        const prev: string[] = [];
        itemEls.forEach((el, i) => {
          prev[i] = el.style.pointerEvents;
          el.style.pointerEvents = "none";
        });
        const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
        itemEls.forEach((el, i) => {
          el.style.pointerEvents = prev[i];
        });
        const pageEl = target?.closest<HTMLElement>(".book-page[data-page-index]");
        if (pageEl) {
          const rect = pageEl.getBoundingClientRect();
          const localX = (e.clientX - rect.left) / rect.width;
          const localY = (e.clientY - rect.top) / rect.height;
          const pageIndex = Number(pageEl.dataset.pageIndex);
          if (
            Number.isFinite(pageIndex) &&
            localX > 0.05 && localX < 0.95 &&
            localY > 0.05 && localY < 0.95
          ) {
            addStain({
              pageIndex,
              x: localX,
              y: localY,
              scale: 0.9 + Math.random() * 0.3,
              rotation: Math.random() * 360,
            });
          }
        }
      }
      setDrag(null);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [editing]);

  // wheel-to-rotate via native non-passive listener (React's onWheel is passive)
  const wheelTargets = useRef<Map<string, HTMLElement>>(new Map());
  useEffect(() => {
    if (!editing) return;
    const handlers: Array<{ el: HTMLElement; fn: (e: WheelEvent) => void }> = [];
    wheelTargets.current.forEach((el, id) => {
      const fn = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY > 0 ? 5 : -5;
        setItems((cur) =>
          cur.map((it) => (it.id === id ? { ...it, rotation: it.rotation + delta } : it))
        );
      };
      el.addEventListener("wheel", fn, { passive: false });
      handlers.push({ el, fn });
    });
    return () => {
      for (const { el, fn } of handlers) el.removeEventListener("wheel", fn);
    };
  }, [editing, items.length]);
  const registerWheel = useCallback((id: string, el: HTMLElement | null) => {
    if (el) wheelTargets.current.set(id, el);
    else wheelTargets.current.delete(id);
  }, []);

  function remove(id: string) {
    setItems((cur) => cur.filter((it) => it.id !== id));
  }
  function add(type: DeskItemType) {
    if (typeof window === "undefined") return;
    const spec = ITEM_LIBRARY[type];
    // spawn in outer margin (left or right of book), randomized
    const W = window.innerWidth;
    const H = window.innerHeight;
    // estimate book area (matches Newspaper.tsx layout)
    const bookH = Math.min(H - 48 - 60, Math.round((W / 2) * 1.32));
    const bookW = Math.round(bookH / 1.32) * 2;
    const bookLeft = (W - bookW) / 2;
    const bookRight = bookLeft + bookW;
    const marginLeft = bookLeft - 24; // available px on left
    const marginRight = W - bookRight - 24;
    const useLeft = marginLeft > spec.width + 40 && (marginRight < spec.width + 40 || Math.random() < 0.5);
    let x: number;
    if (useLeft) {
      x = Math.max(12, Math.round(marginLeft - spec.width) / 2 + Math.round((Math.random() - 0.5) * 40));
    } else if (marginRight > spec.width + 40) {
      x = bookRight + Math.round((marginRight - spec.width) / 2 + (Math.random() - 0.5) * 40);
    } else {
      // fallback: top strip above the book
      x = Math.round((W - spec.width) / 2 + (Math.random() - 0.5) * 200);
    }
    const y = Math.round(60 + Math.random() * (H - spec.height - 120));
    setItems((cur) => [
      ...cur,
      {
        id: uid(),
        type,
        x,
        y,
        rotation: Math.round((Math.random() - 0.5) * 30),
      },
    ]);
  }
  function reset() {
    setItems(defaultDesk());
  }
  function clearAll() {
    setItems([]);
  }

  return (
    <>
      {/* Decor layer — above book so items sit on top of the paper */}
      <div
        aria-hidden={!editing}
        className={`pointer-events-none fixed inset-0 z-30 hidden lg:block ${editing ? "" : "select-none"}`}
        style={{ opacity: 0.92 }}
      >
        {items.map((it) => {
          const spec = ITEM_LIBRARY[it.type];
          return (
            <div
              key={it.id}
              ref={(el) => registerWheel(it.id, el)}
              data-desk-item={it.type}
              data-desk-id={it.id}
              className={`absolute ${editing ? "pointer-events-auto cursor-grab active:cursor-grabbing" : ""}`}
              style={{
                left: it.x,
                top: it.y,
                width: spec.width,
                height: spec.height,
                transform: `rotate(${it.rotation}deg)`,
                touchAction: editing ? "none" : undefined,
                outline:
                  editing && drag?.id === it.id
                    ? "2px dashed #cc785c"
                    : editing
                    ? "1px dashed rgba(204,120,92,0.4)"
                    : undefined,
                outlineOffset: 4,
              }}
              onPointerDown={(e) => onPointerDown(e, it.id)}
            >
              {spec.render()}
              {editing && (
                <button
                  className="absolute -top-2 -right-2 z-50 h-5 w-5 rounded-full bg-paper text-[10px] leading-none text-ink shadow"
                  style={{ border: "1.5px solid #cc785c" }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(it.id);
                  }}
                  aria-label="Remove item"
                  title="Remove"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit-mode HUD */}
      {editing && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-paper/95 px-3 py-2 shadow-xl backdrop-blur-sm"
          style={{ border: "1.5px solid #cc785c" }}>
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em]">
            <span className="px-1 italic">Workshop ·</span>
            <span className="px-1 normal-case italic text-ink-soft">drag · scroll to rotate</span>
            <div className="mx-1 h-4 w-px bg-rule/40" />
            {ITEM_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => add(t)}
                className="rounded-full border border-rule/40 px-2 py-0.5 hover:bg-paper-shade"
                title={`Add ${ITEM_LIBRARY[t].label}`}
              >
                + {ITEM_LIBRARY[t].label}
              </button>
            ))}
            <div className="mx-1 h-4 w-px bg-rule/40" />
            <button
              onClick={reset}
              className="rounded-full border border-rule/40 px-2 py-0.5 hover:bg-paper-shade"
            >
              Reset
            </button>
            <button
              onClick={clearAll}
              className="rounded-full border border-rule/40 px-2 py-0.5 hover:bg-paper-shade"
            >
              Clear
            </button>
            <button
              onClick={onExitEdit}
              className="rounded-full bg-ink px-2 py-0.5 text-paper hover:bg-ink-soft"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}

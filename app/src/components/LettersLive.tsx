"use client";

import { useEffect, useState } from "react";

type Letter = {
  id: number;
  penName: string;
  body: string;
  createdAt: number;
};

const FALLBACKS: Letter[] = [
  { id: -1, penName: "Frustrated in Frontend", createdAt: 0, body: "Sir, — Why do CSS measurements have so many units? Pick one." },
  { id: -2, penName: "Bewildered, Backend", createdAt: 0, body: "To the Editor — I configured nginx for six hours; reading the docs was the only thing that worked. Most disappointed." },
  { id: -3, penName: "Strict-Mode", createdAt: 0, body: "Madam — `any` is not a type. It is a confession. Please print this loudly." },
];

export function LettersLive() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [penName, setPenName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function refresh() {
    try {
      const r = await fetch("/api/letters", { cache: "no-store" });
      if (!r.ok) throw new Error("load fail");
      const j = await r.json();
      const list: Letter[] = Array.isArray(j.data) ? j.data : [];
      setLetters([...list, ...FALLBACKS].slice(0, 10));
    } catch {
      setLetters(FALLBACKS);
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(false);
    if (body.trim().length < 8) {
      setErr("Letter too short.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ penName, body }),
      });
      if (r.status === 429) throw new Error("Too many letters from your desk today.");
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error ?? "could not send");
      }
      setPenName("");
      setBody("");
      setOk(true);
      await refresh();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("devtimes:letter-sent"));
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "unknown");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-3 text-[0.85rem]">
      <div className="min-h-0 flex-1 overflow-hidden">
        {!loaded && <p className="italic text-ink-soft">Opening the morning mail…</p>}
        {loaded && letters.length === 0 && (
          <p className="italic text-ink-soft">The mailbag is empty this morning.</p>
        )}
        <ul className="col-rule [columns:2] gap-6 space-y-2">
          {letters.map((l) => (
            <li key={l.id} className="break-inside-avoid border-b border-rule/30 pb-2">
              <p className="italic leading-snug">{l.body}</p>
              <p className="mt-1 text-right text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft">
                — {l.penName}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <form
        onSubmit={submit}
        className="border-t border-rule/40 pt-2"
      >
        <div className="kicker mb-1">Write to the Editor</div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Pen name (optional)"
            value={penName}
            onChange={(e) => setPenName(e.target.value)}
            maxLength={40}
            className="flex-1 min-w-[140px] border border-rule/40 bg-paper px-2 py-1 text-[0.85rem] italic"
          />
          <input
            type="text"
            placeholder="Sir, — I wish to register a complaint…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={360}
            className="flex-[2] min-w-[200px] border border-rule/40 bg-paper px-2 py-1 text-[0.85rem]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="border border-ink bg-ink px-3 py-1 text-xs uppercase tracking-[0.14em] text-paper hover:bg-ink-soft disabled:opacity-40"
          >
            {submitting ? "Sending…" : "Send"}
          </button>
        </div>
        {err && <p className="mt-1 text-[0.75rem] italic text-accent">{err}</p>}
        {ok && <p className="mt-1 text-[0.75rem] italic text-ink-soft">Posted. The Editor thanks you.</p>}
      </form>
    </div>
  );
}

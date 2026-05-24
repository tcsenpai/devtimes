"use client";

import { useEffect, useState } from "react";
import { SECRETS, TOTAL_SECRETS, loadFound, type SecretId } from "@/lib/secrets";

export function SecretsCounter() {
  const [found, setFound] = useState<SecretId[]>([]);

  useEffect(() => {
    function refresh() {
      setFound(loadFound());
    }
    refresh();
    window.addEventListener("devtimes:secret-found", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("devtimes:secret-found", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const entries = (Object.entries(SECRETS) as [SecretId, typeof SECRETS[SecretId]][])
    .sort((a, b) => a[1].number - b[1].number);

  return (
    <div className="mt-4 w-full max-w-md text-left">
      <div className="flex items-baseline justify-between">
        <div className="kicker">Secret No. 0 — Hidden Pages</div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          {found.length}/{TOTAL_SECRETS}
        </div>
      </div>
      <p className="mt-1 text-[0.82rem] italic text-ink-soft">
        This edition contains fifteen quiet jokes. Tilt the desk, turn pages,
        and look in the margins. Some are obvious. A few are not.
      </p>
      <ul className="mt-2 space-y-0.5 text-[0.78rem]">
        {entries.map(([id, s]) => {
          const ok = found.includes(id);
          return (
            <li key={id} className="flex items-baseline justify-between border-b border-rule/20 py-0.5">
              <span className={ok ? "" : "text-ink-soft"}>
                <span className="font-mono mr-2">{String(s.number).padStart(2, "0")}.</span>
                {ok ? (
                  <>
                    <span className="font-display font-bold">{s.title}</span>{" "}
                    <span className="italic text-ink-soft">— {s.difficulty}</span>
                  </>
                ) : (
                  <>
                    <span className="italic">{s.hint ?? "…"}</span>{" "}
                    <span className="text-ink-soft">[{s.difficulty}]</span>
                  </>
                )}
              </span>
              <span className="text-[10px] font-mono text-ink-soft">{ok ? "✓" : "—"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

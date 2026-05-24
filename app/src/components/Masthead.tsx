import Link from "next/link";
import { pickTagline } from "@/lib/taglines";

type Props = {
  date?: string;
  edition?: string;
  volume?: string;
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const now = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor((now - start) / 86_400_000);
}

const FOUNDING_YEAR = 2026;

export function Masthead({ date, edition = "Late City Edition", volume }: Props) {
  const now = new Date();
  const display = date ?? formatDate(now);
  const volNum = Math.max(1, now.getFullYear() - FOUNDING_YEAR + 1);
  const issueNum = dayOfYear(now);
  const vol = volume ?? `Vol. ${volNum} · No. ${issueNum}`;
  const tagline = pickTagline();
  return (
    <header className="mx-auto w-full max-w-[1100px] px-6 pt-6">
      <div className="flex items-end justify-between text-[11px] uppercase tracking-[0.18em] text-ink-soft">
        <span>{vol}</span>
        <span>{edition}</span>
        <span className="italic normal-case tracking-normal">{tagline}</span>
      </div>
      <div className="section-rule mt-2" />
      <Link href="/" aria-label="Front page" className="block">
        <h1 className="font-masthead text-center text-[44px] leading-[0.95] tracking-tight md:text-[60px] hover:opacity-90 transition-opacity">
          The Dev Times
        </h1>
      </Link>
      <div className="section-rule mt-1" />
      <div className="mt-2 flex items-center justify-between text-[12px] italic text-ink-soft">
        <span>“All the Code That’s Fit to Print”</span>
        <span className="not-italic uppercase tracking-[0.2em]">{display}</span>
        <span>Pages turn ↻</span>
      </div>
      <div className="rule-thick mt-3" />
    </header>
  );
}

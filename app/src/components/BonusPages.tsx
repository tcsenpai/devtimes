import { Folio } from "@/components/Folio";
import { getOnThisDay } from "@/lib/onThisDay";
import { getCrypticForDay } from "@/lib/crypticPool";
import { getDailyDefinitions } from "@/lib/devilsDictionary";

function PageShell({
  kicker,
  title,
  page,
  section,
  children,
}: {
  kicker: string;
  title: string;
  page: number;
  section: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="kicker">{kicker}</div>
      <h2 className="headline text-2xl">{title}</h2>
      <div className="section-rule my-2" />
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      <Folio pageNumber={page} section={section} />
    </div>
  );
}

/* ---------- Weather (dev forecast) ---------- */
const FORECAST = [
  { region: "Production", icon: "⛈", high: "🔥", low: "💀", note: "Scattered 500s, chance of rollback." },
  { region: "Staging", icon: "🌫", high: "?", low: "?", note: "Reality fog. Visibility poor." },
  { region: "Local", icon: "☀", high: "✓", low: "✓", note: "Works on my machine, as forecast." },
  { region: "CI", icon: "🌪", high: "9m", low: "47m", note: "Flaky winds. Re-run conditions favourable." },
  { region: "Code Review", icon: "🌧", high: "+1200", low: "-3", note: "Nits expected through afternoon." },
];

export function WeatherPage({ page }: { page: number }) {
  return (
    <PageShell kicker="Section W" title="Weather Across the Stack" page={page} section="Weather">
      <table className="w-full text-sm">
        <thead className="border-b-2 border-rule">
          <tr>
            <th className="kicker py-1 text-left">Region</th>
            <th className="kicker py-1">Cond.</th>
            <th className="kicker py-1">High</th>
            <th className="kicker py-1">Low</th>
            <th className="kicker py-1 text-left">Outlook</th>
          </tr>
        </thead>
        <tbody>
          {FORECAST.map((f) => (
            <tr key={f.region} className="border-b border-rule/30">
              <td className="py-2 font-display font-bold">{f.region}</td>
              <td className="py-2 text-center text-xl">{f.icon}</td>
              <td className="py-2 text-center">{f.high}</td>
              <td className="py-2 text-center">{f.low}</td>
              <td className="py-2 italic">{f.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-xs italic text-ink-soft">
        Forecast compiled at edition close. Always defer to the on-call.
      </p>
    </PageShell>
  );
}

/* ---------- Classifieds ---------- */
const CLASSIFIEDS = [
  "**WANTED.** Senior TypeScript dev w/ 12y React 19 experience. Pizza Fridays.",
  "**FOR SALE.** Slightly used jQuery plugin. Asking $0 OBO. Free with any IE11 contract.",
  "**LOST.** Production database password. Last seen in screenshot pasted to public channel. Reward offered.",
  "**ROOMMATE WANTED.** Quiet stack. No dependencies. Vim only. References from your linter required.",
  "**PUPPIES.** Mixed-breed Goroutines, free to good home. Comes with own select.",
  "**SERVICES.** Will rewrite your CRUD app in Rust. Lifetime guarantees. Borrows your tears.",
  "**GARAGE SALE.** 47 NPM packages, all yours. Many unused since 2019. Bring own audit tool.",
  "**MISSING.** Junior dev, last seen entering `node_modules`. If found, do not approach without sandbox.",
  "**HELP WANTED.** Looking for someone who actually reads error messages. Generous comp.",
  "**FREE.** One semicolon. Slightly used. Will deliver.",
  "**SEEKING.** Co-founder for stealth-mode AI startup. Idea: like Uber but for SQLite. DM your seed round.",
  "**ESTATE SALE.** Entire monorepo, must go. Includes 8 incompatible build tools. Cash only.",
];

export function ClassifiedsPage({ page, seed }: { page: number; seed: number }) {
  const items = [...CLASSIFIEDS]
    .sort(() => (Math.sin(seed) > 0 ? 1 : -1))
    .slice(0, 9);
  return (
    <PageShell kicker="Section X" title="Classifieds" page={page} section="Classifieds">
      <div className="[columns:3] gap-4 text-[0.78rem] leading-snug">
        {items.map((c, i) => (
          <p key={i} className="break-inside-avoid mb-2 border-b border-rule/30 pb-1">
            {c.split(/\*\*([^*]+)\*\*/).map((part, idx) =>
              idx % 2 === 1 ? (
                <span key={idx} className="font-display font-black uppercase">
                  {part}
                </span>
              ) : (
                part
              )
            )}
          </p>
        ))}
      </div>
    </PageShell>
  );
}

/* ---------- Daily Cryptic (rotates day-of-year) ---------- */
export function CrosswordPage({ page }: { page: number }) {
  const c = getCrypticForDay();
  return (
    <PageShell kicker={`Section P · Cryptic #${c.number}`} title="Daily Cryptic" page={page} section="Puzzles">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <pre className="font-mono text-[10px] leading-[1.3] border border-rule p-3 bg-paper-shade/30">
            {c.grid.join("\n")}
          </pre>
          <p className="mt-2 text-[10px] italic text-ink-soft">{c.note}</p>
        </div>
        <div className="text-[11px]">
          <div className="kicker mb-1">Across</div>
          <ul className="mb-3 space-y-0.5">
            {c.across.map((cl) => (
              <li key={cl}>{cl}</li>
            ))}
          </ul>
          <div className="kicker mb-1">Down</div>
          <ul className="space-y-0.5">
            {c.down.map((cl) => (
              <li key={cl}>{cl}</li>
            ))}
          </ul>
        </div>
      </div>
    </PageShell>
  );
}

/* ---------- Horoscope ---------- */
const SIGNS = [
  { name: "Tabius", emoji: "↹", body: "Mercury is in retrograde and so is your build. Avoid force pushes between 3-5pm." },
  { name: "Capricursor", emoji: "⌶", body: "An old TODO from 2019 will resurface. Resist the urge. Add another one." },
  { name: "Vimini", emoji: "ZZ", body: "You will type :wq three times before realizing you're in nano. It's fine. Breathe." },
  { name: "Forkius", emoji: "⑃", body: "A stranger will star your repo. Do not read too much into it. It is probably a bot." },
  { name: "Mergittarius", emoji: "⌥", body: "Conflict resolution is your strength this week. Mostly because everyone else is on PTO." },
  { name: "Stackorpio", emoji: "↺", body: "Avoid recursion today, especially in conversation. Your manager has noticed." },
];

export function HoroscopePage({ page, seed }: { page: number; seed: number }) {
  const today = [...SIGNS].sort(() => (Math.sin(seed * 7) > 0 ? 1 : -1));
  return (
    <PageShell kicker="Section H" title="The Devloper's Horoscope" page={page} section="Horoscope">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {today.map((s) => (
          <div key={s.name} className="border-b border-rule/30 pb-2">
            <div className="flex items-baseline justify-between">
              <h3 className="headline text-base">{s.name}</h3>
              <span className="font-mono text-sm text-ink-soft">{s.emoji}</span>
            </div>
            <p className="mt-1 text-[0.82rem] italic leading-snug">{s.body}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

/* ---------- Letters to the Editor (live) ---------- */
import { LettersLive } from "@/components/LettersLive";

export function LettersPage({ page }: { page: number }) {
  return (
    <PageShell kicker="Section L" title="Letters to the Editor" page={page} section="Letters">
      <LettersLive />
    </PageShell>
  );
}

/* ---------- Obituaries (RIP frameworks) ---------- */
const RIP = [
  { name: "Internet Explorer 11", lived: "1995 — 2022", note: "Bullied to the end. Survived by Edge, who renounced the family name." },
  { name: "AngularJS (1.x)", lived: "2010 — 2022", note: "Begat Angular 2, which begat the great schism of MMXVI." },
  { name: "Flash", lived: "1996 — 2020", note: "Once powered the internet. Now powers nothing but archive.org rage." },
  { name: "CoffeeScript", lived: "2009 — present-ish", note: "Lived to see its children inherit the kingdom of JavaScript." },
  { name: "jQuery's relevance", lived: "2006 — c. 2018", note: "The library itself, however, refuses to die. We respect it." },
  { name: "Gulp", lived: "2013 — 2019", note: "Sucked into the great Webpack singularity. Then Vite ate Webpack." },
];

export function ObitsPage({ page }: { page: number }) {
  return (
    <PageShell kicker="Section O" title="Obituaries" page={page} section="In Memoriam">
      <div className="space-y-2 text-[0.82rem]">
        {RIP.map((r) => (
          <div key={r.name} className="border-b border-rule/30 pb-1.5">
            <div className="flex items-baseline justify-between">
              <h3 className="headline text-base">{r.name}</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                {r.lived}
              </span>
            </div>
            <p className="italic">{r.note}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

/* ---------- Stocks Ticker (npm versions) ---------- */
const TICKER = [
  { sym: "REACT", price: "19.2.0", delta: "+0.1", trend: "▲" },
  { sym: "NEXT", price: "16.1.6", delta: "+0.0", trend: "▬" },
  { sym: "VUE", price: "3.5.13", delta: "+0.2", trend: "▲" },
  { sym: "NODE", price: "25.4.0", delta: "+1.0", trend: "▲" },
  { sym: "DENO", price: "2.5.0", delta: "+0.3", trend: "▲" },
  { sym: "BUN", price: "1.3.6", delta: "+0.1", trend: "▲" },
  { sym: "JQUERY", price: "4.0.0", delta: "-0.0", trend: "▬" },
  { sym: "RUST", price: "1.83.0", delta: "+0.5", trend: "▲" },
  { sym: "GO", price: "1.24.0", delta: "+0.2", trend: "▲" },
  { sym: "PY", price: "3.13.1", delta: "+0.0", trend: "▬" },
  { sym: "PHP", price: "8.4.2", delta: "+0.1", trend: "▲" },
  { sym: "RUBY", price: "3.4.1", delta: "+0.0", trend: "▬" },
  { sym: "ANGULAR", price: "19.0.4", delta: "+0.1", trend: "▲" },
  { sym: "SVELTE", price: "5.16.0", delta: "+0.3", trend: "▲" },
  { sym: "GIT", price: "2.47.0", delta: "+0.0", trend: "▬" },
];

export function TickerPage({ page }: { page: number }) {
  return (
    <PageShell kicker="Section $" title="Versions & Releases" page={page} section="Markets">
      <table className="w-full text-[0.8rem]">
        <thead className="border-b-2 border-rule">
          <tr>
            <th className="kicker py-1 text-left">Symbol</th>
            <th className="kicker py-1 text-right">Last</th>
            <th className="kicker py-1 text-right">Δ</th>
            <th className="kicker py-1 text-center">Trend</th>
          </tr>
        </thead>
        <tbody>
          {TICKER.map((t) => (
            <tr key={t.sym} className="border-b border-rule/30">
              <td className="py-1 font-mono font-bold">{t.sym}</td>
              <td className="py-1 text-right font-mono">{t.price}</td>
              <td className="py-1 text-right font-mono text-ink-soft">{t.delta}</td>
              <td className="py-1 text-center">{t.trend}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[10px] italic text-ink-soft">
        Quotes delayed by your `npm outdated`. Not investment advice.
      </p>
    </PageShell>
  );
}

/* ---------- On This Day in Dev History ---------- */
export function OnThisDayPage({ page }: { page: number }) {
  const events = getOnThisDay();
  const todayStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" });
  return (
    <PageShell kicker="Section M" title={`On This Day · ${todayStr}`} page={page} section="Almanac">
      <ul className="space-y-3 text-[0.88rem]">
        {events.map((e, i) => (
          <li key={i} className="border-b border-rule/30 pb-2">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-xl font-black tracking-tight">{e.year}</span>
              <span className="kicker">A.D.</span>
            </div>
            <p className="mt-1 italic leading-snug">{e.text}</p>
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t border-rule/40 pt-2 text-[0.78rem] italic text-ink-soft">
        Compiled from the Almanac Desk. Errors of fact will be denied by the Editor.
      </div>
    </PageShell>
  );
}

/* ---------- Devil's Dictionary ---------- */
export function DevilsDictionaryPage({ page }: { page: number }) {
  const defs = getDailyDefinitions();
  return (
    <PageShell kicker="Section D" title="The Devil's Dev Dictionary" page={page} section="Lexicon">
      <div className="col-rule [columns:2] gap-6 text-[0.83rem]">
        {defs.map((d) => (
          <div key={d.word + d.body} className="break-inside-avoid mb-2 border-b border-rule/20 pb-1">
            <span className="font-display text-base font-black">{d.word}</span>{" "}
            <span className="italic text-ink-soft">{d.part}</span>{" "}
            <span>{d.body}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[0.7rem] italic text-ink-soft">
        After Ambrose Bierce. Definitions rotate daily.
      </p>
    </PageShell>
  );
}

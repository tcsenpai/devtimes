import Link from "next/link";
import { Masthead } from "@/components/Masthead";
import { ArticleCard } from "@/components/ArticleCard";
import { AdBlock } from "@/components/AdBlock";
import { SpurelationBox } from "@/components/SpurelationBox";
import { LateEdition } from "@/components/LateEdition";
import { SecretsCounter } from "@/components/SecretsCounter";
import {
  WeatherPage,
  ClassifiedsPage,
  CrosswordPage,
  HoroscopePage,
  LettersPage,
  ObitsPage,
  TickerPage,
  OnThisDayPage,
  DevilsDictionaryPage,
} from "@/components/BonusPages";
import { Folio } from "@/components/Folio";
import { Newspaper } from "@/components/Newspaper";
import { getPopular, getDiscussed, getBySource } from "@/lib/dailydev/client";
import { SECTIONS } from "@/lib/sections";
import type { Post } from "@/lib/dailydev/types";
import { NewspaperBuilder } from "@/components/NewspaperBuilder";

// 8h ISR; the internal scheduler also calls revalidateTag('feed') 3x/day
export const revalidate = 28800;

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function FrontCover({ lead, side }: { lead: Post; side: Post[] }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <LateEdition />
      <Masthead />
      <div className="mt-2 grid min-h-0 flex-1 grid-cols-12 gap-3 overflow-hidden">
        <div className="col-span-8 overflow-hidden border-r border-rule/40 pr-3">
          <ArticleCard post={lead} size="lead" />
        </div>
        <aside className="col-span-4 overflow-hidden pl-2">
          <div className="kicker mb-1">Inside Today</div>
          <div className="section-rule mb-2" />
          <div className="space-y-2">
            {side.slice(0, 4).map((p) => (
              <ArticleCard key={p.id} post={p} size="brief" />
            ))}
          </div>
        </aside>
      </div>
      <Folio pageNumber={1} section="Front Page" />
    </div>
  );
}

function BriefsPage({ briefs }: { briefs: Post[] }) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="kicker">Page 2</div>
      <h2 className="headline text-2xl">In Brief</h2>
      <div className="section-rule my-2" />
      <div className="min-h-0 flex-1 overflow-hidden">
        <ul className="col-rule [columns:2] gap-6 space-y-2 text-[0.85rem]">
          {briefs.map((b) => (
            <li key={b.id} className="break-inside-avoid border-b border-rule/20 py-1">
              <Link href={`/article/${b.id}`} className="hover:underline">
                <span className="kicker mr-1">{b.source?.handle ?? "wire"}</span>
                <span className="headline text-sm">{b.title}</span>
              </Link>
            </li>
          ))}
          <SpurelationBox />
        </ul>
      </div>
      <Folio pageNumber={2} section="Briefs" />
    </div>
  );
}

function SectionIndex() {
  return (
    <div className="flex h-full flex-col">
      <div className="kicker">Index</div>
      <h2 className="headline mt-1 text-3xl">Sections</h2>
      <div className="section-rule my-2" />
      <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-[0.95rem]">
        {SECTIONS.map((s) => (
          <li key={s.slug} className="flex justify-between border-b border-rule/30 py-1">
            <Link className="hover:underline" href={`/section/${s.slug}`}>
              {s.name}
            </Link>
            <span className="italic text-ink-soft">{s.kicker}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm italic text-ink-soft">
        Pages turn with a click on either edge, or by dragging a corner.
      </p>
      <Folio pageNumber={2} section="Index" />
    </div>
  );
}

function ColumnPage({
  kicker,
  title,
  posts,
  pageNumber,
  section,
  adSeed,
}: {
  kicker: string;
  title: string;
  posts: Post[];
  pageNumber: number;
  section: string;
  adSeed: number;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="kicker">{kicker}</div>
      <h2 className="headline text-2xl">{title}</h2>
      <div className="section-rule my-2" />
      <div className="col-rule min-h-0 flex-1 [columns:2] gap-6 overflow-hidden">
        {posts.map((p, i) => (
          <div key={p.id}>
            <ArticleCard post={p} size="feature" />
            {i === Math.floor(posts.length / 2) && <AdBlock seed={adSeed} />}
          </div>
        ))}
      </div>
      <Folio pageNumber={pageNumber} section={section} />
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: { sources?: string };
}) {
  const sourceHandles = (searchParams.sources ?? "community")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const posts: Post[] = [];
  let discussed: { data: Post[] } = { data: [] };

  if (sourceHandles.length === 1 && sourceHandles[0] === "popular") {
    // pull 3 pages of 50 = up to 150 posts
    const [p1, p2, p3, disc] = await Promise.all([
      getPopular({ limit: 50 }).catch(() => ({ data: [] as Post[] })),
      getPopular({ limit: 50, page: 1 }).catch(() => ({ data: [] as Post[] })),
      getPopular({ limit: 50, page: 2 }).catch(() => ({ data: [] as Post[] })),
      getDiscussed({ limit: 20 }).catch(() => ({ data: [] as Post[] })),
    ]);
    const seen = new Set<string>();
    for (const r of [p1, p2, p3]) {
      for (const p of r.data) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          posts.push(p);
        }
      }
    }
    discussed = disc;
  } else {
    const results = await Promise.all(
      sourceHandles.flatMap((h) => [
        getBySource(h, { limit: 50 }).catch(() => ({ data: [] as Post[] })),
        getBySource(h, { limit: 50, page: 1 }).catch(() => ({ data: [] as Post[] })),
      ])
    );
    const seen = new Set<string>();
    for (const r of results) {
      for (const p of r.data) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          posts.push(p);
        }
      }
    }
    // fallback to popular if too few posts
    if (posts.length < 30) {
      const pop = await getPopular({ limit: 50 }).catch(() => ({ data: [] as Post[] }));
      for (const p of pop.data) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          posts.push(p);
        }
      }
    }
  }
  if (posts.length === 0) {
    return (
      <main className="newsprint min-h-screen p-10">
        <Masthead />
        <p className="mt-10 text-center italic">The presses are silent. No posts to render.</p>
      </main>
    );
  }

  const [lead, ...rest] = posts;
  const side = rest.slice(0, 4);
  const briefs = (discussed.data.length ? discussed.data : rest.slice(4, 16)).slice(0, 12);
  const innerPosts = rest.slice(4);
  const innerPages = chunk(innerPosts, 4);

  const seed = Math.floor(Math.random() * 10_000) + (Date.now() & 0xffff);
  const titles = [
    "World of Code",
    "Tools & Trades",
    "Late Edition",
    "Frameworks & Foes",
    "Wire & Stack",
    "Off the Wire",
    "Compiled Today",
    "Yesterday's Patches",
    "The Back Pages",
  ];

  type Spread = { label: string; node: React.ReactNode; kind?: "front" | "section" | "bonus" | "back" };

  // build front + index + colophon
  const spreads: Spread[] = [];
  spreads.push({ label: "Front Page", kind: "front", node: <FrontCover key="cover" lead={lead} side={side} /> });
  spreads.push({ label: "In Brief", kind: "front", node: <BriefsPage key="briefs" briefs={briefs} /> });
  spreads.push({ label: "Index", kind: "front", node: <SectionIndex key="index" /> });

  // wrap content pages with intermittent bonus pages
  let pageNum = 4;
  innerPages.forEach((batch, i) => {
    const t = titles[i % titles.length];
    spreads.push({
      label: t,
      kind: "section",
      node: (
        <ColumnPage
          key={`p${i}`}
          kicker={`Page ${pageNum}`}
          title={t}
          posts={batch}
          pageNumber={pageNum}
          section="General News"
          adSeed={seed + i}
        />
      ),
    });
    pageNum++;
    if (i === 1) {
      spreads.push({ label: "Markets", kind: "bonus", node: <TickerPage key="ticker" page={pageNum++} /> });
    } else if (i === 3) {
      spreads.push({ label: "Weather", kind: "bonus", node: <WeatherPage key="weather" page={pageNum++} /> });
    } else if (i === 5) {
      spreads.push({ label: "Letters to the Editor", kind: "bonus", node: <LettersPage key="letters" page={pageNum++} /> });
    } else if (i === 7) {
      spreads.push({ label: "Horoscope", kind: "bonus", node: <HoroscopePage key="horo" page={pageNum++} seed={seed} /> });
    } else if (i === 9) {
      spreads.push({ label: "Obituaries", kind: "bonus", node: <ObitsPage key="obits" page={pageNum++} /> });
    } else if (i === 11) {
      spreads.push({ label: "Daily Cryptic", kind: "bonus", node: <CrosswordPage key="cross" page={pageNum++} /> });
    } else if (i === 13) {
      spreads.push({ label: "Classifieds", kind: "bonus", node: <ClassifiedsPage key="class" page={pageNum++} seed={seed} /> });
    } else if (i === 15) {
      spreads.push({ label: "On This Day", kind: "bonus", node: <OnThisDayPage key="otd" page={pageNum++} /> });
    } else if (i === 17) {
      spreads.push({ label: "Devil's Dictionary", kind: "bonus", node: <DevilsDictionaryPage key="dict" page={pageNum++} /> });
    }
  });

  // colophon
  spreads.push({
    label: "Colophon",
    kind: "back",
    node: (
      <div key="colophon" className="flex h-full flex-col items-center overflow-auto text-center">
        <div className="kicker mt-2">Colophon</div>
        <h2 className="headline mt-1 text-2xl">The Dev Times</h2>
        <div className="section-rule my-2 w-32" />
        <p className="max-w-xs text-xs italic text-ink-soft">
          Datelines and dispatches courtesy of{" "}
          <a href="https://daily.dev" className="underline">
            daily.dev
          </a>
          . Composed for the daily.dev Hackathon, MMXXVI.
        </p>
        <p className="mt-1 text-xs italic text-ink-soft">
          Source on{" "}
          <a
            href="https://github.com/tcsenpai/devtimes"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            github.com/tcsenpai/devtimes
          </a>
        </p>
        <SecretsCounter />
        <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-ink-soft">
          — Fin —
        </p>
      </div>
    ),
  });

  const pages = spreads.map((s) => s.node);
  const toc = spreads.map((s, i) => ({ index: i, label: s.label, kind: s.kind }));

  return (
    <>
      <Newspaper toc={toc}>{pages}</Newspaper>
      <NewspaperBuilder activeHandles={sourceHandles} />
    </>
  );
}

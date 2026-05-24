import { notFound } from "next/navigation";
import Link from "next/link";
import { Masthead } from "@/components/Masthead";
import { ArticleCard } from "@/components/ArticleCard";
import { AdBlock } from "@/components/AdBlock";
import { Folio } from "@/components/Folio";
import { Newspaper } from "@/components/Newspaper";
import { getByTag, getPopular } from "@/lib/dailydev/client";
import { sectionBySlug, SECTIONS } from "@/lib/sections";
import type { Post } from "@/lib/dailydev/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

export default async function SectionPage({
  params,
}: {
  params: { slug: string };
}) {
  const section = sectionBySlug(params.slug);
  if (!section) notFound();

  const results = await Promise.all(
    section.tags.map((t) => getByTag(t, { limit: 30 }).catch(() => ({ data: [] as Post[] })))
  );
  const merged: Post[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    for (const p of r.data) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        merged.push(p);
      }
    }
  }
  if (merged.length < 6) {
    const fallback = await getPopular({ limit: 20 }).catch(() => ({ data: [] as Post[] }));
    for (const p of fallback.data) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        merged.push(p);
      }
    }
  }

  if (merged.length === 0) notFound();

  const [lead, second, ...rest] = merged;
  const innerPages = chunk(rest, 4);

  const cover = (
    <div className="flex h-full flex-col">
      <Masthead edition={`${section.kicker} · ${section.name}`} />
      <div className="mt-3 grid flex-1 grid-cols-12 gap-4">
        <div className="col-span-8 border-r border-rule/40 pr-4">
          <ArticleCard post={lead} size="lead" />
        </div>
        <aside className="col-span-4 pl-2">
          <div className="kicker mb-1">Also in {section.name}</div>
          <div className="section-rule mb-2" />
          {second && <ArticleCard post={second} size="feature" />}
          <div className="rule-thin mt-4 pt-3">
            <div className="kicker mb-1">Other Sections</div>
            <ul className="space-y-1 text-[0.9rem]">
              {SECTIONS.filter((s) => s.slug !== section.slug).map((s) => (
                <li key={s.slug} className="flex justify-between border-b border-rule/30 py-1">
                  <Link href={`/section/${s.slug}`} className="hover:underline">
                    {s.name}
                  </Link>
                  <span className="italic text-ink-soft">{s.kicker}</span>
                </li>
              ))}
              <li className="pt-2">
                <Link href="/" className="hover:underline">
                  ← Front Page
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
      <Folio pageNumber={1} section={section.kicker} title={`The Dev Times · ${section.name}`} />
    </div>
  );

  const pages: React.ReactNode[] = [
    cover,
    ...innerPages.map((batch, i) => (
      <div key={`p${i}`} className="flex h-full flex-col">
        <div className="kicker">{section.kicker}</div>
        <h2 className="headline text-3xl">{section.name} — continued</h2>
        <div className="section-rule my-2" />
        <div className="col-rule flex-1 [columns:2] gap-6">
          {batch.map((p, idx) => (
            <div key={p.id}>
              <ArticleCard post={p} size="feature" />
              {idx === Math.floor(batch.length / 2) && (
                <AdBlock seed={Math.floor(Math.random() * 1000) + i} />
              )}
            </div>
          ))}
        </div>
        <Folio pageNumber={i + 2} section={section.kicker} title={`The Dev Times · ${section.name}`} />
      </div>
    )),
  ];

  pages.push(
    <div key="back" className="flex h-full flex-col items-center justify-center text-center">
      <div className="kicker">End of section</div>
      <h2 className="headline mt-2 text-3xl">{section.name}</h2>
      <div className="section-rule my-3 w-32" />
      <Link href="/" className="mt-4 border border-rule px-4 py-2 text-sm uppercase tracking-[0.18em] hover:bg-paper-shade">
        ← Return to front page
      </Link>
    </div>
  );

  return <Newspaper>{pages}</Newspaper>;
}

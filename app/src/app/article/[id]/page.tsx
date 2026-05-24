import Link from "next/link";
import { notFound } from "next/navigation";
import { Masthead } from "@/components/Masthead";
import { Folio } from "@/components/Folio";
import { BackLink } from "@/components/BackLink";
import { getPost, getByTag } from "@/lib/dailydev/client";
import type { Post } from "@/lib/dailydev/types";

export const revalidate = 600;

function fmtDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ArticlePage({
  params,
}: {
  params: { id: string };
}) {
  let post: Post;
  try {
    post = await getPost(params.id);
  } catch {
    notFound();
  }

  const primaryTag = post.tags?.[0];
  const related = primaryTag
    ? await getByTag(primaryTag, { limit: 6 }).catch(() => ({ data: [] as Post[] }))
    : { data: [] as Post[] };
  const relatedFiltered = related.data.filter((p) => p.id !== post.id).slice(0, 4);

  return (
    <main className="newsprint min-h-screen pb-12">
      <div className="mx-auto max-w-[860px] px-6">
        <Masthead />
        <div className="mt-6 text-center">
          {primaryTag && <div className="kicker">{primaryTag}</div>}
          <h1 className="headline mx-auto mt-2 max-w-[760px] text-4xl md:text-5xl">
            {post.title}
          </h1>
          <div className="byline mt-3">
            {post.source && <>By {post.source.name} · </>}
            {post.publishedAt && <>{fmtDate(post.publishedAt)}</>}
            {post.readTime ? <> · {post.readTime} min read</> : null}
          </div>
          <div className="section-rule mx-auto mt-4 w-1/3" />
        </div>

        {post.image && (
          <figure className="mt-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt=""
              className="w-full"
              style={{ filter: "grayscale(1) contrast(1.05) sepia(0.18)" }}
            />
            <figcaption className="mt-1 text-center text-[11px] italic text-ink-soft">
              Plate engraved from the dispatch of {post.source?.name ?? "our wire"}.
            </figcaption>
          </figure>
        )}

        <article className="article-body mt-6 [columns:2] gap-8 text-[1.02rem]">
          <p className="drop-cap">
            {post.summary ??
              "No abstract was furnished by the wire. Consult the full dispatch below for the unabridged account."}
          </p>
          <p>
            The complete dispatch — including any inline code, illustrations, and commentary —
            is preserved in its original form at the source of record. Click below to read on.
          </p>
        </article>

        <div className="mt-8 flex flex-col items-center gap-2">
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-rule px-4 py-2 text-sm uppercase tracking-[0.18em] hover:bg-paper-shade"
          >
            Read the unabridged dispatch →
          </a>
          {post.commentsPermalink && (
            <a
              href={post.commentsPermalink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs italic underline"
            >
              Letters to the editor on daily.dev
            </a>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink-soft">
            <span>Filed under:</span>
            {post.tags.map((t) => (
              <span key={t} className="border-b border-rule/40">
                {t}
              </span>
            ))}
          </div>
        )}

        {relatedFiltered.length > 0 && (
          <section className="mt-12">
            <div className="rule-thick" />
            <h3 className="headline mt-3 text-xl">More on this beat</h3>
            <div className="section-rule mt-2" />
            <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {relatedFiltered.map((p) => (
                <li key={p.id} className="border-b border-rule/30 pb-2">
                  <Link href={`/article/${p.id}`} className="hover:underline">
                    <div className="kicker">{p.source?.name}</div>
                    <div className="headline text-base">{p.title}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Folio pageNumber={1} section="Single Dispatch" />
        <div className="mt-3 text-center text-xs italic text-ink-soft">
          <BackLink fallback="/" className="underline">
            ← Back
          </BackLink>
        </div>
      </div>
    </main>
  );
}

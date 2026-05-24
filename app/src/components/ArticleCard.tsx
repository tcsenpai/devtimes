import Link from "next/link";
import type { Post } from "@/lib/dailydev/types";

function relTime(iso?: string): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "moments ago";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

type Size = "lead" | "feature" | "brief" | "tiny";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function ArticleCard({ post, size = "feature" }: { post: Post; size?: Size }) {
  const titleClass =
    size === "lead"
      ? "headline text-2xl md:text-3xl lg:text-4xl"
      : size === "feature"
      ? "headline text-base md:text-lg"
      : size === "brief"
      ? "headline text-sm md:text-base"
      : "headline text-xs";

  const summaryWords =
    size === "lead" ? 50 : size === "feature" ? 22 : size === "brief" ? 14 : 0;

  const summary = post.summary
    ? post.summary.split(/\s+/).slice(0, summaryWords).join(" ") +
      (post.summary.split(/\s+/).length > summaryWords ? "…" : "")
    : "";

  const showImage = (size === "lead" || size === "feature") && post.image;

  return (
    <article className="break-inside-avoid pb-4" data-flex="card">
      <Link href={`/article/${post.id}`} className="block">
        {post.tags?.[0] && <div className="kicker mb-1">{post.tags[0]}</div>}
        <h2 className={titleClass}>{post.title}</h2>
        {post.source && (
          <div className="byline mt-1">
            By {post.source.name}
            {post.readTime ? ` · ${clamp(post.readTime, 1, 99)} min read` : ""}
            {post.publishedAt ? ` · ${relTime(post.publishedAt)}` : ""}
          </div>
        )}
        {showImage && (
          <div className="mt-2" data-flex="image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image!}
              alt=""
              className="w-full object-cover"
              style={{
                filter: "grayscale(1) contrast(1.05) sepia(0.18)",
                maxHeight: size === "lead" ? 220 : 110,
              }}
            />
            <div className="byline mt-1 text-[11px]">— via {post.source?.name}</div>
          </div>
        )}
        {summary && (
          <p
            className={`mt-2 text-[0.9rem] leading-snug ${size === "lead" ? "drop-cap" : ""}`}
            data-flex="excerpt"
          >
            {summary}
          </p>
        )}
      </Link>
    </article>
  );
}

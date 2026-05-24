# The Dev Times

> *All the Code That's Fit to Print.*

A skeuomorphic newspaper for developers. Live posts from
[daily.dev](https://daily.dev) are typeset into a real, page-flipping
broadsheet — masthead, columns, fake ads and all. Built for the
**daily.dev Hackathon 2026**.

![hackathon track: Content Intelligence](https://img.shields.io/badge/track-Content_Intelligence-8a1c1c)
![hashtag](https://img.shields.io/badge/%23-dailydevhackathon-2a2a26)

---

<img width="1786" height="918" alt="CleanShot 2026-05-24 at 19 52 26" src="https://github.com/user-attachments/assets/f3d87531-d978-40df-9a9a-7dd5e89b6e1d" />


## What it does

- Pulls posts from the daily.dev Public API via your PAT (server-side).
- Lays them out as a real newspaper: masthead, columns, drop-caps, ads.
- Flips pages with a real 3D page-flip (`page-flip` / `react-pageflip`).
- Lets you **compose your own edition** — pick any mix of top sources.
- Auto-fits content: if a page overflows, the page progressively
  drops excerpts → images → cards until it fits.
- Sections for Tech, AI, DevOps, Languages, Opinion, Security.
- Single-article reader with related dispatches and a smart back button.

## Stack

| Concern        | Choice                                                         |
| -------------- | -------------------------------------------------------------- |
| Framework      | **Next.js 14** (App Router, `output: standalone`)              |
| Language       | TypeScript                                                     |
| Styling        | Tailwind CSS + handcrafted `globals.css`                       |
| Page-flip      | `react-pageflip` (wrapping the `page-flip` library)            |
| Schema/Valid.  | `zod` for daily.dev payloads                                   |
| Type           | Playfair Display + Old Standard TT + UnifrakturCook masthead   |
| Runtime        | **Bun** (drop-in for npm/node), works under Node too           |
| Hosting        | Self-hosted VPS, behind nginx                                  |

## Repo layout

```
.
├── README.md                <- you are here
├── .env                     <- DAILY_DEV_PAT + host config (gitignored)
├── .mycelium/               <- project tracking (epic + tasks)
└── app/                     <- the Next.js app
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx                  <- front page (newspaper)
    │   │   ├── section/[slug]/page.tsx   <- section broadsheet
    │   │   ├── article/[id]/page.tsx     <- article reader
    │   │   └── api/dd/*                  <- server-only daily.dev proxy
    │   ├── components/
    │   │   ├── Newspaper.tsx             <- page-flip wrapper + top bar
    │   │   ├── NewspaperBuilder.tsx      <- "compose your edition" modal
    │   │   ├── Masthead.tsx              <- title + vol/no + random tagline
    │   │   ├── ArticleCard.tsx           <- post → newspaper article
    │   │   ├── AutoFitPage.tsx           <- runtime overflow-strip
    │   │   ├── AdBlock.tsx               <- vintage fake ads
    │   │   ├── BackLink.tsx              <- referrer-aware back
    │   │   ├── ErrorFilter.tsx           <- swallow browser-extension noise
    │   │   └── Folio.tsx                 <- page footer (folio)
    │   └── lib/
    │       ├── dailydev/
    │       │   ├── client.ts             <- typed v1 client
    │       │   ├── types.ts              <- zod schemas
    │       │   └── cache.ts              <- 1h memo for top-sources tally
    │       ├── sections.ts               <- tag → section mapping
    │       └── taglines.ts               <- random masthead taglines
    ├── Dockerfile
    └── .env.example
```

## Configuration

Copy `.env.example` to `.env` (or place at the repo root) and set:

```env
DAILY_DEV_PAT=dda_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BASE_URL=https://devtimes.com
HOST_BIND=127.0.0.1
HOST_PORT=3939
```

Generate the PAT at <https://app.daily.dev/settings/api>.

The PAT lives only on the server — every fetch goes through
`/api/dd/*` routes that read `process.env.DAILY_DEV_PAT`.
The browser never sees it.

## Run locally

```bash
cd app
cp ../.env .env.local   # or: cp .env.example .env.local
bun install
bun run dev             # http://localhost:3000
```

Production-style local run (mirrors the VPS process):

```bash
cd app
bun run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
PORT=3939 HOST=127.0.0.1 bun .next/standalone/server.js
```

## Routes

| Path                                  | What it serves                            |
| ------------------------------------- | ----------------------------------------- |
| `/`                                   | Front page (with `?sources=h1,h2` mix)    |
| `/section/[slug]`                     | A section's broadsheet                    |
| `/article/[id]`                       | Full article reader                       |
| `/api/dd/feed?kind=&tag=&limit=&...`  | Feed proxy (popular / foryou / discussed) |
| `/api/dd/post/[id]`                   | Single-post proxy                         |
| `/api/dd/sources?limit=`              | Top sources tally (1h cache)              |

## Composing your own edition

The floating **Compose Edition** button (bottom-right) opens a modal
with two presets (Community Picks, Most Popular) and the top 40
sources, tallied hourly from popular posts. Selected sources go into
the URL as `?sources=handle1,handle2,…` and the front page recomposes
itself, deduplicating posts across sources.

## Controls

- **Mouse:** click ← Prev / Next → in the top bar
- **Keyboard:** ←  /  →   arrow keys
- **Mobile:** swipe horizontally
- (Click-to-flip and corner-fold are intentionally disabled to avoid
  fighting with article links.)

## Deploy on a VPS

### With Docker

```bash
cd app
docker build -t devtimes:latest .
docker run -d --name devtimes --restart=always \
  --env-file ../.env \
  -p 127.0.0.1:3939:3939 \
  devtimes:latest
```

### Without Docker (PM2 / systemd)

```bash
cd app
bun install --frozen-lockfile
bun run build
cp -r .next/static .next/standalone/.next/static
cp -r public        .next/standalone/public
HOST=127.0.0.1 PORT=3939 bun .next/standalone/server.js
```

### nginx reverse proxy

```nginx
server {
    server_name devtimes.com;
    listen 443 ssl http2;
    # ssl_certificate ...;
    # ssl_certificate_key ...;

    location / {
        proxy_pass http://127.0.0.1:3939;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Why a newspaper?

The hackathon brief says: *"do not rebuild what already exists, and
bonus points if the output is explorable/shareable."* So instead of
yet-another reading list, we built a **medium**: a place where a
day's daily.dev posts live like a real broadsheet — with a lead, a
masthead, weather-of-tech ads, a back-page colophon. Every page is a
permalink. Compose an edition, share the URL, and your friends see
the same paper.

## License

MIT.

## Credits

Full credits — type, libraries, data sources, inspiration — live in
[**CREDITS.md**](./CREDITS.md). A short version:

- Posts: <https://daily.dev>
- Statistician's Corner: <https://www.tylervigen.com/spurious-correlations>
  (inspired by [`spurelations`](https://pypi.org/project/spurelations/))
- Page-flip: [`page-flip`](https://github.com/Nodlik/StPageFlip) +
  [`react-pageflip`](https://github.com/Nodlik/react-pageflip)
- Type: Playfair Display, Old Standard TT, UnifrakturCook (Google Fonts)
- Built during the daily.dev Hackathon, MMXXVI.

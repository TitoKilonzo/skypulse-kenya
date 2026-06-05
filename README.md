# SkyPulse Kenya 🌤️

> AI-powered real-time weather dashboard for Kenya and East Africa — sky-blue glass UI, real photography backgrounds, built on the [WeatherAI API](https://weather-ai.co).

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)

---

## Live Demo

🔗 **[skypulse-kenya.vercel.app](https://skypulse-kenya.vercel.app)**

---

## Features

| Feature | Detail |
|---|---|
| **Auto-detect location** | WeatherAI `/v1/weather-geo?ip=auto` — silent on mount, no browser prompt |
| **8 Kenyan cities** | Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Nyeri, Malindi, Kakamega |
| **Real background photos** | Unsplash images that shift by weather condition (clear, rain, storm, night) |
| **AI insight card** | Gemini-powered narrative via `ai=true` parameter |
| **24-hour hourly strip** | Scrollable, with precipitation probability |
| **7-day forecast** | Daily min/max with visual temperature bar |
| **8 stat cards** | Humidity, wind, visibility, UV index, pressure, rain chance, cloud cover, moon phase |
| **Glass morphism UI** | Sky-blue palette, Lucide icons, Playfair Display + Outfit typography |
| **Server-side API proxy** | `WEATHERAI_API_KEY` never exposed to the browser |
| **ISR caching** | 10-minute revalidation to protect API quota |

---

## WeatherAI Endpoints Used

| Endpoint | Parameters | Purpose |
|---|---|---|
| `GET /v1/weather` | `lat`, `lon`, `days=7`, `ai=true`, `units=metric` | Coordinates-based forecast |
| `GET /v1/weather-geo` | `ip=auto`, `days=7`, `ai=true`, `units=metric` | IP-based auto-detect + forecast |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) — SSR + Route Handlers |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 + custom glass morphism CSS |
| Icons | Lucide React |
| Fonts | Playfair Display (display) · Outfit (body) · JetBrains Mono (data) |
| Backgrounds | Unsplash (weather-conditional real photos) |
| Deployment | Vercel |

---

## Local Setup

### Prerequisites
- Node.js ≥ 18
- A [WeatherAI API key](https://weather-ai.co) — prefix `wai_`

### 1. Unzip & install

```bash
unzip skypulse-kenya-production.zip
cd skypulse-kenya
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
WEATHERAI_API_KEY=wai_your_actual_key_here
```

### 3. Run dev server

```bash
npm run dev
# → http://localhost:3000
```

### 4. Production build (verify)

```bash
npm run build
npm start
```

---

## Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
npm i -g vercel
vercel                          # follow prompts, link to project
vercel env add WEATHERAI_API_KEY  # paste your wai_ key when prompted
vercel --prod
```

### Option B — GitHub + Vercel Dashboard

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import repository
3. Under **Environment Variables**, add:
   - Key: `WEATHERAI_API_KEY`
   - Value: `wai_your_key_here`
4. Click **Deploy**

> ⚠️ The `WEATHERAI_API_KEY` env var must be set **before** the first production deploy or pages will return a 500.

---

## Project Structure

```
skypulse-kenya/
├── src/
│   ├── app/
│   │   ├── api/weather/route.ts   # Server proxy — key never hits browser
│   │   ├── globals.css            # Sky-blue tokens, glass morphism, animations
│   │   ├── layout.tsx             # Root layout + Google Fonts
│   │   └── page.tsx               # SSR entry — initial Nairobi data
│   ├── components/
│   │   ├── Dashboard.tsx          # Full UI — all weather panels
│   │   └── LoadingScreen.tsx      # Suspense fallback
│   └── lib/
│       ├── types.ts               # WeatherAI API TypeScript interfaces
│       └── weather.ts             # API client, city list, helpers, bg images
├── .env.example
├── package.json
├── tailwind.config.js
└── README.md
```

---

## Architecture Notes

**API Security** — All WeatherAI calls run inside `/api/weather` (Next.js Route Handler). The `Authorization: Bearer` header is injected server-side; the key is never bundled into client JS.

**Caching** — `next: { revalidate: 600 }` means the CDN serves cached weather responses for up to 10 minutes, significantly reducing API quota usage at scale.

**SSR First Paint** — The root Server Component fetches Nairobi weather at build/request time. Users see real data immediately — no loading spinner on first visit.

**Background Images** — Unsplash URLs are mapped by WeatherAI icon code at runtime. Five distinct scenes: clear day, clear night, cloudy, rain, storm.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `WEATHERAI_API_KEY` | ✅ | Your `wai_` prefixed key from [weather-ai.co](https://weather-ai.co) |

---

## License

MIT — see [LICENSE](./LICENSE)

---

*Built as a WeatherAI API technical assessment. Demonstrates secure API key handling, server-side rendering, real-time data, and production-grade TypeScript/Next.js architecture.*

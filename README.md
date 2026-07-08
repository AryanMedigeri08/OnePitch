# OnePitch AI — Multi-Agent GenAI Operations Platform

> AI-powered operations intelligence for FWC 2026 — from crowd safety to sustainability, all orchestrated in real-time.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 15 App                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ Landing   │  │ Fan App  │  │Volunteer │  │Command │  │
│  │ Page      │  │  Page    │  │  View    │  │Center  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│                       │                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │              API Route Handlers                   │   │
│  │  /compass  /sentinel  /accessall  /transitflow   │   │
│  │  /greengoal  /volunteeros  /scenario/trigger      │   │
│  └──────────────────────────────────────────────────┘   │
│                       │                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Agent System (TypeScript)               │   │
│  │  6 System Prompts → Vercel AI SDK → Gemini API   │   │
│  └──────────────────────────────────────────────────┘   │
│                       │                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │        Mock Data Layer (In-Memory JSON)           │   │
│  │  Stadiums │ Gates │ Sectors │ Transit │ Volunteers│   │
│  │  Fans │ Sustainability │ Incidents │ Gate State   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                       │
                 Gemini API
            (gemini-2.0-flash)
```

## 🎯 What's Real vs. Mocked

| Feature | Real / Mocked |
|---------|--------------|
| LLM responses (all 6 agents) | ✅ **Real** — live Gemini API calls with streaming |
| Waste scanner (image classification) | ✅ **Real** — Gemini vision API |
| i18n (EN/ES/FR) | ✅ **Real** — functional `next-intl` translations |
| Gate density data | 🔶 **Mocked** — random fluctuation around base values |
| Stadium/sector/transit data | 🔶 **Mocked** — static JSON seed files |
| Volunteer/fan profiles | 🔶 **Mocked** — synthetic personas |
| Sustainability meters | 🔶 **Mocked** — time-series with random variation |
| Scenario cascades | 🔶 **Mocked** — pre-scripted events via SSE |
| Authentication | ❌ **Not implemented** — simple role switcher |
| Real transit APIs / GTFS | ❌ **Out of scope** |
| Real CCTV / IoT sensors | ❌ **Out of scope** |
| AR / camera overlay | ❌ **Out of scope** — 2D SVG map instead |

## 🚀 Quick Start

```bash
npm install
cp .env.local.example .env.local
# Add your GOOGLE_GENERATIVE_AI_API_KEY
npm run dev
```

## 📱 Pages

1. **Landing** (`/`) — Pitch narrative, featured agents, "View Live Demo" CTA
2. **Fan App** (`/fan`) — Compass chat, AccessAll, TransitFlow, GreenGoal scanner
3. **Volunteer** (`/volunteer`) — Shift-Sync, Sentiment Pulse, Shift Handoff
4. **Command Center** (`/command`) — Live heatmap, Sentinel NLQ, Scenario Simulator, ESG

## 🤖 6 Agents

| Agent | Surface | Key Feature |
|-------|---------|-------------|
| 🧭 Compass | Fan App | Step-by-step navigation with gate rerouting |
| 🛡️ Sentinel | Command Center | Crowd density analysis + dispatch scripts |
| ♿ AccessAll | Fan App | Personalized match-day plans + volunteer matching |
| 🚇 TransitFlow | Fan App | Multi-leg itineraries + cross-border checklists |
| 🌱 GreenGoal | Fan App + Command | Real vision waste scanner + carbon copilot + ESG |
| 🤝 VolunteerOS | Volunteer View | Sentiment analysis + structured handoffs |

## 🎬 Scenario Simulator (Flagship Feature)

3 cross-agent cascades, each streamed as a live timeline:
1. ⛈️ **Sudden Thunderstorm** — 6 agents coordinate indoor rerouting
2. 🚑 **Medical Emergency** — corridor clearing + volunteer dispatch
3. 🔒 **VIP Movement** — targeted fan rerouting (not full-stadium)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router), TypeScript
- **Styling**: Tailwind CSS v4, custom design system
- **LLM**: Gemini API via `@ai-sdk/google`
- **Streaming**: Vercel AI SDK (`streamText` + `useChat`)
- **i18n**: `next-intl` (EN/ES/FR)
- **Animations**: `framer-motion`, CSS keyframes

## 📄 Documentation

- [`DECISIONS.md`](./DECISIONS.md) — All assumptions and trade-offs
- [`DEPLOY.md`](./DEPLOY.md) — Deployment and redeploy instructions

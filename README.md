# OnePitch AI — Multi-Agent GenAI Operations Platform

> AI-powered operations intelligence for FWC 2026 — from crowd safety to sustainability, all orchestrated in real-time.

## 🎯 FIFA World Cup 2026 Challenge & Problem Statement Alignment

OnePitch is built directly in alignment with the core challenges of **FIFA World Cup 2026** (48 teams, 104 matches, millions of fans). Managing multi-venue crowd flow, transit bottlenecks, diverse accessibility needs, volunteer burnout, and sustainability reporting demands a coordinated ecosystem. 

### How OnePitch Maps to the Challenge

- **Wayfinding & Navigation**: `Compass` dynamically calculates walking routes inside MetLife Stadium, instantly rerouting fans if gates close or security perimeters shift.
- **Crowd Management**: `Sentinel` monitors live gate densities, warns operations staff of critical surges (>90%), and auto-generates structured dispatcher radio scripts.
- **Accessibility & Inclusion**: `AccessAll` maps step-free pathways for mobility-impaired fans, coordinates sensor-quiet routes, and auto-dispatches nearby volunteers.
- **Transportation & Logistics**: `TransitFlow` generates multi-leg transit itineraries (Walk → Metro → Shuttle → Gate) with fallback routing and handles cross-border checkpoint checklists.
- **Tournament Sustainability**: `GreenGoal` features a real-time vision-based waste scanner (compost vs. recycle vs. landfill classification via Gemini Vision) and builds live ESG carbon footprint reports.
- **Volunteer Orchestration**: `VolunteerOS` tracks shifts, monitors volunteer sentiment (flagging fatigue for ops command), and structures handoff logs for consecutive shifts.

---

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
# Add your GOOGLE_GENERATIVE_AI_API_KEY and GROQ_API_KEY
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

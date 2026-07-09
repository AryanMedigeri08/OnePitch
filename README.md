# OnePitch AI

Multi-agent GenAI operations intelligence for the FIFA World Cup 2026.

OnePitch helps stadium teams, fans, volunteers, and command-center operators make faster decisions across navigation, crowd management, accessibility, transport, sustainability, multilingual assistance, and incident response.

## Problem Alignment

The FIFA World Cup 2026 expands to 48 teams, 104 matches, and a much larger multi-city operating footprint. Stadium operations need coordinated, real-time support for crowd surges, gate closures, accessibility requests, transit bottlenecks, multilingual fan needs, volunteer fatigue, and sustainability reporting.

OnePitch addresses that brief with six specialized AI agents connected through a shared simulated venue status layer:

| Challenge area | OnePitch response |
| --- | --- |
| Navigation and wayfinding | Compass gives step-by-step stadium directions and reroutes fans when gates close. |
| Crowd management | Sentinel analyzes gate density, flags bottlenecks, and drafts dispatch scripts. |
| Accessibility | AccessAll creates step-free match-day plans and matches fans with trained volunteers. |
| Transportation | TransitFlow builds multi-leg itineraries with primary and fallback options. |
| Sustainability | GreenGoal classifies waste images, recommends carbon reductions, and drafts ESG summaries. |
| Volunteer operations | VolunteerOS supports shift info, sentiment checks, micro-training, and handoff notes. |
| Real-time decision support | The scenario simulator streams cross-agent cascades for weather, medical, and security events. |
| Multilingual assistance | Agent prompts and UI support English, Spanish, and French workflows. |

## Main Experiences

- Landing page: challenge narrative, agent overview, and demo entry points.
- Fan app: Compass, AccessAll, TransitFlow, and GreenGoal tools for match-day support.
- Volunteer dashboard: shift sync, sentiment pulse, and structured handoff generation.
- Command center: live gate-density map, Sentinel natural-language query, ESG chat, and scenario simulator.

Localized routes are served under:

- `/en`
- `/es`
- `/fr`

Example pages:

- `/en/fan`
- `/en/volunteer`
- `/en/command`

## Agent System

| Agent | Surface | Purpose |
| --- | --- | --- |
| Compass | Fan app | Navigation, accessible routing, gate rerouting, walking-time estimates. |
| Sentinel | Command center | Crowd-density analysis, warnings, action recommendations, dispatch scripts. |
| AccessAll | Fan app | Accessibility profiles, match-day plans, volunteer matching, staff training. |
| TransitFlow | Fan app | Hotel-to-stadium itineraries, fallback routes, illustrative cross-border checklists. |
| GreenGoal | Fan app and command center | Waste classification, carbon copilot, ESG reporting. |
| VolunteerOS | Volunteer dashboard | Volunteer guidance, fatigue detection, shift handoff summaries. |

All agent prompts explicitly include FIFA World Cup 2026 alignment, multilingual support instructions, and synthetic-data safety boundaries.

## Scenario Simulator

The command center includes three server-sent-event cascade demos:

1. Sudden Thunderstorm: Sentinel, TransitFlow, AccessAll, GreenGoal, and Compass coordinate covered-area rerouting.
2. Medical Emergency: Sentinel clears a corridor, Compass calculates the route, and VolunteerOS dispatches trained volunteers.
3. VIP Movement / Security Sweep: Sentinel triggers a targeted security perimeter, Compass reroutes only affected sections, and TransitFlow adjusts nearby pickup guidance.

## What Is Real vs Simulated

| Feature | Status |
| --- | --- |
| LLM chat responses | Real API-backed streaming through Vercel AI SDK. |
| Gemini primary model | Real when `GOOGLE_GENERATIVE_AI_API_KEY` is configured. |
| Groq fallback model | Real when `GROQ_API_KEY` is configured. |
| GreenGoal image classification | Real vision call when Gemini is configured. |
| English, Spanish, French localization | Real `next-intl` locale routing and message files. |
| Gate densities | Simulated from JSON seed data with live fluctuation. |
| Stadium, sector, transit, fan, volunteer, sustainability data | Simulated JSON seed data. |
| Scenario cascades | Simulated scripted operations events streamed over SSE. |
| Authentication | Not implemented; this is a hackathon showcase/demo. |
| Real transit feeds, CCTV, IoT, ticketing, or venue systems | Not connected. |

## Tech Stack

- Next.js 15.5.19 App Router
- React 19.2.4
- TypeScript
- Tailwind CSS v4
- Vercel AI SDK 7
- `@ai-sdk/google` for Gemini
- `@ai-sdk/groq` fallback model support
- `next-intl` 4.13.1 for locale routing and translations
- Vitest and Testing Library
- ESLint 9 with strict TypeScript checks

Security-related dependency state:

- `npm audit` passes with 0 vulnerabilities.
- `postcss` is overridden to `8.5.16` to avoid the vulnerable transitive version bundled under Next.
- `next` is pinned to `15.5.19` because `15.5.20` introduced a production-build regression in this project.

## Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Add API keys to `.env.local`:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_google_key
GROQ_API_KEY=your_groq_key
GEMINI_MODEL=gemini-2.0-flash
GROQ_MODEL=llama-3.3-70b-versatile
```

The app still renders without real keys, but live model responses require at least one configured provider.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
npm run test:coverage
npm audit
```

## Verification Status

Latest verified gates:

```bash
npm.cmd run build
npm.cmd run lint
npm.cmd test
npx.cmd tsc --noEmit
npm.cmd audit
```

Results:

- Production build passes.
- Lint passes.
- TypeScript passes.
- Tests pass: 100 tests across 9 test files.
- Audit passes: 0 vulnerabilities.

## Project Structure

```text
src/app/[locale]/page.tsx              Landing page
src/app/[locale]/fan/page.tsx          Fan app
src/app/[locale]/volunteer/page.tsx    Volunteer dashboard
src/app/[locale]/command/page.tsx      Command center
src/app/api/*                          Agent and simulator API routes
src/components/*                       Shared UI components
src/data/*                             Synthetic stadium operations data
src/i18n/*                             next-intl routing and request config
src/lib/agents/*                       Agent metadata, prompts, fallback model, cascades
src/lib/security/*                     Input validation, secure route wrapper, rate limiter
messages/*.json                        EN/ES/FR translations
public/favicon.ico                     Static favicon
```

## Documentation

- [DECISIONS.md](./DECISIONS.md): design assumptions and trade-offs.
- [DEPLOY.md](./DEPLOY.md): deployment notes.

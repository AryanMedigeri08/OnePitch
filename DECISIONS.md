# DECISIONS.md — OnePitch AI

All architectural assumptions and decisions made during the build.

## Architecture

1. **Fast-track single-app path chosen**: Everything runs as a single Next.js 15 app deployed on Vercel. No separate Python/FastAPI backend. This avoids cross-service networking complexity and gives us a single deployable unit.

2. **Vercel AI SDK for agent orchestration**: Using `ai` + `@ai-sdk/google` packages instead of LangGraph. Each agent is a distinct system prompt / persona, not a separate model or service.

3. **Single Gemini model**: All 6 agents use the same Gemini model (configurable via `GEMINI_MODEL` env var, defaults to `gemini-2.0-flash`). The "Powered by: [model-tag]" labels in the UI are **cosmetic narrative flavor only** — they reflect the original pitch's "multi-model router" concept, but under the hood it's one real model with different system prompts.

## Data & State

4. **In-memory state**: No database (SQLite/Firestore) used. Gate closures, incidents, and runtime state are held in-memory in the Node.js process. This resets on server restart — acceptable for a demo.

5. **Mock data only**: All stadium, gate, sector, transit, volunteer, and fan data is synthetic JSON. No real APIs are called. The mock data generator produces fluctuating time-series values for gate density and sustainability meters.

6. **No real IoT/CCTV/transit feeds**: Gate density values are randomly generated within plausible ranges. Sustainability meters tick with small random variations around baseline values.

## Features

7. **Waste scanner is real**: The GreenGoal waste scanner sends actual images to Gemini's vision API for classification. This is the one genuinely functional ML feature.

8. **Cross-border checklist is illustrative**: TransitFlow's cross-border feature is clearly labeled as "Demo content — not real travel/immigration advice" per the spec.

9. **No authentication**: A simple role switcher (Fan / Volunteer / Command Center) is used instead of real auth. Fan personas are pre-seeded synthetic profiles selected via a dropdown.

10. **Scenario cascades are pre-scripted**: The 3 scenario cascades (thunderstorm, medical, VIP) use pre-written event sequences delivered via SSE with timed delays. They do NOT make real-time Gemini calls during the cascade — the staggered reveal effect is the priority for demo impact.

## i18n

11. **Functional i18n**: All UI strings are translated to EN/ES/FR using `next-intl`. LLM responses from Gemini are in English only (the model responds in the language of the prompt, but system prompts are English).

## Design

12. **Dark mode for Command Center**: The Command Center uses a distinct dark theme (navy `#0A1628`) to feel like a real ops dashboard. Fan App uses a clean light theme.

13. **Typography**: Inter for body text, JetBrains Mono for data/code displays.

14. **No shadcn/ui components installed**: Due to time constraints, using custom-styled components with Tailwind CSS directly instead of installing shadcn/ui. The design system is defined in `globals.css` with custom CSS variables and animations.

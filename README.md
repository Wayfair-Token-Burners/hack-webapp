# FreightDesk

> **An agent that clears the freight-exception queue while ops sleeps in.**
> Boston Tech Week · Subconscious × Wayfair × Baseten × Cloudflare hackathon (2-hour sprint)
> Track 2 — Agents for Supply Chain

> **Repo state (refactor in progress).** The existing working prototype — a Next.js + Vercel AI SDK + Subconscious `ToolLoopAgent` chat app — now lives entirely under `worker/`. The `db/`, `web/`, and `scripts/` partitions are scaffolded but empty; see "Where to Implement What" below for the 2-hour partition plan. To run the current prototype: `cd worker && pnpm install && pnpm dev`.

Maria Chen is a Tier-2 Exception Ops analyst. She walks in at 7:42am to **247 freight exceptions** in her queue — damaged pallets, OS&D shorts, missed appointments, BOL mismatches. By lunch she needs zero.

FreightDesk reads the photo, listens to the driver's voicemail, parses the BOL PDF, and resolves the boring 95%. Maria only sees the **17 cases that actually needed a human**.

---

## Stack at a Glance

| Layer        | Sponsor       | Product(s) Used                                         | Where in repo            |
|--------------|---------------|---------------------------------------------------------|--------------------------|
| Reasoning    | **Subconscious** | Agentic reasoning loop on the hot decision path      | `worker/src/models/subconscious.ts` · `worker/src/agent.ts` |
| Inference    | **Baseten**   | Vision (photo damage), Whisper-class ASR (driver voicemail), embeddings | `worker/src/models/baseten.ts` · `worker/src/tools/{readPhoto,transcribeAudio}.ts` |
| Cloud / Edge | **Cloudflare** | Workers, **D1** (SQL), **R2** (assets), **KV** (cache), **Durable Objects** (per-task agent state), **Queues** (run-all fan-out) | `wrangler.toml` · `worker/` |
| Domain       | **Wayfair**   | CastleGate-style freight exception taxonomy & jargon (OS&D, BOL, ASN, disposition codes) | `db/schema.sql` · `db/seed.sql` |

Single architectural rule: **`web/` never calls models or DB directly.** Only `worker/` does. Keys stay server-side; the agent trace is one observable thing streamed via SSE.

---

## Repo Tree

```
freightdesk/
├── README.md                        ← you are here
├── package.json                     ← npm workspaces (worker + web)
├── wrangler.toml                    ← Cloudflare config: D1, R2, KV, DO, Queues bindings
├── .dev.vars.example                ← SUBCONSCIOUS_API_KEY, BASETEN_API_KEY
│
├── db/                              ── SCENARIO + CLOUD DB  (owner: Person A)
│   ├── README.md                    ← "run: bash scripts/setup.sh"
│   ├── schema.sql                   ← exceptions, orders, customers, actions, decisions, evidence
│   ├── seed.sql                     ← 40 rows, 5 hero cases planted
│   ├── seed-photos/                 ← damaged-pallet JPGs uploaded to R2
│   │   ├── ex_001_pallet_crush.jpg
│   │   ├── ex_007_water_damage.jpg
│   │   └── ex_012_intact_but_short.jpg
│   ├── seed-audio/                  ← driver voicemails (mp3) → R2
│   │   ├── ex_001_driver_fault.mp3      # "I clipped the dock, ma'am"
│   │   └── ex_023_carrier_dispute.mp3
│   └── seed-pdfs/                   ← BOLs, delivery receipts → R2
│       ├── ex_001_bol.pdf
│       └── ex_018_ar_invoice.pdf
│
├── worker/                          ── AUTONOMOUS BACKEND  (owner: Person B)
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                 ← HTTP router · /api/queue · /api/exception/:id/run (SSE) · CORS
│       ├── agent.ts                 ← Durable Object: per-exception stateful agent loop
│       ├── tools/                   ← one file per tool; agent picks via Subconscious
│       │   ├── readPhoto.ts             → Baseten vision model
│       │   ├── transcribeAudio.ts       → Baseten Whisper endpoint
│       │   ├── readDocument.ts          → OCR (Baseten or Cloudflare AI fallback)
│       │   ├── lookupOrder.ts           → D1 read
│       │   ├── lookupCustomerPolicy.ts  → D1 read (LTV band, SLA tier)
│       │   ├── decide.ts                → Subconscious reasoning, returns DisposistionCode
│       │   └── draftMessages.ts         → Subconscious; produces 3 outbound drafts
│       ├── models/
│       │   ├── subconscious.ts      ← thin client; streams reasoning steps
│       │   └── baseten.ts           ← thin client; vision + audio + embeddings
│       └── lib/
│           ├── db.ts                ← typed D1 helpers
│           ├── r2.ts                ← signed-URL helper for evidence assets
│           ├── sse.ts               ← server-sent events for agent trace
│           └── trace.ts             ← structured tool-call logger (renders in UI)
│
├── web/                             ── FRONTEND DASHBOARD  (owner: Person C)
│   ├── index.html
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx                  ← shell: PersonaChip + MetricsBar + QueuePage + DetailPanel
│       ├── pages/
│       │   ├── QueuePage.tsx        ← dense table of 40 exceptions; "Run all open" CTA
│       │   └── DetailPanel.tsx      ← evidence stack + live AgentTrace + ResolutionCard
│       ├── components/
│       │   ├── PersonaChip.tsx      ← "Maria Chen · Exception Ops T2 · Logged in 7:42am"
│       │   ├── MetricsBar.tsx       ← Open · Auto-resolved · Escalated · $ recovered today
│       │   ├── ExceptionRow.tsx     ← carrier, lane, SKU, age, disposition badge
│       │   ├── EvidencePanel.tsx    ← <audio>, <img>, PDF preview, email body
│       │   ├── AgentTrace.tsx       ← SSE-driven; renders tool-call timeline with sponsor labels
│       │   ├── ResolutionCard.tsx   ← disposition code + $ impact + confidence
│       │   └── DraftMessages.tsx    ← 3 outbound drafts (carrier, customer, AR)
│       └── lib/api.ts               ← fetch + EventSource client to worker
│
└── scripts/                         ── SETUP GLUE  (no app logic)
    ├── setup.sh                     ← provision D1+R2+KV, apply schema, seed, upload assets
    ├── upload-assets.sh             ← push seed-{photos,audio,pdfs}/* to R2
    └── reset.sh                     ← PANIC BUTTON · drop + reseed in ~5s for live demo
```

---

## Where to Implement What (the 2-hour partition)

Three teammates, three folders, ~zero merge conflicts. Times are clock-relative to **5:45pm hack start**.

### Person A — `db/` (done by 6:30pm)
- [ ] `schema.sql` — 6 tables: `exceptions`, `orders`, `customers`, `evidence`, `actions`, `decisions`
- [ ] `seed.sql` — **40 rows**, of which exactly **5 are hero cases** (planted, not random):
  - **HERO-1** Multimodal fusion: damage photo + driver voicemail admitting fault → liability flips to carrier
  - **HERO-2** Per-customer policy: same SKU short-ship, two customers — Platinum LTV gets full refund + expedited replacement; standard gets credit memo only
  - **HERO-3** Counter-intuitive: photo looks like total loss, but BOL line says "display sample, salvage value $0" → close as written-off, no claim
  - **HERO-4** Must-escalate: low-confidence carrier dispute, no clear evidence → routes to Maria with summary
  - **HERO-5** Time-pressure: missed appointment, 2-hour reschedule window → agent books slot via mock carrier API
- [ ] Drop binary assets into `seed-photos/`, `seed-audio/`, `seed-pdfs/`
- [ ] Jargon density: column names use OS&D, BOL, ASN, disposition_code, ltv_band, sla_tier

### Person B — `worker/` (full window, hottest path)
- [ ] `wrangler.toml` bindings: D1 (`DB`), R2 (`FILES`), KV (`AGENT_MEM`), Durable Object (`Agent`), Queue (`runs`)
- [ ] `agent.ts` — Durable Object class; one instance per `exception_id`; max 6 tool calls per case
- [ ] Tool files — each tool returns structured JSON AND emits an SSE trace event
- [ ] `models/subconscious.ts` — wraps Subconscious reasoning; streams steps into SSE
- [ ] `models/baseten.ts` — vision + ASR endpoints; **cache responses in KV** so demo never re-hits Baseten on the same hero case
- [ ] `/api/runAll` — enqueues all open exceptions onto Cloudflare Queue; fan-out to agent DOs; queue counter visibly drops

### Person C — `web/` (mock API for first hour, swap real at 7:00pm)
- [ ] First hour: hard-code a fixture JSON for the queue so the UI works without worker
- [ ] `MetricsBar` — Open / Auto-resolved / Escalated / $ recovered (animate ticking)
- [ ] `AgentTrace` — SSE consumer; renders each tool call as a chip with the sponsor model name visible (the screenshot moment)
- [ ] `ResolutionCard` — disposition code, confidence %, $ impact
- [ ] `DraftMessages` — 3 side-by-side drafts (to carrier, to customer, to AR ledger)
- [ ] "Run all open" button — the closer shot for the video

---

## Quickstart

```bash
# 0) Clone, install
npm install

# 1) Cloudflare: login + provision everything + seed
wrangler login
cp .dev.vars.example .dev.vars        # fill in SUBCONSCIOUS_API_KEY, BASETEN_API_KEY
bash scripts/setup.sh

# 2) Run the worker (agent backend)
cd worker && npx wrangler dev

# 3) Run the dashboard (separate terminal)
cd web && npm run dev                  # http://localhost:5173

# Demo died on stage? Reset in 5s:
bash scripts/reset.sh
```

Production deploy: `cd worker && npx wrangler deploy` then `cd web && npm run build` and serve the `dist/` from Cloudflare Pages.

---

## Host & Service Providers — Why Each Was Chosen

| Concern | Provider | Why |
|---|---|---|
| **Edge runtime** | Cloudflare Workers | Sub-50ms cold start, global, free tier covers demo. Agent runs on the edge, not a VM you have to babysit. |
| **SQL** | Cloudflare D1 | Single-binding SQLite, perfect for the `exceptions` queue. No connection pool to manage. |
| **Blob storage** | Cloudflare R2 | Stores the photos, voicemails, BOL PDFs. Zero egress. R2 signed URLs feed `<img>` and `<audio>` in the UI. |
| **Per-task state** | Cloudflare Durable Objects | One DO instance per `exception_id` = naturally serializes agent steps, holds the SSE channel, survives reloads. |
| **Cache** | Cloudflare KV | Cache Baseten/Subconscious responses for hero cases → demo is deterministic, no rate-limit risk on stage. |
| **Fan-out** | Cloudflare Queues | "Run all open" enqueues 40 jobs; queue consumers spawn DOs in parallel; counter ticks down live. |
| **Reasoning** | Subconscious | Agent decision-making + draft generation; visible in the trace as `subconscious.reason()` and `subconscious.draft()`. |
| **Inference** | Baseten | Hosts vision + ASR + embedding models. Avoids OpenAI/Anthropic/Gemini — sponsors fund the night to see THEIR logos. |
| **Domain** | Wayfair | Freight ops taxonomy: CastleGate-style OS&D, disposition codes, LTV bands. Real Wayfair engineers will recognize the jargon in 2 seconds. |

---

## The 60-Second Demo Beats

```
0:00–0:08  Wide shot. Queue at 247. MetricsBar ticking. "Maria has 247 exceptions before lunch."
0:08–0:20  Click HERO-1. Photo loads. Voicemail plays. ASR transcript surfaces "I clipped the dock."
0:20–0:35  AgentTrace streams: readPhoto (Baseten) → transcribeAudio (Baseten) → lookupOrder
           → decide (Subconscious) → draftMessages (Subconscious). ResolutionCard renders.
           THE STACK FLYBY (the screenshot sentence):
           "Photo goes to a vision model on Baseten. The agent reasons with Subconscious.
            The whole thing runs on Cloudflare Workers with D1, R2, and Durable Objects.
            One stack, end to end."
0:35–0:45  Click HERO-2a then HERO-2b. Same SKU, two customers, two different right answers.
           "Same input. Different right answer."
0:45–0:55  Back to queue. Hit "Run all open." Counter drops 247 → 17 live.
0:55–1:00  "Maria came in to clear a queue. She left having made the 17 decisions that
           actually needed a human."
```

---

## Submission Checklist (verify out loud at 7:30pm)

- [ ] Public URL works in incognito
- [ ] 60s video uploaded, plays
- [ ] Repo public, README renders, stack table visible
- [ ] Every sponsor logo named in this README's stack table
- [ ] At least one call per model-sponsor visible in a working agent trace
- [ ] 4+ Cloudflare products used and named (Workers, D1, R2, KV, DO, Queues — that's 6)
- [ ] `actions` table populated for every resolved hero case (audit trail)
- [ ] HERO-1 rehearsed for the live 90s top-team demo
- [ ] `scripts/reset.sh` tested — nukes and reseeds in 5s

---

## License

MIT. Built in 2 hours. Don't ship to production without bumping the agent step limit and putting Subconscious behind a circuit breaker. 🫡

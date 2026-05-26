# web/ — Frontend Dashboard partition

Owner during sprint: **Person C**. See root `README.md` for the full plan.

Will hold the Vite + React dashboard:

- `App.tsx` shell with `PersonaChip` ("Maria Chen · Exception Ops T2") and `MetricsBar`
- `QueuePage` — dense 40-row exception table, "Run all open" CTA
- `DetailPanel` — `EvidencePanel` (audio + photo + PDF + email) + `AgentTrace` (SSE) + `ResolutionCard` + `DraftMessages`

**Single architectural rule:** this partition NEVER calls Subconscious, Baseten, or D1 directly. All traffic goes through `worker/`. Keys stay server-side; the agent trace is one observable SSE stream rendered here.

Bootstrap (once Person C starts):
```bash
cd web
pnpm create vite@latest . --template react-ts
pnpm install
pnpm dev    # http://localhost:5173
```

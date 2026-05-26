# FreightDesk AI Agent

**Auto-resolve 95% of freight exceptions. Maria only sees the 17 that need a human.**

Built for **Wayfair × Subconscious Hackathon - Track 2: Supply Chain**

---

## The Problem

Wayfair ops analyst Maria arrives to **247 freight exceptions** every morning:
- Damaged goods with unclear liability
- Short shipments needing customer resolution
- Missed appointments requiring reschedule
- Carrier disputes with conflicting evidence
- Display samples mistaken for losses

**Current process:** Manual triage takes 3-5 minutes per case. 247 × 5 min = **20+ hours/day**

**FreightDesk solution:** AI agent auto-resolves 95% → Maria sees only **~12 escalations/day**

---

## Architecture

```
Exception Queue (247 cases)
    ↓
FreightDesk AI Agent
    ├─ lookupOrder (Cloudflare D1/Mock)
    ├─ readPhoto (Cloudflare AI Vision - @cf/llava-1.5-7b-hf)
    ├─ transcribeAudio (Baseten Speech-to-Text)
    ├─ decide (Subconscious TIM-Qwen3.6-27b)
    └─ draftMessages (Subconscious TIM-Qwen3.6-27b)
    ↓
Disposition Codes:
  • CARRIER_LIABILITY → file claim, send replacement
  • WRITE_OFF → no claim, accept loss
  • FULL_REFUND → Platinum/Gold LTV customers
  • CREDIT_MEMO → Standard LTV customers
  • RESCHEDULE → book new delivery slot
  • ESCALATE → confidence < 0.6, send to Maria
```

---

## File Structure

```
worker/
├── src/
│   ├── mocks/
│   │   └── exceptions.ts        # 5 hero test cases
│   ├── tools/
│   │   ├── lookupOrder.ts       # Cloudflare D1 lookup (mocked)
│   │   ├── readPhoto.ts         # Cloudflare AI Vision ⭐
│   │   ├── transcribeAudio.ts   # Baseten STT (mocked)
│   │   ├── decide.ts            # Subconscious decision engine
│   │   └── draftMessages.ts     # Subconscious message drafting
│   └── agent.ts                 # Main orchestrator + SSE streaming
│
├── app/api/
│   ├── queue/route.ts           # GET /api/queue → all 5 cases
│   └── exception/[id]/run/
│       └── route.ts             # GET /api/exception/:id/run → SSE stream
```

---

## API Endpoints

### 1. GET `/api/queue`

Returns all exceptions in the queue.

**Response:**
```json
{
  "total": 5,
  "exceptions": [
    {
      "exception_id": "HERO-1",
      "type": "damage",
      "order": { "id": "WF-ORD-2024-78342", ... },
      "evidence": { "photo_url": "...", "audio_url": "..." },
      "dollar_impact": 1847.99
    },
    ...
  ]
}
```

### 2. GET `/api/exception/:id/run`

Server-Sent Events stream of agent execution.

**Example:**
```bash
curl http://localhost:3000/api/exception/HERO-1/run
```

**SSE Stream:**
```
data: {"step":1,"tool":"lookupOrder","sponsor":"Cloudflare","input":{...},"output":{...},"timestamp":"2024-..."}

data: {"step":2,"tool":"readPhoto","sponsor":"Cloudflare","input":{...},"output":{...},"timestamp":"2024-..."}

data: {"step":3,"tool":"transcribeAudio","sponsor":"Baseten","input":{...},"output":{...},"timestamp":"2024-..."}

data: {"step":4,"tool":"decide","sponsor":"Subconscious","input":{...},"output":{...},"timestamp":"2024-..."}

data: {"step":5,"tool":"draftMessages","sponsor":"Subconscious","input":{...},"output":{...},"timestamp":"2024-..."}

data: {"exception_id":"HERO-1","disposition_code":"CARRIER_LIABILITY","confidence":0.92,"dollar_impact":1847.99,"drafts":{...},"completed_at":"2024-..."}

data: [DONE]
```

---

## The 5 Hero Cases

### HERO-1: Damage + Driver Fault Admission
- **Input:** Photo of damaged sofa + driver voicemail admitting fault
- **Evidence:** "took that turn too fast" in audio
- **Expected:** `CARRIER_LIABILITY` (confidence: 0.92)
- **Action:** File carrier claim, send replacement

### HERO-2a: Short-Ship (Platinum LTV)
- **Input:** Photo of partial shipment, Platinum customer
- **Expected:** `FULL_REFUND` (confidence: 0.95)
- **Action:** Full refund + expedited replacement

### HERO-2b: Short-Ship (Standard LTV)
- **Input:** Same SKU as HERO-2a, Standard customer
- **Expected:** `CREDIT_MEMO` (confidence: 0.95)
- **Action:** Issue credit to account

### HERO-3: Display Sample Mistaken for Loss
- **Input:** Photo shows total loss, BOL says "display sample, $0 salvage"
- **Expected:** `WRITE_OFF` (confidence: 0.88)
- **Action:** Write off, no carrier claim

### HERO-4: Low Confidence Carrier Dispute
- **Input:** Poor quality photo, unclear evidence
- **Expected:** `ESCALATE` (confidence: 0.45)
- **Action:** Send to Maria for manual review

### HERO-5: Missed Appointment
- **Input:** Delivery notice photo, Premium SLA customer
- **Expected:** `RESCHEDULE` (confidence: 0.96)
- **Action:** Book 4-6pm slot tomorrow, waive delivery fee

---

## Tool Sponsors

Each tool call in the SSE stream includes a `sponsor` field:

| Tool | Sponsor | API/Service |
|------|---------|-------------|
| `lookupOrder` | **Cloudflare** | D1 Database (mocked) |
| `readPhoto` | **Cloudflare** | AI Workers - @cf/llava-1.5-7b-hf |
| `transcribeAudio` | **Baseten** | Speech-to-Text (mocked) |
| `decide` | **Subconscious** | TIM-Qwen3.6-27b |
| `draftMessages` | **Subconscious** | TIM-Qwen3.6-27b |

---

## Setup & Run

### 1. Install dependencies

```bash
cd worker
pnpm install
```

### 2. Set environment variables

Create `.env.local`:

```bash
SUBCONSCIOUS_API_KEY=sky_...
```

### 3. Run dev server

```bash
pnpm dev
```

### 4. Test the agent

**Get all exceptions:**
```bash
curl http://localhost:3000/api/queue | jq
```

**Run agent on HERO-1:**
```bash
curl http://localhost:3000/api/exception/HERO-1/run
```

**Run all 5 hero cases:**
```bash
for id in HERO-1 HERO-2a HERO-2b HERO-3 HERO-4 HERO-5; do
  echo "=== Testing $id ==="
  curl http://localhost:3000/api/exception/$id/run
  echo ""
done
```

---

## Deployment (Production)

### Option 1: Cloudflare Pages (Recommended for Workers AI)

```bash
# Build Next.js app
pnpm build

# Deploy to Cloudflare Pages
npx wrangler pages deploy .next

# Bind Cloudflare AI
# In Cloudflare dashboard: Pages → Settings → Functions → AI binding
```

With Cloudflare AI binding, `readPhoto.ts` will use real vision analysis instead of mocks.

### Option 2: Vercel (Mock mode)

```bash
# Set SUBCONSCIOUS_API_KEY in Vercel dashboard
vercel deploy
```

Baseten and Cloudflare AI tools will use mock fallbacks.

---

## Decision Logic

```typescript
// Confidence threshold
if (confidence < 0.6) → disposition_code = "ESCALATE"

// LTV-based resolution
if (short_ship && ltv_band === "Platinum") → "FULL_REFUND"
if (short_ship && ltv_band === "Standard") → "CREDIT_MEMO"

// Carrier liability
if (driver_fault_admission && severe_damage) → "CARRIER_LIABILITY"

// Display samples
if (bol_contains("display sample") && salvage === 0) → "WRITE_OFF"

// Appointment issues
if (type === "missed_appointment" && sla_tier === "Premium") → "RESCHEDULE"
```

---

## Performance Metrics (Projected)

| Metric | Before FreightDesk | After FreightDesk |
|--------|-------------------|-------------------|
| Daily exceptions | 247 | 247 |
| Manual review needed | 247 (100%) | ~12 (5%) |
| Avg time per case | 5 min | 30 sec (AI) |
| Maria's daily workload | 20+ hrs | 1 hr |
| Cost per resolution | $8.33 (labor) | $0.12 (API) |

**ROI:** 98.5% cost reduction, 95% time savings

---

## Tech Stack

- **Next.js 16** - App Router, Server-Sent Events
- **TypeScript** - Strict mode
- **Cloudflare AI** - Vision model (@cf/llava-1.5-7b-hf)
- **Subconscious** - TIM-Qwen3.6-27b for decisions & drafting
- **Baseten** - Speech-to-text (future integration)

---

## Future Enhancements

1. **Real-time dashboard** - React UI showing agent progress
2. **Batch processing** - Process all 247 cases in parallel
3. **Learning loop** - Train on Maria's escalation decisions
4. **PDF OCR** - Extract BOL data from PDFs (Cloudflare AI)
5. **Carrier API integration** - Auto-file claims with FedEx/XPO
6. **Customer notification** - Auto-send emails via SendGrid

---

## License

MIT - Built for Wayfair × Subconscious Hackathon 2024

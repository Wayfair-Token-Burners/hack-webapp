export const dynamic = "force-dynamic";
export const maxDuration = 300;

const WORKER_URL = process.env.WORKER_URL || "http://localhost:3000";

type PlanStep = { kind: string; label: string; detail: string };
type Plan = { intent: string; steps: PlanStep[] };

type Emit = (obj: unknown) => void;

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    /* empty body */
  }

  const exceptionId =
    typeof body.exceptionId === "string" ? body.exceptionId : undefined;
  const question = typeof body.question === "string" ? body.question : "";
  const plan =
    body.plan && typeof body.plan === "object"
      ? (body.plan as Plan)
      : null;

  if (exceptionId) {
    return proxyWorker(exceptionId, question);
  }

  if (!plan || !Array.isArray(plan.steps)) {
    return Response.json(
      { error: "Missing plan or exceptionId" },
      { status: 400 },
    );
  }

  return placeholderRun(question, plan);
}

function proxyWorker(exceptionId: string, question: string): Response {
  const enc = new TextEncoder();
  const url = `${WORKER_URL}/api/exception/${encodeURIComponent(exceptionId)}/run`;

  const stream = new ReadableStream({
    async start(controller) {
      const emit: Emit = (obj) =>
        controller.enqueue(enc.encode(JSON.stringify(obj) + "\n"));

      emit({
        type: "info",
        text: `Proxying to worker · ${exceptionId}`,
      });

      try {
        const upstream = await fetch(url, {
          headers: { accept: "text/event-stream" },
        });
        if (!upstream.ok || !upstream.body) {
          emit({
            type: "error",
            message: `Worker returned ${upstream.status} — using fallback`,
          });
          await fallbackTrace(emit, exceptionId);
          emit({ type: "done" });
          controller.close();
          return;
        }

        const reader = upstream.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const blocks = buf.split("\n\n");
          buf = blocks.pop() ?? "";
          for (const block of blocks) {
            for (const line of block.split("\n")) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (payload === "[DONE]") {
                emit({ type: "done" });
                continue;
              }
              try {
                handleWorkerEvent(JSON.parse(payload), emit);
              } catch {
                /* malformed line — skip */
              }
            }
          }
        }
        emit({ type: "done" });
        controller.close();
      } catch (err) {
        emit({
          type: "error",
          message: `Worker unreachable (${(err as Error).message}) — using fallback`,
        });
        await fallbackTrace(emit, exceptionId);
        emit({ type: "done" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function handleWorkerEvent(evt: Record<string, unknown>, emit: Emit) {
  if (typeof evt.step === "number" && typeof evt.tool === "string") {
    const output = (evt.output ?? {}) as Record<string, unknown>;
    emit({
      type: "step",
      step: evt.step,
      tool: evt.tool,
      sponsor: typeof evt.sponsor === "string" ? evt.sponsor : "",
      label: humanizeTool(evt.tool),
      detail: shortDetail(evt.tool, output),
    });
    if (evt.tool === "draftMessages" && output) {
      emit({ type: "drafts", drafts: output });
    }
    if (evt.tool === "decide" && output) {
      const disposition =
        typeof output.disposition_code === "string"
          ? output.disposition_code
          : undefined;
      const confidence =
        typeof output.confidence === "number" ? output.confidence : undefined;
      if (disposition && typeof confidence === "number") {
        emit({
          type: "decision",
          disposition_code: disposition,
          confidence,
          reasoning:
            typeof output.reasoning === "string" ? output.reasoning : "",
        });
      }
    }
    return;
  }
  if (typeof evt.disposition_code === "string" && evt.drafts) {
    emit({ type: "drafts", drafts: evt.drafts });
    emit({
      type: "result",
      disposition_code: evt.disposition_code,
      confidence: typeof evt.confidence === "number" ? evt.confidence : 0,
      dollar_impact:
        typeof evt.dollar_impact === "number" ? evt.dollar_impact : 0,
      completed_at:
        typeof evt.completed_at === "string"
          ? evt.completed_at
          : new Date().toISOString(),
    });
    return;
  }
  if (typeof evt.error === "string") {
    emit({ type: "error", message: evt.error });
  }
}

function humanizeTool(tool: string): string {
  switch (tool) {
    case "lookupOrder":
      return "Look up order, ASN, BOL";
    case "readPhoto":
      return "Read photo evidence (vision)";
    case "transcribeAudio":
      return "Transcribe driver voicemail (ASR)";
    case "decide":
      return "Subconscious reasoning · assign disposition";
    case "draftMessages":
      return "Draft carrier / customer / AR messages";
    case "sendNotifications":
      return "Stage notifications for review";
    default:
      return tool;
  }
}

function shortDetail(tool: string, output: Record<string, unknown>): string {
  if (tool === "decide") {
    const code =
      typeof output.disposition_code === "string"
        ? output.disposition_code
        : "?";
    const conf =
      typeof output.confidence === "number" ? output.confidence : 0;
    return `${code} · confidence ${conf.toFixed(2)}`;
  }
  if (tool === "lookupOrder") {
    const order = output.order as Record<string, unknown> | undefined;
    const customer =
      order && typeof order.customer_name === "string"
        ? order.customer_name
        : "";
    const carrier =
      typeof output.carrier === "string" ? output.carrier : "";
    return [customer, carrier].filter(Boolean).join(" · ");
  }
  if (tool === "readPhoto") {
    return typeof output.summary === "string"
      ? output.summary
      : "photo analyzed";
  }
  if (tool === "transcribeAudio") {
    const t = typeof output.transcript === "string" ? output.transcript : "";
    return t ? `"${t.slice(0, 80)}${t.length > 80 ? "…" : ""}"` : "audio transcribed";
  }
  if (tool === "draftMessages") {
    return "carrier · customer · AR notes drafted";
  }
  if (tool === "sendNotifications") {
    return "queued for review";
  }
  return "";
}

async function fallbackTrace(emit: Emit, exceptionId: string) {
  const steps = [
    { tool: "lookupOrder", sponsor: "Cloudflare" },
    { tool: "readPhoto", sponsor: "Cloudflare" },
    { tool: "transcribeAudio", sponsor: "Baseten" },
    { tool: "decide", sponsor: "Subconscious" },
    { tool: "draftMessages", sponsor: "Subconscious" },
    { tool: "sendNotifications", sponsor: "Cloudflare" },
  ];
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    emit({
      type: "step",
      step: i + 1,
      tool: s.tool,
      sponsor: s.sponsor,
      label: humanizeTool(s.tool),
      detail: "placeholder — worker unreachable",
    });
    await new Promise((r) => setTimeout(r, 220));
  }
  emit({
    type: "decision",
    disposition_code: "CARRIER_LIABILITY",
    confidence: 0.92,
    reasoning: "Fallback — worker offline. Demo values shown.",
  });
  emit({
    type: "drafts",
    drafts: fallbackDrafts(exceptionId),
  });
  emit({
    type: "result",
    disposition_code: "CARRIER_LIABILITY",
    confidence: 0.92,
    dollar_impact: 1847.99,
    completed_at: new Date().toISOString(),
  });
}

function fallbackDrafts(exceptionId: string) {
  return {
    carrier_message: `Hi Carrier Ops,\n\nFiling a damage claim for ${exceptionId}. Three of four sofa frames arrived with crushed corner blocks; driver voicemail admits dock-clip at the ATL terminal. Please acknowledge and provide your claim number.\n\nThanks,\nWayfair Supply Ops`,
    customer_message: `Dear Customer,\n\nWe sincerely apologize for the damage to your order. We're pulling replacement frames from our Memphis DC tonight and hot-shotting them to your dock; ETA Wednesday EOD at no charge so your install date stays on the calendar.\n\nA carrier-liability claim has been opened using the signed BOL exception.\n\nBest,\nWayfair Freight Ops`,
    ar_note: `Carrier-liability claim opened for ${exceptionId} — $1,847.99 reserved against Carrier Atlas.`,
  };
}

function placeholderRun(question: string, plan: Plan): Response {
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit: Emit = (obj) =>
        controller.enqueue(enc.encode(JSON.stringify(obj) + "\n"));
      const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

      emit({
        type: "text",
        text: `▸ Executing plan: ${plan.intent}\n  Question: "${question}"\n  Steps: ${plan.steps.length}\n\n`,
      });
      await wait(240);

      for (let i = 0; i < plan.steps.length; i++) {
        const s = plan.steps[i];
        const ms = 280 + Math.floor(Math.random() * 380);
        emit({
          type: "text",
          text: `[${i + 1}/${plan.steps.length}] ${s.kind} · ${s.label}\n`,
        });
        await wait(ms);
        emit({
          type: "text",
          text: `    ✓ ${s.detail} (${ms} ms)\n\n`,
        });
      }

      emit({
        type: "text",
        text:
          "[placeholder] Plan executed. The Subconscious-powered agent in worker/ " +
          "would now write to D1, push outbound drafts to a review queue, " +
          "and emit an audit row. Wire this endpoint to worker/api/run to make it real.\n",
      });
      emit({ type: "done" });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

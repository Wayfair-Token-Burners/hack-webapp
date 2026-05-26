export const dynamic = "force-dynamic";

type PlanStep = { kind: string; label: string; detail: string };

function generatePlan(question: string, contextLines: string[]): {
  intent: string;
  steps: PlanStep[];
} {
  const q = (question + " " + contextLines.join(" ")).toLowerCase();
  const steps: PlanStep[] = [];
  let intent = "Investigate and respond";

  const wantsDraft = /\b(draft|reply|respond|email|send|tell|confirm|apolog|ask|acknowled|offer|propose|hot-?shot|credit|waive)\b/.test(
    q,
  );
  const wantsCatalog = /\b(lead time|stock|inventory|sku|product|catalog|spec|specification|in stock|available)\b/.test(
    q,
  );
  const wantsException = /\b(exception|ex-|freight|bol|os&d|damaged?|short|delay|missing|claim|rma|carrier)\b/.test(
    q,
  );
  const wantsCompliance = /\b(carb|cal 117|reach|rohs|compli|sds|hazmat|osha)\b/.test(
    q,
  );

  if (wantsDraft) {
    intent = "Draft customer reply";
    steps.push({
      kind: "lookup_customer",
      label: "Look up customer + open PO",
      detail: "Pull contact, contract tier, recent orders, and prior incidents from CRM",
    });
    if (/\b(replace|replacement|hot-?shot|expedite|ship|reroute)\b/.test(q)) {
      steps.push({
        kind: "search_catalog",
        label: "Confirm replacement stock at nearest DC",
        detail: "Cross-check SKU availability at CLT and RNO, reserve units",
      });
      steps.push({
        kind: "schedule_shipment",
        label: "Reserve expedite slot + carrier",
        detail: "Hold inventory and request hot-shot freight quote",
      });
    }
    if (wantsException) {
      steps.push({
        kind: "open_exception",
        label: "Open freight exception / RMA",
        detail: "Generate exception record, attach BOL + photo evidence",
      });
    }
    if (wantsCompliance) {
      steps.push({
        kind: "attach_compliance",
        label: "Attach SDS + test certificate",
        detail: "Pull current SDS, retest cert, and CARB-2 / Cal-117 docs",
      });
    }
    steps.push({
      kind: "draft_email",
      label: "Compose and stage reply email",
      detail: "Tone-matched to severity; routed to human for approval before send",
    });
  } else if (wantsCatalog) {
    intent = "Catalog / inventory lookup";
    steps.push({
      kind: "search_catalog",
      label: "Search catalog and supplier feeds",
      detail: "Match against active SKUs in this plant's contract scope",
    });
    steps.push({
      kind: "lookup_stock",
      label: "Pull stocking position from D1",
      detail: "On-hand at CLT and RNO, plus inbound container ETAs",
    });
    if (wantsCompliance) {
      steps.push({
        kind: "check_compliance",
        label: "Verify compliance documents on file",
        detail: "Confirm SDS / certifications before recommending alternatives",
      });
    }
    steps.push({
      kind: "summarize",
      label: "Summarize for buyer",
      detail: "Top 3 matches with lead time, MOQ, and price breaks",
    });
  } else if (wantsException) {
    intent = "Triage freight exception";
    steps.push({
      kind: "lookup_order",
      label: "Fetch order, ASN, and BOL",
      detail: "Pull from order system + carrier portal",
    });
    steps.push({
      kind: "read_evidence",
      label: "Read attached evidence",
      detail: "Photos (vision), driver voicemail (ASR), BOL PDF (OCR)",
    });
    steps.push({
      kind: "assign_disposition",
      label: "Assign disposition code",
      detail: "Map to CARB-2 / Cal-117 / OS&D / Damage taxonomy",
    });
    steps.push({
      kind: "draft_resolution",
      label: "Draft resolution + customer note",
      detail: "Stage 3 outbound drafts (carrier, customer, AR) for review",
    });
  } else {
    steps.push({
      kind: "classify_intent",
      label: "Classify request and pull relevant context",
      detail: "Determine which agent path applies",
    });
    steps.push({
      kind: "search_catalog",
      label: "Search related catalog entries",
      detail: "Match against this plant's contract scope",
    });
    steps.push({
      kind: "summarize",
      label: "Summarize findings with citations",
      detail: "Top results with sourced detail",
    });
  }

  return { intent, steps };
}

export async function POST(req: Request) {
  let question = "";
  let context: string[] = [];
  try {
    const body = await req.json();
    question = String(body?.question ?? "").trim();
    if (Array.isArray(body?.context)) {
      context = body.context.map((s: unknown) => String(s));
    }
  } catch {
    /* empty body */
  }
  if (!question) {
    return Response.json({ error: "Empty question" }, { status: 400 });
  }

  const plan = generatePlan(question, context);

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (obj: unknown) =>
        controller.enqueue(enc.encode(JSON.stringify(obj) + "\n"));
      const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

      await wait(180);
      emit({ type: "intent", text: plan.intent });
      for (const step of plan.steps) {
        await wait(220);
        emit({ type: "step", ...step });
      }
      await wait(120);
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

export const dynamic = "force-dynamic";

type PlanStep = { kind: string; label: string; detail: string };
type Plan = { intent: string; steps: PlanStep[] };

export async function POST(req: Request) {
  let plan: Plan | null = null;
  let question = "";
  try {
    const body = await req.json();
    question = String(body?.question ?? "");
    plan = body?.plan ?? null;
  } catch {
    /* empty body */
  }
  if (!plan || !Array.isArray(plan.steps)) {
    return Response.json({ error: "Missing plan" }, { status: 400 });
  }

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (line: string) => controller.enqueue(enc.encode(line));
      const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

      send(`▸ Executing plan: ${plan.intent}\n`);
      send(`  Question: "${question}"\n`);
      send(`  Steps: ${plan.steps.length}\n\n`);
      await wait(240);

      for (let i = 0; i < plan.steps.length; i++) {
        const s = plan.steps[i];
        const ms = 280 + Math.floor(Math.random() * 380);
        send(`[${i + 1}/${plan.steps.length}] ${s.kind} · ${s.label}\n`);
        await wait(ms);
        send(`    ✓ ${s.detail} (${ms} ms)\n\n`);
      }

      send(
        `[placeholder] Plan executed. The Subconscious-powered agent in worker/ ` +
          `would now write to D1, push outbound drafts to a review queue, ` +
          `and emit an audit row. Wire this endpoint to worker/api/run to make it real.\n`,
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

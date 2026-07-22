/**
 * Shared-secret gate for the credit-spending endpoints.
 *
 * The worker is deployed publicly, but only the FreightDesk web app's own
 * server-side proxy should be able to trigger agent runs (they call the
 * Subconscious API, which costs real credits). The proxy sends
 * `x-freightdesk-proxy: <secret>`; direct browser hits are rejected.
 *
 * When WORKER_PROXY_SECRET is unset (local dev), the gate is open.
 */
export function checkProxySecret(request: Request): Response | null {
  const expected = process.env.WORKER_PROXY_SECRET;
  if (!expected) return null;
  const got = request.headers.get("x-freightdesk-proxy");
  if (got === expected) return null;
  return Response.json(
    { error: "Forbidden — this endpoint is only reachable via the FreightDesk app" },
    { status: 403 },
  );
}

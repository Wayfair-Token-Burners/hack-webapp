/**
 * Best-effort abuse guards for the demo API routes.
 *
 * The routes proxy to a Cloudflare Worker that spends real inference credits
 * (Subconscious / Baseten), so even though no key ever reaches the browser we
 * cap what an anonymous visitor can trigger:
 *   - only allowlisted hero exception IDs can reach the worker
 *   - request bodies are size- and shape-capped
 *   - a fixed-window per-IP rate limit (in-memory, per serverless instance —
 *     not bulletproof, but it blunts naive loops and keeps costs bounded)
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

type Bucket = { count: number; windowStart: number };
const buckets = new Map<string, Bucket>();

/** Hero cases seeded in the worker's D1 database. Nothing else is proxied. */
export const ALLOWED_EXCEPTION_IDS = new Set([
  "HERO-1",
  "HERO-2a",
  "HERO-2b",
  "HERO-3",
  "HERO-4",
  "HERO-5",
]);

export const MAX_QUESTION_CHARS = 2_000;
export const MAX_CONTEXT_LINES = 20;
export const MAX_CONTEXT_LINE_CHARS = 500;
export const MAX_PLAN_STEPS = 12;

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Returns null when allowed, or a 429 Response when rate-limited. */
export function rateLimit(req: Request): Response | null {
  const ip = clientIp(req);
  const now = Date.now();

  // Opportunistic cleanup so the map can't grow unbounded.
  if (buckets.size > 10_000) {
    for (const [key, b] of buckets) {
      if (now - b.windowStart > WINDOW_MS) buckets.delete(key);
    }
  }

  const bucket = buckets.get(ip);
  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    buckets.set(ip, { count: 1, windowStart: now });
    return null;
  }
  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil(
      (bucket.windowStart + WINDOW_MS - now) / 1000,
    );
    return Response.json(
      { error: "Rate limit exceeded. This is a shared demo — slow down." },
      {
        status: 429,
        headers: { "retry-after": String(Math.max(retryAfter, 1)) },
      },
    );
  }
  return null;
}

export function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) : s;
}

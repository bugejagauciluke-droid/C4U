/**
 * In-memory rate limiter.
 * Works within a single server instance. Each cold start resets counts.
 * Good protection against bursts; not perfect for distributed/serverless.
 *
 * To upgrade to distributed rate limiting:
 * 1. npm install @upstash/ratelimit @upstash/redis
 * 2. Add UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to env
 * 3. Replace the `checkRateLimit` body with Upstash Ratelimit logic
 */

const store = new Map<string, { count: number; reset: number }>();

// Max requests per window per IP per endpoint
const LIMITS: Record<string, { max: number; windowMs: number }> = {
  support:   { max: 10, windowMs: 60_000  }, // 10/min  — public, most expensive
  companion: { max: 40, windowMs: 60_000  }, // 40/min  — authed
  challenge: { max: 5,  windowMs: 60_000  }, // 5/min
  diary:     { max: 5,  windowMs: 60_000  }, // 5/min
  goals:     { max: 5,  windowMs: 60_000  }, // 5/min
  plans:     { max: 5,  windowMs: 60_000  }, // 5/min
};

export type RateLimitEndpoint = keyof typeof LIMITS;

export function checkRateLimit(
  key: string,
  endpoint: RateLimitEndpoint,
): { ok: boolean; remaining: number; retryAfter?: number } {
  const limit = LIMITS[endpoint];
  if (!limit) return { ok: true, remaining: 999 };

  const now = Date.now();
  const storeKey = `${endpoint}:${key}`;
  const entry = store.get(storeKey);

  if (!entry || entry.reset < now) {
    store.set(storeKey, { count: 1, reset: now + limit.windowMs });
    // Prune stale entries occasionally to prevent memory leak
    if (store.size > 5000) {
      for (const [k, v] of store.entries()) {
        if (v.reset < now) store.delete(k);
      }
    }
    return { ok: true, remaining: limit.max - 1 };
  }

  entry.count++;
  if (entry.count > limit.max) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((entry.reset - now) / 1000) };
  }

  return { ok: true, remaining: limit.max - entry.count };
}

/** Extract a stable client identifier from the request */
export function getClientId(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  return ip;
}

// ── Input validation ─────────────────────────────────────────────────────────

export const MAX_LENGTHS: Record<RateLimitEndpoint, number> = {
  support:   3_000,  // ~500 words — plenty for a support session
  companion: 4_000,  // conversation can be longer
  challenge: 2_000,
  diary:     8_000,  // diary entry can be detailed
  goals:     5_000,
  plans:     3_000,
};

/** Returns an error string if the payload is invalid, null if OK */
export function validatePayload(
  body: unknown,
  endpoint: RateLimitEndpoint,
): string | null {
  if (!body || typeof body !== "object") return "Invalid request body.";
  const raw = JSON.stringify(body);
  if (raw.length > MAX_LENGTHS[endpoint] * 4) {
    return "Input too large. Please shorten your message.";
  }
  return null;
}

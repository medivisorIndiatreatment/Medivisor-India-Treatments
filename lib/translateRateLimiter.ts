// lib/translateRateLimiter.ts
//
// Global server-side rate limiter for Google Translate API calls.
//
// PREVENTS "403 User Rate Limit Exceeded"
// -----------------------------------------
// Google enforces per-minute quotas on Translation API usage. When multiple
// concurrent HTTP requests arrive at /api/translate (e.g. during SSR or page
// load with many components), each request can spawn up to MAX_CONCURRENT_BATCHES
// parallel Google API calls. Without coordination, these compound and exhaust
// the per-minute quota.
//
// This module provides a process-level rate limiter that:
//   1. Bounds the number of in-flight Google API calls (semaphore)
//   2. Enforces a minimum interval between consecutive calls (sliding window)
//
// Because Vercel/Node.js serverless functions can run multiple instances, the
// limiter is best-effort — but it still prevents the common case of parallel
// batches within a single instance overwhelming the quota.

/**
 * Sliding-window + semaphore rate limiter.
 *
 * - `maxConcurrent` bounds how many Google API calls can be in-flight at once.
 * - `minIntervalMs` ensures consecutive calls are spaced at least this far apart.
 *
 * Together these keep the request rate below Google's per-minute limits:
 *   - API key default: 600 req/min (free tier) but "User Rate Limit Exceeded"
 *     (403) fires much earlier for new/unbilled projects.
 *   - With minInterval=1000ms + maxConcurrent = 1: 1 req/s = 60 req/min → safe
 *   - Service account default: 1,200 req/min.
 *   - With minInterval=50ms + maxConcurrent = 5: ~20 req/s → safe
 */
export class TranslateRateLimiter {
  private readonly minIntervalMs: number
  private readonly maxConcurrent: number
  private lastCallTime = 0
  private activeCalls = 0

  constructor(minIntervalMs: number, maxConcurrent: number) {
    this.minIntervalMs = minIntervalMs
    this.maxConcurrent = maxConcurrent
  }

  /**
   * Acquire a slot: waits until (a) a concurrency slot is free AND
   * (b) enough time has elapsed since the last call was dispatched.
   * Call {release} in a `finally` block after the API call finishes.
   */
  async acquire(): Promise<void> {
    // --- Semaphore: bound in-flight calls ---
    while (this.activeCalls >= this.maxConcurrent) {
      await new Promise((resolve) => setTimeout(resolve, 20))
    }
    this.activeCalls++

    // --- Sliding window: minimum interval between dispatches ---
    // Reserve the slot BEFORE awaiting so that concurrent calls in the same
    // microtask batch see the updated lastCallTime and stagger properly.
    // Without this, calls launched via Promise.all would all read the same
    // lastCallTime, compute the same delay, and fire simultaneously.
    const now = Date.now()
    const minStart = this.lastCallTime + this.minIntervalMs
    const scheduledTime = Math.max(now, minStart)
    this.lastCallTime = scheduledTime

    if (scheduledTime > now) {
      const delay = scheduledTime - now
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  /** Release the concurrency slot acquired by {acquire}. */
  release(): void {
    if (this.activeCalls > 0) {
      this.activeCalls--
    }
  }

  /** Reset internal state — useful in tests to avoid cross-test interference. */
  reset(): void {
    this.lastCallTime = 0
    this.activeCalls = 0
  }
}

// -----------------------------------------------------------------------------
// Pre-configured instances
// -----------------------------------------------------------------------------
//
// For API keys (auth starts with "AIza"):
//   Google default quota: 600 req/min (free tier) but "User Rate Limit Exceeded"
//   (403) is triggered well below that when the project is new / unbilled.
//   With centralized client-side batching, we send far fewer (but larger)
//   requests — one per language switch instead of one per component.
//   Using 500 ms interval + maxConcurrent = 3 gives at most ~6 req/s =
//   ~360 req/min ceiling, well within free-tier limits even with retries.
export const apiKeyRateLimiter = new TranslateRateLimiter(500, 3)

// For service accounts (GOOGLE_APPLICATION_CREDENTIALS set):
//   Google default quota: 1,200 req/min.
//  Using 50 ms interval + maxConcurrent = 5 gives at most ~20 req/s =
//  ~1,200 req/min ceiling — still within the service-account limit.
export const serviceAccountRateLimiter = new TranslateRateLimiter(50, 5)

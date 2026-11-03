// lib/services/email-deduplicator.ts
//
// In-memory rate limiter that prevents duplicate thank-you emails from being
// sent to the same recipient within a configurable time window.
//
// This guards against:
//   - Accidental double-submits (user double-clicks the form button)
//   - Network retries that cause the server action to execute twice
//   - Any race condition where the client re-submits before a redirect fires
//
// The store is per-process. On a single-instance server (Vercel hobby / single
// Node server) this is sufficient. For multi-instance deployments it can be
// swapped for Redis or a database without changing call-sites, because every
// public function is self-contained.

const DEFAULT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

interface DedupEntry {
  email: string
  timestamp: number
}

/**
 * Normalise an email for dedup-key purposes.
 * Lower-case + trimmed so "User@Example.com" and "user@example.com" collide.
 */
function normaliseEmail(email: string): string {
  return String(email || '')
    .trim()
    .toLowerCase()
}

class EmailDeduplicator {
  private store: Map<string, DedupEntry> = new Map()
  private windowMs: number

  constructor(windowMs: number = DEFAULT_WINDOW_MS) {
    this.windowMs = windowMs
  }

  /**
   * Check whether a thank-you email may be sent to `email` right now.
   * Returns true if the email has NOT been sent within the time window.
   */
  canSend(email: string): boolean {
    const key = normaliseEmail(email)
    if (!key) return true

    const existing = this.store.get(key)
    if (existing && Date.now() - existing.timestamp < this.windowMs) {
      return false
    }
    return true
  }

  /**
   * Record that a thank-you email was sent to `email`.
   */
  markSent(email: string): void {
    const key = normaliseEmail(email)
    if (!key) return
    this.store.set(key, { email: key, timestamp: Date.now() })
  }

  /** Returns the configured window in milliseconds. */
  getWindowMs(): number {
    return this.windowMs
  }

  /**
   * Remove expired entries to prevent unbounded memory growth.
   * Called automatically inside `markSent` but exposed for manual cleanup.
   */
  purge(): void {
    const now = Date.now()
    for (const [key, entry] of this.store) {
      if (now - entry.timestamp >= this.windowMs) {
        this.store.delete(key)
      }
    }
  }

  /** Clear all entries. Primarily useful for tests. */
  clear(): void {
    this.store.clear()
  }
}

export const emailDeduplicator = new EmailDeduplicator()

export function canSendThankYouEmail(email: string, windowMs?: number): boolean {
  if (windowMs !== undefined) {
    return new EmailDeduplicator(windowMs).canSend(email)
  }
  return emailDeduplicator.canSend(email)
}

export function markThankYouEmailSent(email: string): void {
  emailDeduplicator.markSent(email)
  emailDeduplicator.purge()
}

export function resetEmailDeduplicator(): void {
  emailDeduplicator.clear()
}

export { EmailDeduplicator }

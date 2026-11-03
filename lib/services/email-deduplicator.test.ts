import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  EmailDeduplicator,
  canSendThankYouEmail,
  markThankYouEmailSent,
  resetEmailDeduplicator,
  emailDeduplicator,
} from '@/lib/services/email-deduplicator'

describe('EmailDeduplicator', () => {
  beforeEach(() => {
    resetEmailDeduplicator()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows sending when no prior email was sent', () => {
    expect(canSendThankYouEmail('user@example.com')).toBe(true)
  })

  it('blocks duplicate within the time window', () => {
    const dedup = new EmailDeduplicator(60_000)
    expect(dedup.canSend('a@b.com')).toBe(true)
    dedup.markSent('a@b.com')
    expect(dedup.canSend('a@b.com')).toBe(false)
  })

  it('allows sending again after the window expires', () => {
    const dedup = new EmailDeduplicator(60_000)

    expect(dedup.canSend('a@b.com')).toBe(true)
    dedup.markSent('a@b.com')
    expect(dedup.canSend('a@b.com')).toBe(false)

    // Advance time past the window
    vi.advanceTimersByTime(61_000)
    expect(dedup.canSend('a@b.com')).toBe(true)
  })

  it('normalizes emails to lowercase for comparison', () => {
    const dedup = new EmailDeduplicator(60_000)
    dedup.markSent('User@Example.COM')
    expect(dedup.canSend('user@example.com')).toBe(false)
  })

  it('treats different emails independently', () => {
    const dedup = new EmailDeduplicator(60_000)
    dedup.markSent('a@b.com')
    expect(dedup.canSend('a@b.com')).toBe(false)
    expect(dedup.canSend('c@d.com')).toBe(true)
  })

  it('handles empty email safely', () => {
    expect(canSendThankYouEmail('')).toBe(true)
    markThankYouEmailSent('')
    expect(canSendThankYouEmail('real@example.com')).toBe(true)
  })

  it('purge removes expired entries', () => {
    const dedup = new EmailDeduplicator(60_000)
    dedup.markSent('a@b.com')
    expect(dedup.canSend('a@b.com')).toBe(false)

    vi.advanceTimersByTime(61_000)
    dedup.purge()
    expect(dedup.canSend('a@b.com')).toBe(true)
  })

  it('clear() removes all entries', () => {
    emailDeduplicator.markSent('a@b.com')
    emailDeduplicator.markSent('c@d.com')
    expect(emailDeduplicator.canSend('a@b.com')).toBe(false)
    resetEmailDeduplicator()
    expect(emailDeduplicator.canSend('a@b.com')).toBe(true)
    expect(emailDeduplicator.canSend('c@d.com')).toBe(true)
  })
})

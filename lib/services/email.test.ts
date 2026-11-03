import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  generateThankYouEmailHtml,
  generateThankYouEmailText,
  sendThankYouEmail,
  sendContactFormEmail,
  generateContactFormEmailHtml,
  generateContactFormEmailText,
} from '@/lib/services/email'
import { resetEmailDeduplicator } from '@/lib/services/email-deduplicator'

const { __mockSend } = (await import('resend')) as any

// Mock the email-deduplicator: allow by default, but spyable
vi.mock('@/lib/services/email-deduplicator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/services/email-deduplicator')>()
  return {
    ...actual,
    canSendThankYouEmail: vi.fn(() => true),
    markThankYouEmailSent: vi.fn(),
    emailDeduplicator: actual.emailDeduplicator,
  }
})

// Mock the Resend SDK so sendViaResend can instantiate without a real API key
vi.mock('resend', () => {
  const mockSend = vi.fn().mockResolvedValue({ id: 'test-email-id' })
  return {
    Resend: class {
      emails = { send: mockSend }
    },
    // Expose mockSend for assertion in tests
    __mockSend: mockSend,
  }
})

const { canSendThankYouEmail, markThankYouEmailSent } = await import('@/lib/services/email-deduplicator')

describe('generateThankYouEmailHtml', () => {
  it('includes the user name and greeting', () => {
    const html = generateThankYouEmailHtml('Jane Doe', 'I need knee replacement')
    expect(html).toContain('Jane Doe')
    expect(html).toContain('Dear Sir/Ma\'am')
  })

  it('uses "Dear Patient" fallback when name is empty', () => {
    const html = generateThankYouEmailHtml('', 'test message')
    expect(html).toContain('Dear Patient')
  })

  it('uses "Dear Patient" fallback when name is whitespace only', () => {
    const html = generateThankYouEmailHtml('   ', 'test message')
    expect(html).toContain('Dear Patient')
  })

  it('contains Medivisor branding elements', () => {
    const html = generateThankYouEmailHtml('John', 'message')
    expect(html).toContain('Medivisor India Treatment')
    expect(html).toContain('medivisor-logo.png')
    expect(html).toContain('#23366E')
    expect(html).toContain('#29A9B9')
    expect(html).toContain('#74BF44')
  })

  it('includes user email when provided', () => {
    const html = generateThankYouEmailHtml('Jane', 'msg', 'India', 'jane@example.com')
    expect(html).toContain('jane@example.com')
    expect(html).toContain('Email Address')
  })

  it('includes country when provided', () => {
    const html = generateThankYouEmailHtml('Jane', 'msg', 'Fiji', 'jane@example.com')
    expect(html).toContain('Fiji')
    expect(html).toContain('Country')
  })

  it('includes whatsapp when provided', () => {
    const html = generateThankYouEmailHtml('Jane', 'msg', 'Fiji', 'jane@example.com', '+67912345678')
    expect(html).toContain('+67912345678')
    expect(html).toContain('WhatsApp')
  })

  it('includes the user message when provided', () => {
    const html = generateThankYouEmailHtml('Jane', 'I need heart surgery')
    expect(html).toContain('I need heart surgery')
  })

  it('omits the message section when message is empty', () => {
    const html = generateThankYouEmailHtml('Jane', '')
    expect(html).not.toContain('Your Message:')
  })

  it('escapes HTML in user name to prevent XSS', () => {
    const html = generateThankYouEmailHtml('<script>alert(1)</script>', 'msg')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('escapes HTML in user message to prevent XSS', () => {
    const html = generateThankYouEmailHtml('Jane', '<img src=x onerror=alert(1)>')
    expect(html).not.toContain('<img src=x')
    expect(html).toContain('&lt;img')
  })

  it('escapes HTML in user email to prevent XSS', () => {
    const html = generateThankYouEmailHtml('Jane', 'msg', 'India', '"><script>alert(1)</script>')
    expect(html).not.toContain('"><script>')
    expect(html).toContain('&quot;')
  })

  it('includes a mailto link when email is provided', () => {
    const html = generateThankYouEmailHtml('Jane', 'msg', 'India', 'jane@example.com')
    expect(html).toContain('mailto:jane@example.com')
  })

  it('includes a WhatsApp fallback link when email is not provided', () => {
    const html = generateThankYouEmailHtml('Jane', 'msg')
    expect(html).toContain('https://wa.me/918340780250')
  })

  it('includes current year in footer', () => {
    const html = generateThankYouEmailHtml('Jane', 'msg')
    const currentYear = new Date().getFullYear()
    expect(html).toContain(`&copy; ${currentYear} Medivisor India Treatment`)
  })

  it('includes correct DOCTYPE and HTML structure', () => {
    const html = generateThankYouEmailHtml('Jane', 'msg')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<html lang="en">')
    expect(html).toContain('</html>')
  })
})

describe('generateThankYouEmailText', () => {
  it('includes the user name and greeting', () => {
    const text = generateThankYouEmailText('Jane Doe', 'I have a question')
    expect(text).toContain('Jane Doe')
    expect(text).toContain('Dear Sir/Ma\'am')
  })

  it('uses "Dear Patient" fallback when name is empty', () => {
    const text = generateThankYouEmailText('', 'msg')
    expect(text).toContain('Dear Patient')
  })

  it('includes company name and address', () => {
    const text = generateThankYouEmailText('Jane', 'msg')
    expect(text).toContain('Medivisor India Treatment')
    expect(text).toContain('info@medivisorhealth.com')
    expect(text).toContain('+91 83682 47758')
  })

  it('includes country/email/whatsapp when provided', () => {
    const text = generateThankYouEmailText('Jane', 'msg', 'India', 'jane@example.com', '+911234567890')
    expect(text).toContain('Country: India')
    expect(text).toContain('Email: jane@example.com')
    expect(text).toContain('WhatsApp: +911234567890')
  })

  it('includes the message when provided', () => {
    const text = generateThankYouEmailText('Jane', 'I need treatment')
    expect(text).toContain('I need treatment')
  })

  it('works without optional parameters', () => {
    const text = generateThankYouEmailText('Jane', 'msg')
    expect(text).toContain('Thank You, Jane!')
    expect(text).toContain('Medivisor India Treatment')
  })
})

describe('generateContactFormEmailHtml (admin)', () => {
  it('includes admin header and form data', () => {
    const html = generateContactFormEmailHtml('Jane', 'jane@example.com', 'India', '+9112345', 'Hello')
    expect(html).toContain('New Contact Form Submission')
    expect(html).toContain('Jane')
    expect(html).toContain('jane@example.com')
    expect(html).toContain('India')
    expect(html).toContain('Hello')
  })

  it('still renders correctly (backward compat)', () => {
    const html = generateContactFormEmailHtml('Test', 'test@test.com', 'Fiji', '+679123', 'Message here')
    expect(html.length).toBeGreaterThan(100)
    expect(html).toContain('Medivisor')
  })
})

describe('generateContactFormEmailText (admin)', () => {
  it('includes all form data', () => {
    const text = generateContactFormEmailText('Jane', 'jane@example.com', 'India', '+9112345', 'Hello')
    expect(text).toContain('Jane')
    expect(text).toContain('jane@example.com')
    expect(text).toContain('India')
    expect(text).toContain('+9112345')
    expect(text).toContain('Hello')
  })
})

describe('sendThankYouEmail', () => {
  beforeEach(() => {
    resetEmailDeduplicator()
    vi.stubEnv('RESEND_API_KEY', 're_test_12345')
    vi.stubEnv('EMAIL_TO', 'info@medivisorhealth.com')
    vi.stubEnv('EMAIL_FROM', 'Medivisor India Treatment <noreply@noreply.medivisorhealth.com>')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('returns false when email is empty', async () => {
    const result = await sendThankYouEmail('Jane', '', 'message')
    expect(result).toBe(false)
  })

  it('returns false when email is whitespace only', async () => {
    const result = await sendThankYouEmail('Jane', '   ', 'message')
    expect(result).toBe(false)
  })

  it('returns false when email is invalid', async () => {
    const result = await sendThankYouEmail('Jane', 'not-an-email', 'message')
    expect(result).toBe(false)
  })

  it('returns false when email has no domain', async () => {
    const result = await sendThankYouEmail('Jane', 'jane@', 'message')
    expect(result).toBe(false)
  })

  it('returns false when deduplication blocks the send', async () => {
    ;(canSendThankYouEmail as any).mockReturnValue(false)
    const result = await sendThankYouEmail('Jane', 'jane@example.com', 'message')
    expect(result).toBe(false)
    expect(markThankYouEmailSent).not.toHaveBeenCalled()
  })

  it('sends email and returns true when all checks pass', async () => {
    ;(canSendThankYouEmail as any).mockReturnValue(true)
    const result = await sendThankYouEmail(
      'Jane Doe',
      'jane@example.com',
      'I need knee replacement',
      'India',
      '+911234567890'
    )
    expect(result).toBe(true)
    expect(markThankYouEmailSent).toHaveBeenCalledWith('jane@example.com')
  })

  it('trims the email before sending and marking dedup', async () => {
    ;(canSendThankYouEmail as any).mockReturnValue(true)
    const result = await sendThankYouEmail('Jane', '  jane@example.com  ', 'msg')
    expect(result).toBe(true)
    expect(markThankYouEmailSent).toHaveBeenCalledWith('jane@example.com')
  })

  it('passes optional params (country, whatsapp) through', async () => {
    ;(canSendThankYouEmail as any).mockReturnValue(true)
    const result = await sendThankYouEmail(
      'Jane',
      'jane@example.com',
      'I need heart surgery',
      'Fiji',
      '+67912345678'
    )
    expect(result).toBe(true)
    expect(markThankYouEmailSent).toHaveBeenCalledWith('jane@example.com')
  })

  it('handles empty name gracefully', async () => {
    ;(canSendThankYouEmail as any).mockReturnValue(true)
    const result = await sendThankYouEmail('', 'jane@example.com', 'msg')
    expect(result).toBe(true)
  })

  it('handles empty message gracefully', async () => {
    ;(canSendThankYouEmail as any).mockReturnValue(true)
    const result = await sendThankYouEmail('Jane', 'jane@example.com', '')
    expect(result).toBe(true)
  })
})

describe('from address (verified domain)', () => {
  beforeEach(() => {
    resetEmailDeduplicator()
    vi.stubEnv('RESEND_API_KEY', 're_test_12345')
    vi.stubEnv('EMAIL_TO', 'info@medivisorhealth.com')
    vi.stubEnv('EMAIL_FROM', 'Medivisor India Treatment <noreply@noreply.medivisorhealth.com>')
    vi.stubEnv('GMAIL_USER', '')
    vi.stubEnv('GMAIL_APP_PASSWORD', '')
    __mockSend.mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('thank-you email uses verified domain as from (never resend.dev)', async () => {
    ;(canSendThankYouEmail as any).mockReturnValue(true)
    await sendThankYouEmail('Jane', 'jane@example.com', 'test message')
    expect(__mockSend).toHaveBeenCalledTimes(1)
    const call = __mockSend.mock.calls[0][0]
    expect(call.from).toBe('Medivisor India Treatment <noreply@noreply.medivisorhealth.com>')
    expect(call.from).not.toContain('resend.dev')
    expect(call.from).not.toContain('onboarding@resend')
  })

  it('thank-you email is sent to the customer submitted address', async () => {
    ;(canSendThankYouEmail as any).mockReturnValue(true)
    await sendThankYouEmail('Jane', 'customer@example.com', 'test message')
    expect(__mockSend).toHaveBeenCalledTimes(1)
    const call = __mockSend.mock.calls[0][0]
    expect(call.to).toBe('customer@example.com')
  })

  it('thank-you email uses info@medivisorhealth.com as replyTo', async () => {
    ;(canSendThankYouEmail as any).mockReturnValue(true)
    await sendThankYouEmail('Jane', 'jane@example.com', 'test message')
    expect(__mockSend).toHaveBeenCalledTimes(1)
    const call = __mockSend.mock.calls[0][0]
    expect(call.replyTo).toBe('info@medivisorhealth.com')
  })

  it('test-mode API key (re_test_) does NOT fall back to onboarding@resend.dev', async () => {
    ;(canSendThankYouEmail as any).mockReturnValue(true)
    vi.stubEnv('RESEND_API_KEY', 're_test_anykey123')
    vi.stubEnv('EMAIL_FROM', 'Medivisor India Treatment <noreply@noreply.medivisorhealth.com>')
    await sendThankYouEmail('Test', 'test@example.com', 'msg')
    const call = __mockSend.mock.calls[0][0]
    expect(call.from).toContain('noreply@noreply.medivisorhealth.com')
    expect(call.from).not.toContain('resend.dev')
  })

  it('contact form email uses verified domain as from and replyTo is sender email', async () => {
    await sendContactFormEmail('Jane', 'jane@example.com', 'India', '+9112345', 'Hello')
    expect(__mockSend).toHaveBeenCalledTimes(1)
    const call = __mockSend.mock.calls[0][0]
    expect(call.from).toBe('Medivisor India Treatment <noreply@noreply.medivisorhealth.com>')
    expect(call.to).toBe('info@medivisorhealth.com')
    expect(call.replyTo).toBe('jane@example.com')
    expect(call.from).not.toContain('resend.dev')
  })

  it('falls back to default verified domain when EMAIL_FROM is unset', async () => {
    vi.stubEnv('EMAIL_FROM', '')
    ;(canSendThankYouEmail as any).mockReturnValue(true)
    await sendThankYouEmail('Jane', 'jane@example.com', 'msg')
    const call = __mockSend.mock.calls[0][0]
    expect(call.from).toBe('Medivisor India Treatment <noreply@noreply.medivisorhealth.com>')
  })
})

/**
 * Validation patterns and utilities
 */

export const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  countryCode: /^\+\d{1,4}$/,
  phone: /^\d{6,15}$/,
}

/**
 * Contact form validation
 */
export interface ContactFormData {
  name: string
  email: string
  countryName: string
  countryCode: string
  whatsapp: string
  message: string
}

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export function validateContactForm(input: any): ValidationResult<ContactFormData> {
  const name = String(input?.name ?? '').trim()
  const email = String(input?.email ?? '').trim()
  const countryName = String(input?.countryName ?? '').trim()
  const countryCode = String(input?.countryCode ?? '').trim()
  const whatsapp = String(input?.whatsapp ?? '').trim()
  const message = String(input?.message ?? '').trim()

  if (!name) return { ok: false, error: 'Please enter your name.' }
  if (!PATTERNS.email.test(email)) return { ok: false, error: 'Please enter a valid email.' }
  if (!PATTERNS.countryCode.test(countryCode))
    return { ok: false, error: 'Please enter a valid country code (e.g. +1).' }
  if (!PATTERNS.phone.test(whatsapp))
    return { ok: false, error: 'Please enter a valid WhatsApp number.' }
  if (!message) return { ok: false, error: 'Please enter a message.' }

  return { ok: true, data: { name, email, countryName, countryCode, whatsapp, message } }
}

/**
 * Convert country code + number to E.164 format
 * @example toE164('+1', '5551234567') => '+15551234567'
 */
export function toE164(countryCode: string, number: string): string {
  const cc = countryCode.startsWith('+') ? countryCode : `+${countryCode}`
  const num = number.replace(/\D/g, '')
  return `${cc}${num}`
}

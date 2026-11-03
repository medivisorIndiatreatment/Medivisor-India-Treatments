'use server'

import { NextResponse } from 'next/server'
import { wixServerClient } from '@/lib/wix'
import { sendContactFormEmail, sendThankYouEmail, isEmailServiceConfigured } from '@/lib/services/email'
import { validateContactForm, toE164 } from '@/lib/services/validation'

// POST handler for direct API calls
export async function POST(request: Request) {
  try {
    if (!isEmailServiceConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Email service not configured. Set RESEND_API_KEY or GMAIL_USER/GMAIL_APP_PASSWORD',
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const parsed = validateContactForm(body)
    if (!parsed.ok) {
      return NextResponse.json(
        { ok: false, error: parsed.error || 'Validation failed' },
        { status: 400 }
      )
    }

    const { name, email, countryName, countryCode, whatsapp, message } = parsed.data
    const fullPhone = toE164(countryCode, whatsapp)
    const collectionId =
      process.env.NEXT_PUBLIC_WIX_CONTACT_COLLECTION_ID ||
      process.env.WIX_CONTACT_COLLECTION_ID ||
      'contactForm3'

    const nowIso = new Date().toISOString()
    const payload = {
      name,
      email,
      countryName,
      countryCode,
      whatsapp,
      phone: fullPhone,
      message,
      source: 'contact-form',
      createdAt: nowIso,
      submissionTime: nowIso,
    }

    // Save to Wix CMS (non-blocking - failures are logged but do not block email delivery)
    if (wixServerClient && typeof (wixServerClient as any)?.items?.insert === 'function') {
      ;(wixServerClient as any)
        .items.insert(collectionId, payload)
        .catch((err: any) => {
          console.error('[submitContact] Wix insert failed:', err?.message)
        })
    } else {
      console.warn('[submitContact] Wix items.insert not available, skipping CMS save')
    }

    // Send admin notification email first. The thank-you email is only sent
    // after the admin email succeeds, so we never thank a user for a submission
    // that wasn't successfully delivered to our team.
    try {
      await sendContactFormEmail(name, email, countryName, fullPhone, message)
    } catch (adminError: any) {
      console.error('[submitContact] Admin notification email failed:', adminError?.message || adminError)
      return NextResponse.json(
        { ok: false, error: 'Failed to send notification email. Please try again.' },
        { status: 500 }
      )
    }

    // Send thank-you email (deduplication + email validation handled inside).
    // A thank-you failure does not block the successful submission.
    try {
      await sendThankYouEmail(name, email, message, countryName, fullPhone)
    } catch (thankYouError: any) {
      console.error('[submitContact] Thank-you email failed:', thankYouError?.message || thankYouError)
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[submitContact] Error:', {
      message: err?.message || String(err),
      code: err?.code,
    })
    return NextResponse.json(
      { ok: false, error: 'Failed to submit. Please try again.' },
      { status: 500 }
    )
  }
}

// Server action for form submissions from server components
export async function submitContact(
  input: unknown
): Promise<{ ok: boolean; error?: string }> {
  if (!isEmailServiceConfigured()) {
    return {
      ok: false,
      error:
        'Email service not configured. Set RESEND_API_KEY or GMAIL_USER/GMAIL_APP_PASSWORD',
    }
  }

  const parsed = validateContactForm(input)
  if (!parsed.ok) return { ok: false, error: parsed.error || 'Validation failed' }

  const { name, email, countryName, countryCode, whatsapp, message } = parsed.data
  const fullPhone = toE164(countryCode, whatsapp)
  const collectionId =
    process.env.NEXT_PUBLIC_WIX_CONTACT_COLLECTION_ID ||
    process.env.WIX_CONTACT_COLLECTION_ID ||
    'contactForm3'

  const nowIso = new Date().toISOString()
  const payload = {
    name,
    email,
    countryName,
    countryCode,
    whatsapp,
    phone: fullPhone,
    message,
    source: 'contact-form',
    createdAt: nowIso,
    submissionTime: nowIso,
  }

  try {
    // Save to Wix CMS (non-blocking - failures are logged but do not block email delivery)
    if (wixServerClient && typeof (wixServerClient as any)?.items?.insert === 'function') {
      ;(wixServerClient as any)
        .items.insert(collectionId, payload)
        .catch((err: any) => {
          console.error('[submitContact] Wix insert failed:', err?.message)
        })
    } else {
      console.warn('[submitContact] Wix items.insert not available, skipping CMS save')
    }

    // Send admin notification email first. The thank-you email is only sent
    // after the admin email succeeds, so we never thank a user for a submission
    // that wasn't successfully delivered to our team.
    try {
      await sendContactFormEmail(name, email, countryName, fullPhone, message)
    } catch (adminError: any) {
      console.error('[submitContact] Admin notification email failed:', adminError?.message || adminError)
      return { ok: false, error: 'Failed to send notification email. Please try again.' }
    }

    // Send thank-you email (deduplication + email validation handled inside).
    // A thank-you failure does not block the successful submission.
    try {
      await sendThankYouEmail(name, email, message, countryName, fullPhone)
    } catch (thankYouError: any) {
      console.error('[submitContact] Thank-you email failed:', thankYouError?.message || thankYouError)
    }

    return { ok: true }
  } catch (err: any) {
    console.error('[submitContact] Error:', {
      message: err?.message || String(err),
      code: err?.code,
    })
    return { ok: false, error: 'Failed to submit. Please try again.' }
  }
}

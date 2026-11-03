// lib/config/env.ts
//
// Centralized, fail-loud environment configuration.
//
// ROOT CAUSE CONTEXT
// ------------------
// Every CMS-backed API on this site depends on the Wix **visitor** OAuth client,
// which is bootstrapped from NEXT_PUBLIC_WIX_CLIENT_ID. Locally this value comes
// from `.env.local`, but Vercel does NOT load `.env.local`. It only reads
// variables configured in the Vercel project's Environment Variables (or in
// vercel.json `env`). When NEXT_PUBLIC_WIX_CLIENT_ID is missing on Vercel, the
// Wix client is created with a dummy id, every `items.query()` call fails, and
// all data APIs return empty arrays — which is exactly the "works locally,
// missing data in production" symptom.
//
// This module is the single source of truth for env access + validation so the
// failure mode is obvious instead of silent.

const WIX_CLIENT_ID =
  process.env.NEXT_PUBLIC_WIX_CLIENT_ID || process.env.WIX_CLIENT_ID || ''

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || ''
const YOUTUBE_CHANNEL_ID =
  process.env.YOUTUBE_CHANNEL_ID || 'UCXGDsVXUX2ixe6NyvijGYaw'

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY || ''
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || ''
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS || ''
const EMAIL_TO = process.env.EMAIL_TO || 'info@medivisorhealth.com'
const EMAIL_FROM =
  process.env.EMAIL_FROM || 'Medivisor India Treatment <noreply@noreply.medivisorhealth.com>'

const WIX_CONTACT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_WIX_CONTACT_COLLECTION_ID ||
  process.env.WIX_CONTACT_COLLECTION_ID ||
  'contactForm3'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://medivisorindiatreatment.com'

export const env = {
  WIX_CLIENT_ID,
  YOUTUBE_API_KEY,
  YOUTUBE_CHANNEL_ID,
  RESEND_API_KEY,
  GOOGLE_TRANSLATE_API_KEY,
  GOOGLE_CLOUD_PROJECT_ID,
  GOOGLE_APPLICATION_CREDENTIALS,
  EMAIL_TO,
  EMAIL_FROM,
  WIX_CONTACT_COLLECTION_ID,
  SITE_URL,
} as const

/** The Wix data layer can only work when a client id is present. */
export function isWixConfigured(): boolean {
  return WIX_CLIENT_ID.length > 0
}

export function isEmailConfigured(): boolean {
  return RESEND_API_KEY.length > 0
}

/**
 * Throws a clear, actionable error when the Wix client id is missing.
 * Call this at the start of any data fetch so a misconfigured deployment fails
 * loudly (500 with the variable name) instead of silently returning empty data.
 */
export function assertWixConfigured(): void {
  if (!isWixConfigured()) {
    throw new Error(
      'Wix CMS is not configured. Set NEXT_PUBLIC_WIX_CLIENT_ID (or WIX_CLIENT_ID) ' +
        'in the Vercel project Environment Variables (or vercel.json "env"). ' +
        'This variable is required for all CMS-backed APIs and pages.',
    )
  }
}

export interface EnvStatus {
  wixClientId: boolean
  youtubeApiKey: boolean
  resendApiKey: boolean
  googleTranslateApiKey: boolean
  googleTranslateProjectId: boolean
  googleApplicationCredentials: boolean
  emailTo: boolean
  contactCollectionId: boolean
  siteUrl: boolean
  /** Non-secret names of required-but-missing variables. */
  missing: string[]
}

/**
 * Non-secret presence report used by the /api/health diagnostic endpoint so a
 * developer can instantly confirm on Vercel which variables are missing.
 */
export function getEnvStatus(): EnvStatus {
  const checks: Record<string, boolean> = {
    NEXT_PUBLIC_WIX_CLIENT_ID: isWixConfigured(),
    YOUTUBE_API_KEY: YOUTUBE_API_KEY.length > 0,
    RESEND_API_KEY: RESEND_API_KEY.length > 0,
    GOOGLE_TRANSLATE_API_KEY: GOOGLE_TRANSLATE_API_KEY.length > 0,
    GOOGLE_CLOUD_PROJECT_ID: GOOGLE_CLOUD_PROJECT_ID.length > 0,
    GOOGLE_APPLICATION_CREDENTIALS: GOOGLE_APPLICATION_CREDENTIALS.length > 0,
    EMAIL_TO: EMAIL_TO.length > 0,
    WIX_CONTACT_COLLECTION_ID: WIX_CONTACT_COLLECTION_ID.length > 0,
    NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
  }
  const missing = Object.entries(checks)
    .filter(([, ok]) => !ok)
    .map(([key]) => key)
  return {
    wixClientId: checks.NEXT_PUBLIC_WIX_CLIENT_ID,
    youtubeApiKey: checks.YOUTUBE_API_KEY,
    resendApiKey: checks.RESEND_API_KEY,
    googleTranslateApiKey: checks.GOOGLE_TRANSLATE_API_KEY,
    googleTranslateProjectId: checks.GOOGLE_CLOUD_PROJECT_ID,
    googleApplicationCredentials: checks.GOOGLE_APPLICATION_CREDENTIALS,
    emailTo: checks.EMAIL_TO,
    contactCollectionId: checks.WIX_CONTACT_COLLECTION_ID,
    siteUrl: checks.NEXT_PUBLIC_SITE_URL,
    missing,
  }
}

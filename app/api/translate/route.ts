import { env } from '@/lib/config/env'
import { NextRequest, NextResponse } from 'next/server'
import {
  preprocessTexts,
  chunkTexts,
  mapResultsToOrder,
  processBatches,
} from '@/lib/translateBatching'
import { apiKeyRateLimiter, serviceAccountRateLimiter, TranslateRateLimiter } from '@/lib/translateRateLimiter'

// =============================================================================
// GOOGLE TRANSLATE API LIMITS
//   v2 REST API (API key): max 128 text segments per request
//   v3 API (service account): max 30,000 bytes total, max 1,024 chars per text
// Batching constants are imported from lib/translateBatching.
// =============================================================================

const MAX_RETRIES = 1
const BASE_RETRY_DELAY_MS = 500
const RATE_LIMIT_RETRY_DELAY_MS = 2_000
const REQUEST_TIMEOUT_MS = 10_000

const GOOGLE_TRANSLATE_API_KEY = env.GOOGLE_TRANSLATE_API_KEY
const GOOGLE_CLOUD_PROJECT_ID = env.GOOGLE_CLOUD_PROJECT_ID
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS || ''
const TRANSLATION_API_URL = 'https://translation.googleapis.com/language/translate/v2'

const isDev = process.env.NODE_ENV !== 'production'
const translationCache = new Map<string, { result: string[]; expiresAt: number }>()
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000

function getCacheKey(texts: string[], target: string, source: string | undefined): string {
  return `${target}:${source || 'en'}:${Buffer.from(JSON.stringify(texts)).toString('base64')}`
}

function getCachedResult(cacheKey: string): string[] | null {
  const cached = translationCache.get(cacheKey)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.result
  }
  if (cached) {
    translationCache.delete(cacheKey)
  }
  return null
}

function setCachedResult(cacheKey: string, result: string[]): void {
  try {
    translationCache.set(cacheKey, {
      result,
      expiresAt: Date.now() + CACHE_TTL,
    })
    if (translationCache.size > 1000) {
      const oldest = [...translationCache.entries()]
        .sort((a, b) => a[1].expiresAt - b[1].expiresAt)
      for (let i = 0; i < 200; i++) {
        translationCache.delete(oldest[i][0])
      }
    }
  } catch {
    // cache full or unavailable
  }
}

let requestCounter = 0
function getRequestId(): string {
  requestCounter++
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 6)
  return `${ts}-${rand}-${requestCounter}`
}
const log = (...args: unknown[]) => { if (isDev) console.log('[translate]', ...args) }
const logErr = (...args: unknown[]) => { if (isDev) console.error('[translate]', ...args) }

// =============================================================================
// RETRY / ERROR HELPERS
// =============================================================================

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504])
const RETRYABLE_PATTERN = /quota|rate|limit|service.*unavailable|temporarily/i

// For API keys, Google enforces a strict per-minute "User Rate Limit".
// With centralized batching on the client, API calls are already rare
// (one per language switch instead of one per component), so we can
// afford to be less conservative: 3 concurrent batches with 500 ms
// inter-batch spacing. The server-side rate limiter (apiKeyRateLimiter)
// still caps in-flight Google API calls to avoid quota exhaustion.
const API_KEY_BATCH_DELAY_MS = 500
const API_KEY_MAX_CONCURRENT_BATCHES = 3

// For service accounts the quota is higher (1 200 req/min), so we can
// keep the tighter original defaults.
const SERVICE_ACCOUNT_BATCH_DELAY_MS = 100
const SERVICE_ACCOUNT_MAX_CONCURRENT_BATCHES = 5

function isBearerToken(key: string | undefined): boolean {
  if (!key) return false
  return key.startsWith('ya29') || key.startsWith('1//')
}

function isApiKey(key: string | undefined): boolean {
  if (!key) return false
  return key.startsWith('AIza')
}

function isRetryableStatus(status: number, message: string): boolean {
  if (RETRYABLE_STATUS.has(status)) return true
  // 403 "User Rate Limit Exceeded" is a transient per-minute rate limit that
  // resets within seconds — retry with backoff instead of failing immediately
  if (status === 403 && /user rate limit exceeded/i.test(message)) return true
  // Other 403 errors (key expired, access denied, invalid key, etc.) are permanent
  if (status === 403) return false
  return RETRYABLE_PATTERN.test(message)
}

function isRateLimitError(error: any): boolean {
  if (!error) return false
  return error?.status === 403 && /user rate limit exceeded/i.test(error?.message || '')
}

function shouldRetry(error: any): boolean {
  if (!error) return false
  if (error?.message?.includes('timed out')) return true
  if (error?.status && isRetryableStatus(error.status, error.message || '')) return true
  return /network|fetch|econn|etimedout|temporarily|unavailable/i.test(
    error?.message || ''
  )
}

/**
 * Exponential backoff retry wrapper.
 *
 * Rate-limit errors (403 "User Rate Limit Exceeded") use a longer base delay
 * because the per-minute quota window may not have reset yet — short backoffs
 * like 1 s / 2 s / 4 s all land within the same window and never recover.
 * Using 10 s / 20 s / 40 s gives the window ample time to reset.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = MAX_RETRIES,
  baseDelayMs = BASE_RETRY_DELAY_MS,
  requestId?: string
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      lastError = err
      if (!shouldRetry(err) || attempt === maxRetries) {
        throw err
      }
      // Use longer backoff for rate-limit 403s
      const delayBase = isRateLimitError(err) ? RATE_LIMIT_RETRY_DELAY_MS : baseDelayMs
      const delay = delayBase * Math.pow(2, attempt) + Math.random() * 500
      log(
        `[${requestId}] Retryable error (attempt ${attempt + 1}/${maxRetries}) after ${Math.round(delay)}ms:`,
        err?.message || err
      )
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw lastError
}

// =============================================================================
// HTTP HELPERS
// =============================================================================

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      throw new Error('Translation request timed out')
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

// =============================================================================
// BATCH TRANSLATORS
// =============================================================================

/** Translate a single batch via v2 REST API (API key or bearer token). */
async function translateBatchV2(
  texts: string[],
  target: string,
  source: string | undefined,
  url: string,
  headers: Record<string, string>,
  rateLimiter: TranslateRateLimiter
): Promise<string[]> {
  const requestBody: Record<string, unknown> = {
    q: texts,
    target,
    format: 'text',
  }
  if (source) requestBody.source = source

  await rateLimiter.acquire()
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error')
      let parsed: any = {}
      try { parsed = JSON.parse(errorBody) } catch { /* ignore */ }
      const message = parsed?.error?.message || errorBody || 'Unknown error'
      const errorObj = new Error(
        `Google Translate API error: ${response.status} ${message}`
      )
      ;(errorObj as any).status = response.status
      throw errorObj
    }

    const data = await response.json()
    const translations: string[] =
      data.data?.translations?.map(
        (t: { translatedText: string }) => t.translatedText
      ) || []
    while (translations.length < texts.length) {
      translations.push('')
    }
    return translations
  } finally {
    rateLimiter.release()
  }
}

/** Translate a single batch via v3 API (service account client). */
async function translateBatchV3(
  client: any,
  texts: string[],
  target: string,
  source: string,
  rateLimiter: TranslateRateLimiter
): Promise<string[]> {
  await rateLimiter.acquire()
  try {
    const [response] = await client.translateText({
      parent: `projects/${GOOGLE_CLOUD_PROJECT_ID}`,
      contents: texts,
      mimeType: 'text/plain',
      targetLanguageCode: target,
      sourceLanguageCode: source,
    })

    const translations = (response as any).translations || []
    while (translations.length < texts.length) {
      translations.push({ translatedText: '' })
    }
    return translations.map((t: any) => t.translatedText ?? '')
  } finally {
    rateLimiter.release()
  }
}

// =============================================================================
// MAIN TRANSLATE ORCHESTRATOR
// =============================================================================

/**
 * Translate an array of texts, handling batching, deduplication, and
 * parallel processing internally. Returns results in the same order as input.
 */
async function translateAll(
  texts: string[],
  target: string,
  source: string | undefined,
  requestId?: string
): Promise<string[]> {
  const { original, unique } = preprocessTexts(texts)

  if (unique.length === 0) {
    log(`[${requestId}] No non-empty texts to translate`)
    return original
  }

  // Chunk unique texts into batches within API limits
  const batches = chunkTexts(unique)
  log(`[${requestId}] Batching:`, {
    total: texts.length,
    unique: unique.length,
    batches: batches.length,
    maxBatchSize: Math.max(...batches.map((b) => b.length)),
  })

  let uniqueResults: string[]

  if (GOOGLE_APPLICATION_CREDENTIALS) {
    // --- Service account path (v3 API) ---
    log(`[${requestId}] Using service account credentials`)
    let client: any
    try {
      const { GoogleAuth } = await import('google-auth-library')
      const { TranslationServiceClient } = await import('@google-cloud/translate')
      const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      })
      client = new TranslationServiceClient({
        projectId: GOOGLE_CLOUD_PROJECT_ID || undefined,
      })
    } catch (initError: any) {
      logErr(`[${requestId}] Failed to initialize service account client:`, initError.message, initError.code)
      throw Object.assign(
        new Error(`Translation service initialization failed: ${initError.message}`),
        { status: 500 }
      )
    }

    try {
      uniqueResults = await processBatches(
        batches,
        (batch) => retryWithBackoff(() => translateBatchV3(client, batch, target, source || 'en', serviceAccountRateLimiter), MAX_RETRIES, undefined, requestId),
        SERVICE_ACCOUNT_BATCH_DELAY_MS,
        SERVICE_ACCOUNT_MAX_CONCURRENT_BATCHES
      )
    } finally {
      await client.close?.().catch(() => {})
    }
  } else if (isBearerToken(GOOGLE_TRANSLATE_API_KEY)) {
    // --- Bearer token path (v2 REST API) ---
    log(
      `[${requestId}] WARNING: GOOGLE_TRANSLATE_API_KEY starts with "ya29" or "1//" — ` +
        'this is an OAuth bearer token, not an API key. ' +
        'Bearer tokens are not supported by the Cloud Translation REST API v2. ' +
        'Use an API key (AIza...) instead.'
    )
    const url = TRANSLATION_API_URL
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GOOGLE_TRANSLATE_API_KEY}`,
    }
    uniqueResults = await processBatches(
      batches,
      (batch) => retryWithBackoff(() => translateBatchV2(batch, target, source, url, headers, apiKeyRateLimiter), MAX_RETRIES, undefined, requestId),
      API_KEY_BATCH_DELAY_MS,
      API_KEY_MAX_CONCURRENT_BATCHES
    )
  } else if (isApiKey(GOOGLE_TRANSLATE_API_KEY)) {
    // --- API key path (v2 REST API) ---
    log(`[${requestId}] Using API key authentication`)
    const url = TRANSLATION_API_URL
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-goog-api-key': GOOGLE_TRANSLATE_API_KEY!,
    }
    uniqueResults = await processBatches(
      batches,
      (batch) => retryWithBackoff(() => translateBatchV2(batch, target, source, url, headers, apiKeyRateLimiter), MAX_RETRIES, undefined, requestId),
      API_KEY_BATCH_DELAY_MS,
      API_KEY_MAX_CONCURRENT_BATCHES
    )
  } else {
    logErr(`[${requestId}] Invalid GOOGLE_TRANSLATE_API_KEY format:`, GOOGLE_TRANSLATE_API_KEY?.substring(0, 20))
    throw Object.assign(
      new Error(
        'Invalid GOOGLE_TRANSLATE_API_KEY format. API keys must start with "AIza". ' +
          'OAuth client IDs (GOCSPX, ...) are not valid API keys.'
      ),
      { status: 500 }
    )
  }

  // Map unique results back to original order (empties, duplicates, order)
  return mapResultsToOrder(original, uniqueResults, unique)
}

// =============================================================================
// ROUTE HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  const requestId = getRequestId()
  let texts: string[] = []
  try {
    let body: any
    try {
      body = await request.json()
    } catch (jsonError) {
      logErr(`[${requestId}] Request body is not valid JSON:`, jsonError instanceof Error ? jsonError.message : String(jsonError))
      return NextResponse.json(
        { error: 'Request body must be valid JSON' },
        { status: 400 }
      )
    }
    const { q, target, source } = body

    const isArray = Array.isArray(q)
    const count = isArray ? q.length : 1
    log(`[${requestId}] Request received:`, { target, source, count, isArray })

    if (!q || !target) {
      return NextResponse.json(
        { error: 'Missing required parameters: q and target are required' },
        { status: 400 }
      )
    }

    if (typeof target !== 'string' || target.length === 0) {
      return NextResponse.json(
        { error: 'Invalid target language code' },
        { status: 400 }
      )
    }

    texts = isArray ? q : [q]

    if (target !== 'en') {
      const cacheKey = getCacheKey(texts, target, source)
      const cachedResult = getCachedResult(cacheKey)
      if (cachedResult) {
        return NextResponse.json({ translations: cachedResult, requestId, cached: true })
      }
    }

    const hasCredentials = GOOGLE_TRANSLATE_API_KEY || GOOGLE_APPLICATION_CREDENTIALS
    if (!hasCredentials) {
      logErr(
        `[${requestId}] No credentials configured: GOOGLE_TRANSLATE_API_KEY and GOOGLE_APPLICATION_CREDENTIALS are both missing`
      )
      return NextResponse.json(
        {
          error:
            'Google Translate credentials are not configured. Set GOOGLE_TRANSLATE_API_KEY ' +
            '(API key starting with AIza) or GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON).',
        },
        { status: 500 }
      )
    }

    const startTime = Date.now()
    const translations = await translateAll(texts, target, source)
    const duration = Date.now() - startTime
    log(`[${requestId}] Translation succeeded, count:`, translations.length, `duration: ${duration}ms`)

    if (target !== 'en') {
      const cacheKey = getCacheKey(texts, target, source)
      setCachedResult(cacheKey, translations)
    }

    return NextResponse.json({ translations, requestId })
  } catch (error: any) {
    const isTimeout = error?.message?.includes('timed out')
    const errStatus = error?.status
    const isRetryable = errStatus
      ? isRetryableStatus(errStatus, error.message || '')
      : isTimeout
    const isRateLimit403 =
      errStatus === 403 && /user rate limit exceeded/i.test(error?.message || '')
    logErr(`[${requestId}] Route error:`, error?.message || error)

    if (isRateLimit403 || isRetryable || isTimeout) {
      logErr(
        `[${requestId}] Returning fallback translations (original texts) due to transient error`
      )
      return NextResponse.json({
        translations: texts,
        warning:
          'Translation service rate-limited or unavailable — returned original text',
        requestId,
      })
    }

    const status =
      errStatus && errStatus < 500 ? errStatus : errStatus || 502
    return NextResponse.json(
      {
        error: error?.message || 'Translation service error',
        requestId,
      },
      { status }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

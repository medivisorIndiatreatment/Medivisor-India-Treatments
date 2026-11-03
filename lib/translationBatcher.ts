// lib/translationBatcher.ts
//
// Centralized translation batcher that accumulates requests from ALL callers
// (React hooks, DOM-based translation, HTML content translation) within a
// short time window and dispatches a SINGLE API call per target language.
//
// This eliminates the "one-by-one" behaviour where each component independently
// calls the Google Translate API. With batching, static strings, dynamic CMS
// content, HTML blocks, and DOM-managed texts are all translated together
// in one combined request.
//
// Architecture:
//   1. Callers call batchTranslate(target, texts)
//   2. Texts already in the sync cache are resolved immediately (synchronous)
//   3. Remaining texts are accumulated into a per-language batch
//   4. After BATCH_WINDOW_MS (50ms), the batch is flushed:
//      - All unique uncached texts are sent in a single API call (chunked
//        if necessary to respect Google's per-request limits)
//      - Results are written to BOTH the sync cache and localStorage
//      - Each waiting caller is resolved with translations for ONLY its texts
//   5. Concurrent callers within the same window share one API call

import type { LanguageCode } from './googleTranslate'

const BATCH_WINDOW_MS = 50
const isDev = process.env.NODE_ENV !== 'production'
const log = (...args: unknown[]) => { if (isDev) console.log('[translate-batcher]', ...args) }

interface BatchEntry {
  texts: string[]
  resolve: (result: Map<string, string>) => void
  reject: (err: any) => void
}

interface BatchGroup {
  target: LanguageCode
  texts: string[]          // unique uncached texts
  entries: BatchEntry[]    // all callers waiting for results
}

const pendingGroups = new Map<LanguageCode, BatchGroup>()
let flushTimer: ReturnType<typeof setTimeout> | null = null

// In-flight API calls per language to deduplicate calls that arrive
// after the batch window but before the previous API response returns
const inFlightFetches = new Map<LanguageCode, Promise<Map<string, string>>>()

// Import cache functions lazily to avoid circular dependency at module load
let _apiCall: ((texts: string[], target: LanguageCode) => Promise<Map<string, string>>) | null = null
let _cacheGet: ((target: LanguageCode, text: string) => string | null) | null = null
let _cacheSet: ((target: LanguageCode, translations: Map<string, string>) => void) | null = null

/**
 * Initialize the batcher with the required cache and API callbacks.
 * Called once from googleTranslate.ts during module setup.
 */
export function initBatcher(
  apiCall: (texts: string[], target: LanguageCode) => Promise<Map<string, string>>,
  cacheGet: (target: LanguageCode, text: string) => string | null,
  cacheSet: (target: LanguageCode, translations: Map<string, string>) => void
): void {
  _apiCall = apiCall
  _cacheGet = cacheGet
  _cacheSet = cacheSet
}

function requireDeps() {
  if (!_apiCall || !_cacheGet || !_cacheSet) {
    throw new Error('TranslationBatcher not initialized — call initBatcher() first')
  }
}

/**
 * Request translations for the given texts in the target language.
 *
 * - Texts already in the sync cache are resolved immediately (synchronous fast path)
 * - Remaining texts are accumulated with other concurrent requests for the
 *   same language and dispatched as a single batched API call
 * - Each caller receives a Map containing only its requested texts
 */
export function batchTranslate(
  target: LanguageCode,
  texts: string[]
): Promise<Map<string, string>> {
  requireDeps()

  if (target === 'en' || !texts.length) {
    const result = new Map<string, string>()
    for (const t of texts) result.set(t, t)
    return Promise.resolve(result)
  }

  // Pre-resolve any texts already in the cache
  const result = new Map<string, string>()
  const toFetch: string[] = []
  const seen = new Set<string>()

  for (const text of texts) {
    if (!text || !text.trim()) {
      result.set(text, text)
      continue
    }
    const cached = _cacheGet!(target, text)
    if (cached) {
      result.set(text, cached)
    } else if (!seen.has(text)) {
      seen.add(text)
      toFetch.push(text)
    }
  }

  // All texts were cached — resolve immediately
  if (toFetch.length === 0) {
    return Promise.resolve(result)
  }

  return new Promise<Map<string, string>>((resolve, reject) => {
    let group = pendingGroups.get(target)
    if (!group) {
      group = { target, texts: [], entries: [] }
      pendingGroups.set(target, group)
    }

    // Add new texts to the batch
    for (const text of toFetch) {
      if (!group.texts.includes(text)) {
        group.texts.push(text)
      }
    }

    group.entries.push({ texts: toFetch, resolve, reject })

    log(`Queued request for ${target}: ${toFetch.length} new texts (total batch: ${group.texts.length}, requesters: ${group.entries.length})`)

    scheduleFlush()
  })
}

function scheduleFlush(): void {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    flushAll().catch((err) => {
      log('Flush error:', err)
    })
  }, BATCH_WINDOW_MS)
}

/**
 * Flush all pending batches. Each language gets a single API call.
 */
async function flushAll(): Promise<void> {
  const groupsToFlush = Array.from(pendingGroups.values())
  pendingGroups.clear()

  if (groupsToFlush.length === 0) return

  log(`Flushing ${groupsToFlush.length} language batch(es):`, groupsToFlush.map((g) => `${g.target}(${g.texts.length} texts, ${g.entries.length} callers)`))

  const flushPromises: Promise<void>[] = []

  for (const group of groupsToFlush) {
    flushPromises.push(flushGroup(group))
  }

  await Promise.allSettled(flushPromises)
}

async function flushGroup(group: BatchGroup): Promise<void> {
  const { target, texts: allTexts, entries } = group

  if (allTexts.length === 0) {
    return
  }

  // If an API call is already in-flight for this language, wait for it
  // (texts from this batch may have already been fetched by the in-flight call)
  const existing = inFlightFetches.get(target)
  if (existing) {
    log(`Waiting for in-flight fetch for ${target}`)
    const inFlightMap = await existing.catch(() => null)
    // Even after waiting, some texts might be in cache now
    // Check again and only fetch what's still missing
    const stillMissing = allTexts.filter((t) => !_cacheGet!(target, t))
    if (stillMissing.length === 0) {
      resolveEntries(entries, target)
      return
    }
    // Replace allTexts with stillMissing
    group.texts = stillMissing
  }

  const apiCall = _apiCall!

  const fetchPromise = apiCall(allTexts, target).finally(() => {
    inFlightFetches.delete(target)
  })
  inFlightFetches.set(target, fetchPromise)

  try {
    const apiResult = await fetchPromise

    // Populate caches
    if (_cacheSet) {
      _cacheSet(target, apiResult)
    }

    log(`API call for ${target} returned ${apiResult.size} translations`)
    resolveEntries(entries, target)
  } catch (err) {
    log(`API call for ${target} failed, resolving with originals:`, (err as Error)?.message)
    resolveEntries(entries, target)
  }
}

/**
 * Resolve each waiting caller with translations for its own texts.
 * Reads from the sync cache (which was just populated) so concurrent
 * callers added after the API call still get their translations.
 */
function resolveEntries(entries: BatchEntry[], target: LanguageCode): void {
  for (const entry of entries) {
    const entryResult = new Map<string, string>()
    for (const text of entry.texts) {
      const cached = _cacheGet!(target, text)
      entryResult.set(text, cached || text)
    }
    entry.resolve(entryResult)
  }
}

/**
 * For testing / diagnostics: returns the number of pending batches.
 */
export function getPendingBatchCount(): number {
  return pendingGroups.size
}

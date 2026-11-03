// lib/translateBatching.ts
// Pure utility functions for batching and preprocessing text arrays
// before sending them to the Google Translate API.
//
// Google Translate API limits:
//   v2 REST API (API key): max 128 text segments per request
//   v3 API (service account): max 30,000 bytes total, max 1,024 chars per text
// These constants keep us safely under all limits.

export const MAX_TEXTS_PER_BATCH = 100
export const MAX_BYTES_PER_BATCH = 25_000
export const MAX_CONCURRENT_BATCHES = 5

// =============================================================================
// TEXT PREPROCESSING
// =============================================================================

export interface PreprocessResult {
  /** Original array with empties preserved as '' */
  original: string[]
  /** Unique non-empty texts, deduplicated, in first-seen order */
  unique: string[]
}

/**
 * Filter empty/whitespace strings and deduplicate while preserving order.
 * Returns the original array (with empties preserved as '') and the unique list.
 */
export function preprocessTexts(texts: string[]): PreprocessResult {
  const seen = new Set<string>()
  const unique: string[] = []
  const original = texts.map((t) => {
    const trimmed = (t || '').trim()
    if (!trimmed) return ''
    if (seen.has(trimmed)) return trimmed
    seen.add(trimmed)
    unique.push(trimmed)
    return trimmed
  })
  return { original, unique }
}

// =============================================================================
// BATCHING
// =============================================================================

/**
 * Split texts into batches that respect both the segment-count limit (128)
 * and the byte-size limit (25 KB) of the Google Translate API.
 *
 * - Batches never exceed `MAX_TEXTS_PER_BATCH` segments
 * - Batches never exceed `MAX_BYTES_PER_BATCH` bytes
 * - A single text exceeding the byte limit is truncated to fit and sent alone
 */
export function chunkTexts(texts: string[]): string[][] {
  if (texts.length === 0) return []

  const batches: string[][] = []
  let current: string[] = []
  let currentBytes = 0

  for (const text of texts) {
    const textBytes = Buffer.byteLength(text, 'utf8')

    // If adding this text would exceed either limit, flush the current batch
    if (
      current.length >= MAX_TEXTS_PER_BATCH ||
      (textBytes > 0 && currentBytes + textBytes > MAX_BYTES_PER_BATCH)
    ) {
      if (current.length > 0) {
        batches.push(current)
        current = []
        currentBytes = 0
      }
    }

    // If a single text exceeds the byte limit, truncate it to fit
    if (textBytes > MAX_BYTES_PER_BATCH) {
      const truncated = Buffer.from(text, 'utf8')
        .slice(0, MAX_BYTES_PER_BATCH)
        .toString('utf8')
      batches.push([truncated])
      continue
    }

    current.push(text)
    currentBytes += textBytes
  }

  if (current.length > 0) batches.push(current)
  return batches
}

// =============================================================================
// ORDER PRESERVATION
// =============================================================================

/**
 * Map unique batch results back to the original text order.
 * Returns an array where result[i] corresponds to original[i].
 *
 * - Empty strings in the original map to ''
 * - Duplicates get the same translation as their first occurrence
 * - Texts without a translation fall back to the original text
 */
export function mapResultsToOrder(
  original: string[],
  uniqueResults: string[],
  uniqueTexts: string[]
): string[] {
  const resultsMap = new Map(uniqueTexts.map((text, i) => [text, uniqueResults[i]]))
  return original.map((t) => {
    if (!t) return ''
    return resultsMap.get(t) || t
  })
}

// =============================================================================
// PARALLEL BATCH PROCESSOR
// =============================================================================

export interface BatchProcessor {
  (batch: string[]): Promise<string[]>
}

/**
 * Process batches in parallel groups of `maxConcurrent` (default
 * `MAX_CONCURRENT_BATCHES`), each batch wrapped with retry/backoff by the
 * caller.
 *
 * When `batchDelayMs` is provided, each batch within a parallel group is
 * staggered by `batchDelayMs * index` milliseconds. This spreads concurrent
 * requests to the Google Translate API over time, reducing the chance of
 * hitting the per-minute "User Rate Limit Exceeded" (403) quota.
 *
 * Returns a flat array of results in the same order as the input batches.
 */
export async function processBatches(
  batches: string[][],
  translateFn: BatchProcessor,
  batchDelayMs = 0,
  maxConcurrent = MAX_CONCURRENT_BATCHES
): Promise<string[]> {
  const results: string[] = []
  for (let i = 0; i < batches.length; i += maxConcurrent) {
    const group = batches.slice(i, i + maxConcurrent)
    const groupResults = await Promise.all(
      group.map(async (batch, idx) => {
        if (idx > 0 && batchDelayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, batchDelayMs * idx))
        }
        return translateFn(batch)
      })
    )
    for (const result of groupResults) {
      results.push(...result)
    }
  }
  return results
}

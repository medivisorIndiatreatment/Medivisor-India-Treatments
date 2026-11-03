// lib/cms/cache.ts
// Centralized caching layer for CMS data

import { unstable_cache } from 'next/cache'

// Cache configuration - optimized for production
// Shorter TTLs to free V8 heap faster under memory-constrained environments (Vercel)
export const CACHE_CONFIG = {
  // Revalidation times in seconds
  HOSPITALS: 30 * 60, // CMS content changes infrequently; avoid repeated origin calls
  TREATMENTS: 30 * 60,
  DOCTORS: 30 * 60,
  CITIES: 60 * 60,
  ACCREDITATIONS: 60 * 60,
  TECHNOLOGIES: 30 * 60,
  DEPARTMENTS: 30 * 60,

  // Static content cache (very long for rarely changing data)
  STATIC_CONTENT: 24 * 60 * 60, // 24 hours

  // Max items to fetch per query to prevent oversized responses
  // Reduced to prevent memory pressure with large datasets
  MAX_FETCH_ITEMS: 100,

  // Slug map cache - very stable, can be cached long
  SLUG_MAP: 15 * 60, // 15 minutes

  // Preload delay - wait before preloading cache on startup (ms)
  PRELOAD_DELAY: 1000,

  // Memory cache limit - prevent cache from growing too large
  // Each CMS entry is multi-MB in size; 500 entries would exceed 1GB heap
  // Reduced to 50 to stay well within Vercel's 1GB limit.
  MAX_CACHE_SIZE: 50,
} as const

// Generate optimal cache-control header for different content types
export function getCacheControl(seconds: number = CACHE_CONFIG.HOSPITALS): string {
  return `public, max-age=${seconds}, s-maxage=${seconds}, stale-while-revalidate=${5 * 60}`
}

// In-memory cache for serverless environments
interface CacheEntry<T> {
  data: T
  /** Time the value was written; used for TTL expiry. */
  timestamp: number
  /** Time the value was last read; used only for bounded LRU eviction. */
  accessedAt: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private pendingRequests = new Map<string, Promise<unknown>>()

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Keep expiry anchored to the write time. Only update recency for LRU
    // eviction; otherwise hot keys would never expire and retain large CMS
    // payloads indefinitely in a warm serverless isolate.
    entry.accessedAt = now
    return entry.data
  }

  set<T>(key: string, data: T, ttlMs: number = CACHE_CONFIG.HOSPITALS * 1000): void {
    const now = Date.now()

    // Replace existing entries in place without evicting an unrelated item.
    if (this.cache.has(key)) {
      this.cache.set(key, { data, timestamp: now, accessedAt: now, ttl: ttlMs })
      return
    }

    // Remove expired entries before evicting live data. This keeps the bounded
    // cache useful without retaining stale CMS payloads until the next request.
    for (const [cachedKey, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) this.cache.delete(cachedKey)
    }

    if (this.cache.size >= CACHE_CONFIG.MAX_CACHE_SIZE) {
      let oldestKey: string | null = null
      let oldestTime = Number.POSITIVE_INFINITY
      for (const [cachedKey, entry] of this.cache.entries()) {
        if (entry.accessedAt < oldestTime) {
          oldestTime = entry.accessedAt
          oldestKey = cachedKey
        }
      }
      if (oldestKey) this.cache.delete(oldestKey)
    }

    this.cache.set(key, { data, timestamp: now, accessedAt: now, ttl: ttlMs })
  }

  /**
   * Deduplicated request - prevents multiple concurrent requests for same data
   * This is crucial for preventing cache stampede in serverless environments
   */
  async dedupe<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const existing = this.pendingRequests.get(key)
    if (existing) return existing as Promise<T>

    const promise = factory().finally(() => {
      this.pendingRequests.delete(key)
    })
    this.pendingRequests.set(key, promise)
    return promise
  }

  /**
   * Bypass cache and fetch fresh data directly
   * Use this when real-time data is required (e.g., when tid parameter is present)
   */
  async fetchNoCache<T>(_key: string, factory: () => Promise<T>): Promise<T> {
    return factory()
  }

  /**
   * Check if cache entry exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    const now = Date.now()
    return (now - entry.timestamp) <= entry.ttl
  }

  /**
   * Get cache entry with metadata
   */
  getWithMeta<T>(key: string): { data: T | null; age: number; isStale: boolean } {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) {
      return { data: null, age: 0, isStale: true }
    }

    const now = Date.now()
    const age = now - entry.timestamp
    const isStale = age > entry.ttl

    return { data: entry.data, age, isStale }
  }

  clear(): void {
    this.cache.clear()
    this.pendingRequests.clear()
  }

  clearKey(key: string): void {
    this.cache.delete(key)
    this.pendingRequests.delete(key)
  }
}

// Global cache instance - singleton pattern for serverless environments
export const memoryCache = new MemoryCache()

// Cache tags for revalidation
export const CACHE_TAGS = {
  ALL_DATA: 'cms-all-data',
  HOSPITALS: 'cms-hospitals',
  TREATMENTS: 'cms-treatments',
  DOCTORS: 'cms-doctors',
  BRANCHES: 'cms-branches',
  CITIES: 'cms-cities',
  TECHNOLOGIES: 'cms-technologies',
} as const

/**
 * Create a cached function with Next.js unstable_cache
 * Uses optimal settings for production performance
 */
export function createCachedFetcher<T>(
  fetcher: () => Promise<T>,
  keyParts: string[],
  options: {
    revalidate?: number
    tags?: string[]
  } = {}
): () => Promise<T> {
  return unstable_cache(
    fetcher,
    keyParts,
    {
      revalidate: options.revalidate ?? CACHE_CONFIG.HOSPITALS,
      tags: options.tags ?? [CACHE_TAGS.ALL_DATA],
    }
  )
}

/**
 * Helper to create cache key from multiple parts
 */
export function createCacheKey(...parts: (string | number | undefined | null)[]): string {
  return parts.filter(Boolean).join(':')
}

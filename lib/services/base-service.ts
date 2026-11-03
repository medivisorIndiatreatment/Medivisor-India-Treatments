// lib/services/base-service.ts
// Base service utilities for consistent API patterns

import type { PaginatedResult } from '@/lib/api/pagination'

// =============================================================================
// BASE FILTER HELPERS
// =============================================================================

/** Common text matching utilities */
export const matchers = {
  /** Case-insensitive string includes match */
  includes: (value: string | null | undefined, query: string): boolean => {
    if (!value) return false
    return value.toLowerCase().includes(query.toLowerCase())
  },

  /** Case-insensitive exact match */
  equals: (value: string | null | undefined, query: string): boolean => {
    if (!value) return false
    return value.toLowerCase() === query.toLowerCase()
  },

  /** Case-insensitive array some match */
  arrayIncludes: <T>(
    array: T[] | null | undefined,
    getValue: (item: T) => string | null | undefined,
    query: string
  ): boolean => {
    if (!array || !Array.isArray(array)) return false
    return array.some((item) => getValue(item)?.toLowerCase().includes(query.toLowerCase()))
  },
}

// =============================================================================
// PAGINATION HELPERS
// =============================================================================

/** Default page sizes by entity type */
export const DEFAULT_PAGE_SIZES = {
  DOCTORS: 1000,
  TREATMENTS: 1000,
  HOSPITALS: 500,
  BRANCHES: 1000,
  DEPARTMENTS: 500,
  SPECIALISTS: 1000,
  GROUPS: 1000,
} as const

/** Default page size for popular items (smaller sets) */
export const POPULAR_PAGE_SIZE = 50

/** Create paginated result with consistent structure */
export function createPaginatedResult<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const total = items.length
  const startIndex = page * pageSize
  const endIndex = startIndex + pageSize
  const paginatedItems = items.slice(startIndex, endIndex)
  const hasMore = endIndex < total

  return {
    items: paginatedItems,
    total,
    page,
    pageSize,
    hasMore,
  }
}

// =============================================================================
// SORTING HELPERS
// =============================================================================

/** Sort direction specifiers */
export type SortDirection = 'asc' | 'desc'

/** Generic alphabetical sort */
export function sortByAlphabet<T>(
  items: T[],
  getKey: (item: T) => string | null | undefined,
  direction: SortDirection = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const aKey = getKey(a) ?? ''
    const bKey = getKey(b) ?? ''
    return direction === 'asc'
      ? aKey.localeCompare(bKey)
      : bKey.localeCompare(aKey)
  })
}

/** Sort by popular flag (popular items first) */
export function sortByPopular<T extends { popular?: boolean }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aPopular = a.popular === true ? 1 : 0
    const bPopular = b.popular === true ? 1 : 0
    return bPopular - aPopular
  })
}

// =============================================================================
// DATA EXTRACTION HELPERS
// =============================================================================

/** Extract unique values from array of objects */
export function extractUnique<T, K extends keyof T>(
  items: T[],
  key: K
): T[K][] {
  return [...new Set(items.map((item) => item[key]))]
}

/** Create a deduplicated map from an array */
export function createMapById<T extends { _id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item._id, item]))
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

/** Standard error handler for async operations */
export async function handleAsync<T>(
  operation: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(`[${context}] Error:`, error)
    if (fallback !== undefined) return fallback
    throw error
  }
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/** Check if value is a non-empty array */
export function isNonEmptyArray<T>(value: T[] | null | undefined): value is T[] {
  return Array.isArray(value) && value.length > 0
}

/** Check if string is non-empty after trim */
export function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}
// lib/api/pagination.ts
// Clean pagination utilities for API routes

// =============================================================================
// TYPES
// =============================================================================

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface FilterParams {
  q?: string
  slug?: string
  city?: string
  state?: string
  hospital?: string
  treatment?: string
  department?: string
  specialist?: string
  popular?: boolean
  sortBy?: 'popular' | 'az' | 'za' | 'default'
}

// =============================================================================
// PARSING
// =============================================================================

/** Parse pagination params from URL */
export function parsePagination(url: URL): PaginationParams {
  const page = Math.max(0, parseInt(url.searchParams.get('page') ?? '0', 10))
  const pageSize = Math.min(200, Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '50', 10)))
  
  return { page, pageSize }
}

/** Parse filter params from URL */
export function parseFilters(url: URL): FilterParams {
  return {
    q: url.searchParams.get('q')?.trim() || undefined,
    slug: url.searchParams.get('slug')?.trim() || undefined,
    city: url.searchParams.get('city')?.trim() || undefined,
    state: url.searchParams.get('state')?.trim() || undefined,
    hospital: url.searchParams.get('hospital')?.trim() || undefined,
    treatment: url.searchParams.get('treatment')?.trim() || undefined,
    department: url.searchParams.get('department')?.trim() || undefined,
    specialist: url.searchParams.get('specialist')?.trim() || undefined,
    popular: url.searchParams.get('popular') === 'true',
    sortBy: (url.searchParams.get('sortBy') as FilterParams['sortBy']) || 'default',
  }
}

// =============================================================================
// PAGINATION
// =============================================================================

/** Apply pagination to array */
export function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
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
// CACHE HEADERS
// =============================================================================

/** Standard cache headers for API responses - extended for better performance */
export const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=10800',
} as const

/** Create response headers with pagination info */
export function createResponseHeaders(result: PaginatedResult<unknown>): Record<string, string> {
  return {
    ...CACHE_HEADERS,
    'X-Has-More': String(result.hasMore),
    'X-Total-Count': String(result.total),
    'X-Page': String(result.page),
    'X-Page-Size': String(result.pageSize),
  }
}
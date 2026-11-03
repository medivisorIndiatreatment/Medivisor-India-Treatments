/**
 * Smart pagination that adapts to result set size
 * - Small results (<50): single page
 * - Medium results (50-500): small pages (20 items)
 * - Large results (500+): larger pages (100 items)
 * - Supports cursor-based pagination for better performance
 */

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  totalPages: number
  cursor?: string // For cursor-based pagination
}

/**
 * Determine optimal page size based on total results
 */
export function determineOptimalPageSize(total: number): number {
  if (total <= 50) return total // Single page
  if (total <= 500) return 20 // Small pages
  if (total <= 2000) return 50 // Medium pages
  return 100 // Large pages
}

/**
 * Create paginated result with smart sizing
 */
export function createSmartPaginatedResult<T>(
  items: T[],
  total: number,
  page: number = 0
): PaginationResult<T> {
  const pageSize = determineOptimalPageSize(total)
  const startIndex = page * pageSize
  const endIndex = startIndex + pageSize
  const paginatedItems = items.slice(startIndex, endIndex)

  return {
    items: paginatedItems,
    total,
    page,
    pageSize,
    hasMore: endIndex < total,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Cursor-based pagination for better performance on large datasets
 * Avoids offset scanning by using document IDs as cursors
 */
export interface CursorPaginationParams {
  cursor?: string
  limit: number
  direction?: 'forward' | 'backward'
}

export interface CursorPaginationResult<T> {
  items: T[]
  nextCursor?: string
  previousCursor?: string
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Generate cursor from item (use item's ID)
 */
export function generateCursor(item: any): string {
  const id = item._id || item.id
  if (!id) {
    throw new Error('Item must have _id or id field for cursor generation')
  }
  return Buffer.from(String(id)).toString('base64')
}

/**
 * Decode cursor back to ID
 */
export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64').toString('utf-8')
}

/**
 * Create cursor-based paginated result
 */
export function createCursorPaginatedResult<T extends { _id?: string; id?: string }>(
  items: T[],
  limit: number,
  hasPreviousPage: boolean = false
): CursorPaginationResult<T> {
  const hasNextPage = items.length > limit
  const displayItems = items.slice(0, limit)

  return {
    items: displayItems,
    nextCursor: hasNextPage && displayItems.length > 0 ? generateCursor(displayItems[displayItems.length - 1]) : undefined,
    previousCursor: hasPreviousPage && displayItems.length > 0 ? generateCursor(displayItems[0]) : undefined,
    hasNextPage,
    hasPreviousPage,
  }
}

/**
 * Validate and normalize pagination parameters
 */
export function normalizePaginationParams(
  page?: number | string,
  pageSize?: number | string,
  maxPageSize: number = 200
): PaginationParams {
  const parsedPage = parseInt(String(page || 0), 10)
  const parsedPageSize = parseInt(String(pageSize || 20), 10)

  return {
    page: Math.max(0, isNaN(parsedPage) ? 0 : parsedPage),
    pageSize: Math.max(1, Math.min(maxPageSize, isNaN(parsedPageSize) ? 20 : parsedPageSize)),
  }
}

/**
 * Calculate offset from page and pageSize
 */
export function calculateOffset(page: number, pageSize: number): number {
  return Math.max(0, page) * Math.max(1, pageSize)
}

/**
 * Check if item is within current page
 */
export function isInCurrentPage(
  itemIndex: number,
  page: number,
  pageSize: number
): boolean {
  const pageStart = page * pageSize
  const pageEnd = pageStart + pageSize
  return itemIndex >= pageStart && itemIndex < pageEnd
}

/**
 * Get range of indices for current page
 */
export function getPageRange(page: number, pageSize: number): [number, number] {
  const start = page * pageSize
  return [start, start + pageSize]
}

export default {
  determineOptimalPageSize,
  createSmartPaginatedResult,
  generateCursor,
  decodeCursor,
  createCursorPaginatedResult,
  normalizePaginationParams,
  calculateOffset,
  isInCurrentPage,
  getPageRange,
}

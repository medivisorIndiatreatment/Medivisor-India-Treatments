'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDataFetcher } from './useDataFetcher'

/**
 * Optimized hook for fetching paginated lists
 *
 * Usage:
 * const { items, total, page, nextPage, prevPage, ... } = useListData({
 *   resource: 'doctors',
 *   filters: { city: 'New York' },
 * })
 */

export interface ListFetcherConfig<T = any> {
  resource: string
  filters?: Record<string, any>
  page?: number
  pageSize?: number
  sortBy?: string
  enabled?: boolean
  onError?: (error: Error) => void
  onSuccess?: (data: ListResult<T>) => void
}

export interface ListResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface UseListDataReturn<T> extends ListResult<T> {
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  isRefetching: boolean
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
}

/**
 * Hook for fetching paginated list data with built-in pagination controls
 */
export function useListData<T = any>({
  resource,
  filters = {},
  page: initialPage = 0,
  pageSize = 20,
  sortBy,
  enabled = true,
  onError,
  onSuccess,
}: ListFetcherConfig<T>): UseListDataReturn<T> {
  const [page, setPage] = useState(initialPage)
  const [localPageSize, setLocalPageSize] = useState(pageSize)

  // Build URL with query parameters
  const buildUrl = useCallback(() => {
    const params = new URLSearchParams()

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params.append(key, value.join(','))
        } else {
          params.append(key, String(value))
        }
      }
    })

    params.append('page', String(page))
    params.append('pageSize', String(localPageSize))

    if (sortBy) {
      params.append('sortBy', sortBy)
    }

    return `/api/${resource}?${params.toString()}`
  }, [resource, filters, page, localPageSize, sortBy])

  // Cache key should include all parameters that affect the result
  const cacheKey = `list-${resource}-${JSON.stringify(filters)}-${page}-${localPageSize}-${sortBy || 'default'}`

  const { data, loading, error, refetch, isRefetching } = useDataFetcher<
    ListResult<T>,
    ListResult<T>
  >({
    key: cacheKey,
    url: buildUrl,
    enabled,
    cache: true,
    cacheTTL: 3 * 60 * 1000, // 3 minutes for list data
    retry: 2,
    onError,
    onSuccess,
  })

  const nextPage = useCallback(() => {
    if (data?.hasMore) {
      setPage((p) => p + 1)
    }
  }, [data?.hasMore])

  const prevPage = useCallback(() => {
    if (page > 0) {
      setPage((p) => p - 1)
    }
  }, [page])

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 0) {
      setPage(newPage)
    }
  }, [])

  return {
    items: data?.items || [],
    total: data?.total || 0,
    page,
    pageSize: localPageSize,
    hasMore: data?.hasMore || false,
    loading,
    error,
    refetch,
    isRefetching,
    nextPage,
    prevPage,
    goToPage,
  }
}

export default useListData

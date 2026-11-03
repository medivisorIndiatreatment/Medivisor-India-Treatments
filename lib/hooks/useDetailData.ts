'use client'

import { useDataFetcher } from './useDataFetcher'

/**
 * Optimized hook for fetching single items/detail pages
 *
 * Usage:
 * const { data: doctor, loading, error, refetch } = useDetailData({
 *   resource: 'doctors',
 *   id: doctorSlug,
 *   idField: 'slug',
 * })
 */

export interface DetailFetcherConfig<T = any> {
  resource: string
  id: string | number | undefined
  idField?: string
  enabled?: boolean
  onError?: (error: Error) => void
  onSuccess?: (data: T) => void
}

export interface UseDetailDataReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  isRefetching: boolean
}

/**
 * Hook for fetching detail/single item data with optimized caching
 */
export function useDetailData<T = any>({
  resource,
  id,
  idField = 'id',
  enabled = !!id,
  onError,
  onSuccess,
}: DetailFetcherConfig<T>): UseDetailDataReturn<T> {
  const buildUrl = () => {
    if (!id) return ''
    return `/api/${resource}?${idField}=${encodeURIComponent(String(id))}`
  }

  const cacheKey = `detail-${resource}-${idField}-${id}`

  const { data, loading, error, refetch, isRefetching } = useDataFetcher<T, T>({
    key: cacheKey,
    url: buildUrl,
    enabled: enabled && !!id,
    cache: true,
    cacheTTL: 10 * 60 * 1000, // 10 minutes for detail data (less frequently changes)
    retry: 3, // More retries for important detail data
    timeout: 15000,
    onError,
    onSuccess,
  })

  return {
    data,
    loading,
    error,
    refetch,
    isRefetching,
  }
}

export default useDetailData

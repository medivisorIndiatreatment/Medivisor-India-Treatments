'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { memoryCache } from '@/lib/cms/cache'

/**
 * Unified generic data fetching hook for all data operations
 * Handles loading, error, caching, and retries with minimal boilerplate
 *
 * Usage:
 * const { data, loading, error, refetch } = useDataFetcher({
 *   key: 'doctors-list',
 *   url: '/api/doctors',
 *   transform: (data) => data.items,
 * })
 */

export interface DataFetcherConfig<T, R> {
  key: string
  url: string | (() => string)
  transform?: (data: any) => R
  enabled?: boolean
  retry?: number
  retryDelay?: number
  cache?: boolean
  cacheTTL?: number
  timeout?: number
  onError?: (error: Error) => void
  onSuccess?: (data: R) => void
}

export interface DataFetcherReturn<R> {
  data: R | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  isRefetching: boolean
}

/**
 * Generic hook for fetching data with unified error handling, caching, and retries
 */
export function useDataFetcher<T = any, R = T>({
  key,
  url,
  transform,
  enabled = true,
  retry = 2,
  retryDelay = 1000,
  cache = true,
  cacheTTL = 5 * 60 * 1000, // 5 minutes default
  timeout = 30000,
  onError,
  onSuccess,
}: DataFetcherConfig<T, R>): DataFetcherReturn<R> {
  const [data, setData] = useState<R | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<Error | null>(null)
  const [isRefetching, setIsRefetching] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)
  const mountedRef = useRef(true)
  const configRef = useRef({
    url,
    transform,
    retry,
    retryDelay,
    cache,
    cacheTTL,
    timeout,
    onError,
    onSuccess,
  })
  configRef.current = {
    url,
    transform,
    retry,
    retryDelay,
    cache,
    cacheTTL,
    timeout,
    onError,
    onSuccess,
  }

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!enabled || !mountedRef.current) return

      const { url: currentUrl, transform: currentTransform, retry: currentRetry, retryDelay: currentRetryDelay, cache: currentCache, cacheTTL: currentCacheTTL, timeout: currentTimeout, onError: currentOnError, onSuccess: currentOnSuccess } = configRef.current

      const requestId = ++requestIdRef.current
      abortControllerRef.current?.abort()
      if (isRefresh) {
        setIsRefetching(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Check cache first
      if (currentCache && !isRefresh) {
        const cachedData = memoryCache.get(key)
        if (cachedData !== null) {
          const result = currentTransform ? currentTransform(cachedData) : (cachedData as R)
          if (mountedRef.current && requestId === requestIdRef.current) {
            setData(result)
            setLoading(false)
            setIsRefetching(false)
            currentOnSuccess?.(result)
          }
          return
        }
      }

      let lastError: Error | null = null
      const resolvedUrl = typeof currentUrl === 'function' ? currentUrl() : currentUrl

      const request = async () => {
        for (let attempt = 0; attempt <= currentRetry; attempt++) {
          let timeoutId: ReturnType<typeof setTimeout> | undefined
          try {
            abortControllerRef.current = new AbortController()
            timeoutId = setTimeout(() => abortControllerRef.current?.abort(), currentTimeout)
            const response = await fetch(resolvedUrl, { signal: abortControllerRef.current.signal })
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            return await response.json()
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err))
            if (attempt < currentRetry) await new Promise((resolve) => setTimeout(resolve, currentRetryDelay * Math.pow(2, attempt)))
          } finally {
            if (timeoutId) clearTimeout(timeoutId)
          }
        }
        throw lastError ?? new Error('Request failed')
      }

      try {
        const result = currentCache && !isRefresh
          ? await memoryCache.dedupe(key, request)
          : await request()
        const finalData = currentTransform ? currentTransform(result) : (result as R)

        // Manual refetches are intentionally not persisted in the shared cache;
        // otherwise a one-off refresh can overwrite the normal cache policy.
        if (currentCache && !isRefresh) memoryCache.set(key, result, currentCacheTTL)
        if (!mountedRef.current || requestId !== requestIdRef.current) return
        setData(finalData)
        setError(null)
        setLoading(false)
        setIsRefetching(false)
        currentOnSuccess?.(finalData)
        return
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        if (!mountedRef.current) return
      }

      if (lastError && mountedRef.current && requestId === requestIdRef.current) {
        setError(lastError)
        currentOnError?.(lastError)
        setLoading(false)
        setIsRefetching(false)
      }
    },
    [key, enabled]
  )

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true
    if (enabled) {
      void fetchData()
    } else {
      setLoading(false)
    }
    return () => {
      mountedRef.current = false
      requestIdRef.current += 1
      abortControllerRef.current?.abort()
    }
  }, [enabled, fetchData])

  const refetch = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  return {
    data,
    loading: loading || isRefetching,
    error,
    refetch,
    isRefetching,
  }
}

export default useDataFetcher

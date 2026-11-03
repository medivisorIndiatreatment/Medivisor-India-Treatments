'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useListData } from './useListData'

/**
 * Optimized hook for searching with debouncing and auto-pagination
 *
 * Usage:
 * const { items, query, setQuery, results, loading, ... } = useSearchData({
 *   resource: 'doctors',
 *   debounceMs: 300,
 * })
 */

export interface SearchDataConfig {
  resource: string
  debounceMs?: number
  minChars?: number
  pageSize?: number
  enabled?: boolean
  onResults?: (count: number) => void
}

export interface UseSearchDataReturn<T> {
  query: string
  setQuery: (q: string) => void
  items: T[]
  total: number
  loading: boolean
  error: Error | null
  hasMore: boolean
  nextPage: () => void
  prevPage: () => void
  clear: () => void
  refetch: () => Promise<void>
}

/**
 * Hook for search functionality with built-in debouncing
 */
export function useSearchData<T = any>({
  resource,
  debounceMs = 300,
  minChars = 1,
  pageSize = 20,
  enabled = true,
  onResults,
}: SearchDataConfig): UseSearchDataReturn<T> {
  const [query, setQueryState] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Debounce query changes
  const setQuery = useCallback(
    (q: string) => {
      setQueryState(q)

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      if (q.length >= minChars || q.length === 0) {
        debounceTimerRef.current = setTimeout(() => {
          setDebouncedQuery(q)
        }, debounceMs)
      } else {
        setDebouncedQuery('')
      }
    },
    [debounceMs, minChars]
  )

  // Fetch data when debounced query changes
  const {
    items,
    total,
    loading,
    error,
    hasMore,
    nextPage,
    prevPage,
    refetch,
  } = useListData<T>({
    resource,
    filters: debouncedQuery ? { q: debouncedQuery } : {},
    pageSize,
    enabled: enabled && !!debouncedQuery,
  })

  // Notify of results
  useEffect(() => {
    onResults?.(total)
  }, [total, onResults])

  const clear = useCallback(() => {
    setQuery('')
    setDebouncedQuery('')
  }, [setQuery])

  return {
    query,
    setQuery,
    items,
    total,
    loading,
    error,
    hasMore,
    nextPage,
    prevPage,
    clear,
    refetch,
  }
}

export default useSearchData

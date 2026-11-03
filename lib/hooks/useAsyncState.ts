'use client'

import { useState, useCallback } from 'react'

/**
 * Unified hook for managing async operation states (loading, error, success)
 * Replaces scattered useState(loading/error) patterns across components
 *
 * Usage:
 * const { isLoading, error, success, setLoading, setError, setSuccess, reset } = useAsyncState()
 *
 * // In async operations:
 * try {
 *   setLoading(true)
 *   const result = await fetchData()
 *   setSuccess()
 * } catch (err) {
 *   setError(err.message)
 * }
 */

export interface AsyncState {
  isLoading: boolean
  error: string | null
  success: boolean
}

export interface UseAsyncStateReturn extends AsyncState {
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSuccess: (success: boolean) => void
  reset: () => void
  clearError: () => void
}

/**
 * Hook to manage async operation states uniformly across components
 */
export function useAsyncState(): UseAsyncStateReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setErrorState] = useState<string | null>(null)
  const [success, setSuccessState] = useState(false)

  const setError = useCallback((err: string | null) => {
    setErrorState(err)
    if (err) {
      setSuccessState(false)
    }
  }, [])

  const setSuccess = useCallback((value: boolean) => {
    setSuccessState(value)
    if (value) {
      setErrorState(null)
    }
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  const reset = useCallback(() => {
    setIsLoading(false)
    setErrorState(null)
    setSuccessState(false)
  }, [])

  const clearError = useCallback(() => {
    setErrorState(null)
  }, [])

  return {
    isLoading,
    error,
    success,
    setLoading,
    setError,
    setSuccess,
    reset,
    clearError,
  }
}

export default useAsyncState

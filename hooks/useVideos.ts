"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Video, VideosResponse } from "@/types/video"

interface UseVideosOptions {
  maxResults?: number
}

interface UseVideosReturn {
  videos: Video[]
  loading: boolean
  loadingMore: boolean
  searchLoading: boolean
  error: string | null
  searchTerm: string
  setSearchTerm: (term: string) => void
  loadMore: () => void
  hasMore: boolean
}

const API_BASE = "/api/testimonials"

export function useVideos({ maxResults = 1000 }: UseVideosOptions = {}): UseVideosReturn {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [hasMore, setHasMore] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch videos from API
  const fetchVideos = useCallback(
    async (query = "") => {
      try {
        const params = new URLSearchParams({ maxResults: maxResults.toString() })
        if (query) params.set("q", query)

        const response = await fetch(`${API_BASE}?${params}`)
        if (!response.ok) throw new Error("Failed to fetch videos")

        const data: VideosResponse = await response.json()

        setVideos(data.videos)
        setHasMore(!!data.nextPageToken)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
        setLoadingMore(false)
        setSearchLoading(false)
      }
    },
    [maxResults]
  )

  // Initial load - fetch all videos
  useEffect(() => {
    setLoading(true)
    fetchVideos()
  }, [fetchVideos])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    searchTimeoutRef.current = setTimeout(() => {
      setSearchLoading(true)
      fetchVideos(searchTerm)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchTerm, fetchVideos])

  // Load more (kept for API compatibility but effectively a no-op since all data is fetched upfront)
  const loadMore = useCallback(() => {
    // no-op: all videos are already loaded in initial fetch
  }, [])

  return {
    videos,
    loading,
    loadingMore,
    searchLoading,
    error,
    searchTerm,
    setSearchTerm,
    loadMore,
    hasMore,
  }
}

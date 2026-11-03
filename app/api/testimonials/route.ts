import { NextResponse } from "next/server"
import type { Video, VideosResponse } from "@/types/video"
import { isYouTubeShortsUrl } from "@/lib/utils/youtube"
import { TESTIMONIAL_META } from "@/lib/data/testimonials"

// YouTube Data API v3 Configuration
const API_KEY = process.env.YOUTUBE_API_KEY
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || "UCXGDsVXUX2ixe6NyvijGYaw"
const MAX_RESULTS = 1000

// Cache for the uploads playlist ID
let cachedUploadsPlaylistId: string | null = null

// Helper: Get best thumbnail URL
const getBestThumbnail = (thumbnails: Record<string, { url?: string }>): string => {
  const sizes = ["maxres", "standard", "high", "medium", "default"]
  for (const size of sizes) {
    if (thumbnails[size]?.url) return thumbnails[size].url!
  }
  return ""
}

// Helper: Convert ISO 8601 duration to seconds
const convertDurationToSeconds = (isoDuration: string): number => {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = parseInt(match[1] || "0", 10)
  const minutes = parseInt(match[2] || "0", 10)
  const seconds = parseInt(match[3] || "0", 10)
  return hours * 3600 + minutes * 60 + seconds
}

// Helper: Get uploads playlist ID
const getUploadsPlaylistId = async (): Promise<string | null> => {
  if (cachedUploadsPlaylistId) return cachedUploadsPlaylistId

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?id=${CHANNEL_ID}&key=${API_KEY}&part=contentDetails`
    )
    const data = await response.json()

    if (data.items && data.items.length > 0) {
      cachedUploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads
      return cachedUploadsPlaylistId
    }
  } catch (error) {
    console.error("Error fetching channel details:", error)
  }
  return null
}

// Helper: Fetch playlist videos
const fetchPlaylistVideos = async (
  playlistId: string,
  maxResults: number,
  pageToken?: string
): Promise<{ items: any[]; nextPageToken: string | null }> => {
  try {
    const params = new URLSearchParams()
    if (API_KEY) params.set("key", API_KEY)
    params.set("playlistId", playlistId)
    params.set("part", "snippet")
    params.set("maxResults", maxResults.toString())
    if (pageToken) params.set("pageToken", pageToken)

    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`)
    const data = await response.json()
    return {
      items: data.items || [],
      nextPageToken: data.nextPageToken || null,
    }
  } catch (error) {
    console.error("Error fetching playlist videos:", error)
    return { items: [], nextPageToken: null }
  }
}

// Helper: Fetch video details
const fetchVideoDetails = async (videoIds: string): Promise<any[]> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=contentDetails,statistics,player`
    )
    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error("Error fetching video details:", error)
    return []
  }
}

// Helper: Filter out Shorts
const filterOutShorts = (videos: any[], videoDetails: any[]): Video[] => {
  return videos
    .map((item, index) => {
      const snippet = item.snippet
      const details = videoDetails[index]
      const contentDetails = details?.contentDetails || {}
      const statistics = details?.statistics || {}
      const player = details?.player || {}
      const duration = contentDetails.duration
      const title = snippet.title

      const embedHtml = player.embedHtml || ""

      if (isYouTubeShortsUrl(embedHtml)) return null

      if (duration) {
        const totalSeconds = convertDurationToSeconds(duration)
        if (totalSeconds < 60) return null
      }

      const titleLower = title.toLowerCase()
      if (titleLower.includes("#shorts") || titleLower.includes("shorts")) return null

      return {
        videoId: snippet.resourceId.videoId,
        title: snippet.title,
        description: snippet.description || "",
        thumbnail: getBestThumbnail(snippet.thumbnails),
        publishedAt: snippet.publishedAt,
        viewCount: statistics.viewCount || "0",
        duration: contentDetails.duration || "PT0S",
        channelTitle: snippet.channelTitle || "",
      }
    })
    .filter((video): video is Video => video !== null)
}

// Helper: Fetch videos with pagination up to maxResults total items
const fetchVideosPaginated = async (
  maxResults: number,
  pageToken?: string
): Promise<Video[]> => {
  const playlistId = await getUploadsPlaylistId()
  if (!playlistId) return []

  const pageSize = Math.min(maxResults, 50)
  const { items: playlistItems, nextPageToken } = await fetchPlaylistVideos(
    playlistId,
    pageSize,
    pageToken
  )

  if (playlistItems.length === 0) return []

  const videoIds = playlistItems.map((item) => item.snippet.resourceId.videoId).join(",")
  const videoDetails = await fetchVideoDetails(videoIds)
  const filteredVideos = filterOutShorts(playlistItems, videoDetails)

  if (!nextPageToken || filteredVideos.length >= maxResults) {
    return filteredVideos.slice(0, maxResults)
  }

  const remaining = await fetchVideosPaginated(maxResults - filteredVideos.length, nextPageToken)
  return [...filteredVideos, ...remaining]
}

// Helper: Build fallback videos from CMS testimonials data when YouTube API returns nothing
const buildFallbackVideos = (): Video[] => {
  return Object.entries(TESTIMONIAL_META)
    .map(([videoId, meta]): Video => ({
      videoId,
      title: meta.patientName,
      description: meta.testimonial,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      publishedAt: "2024-01-01T00:00:00Z",
      viewCount: "0",
      duration: "PT2M",
      channelTitle: `${meta.treatment} - ${meta.hospital}`,
    }))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

// GET: Fetch videos from YouTube channel
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || ""
  const pageToken = searchParams.get("pageToken") || undefined
  const maxResults = parseInt(searchParams.get("maxResults") || String(MAX_RESULTS), 10)

  try {
    const apiVideos = await fetchVideosPaginated(maxResults, pageToken)
    let videos = apiVideos.length > 0 ? apiVideos : buildFallbackVideos()

    if (query) {
      const queryLower = query.toLowerCase()
      videos = videos.filter(
        (video) =>
          video.title.toLowerCase().includes(queryLower) ||
          video.description.toLowerCase().includes(queryLower)
      )
    }

    const response: VideosResponse = {
      videos,
      nextPageToken: null,
    }

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    const fallbackVideos = buildFallbackVideos()

    const response: VideosResponse = {
      videos: fallbackVideos,
      nextPageToken: null,
    }

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
      },
    })
  }
}

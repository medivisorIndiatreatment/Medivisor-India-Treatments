export function extractYouTubeId(input: string | undefined): string | null {
  if (!input) return null

  const trimmed = input.trim()

  if (/^[\w-]{11}$/.test(trimmed)) return trimmed

  const regExp =
    /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|shorts\/|)([\w-]{11})(?:\S+)?$/

  const match = trimmed.match(regExp)
  if (match?.[1]?.length === 11) return match[1]

  return null
}

export function isYouTubeShortsUrl(input: string): boolean {
  if (!input) return false
  return /youtube\.com\/shorts\//i.test(input) || input.includes("/shorts/")
}

export function isStandardYouTubeUrl(input: string): boolean {
  if (!input) return false
  const trimmed = input.trim()
  return (
    /youtube\.com\/watch\?v=/i.test(trimmed) ||
    /youtu\.be\//i.test(trimmed) ||
    /youtube\.com\/embed\//i.test(trimmed)
  )
}

export function isValidStandardYouTubeVideo(input: string): boolean {
  if (!input) return false
  const trimmed = input.trim()

  if (isYouTubeShortsUrl(trimmed)) return false
  if (/^[\w-]{11}$/.test(trimmed)) return true
  return isStandardYouTubeUrl(trimmed)
}

export function getYouTubeEmbedUrl(videoId: string, params?: Record<string, string>): string | null {
  if (!videoId) return null
  const query = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    controls: "1",
    playsinline: "1",
    ...params,
  })
  return `https://www.youtube.com/embed/${videoId}?${query.toString()}`
}

export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: "default" | "mqdefault" | "hqdefault" | "sddefault" | "maxresdefault" = "hqdefault"
): string | null {
  if (!videoId) return null
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

export function hasValidYouTubeId(input: string): boolean {
  return extractYouTubeId(input) !== null
}

export function convertDurationToSeconds(isoDuration: string): number {
  if (!isoDuration) return 0
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = parseInt(match[1] || "0", 10)
  const minutes = parseInt(match[2] || "0", 10)
  const seconds = parseInt(match[3] || "0", 10)
  return hours * 3600 + minutes * 60 + seconds
}

export function isShortDuration(isoDuration: string): boolean {
  if (!isoDuration) return false
  return convertDurationToSeconds(isoDuration) < 60
}

export function parseDuration(isoDuration: string): string {
  if (!isoDuration) return "0:00"
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  if (!match) return "0:00"

  const hours = parseInt(match[1]?.replace("H", "") || "0")
  const minutes = parseInt(match[2]?.replace("M", "") || "0")
  const seconds = parseInt(match[3]?.replace("S", "") || "0")

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

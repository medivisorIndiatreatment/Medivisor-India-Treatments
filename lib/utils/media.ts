import { media } from "@wix/sdk"

export function getWixImageUrl(wixUrl: string | undefined): string | null {
  if (!wixUrl) return null
  try {
    if (wixUrl.startsWith("wix:image://")) {
      return media.getImageUrl(wixUrl).url
    } else if (wixUrl.startsWith("http")) {
      return wixUrl
    }
    return null
  } catch {
    return null
  }
}

export function resolveImageUrl(imageRef: string | undefined | null): string {
  if (!imageRef) return "/placeholder.svg"
  return getWixImageUrl(imageRef) || imageRef
}

export function getYouTubeThumbnailUrl(youtubeUrl: string | undefined): string | null {
  if (!youtubeUrl) return null
  const match = youtubeUrl.match(
    /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?$/
  )
  if (match?.[1]?.length === 11) {
    return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`
  }
  return null
}

export function getYouTubeEmbedUrl(youtubeUrl: string | undefined): string | null {
  if (!youtubeUrl) return null
  const match = youtubeUrl.match(
    /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?$/
  )
  if (match?.[1]?.length === 11) {
    return `https://www.youtube.com/embed/${match[1]}`
  }
  return null
}

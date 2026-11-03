export interface Post {
  _id: string
  title: string
  slug: string
  firstPublishedDate?: string
  url?: {
    base: string
    path: string
  }
  media?: {
    wixMedia?: {
      image?: string
      video?: string
    }
    embedMedia?: {
      thumbnail?: {
        url: string
        width?: number
        height?: number
      }
      video?: {
        url: string
        width?: number
        height?: number
      }
    }
    displayed?: boolean
    custom?: boolean
  }
  coverMedia?: {
    image?: string
  }
  blurDataUrl?: string
  excerpt?: string
  content?: string
  readTime?: string
}

export function calculateReadTime(
  text: string | undefined,
  options?: { oneMin?: string; minRead?: string }
): string {
  if (!text) return options?.oneMin || "1 min read"
  const wordsPerMinute = 200
  const plainText = text.replace(/<[^>]*>/g, "")
  const wordCount = plainText.split(/\s+/).filter((word) => word.length > 0).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  const oneMin = options?.oneMin || "1 min read"
  const minRead = options?.minRead || "min read"
  return minutes === 0 ? oneMin : `${minutes} ${minRead}`
}

import { media } from "@wix/sdk"

// Cache for frequently accessed image URLs
const imageUrlCache = new Map<string, string>()
const CACHE_MAX_SIZE = 500 // Increased cache size for better performance

/**
 * Converts a Wix media URL to a public CDN URL
 * Handles null/undefined gracefully to prevent errors
 */
export function getWixImageUrl(wixUrl: string | undefined | null): string | null {
  if (!wixUrl || typeof wixUrl !== 'string') {
    return null
  }
  
  if (wixUrl.startsWith('http://') || wixUrl.startsWith('https://')) {
    return wixUrl
  }
  
  if (!wixUrl.startsWith("wix:image://")) {
    return null
  }
  
  // Check cache first
  const cached = imageUrlCache.get(wixUrl)
  if (cached) return cached
  
  try {
    const result = media.getImageUrl(wixUrl)
    const url = result?.url
    
    if (!url || typeof url !== 'string') {
      return null
    }
    
    // Validate the URL has a proper hostname and https protocol
    try {
      const urlObj = new URL(url)
      if (!urlObj.hostname || urlObj.hostname === '' || (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:')) {
        return null
      }
    } catch {
      return null
    }
    
    // Cache the result with LRU eviction
    if (imageUrlCache.size >= CACHE_MAX_SIZE) {
      const firstKey = imageUrlCache.keys().next().value
      if (firstKey) imageUrlCache.delete(firstKey)
    }
    imageUrlCache.set(wixUrl, url)
    
    return url
  } catch (error) {
    console.warn(`Error getting Wix image URL: ${error}`)
    return null
  }
}

/**
 * Gets a Wix image URL scaled to fill dimensions
 * Handles null/undefined gracefully to prevent errors
 */
export function getWixScaledToFillImageUrl(
  wixUrl: string | undefined | null, 
  width: number, 
  height: number
): string | null {
  if (!wixUrl || typeof wixUrl !== 'string' || !wixUrl.startsWith("wix:image://")) {
    return null
  }

  const cacheKey = `${wixUrl}:${width}:${height}:fill`
  const cached = imageUrlCache.get(cacheKey)
  if (cached) return cached

  try {
    const url = media.getScaledToFillImageUrl(wixUrl, width, height, {
      quality: 85,
      autoEncode: true,
    })
    
    if (!url || typeof url !== 'string') {
      return null
    }
    
    // Validate the URL has a proper hostname and https protocol
    try {
      const urlObj = new URL(url)
      if (!urlObj.hostname || urlObj.hostname === '' || (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:')) {
        return null
      }
    } catch {
      return null
    }
    
    if (imageUrlCache.size >= CACHE_MAX_SIZE) {
      const firstKey = imageUrlCache.keys().next().value
      if (firstKey) imageUrlCache.delete(firstKey)
    }
    imageUrlCache.set(cacheKey, url)
    
    return url
  } catch (error) {
    console.warn(`Error getting scaled Wix image URL: ${error}`)
    return null
  }
}

/**
 * Gets a Wix image URL scaled to fit dimensions
 * Handles null/undefined gracefully to prevent errors
 */
export function getWixScaledToFitImageUrl(
  wixUrl: string | undefined | null, 
  width: number, 
  height: number
): string | null {
  if (!wixUrl || typeof wixUrl !== 'string' || !wixUrl.startsWith("wix:image://")) {
    return null
  }

  const cacheKey = `${wixUrl}:${width}:${height}:fit`
  const cached = imageUrlCache.get(cacheKey)
  if (cached) return cached

  try {
    const url = media.getScaledToFitImageUrl(wixUrl, width, height, {
      quality: 90,
      autoEncode: true,
    })
    
    if (!url || typeof url !== 'string') {
      return getWixImageUrl(wixUrl)
    }
    
    // Validate the URL has a proper hostname and https protocol
    try {
      const urlObj = new URL(url)
      if (!urlObj.hostname || urlObj.hostname === '' || (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:')) {
        return getWixImageUrl(wixUrl)
      }
    } catch {
      return getWixImageUrl(wixUrl)
    }
    
    if (imageUrlCache.size >= CACHE_MAX_SIZE) {
      const firstKey = imageUrlCache.keys().next().value
      if (firstKey) imageUrlCache.delete(firstKey)
    }
    imageUrlCache.set(cacheKey, url)
    
    return url
  } catch (error) {
    console.warn(`Error getting scaled-to-fit Wix image URL: ${error}`)
    return getWixImageUrl(wixUrl)
  }
}

/**
 * Gets the thumbnail URL for a Wix video
 */
export function getWixVideoThumbnailUrl(wixUrl: string | undefined): string | null {
  if (!wixUrl || !wixUrl.startsWith("wix:video://")) {
    return null
  }
  try {
    const result = media.getVideoUrl(wixUrl)
    return result.thumbnail
  } catch {
    return null
  }
}

/**
 * Alias for getWixVideoThumbnailUrl
 */
export const getWixVideoUrl = getWixVideoThumbnailUrl

/**
 * Determines the best cover image URL from a moment object
 */
export function getBestCoverImage(moment: unknown): string | null {
  // Handle string input directly
  if (typeof moment === 'string' && moment.startsWith("wix:image://")) {
    return getWixScaledToFillImageUrl(moment, 2000, 1500)
  }
  
  // Handle null/undefined
  if (!moment) return null
  
  // Ensure we have an object
  const obj = moment as Record<string, unknown>
  
  // Priority order for image fields
  const imageFields = [
    { key: 'coverMedia', subKey: 'image' },
    { key: 'coverPhoto' },
    { key: 'image' },
    { key: 'photo' },
    { key: 'mainImage' },
    { key: 'featuredImage' },
    { key: 'coverImage' },
    { key: 'heroImage' },
    { key: 'primaryImage' },
    { key: 'Image' },  // CSV column name
  ]

  // Check direct fields first
  for (const field of imageFields) {
    const value = obj[field.key]
    if (!value) continue

    let imageUrl: string | null = null
    
    if (typeof value === 'string' && value.startsWith("wix:image://")) {
      imageUrl = value
    } else if (value && typeof value === 'object') {
      const nestedObj = value as Record<string, unknown>
      if (field.subKey) {
        imageUrl = (nestedObj[field.subKey] as string) ?? null
      } else {
        imageUrl = (nestedObj.url as string) ?? (nestedObj.src as string) ?? null
      }
    }

    if (imageUrl && imageUrl.startsWith("wix:image://")) {
      const result = getWixScaledToFillImageUrl(imageUrl, 2000, 1500)
      if (result) return result
    }
  }

  // Try media gallery
  const gallery = obj.mediagallery || obj["Media Gallery"]
  if (Array.isArray(gallery) && gallery.length > 0) {
    const firstImage = gallery.find((media: Record<string, unknown>) => {
      const src = media.src as string | undefined
      return src && src.startsWith("wix:image://")
    })
    if (firstImage) {
      const result = getWixScaledToFillImageUrl(firstImage.src as string, 2000, 1500)
      if (result) return result
    }
  }

  return null
}

/**
 * Clear the image URL cache (useful for testing)
 */
export function clearImageCache(): void {
  imageUrlCache.clear()
}

/**
 * Process an image URL for use in metadata (Open Graph, Twitter cards)
 * Handles Wix media URLs, regular URLs, and relative paths
 * Returns a properly formatted absolute URL suitable for meta tags
 *
 * @param imageUrl - The input image URL (Wix, HTTP, or relative)
 * @param siteUrl - Base site URL for resolving relative paths
 * @param allowFallback - Whether to fall back to the site logo. Default is false
 *   to help callers distinguish "no image" from "logo".
 */
export function processImageForMetadata(
  imageUrl: string | null | undefined,
  siteUrl: string = 'https://medivisorindiatreatment.com',
  allowFallback: boolean = false
): string {
  // Return empty string if no image (don't use logo as fallback by default)
  if (!imageUrl) {
    if (allowFallback) {
      return `${siteUrl}/logo_medivisor.png`
    }
    return ''
  }

  // Already a full URL (not Wix format)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // If it's already a proper CDN URL, return as-is
    if (!imageUrl.includes('wix:image://')) {
      return imageUrl
    }
    // If it's a Wix URL with full domain, try to convert it
    // Extract the Wix part from URLs like: https://medivisorindiatreatment.com/wix:image://...
    const wixMatch = imageUrl.match(/wix:image:\/\/[^#?]+/)
    if (wixMatch) {
      const converted = getWixImageUrl(wixMatch[0])
      if (converted) return converted
    }
    return allowFallback ? `${siteUrl}/logo_medivisor.png` : ''
  }

  // Handle Wix media URLs (wix:image://...)
  if (imageUrl.startsWith('wix:image://')) {
    const converted = getWixImageUrl(imageUrl)
    if (converted) return converted
    // Fallback: return empty or default logo based on allowFallback
    return allowFallback ? `${siteUrl}/logo_medivisor.png` : ''
  }

  // Handle relative URLs (e.g., /images/logo.png)
  if (imageUrl.startsWith('/')) {
    return `${siteUrl}${imageUrl}`
  }

  // Unknown format, treat as relative path
  return `${siteUrl}/${imageUrl}`
}

/**
 * Process image for Open Graph (1200x630 recommended)
 */
export function processImageForOG(
  imageUrl: string | null | undefined,
  siteUrl: string = 'https://medivisorindiatreatment.com'
): string {
  return processImageForMetadata(imageUrl, siteUrl)
}

/**
 * Process image for Twitter cards (minimum 280x150)
 */
export function processImageForTwitter(
  imageUrl: string | null | undefined,
  siteUrl: string = 'https://medivisorindiatreatment.com'
): string {
  return processImageForMetadata(imageUrl, siteUrl)
}

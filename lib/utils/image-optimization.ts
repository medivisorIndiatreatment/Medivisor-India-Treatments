/**
 * Image optimization utilities for Next.js Image component and metadata
 * Ensures optimal loading, format, and size for performance
 */

export interface OptimizedImageOptions {
  width?: number
  height?: number
  quality?: number
  priority?: boolean
  placeholder?: 'blur' | 'empty'
}

/**
 * Get optimized Next.js Image props
 * Use this for consistent image loading across the app
 */
export function getOptimizedImageProps(
  src: string | null | undefined,
  alt: string,
  options: OptimizedImageOptions = {}
) {
  const {
    width = 800,
    height = 600,
    quality = 75,
    priority = false,
    placeholder = 'blur',
  } = options

  if (!src) {
    return null
  }

  return {
    src,
    alt,
    width,
    height,
    quality,
    priority,
    placeholder,
  }
}

/**
 * Generate srcSet for responsive images
 * Used in img tag for better browser caching
 */
export function generateSrcSet(baseUrl: string): string {
  if (!baseUrl) return ''
  
  const sizes = [320, 640, 1024, 1440]
  return sizes
    .map((size) => `${baseUrl}?w=${size}&q=75 ${size}w`)
    .join(', ')
}

/**
 * Get image loading strategy based on viewport/priority
 */
export function getImageLoadingStrategy(priority: boolean): 'lazy' | 'eager' {
  return priority ? 'eager' : 'lazy'
}

/**
 * Compute aspect ratio for image container (prevents layout shift)
 */
export function getAspectRatioStyle(width: number, height: number) {
  const ratio = (height / width) * 100
  return {
    aspectRatio: `${width} / ${height}`,
    paddingBottom: `${ratio}%`,
  }
}

/**
 * Determine optimal image size based on device pixel ratio
 */
export function getResponsiveImageSize(
  containerWidth: number,
  dpr: number = 2
): number {
  return Math.min(containerWidth * dpr, 1440) // Max 1440px for desktop
}

/**
 * Image format support detection
 */
export function getImageFormat(src: string): 'webp' | 'jpeg' | 'png' | 'unknown' {
  if (!src) return 'unknown'
  if (src.includes('.webp')) return 'webp'
  if (src.includes('.jpg') || src.includes('.jpeg')) return 'jpeg'
  if (src.includes('.png')) return 'png'
  return 'unknown'
}

/**
 * Build Cloudinary or similar CDN URL with optimization params
 */
export function buildCdnImageUrl(
  baseUrl: string,
  options: {
    width?: number
    height?: number
    quality?: number
    crop?: 'fill' | 'fit' | 'scale'
    gravity?: 'center' | 'face' | 'auto'
  } = {}
): string {
  if (!baseUrl) return ''
  
  const { width, height, quality = 75, crop = 'fill', gravity = 'auto' } = options
  
  // If already a CDN URL with params, return as-is
  if (baseUrl.includes('?') || baseUrl.includes('c_')) {
    return baseUrl
  }
  
  // Build optimized URL
  const params = new URLSearchParams()
  if (width) params.append('w', width.toString())
  if (height) params.append('h', height.toString())
  params.append('q', quality.toString())
  params.append('f', 'auto') // Auto format
  
  return `${baseUrl}?${params.toString()}`
}

/**
 * Validate image URL (basic check)
 */
export function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Get image placeholder (base64 encoded transparent pixel)
 * Use for blurred placeholder loading
 */
export const IMAGE_PLACEHOLDER_BLUR = 
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

/**
 * Optimize image for web delivery
 * Returns recommended props for Next.js Image component
 */
export function optimizeImageForWeb(
  src: string | null | undefined,
  alt: string,
  context: 'hero' | 'card' | 'thumbnail' | 'background' = 'card'
): OptimizedImageOptions {
  const contexts = {
    hero: { width: 1440, height: 600, quality: 80, priority: true },
    card: { width: 500, height: 350, quality: 75, priority: false },
    thumbnail: { width: 300, height: 200, quality: 70, priority: false },
    background: { width: 1920, height: 1080, quality: 60, priority: true },
  }
  
  return contexts[context]
}

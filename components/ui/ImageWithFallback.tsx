"use client"

import Image, { type ImageProps } from "next/image"
import { useState, useCallback, type ElementType } from "react"
import { cn } from "@/lib/utils"

interface ImageWithFallbackProps extends Omit<ImageProps, "onError" | "src"> {
  src: string | null | undefined
  fallbackSrc?: string
  fallbackIcon?: ElementType | any
}

function isValidImageUrl(src: string | null | undefined): boolean {
  if (!src || typeof src !== 'string') return false
  // Reject wix:image:// protocol URLs as they can't be used with Next.js Image
  if (src.startsWith('wix:image://') || src.startsWith('wix:video://')) return false
  // Reject URLs with empty hostname
  if (src.includes('://') && !src.match(/^https?:\/\/[^/]+/)) return false
  return true
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = "/placeholder.svg",
  fallbackIcon: FallbackIcon,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  fill = true,
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)

  const handleError = useCallback(() => {
    setHasError(true)
  }, [])

  // If no src and has fallback icon, show icon
  if (!src && FallbackIcon) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-gray-100", className)}>
        <FallbackIcon className="w-12 h-12 text-gray-400" />
      </div>
    )
  }

  // If src is not a valid HTTP URL (e.g., wix:image:// protocol), use fallback
  const imageSrc = hasError || !isValidImageUrl(src) ? fallbackSrc : (src as string)

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      fill={fill}
      className={cn("object-cover", className)}
      sizes={sizes}
      loading="lazy"
      onError={handleError}
    />
  )
}

export default ImageWithFallback

"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/utils/youtube"

interface LazyYouTubeEmbedProps {
  videoId: string
  title: string
  thumbnailQuality?: "default" | "mqdefault" | "hqdefault" | "sddefault" | "maxresdefault"
  className?: string
}

export function LazyYouTubeEmbed({
  videoId,
  title,
  thumbnailQuality = "hqdefault",
  className,
}: LazyYouTubeEmbedProps) {
  const [isInView, setIsInView] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || hasInteracted) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observerRef.current?.disconnect()
          }
        })
      },
      { rootMargin: "200px" }
    )

    observerRef.current.observe(container)
    return () => observerRef.current?.disconnect()
  }, [hasInteracted])

  const handlePlay = () => {
    setHasInteracted(true)
  }

  const thumbnailUrl = getYouTubeThumbnailUrl(videoId, thumbnailQuality)
  const embedUrl = getYouTubeEmbedUrl(videoId) || ""

  if (!isInView || !thumbnailUrl) {
    return (
      <div
        ref={containerRef}
        className={cn("relative w-full overflow-hidden bg-gray-100", className)}
        style={{ aspectRatio: "16 / 9" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
            <Play className="h-5 w-5 text-[#23366E] ml-0.5" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden bg-black", className)}
      style={{ aspectRatio: "16 / 9" }}
    >
      {!hasInteracted ? (
        <button
          type="button"
          onClick={handlePlay}
          className="relative w-full h-full group cursor-pointer"
          aria-label={`Play video: ${title}`}
        >
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <Play className="h-5 w-5 md:h-6 md:w-6 text-[#23366E] ml-1" />
            </div>
          </div>
        </button>
      ) : (
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      )}
    </div>
  )
}

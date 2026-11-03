"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import Image from "next/image"
import { Skeleton } from "./ui/skeleton"
import { Button } from "./ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel"
import { FileText, ExternalLink, Play } from "lucide-react"
import { wixClient } from "@/lib/wix"
import { getWixScaledToFillImageUrl, getBestCoverImage } from "@/lib/wixMedia"

const SPECIFIC_GALLERY_ID = "997e2445-8276-48fb-8c20-6b9a714cbb0b" // <-- Set your specific gallery ID here

interface GalleryItem {
  _id: string
  _createdDate: Date
  _updatedDate: Date
  title?: string
  description?: string
  sortOrder: number
  type: "IMAGE" | "VIDEO" | "TEXT" | "AUDIO" | "DOCUMENT"
  image?: { imageInfo: string }
  video?: { type?: "YOUTUBE" | "WIX_MEDIA"; videoInfo?: string; duration?: number }
  text?: { html: string; css?: any }
  link?: { text: string; url: string }
  galleryId?: string
  galleryName?: string
}

// Media Card Skeleton
const MediaCardSkeleton = () => (
  <Card className="overflow-hidden rounded-lg border border-slate-200 shadow-sm animate-pulse">
    <div className="aspect-[4/3] relative">
      <Skeleton className="w-full h-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      <Skeleton className="absolute top-4 left-4 h-5 w-16 rounded-full" />
    </div>
    <CardContent className="p-6 space-y-3">
      <Skeleton className="h-5 w-full rounded-lg" />
      <Skeleton className="h-4 w-4/5 rounded-lg" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </CardContent>
  </Card>
)

const getMediaType = (item: GalleryItem): string => {
  if (item.type === "IMAGE" && item.image?.imageInfo) return "image"
  if (item.type === "VIDEO" && item.video) return "video"
  if (item.type === "TEXT" && item.text?.html) return "text"
  return "unknown"
}

const getYouTubeEmbedUrl = (videoInfo?: string): string | null => {
  if (!videoInfo) return null
  const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  const match = videoInfo.match(youtubeRegex)
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1` : null
}

interface MediaCoverageCarouselProps {
  title?: string
  showViewAll?: boolean
  maxItems?: number
  className?: string
}

export default function MediaCoverageCarousel({
  title = "Media Coverage",
  showViewAll = true,
  maxItems = 8,
  className = "",
}: MediaCoverageCarouselProps) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMediaData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch items for the specific gallery only
      const itemsResponse = await wixClient.proGallery.listGalleryItems(SPECIFIC_GALLERY_ID)
      const galleryItems = (itemsResponse.items || []).map((item: any) => ({
        _id: String(item.id || Math.random().toString(36).substr(2, 9)), // Fallback to random ID if undefined
        _createdDate: item.createdDate ? new Date(item.createdDate) : new Date(),
        _updatedDate: item.updatedDate ? new Date(item.updatedDate) : new Date(),
        title: item.title ?? "Untitled",
        description: item.description,
        type: item.type,
        image: item.image,
        video: item.video,
        text: item.text,
        // Ensure we provide the required sortOrder property (fallback to item.order or 0)
        sortOrder: Number(item.sortOrder ?? item.order ?? 0),
        galleryId: SPECIFIC_GALLERY_ID,
        galleryName: item.galleryName ?? "Gallery",
      }))

      setItems(
        galleryItems
          .sort((a, b) => b._createdDate.getTime() - a._createdDate.getTime())
          .slice(0, maxItems)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMediaData()
  }, [maxItems])

  // Generate a unique key for each item
  const generateItemKey = (item: GalleryItem, index: number): string => {
    return item._id || `item-${index}`
  }

  const renderMediaCard = (item: GalleryItem) => {
    const mediaType = getMediaType(item)
    const getOptimizedImageUrl = (item: GalleryItem): string => {
      const bestCover = getBestCoverImage(item)
      if (bestCover) return bestCover
      if (item.image?.imageInfo) return getWixScaledToFillImageUrl(item.image.imageInfo, 400, 300) || "/placeholder.svg?height=300&width=400"
      return "/placeholder.svg?height=300&width=400"
    }

    const youtubeEmbedUrl = getYouTubeEmbedUrl(item.video?.videoInfo)

    return (
      <Card
        className="group relative overflow-hidden rounded-xs border-2 p-2 border-gray-200 bg-white shadow-none transition-all duration-300 hover:shadow-xl"
      >
        <div className="aspect-[4/3] relative overflow-hidden">
          {mediaType === "image" && (
            <Image
              width={600}
              height={400}
              src={getOptimizedImageUrl(item)}
              alt={item.title || "Media item"}
              className="w-full h-full mb-2 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (!target.dataset.fallbackAttempted) {
                  target.dataset.fallbackAttempted = "true"
                  target.src = "/placeholder.svg?height=300&width=400"
                }
              }}
            />
          )}

          {mediaType === "video" && (
            <>
              {item.video?.type === "YOUTUBE" && youtubeEmbedUrl ? (
                <iframe
                  className="w-full h-full"
                  src={youtubeEmbedUrl}
                  title={item.title || "YouTube video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : item.video?.type === "WIX_MEDIA" && item.video.videoInfo ? (
                <video
                  className="w-full h-full object-cover"
                  src={item.video.videoInfo}
                  controls
                  poster={getOptimizedImageUrl(item)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/20">
                  <Play className="h-10 w-10 text-red-600 drop-shadow-lg" />
                </div>
              )}
            </>
          )}

          {mediaType === "text" && (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <FileText className="h-10 w-10 text-[#241d1f]" />
            </div>
          )}

          <Badge className="absolute top-4 left-4 bg-white text-slate-700 border-0 shadow-sm font-semibold capitalize">
            {mediaType}
          </Badge>
        </div>

        <CardContent className="md:p-6 p-3 min-h-[115px] h-[115px] border-t-2 mt-2 border-gray-200 space-y-4">
          <h3 className="md:text-xl hover:text-primary text-[#241d1f] text-2xl font-medium leading-tight overflow-hidden mt-2 mb-2 line-clamp-2">{item.title || "Untitled Media"}</h3>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <div className={`py-10 ${className}`}>
        <div className="container mx-auto px-4 md:px-0 text-center">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <Button onClick={fetchMediaData} className="bg-red-500 text-white">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <section className="md:py-10 py-10 border-t  md:px-0 md:border-none border-b border-gray-100 bg-white">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-0 md:mb-0">
          <div className="md:mt-0 mt-3">
            <h2 className="heading-lg">{title}</h2>
          </div>
          {showViewAll && (
            <Button asChild variant="link" className="text-[#241d1f] px-0">
<a href="/media-coverage" className="inline-flex items-center gap-1 font-semibold" data-i18n="media.view-all" data-i18n-original="View All">
                 View All
                 <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <MediaCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4 md:-ml-6">
              {items.map((item, index) => (
                <CarouselItem key={generateItemKey(item, index)} className="pl-4 rounded-xs shadow-none md:pl-6 md:basis-1/2 lg:basis-1/4">
                  {renderMediaCard(item)}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="flex left-2 bg-white border-gray-200 w-8 h-8 shadow-lg hover:bg-gray-50" />
            <CarouselNext className="flex right-2 bg-white border-gray-200 w-8 h-8 shadow-lg hover:bg-gray-50" />
          </Carousel>
        )}
      </div>
    </section>
  )
}
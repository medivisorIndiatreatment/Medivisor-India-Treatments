"use client"

import { useState, useEffect, useMemo } from "react"
import { wixClient } from "@/lib/wix"
import {
  getWixImageUrl,
  getWixScaledToFillImageUrl,
  getWixScaledToFitImageUrl,
  getWixVideoThumbnailUrl,
} from "@/lib/wixMedia"
import { Card, CardContent } from "@/components/ui/card"
import Banner from "@/components/BannerService"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ImageIcon,
  AlertCircle,
  RefreshCw,
  Video,
  FileText,
  ExternalLink,
  Search,
  Filter,
  Calendar,
  Grid3X3,
  List,
  Play,
  Eye,
} from "lucide-react"
import { OptimizedImage } from "@/components/optimized-image"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import { useTranslatedStrings, Trans } from "@/lib/i18n"

const SPECIFIC_GALLERY_ID = "997e2445-8276-48fb-8c20-6b9a714cbb0b"

interface GalleryItem {
  _id: string
  _createdDate: Date
  _updatedDate: Date
  title?: string
  description?: string
  sortOrder: number
  type: "IMAGE" | "VIDEO" | "TEXT" | "AUDIO" | "DOCUMENT"
  image?: {
    imageInfo: string
  }
  video?: {
    type?: "YOUTUBE" | "WIX_MEDIA"
    videoInfo?: string
    duration?: number
  }
  text?: {
    html: string
    css?: any
  }
  link?: {
    text: string
    url: string
  }
  galleryId?: string
  galleryName?: string
}

interface Gallery {
  _id: string
  _createdDate: Date
  name?: string
  sortOrder?: number
  totalItems: number
}

// Utility functions
const getMediaType = (item: GalleryItem): string => {
  if (item.type === "IMAGE" && item.image?.imageInfo) return "image"
  if (item.type === "VIDEO" && item.video) return "video"
  if (item.type === "TEXT" && item.text?.html) return "text"
  return "unknown"
}

const getYouTubeEmbedUrl = (videoInfo?: string): string | null => {
  if (!videoInfo) return null

  try {
    const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    const match = videoInfo.match(youtubeRegex)

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`
    }

    if (videoInfo.includes("youtube.com/embed/")) {
      return videoInfo
    }

    return null
  } catch (err) {
    console.error("Error parsing YouTube URL:", err)
    return null
  }
}

export default function MediaCoveragePage() {
  const [allItems, setAllItems] = useState<GalleryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const staticStrings = [
    "Media Coverage & Press Highlights",
    "Media Coverage",
    "Stories, Innovations, and Patient Journeys from Leading Hospitals in India",
    "Welcome to the Medivisor India blog – your source for firsthand stories from top hospitals, expert healthcare advice, behind-the-scenes innovation, and inspiring patient experiences. Explore in-depth articles that spotlight our network's excellence in care, technology, and treatment options across the country.",
    "Browse Hospital Articles",
    "Featured Insights from Our Hospital Network",
    "Stay Updated with Medivisor in the News",
    "Our organization and its work have garnered widespread appreciation and media coverage. The following mentions serve as a testament to the positive recognition we've received.",
    "Search media by title, description, or gallery...",
    "Filter by type",
    "All Types",
    "Images",
    "Videos",
    "Text",
    "Sort by",
    "Date Created",
    "Title",
    "Media Type",
    "Gallery",
    "Grid view",
    "List view",
    "View Details",
    "Failed to load media",
    "Try Again",
    "No matching items found",
    "No media items found",
    "Try adjusting your search or filter criteria",
    "No media items are available in your galleries",
    "Clear Filters",
    "Video",
    "Text",
    "No Media",
    "Media Item",
    "View Link",
    "Image",
    "Audio",
    "Document",
    "Unknown",
    "Video Thumbnail",
    "Video Not Available",
    "Medivisor Blog – India's Top Hospitals in Focus",
  ]

  const allTranslatableStrings = useMemo(() => {
    const dynamicStrings = allItems.flatMap((item) => [
      item.title || "",
      item.description || "",
      item.galleryName || "",
      item.type.toLowerCase(),
      item.link?.text || "",
    ])
    return [...staticStrings, ...dynamicStrings]
  }, [allItems])

  const translatedStrings = useTranslatedStrings(allTranslatableStrings)
  const strings: Record<string, string> = {}
  allTranslatableStrings.forEach((s, i) => {
    strings[s] = translatedStrings[i] ?? s
  })

  // Media Skeleton Component (inline)
  const MediaSkeleton = ({ viewMode }: { viewMode: "grid" | "list" }) => {
    const CardSkeleton = () => (
      <Card
        className={`overflow-hidden ${DESIGN_TOKENS.COMPONENT.CARD.BASE} ${viewMode === "list" && "flex flex-col sm:flex-row"}`}
      >
        <div
          className={`relative overflow-hidden bg-gray-100 ${viewMode === "grid" ? "aspect-video" : "w-full sm:w-48 aspect-video shrink-0"}`}
        >
          <Skeleton className="w-full h-full" />
        </div>
        <CardContent className={`${viewMode === "grid" ? "p-4 space-y-2" : "p-4 flex-1 space-y-2"}`}>
          <Skeleton className="h-5 w-3/4 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
          <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 ">
            <Skeleton className="h-3 w-1/4 rounded" />
            <Skeleton className="h-3 w-1/5 rounded" />
          </div>
        </CardContent>
      </Card>
    )
    return (
      <div
        className={`${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid grid-cols-1"} ${DESIGN_TOKENS.SECTION_SPACING.GAP} animate-pulse`}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Render Media Item Component (inline)
  const renderMediaItem = (item: GalleryItem, isModal = false) => {
    const mediaType = getMediaType(item)
    const isImage = item.type === "IMAGE" && item.image?.imageInfo
    const isVideo = item.type === "VIDEO" && item.video
    const isText = item.type === "TEXT" && item.text?.html

    if (isText) {
      return (
        <div
          className={`w-full h-full bg-gray-100 flex items-center justify-center text-[#241d1f] font-serif ${
            isModal ? "rounded-lg shadow-lg min-h-[300px]" : "p-6"
          }`}
        >
          <div
            className={`text-center overflow-hidden ${isModal ? "p-8 max-w-3xl" : "max-h-full p-6"}`}
            dangerouslySetInnerHTML={{ __html: item.text?.html ?? "" }}
            style={{
              maxWidth: isModal ? "100%" : "280px",
              maxHeight: isModal ? "none" : "280px",
            }}
          />
        </div>
      )
    }

    if (isVideo) {
      const youtubeEmbedUrl = getYouTubeEmbedUrl(item.video?.videoInfo)
      const wixVideoThumbnail = item.video?.videoInfo ? getWixVideoThumbnailUrl(item.video.videoInfo) : null

      if (isModal) {
        return (
          <div className="w-full max-w-4xl mx-auto aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            {youtubeEmbedUrl ? (
              <iframe
                className="w-full h-full rounded-lg"
                src={youtubeEmbedUrl}
title={strings[item.title || ""] || item.title || "Video"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : wixVideoThumbnail ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <OptimizedImage
                  src={wixVideoThumbnail}
alt={strings[item.title || ""] || item.title || "Video Thumbnail"}
                  fill
                  className="object-contain"
                  fallbackSrc="/placeholder.svg?height=400&width=600&text=Video Not Available"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Play className="h-16 w-16 text-white/80" />
                </div>
              </div>
) : (
               <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">
                 <Video className="h-16 w-16 mb-4" />
                 <p>{strings["Video Not Available"]}</p>
               </div>
             )}
          </div>
        )
      } else {
        // Card view for video
        const thumbnailUrl = youtubeEmbedUrl
          ? `https://img.youtube.com/vi/${youtubeEmbedUrl.split("/embed/")[1].split("?")[0]}/hqdefault.jpg`
          : wixVideoThumbnail

        return (
          <div className="relative w-full h-full bg-black/80 flex items-center justify-center group">
            {thumbnailUrl ? (
              <OptimizedImage
                src={thumbnailUrl}
alt={strings[item.title || ""] || item.title || "Video Thumbnail"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                fallbackSrc="/placeholder.svg?height=338&width=600&text=Video Thumbnail"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <Video className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Play className="h-12 w-12 text-white" />
            </div>
            <div className="absolute bottom-2 left-2 right-2">
<p className="text-white text-sm font-medium truncate">{strings[item.title || ""] || item.title || "Video"}</p>
            </div>
          </div>
        )
      }
    }

    if (isImage) {
      const imageIdentifier = item.image?.imageInfo
      const imageUrl = isModal
        ? getWixScaledToFitImageUrl(imageIdentifier ?? "", 1200, 800)
        : getWixScaledToFillImageUrl(imageIdentifier ?? "", 600, 338)
      const fallbackImage = getWixImageUrl(imageIdentifier ?? "")

      return (
        <div
          className={`relative w-full h-full ${isModal ? "flex items-center justify-center bg-black/5 dark:bg-gray-900/50" : ""}`}
        >
          <OptimizedImage
            src={imageUrl || fallbackImage || "/placeholder.svg?height=338&width=600&text=Image"}
alt={item.title || "Media Item"}
            fill={!isModal}
            width={isModal ? 800 : undefined}
            height={isModal ? 800 : undefined}
            sizes="(max-width: 768px) 100vw, (max-width: 800px) 50vw, 33vw"
            className={
              isModal
                ? "max-w-full max-h-full object-contain rounded-md shadow-xs"
                : "object-contain transition-transform duration-300 group-hover:scale-105"
            }
            fallbackSrc="/placeholder.svg?height=338&width=600&text=Image Error"
          />
        </div>
      )
    }

    const getMediaIcon = () => {
      switch (mediaType) {
        case "text":
          return <FileText className="h-12 w-12 text-gray-400" />
        case "video":
          return <Video className="h-12 w-12 text-gray-400" />
        default:
          return <ImageIcon className="h-12 w-12 text-gray-400" />
      }
    }

    return (
      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex flex-col items-center justify-center">
        {getMediaIcon()}
        <span className="mt-2 text-sm text-gray-500 capitalize">
{mediaType === "unknown" ? strings["No Media"] : mediaType}
        </span>
      </div>
    )
  }

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (typeof SPECIFIC_GALLERY_ID !== "string") {
        throw new Error("Specific gallery ID is not configured correctly.")
      }

      // 1. Fetch the gallery details first (should return at most one gallery with this ID)
      const galleriesResponse = await (wixClient.proGallery.listGalleries as any)([SPECIFIC_GALLERY_ID])
      const galleriesList = (galleriesResponse as any)?.galleries || []
      const fetchedGalleries = galleriesList.map((gallery: any) => ({
        ...gallery,
        _id: gallery._id ?? SPECIFIC_GALLERY_ID,
        _createdDate: gallery._createdDate ? new Date(gallery._createdDate) : new Date(),
        totalItems: gallery.totalItems ?? 0,
        sortOrder: gallery.sortOrder ?? 0,
        name: gallery.name ?? `Gallery ${SPECIFIC_GALLERY_ID.slice(0, 8)}`,
      }))

      const targetGallery = fetchedGalleries.find((g: any) => g._id === SPECIFIC_GALLERY_ID)

      if (!targetGallery) {
        // It's possible for listGalleries to return an empty array even if we ask for a specific ID
        // Let's create a placeholder gallery object for the item mapping if it's missing
        fetchedGalleries.push({
          _id: SPECIFIC_GALLERY_ID,
          _createdDate: new Date(),
          name: `Gallery ${SPECIFIC_GALLERY_ID.slice(0, 8)}`,
          sortOrder: 0,
          totalItems: 0,
        })
      }

      const finalTargetGallery = targetGallery || fetchedGalleries[0]
      const galleryName = finalTargetGallery?.name || `Gallery ${SPECIFIC_GALLERY_ID.slice(0, 8)}`

      // 2. Fetch items ONLY for the specific gallery ID once
      const itemsResponse = await wixClient.proGallery.listGalleryItems(SPECIFIC_GALLERY_ID)

      const allItems = (itemsResponse.items || [])
        .map((item: any) => ({
          ...item,
          galleryId: SPECIFIC_GALLERY_ID,
          galleryName: galleryName,
          _id: typeof item._id === "string" && item._id ? item._id : String(item._id ?? `temp-${Math.random()}`),
          _createdDate: item._createdDate ? new Date(item._createdDate) : new Date(),
          _updatedDate: item._updatedDate ? new Date(item._updatedDate) : new Date(),
        }))
        .filter((item) => !!item._id && !item._id.startsWith("temp-")) // Filter out items without proper ID, though Wix usually provides one

      setAllItems(allItems)
      setFilteredItems(allItems)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Failed to load media")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    let filtered = [...allItems]

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.galleryName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((item) => item.type.toLowerCase() === filterType.toLowerCase())
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b._createdDate).getTime() - new Date(a._createdDate).getTime()
        case "title":
          return (a.title || "").localeCompare(b.title || "")
        case "type":
          return a.type.localeCompare(b.type)
        case "gallery":
          return (a.galleryName || "").localeCompare(b.galleryName || "")
        default:
          return 0
      }
    })

    setFilteredItems(filtered)
  }, [allItems, searchTerm, filterType, sortBy])

  const mediaTypeCounts = allItems.reduce(
    (acc, item) => {
      const type = getMediaType(item)
      if (type !== "unknown") {
        acc[type] = (acc[type] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  if (loading) {
    return (
      <div>
        <Banner
topSpanText={strings["Media Coverage"]}
  bannerBgImage="/banner/service.png"
          title={strings["Stories, Innovations, and Patient Journeys from Leading Hospitals in India"]}
          description={strings["Welcome to the Medivisor India blog – your source for firsthand stories from top hospitals, expert healthcare advice, behind-the-scenes innovation, and inspiring patient experiences. Explore in-depth articles that spotlight our network's excellence in care, technology, and treatment options across the country."]}
          buttonText={strings["Browse Hospital Articles"]}
          buttonLink="/hospital-network/#hospital-blogs"
          mainImageSrc="/about-main-1.png"
          mainImageAlt="Medivisor Blog – India's Top Hospitals in Focus"
        />
        <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
          <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
            <div className="mb-8 space-y-2">
              <Skeleton className="h-12 w-80 rounded-lg" />
              <Skeleton className="h-6 w-2/3 rounded-lg" />
            </div>
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1 rounded-lg" />
              <Skeleton className="h-10 w-full sm:w-48 rounded-lg" />
              <Skeleton className="h-10 w-full sm:w-48 rounded-lg" />
            </div>
            <MediaSkeleton viewMode={viewMode} />
          </div>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Banner
topSpanText={strings["Featured Insights from Our Hospital Network"]}
          title={strings["Stories, Innovations, and Patient Journeys from Leading Hospitals in India"]}
          description={strings["Welcome to the Medivisor India blog – your source for firsthand stories from top hospitals, expert healthcare advice, behind-the-scenes innovation, and inspiring patient experiences. Explore in-depth articles that spotlight our network's excellence in care, technology, and treatment options across the country."]}
          buttonText={strings["Browse Hospital Articles"]}
          buttonLink="/hospital-network/#hospital-blogs"
          mainImageSrc="/about-main-1.png"
          mainImageAlt="Medivisor Blog – India's Top Hospitals in Focus"
        />
        <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
          <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
            
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertCircle  className="h-4 w-4" />
              <AlertDescription className="space-y-4">
                <div>
<div className="font-semibold">{strings["Failed to load media"]}</div>
                  <div className="text-sm mt-1">{error}</div>
                </div>
                <Button onClick={fetchAllData} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
{strings["Try Again"]}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </section>
      </div>
    )
  }

  return (
    <>
      <Banner
topSpanText={strings["Media Coverage & Press Highlights"]}
        title={strings["Stay Updated with Medivisor in the News"]}
        description={strings["Our organization and its work have garnered widespread appreciation and media coverage. The following mentions serve as a testament to the positive recognition we've received."]}
        buttonText={strings["Browse Hospital Articles"]}
        buttonLink="/hospital-network/#hospital-blogs"
        mainImageSrc="/about-main-1.png"
        mainImageAlt="Medivisor Blog – India's Top Hospitals in Focus"
      />
      <section className={`${DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          {/* Sticky Filter Bar */}
          <div className="sticky top-0 z-20 bg-white px-4 backdrop-blur-md shadow-sm border-b border-gray-100 py-3 sm:py-4 mb-6">
            {/* Controls */}
            <div className="flex flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
<div className="relative md:block hidden flex-1">
                 <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 start-3`} />
                  <Input
                    placeholder={strings["Search media by title, description, or gallery..."]}
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    dir="auto"
                    className="ps-10 w-full rounded-md border-gray-200 bg-white focus-visible:ring-gray-300 text-start"
                  />
               </div>

               {/* Filters + Sort */}
               <div className="flex flex-row gap-3 sm:gap-4 w-full px-3 lg:w-auto">
                 <Select value={filterType} onValueChange={setFilterType}>
                   <SelectTrigger className="w-full sm:w-48 rounded-md border-gray-200 bg-white focus-visible:ring-gray-300">
                     <Filter className="h-4 w-4 mr-2 text-gray-900" />
                     <SelectValue placeholder={strings["Filter by type"]} />
                   </SelectTrigger>
                   <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                     <SelectItem value="all">{strings["All Types"]} ({allItems.length})</SelectItem>
                     <SelectItem value="image">{strings["Images"]} ({mediaTypeCounts.image || 0})</SelectItem>
                     <SelectItem value="video">{strings["Videos"]} ({mediaTypeCounts.video || 0})</SelectItem>
                     <SelectItem value="text">{strings["Text"]} ({mediaTypeCounts.text || 0})</SelectItem>
                   </SelectContent>
                 </Select>

                 <Select value={sortBy} onValueChange={setSortBy}>
                   <SelectTrigger className="w-full sm:w-48 rounded-md border-gray-200 bg-white focus-visible:ring-gray-300">
                     <SelectValue placeholder={strings["Sort by"]} />
                   </SelectTrigger>
                   <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                     <SelectItem value="date">{strings["Date Created"]}</SelectItem>
                     <SelectItem value="title">{strings["Title"]}</SelectItem>
                     <SelectItem value="type">{strings["Media Type"]}</SelectItem>
                     <SelectItem value="gallery">{strings["Gallery"]}</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               {/* View Mode Toggle */}
               <div className="flex gap-3 justify-end lg:justify-start">
                 <Button
                   variant={viewMode === "grid" ? "default" : "outline"}
                   size="icon"
                   className="rounded-md border-gray-300 border bg-white"
                   onClick={() => setViewMode("grid")}
                   aria-label={strings["Grid view"]}
                 >
                   <Grid3X3 className="h-4 w-4" />
                 </Button>
                 <Button
                   variant={viewMode === "list" ? "default" : "outline"}
                   size="icon"
                   className="rounded-md border-gray-300 bg-white"
                   onClick={() => setViewMode("list")}
                   aria-label={strings["List view"]}
                 >
                   <List className="h-4 w-4" />
                 </Button>
               </div>
            </div>
          </div>

          {/* Content Grid */}
          {filteredItems.length > 0 ? (
            <div
                className={`${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid grid-cols-1"} gap-4`}
              >
              {filteredItems.map((item) => {
                const mediaType = getMediaType(item)
                const isLink = !!item.link

                return (
                  <Dialog key={item._id}>
                    <DialogTrigger asChild>
                      <Card
                        className={`group cursor-pointer ${DESIGN_TOKENS.COMPONENT.CARD.BASE} overflow-hidden ${
                          viewMode === "list" && "flex flex-col sm:flex-row"
                        }`}
                      >
                        <div
                          className={`relative overflow-hidden bg-gray-100 flex items-center justify-center ${
                            viewMode === "grid" ? "aspect-video" : "w-full sm:w-48 aspect-video shrink-0"
                          }`}
                        >
                          {renderMediaItem(item, false)}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
<Button
                               variant="secondary"
                               className="scale-0 cursor-pointer text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm text-sm font-medium group-hover:scale-100 transition-transform duration-300"
                             >
                                <Eye className="h-4 w-4 mr-2" />
                                {strings["View Details"]}
                              </Button>
                           </div>
                           {mediaType !== "image" && (
                               <Badge className="absolute top-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full">
                                {mediaType === "video" && <Video className="h-3 w-3 mr-1" />}
                                {mediaType === "text" && <FileText className="h-3 w-3 mr-1" />}
                                {strings[mediaType.charAt(0).toUpperCase() + mediaType.slice(1)] || mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}
                              </Badge>
                           )}
                         
                        </div>

                        <CardContent className={`${viewMode === "grid" ? "p-4 border-t border-gray-100" : "p-4 flex-1"}`}>
                          <div className="flex flex-col h-full">
                            <div className="grow pt-2">
                              {item.title && (
<h3 className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_TITLE} line-clamp-2 text-[#241d1f]`} data-i18n-original={item.title} data-trans-managed="true">
                                  {strings[item.title] || item.title}
                                </h3>
                              )}
                            </div>
                            <div className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION}  pt-2 mt-2 border-t border-gray-200 flex items-center gap-1 text-[#241d1f]`}>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(item._createdDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-6xl max-h-[90vh] p-0 overflow-hidden">
<DialogHeader className="p-6 pb-4 border-b border-gray-100">
                        <DialogTitle className={`${DESIGN_TOKENS.TYPOGRAPHY.H2} text-[#241d1f]}`} data-i18n-original={item.title || strings["Media Item"]} data-trans-managed="true">
                          {strings[item.title || ""] || item.title || strings["Media Item"]}
                        </DialogTitle>
                        {item.description && (
                          <DialogDescription className="text-base md:text-lg text-gray-600" data-i18n-original={item.description} data-trans-managed="true">
                            {strings[item.description] || item.description}
                          </DialogDescription>
                        )}
                     </DialogHeader>
                      <div className="relative min-h-[400px] max-h-[60vh] bg-gray-50 flex items-center justify-center overflow-hidden">
                        {renderMediaItem(item, true)}
                      </div>
                       <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex flex-wrap gap-3 mb-4">
                          <Badge variant="secondary" className="px-3 py-1 bg-white border border-gray-200" data-i18n-original={item.galleryName} data-trans-managed="true">
                            <Calendar className="h-3 w-3 mr-1" />
                            {strings[item.galleryName || ""] || item.galleryName}
                          </Badge>
                          <Badge variant="secondary" className="capitalize px-3 py-1 bg-white border border-gray-200" data-i18n-original={item.type.toLowerCase()} data-trans-managed="true">
                            {strings[item.type.toLowerCase()] || item.type.toLowerCase()}
                          </Badge>
                          <Badge variant="secondary" className="px-3 py-1 bg-white border border-gray-200">
                            {new Date(item._createdDate).toLocaleDateString()}
                          </Badge>
                        </div>
{item.link && (
                           <Button asChild size="sm" className="bg-[#23366E] hover:bg-[#29A9B9] text-white">
                             <a href={item.link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                               <ExternalLink className="h-4 w-4" />
                               {strings[item.link?.text || ""] || item.link?.text || strings["View Link"]}
                             </a>
                           </Button>
                         )}
                       </div>
                    </DialogContent>
                  </Dialog>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
<ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
               <h3 className={`${DESIGN_TOKENS.TYPOGRAPHY.H3} mb-2 text-[#241d1f]`}>
                 {searchTerm || filterType !== "all" ? strings["No matching items found"] : strings["No media items found"]}
               </h3>
               <p className={DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION}>
                 {searchTerm || filterType !== "all"
                   ? strings["Try adjusting your search or filter criteria"]
                   : strings["No media items are available in your galleries"]}
               </p>
               {(searchTerm || filterType !== "all") && (
                 <Button
                   variant="outline"
                   onClick={() => {
                     setSearchTerm("")
                     setFilterType("all")
                   }}
                   className="mt-4"
                 >
                   {strings["Clear Filters"]}
                 </Button>
               )}
             </div>
          )}
        </div>
      </section>
    </>
  )
}

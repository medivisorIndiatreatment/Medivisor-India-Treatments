"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PlayCircle, ImageIcon, VideoIcon, Calendar, Eye, FileText } from "lucide-react" // Added FileText icon

interface GalleryItemProps {
  item: {
    _id: string
    _createdDate: Date
    _updatedDate?: Date
    title?: string
    description?: string
    type: "IMAGE" | "VIDEO" | "TEXT" // Updated to include TEXT type
    sortOrder: number
    image?: {
      imageInfo: string
    }
    video?: {
      type: string
      videoInfo: string
      duration?: number
    }
    text?: {
      // Added text property for TEXT type items
      html: string
      css?: Record<string, any>
    }
  }
}

export function GalleryItem({ item }: GalleryItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getImageSrc = (imageInfo: string) => {
    // Convert Wix image URL to a placeholder for demo
    // In production, you'd handle Wix image URLs properly
    return `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.title || "gallery item")}`
  }

  const getVideoThumbnail = (videoInfo: string) => {
    // Generate video thumbnail placeholder
    return `/placeholder.svg?height=400&width=400&query=${encodeURIComponent("video thumbnail " + (item.title || "video"))}`
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return ""
    const minutes = Math.floor(duration / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <>
      <Card
        className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
        onClick={() => setIsOpen(true)}
      >
        <div className="aspect-square relative overflow-hidden">
          {item.type === "IMAGE" && item.image ? (
            <Image
              src={getImageSrc(item.image.imageInfo) || "/placeholder.svg"}
              alt={item.title || "Gallery image"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : item.type === "VIDEO" && item.video ? (
            <>
              <Image
                src={getVideoThumbnail(item.video.videoInfo) || "/placeholder.svg"}
                alt={item.title || "Video thumbnail"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayCircle className="h-12 w-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
              </div>
              {item.video.duration && (
                <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">
                  {formatDuration(item.video.duration)}
                </Badge>
              )}
            </>
          ) : item.type === "TEXT" ? ( // Handle TEXT type
            <div className="w-full h-full bg-muted flex items-center justify-center p-4 text-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground text-sm font-medium">Text Item</span>
            </div>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              {item.type === "IMAGE" ? (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              ) : (
                <VideoIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          )}

          <div className="absolute top-2 left-2">
            <Badge
              variant={item.type === "IMAGE" ? "default" : item.type === "VIDEO" ? "secondary" : "outline"}
              className="text-xs"
            >
              {item.type === "IMAGE" ? (
                <ImageIcon className="h-3 w-3 mr-1" />
              ) : item.type === "VIDEO" ? (
                <VideoIcon className="h-3 w-3 mr-1" />
              ) : (
                <FileText className="h-3 w-3 mr-1" />
              )}
              {item.type}
            </Badge>
          </div>

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button variant="secondary" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </div>
        </div>

        {item.title && (
          <CardContent className="p-3">
            <h4 className="font-medium text-sm truncate">{item.title}</h4>
            {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
          </CardContent>
        )}
      </Card>

      {/* Modal for full view */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {item.type === "IMAGE" ? (
                <ImageIcon className="h-5 w-5" />
              ) : item.type === "VIDEO" ? (
                <VideoIcon className="h-5 w-5" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
              {item.title || `${item.type} Item`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
              {item.type === "IMAGE" && item.image ? (
                <Image
                  src={getImageSrc(item.image.imageInfo) || "/placeholder.svg"}
                  alt={item.title || "Gallery image"}
                  fill
                  className="object-contain"
                />
              ) : item.type === "VIDEO" && item.video ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <PlayCircle className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {item.video.type} Video
                      {item.video.duration && ` • ${formatDuration(item.video.duration)}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Click to play: {item.video.videoInfo}</p>
                  </div>
                </div>
              ) : item.type === "TEXT" && item.text ? (
                <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.text.html }}
                  />
                </div>
              ) : null}
            </div>

            {item.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created {new Date(item._createdDate).toLocaleDateString()}
              </div>
              {item._updatedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Updated {new Date(item._updatedDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

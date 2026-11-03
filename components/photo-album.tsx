"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Share2, Heart } from "lucide-react"
import { useEffect } from "react"
import { Trans } from "@/lib/i18n/Trans"

// Mock Wix SDK for demonstration purposes.
// In a real Wix Studio environment, the 'Wix' global object would be provided by the Wix platform.
declare global {
  interface Window {
    Wix?: {
      Activities: {
        Type: {
          ALBUM_SHARE: string
          ALBUM_FAN: string
          [key: string]: string // Allow other types if needed
        }
        postActivity: (
          activity: {
            type: string
            info: object
            details: {
              additionalInfoUrl: string | null
              summary: string
            }
            contactUpdate: object | null
          },
          onSuccess: (data: { activityId: string; contactId: string }) => void,
          onFailure?: (data: any) => void,
        ) => void
        getActivityById: (id: string, onSuccess: (data: any) => void, onFailure: (data: any) => void) => void
      }
    }
  }
}

// Initialize mock Wix object if not already present in the window.
if (typeof window !== "undefined" && !window.Wix) {
  window.Wix = {
    Activities: {
      Type: {
        ALBUM_SHARE: "music/album-share",
        ALBUM_FAN: "music/album-fan",
      },
      postActivity: (activity, onSuccess, onFailure) => {
        setTimeout(() => {
          onSuccess({ activityId: `mock-activity-${Date.now()}`, contactId: `mock-contact-${Date.now()}` })
        }, 500)
      },
      getActivityById: (id, onSuccess, onFailure) => {
        setTimeout(() => {
          onFailure("Activity not found in mock data.")
        }, 500)
      },
    },
  }
}

interface Album {
  id: string
  title: string
  artist: string
  imageUrl: string
  description: string
}

const albums: Album[] = [
  {
    id: "1",
    title: "Nature's Symphony",
    artist: "Green Lens",
    imageUrl: "/placeholder.svg?height=300&width=300",
    description: "A collection of breathtaking landscapes and serene natural moments.",
  },
  {
    id: "2",
    title: "Urban Echoes",
    artist: "Cityscape Captures",
    imageUrl: "/placeholder.svg?height=300&width=300",
    description: "Capturing the vibrant energy and hidden corners of metropolitan life.",
  },
  {
    id: "3",
    title: "Portraits of Life",
    artist: "Human Canvas",
    imageUrl: "/placeholder.svg?height=300&width=300",
    description: "Intimate and expressive portraits that tell unique stories.",
  },
  {
    id: "4",
    title: "Abstract Visions",
    artist: "Form & Color",
    imageUrl: "/placeholder.svg?height=300&width=300",
    description: "Exploring the interplay of shapes, colors, and light in abstract forms.",
  },
]

export default function PhotoAlbum() {
  const handleShareAlbum = (album: Album) => {
    if (window.Wix && window.Wix.Activities) {
      const activity = {
        type: window.Wix.Activities.Type.ALBUM_SHARE,
        info: {
          albumId: album.id,
          albumTitle: album.title,
        },
        details: {
          // Replace with your actual Wix App ID, Instance ID, and deep link
          additionalInfoUrl: `http://www.wix.com/my-account/app/your-app-id/your-instance-id/album/${album.id}`,
          summary: `Album "${album.title}" shared by a site visitor.`,
        },
        contactUpdate: {
          // Example contact update, replace with actual user data if available
          emails: [{ tag: "main", email: "visitor@example.com" }],
          name: { first: "Site", last: "Visitor" },
        },
      }

      window.Wix.Activities.postActivity(
        activity,
        (data) => {
          alert(`Album "${album.title}" shared! Activity logged.`)
        },
        (error) => {
          alert(`Failed to share album "${album.title}". Check console for details.`)
        },
      )
    } else {
      alert("Wix SDK not available. (Check console for mock output)")
    }
  }

  const handleFanAlbum = (album: Album) => {
    if (window.Wix && window.Wix.Activities) {
      const activity = {
        type: window.Wix.Activities.Type.ALBUM_FAN,
        info: {
          albumId: album.id,
          albumTitle: album.title,
        },
        details: {
          // Replace with your actual Wix App ID, Instance ID, and deep link
          additionalInfoUrl: `http://www.wix.com/my-account/app/your-app-id/your-instance-id/album/${album.id}`,
          summary: `Site visitor became a fan of album "${album.title}".`,
        },
        contactUpdate: {
          // Example contact update, replace with actual user data if available
          emails: [{ tag: "main", email: "fan@example.com" }],
          name: { first: "Album", last: "Fan" },
        },
      }

      window.Wix.Activities.postActivity(
        activity,
        (data) => {
          alert(`You are now a fan of "${album.title}"! Activity logged.`)
        },
        (error) => {
          alert(`Failed to become a fan of album "${album.title}". Check console for details.`)
        },
      )
    } else {
      alert("Wix SDK not available. (Check console for mock output)")
    }
  }

  // Example of using getActivityById
  useEffect(() => {
    if (window.Wix && window.Wix.Activities) {
      window.Wix.Activities.getActivityById(
        "non-existent-activity-id",
        (data) => {},
        (error) => {},
      )
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-center mb-10">My Photo Albums</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {albums.map((album) => (
          <Card key={album.id} className="flex flex-col">
            <CardContent className="p-0">
              <Image
                src={album.imageUrl || "/placeholder.svg"}
                alt={album.title}
                width={300}
                height={300}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            </CardContent>
            <CardHeader className="flex-grow">
<CardTitle data-i18n-original={album.title}>{album.title}</CardTitle>
              <CardDescription data-i18n-original={album.artist}>{album.artist}</CardDescription>
              <p className="text-sm text-muted-foreground mt-2" data-i18n-original={album.description}>{album.description}</p>
            </CardHeader>
            <CardFooter className="flex justify-between items-center p-4 border-t">
              <Button variant="outline" onClick={() => handleShareAlbum(album)} data-i18n="album.share" data-i18n-original="Share">
                <Share2 className="mr-2 h-4 w-4" />
                <Trans id="album.share">Share</Trans>
              </Button>
              <Button onClick={() => handleFanAlbum(album)} data-i18n="album.fan" data-i18n-original="Fan">
                <Heart className="mr-2 h-4 w-4" />
                <Trans id="album.fan">Fan</Trans>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

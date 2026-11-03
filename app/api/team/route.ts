// app/api/team/route.ts
// Server-side team API using Wix CMS collection "Team1"

import { NextResponse } from "next/server"
import { wixServerClient } from "@/lib/wix"
import { getBestCoverImage, getWixScaledToFillImageUrl } from "@/lib/wixMedia"
import { generateUniqueSlug } from "@/lib/slug-utils"
import { CACHE_HEADERS } from "@/lib/api/pagination"

const COLLECTION_ID = "Team1"

function processWixImageUrl(item: any): string {
  const bestImage = getBestCoverImage(item)
  if (bestImage) {
    return bestImage
  }

  const imageFields = [
    "Photo", "photo", "image", "picture", "avatar", "profileImage", "mainImage", "featuredImage", "coverImage", "thumbnail",
  ]
  for (const field of imageFields) {
    if (item[field]) {
      let imageUrl = null
      if (typeof item[field] === "string" && item[field].startsWith("wix:image://")) {
        imageUrl = item[field]
      } else if (item[field]?.url && item[field].url.startsWith("wix:image://")) {
        imageUrl = item[field].url
      } else if (item[field]?.src && item[field].src.startsWith("wix:image://")) {
        imageUrl = item[field].src
      }
      if (imageUrl) {
        const processedUrl = getWixScaledToFillImageUrl(imageUrl, 400, 500)
        if (processedUrl) {
          return processedUrl
        }
      }
    }
  }
  return `/placeholder.svg?height=500&width=400&query=team member portrait`
}

export async function GET(req: Request) {
  const requestId = crypto.randomUUID?.() || Date.now().toString()
  try {
    const url = new URL(req.url)
    const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 200)

    const response = await wixServerClient.items
      .query(COLLECTION_ID)
      .skip(0)
      .limit(limit)
      .ascending("Order")
      .find({ consistentRead: true })

    const items = (response.items || []).map((item: any) => {
      const itemData = item.data || item
      const memberName = itemData.Name || itemData.name || itemData.title || "Team Member"
      const memberId = item._id || item.ID

      return {
        _id: memberId,
        name: memberName,
        role: itemData["Job Title"] || itemData.jobTitle || item.role || item.position || "Team Member",
        image: processWixImageUrl(itemData),
        bio: itemData["Long Description"] || itemData.longDescription || itemData.bio || itemData.description || "Dedicated team member.",
        shortDescription: itemData["Short Description"] || itemData.shortDescription || itemData.excerpt || "",
        longDescription: itemData["Long Description"] || itemData.longDescription || itemData.bio || itemData.description || "",
        order: Number.parseInt(itemData.Order) || Number.parseInt(itemData.order) || Number.parseInt(item.Order) || 0,
        slug: generateUniqueSlug(memberName, memberId),
        "link-team-1-title": itemData["link-team-1-title"] || item["link-team-1-title"] || item.link || item.profileUrl || item.website || "#",
        email: itemData.email || item.email || item.Email || "",
        linkedin: itemData.linkedin || item.linkedin || item.LinkedIn || "",
        twitter: itemData.twitter || item.twitter || item.Twitter || "",
        website: itemData.website || itemData.Website || item.website || "",
      }
    })

    const sorted = items.sort((a: any, b: any) => a.order - b.order)

    return NextResponse.json(
      { items: sorted, totalCount: response.totalCount || sorted.length },
      {
        headers: {
          ...CACHE_HEADERS,
          "X-Total-Count": String(response.totalCount || sorted.length),
          "X-Request-Id": requestId,
        },
      }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to fetch team", requestId, message },
      { status: 500 }
    )
  }
}

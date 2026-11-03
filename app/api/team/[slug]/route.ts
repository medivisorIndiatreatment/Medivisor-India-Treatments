// app/api/team/[slug]/route.ts
// Server-side team member API using Wix CMS collection "Team1"

import { NextResponse } from "next/server"
import { wixServerClient } from "@/lib/wix"
import { getBestCoverImage, getWixScaledToFillImageUrl } from "@/lib/wixMedia"
import { generateSlug, generateUniqueSlug } from "@/lib/slug-utils"

const COLLECTION_ID = "Team1"

function processWixImageUrl(item: any): string {
  const bestImage = getBestCoverImage(item)
  if (bestImage) {
    return getWixScaledToFillImageUrl(bestImage, 1200, 1200) || bestImage
  }

  const imageFields = [
    "Photo", "photo", "image", "picture", "avatar", "profileImage",
    "mainImage", "featuredImage", "coverImage", "thumbnail",
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
        const processedUrl = getWixScaledToFillImageUrl(imageUrl, 1200, 1200)
        if (processedUrl) {
          return processedUrl
        }
      }
    }
  }

  return `/placeholder.svg?height=1200&width=1200&query=team member portrait`
}

function extractTextFromRichText(richTextObj: any): string {
  if (!richTextObj) return ""
  if (typeof richTextObj === "string") return richTextObj
  if (richTextObj.nodes && Array.isArray(richTextObj.nodes)) {
    return richTextObj.nodes
      .map((node: any) => {
        if (node.type === "PARAGRAPH" && node.nodes) {
          return node.nodes
            .map((textNode: any) => {
              if (textNode.type === "TEXT" && textNode.textData) {
                return textNode.textData.text || ""
              }
              return ""
            })
            .join("")
        }
        return ""
      })
      .join("\n\n")
      .trim()
  }
  if (richTextObj.text) return richTextObj.text
  if (richTextObj.textData && richTextObj.textData.text) return richTextObj.textData.text
  return ""
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const requestId = crypto.randomUUID?.() || Date.now().toString()
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required", requestId },
        { status: 400 }
      )
    }

    // 1. Try by exact ID
    let response = await wixServerClient.items.query(COLLECTION_ID).eq("_id", slug).find({ consistentRead: true })

    // 2. Fallback to slug matching
    if (!response?.items?.length) {
      const allMembersResponse = await wixServerClient.items
        .query(COLLECTION_ID)
        .skip(0)
        .limit(200)
        .find({ consistentRead: true })

      if (allMembersResponse?.items?.length) {
        const targetMember = allMembersResponse.items.find((item: any) => {
          const itemData = item.data || item
          const memberName = itemData.title || item.title || item.Name || item.name || ""
          const memberSlug = generateSlug(memberName)
          const linkSlug = itemData["link-team-1-title"] || item["link-team-1-title"] || ""
          const extractedSlug = linkSlug ? linkSlug.replace("/team/", "").replace("/", "") : ""

          return memberSlug === slug || extractedSlug === slug || item._id === slug || generateUniqueSlug(memberName, item._id) === slug
        })

        if (targetMember) {
          response = {
            items: [targetMember],
            totalCount: 1,
            pageSize: 1,
            currentPage: 1,
            length: 1,
          } as any
        }
      }
    }

    // 3. Fallback to partial name matching
    if (!response?.items?.length) {
      const nameFromSlug = slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

      response = await wixServerClient.items
        .query(COLLECTION_ID)
        .contains("title", nameFromSlug)
        .find({ consistentRead: true })
    }

    const item = response?.items?.[0]

    if (!item) {
      return NextResponse.json(
        { error: "Team member not found", requestId },
        { status: 404 }
      )
    }

    const itemData = item.data || item
    const memberName = itemData.title || item.title || item.Name || item.name || "Team Member"
    const memberRole = itemData.jobTitle || item.jobTitle || item["Job Title"] || item.role || item.position || "Team Member"
    const imageUrl = processWixImageUrl(itemData)

    const metaDescription = extractTextFromRichText(
      itemData.shortDescription || item.shortDescription || item["Short Description"] || item.excerpt
    ) || extractTextFromRichText(
      itemData.longDescription || item.longDescription || item["Long Description"] || item.bio || item.description,
    ) || `Read the full profile for ${memberName}, ${memberRole}.`

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medivisorindiatreatment.com'
    const pageUrl = `${siteUrl}/team/${slug}`

    const memberData = {
      _id: item._id || item.ID,
      name: memberName,
      role: memberRole,
      image: imageUrl,
      bio: extractTextFromRichText(itemData.longDescription || item.longDescription || item["Long Description"] || item.bio || item.description) || "Dedicated team member.",
      shortDescription: extractTextFromRichText(itemData.shortDescription || item.shortDescription || item["Short Description"] || item.excerpt) || "",
      longDescription: extractTextFromRichText(itemData.longDescription || item.longDescription || item["Long Description"] || item.bio || item.description) || "",
      order: Number.parseInt(itemData.order) || Number.parseInt(item.order) || Number.parseInt(item.Order) || 0,
      "link-team-1-title": itemData["link-team-1-title"] || item["link-team-1-title"] || item.link || item.profileUrl || item.website || "#",
      email: itemData.email || item.email || item.Email || "",
      linkedin: itemData.linkedin || item.linkedin || item.LinkedIn || "",
      twitter: itemData.twitter || item.twitter || item.Twitter || "",
      website: itemData.website || item.website || item.Website || "",
      richContent: itemData.longDescription || item.longDescription || item["Long Description"] || item.bio || item.description,
      rawData: item,
    }

    return NextResponse.json(
      {
        ...memberData,
        slug,
        meta: {
          title: `${memberName} | ${memberRole}`,
          description: metaDescription,
          url: pageUrl,
          image: imageUrl,
        },
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
          "X-Request-Id": requestId,
        },
      }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to fetch team member", requestId, message },
      { status: 500 }
    )
  }
}

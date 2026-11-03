// app/api/services/route.ts
// Server-side services API using Wix CMS collection "Import1"

import { NextResponse } from "next/server"
import { wixServerClient } from "@/lib/wix"
import { getBestCoverImage, getWixScaledToFillImageUrl } from "@/lib/wixMedia"
import { CACHE_HEADERS } from "@/lib/api/pagination"

const COLLECTION_ID = "Import1"

function processWixImageUrl(item: any): string {
  const directImage = typeof item === "string" ? item : item?.image
  if (
    directImage &&
    typeof directImage === "string" &&
    (directImage.startsWith("http://") || directImage.startsWith("https://"))
  ) {
    return directImage
  }

  const bestImage = getBestCoverImage(item)
  if (bestImage) {
    return bestImage
  }

  const imageFields = ["image", "photo", "picture", "mainImage", "featuredImage", "coverImage", "thumbnail"]

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
        const processedUrl = getWixScaledToFillImageUrl(imageUrl, 400, 300)
        if (processedUrl) {
          return processedUrl
        }
      }
    }
  }
  return `/placeholder.svg?height=200&width=400&query=medical service`
}

function extractTextFromNodes(nodes: any[]): string {
  let text = ""
  for (const node of nodes) {
    if (node.type === "TEXT" && node.textData?.text) {
      text += node.textData.text
    } else if (node.type === "PARAGRAPH" && node.nodes) {
      text += extractTextFromNodes(node.nodes) + " "
    } else if (node.type === "LIST_ITEM" && node.nodes) {
      text += "• " + extractTextFromNodes(node.nodes) + " "
    } else if (node.nodes && Array.isArray(node.nodes)) {
      text += extractTextFromNodes(node.nodes)
    }
  }
  return text.trim()
}

function extractBenefitsFromRichContent(richContent: any): string[] {
  if (!richContent?.nodes) return []
  const benefits: string[] = []
  const findListItems = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.type === "LIST_ITEM" && node.nodes) {
        const itemText = extractTextFromNodes(node.nodes)
        if (itemText.trim()) {
          benefits.push(itemText.trim())
        }
      } else if (node.nodes && Array.isArray(node.nodes)) {
        findListItems(node.nodes)
      }
    }
  }
  findListItems(richContent.nodes)
  return benefits
}

function parseRichContent(content: any): { text: string; nodes?: any[] } {
  if (!content) return { text: "" }
  if (typeof content === "string") return { text: content }
  if (content.nodes && Array.isArray(content.nodes)) {
    return { text: extractTextFromNodes(content.nodes), nodes: content.nodes }
  }
  if (content.html) return { text: content.html }
  if (content.plainText) return { text: content.plainText }
  if (content.text) return { text: content.text }
  return { text: "" }
}

function parseArrayField(field: any, fallback: string[] = []): string[] {
  if (!field) return fallback
  if (Array.isArray(field)) return field.filter(Boolean)
  if (typeof field === "string") {
    return field.split(/[,\n]/).map((item) => item.trim()).filter(Boolean)
  }
  return fallback
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
      .descending("_createdDate")
      .find({ consistentRead: true })

    const items = (response.items || []).map((item: any, originalIndex: number) => {
      const parsedRichContent = parseRichContent(item.richcontent || item.richContent)
      const parsedDescription = parseRichContent(item.description)
      const richContentBenefits = extractBenefitsFromRichContent(item.richcontent || item.richContent)
      const fallbackBenefits = parseArrayField(item.benefits, [
        "Professional service",
        "Expert care",
        "Quality assured",
      ])

      return {
        _id: item._id || item.ID,
        title: item.title || item.name || item.serviceName || "Service",
        description: parsedDescription.text || "Service description",
        richContent: parsedRichContent.text,
        richContentNodes: parsedRichContent.nodes,
        shortDescription: parseRichContent(item.shortDescription || item.summary).text,
        image: processWixImageUrl(item),
        images: item.images ? parseArrayField(item.images).map((img: any) => processWixImageUrl({ image: img })) : undefined,
        benefits: richContentBenefits.length > 0 ? richContentBenefits : fallbackBenefits,
        features: parseArrayField(item.features),
        price: item.price || item.cost || item.pricing,
        duration: item.duration || item.timeRequired || item.estimatedTime,
        category: item.category || item.serviceCategory || item.type,
        tags: parseArrayField(item.tags),
        order: Number.parseInt(item.order) || Number.parseInt(item.Order) || originalIndex,
        isPopular: item.isPopular || item.featured || item.popular || false,
        ctaText: item.ctaText || item.buttonText || "Enquire Now",
        ctaLink: item.ctaLink || item.bookingLink || item.contactLink,
      }
    })

    const sorted = items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

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
      { error: "Failed to fetch services", requestId, message },
      { status: 500 }
    )
  }
}

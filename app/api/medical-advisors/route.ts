// app/api/medical-advisors/route.ts
// Server-side medical advisors API using Wix CMS collection "MedicalAdvisors"

import { NextResponse } from "next/server"
import { wixServerClient } from "@/lib/wix"
import { getBestCoverImage } from "@/lib/wixMedia"
import { CACHE_HEADERS } from "@/lib/api/pagination"

const COLLECTION_ID = "MedicalAdvisors"

export async function GET(req: Request) {
  const requestId = crypto.randomUUID?.() || Date.now().toString()
  try {
    const url = new URL(req.url)
    const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 200)
    const skip = Number(url.searchParams.get("skip")) || 0

    const response = await wixServerClient.items
      .query(COLLECTION_ID)
      .skip(skip)
      .limit(limit)
      .descending("_createdDate")
      .find({ consistentRead: true })

    const items = (response.items || []).map((item: any) => {
      const itemData = item.data || item
      return {
        _id: item._id || item.ID,
        name: itemData.name || item.name || "Untitled Advisor",
        photo: itemData.photo || item.photo || item.image || null,
        specialty: itemData.specialty || item.specialty || "N/A",
        experience: itemData.experience || item.experience || item.bio || item.description || "N/A",
      }
    })

    return NextResponse.json(
      {
        items,
        totalCount: response.totalCount || items.length,
        hasMore: skip + limit < (response.totalCount || items.length),
      },
      {
        headers: {
          ...CACHE_HEADERS,
          "X-Total-Count": String(response.totalCount || items.length),
          "X-Has-More": String(skip + limit < (response.totalCount || items.length)),
          "X-Request-Id": requestId,
        },
      }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to fetch medical advisors", requestId, message },
      { status: 500 }
    )
  }
}

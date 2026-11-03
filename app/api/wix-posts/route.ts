// app/api/wix-posts/route.ts
// Blog posts API using Wix CMS

import { NextResponse, type NextRequest } from "next/server"
import { wixServerClient } from "@/lib/wix"
import { assertWixConfigured } from "@/lib/config/env"

// Cache headers (consistent with other APIs)
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const ALLOWED_ORIGINS = [
  "https://www.medivisorindiatreatment.com",
  "https://medivisorindiatreatment.com",
]

function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = { ...CACHE_HEADERS }
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin
    headers["Access-Control-Allow-Credentials"] = "true"
  } else {
    headers["Access-Control-Allow-Origin"] = "https://medivisorindiatreatment.com"
  }
  return headers
}

export async function GET(req: NextRequest) {
  assertWixConfigured()
  const { searchParams } = new URL(req.url)
  const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") || "4", 10)))
  const offset = Math.max(0, Number.parseInt(searchParams.get("offset") || "0", 10))
  const sort = searchParams.get("sort") || "PUBLISHED_DATE_DESC"
  const category = searchParams.get("category") || undefined

  try {
    let posts: any[] = []
    let total = 0

    const toReadTime = (m?: number | null) => {
      const n = Number(m)
      if (!isNaN(n) && n > 0) return `${n} min read`
      return "1 min read"
    }

    if (category) {
      // Get category ID first
      let categoryId = null

      try {
        const categoriesResult = await wixServerClient.categories.listCategories()
        const foundCategory = categoriesResult.categories?.find((cat: any) =>
          cat.slug === category || cat.label?.toLowerCase().replace(/\s+/g, '-') === category
        )
        categoryId = foundCategory?._id || null
        
        // Debug: List all categories
      } catch (categoryError) {
        console.warn('Failed to get category ID:', categoryError)
      }

      if (categoryId) {
        // Fetch posts in batches and filter by category
        const allPosts: any[] = []
        let currentOffset = 0
        const batchSize = 100

        while (true) {
          const batchResult = await wixServerClient.posts.listPosts({
            paging: { limit: batchSize, offset: currentOffset },
            // @ts-expect-error Wix types accept union strings here
            sort,
          })

          const batchPosts = batchResult.posts ?? []
          allPosts.push(...batchPosts)

          if (batchPosts.length < batchSize) break // No more posts
          currentOffset += batchSize

          // Safety limit to prevent infinite loops
          if (currentOffset > 10000) break
        }

        // Filter posts that have this category ID in their categoryIds array
        const filteredPosts = allPosts.filter((post: any) =>
          post.categoryIds && Array.isArray(post.categoryIds) && post.categoryIds.includes(categoryId)
        )

        // Apply pagination to filtered results
        total = filteredPosts.length
        posts = filteredPosts.slice(offset, offset + limit).map((post: any) => ({
          ...post,
          readTime: toReadTime(post.minutesToRead),
        }))
      } else {
        // Fallback: If category not found, return empty
        posts = []
        total = 0
      }
    } else {
      // No category filter, use normal API call
      const result = await wixServerClient.posts.listPosts({
        paging: { limit, offset },
        // @ts-expect-error Wix types accept union strings here
        sort,
      })

      posts = result.posts ?? []
      total = result.metaData?.total ?? 0
      posts = posts.map((post: any) => ({
        ...post,
        readTime: toReadTime(post.minutesToRead),
      }))
    }

    return NextResponse.json(
      { posts, metaData: { total } },
      { status: 200, headers: getCorsHeaders(req.headers.get('origin')) }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to fetch blog posts." },
      { status: 500, headers: getCorsHeaders(req.headers.get('origin')) }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CACHE_HEADERS,
  })
}
// app/api/treatments/route.ts
// Clean treatments API using centralized service

import { NextResponse } from "next/server"
import { getTreatments } from "@/lib/services/treatments"
import { CACHE_HEADERS } from "@/lib/api/pagination"

/**
 * Parse query parameters for treatments API
 */
function parseParams(url: URL) {
  const pageSizeParam = Number.parseInt(url.searchParams.get("pageSize") || "50", 10)
  const pageParam = Number.parseInt(url.searchParams.get("page") || "0", 10)
  const pageSize = Number.isFinite(pageSizeParam) ? Math.min(Math.max(1, pageSizeParam), 100) : 50
  const page = Number.isFinite(pageParam) ? Math.max(0, pageParam) : 0

  return {
    q: url.searchParams.get("q")?.trim() || undefined,
    category: url.searchParams.get("category")?.trim() || undefined,
    popular: url.searchParams.get("popular") === "true",
    page,
    pageSize,
    sortBy: (url.searchParams.get("sortBy") as any) || 'default',
  }
}

/**
 * GET /api/treatments
 * 
 * Query parameters:
 * - q: search query
 * - category: filter by category
 * - popular: filter popular only
 * - page: page number (default: 0)
 * - pageSize: items per page (default: 50, max: 200)
 * - sortBy: popular | az | za | default
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const filters = parseParams(url)

    const result = await getTreatments(filters)

    return NextResponse.json({
      ...result,
      filteredCount: result.total,
    }, {
      headers: {
        ...CACHE_HEADERS,
        'X-Has-More': String(result.hasMore),
        'X-Total-Count': String(result.total),
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error('API treatments error:', error)

    return NextResponse.json({
      items: [],
      total: 0,
      page: 0,
      pageSize: 50,
      hasMore: false,
      filteredCount: 0,
      error: errorMessage,
      warning: 'Using fallback data - see server logs for details'
    }, {
      status: 500,
      headers: CACHE_HEADERS,
    })
  }
}

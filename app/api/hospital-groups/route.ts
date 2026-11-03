// app/api/hospital-groups/route.ts
// Clean hospital groups API using centralized service

import { NextResponse } from "next/server"
import { getHospitalGroups } from "@/lib/services/hospital-groups"
import { CACHE_HEADERS } from "@/lib/api/pagination"

/**
 * Parse query parameters for hospital groups API
 */
function parseParams(url: URL) {
  return {
    q: url.searchParams.get("q")?.trim() || undefined,
    specialty: url.searchParams.get("specialty")?.trim() || undefined,
    city: url.searchParams.get("city")?.trim() || undefined,
    page: Math.max(0, parseInt(url.searchParams.get("page") || "0", 10)),
    pageSize: Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(url.searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10))),
    sortBy: (url.searchParams.get("sortBy") as any) || 'default',
  }
}

// Default to fetching 20 hospital groups for optimal performance (prevents 2MB cache limit)
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

/**
 * GET /api/hospital-groups
 * 
 * Query parameters:
 * - q: search query
 * - specialty: filter by specialty
 * - city: filter by city
 * - page: page number (default: 0)
 * - pageSize: items per page (default: 50, max: 500)
 * - sortBy: az | za | default
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const filters = parseParams(url)

    const result = await getHospitalGroups(filters)

    return NextResponse.json({
      items: result.items,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        hasMore: result.hasMore,
      },
    }, {
      headers: CACHE_HEADERS,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to fetch hospital groups" },
      { status: 500, headers: CACHE_HEADERS }
    )
  }
}

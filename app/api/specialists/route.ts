// app/api/specialists/route.ts
// Clean specialists API using centralized service

import { NextResponse } from "next/server"
import { getSpecialists } from "@/lib/services/specialists"
import { CACHE_HEADERS } from "@/lib/api/pagination"

/**
 * Parse query parameters for specialists API
 */
function parseParams(url: URL) {
  return {
    q: url.searchParams.get("q")?.trim() || undefined,
    department: url.searchParams.get("department")?.trim() || undefined,
    treatment: url.searchParams.get("treatment")?.trim() || undefined,
    hospital: url.searchParams.get("hospital")?.trim() || undefined,
    city: url.searchParams.get("city")?.trim() || undefined,
    branch: url.searchParams.get("branch")?.trim() || undefined,
    page: Math.max(0, parseInt(url.searchParams.get("page") || "0", 10)),
    pageSize: Math.min(500, Math.max(1, parseInt(url.searchParams.get("pageSize") || "100", 10))),
    sortBy: (url.searchParams.get("sortBy") as any) || 'default',
  }
}

/**
 * GET /api/specialists
 * 
 * Query parameters:
 * - q: search query
 * - department: filter by department
 * - treatment: filter by treatment
 * - hospital: filter by hospital
 * - city: filter by city
 * - branch: filter by branch
 * - page: page number (default: 0)
 * - pageSize: items per page (default: 50, max: 500)
 * - sortBy: az | za | default
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const filters = parseParams(url)

    const result = await getSpecialists(filters)

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
    return NextResponse.json(
      { error: "Failed to fetch specialists" },
      { status: 500 }
    )
  }
}

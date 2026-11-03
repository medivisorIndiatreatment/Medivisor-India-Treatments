// app/api/departments/route.ts
// Departments API with multi-reference mapping and limited treatments

import { NextResponse } from "next/server"
import { getDepartments } from "@/lib/services/departments"
import { CACHE_HEADERS } from "@/lib/api/pagination"

// Default to fetching 20 departments for optimal performance (prevents 2MB cache limit)
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

/**
 * Parse query parameters for departments API
 */
function parseParams(url: URL) {
  return {
    q: url.searchParams.get("q")?.trim() || undefined,
    specialist: url.searchParams.get("specialist")?.trim() || undefined,
    branch: url.searchParams.get("branch")?.trim() || undefined,
    treatment: url.searchParams.get("treatment")?.trim() || undefined,
    page: Math.max(0, parseInt(url.searchParams.get("page") || "0", 10)),
    pageSize: Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(url.searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10))),
    sortBy: (url.searchParams.get("sortBy") as any) || 'default',
  }
}

/**
 * GET /api/departments
 * 
 * Query parameters:
 * - q: search query
 * - specialist: filter by specialist
 * - branch: filter by branch
 * - treatment: filter by treatment
 * - page: page number (default: 0)
 * - pageSize: items per page (default: 100, max: 500)
 * - sortBy: az | za | default
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const filters = parseParams(url)

     const result = await getDepartments(filters)

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
    console.error('API departments error:', error)
    
    // Return empty data instead of 500 error to allow app to continue working
    return NextResponse.json({
      items: [],
      pagination: {
        page: 0,
        pageSize: 100,
        total: 0,
        hasMore: false,
      },
      error: errorMessage,
      warning: 'Using fallback data - see server logs for details'
    }, {
      status: 500,
      headers: CACHE_HEADERS,
    })
  }
}

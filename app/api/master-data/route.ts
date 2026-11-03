// app/api/master-data/route.ts
// Clean master data API using centralized service

import { NextResponse } from "next/server"
import { getMasterData } from "@/lib/services/master-data"
import { CACHE_HEADERS } from "@/lib/api/pagination"

/**
 * Parse query parameters for master data API
 */
function parseParams(url: URL) {
  return {
    type: (url.searchParams.get("type") as any) || 'all',
    q: url.searchParams.get("q")?.trim() || undefined,
    page: Math.max(0, parseInt(url.searchParams.get("page") || "0", 10)),
    pageSize: Math.min(500, Math.max(1, parseInt(url.searchParams.get("pageSize") || "100", 10))),
  }
}

/**
 * GET /api/master-data
 * 
 * Query parameters:
 * - type: all | departments | specialist | treatments | hospital-groups | branches
 * - q: search query
 * - page: page number (default: 0)
 * - pageSize: items per page (default: 100, max: 500)
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const filters = parseParams(url)

    const result = await getMasterData(filters)

    return NextResponse.json(result, {
      headers: CACHE_HEADERS,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to fetch master data" },
      { status: 500 }
    )
  }
}

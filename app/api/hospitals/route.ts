// app/api/hospitals/route.ts
// Clean hospitals API using centralized service

import { NextResponse } from "next/server"
import { getHospitals } from "@/lib/services/hospitals"
import { CACHE_HEADERS } from "@/lib/api/pagination"

const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 200

const SORT_BY_VALUES = ['popular', 'az', 'za', 'default'] as const
type SortBy = typeof SORT_BY_VALUES[number]

function parseParams(url: URL) {
  const rawSort = url.searchParams.get("sortBy") || 'default'
  const sortBy = (SORT_BY_VALUES as readonly string[]).includes(rawSort) ? (rawSort as SortBy) : 'default'
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(url.searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10)))
  return {
    q: url.searchParams.get("q")?.trim() || undefined,
    city: url.searchParams.get("city")?.trim() || undefined,
    state: url.searchParams.get("state")?.trim() || undefined,
    treatment: url.searchParams.get("treatment")?.trim() || undefined,
    specialization: url.searchParams.get("specialization")?.trim() || undefined,
    department: url.searchParams.get("department")?.trim() || undefined,
    branch: url.searchParams.get("branch")?.trim() || undefined,
    popular: url.searchParams.get("popular") === "true",
    page: Math.max(0, parseInt(url.searchParams.get("page") || "0", 10)),
    pageSize,
    sortBy,
    dropdown: url.searchParams.get("dropdown") === "true",
  }
}

export async function GET(req: Request) {
  const requestId = crypto.randomUUID?.() || Date.now().toString()
  try {
    const url = new URL(req.url)
    const filters = parseParams(url)

    const result = await getHospitals(filters as any)

    if ('items' in result && !('hasMore' in result)) {
      return NextResponse.json(result, {
        headers: { ...CACHE_HEADERS, 'X-Request-Id': requestId },
      })
    }

    return NextResponse.json({
      ...result,
      filteredCount: result.total,
    }, {
      headers: {
        ...CACHE_HEADERS,
        'X-Has-More': String(result.hasMore),
        'X-Total-Count': String(result.total),
        'X-Request-Id': requestId,
      },
    })
  } catch (error) {
    console.error('[api/hospitals] request failed', { requestId, error })
    return NextResponse.json(
      { error: "Failed to fetch hospitals", requestId },
      { status: 500, headers: CACHE_HEADERS }
    )
  }
}

// app/api/doctors/route.ts
// Clean doctors API using centralized service

import { NextResponse } from "next/server"
import { getDoctors } from "@/lib/services/doctors"
import { CACHE_HEADERS } from "@/lib/api/pagination"

type DoctorFilters = Parameters<typeof getDoctors>[0]

function parseParams(url: URL): DoctorFilters {
  return {
    q: url.searchParams.get("q")?.trim() || undefined,
    specialization: url.searchParams.get("specialization")?.trim() || undefined,
    hospital: url.searchParams.get("hospital")?.trim() || undefined,
    city: url.searchParams.get("city")?.trim() || undefined,
    popular: url.searchParams.get("popular") === "true",
    page: Math.max(0, parseInt(url.searchParams.get("page") || "0", 10)),
    pageSize: Math.max(1, parseInt(url.searchParams.get("pageSize") || "50", 10)),
    sortBy: (url.searchParams.get("sortBy") as DoctorFilters["sortBy"]) || 'default',
  }
}

export async function GET(req: Request) {
  const requestId = crypto.randomUUID?.() || Date.now().toString()
  try {
    const url = new URL(req.url)
    const filters = parseParams(url)

    const result = await getDoctors(filters)

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
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to fetch doctors", requestId, message },
      { status: 500 }
    )
  }
}
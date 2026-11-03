// app/api/hospital-groups/[slug]/route.ts
// Get single hospital group by slug

import { NextResponse } from "next/server"
import { getHospitalGroupBySlug } from "@/lib/services/hospital-groups"

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
}

/**
 * GET /api/hospital-groups/[slug]
 * Get single hospital group by slug
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const group = await getHospitalGroupBySlug(slug)

    if (!group) {
      return NextResponse.json(
        { error: 'Hospital group not found' },
        { status: 404, headers: CACHE_HEADERS }
      )
    }

    return NextResponse.json(group, {
      headers: CACHE_HEADERS,
    })
  } catch (error) {
    console.error('Error fetching hospital group:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hospital group' },
      { status: 500, headers: CACHE_HEADERS }
    )
  }
}

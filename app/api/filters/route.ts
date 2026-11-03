// app/api/filters/route.ts
// Clean filters API using centralized service

import { NextResponse } from "next/server"
import { getFilters } from "@/lib/services/filters"
import { CACHE_HEADERS } from "@/lib/api/pagination"

/**
 * GET /api/filters
 * 
 * Returns all filter options for search pages:
 * - cities: List of cities with states
 * - states: List of unique states
 * - treatments: List of treatments with categories
 * - specializations: List of specializations with departments
 * - departments: List of departments
 * - hospitals: List of hospitals
 * - branches: List of branches with hospital and city info
 */
export async function GET() {
  try {
    const filterOptions = await getFilters()

    // Add specialist list (simplified version)
    const specialistList = filterOptions.specializations.map(s => ({
      id: s.id,
      name: s.name,
      department: s.department,
    }))

    return NextResponse.json({
      ...filterOptions,
      specialist: specialistList,
    }, {
      headers: {
        ...CACHE_HEADERS,
        'X-Cache': 'MISS',
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error('Filters API error:', errorMessage)
    
    return NextResponse.json(
      { error: "Failed to fetch filter options" },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    )
  }
}

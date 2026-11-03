// app/api/departments/[slug]/route.ts
// Get single department by slug/name with ALL treatments

import { NextResponse } from "next/server"
import { getDepartmentWithAllTreatments, getDepartmentsWithMapping } from "@/lib/services/departments"

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
}

/**
 * GET /api/departments/[slug]
 * Returns department with ALL treatments (no limit) for slug page
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Try to find by slug first
    const department = await getDepartmentWithAllTreatments(slug)
    
    if (department) {
      return NextResponse.json(department, {
        headers: CACHE_HEADERS,
      })
    }
    
    // Try to find by decoding slug to name
    const searchName = slug.replace(/-/g, ' ').replace(/[^a-z0-9 ]/gi, '')
    const allDepartments = await getDepartmentsWithMapping()
    
    const found = allDepartments.find((dept) => 
      dept.name?.toLowerCase().includes(searchName.toLowerCase()) ||
      searchName.toLowerCase().includes(dept.name?.toLowerCase())
    )
    
    if (found) {
      return NextResponse.json(found, {
        headers: CACHE_HEADERS,
      })
    }
    
    return NextResponse.json(
      { error: 'Department not found' },
      { status: 404, headers: CACHE_HEADERS }
    )
  } catch (error) {
    console.error('Error fetching department:', error)
    return NextResponse.json(
      { error: 'Failed to fetch department' },
      { status: 500, headers: CACHE_HEADERS }
    )
  }
}

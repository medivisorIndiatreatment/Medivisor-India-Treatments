// app/api/branches/route.ts
// Clean branches API using centralized service with all required fields

import { NextResponse } from "next/server"
import { getBranches } from "@/lib/services/branches"
import { generateSlug } from "@/lib/slug-utils"
import { CACHE_HEADERS } from "@/lib/api/pagination"

// Generate ETag for response
function generateETag(data: unknown): string {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `"${hash.toString(16)}"`
}

/**
 * Parse query parameters for branches API
 */
function parseParams(url: URL) {
  return {
    q: url.searchParams.get("q")?.trim() || undefined,
    slug: url.searchParams.get("slug")?.trim() || undefined,
    city: url.searchParams.get("city")?.trim() || undefined,
    state: url.searchParams.get("state")?.trim() || undefined,
    hospital: url.searchParams.get("hospital")?.trim() || undefined,
    treatment: url.searchParams.get("treatment")?.trim() || undefined,
    department: url.searchParams.get("department")?.trim() || undefined,
    specialist: url.searchParams.get("specialist")?.trim() || undefined,
    popular: url.searchParams.get("popular") === "true",
    page: Math.max(0, parseInt(url.searchParams.get("page") || "0", 10)),
    pageSize: Math.min(2000, Math.max(1, parseInt(url.searchParams.get("pageSize") || "1000", 10))),
    sortBy: (url.searchParams.get("sortBy") as any) || 'default',
  }
}

/**
 * Normalize branch data to include all required fields from CSV
 */
function normalizeBranchData(branch: any) {
  // Extract city data
  const cityData = Array.isArray(branch.city) ? branch.city : []
  const cityName = cityData[0]?.cityName || cityData[0]?.name || ''
  const state = cityData[0]?.state || ''

  // Extract department data
  const departmentData = Array.isArray(branch.department) ? branch.department : []
  
  // Extract sub-department data
  const subDepartmentData = Array.isArray(branch.subDepartment) ? branch.subDepartment : []

  // Extract doctor names
  const doctorNames = Array.isArray(branch.doctorNames) 
    ? branch.doctorNames 
    : Array.isArray(branch.doctors) 
      ? branch.doctors.map((d: any) => d.doctorName || d.name || '').filter(Boolean)
      : []

  // Extract accreditation
  const accreditationData = Array.isArray(branch.accreditation) ? branch.accreditation : []

  return {
    // Core identification
    ID: branch._id,
    _id: branch._id,
    branchName: branch.branchName || branch.name || '',
    slug: branch.slug || generateSlug(branch.branchName || ''),
    
    // Hospital reference
    hospitalId: branch.hospitalId || branch.hospitalId?._id || null,
    hospitalName: branch.hospitalName || branch.hospitalName?.name || '',
    hospitalGroup: branch.hospitalGroup || null,
    
    // Location
    address: branch.address || null,
    city: cityData,
    cityName: cityName,
    state: state,
    
    // Department multi-references
    department: departmentData,
    SubDepartment: subDepartmentData,
    
    // Medical data
    specialty: branch.specialist || branch.specialty || [],
    specialization: branch.specialization || [],
    treatments: branch.treatments || [],
    doctors: branch.doctors || [],
    doctorNames: doctorNames,
    accreditation: accreditationData,
    
    // Hospital details
    totalBeds: branch.totalBeds || null,
    noOfDoctors: branch.noOfDoctors || null,
    yearEstablished: branch.yearEstablished || null,
    
    // Media
    branchImage: branch.branchImage || null,
    logo: branch.logo || null,
    
    // Flags
    showHospital: branch.showHospital !== undefined ? branch.showHospital : true,
    popular: branch.popular || false,
    
    // Content
    description: branch.description || null,
    descriptionHtml: branch.descriptionHtml || null,
    
    // System fields
    createdDate: branch.createdDate || null,
    updatedDate: branch.updatedDate || null,
    owner: branch.owner || null,
    
    // Custom sort field
    manualSort: branch.manualSort || null,
  }
}

/**
 * GET /api/branches
 * 
 * Query parameters:
 * - q: search query
 * - slug: filter by slug
 * - city: filter by city
 * - state: filter by state
 * - hospital: filter by hospital
 * - treatment: filter by treatment
 * - department: filter by department
 * - specialist: filter by specialist
 * - popular: filter popular only
 * - page: page number (default: 0)
 * - pageSize: items per page (default: 50, max: 500)
 * - sortBy: popular | az | za | default
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const filters = parseParams(url)

    const result = await getBranches(filters)

    // Normalize branch data to include all required fields
    const normalizedItems = result.items.map(branch => normalizeBranchData(branch))

    const responseData = {
      items: normalizedItems,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      hasMore: result.hasMore,
      filteredCount: result.total,
    }

    // Generate ETag for caching
    const etag = generateETag(responseData)

    // Check if client has valid cached response
    const clientETag = req.headers.get('If-None-Match')
    if (clientETag === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'Cache-Control': CACHE_HEADERS['Cache-Control'],
          'ETag': etag,
        },
      })
    }

    return NextResponse.json(responseData, {
      headers: {
        ...CACHE_HEADERS,
        'ETag': etag,
        'X-Has-More': String(result.hasMore),
        'X-Total-Count': String(result.total),
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500, headers: CACHE_HEADERS }
    )
  }
}

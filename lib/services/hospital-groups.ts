// lib/services/hospital-groups.ts
// Clean hospital group service with extraction, filtering, and pagination

import { getAllCMSData } from '@/lib/cms'
import { generateSlug, cleanSlug } from '@/lib/slug-utils'
import type { CMSDataResponse } from '@/lib/cms/types'
import type { PaginatedResult } from '@/lib/api/pagination'

// =============================================================================
// TYPES
// =============================================================================

export interface HospitalGroupFilterParams {
  q?: string
  specialty?: string
  city?: string
  page?: number
  pageSize?: number
  sortBy?: 'az' | 'za' | 'default'
}

export interface HospitalGroup {
  _id: string
  hospitalName: string
  yearEstablished?: string | null
  hospitalImage?: string | null
  logo?: string | null
  slug?: string | null
  description?: string | null
  descriptionHtml?: string | null
  branches?: any[]
  hospitalList?: any[]
  specialty?: any[]
  isStandalone?: boolean
}

// =============================================================================
// EXTRACTION
// =============================================================================

/**
 * Extract all hospital groups with their relationships.
 *
 * Each HospitalMaster (Hospital Group) CMS record is its OWN group, keyed by its
 * unique `_id`. The group's slug is derived from its own hospital name
 * (`generateSlug(hospitalName)`) so every group uses its own CMS identity, and only
 * the branches referenced by THAT record are attached — no cross-record aggregation
 * and no merging of unrelated hospitals that happen to share a slug.
 */
export function extractAllHospitalGroups(cmsData: any): HospitalGroup[] {
  const groups: HospitalGroup[] = []

  cmsData.hospitals?.forEach((hospital: any) => {
    if (hospital.isStandalone === true) return
    if (!hospital.hospitalName) return
    // A group must own at least one branch; otherwise it has no group page.
    if (!hospital.branches || hospital.branches.length === 0) return

    const hospitalId = hospital._id
    const hospitalName = hospital.hospitalName
    const slug = hospital.slug || generateSlug(hospitalName)

    const branches = (hospital.branches || [])
      .filter((b: any) => b?._id)
      .map((b: any) => b)

    const specialty = (hospital.specialty || []).map((s: any) => ({
      _id: s?._id || s?.name,
      name: s?.name || '',
    }))

    groups.push({
      _id: hospitalId,
      hospitalName,
      yearEstablished: hospital.yearEstablished,
      hospitalImage: hospital.hospitalImage,
      logo: hospital.logo,
      slug,
      description: hospital.description,
      descriptionHtml: (hospital as any).descriptionHtml || null,
      branches,
      hospitalList: [
        {
          _id: hospitalId,
          hospitalName,
          description: hospital.description,
          yearEstablished: hospital.yearEstablished,
          hospitalImage: hospital.hospitalImage,
          logo: hospital.logo,
          branches,
        },
      ],
      specialty,
      isStandalone: false,
    })
  })

  return groups
}

// =============================================================================
// FILTERING
// =============================================================================

/** Apply filters to hospital group data */
export function applyHospitalGroupFilters(groups: HospitalGroup[], filters: HospitalGroupFilterParams): HospitalGroup[] {
  let result = groups

  // Search query filter
  if (filters.q) {
    const query = filters.q.toLowerCase()
    result = result.filter(g =>
      g.hospitalName?.toLowerCase().includes(query) ||
      g.description?.toLowerCase().includes(query)
    )
  }

  // Specialty filter
  if (filters.specialty) {
    const specQuery = filters.specialty.toLowerCase()
    result = result.filter(g =>
      g.specialty?.some((s: any) =>
        s.name?.toLowerCase().includes(specQuery) ||
        s._id === filters.specialty
      )
    )
  }

  // City filter
  if (filters.city) {
    const cityQuery = filters.city.toLowerCase()
    result = result.filter(g =>
      g.branches?.some((b: any) => {
        const cityValue = b.city
        if (Array.isArray(cityValue)) {
          return cityValue.some((c: any) =>
            typeof c === 'string' ? c.toLowerCase().includes(cityQuery) : c?.cityName?.toLowerCase().includes(cityQuery)
          )
        }
        if (typeof cityValue === 'string') {
          return cityValue.toLowerCase().includes(cityQuery)
        }
        return false
      })
    )
  }

  // Sort
  switch (filters.sortBy) {
    case 'az':
      result = [...result].sort((a, b) => (a.hospitalName || '').localeCompare(b.hospitalName || ''))
      break
    case 'za':
      result = [...result].sort((a, b) => (b.hospitalName || '').localeCompare(a.hospitalName || ''))
      break
  }

  return result
}

// =============================================================================
// MAIN SERVICE
// =============================================================================

/**
 * Get hospital groups with filtering and pagination
 */
export async function getHospitalGroups(filters: HospitalGroupFilterParams): Promise<PaginatedResult<HospitalGroup>> {
  const cmsData = await getAllCMSData()

  const allGroups = extractAllHospitalGroups(cmsData)
  const filteredGroups = applyHospitalGroupFilters(allGroups, filters)

  const page = filters.page ?? 0
  const pageSize = filters.pageSize ?? 1000

  const total = filteredGroups.length
  const startIndex = page * pageSize
  const endIndex = startIndex + pageSize
  const paginatedItems = filteredGroups.slice(startIndex, endIndex)
  const hasMore = endIndex < total

  return {
    items: paginatedItems,
    total,
    page,
    pageSize,
    hasMore,
  }
}

/**
 * Get all hospital groups (for detail pages)
 */
export async function getAllHospitalGroups(): Promise<HospitalGroup[]> {
  const cmsData = await getAllCMSData()
  return extractAllHospitalGroups(cmsData)
}

// =============================================================================
// DETAIL (SLUG) LOOKUP
// =============================================================================

/**
 * Resolve a single hospital group by slug.
 *
 * Each HospitalMaster (Hospital Group) CMS record is its own group, keyed by its
 * own slug (`generateSlug(hospitalName)`). We match the record by slug and return
 * ONLY that group's own branches and specialties — never branches aggregated from
 * unrelated hospital records. Enriched branch data from the CMS is preserved so the
 * detail UI can render branch images, bed counts, accreditations, and doctors.
 */
export async function getHospitalGroupBySlug(slug: string, cmsData?: CMSDataResponse): Promise<HospitalGroup | null> {
  if (!cmsData) {
    cmsData = await getAllCMSData()
  }

  const normalizedSlug = generateSlug(slug)
  const cleanedSlug = generateSlug(cleanSlug(slug))

  const group = (cmsData.hospitals || []).find((h: any) => {
    if (!h?.hospitalName) return false
    if (h.isStandalone === true) return false
    if (!h.branches || h.branches.length === 0) return false
    const hospitalSlug = h.slug || generateSlug(h.hospitalName)
    return hospitalSlug === normalizedSlug || (cleanedSlug && hospitalSlug === cleanedSlug)
  })

  if (!group) return null

  const branches = (group.branches || []).filter((b: any) => b?._id)
  const specialty = (group.specialty || []).map((s: any) => ({
    _id: s?._id || s?.name,
    name: s?.name || '',
  }))

  return {
    _id: group._id,
    hospitalName: group.hospitalName,
    yearEstablished: group.yearEstablished,
    hospitalImage: group.hospitalImage || group.logo || null,
    logo: group.logo || null,
    slug: normalizedSlug,
    description: group.description,
    descriptionHtml: (group as any).descriptionHtml || null,
    branches,
    hospitalList: [
      {
        _id: group._id,
        hospitalName: group.hospitalName,
        description: group.description,
        yearEstablished: group.yearEstablished,
        hospitalImage: group.hospitalImage,
        logo: group.logo,
        branches,
      },
    ],
    specialty,
    isStandalone: false,
  }
}

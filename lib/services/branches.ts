// lib/services/branches.ts
// Clean branch service with extraction, filtering, and pagination

import { getAllCMSData } from '@/lib/cms'
import { generateSlug } from '@/lib/slug-utils'
import { DELHI_NCR_CITIES, isDelhiNCRFilter } from '@/lib/utils/city-utils'
import type { PaginatedResult } from '@/lib/api/pagination'
import {
  createPaginatedResult,
  sortByAlphabet,
  sortByPopular,
  isNonEmptyString,
  isNonEmptyArray,
} from './base-service'

// =============================================================================
// TYPES
// =============================================================================

export interface BranchFilterParams {
  q?: string
  slug?: string
  city?: string
  state?: string
  hospital?: string
  treatment?: string
  department?: string
  specialist?: string
  popular?: boolean
  page?: number
  pageSize?: number
  sortBy?: 'popular' | 'az' | 'za' | 'default'
}

export interface Branch {
  _id: string
  branchName: string
  name?: string
  slug?: string
  address?: string
  description?: string
  hospitalId?: string
  hospitalName?: string
  city?: unknown[]
  treatments?: unknown[]
  specialist?: unknown[]
  department?: unknown[]
  specialization?: unknown[]
  popular?: boolean
  showHospital?: boolean
  totalBeds?: string | null
  noOfDoctors?: string | null
  yearEstablished?: string | null
  branchImage?: string | null
  logo?: string | null
  accreditation?: unknown[]
  subDepartment?: unknown[]
  hospitalGroup?: string | null
  createdDate?: string | null
  updatedDate?: string | null
  owner?: string | null
  manualSort?: string | null
  doctorNames?: string[]
}

// =============================================================================
// EXTRACTION
// =============================================================================

/** Extract all branches from hospitals */
export function extractAllBranches(hospitals: unknown[]): Branch[] {
  const branches: Branch[] = []

  hospitals.forEach((hospital: any) => {
    const hospitalBranches = hospital.branches || hospital.data?.branches || []
    if (hospitalBranches && Array.isArray(hospitalBranches)) {
      branches.push(
        ...hospitalBranches.map((branch: any) => ({
          ...branch,
          hospitalId: hospital._id,
          hospitalName: hospital.hospitalName,
        }))
      )
    }
  })

  return branches
}

// =============================================================================
// FILTERING
// =============================================================================

/** Apply filters to branch data */
export function applyBranchFilters(
  branches: Branch[],
  filters: BranchFilterParams
): Branch[] {
  let result = branches

  // Search query filter
  if (isNonEmptyString(filters.q)) {
    const query = filters.q.toLowerCase()
    result = result.filter((b) =>
      b.branchName?.toLowerCase().includes(query) ||
      b.address?.toLowerCase().includes(query) ||
      b.description?.toLowerCase().includes(query)
    )
  }

  // Slug filter
  if (isNonEmptyString(filters.slug)) {
    const slugQuery = filters.slug.toLowerCase().replace(/-/g, ' ')
    result = result.filter((b) => {
      if (b.slug && generateSlug(b.slug) === slugQuery) return true
      const branchName = (b.branchName || b.name || '').toLowerCase().replace(/-/g, ' ')
      return (
        branchName === slugQuery ||
        branchName.includes(slugQuery) ||
        slugQuery.includes(branchName)
      )
    })
  }

  // City filter with NCR support
  if (isNonEmptyString(filters.city)) {
    const cityQuery = filters.city.toLowerCase().trim()
    const isNCRFilter = isDelhiNCRFilter(filters.city)

    result = result.filter((b) => {
      if (!isNonEmptyArray(b.city)) return false

      return (b.city as any[]).some((c: any) => {
        const cityName = (c?.cityName?.toLowerCase()?.trim() || c?.name?.toLowerCase()?.trim() || '')

        if (isNCRFilter) {
          return DELHI_NCR_CITIES.has(cityName)
        }

        // Single city filter - exact match only
        return cityName === cityQuery
      })
    })
  }

  // State filter
  if (isNonEmptyString(filters.state)) {
    const stateQuery = filters.state.toLowerCase()
    result = result.filter((b) => {
      if (!isNonEmptyArray(b.city)) return false
      return (b.city as any[]).some((c: any) =>
        (c?.state?.toLowerCase().includes(stateQuery)) ||
        (c?.State?.toLowerCase().includes(stateQuery))
      )
    })
  }

  // Hospital filter
  if (isNonEmptyString(filters.hospital)) {
    const hospitalQuery = filters.hospital.toLowerCase()
    result = result.filter((b) =>
      b.hospitalName?.toLowerCase().includes(hospitalQuery)
    )
  }

  // Treatment filter
  if (isNonEmptyString(filters.treatment)) {
    const treatmentQuery = filters.treatment.toLowerCase()
    result = result.filter((b) =>
      b.treatments?.some((t: any) =>
        t.name?.toLowerCase().includes(treatmentQuery)
      ) ||
      b.specialist?.some((s: any) =>
        s.name?.toLowerCase().includes(treatmentQuery)
      ) ||
      b.specialization?.some((s: any) =>
        s.name?.toLowerCase().includes(treatmentQuery)
      )
    )
  }

  // Department filter
  if (isNonEmptyString(filters.department)) {
    const deptQuery = filters.department.toLowerCase()
    result = result.filter((b) =>
      b.department?.some((d: any) =>
        d.name?.toLowerCase().includes(deptQuery)
      ) ||
      b.specialist?.some((s: any) =>
        s.department?.some((d: any) =>
          d.name?.toLowerCase().includes(deptQuery)
        )
      )
    )
  }

  // Specialist filter
  if (isNonEmptyString(filters.specialist)) {
    const specQuery = filters.specialist.toLowerCase()
    result = result.filter((b) =>
      b.specialist?.some((s: any) =>
        s.name?.toLowerCase().includes(specQuery)
      )
    )
  }

  // Popular filter
  if (filters.popular) {
    result = result.filter((b) => b.popular === true)
  }

  // Sort
  if (filters.sortBy === 'popular') {
    result = sortByPopular(result)
  } else if (filters.sortBy === 'az') {
    result = sortByAlphabet(result, (b) => b.branchName || '')
  } else if (filters.sortBy === 'za') {
    result = sortByAlphabet(result, (b) => b.branchName || '', 'desc')
  }

  return result
}

// =============================================================================
// MAIN SERVICE
// =============================================================================

/** Get branches with filtering and pagination */
export async function getBranches(filters: BranchFilterParams): Promise<PaginatedResult<Branch>> {
  const { hospitals } = await getAllCMSData()

  const allBranches = extractAllBranches(hospitals)
  const filteredBranches = applyBranchFilters(allBranches, filters)

  const page = filters.page ?? 0
  const pageSize = Math.min(2000, filters.pageSize ?? (filters.popular ? 50 : 1000))

  return createPaginatedResult(filteredBranches, page, pageSize)
}

/** Get all branches (for detail pages) */
export async function getAllBranches(): Promise<Branch[]> {
  const { hospitals } = await getAllCMSData()
  return extractAllBranches(hospitals)
}
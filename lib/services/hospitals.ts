// lib/services/hospitals.ts
// Clean hospital service with extraction, filtering, and pagination

import { getAllCMSData } from '@/lib/cms'
import { generateSlug } from "@/lib/slug-utils";
import type { PaginatedResult } from '@/lib/api/pagination'
import {
  createPaginatedResult,
  sortByAlphabet,
  sortByPopular,
  isNonEmptyString,
  matchers,
} from './base-service'

// =============================================================================
// TYPES
// =============================================================================

export interface HospitalFilterParams {
  q?: string
  city?: string
  state?: string
  treatment?: string
  specialization?: string
  department?: string
  branch?: string
  popular?: boolean
  page?: number
  pageSize?: number
  sortBy?: 'popular' | 'az' | 'za' | 'default'
  dropdown?: boolean
}

export interface Hospital {
  _id: string
  hospitalName: string
  slug?: string
  hospitalSlug?: string
  address?: string
  description?: string
  hospitalImage?: string
  logo?: string
  yearEstablished?: string
  popular?: boolean
  branches?: unknown[]
  treatments?: unknown[]
  specialist?: unknown[]
}

// =============================================================================
// EXTRACTION
// =============================================================================

/** Extract flattened branch data for dropdown */
export function extractBranchesForDropdown(hospitals: unknown[]): unknown[] {
  const allBranches: unknown[] = []

  hospitals.forEach((hospital: any) => {
    const hospitalSlug = hospital.slug || hospital.hospitalSlug || ''
    const hospitalNameSlug = generateSlug(hospital.hospitalName)

    if (hospital.branches && Array.isArray(hospital.branches)) {
      hospital.branches.forEach((branch: any) => {
        const branchNameSlug = generateSlug(branch.branchName || branch.name)
        const combinedSlug = branchNameSlug
          ? `${hospitalNameSlug || hospitalSlug}-${branchNameSlug}`
          : (hospitalNameSlug || hospitalSlug)

        allBranches.push({
          _id: branch._id || `${hospital._id}-${Math.random()}`,
          branchName: branch.branchName || branch.name || 'Unnamed Branch',
          hospitalName: hospital.hospitalName || 'Unknown Hospital',
          cityName: branch.city?.[0]?.cityName || '',
          hospitalSlug: hospitalNameSlug || hospitalSlug,
          address: branch.address || hospital.address || '',
        })
      })
    }
  })

  return allBranches
}

// =============================================================================
// FILTERING
// =============================================================================

/** Apply filters to hospital data */
export function applyHospitalFilters(
  hospitals: Hospital[],
  filters: HospitalFilterParams
): Hospital[] {
  let result = hospitals

  // Search query filter
  if (isNonEmptyString(filters.q)) {
    const query = filters.q.toLowerCase()
    result = result.filter((h) =>
      h.hospitalName?.toLowerCase().includes(query) ||
      h.branches?.some((b: any) =>
        b.city?.some((c: any) => c.cityName?.toLowerCase().includes(query)) ||
        b.branchName?.toLowerCase().includes(query) ||
        h.treatments?.some((t: any) => t.name?.toLowerCase().includes(query))
      )
    )
  }

  // City filter
  if (isNonEmptyString(filters.city)) {
    const cityQuery = filters.city.toLowerCase()
    result = result.filter((h) =>
      h.branches?.some((b: any) =>
        b.city?.some((c: any) => c.cityName?.toLowerCase() === cityQuery)
      )
    )
  }

  // State filter
  if (isNonEmptyString(filters.state)) {
    const stateQuery = filters.state.toLowerCase()
    result = result.filter((h) =>
      h.branches?.some((b: any) =>
        b.city?.some((c: any) =>
          c.state?.toLowerCase().includes(stateQuery) ||
          c.State?.toLowerCase().includes(stateQuery)
        )
      )
    )
  }

  // Treatment filter
  if (isNonEmptyString(filters.treatment)) {
    const treatmentQuery = filters.treatment.toLowerCase()
    result = result.filter((h) =>
      h.treatments?.some((t: any) =>
        t.name?.toLowerCase().includes(treatmentQuery) ||
        t._id === filters.treatment
      ) ||
      h.branches?.some((b: any) =>
        b.treatments?.some((t: any) =>
          t.name?.toLowerCase().includes(treatmentQuery) ||
          t._id === filters.treatment
        ) ||
        b.specialist?.some((s: any) =>
          s.treatments?.some((t: any) =>
            t.name?.toLowerCase().includes(treatmentQuery) ||
            t._id === filters.treatment
          )
        )
      )
    )
  }

  // Specialization filter
  if (isNonEmptyString(filters.specialization)) {
    const specQuery = filters.specialization.toLowerCase()
    result = result.filter((h) =>
      h.specialist?.some((s: any) =>
        s.name?.toLowerCase().includes(specQuery) ||
        s._id === filters.specialization
      ) ||
      h.treatments?.some((t: any) =>
        t.category?.toLowerCase().includes(specQuery)
      ) ||
      h.branches?.some((b: any) =>
        b.specialist?.some((s: any) =>
          s.name?.toLowerCase().includes(specQuery) ||
          s._id === filters.specialization
        ) ||
        b.specialization?.some((s: any) =>
          s.name?.toLowerCase().includes(specQuery)
        )
      )
    )
  }

  // Department filter
  if (isNonEmptyString(filters.department)) {
    const deptQuery = filters.department.toLowerCase()
    result = result.filter((h) =>
      h.specialist?.some((s: any) =>
        s.department?.some((d: any) => d.name?.toLowerCase().includes(deptQuery))
      ) ||
      h.treatments?.some((t: any) =>
        t.category?.toLowerCase().includes(deptQuery)
      ) ||
      h.branches?.some((b: any) =>
        b.department?.some((d: any) =>
          d.name?.toLowerCase().includes(deptQuery)
        ) ||
        b.specialist?.some((s: any) =>
          s.department?.some((d: any) => d.name?.toLowerCase().includes(deptQuery))
        ) ||
        b.specialization?.some((s: any) =>
          s.department?.some((d: any) => d.name?.toLowerCase().includes(deptQuery))
        )
      )
    )
  }

  // Branch filter
  if (isNonEmptyString(filters.branch)) {
    const branchQuery = filters.branch.toLowerCase()
    result = result.filter((h) =>
      h.branches?.some((b: any) =>
        b.branchName?.toLowerCase().includes(branchQuery) ||
        b._id === filters.branch ||
        b.name?.toLowerCase().includes(branchQuery)
      )
    )
  }

  // Popular filter
  if (filters.popular) {
    result = result.filter((h) => h.popular === true)
  }

  // Sort
  if (filters.sortBy === 'popular') {
    result = sortByPopular(result)
  } else if (filters.sortBy === 'az') {
    result = sortByAlphabet(result, (h) => h.hospitalName)
  } else if (filters.sortBy === 'za') {
    result = sortByAlphabet(result, (h) => h.hospitalName, 'desc')
  }

  return result
}

// =============================================================================
// MAIN SERVICE
// =============================================================================

/** Get hospitals with filtering and pagination */
export async function getHospitals(
  filters: HospitalFilterParams
): Promise<PaginatedResult<Hospital> | { items: unknown[]; total: number }> {
  const { hospitals } = await getAllCMSData()

  // Handle dropdown mode
  if (filters.dropdown) {
    const allBranches = extractBranchesForDropdown(hospitals)
    return {
      items: allBranches,
      total: allBranches.length,
    }
  }

  const filteredHospitals = applyHospitalFilters(hospitals as Hospital[], filters)
  const page = filters.page ?? 0
  const pageSize = filters.pageSize ?? 500

  return createPaginatedResult(filteredHospitals, page, pageSize)
}

/** Get all hospitals (for detail pages) */
export async function getAllHospitals(): Promise<Hospital[]> {
  const { hospitals } = await getAllCMSData()
  return hospitals as Hospital[]
}
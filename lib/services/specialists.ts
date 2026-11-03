// lib/services/specialists.ts
// Clean specialist service with extraction, filtering, and pagination

import { getAllCMSData, fetchAllSpecialists } from '@/lib/cms'
import type { PaginatedResult } from '@/lib/api/pagination'
import {
  createPaginatedResult,
  sortByAlphabet,
  isNonEmptyString,
  isNonEmptyArray,
} from './base-service'

// =============================================================================
// TYPES
// =============================================================================

export interface SpecialistFilterParams {
  q?: string
  department?: string
  treatment?: string
  hospital?: string
  city?: string
  branch?: string
  page?: number
  pageSize?: number
  sortBy?: 'az' | 'za' | 'default'
}

export interface Specialist {
  _id: string
  name: string
  department?: unknown[]
  treatments?: unknown[]
  branches?: unknown[]
  hospitalName?: string
  city?: unknown[]
}

// =============================================================================
// EXTRACTION
// =============================================================================

/** Extract all specialists with branch mapping */
export function extractAllSpecialists(
  hospitals: unknown[],
  masterSpecialists: unknown[]
): Specialist[] {
  const specialistMap = new Map<string, Specialist>()

  // Add master specialists
  masterSpecialists.forEach((spec: any) => {
    if (spec._id && spec.name) {
      const deptName = spec.department?.[0]?.name || spec.department?.name
      const treatmentNames = spec.treatment?.map(
        (t: any) => t.name || t.treatmentName || ''
      ).filter(Boolean) || []

      specialistMap.set(spec._id, {
        ...spec,
        name: spec.name,
        department: deptName ? [{ name: deptName }] : [],
        treatments: treatmentNames.map((t: string) => ({ name: t })),
        branches: [],
      })
    }
  })

  // Map hospital specialists
  hospitals.forEach((hospital: any) => {
    const hid = hospital._id || ''
    const hname = hospital.hospitalName || ''

    // Hospital-level specialists
    hospital.specialist?.forEach((spec: any) => {
      if (spec._id) {
        const existing = specialistMap.get(spec._id)
        const newBranch = { hospitalId: hid, hospitalName: hname }

        if (existing) {
          if (!existing.branches?.some((b: any) => b.branchId === newBranch.hospitalId)) {
            existing.branches = existing.branches || []
            existing.branches.push(newBranch)
          }
        } else {
          specialistMap.set(spec._id, {
            ...spec,
            branches: [newBranch],
          })
        }
      }
    })

    // Branch-level specialists
    hospital.branches?.forEach((branch: any) => {
      const bid = branch._id
      const bname = branch.branchName || branch.name || ''

      ;[branch.Specialist, branch.specialist].forEach((field) => {
        field?.forEach((spec: any) => {
          if (spec._id) {
            const existing = specialistMap.get(spec._id)
            const branchInfo = {
              hospitalId: hid,
              hospitalName: hname,
              branchId: bid,
              branchName: bname,
              city: branch.city,
            }

            if (existing) {
              const branchExists = existing.branches?.some(
                (b: any) => b.branchId === bid || (b.hospitalId === hid && b.branchName === bname)
              )
              if (!branchExists) {
                existing.branches = existing.branches || []
                existing.branches.push(branchInfo)
              }
            } else {
              specialistMap.set(spec._id, { ...spec, branches: [branchInfo] })
            }
          }
        })
      })
    })
  })

  return Array.from(specialistMap.values())
}

// =============================================================================
// FILTERING
// =============================================================================

/** Apply filters to specialist data */
export function applySpecialistFilters(
  specialists: Specialist[],
  filters: SpecialistFilterParams
): Specialist[] {
  let result = specialists

  if (isNonEmptyString(filters.q)) {
    const query = filters.q.toLowerCase()
    result = result.filter((s) => s.name?.toLowerCase().includes(query))
  }

  if (isNonEmptyString(filters.department)) {
    const deptQuery = filters.department.toLowerCase()
    result = result.filter((s) =>
      s.department?.some((d: any) => d.name?.toLowerCase().includes(deptQuery))
    )
  }

  if (isNonEmptyString(filters.treatment)) {
    const treatmentQuery = filters.treatment.toLowerCase()
    result = result.filter((s) =>
      s.treatments?.some((t: any) => t.name?.toLowerCase().includes(treatmentQuery))
    )
  }

  if (isNonEmptyString(filters.hospital)) {
    const hospitalQuery = filters.hospital.toLowerCase()
    result = result.filter((s) =>
      s.hospitalName?.toLowerCase().includes(hospitalQuery) ||
      s.branches?.some((b: any) => b.hospitalName?.toLowerCase().includes(hospitalQuery))
    )
  }

  if (isNonEmptyString(filters.city)) {
    const cityQuery = filters.city.toLowerCase()
    result = result.filter((s) =>
      s.city?.some((c: any) => c.cityName?.toLowerCase().includes(cityQuery)) ||
      s.branches?.some((b: any) =>
        b.city?.some((c: any) => c.cityName?.toLowerCase().includes(cityQuery))
      )
    )
  }

  if (isNonEmptyString(filters.branch)) {
    const branchQuery = filters.branch.toLowerCase()
    result = result.filter((s) =>
      s.branches?.some((b: any) =>
        b.branchName?.toLowerCase().includes(branchQuery) || b.branchId === filters.branch
      )
    )
  }

  if (filters.sortBy === 'az') {
    result = sortByAlphabet(result, (s) => s.name)
  } else if (filters.sortBy === 'za') {
    result = sortByAlphabet(result, (s) => s.name, 'desc')
  }

  return result
}

// =============================================================================
// MAIN SERVICE
// =============================================================================

/** Get specialists with filtering and pagination */
export async function getSpecialists(filters: SpecialistFilterParams): Promise<PaginatedResult<Specialist>> {
  const { hospitals } = await getAllCMSData()

  let masterSpecialists: unknown[] = []
  try {
    masterSpecialists = (await fetchAllSpecialists()) || []
  } catch {
    // Fallback to empty array
  }

  const allSpecialists = extractAllSpecialists(hospitals, masterSpecialists)
  const filteredSpecialists = applySpecialistFilters(allSpecialists, filters)

  const page = filters.page ?? 0
  const pageSize = filters.pageSize ?? 1000

  return createPaginatedResult(filteredSpecialists, page, pageSize)
}

/** Get all specialists (for detail pages) */
export async function getAllSpecialists(): Promise<Specialist[]> {
  const { hospitals } = await getAllCMSData()

  let masterSpecialists: unknown[] = []
  try {
    masterSpecialists = (await fetchAllSpecialists()) || []
  } catch {
    // Fallback to empty array
  }

  return extractAllSpecialists(hospitals, masterSpecialists)
}
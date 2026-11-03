// lib/services/doctors.ts
// Clean doctor service with extraction, filtering, and pagination

import { getAllCMSData } from '@/lib/cms'
import { generateSlug } from '@/lib/slug-utils'
import type { PaginatedResult } from '@/lib/api/pagination'
import {
  createPaginatedResult,
  sortByAlphabet,
  sortByPopular,
  isNonEmptyString,
  createMapById,
} from './base-service'

// =============================================================================
// TYPES
// =============================================================================

export interface DoctorFilterParams {
  q?: string
  specialization?: string
  hospital?: string
  city?: string
  popular?: boolean
  page?: number
  pageSize?: number
  sortBy?: 'popular' | 'az' | 'za' | 'default'
}

export interface Doctor {
  _id: string
  slug?: string
  doctorName: string
  qualification?: string | null
  qualifications?: string[] | null
  designation?: string | null
  specialization?: Array<{ _id?: string; name?: string }>
  experience?: string
  hospitalId?: string
  hospitalName?: string
  hospital?: unknown
  branchId?: string
  branchName?: string
  city?: Array<{ cityName?: string }> | string
  popular?: boolean
  doctorImage?: string
  profileImage?: string
  description?: string | null
  aboutDoctorHtml?: string | { nodes: unknown[] } | null
  awards?: string[] | null
  achievements?: string[] | null
  achievementsAwards?: string[] | null
}

// =============================================================================
// EXTRACTION
// =============================================================================

/** Extract all unique doctors from hospitals and enrich with hospital/branch data */
export function extractAllDoctors(hospitals: unknown[]): Doctor[] {
  const doctorsMap = new Map<string, Doctor>()

  hospitals.forEach((hospital: any) => {
    // Add hospital-level doctors
    hospital.doctors?.forEach((doc: any) => {
      if (doc._id && !doctorsMap.has(doc._id)) {
        doctorsMap.set(doc._id, {
          ...doc,
          hospitalId: hospital._id,
          hospitalName: hospital.hospitalName,
          branchId: doc.branchId || undefined,
          branchName: doc.branchName || undefined,
          city: doc.city || hospital.city?.[0]?.cityName || undefined,
        })
      }
    })

    // Add branch-level doctors
    hospital.branches?.forEach((branch: any) => {
      branch.doctors?.forEach((doc: any) => {
        if (doc._id && !doctorsMap.has(doc._id)) {
          doctorsMap.set(doc._id, {
            ...doc,
            hospitalId: hospital._id,
            hospitalName: hospital.hospitalName,
            branchId: branch._id,
            branchName: branch.branchName,
            city: branch.city || hospital.city,
          })
        }
      })
    })

    // Handle standalone branches stored as hospitals
    if (hospital.isStandalone && hospital.doctors?.length > 0) {
      hospital.doctors.forEach((doc: any) => {
        if (doc._id && !doctorsMap.has(doc._id)) {
          doctorsMap.set(doc._id, {
            ...doc,
            hospitalId: hospital._id,
            hospitalName: hospital.hospitalName || hospital.branchName,
            branchId: hospital._id,
            branchName: hospital.branchName || hospital.hospitalName,
            city: hospital.city || doc.city,
          })
        }
      })
    }
  })

  return Array.from(doctorsMap.values())
}

// =============================================================================
// TRANSFORMERS
// =============================================================================

/** Normalize city to array format */
function normalizeCity(city: unknown): Array<{ cityName?: string }> {
  if (!city) return []
  if (Array.isArray(city)) return city
  return [city]
}

/** Build doctor object from CMS data with enrichment */
function buildDoctor(doc: any, enrichedMap: Map<string, Doctor>): Doctor {
  const enriched = enrichedMap.get(doc._id)
  const doctorSlug = doc.doctorName ? generateSlug(doc.doctorName) : ''
  const city = normalizeCity(doc.city)

  return {
    _id: doc._id,
    slug: doctorSlug,
    doctorName: doc.doctorName,
    qualification: doc.qualification,
    qualifications: doc.qualifications || (doc.qualification ? [doc.qualification] : null),
    designation: doc.designation,
    specialization: doc.specialization || [],
    experience: doc.experienceYears?.toString(),
    hospitalId: enriched?.hospitalId || doc.hospitalId,
    hospitalName: enriched?.hospitalName || doc.hospitalName,
    hospital: doc.hospital || null,
    branchId: enriched?.branchId || doc.branchId,
    branchName: enriched?.branchName || doc.branchName,
    city: enriched?.city?.length
      ? normalizeCity(enriched.city)
      : city,
    popular: doc.popular,
    profileImage: doc.profileImage || doc.doctorImage || undefined,
    description: doc.aboutDoctor,
    aboutDoctorHtml: doc.aboutDoctorHtml || null,
    awards: doc.awards || null,
    achievements: doc.achievements || null,
    achievementsAwards: doc.achievementsAwards || null,
  }
}

// =============================================================================
// FILTERING
// =============================================================================

/** Apply filters to doctor data */
export function applyDoctorFilters(doctors: Doctor[], filters: DoctorFilterParams): Doctor[] {
  let result = doctors

  // Search query filter
  if (isNonEmptyString(filters.q)) {
    const query = filters.q.toLowerCase()
    result = result.filter((d) =>
      d.doctorName?.toLowerCase().includes(query) ||
      d.qualification?.toLowerCase().includes(query) ||
      d.designation?.toLowerCase().includes(query) ||
      d.specialization?.some((s) => s.name?.toLowerCase().includes(query))
    )
  }

  // Specialization filter
  if (isNonEmptyString(filters.specialization)) {
    const specQuery = filters.specialization.toLowerCase()
    result = result.filter((d) =>
      d.specialization?.some((s) => s.name?.toLowerCase().includes(specQuery))
    )
  }

  // Hospital filter
  if (isNonEmptyString(filters.hospital)) {
    const hospitalQuery = filters.hospital.toLowerCase()
    result = result.filter((d) =>
      d.hospitalName?.toLowerCase().includes(hospitalQuery)
    )
  }

  // City filter
  if (isNonEmptyString(filters.city)) {
    const cityQuery = filters.city.toLowerCase()
    result = result.filter((d) => {
      if (!d.city) return false
      if (typeof d.city === 'string') return d.city.toLowerCase().includes(cityQuery)
      return d.city.some((c) => c.cityName?.toLowerCase().includes(cityQuery))
    })
  }

  // Popular filter
  if (filters.popular) {
    result = result.filter((d) => d.popular === true)
  }

  // Sort
  if (filters.sortBy === 'popular') {
    result = sortByPopular(result)
  } else if (filters.sortBy === 'az') {
    result = sortByAlphabet(result, (d) => d.doctorName)
  } else if (filters.sortBy === 'za') {
    result = sortByAlphabet(result, (d) => d.doctorName, 'desc')
  }

  return result
}

// =============================================================================
// MAIN SERVICE
// =============================================================================

/** Get doctors with filtering and pagination */
export async function getDoctors(filters: DoctorFilterParams): Promise<PaginatedResult<Doctor>> {
  const { hospitals, doctors: cmsDoctors } = await getAllCMSData()

  const allDoctors = buildEnrichedDoctors(hospitals, cmsDoctors)

  const filteredDoctors = applyDoctorFilters(allDoctors, filters)
  const page = filters.page ?? 0
  const pageSize = filters.pageSize ?? 1000

  return createPaginatedResult(filteredDoctors, page, pageSize)
}

/** Build enriched doctor list from pre-fetched CMS data.
 *  Avoids redundant getAllCMSData() calls when data is already available.
 */
export function buildEnrichedDoctors(
  hospitals: unknown[],
  cmsDoctors: any[],
): Doctor[] {
  const enrichedDoctors = extractAllDoctors(hospitals)
  const existingIds = new Set(enrichedDoctors.map((d) => d._id))

  const additionalDoctors = cmsDoctors
    .filter((doc: any) => !existingIds.has(doc._id))
    .map((doc: any) => {
      const doctorSlug = doc.doctorName ? generateSlug(doc.doctorName) : ''
      const city = doc.city
        ? Array.isArray(doc.city)
          ? doc.city.map((c: any) => ({ cityName: c?.cityName || c?.name || '' }))
          : [{ cityName: doc.city }]
        : []

      return {
        _id: doc._id,
        slug: doctorSlug,
        doctorName: doc.doctorName,
        qualification: doc.qualification,
        qualifications: doc.qualifications || (doc.qualification ? [doc.qualification] : null),
        designation: doc.designation,
        specialization: doc.specialization || [],
        experience: doc.experienceYears?.toString(),
        hospitalId: doc.hospitalId,
        hospitalName: doc.hospitalName,
        hospital: doc.hospital || null,
        branchId: doc.branchId,
        branchName: doc.branchName,
        city,
        popular: doc.popular,
        doctorImage: doc.profileImage || undefined,
        profileImage: doc.profileImage || undefined,
        description: doc.aboutDoctor,
        aboutDoctorHtml: doc.aboutDoctorHtml || null,
        awards: doc.awards || null,
        achievements: doc.achievements || null,
        achievementsAwards: doc.achievementsAwards || null,
      }
    })

  return [...enrichedDoctors, ...additionalDoctors]
}

/** Get all doctors (for detail pages) */
export async function getAllDoctors(): Promise<Doctor[]> {
  const { hospitals, doctors: cmsDoctors } = await getAllCMSData()
  return buildEnrichedDoctors(hospitals, cmsDoctors)
}
// lib/services/treatments.ts
// Clean treatment service with extraction, filtering, and pagination

import { getAllCMSData, memoryCache } from '@/lib/cms'
import type { PaginatedResult } from '@/lib/api/pagination'
import {
  createPaginatedResult,
  sortByAlphabet,
  sortByPopular,
  isNonEmptyString,
} from './base-service'

// =============================================================================
// TYPES
// =============================================================================

export interface TreatmentFilterParams {
  q?: string
  category?: string
  popular?: boolean
  page?: number
  pageSize?: number
  sortBy?: 'popular' | 'az' | 'za' | 'default'
}

export interface Treatment {
  _id: string
  name: string
  category?: string | null
  description?: string | null
  treatmentImage?: string | null
  popular?: boolean
  cost?: string | null
  minPrice?: string | null
}

// =============================================================================
// FILTERING
// =============================================================================

/** Apply filters to treatment data */
export function applyTreatmentFilters(
  treatments: Treatment[],
  filters: TreatmentFilterParams
): Treatment[] {
  let result = treatments

  // Search query filter
  if (isNonEmptyString(filters.q)) {
    const query = filters.q.toLowerCase()
    result = result.filter((t) =>
      t.name?.toLowerCase().includes(query) ||
      (t.category && t.category.toLowerCase().includes(query)) ||
      (t.description && t.description.toLowerCase().includes(query))
    )
  }

  // Category filter
  if (isNonEmptyString(filters.category)) {
    const categoryQuery = filters.category.toLowerCase()
    result = result.filter((t) =>
      t.category?.toLowerCase() === categoryQuery ||
      t.category?.toLowerCase().includes(categoryQuery)
    )
  }

  // Popular filter
  if (filters.popular) {
    result = result.filter((t) => t.popular === true)
  }

  // Sort
  if (filters.sortBy === 'popular') {
    result = sortByPopular(result)
  } else if (filters.sortBy === 'az') {
    result = sortByAlphabet(result, (t) => t.name)
  } else if (filters.sortBy === 'za') {
    result = sortByAlphabet(result, (t) => t.name, 'desc')
  }

  return result
}

// =============================================================================
// DEFAULT DATA
// =============================================================================

const DEFAULT_TREATMENTS: Treatment[] = [
  { _id: 'treat-1', name: 'Cataract Surgery', treatmentImage: null, popular: true },
  { _id: 'treat-2', name: 'LASIK Eye Surgery', treatmentImage: null, popular: true },
  { _id: 'treat-3', name: 'Heart Bypass Surgery', treatmentImage: null, popular: true },
  { _id: 'treat-4', name: 'Angioplasty', treatmentImage: null, popular: true },
  { _id: 'treat-5', name: 'Knee Replacement', treatmentImage: null, popular: true },
  { _id: 'treat-6', name: 'Hip Replacement', treatmentImage: null, popular: true },
  { _id: 'treat-7', name: 'Spine Surgery', treatmentImage: null, popular: true },
  { _id: 'treat-8', name: 'Brain Tumor Surgery', treatmentImage: null, popular: false },
  { _id: 'treat-9', name: 'Chemotherapy', treatmentImage: null, popular: false },
  { _id: 'treat-10', name: 'Radiation Therapy', treatmentImage: null, popular: false },
]

// =============================================================================
// MAIN SERVICE
// =============================================================================

/** Cache key for light treatments data */
const TREATMENTS_CACHE_KEY = 'treatments_light'

/** Cache duration in milliseconds (30 minutes) */
const TREATMENTS_CACHE_TTL = 30 * 60 * 1000

/**
 * Get treatments with filtering and pagination
 * Optimized: Uses separate treatment cache to avoid loading full CMS data
 */
export async function getTreatments(filters: TreatmentFilterParams): Promise<PaginatedResult<Treatment>> {
  // Check cache first
  const cached = memoryCache.get<Treatment[]>(TREATMENTS_CACHE_KEY)
  let treatments = cached

  if (!treatments) {
    const { treatments: cmsTreatments } = await getAllCMSData()
    treatments = cmsTreatments && Array.isArray(cmsTreatments)
      ? cmsTreatments as Treatment[]
      : []

    if (treatments.length === 0) {
      console.warn('No treatments from CMS, using default treatments')
      treatments = DEFAULT_TREATMENTS
    }

    // Cache treatments separately for faster subsequent access
    memoryCache.set(TREATMENTS_CACHE_KEY, treatments, TREATMENTS_CACHE_TTL)
  }

  const filteredTreatments = applyTreatmentFilters(treatments, filters)
  const page = filters.page ?? 0
  const pageSize = Math.min(filters.pageSize ?? 1000, 2000)

  return createPaginatedResult(filteredTreatments, page, pageSize)
}

/** Get all treatments (for detail pages) */
export async function getAllTreatments(): Promise<Treatment[]> {
  const { treatments } = await getAllCMSData()
  return treatments as Treatment[]
}
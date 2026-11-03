"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"

// =============================================================================
// TYPES
// =============================================================================

export interface BranchData {
  _id: string
  branchName: string
  hospitalName: string
  address?: string | null
  city: Array<{ cityName?: string; name?: string; state?: string }>
  specialty: Array<{ name: string }>
  specialist: Array<{ name: string }>
  specialization: Array<{ name: string }>
  department: Array<{ name: string }>
  subDepartment: Array<{ name: string }>
  treatments: Array<{ name: string; category?: string }>
  totalBeds?: string | null
  noOfDoctors?: string | null
  yearEstablished?: string | null
  branchImage?: string | null
  popular?: boolean
  showHospital?: boolean
  slug?: string
  hospitalGroup?: string | null
}

export interface DoctorData {
  _id: string
  doctorName?: string
  name?: string
  specialization: Array<{ name: string }>
  qualification?: string | null
  designation?: string | null
  experienceYears?: string | null
  profileImage?: string | null
  popular?: boolean
  city: Array<{ cityName?: string; name?: string }>
  hospitalName?: string
  branchName?: string
  slug?: string
}

export interface TreatmentData {
  _id: string
  name?: string
  description?: string | null
  category?: string | null
  treatmentImage?: string | null
  cost?: string | null
  duration?: string | null
  popular?: boolean
  slug?: string
}

export interface SubDepartmentData {
  _id: string
  name: string
  specialistMaster: Array<{ _id: string; name: string }>
  treatment: Array<{ _id: string; name: string }>
  departmentMap: Array<{ _id: string; name: string }>
  branchesMasterSubDepartment: Array<{ _id: string; name: string; hospitalName?: string }>
}

export interface FilterOptions {
  cities: Array<{ id: string; name: string; state?: string }>
  states: string[]
  treatments: Array<{ id: string; name: string; category?: string }>
  specializations: Array<{ id: string; name: string; department?: string }>
  specialist: Array<{ id: string; name: string; department?: string }>
  departments: Array<{ id: string; name: string }>
  branches: Array<{ id: string; name: string; hospitalName: string; cities: Array<{ id: string; name: string; state?: string }> }>
  hospitalGroups: Array<{ _id: string; hospitalName: string; slug?: string }>
}

export interface SearchDataMeta {
  totalBranches: number
  totalDoctors: number
  totalTreatments: number
  totalSubDepartments: number
  lastUpdated: string
}

export interface SearchDataResponse {
  branches: BranchData[]
  doctors: DoctorData[]
  treatments: TreatmentData[]
  subDepartments: SubDepartmentData[]
  filters: FilterOptions
  meta: SearchDataMeta
}

export interface FilterState {
  view: "hospitals" | "doctors" | "treatments"
  city: { id: string; query: string }
  state: { id: string; query: string }
  treatment: { id: string; query: string }
  specialization: { id: string; query: string }
  department: { id: string; query: string }
  subDepartment: { id: string; query: string }
  doctor: { id: string; query: string }
  branch: { id: string; query: string }
  location: { id: string; query: string }
  sortBy: "relevance" | "popular" | "az" | "za"
}

// =============================================================================
// REQUEST DEDUPLICATION
// =============================================================================

const searchDataCache = new Map<string, { data: SearchDataResponse; timestamp: number }>()
const pendingRequests = new Map<string, Promise<SearchDataResponse>>()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes client-side cache

function getCacheKey(url: string): string {
  return url
}

function getCachedData(key: string): SearchDataResponse | null {
  const cached = searchDataCache.get(key)
  if (!cached) return null

  const now = Date.now()
  if (now - cached.timestamp > CACHE_TTL) {
    searchDataCache.delete(key)
    return null
  }

  return cached.data
}

function setCachedData(key: string, data: SearchDataResponse): void {
  searchDataCache.set(key, { data, timestamp: Date.now() })

  // Limit cache size
  if (searchDataCache.size > 10) {
    const firstKey = searchDataCache.keys().next().value
    if (firstKey) searchDataCache.delete(firstKey)
  }
}

// =============================================================================
// HOOK
// =============================================================================

export interface UseSearchDataOptions {
  enabled?: boolean
  initialData?: SearchDataResponse | null
}

export interface UseSearchDataReturn {
  loading: boolean
  error: string | null
  data: SearchDataResponse | null
  refetch: () => Promise<void>
  branches: BranchData[]
  doctors: DoctorData[]
  treatments: TreatmentData[]
  subDepartments: SubDepartmentData[]
  filters: FilterOptions
  meta: SearchDataMeta | null
}

export function useSearchData(options: UseSearchDataOptions = {}): UseSearchDataReturn {
  const { enabled = true, initialData = null } = options

  const [data, setData] = useState<SearchDataResponse | null>(initialData)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  const fetchAttemptedRef = useRef(false)

  const fetchData = useCallback(async (): Promise<SearchDataResponse | void> => {
    if (!enabled) return

    const cacheKey = getCacheKey("/api/search-data")

    // Check client-side cache first
    const cached = getCachedData(cacheKey)
    if (cached) {
      setData(cached)
      setLoading(false)
      setError(null)
      return
    }

    // Deduplicate concurrent requests
    const existingRequest = pendingRequests.get(cacheKey)
    if (existingRequest) {
      try {
        const result = await existingRequest
        setData(result)
        setLoading(false)
        setError(null)
        return result
      } catch (err) {
        // Handled by the original request
        return
      }
    }

    // Create new request
    const requestPromise = fetch("/api/search-data")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        return res.json()
      })
      .then((result: SearchDataResponse) => {
        setCachedData(cacheKey, result)
        setData(result)
        setLoading(false)
        setError(null)
        return result
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") {
          return
        }
        console.error("Failed to fetch search data:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch search data")
        setLoading(false)
        throw err
      })
      .finally(() => {
        pendingRequests.delete(cacheKey)
      })

    pendingRequests.set(cacheKey, requestPromise as Promise<SearchDataResponse>)
    fetchAttemptedRef.current = true

    return requestPromise
  }, [enabled])

  useEffect(() => {
    if (!fetchAttemptedRef.current) {
      fetchAttemptedRef.current = true
      fetchData()
    }

    return () => {}
  }, [fetchData])

  const refetch = useCallback(async () => {
    // Clear caches
    searchDataCache.clear()
    pendingRequests.clear()
    fetchAttemptedRef.current = false

    // Force fresh fetch
    setLoading(true)
    setError(null)
    await fetchData()
  }, [fetchData])

  const branches = useMemo(() => data?.branches || [], [data?.branches])
  const doctors = useMemo(() => data?.doctors || [], [data?.doctors])
  const treatments = useMemo(() => data?.treatments || [], [data?.treatments])
  const subDepartments = useMemo(() => data?.subDepartments || [], [data?.subDepartments])
  const filters = useMemo(() => data?.filters || {
    cities: [],
    states: [],
    treatments: [],
    specializations: [],
    specialist: [],
    departments: [],
    branches: [],
    hospitalGroups: [],
  }, [data?.filters])
  const meta = useMemo(() => data?.meta || null, [data?.meta])

  return {
    loading,
    error,
    data,
    refetch,
    branches,
    doctors,
    treatments,
    subDepartments,
    filters,
    meta,
  }
}

// =============================================================================
// PAGINATION HELPER
// =============================================================================

export interface PaginatedSearchData {
  branches: BranchData[]
  doctors: DoctorData[]
  treatments: TreatmentData[]
  totalBranches: number
  totalDoctors: number
  totalTreatments: number
  hasMoreBranches: boolean
  hasMoreDoctors: boolean
  hasMoreTreatments: boolean
}

export function paginateSearchData(
  data: SearchDataResponse,
  page: number,
  pageSize: number
): PaginatedSearchData {
  const branchStart = page * pageSize
  const doctorStart = page * pageSize
  const treatmentStart = page * pageSize

  return {
    branches: data.branches.slice(branchStart, branchStart + pageSize),
    doctors: data.doctors.slice(doctorStart, doctorStart + pageSize),
    treatments: data.treatments.slice(treatmentStart, treatmentStart + pageSize),
    totalBranches: data.branches.length,
    totalDoctors: data.doctors.length,
    totalTreatments: data.treatments.length,
    hasMoreBranches: branchStart + pageSize < data.branches.length,
    hasMoreDoctors: doctorStart + pageSize < data.doctors.length,
    hasMoreTreatments: treatmentStart + pageSize < data.treatments.length,
  }
}

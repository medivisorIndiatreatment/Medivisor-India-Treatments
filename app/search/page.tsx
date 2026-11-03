"use client"

/**
 * Hospitals Search Page
 * Optimized for production with unified data fetching, caching, and smooth UX.
 * Uses a single API endpoint for all search data to eliminate duplicate requests.
 */

import { Suspense, useState, useEffect, useMemo, useCallback, useRef, memo } from "react"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import dynamic from "next/dynamic"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
  ViewToggle,
  ResultsHeader,
  BreadcrumbNav,
  RenderContent,
  defaultBreadcrumbItems,
  SearchInput,
  TreatmentSearchInput,
} from "@/components/search"
import { useSearchData, type FilterState, type BranchData, type DoctorData, type TreatmentData } from "@/hooks/useSearchData"
import { getCityDisplayName, isDelhiNCR } from "@/lib/utils/city-utils"
import Banner from "@/components/HospitalBanner"
import { useI18n } from "@/lib/i18n"
import { Trans } from "@/lib/i18n/Trans"

// Lazy load components to reduce initial bundle size
const FilterDropdown = dynamic(
  () => import("@/components/search/FilterDropdown"),
  {
    ssr: false,
    loading: () => (
      <div className="h-10 bg-gray-100 rounded-xs animate-pulse w-40" />
    ),
  }
)

// =============================================================================
// PAGINATION CONFIG
// =============================================================================

const PAGE_SIZE = 24

// =============================================================================
// OPTIMIZED COMPONENTS
// =============================================================================

const MemoizedViewToggle = memo(ViewToggle)
const MemoizedResultsHeader = memo(ResultsHeader)
const MemoizedFilterDropdown = memo(FilterDropdown)
const MemoizedSearchInput = memo(SearchInput)
const MemoizedTreatmentSearchInput = memo(TreatmentSearchInput)

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

function SearchPageContent() {
  const { t } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Store searchParams in ref for stable access in callbacks
  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams

  // Track scroll state for sticky header shadow
  const [isScrolled, setIsScrolled] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const [displayedBranches, setDisplayedBranches] = useState<BranchData[]>([])
  const [displayedDoctors, setDisplayedDoctors] = useState<DoctorData[]>([])
  const [displayedTreatments, setDisplayedTreatments] = useState<TreatmentData[]>([])

  // Get initial view from URL params - stable function
  const getInitialView = useCallback((): FilterState["view"] => {
    const viewParam = searchParamsRef.current.get("view")
    if (viewParam === "treatments" || viewParam === "doctors" || viewParam === "hospitals") {
      return viewParam
    }
    return "hospitals"
  }, [])

  // Initialize view from URL
  const [initialViewSet, setInitialViewSet] = useState(false)

  // Fetch search data using unified endpoint
  const {
    loading,
    error,
    data,
    refetch,
    branches,
    doctors,
    treatments,
    subDepartments,
    filters: availableFilters,
    meta,
  } = useSearchData()

  // Build hierarchical data from sub-departments (needed for filtering)
  const hierarchicalData = useMemo(() => {
    if (!subDepartments.length) {
      return {
        departments: [],
        allSpecialists: [],
        allSubDepartments: [],
      }
    }

    const departmentsMap = new Map<string, {
      _id: string
      name: string
      subDepartments: any[]
      totalSpecialists: number
      totalTreatments: number
      totalBranches: number
    }>()
    const subDepartmentsMap = new Map<string, any>()
    const specialistsList: any[] = []

    for (const subDept of subDepartments) {
      const deptRef = subDept.departmentMap?.[0]
      const deptId = deptRef?._id || deptRef?.name || "unknown"
      const deptName = deptRef?.name || "Unknown Department"

      let hierarchicalSubDept = subDepartmentsMap.get(subDept._id)
      if (!hierarchicalSubDept) {
        hierarchicalSubDept = {
          _id: subDept._id,
          name: subDept.name,
          departmentId: deptId,
          departmentName: deptName,
          specialists: subDept.specialistMaster.map((s) => ({
            _id: s._id,
            name: s.name,
            treatments: subDept.treatment.map((t) => ({ _id: t._id, name: t.name })),
            subDepartmentId: subDept._id,
            subDepartmentName: subDept.name,
            departmentId: deptId,
            departmentName: deptName,
            branchIds: subDept.branchesMasterSubDepartment.map((b) => b._id),
            branchNames: subDept.branchesMasterSubDepartment.map((b) => b.name),
          })),
          treatments: subDept.treatment,
          branchIds: subDept.branchesMasterSubDepartment.map((b) => b._id),
          branchNames: subDept.branchesMasterSubDepartment.map((b) => b.name),
        }
        subDepartmentsMap.set(subDept._id, hierarchicalSubDept)
      }

      let dept = departmentsMap.get(deptId)
      if (!dept) {
        dept = {
          _id: deptId,
          name: deptName,
          subDepartments: [],
          totalSpecialists: 0,
          totalTreatments: 0,
          totalBranches: 0,
        }
        departmentsMap.set(deptId, dept)
      }

      if (!dept.subDepartments.some((sd: any) => sd._id === subDept._id)) {
        dept.subDepartments.push(hierarchicalSubDept)
      }

      specialistsList.push(...hierarchicalSubDept.specialists)
    }

    // Calculate totals
    for (const dept of departmentsMap.values()) {
      const allSpecIds = new Set<string>()
      const allTreatmentIds = new Set<string>()
      const allBranchIds = new Set<string>()

      for (const sd of dept.subDepartments) {
        sd.specialists.forEach((s: any) => allSpecIds.add(s._id))
        sd.treatments.forEach((t: any) => allTreatmentIds.add(t._id))
        sd.branchIds.forEach((b: string) => allBranchIds.add(b))
      }

      dept.totalSpecialists = allSpecIds.size
      dept.totalTreatments = allTreatmentIds.size
      dept.totalBranches = allBranchIds.size
    }

    return {
      departments: Array.from(departmentsMap.values()),
      allSpecialists: specialistsList,
      allSubDepartments: Array.from(subDepartmentsMap.values()),
    }
  }, [subDepartments])

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    view: "hospitals",
    city: { id: "", query: "" },
    state: { id: "", query: "" },
    treatment: { id: "", query: "" },
    specialization: { id: "", query: "" },
    department: { id: "", query: "" },
    subDepartment: { id: "", query: "" },
    doctor: { id: "", query: "" },
    branch: { id: "", query: "" },
    location: { id: "", query: "" },
    sortBy: "az",
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [allHospitalGroups, setAllHospitalGroups] = useState<any[]>([])

  // =============================================================================
  // URL INITIALIZATION
  // =============================================================================

  useEffect(() => {
    if (!searchParamsRef.current) return

    const urlFilters: Partial<FilterState> = {}
    const view = searchParamsRef.current.get("view")
    if (view && ["hospitals", "doctors", "treatments"].includes(view)) {
      urlFilters.view = view as FilterState["view"]
    }

    const subDepartment = searchParamsRef.current.get("subDepartment")
    if (subDepartment) {
      urlFilters.subDepartment = { id: subDepartment, query: subDepartment }
    }
    const department = searchParamsRef.current.get("department")
    if (department) {
      urlFilters.department = { id: department, query: department }
    }
    const specialization = searchParamsRef.current.get("specialization")
    if (specialization) {
      urlFilters.specialization = { id: specialization, query: specialization }
    }
    const treatment = searchParamsRef.current.get("treatment")
    if (treatment) {
      urlFilters.treatment = { id: treatment, query: treatment }
    }
    const location = searchParamsRef.current.get("location")
    if (location) {
      urlFilters.location = { id: location, query: location }
    }
    const sortBy = searchParamsRef.current.get("sortBy")
    if (sortBy && ["relevance", "popular", "az", "za"].includes(sortBy)) {
      urlFilters.sortBy = sortBy as FilterState["sortBy"]
    }
    const q = searchParamsRef.current.get("q")
    if (q) {
      setSearchQuery(q)
    }

    if (Object.keys(urlFilters).length > 0) {
      setFilters((prev) => ({ ...prev, ...urlFilters }))
    }

    setInitialViewSet(true)
  }, [])

  // Set initial view after filters are loaded
  useEffect(() => {
    if (initialViewSet) return
    if (!data) return

    const view = getInitialView()
    const currentView = filters.view

    if (currentView !== view) {
      setFilters((prev) => ({ ...prev, view }))
    }
    setInitialViewSet(true)
  }, [data, initialViewSet, getInitialView, filters.view])

  // =============================================================================
  // SCROLL LISTENER
  // =============================================================================

  useEffect(() => {
    let rafId: number | null = null

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 10)
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  // =============================================================================
  // FILTERING LOGIC
  // =============================================================================

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(0)
  }, [searchQuery, filters.view, filters.location, filters.department, filters.subDepartment, filters.specialization, filters.treatment, filters.sortBy])

  // Filtered data with memoization
  const filteredBranches = useMemo(() => {
    if (!branches.length) return []

    let result = [...branches]

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((branch) => {
        const localMatch =
          branch.branchName?.toLowerCase().includes(query) ||
          branch.hospitalName?.toLowerCase().includes(query) ||
          branch.address?.toLowerCase().includes(query) ||
          branch.specialty.some((s) => s.name?.toLowerCase().includes(query)) ||
          branch.specialist.some((s) => s.name?.toLowerCase().includes(query)) ||
          branch.specialization.some((s) => s.name?.toLowerCase().includes(query)) ||
          branch.department.some((d) => d.name?.toLowerCase().includes(query)) ||
          branch.subDepartment.some((d) => d.name?.toLowerCase().includes(query)) ||
          branch.treatments.some((t) => t.name?.toLowerCase().includes(query))

        return localMatch
      })
    }

    // Location filter
    if (filters.location.id) {
      const locationQuery = filters.location.query.toLowerCase()
      const isDelhiNCRFilter = locationQuery === "delhi ncr" || filters.location.id === "delhi-ncr"

      if (isDelhiNCRFilter) {
        result = result.filter((branch) => {
          if (!Array.isArray(branch.city)) return false
          return branch.city.some((c) => {
            const cityName = (c?.cityName || c?.name || "").toLowerCase().trim()
            return isDelhiNCR(cityName)
          })
        })
      } else {
        result = result.filter((branch) => {
          if (!Array.isArray(branch.city)) return false
          return branch.city.some((c) => {
            const cityName = (c?.cityName || c?.name || "").toLowerCase().trim()
            return cityName === locationQuery
          })
        })
      }
    }

    // Specialization filter
    if (filters.specialization.id) {
      const specQuery = filters.specialization.query.toLowerCase()
      result = result.filter((branch) =>
        branch.specialty.some((s) => s.name?.toLowerCase().includes(specQuery)) ||
        branch.specialist.some((s) => s.name?.toLowerCase().includes(specQuery)) ||
        branch.specialization.some((s) => s.name?.toLowerCase().includes(specQuery))
      )
    }

    // Department filter
    if (filters.department.id || filters.department.query) {
      const deptQuery = filters.department.query.toLowerCase()
      const deptId = filters.department.id

      const linkedBranchIds = new Set<string>()
      const linkedBranchNameSet = new Set<string>()
      const matchedDeptNames = new Set<string>()

      for (const subDept of subDepartments) {
        const matchesDept = subDept.departmentMap.some((d) => {
          const deptName = d.name?.toLowerCase() || ""
          const deptIds = [d._id, d.name].filter(Boolean) as string[]
          return deptName.includes(deptQuery) || (deptId && deptIds.includes(deptId))
        })

        if (matchesDept) {
          subDept.departmentMap.forEach((d) => {
            if (d.name) matchedDeptNames.add(d.name.toLowerCase().trim())
          })
          subDept.branchesMasterSubDepartment.forEach((b) => {
            if (b._id) linkedBranchIds.add(b._id)
            if (b.name) linkedBranchNameSet.add(b.name.toLowerCase().trim())
          })
        }
      }

      if (linkedBranchIds.size > 0 || linkedBranchNameSet.size > 0 || matchedDeptNames.size > 0) {
        result = result.filter((branch) => {
          const branchId = branch._id
          const branchName = (branch.branchName || "").toLowerCase().trim()
          const branchDeptNames = branch.department.map((d) => d.name?.toLowerCase().trim() || "")

          if (branchId && linkedBranchIds.has(branchId)) return true
          if (branchName && linkedBranchNameSet.has(branchName)) return true
          if (branchDeptNames.some((dName) => matchedDeptNames.has(dName))) return true
          return branch.department.some((d) => d.name?.toLowerCase().includes(deptQuery))
        })
      } else {
        result = result.filter((branch) =>
          branch.department.some((d) => d.name?.toLowerCase().includes(deptQuery)) ||
          branch.treatments.some((t) => (t.category || "").toLowerCase().includes(deptQuery))
        )
      }
    }

    // Sub-department filter
    if (filters.subDepartment.id || filters.subDepartment.query) {
      const subDeptQuery = filters.subDepartment.query.toLowerCase()
      const subDeptId = filters.subDepartment.id

      const linkedBranchIds = new Set<string>()
      const linkedBranchNameSet = new Set<string>()
      const matchedSubDeptNames = new Set<string>()

      for (const subDept of subDepartments) {
        const matchesName = subDept.name?.toLowerCase().includes(subDeptQuery)
        const matchesDept = subDept.departmentMap.some((d) => d.name?.toLowerCase().includes(subDeptQuery))
        const matchesSpec = subDept.specialistMaster.some((s) => s.name?.toLowerCase().includes(subDeptQuery))
        const matchesTreatment = subDept.treatment.some((t) => t.name?.toLowerCase().includes(subDeptQuery))
        const matchesId = subDept._id === subDeptId

        if (matchesName || matchesDept || matchesSpec || matchesTreatment || matchesId) {
          if (subDept.name) matchedSubDeptNames.add(subDept.name.toLowerCase().trim())
          subDept.branchesMasterSubDepartment.forEach((b) => {
            if (b._id) linkedBranchIds.add(b._id)
            if (b.name) linkedBranchNameSet.add(b.name.toLowerCase().trim())
          })
        }
      }

      if (linkedBranchIds.size > 0 || linkedBranchNameSet.size > 0 || matchedSubDeptNames.size > 0) {
        result = result.filter((branch) => {
          const branchId = branch._id
          const branchName = (branch.branchName || "").toLowerCase().trim()
          const branchSubDeptNames = branch.subDepartment.map((d) => d.name?.toLowerCase().trim() || "")
          const branchDeptNames = branch.department.map((d) => d.name?.toLowerCase().trim() || "")

          if (branchId && linkedBranchIds.has(branchId)) return true
          if (branchName && linkedBranchNameSet.has(branchName)) return true
          if (branchSubDeptNames.some((sdName) => matchedSubDeptNames.has(sdName))) return true
          if (branchDeptNames.some((dName) => matchedSubDeptNames.has(dName))) return true
          return branch.subDepartment.some((d) => d.name?.toLowerCase().includes(subDeptQuery))
        })
      } else if (subDeptQuery) {
        result = result.filter((branch) =>
          branch.subDepartment.some((d) => d.name?.toLowerCase().includes(subDeptQuery))
        )
      }
    }

    // Treatment filter
    if (filters.treatment.id) {
      const treatmentQuery = filters.treatment.query.toLowerCase()
      result = result.filter((branch) =>
        branch.treatments.some((t) =>
          t.name?.toLowerCase().includes(treatmentQuery) ||
          t.category?.toLowerCase().includes(treatmentQuery)
        )
      )
    }

    // Sort
    switch (filters.sortBy) {
      case "popular":
        result.sort((a, b) => (b.popular === true ? 1 : 0) - (a.popular === true ? 1 : 0))
        break
      case "az":
        result.sort((a, b) => (a.branchName || "").localeCompare(b.branchName || ""))
        break
      case "za":
        result.sort((a, b) => (b.branchName || "").localeCompare(a.branchName || ""))
        break
    }

    return result
  }, [branches, searchQuery, filters, subDepartments])

  const filteredDoctors = useMemo(() => {
    if (!doctors.length) return []

    let result = [...doctors]

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((doctor) => {
        const specsMatch = doctor.specialization?.some((s) => s.name?.toLowerCase().includes(query))
        return (
          (doctor.doctorName && doctor.doctorName.toLowerCase().includes(query)) ||
          (doctor.name && doctor.name.toLowerCase().includes(query)) ||
          doctor.qualification?.toLowerCase().includes(query) ||
          doctor.designation?.toLowerCase().includes(query) ||
          doctor.hospitalName?.toLowerCase().includes(query) ||
          doctor.branchName?.toLowerCase().includes(query) ||
          specsMatch
        )
      })
    }

    // Specialization filter
    if (filters.specialization.id) {
      const specQuery = filters.specialization.query.toLowerCase()
      result = result.filter((doctor) =>
        doctor.specialization?.some((s) => s.name?.toLowerCase().includes(specQuery))
      )
    }

    // City filter
    if (filters.location.id) {
      const cityQuery = filters.location.query.toLowerCase().trim()
      const isDelhiNCRFilter = cityQuery === "delhi ncr" || filters.location.id === "delhi-ncr"

      if (isDelhiNCRFilter) {
        result = result.filter((doctor) => {
          if (!Array.isArray(doctor.city)) return false
          return doctor.city.some((c) => {
            const cityName = (c?.cityName || c?.name || "").toLowerCase().trim()
            return isDelhiNCR(cityName)
          })
        })
      } else {
        result = result.filter((doctor) => {
          if (!Array.isArray(doctor.city)) return false
          return doctor.city.some((c) => {
            const cityName = (c?.cityName || c?.name || "").toLowerCase().trim()
            return cityName === cityQuery
          })
        })
      }
    }

    // Sort
    switch (filters.sortBy) {
      case "popular":
        result.sort((a, b) => (b.popular === true ? 1 : 0) - (a.popular === true ? 1 : 0))
        break
      case "az":
        result.sort((a, b) => (a.doctorName || "").localeCompare(b.doctorName || ""))
        break
      case "za":
        result.sort((a, b) => (b.doctorName || "").localeCompare(a.doctorName || ""))
        break
    }

    return result
  }, [doctors, searchQuery, filters])

  const filteredTreatments = useMemo(() => {
    if (!treatments.length) return []

    let result = [...treatments]

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((treatment) =>
        treatment.name?.toLowerCase().includes(query) ||
        treatment.description?.toLowerCase().includes(query) ||
        treatment.category?.toLowerCase().includes(query)
      )
    }

    // Treatment filter
    if (filters.treatment.id) {
      const treatmentQuery = filters.treatment.query.toLowerCase()
      result = result.filter((treatment) =>
        treatment.name?.toLowerCase().includes(treatmentQuery) ||
        treatment.category?.toLowerCase().includes(treatmentQuery)
      )
    }

    // Department filter
    if (filters.department.id) {
      const deptQuery = filters.department.query.toLowerCase()
      result = result.filter((treatment) =>
        treatment.category?.toLowerCase().includes(deptQuery)
      )
    }

    // Sort
    switch (filters.sortBy) {
      case "popular":
        result.sort((a, b) => (b.popular === true ? 1 : 0) - (a.popular === true ? 1 : 0))
        break
      case "az":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        break
      case "za":
        result.sort((a, b) => (b.name || "").localeCompare(a.name || ""))
        break
    }

    return result
  }, [treatments, filters, searchQuery])

  // Current count
  const currentCount = useMemo(() => {
    switch (filters.view) {
      case "hospitals":
        return filteredBranches.length
      case "doctors":
        return filteredDoctors.length
      case "treatments":
        return filteredTreatments.length
      default:
        return filteredBranches.length
    }
  }, [filters.view, filteredBranches, filteredDoctors, filteredTreatments])

  // =============================================================================
  // PAGINATION
  // =============================================================================

  useEffect(() => {
    setDisplayedBranches(filteredBranches.slice(0, (currentPage + 1) * PAGE_SIZE))
    setDisplayedDoctors(filteredDoctors.slice(0, (currentPage + 1) * PAGE_SIZE))
    setDisplayedTreatments(filteredTreatments.slice(0, (currentPage + 1) * PAGE_SIZE))
  }, [filteredBranches, filteredDoctors, filteredTreatments, currentPage])

  const hasMoreBranches = displayedBranches.length < filteredBranches.length
  const hasMoreDoctors = displayedDoctors.length < filteredDoctors.length
  const hasMoreTreatments = displayedTreatments.length < filteredTreatments.length

  const hasMore = useMemo(() => {
    switch (filters.view) {
      case "hospitals":
        return hasMoreBranches
      case "doctors":
        return hasMoreDoctors
      case "treatments":
        return hasMoreTreatments
      default:
        return false
    }
  }, [filters.view, hasMoreBranches, hasMoreDoctors, hasMoreTreatments])

  const loadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1)
  }, [])

  // =============================================================================
  // FORMAT AVAILABLE OPTIONS (MEMOIZED)
  // =============================================================================

  const availableOptions = useMemo(() => {
    const branchCityMap = new Map<string, { id: string; name: string; isNCR: boolean }>()

    for (const branch of branches) {
      for (const city of branch.city) {
        const cityName = city?.cityName || city?.name || ""
        if (!cityName) continue

        const normalizedName = cityName.toLowerCase().trim()
        const displayName = getCityDisplayName(cityName)
        const isNCR = isDelhiNCR(cityName)

        if (!branchCityMap.has(normalizedName)) {
          branchCityMap.set(normalizedName, {
            id: (city as any)._id || normalizedName,
            name: displayName,
            isNCR,
          })
        }
      }
    }

    const cities = Array.from(branchCityMap.values())
    const hasNCRCities = cities.some((city) => city.isNCR)

    const ncrGroupOption =
      hasNCRCities && !cities.some((city) => city.name === "Delhi NCR")
        ? [
            {
              id: "delhi-ncr",
              name: "Delhi NCR",
              isNCR: true,
              isNCRGroup: true,
            },
          ]
        : []

    return {
      location: (availableFilters.cities || []).map((city: any) => ({
        id: city.id || city._id || city.name,
        name: city.name,
        state: city.state,
      })),
      branchCities: [...ncrGroupOption, ...cities].sort((a, b) => {
        if ((a as any).isNCRGroup) return -1
        if ((b as any).isNCRGroup) return 1
        if (a.isNCR && !b.isNCR) return -1
        if (!a.isNCR && b.isNCR) return 1
        return a.name.localeCompare(b.name)
      }),
      specialist: availableFilters.specialist || [],
      specialty: availableFilters.specializations || [],
      departments: availableFilters.departments || [],
      treatments: (availableFilters.treatments || []).map((treatment: any) => ({
        id: treatment.id || treatment._id || treatment.name,
        name: treatment.name,
      })).sort((a: any, b: any) => a.name.localeCompare(b.name)),
      branches: (availableFilters.branches || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        state: b.hospitalName,
      })),
    }
  }, [availableFilters, branches])

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleViewChange = useCallback(
    (view: FilterState["view"]) => {
      const scrollPosition = window.scrollY

      setFilters((prev) => ({ ...prev, view }))
      setCurrentPage(0)

      const params = new URLSearchParams(searchParamsRef.current.toString())
      params.set("view", view)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })

      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPosition)
      })
    },
    [router, pathname]
  )

  const handleSortChange = useCallback((sortBy: FilterState["sortBy"]) => {
    setFilters((prev) => ({ ...prev, sortBy }))
    setCurrentPage(0)
  }, [])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(0)
  }, [])

  const handleFilterChange = useCallback(
    (key: string, subKey: string, value: string) => {
      setFilters((prev) => {
        const currentFilter = prev[key as keyof FilterState] as Record<string, string>
        return {
          ...prev,
          [key]: { ...currentFilter, [subKey]: value },
        }
      })
      setCurrentPage(0)
    },
    []
  )

  const clearAll = useCallback(() => {
    setFilters({
      view: filters.view,
      city: { id: "", query: "" },
      state: { id: "", query: "" },
      treatment: { id: "", query: "" },
      specialization: { id: "", query: "" },
      department: { id: "", query: "" },
      subDepartment: { id: "", query: "" },
      doctor: { id: "", query: "" },
      branch: { id: "", query: "" },
      location: { id: "", query: "" },
      sortBy: "az",
    })
    setSearchQuery("")
    setCurrentPage(0)
    router.replace(window.location.pathname)
  }, [filters.view, router])

  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  // =============================================================================
  // RENDER
  // =============================================================================

  if (error && !loading && !data) {
    return (
      <>
        <Banner
          bannerBgImage="/banner/search-banner.png"
          topSpanText="Premium Healthcare Services"
          title="Access Specialist Care Right From Your Home."
          description={`
            <p>Our virtual clinic offers <strong>24/7 access</strong> to board-certified physicians.</p>
            <p>Book a consultation in minutes and get the care you need.</p>
          `.trim()}
          ctas={[
            {
              text: "Book an Appointment",
              link: "/booking",
              isPrimary: true,
            },
            {
              text: "Call Us",
              link: "tel:1234567890",
              isPrimary: false,
            },
          ]}
        />

        <BreadcrumbNav items={defaultBreadcrumbItems} />

        <div className="container mx-auto px-5 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
<h2 className="text-2xl font-bold text-gray-900 mb-2" data-i18n="search.unable-to-load" data-i18n-original="Unable to Load Search Data" data-trans-managed="true">Unable to Load Search Data</h2>
            <p className="text-gray-500 mb-6" data-i18n-original={error} data-trans-managed="true">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#E22026] text-white rounded-md hover:bg-[#c41c20] transition-colors"
              data-i18n-original="Try Again"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Banner */}
      <Banner
        bannerBgImage="/banner/search-banner.png"
        topSpanText="Premium Healthcare Services"
        title="Access Specialist Care Right From Your Home."
        description={`
          <p>Our virtual clinic offers <strong>24/7 access</strong> to board-certified physicians.</p>
          <p>Book a consultation in minutes and get the care you need.</p>
        `.trim()}
        ctas={[
          {
            text: "Book an Appointment",
            link: "/booking",
            isPrimary: true,
          },
          {
            text: "Call Us",
            link: "tel:1234567890",
            isPrimary: false,
          },
        ]}
      />

      <BreadcrumbNav items={defaultBreadcrumbItems} />

      <section
        className={`sticky bg-white top-[56px] lg:top-[75px] z-40 bg-gray-50 transition-all duration-300 ${isScrolled ? "shadow-md" : "shadow-sm"}`}
      >
        <div className={`border-b transition-all duration-300 overflow-visible ${isScrolled ? "border-gray-200" : "border-gray-200"}`}>
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 overflow-visible">
            <div className="py-3 sm:py-4 overflow-visible">
              <div className="grid lg:grid-cols-12 gap-4 items-center">
                {/* Left: View Tabs */}
                <div className="lg:col-span-4">
                  <MemoizedViewToggle
                    view={filters.view}
                    setView={handleViewChange}
                  />
                </div>

                {/* Right Section */}
                <div className="lg:col-span-8">
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                    {/* Search Input */}
                    {filters.view === "treatments" ? (
                      <div className="min-w-[250px] flex-1 md:w-auto w-full md:max-w-[300px]">
                        <MemoizedTreatmentSearchInput
                          treatments={treatments as any}
                          value={searchQuery}
                          onChange={handleSearchChange}
                        />
                      </div>
                    ) : (
                      <div className="md:min-w-[250px] md:flex-1 md:w-auto w-full md:max-w-[300px]">
                        <MemoizedSearchInput
                          value={searchQuery}
                          onChange={handleSearchChange}
                          view={filters.view}
                          branches={branches}
                          doctors={doctors as any}
                          treatments={treatments}
                          subDepartments={subDepartments}
                          hierarchicalData={hierarchicalData}
                          hospitalGroups={allHospitalGroups}
                        />
                      </div>
                    )}

                    {/* City Filter */}
                    {filters.view !== "treatments" && (
                      <div className="max-w-[180px] flex-1 w-1/2 md:w-auto w-full md:max-w-[220px]">
                        <MemoizedFilterDropdown
placeholder={t("Filter by City")}
                          filterKey="location"
                          filters={filters as any}
                          updateSubFilter={handleFilterChange}
                          options={availableOptions.branchCities}
                        />
                      </div>
                    )}

                    {/* Sort */}
                    <div className="max-w-[180px] flex-1 w-1/2 md:w-auto w-full md:max-w-[220px]">
                      <MemoizedResultsHeader
                        sortBy={filters.sortBy}
                        setSortBy={handleSortChange}
                      />
                    </div>

                    {/* Clear Button */}
{(filters.location.query ||
                       filters.subDepartment.query ||
                       filters.department.query ||
                       filters.specialization.query ||
                       filters.treatment.query ||
                       searchQuery) && (
                       <button
                         onClick={clearAll}
                         className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-all duration-200 whitespace-nowrap"
                         title="Clear all filters and search"
                       >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                         </svg>
                         <span data-i18n="search.clear" data-i18n-original="Clear" data-trans-managed="true">{t("Clear")}</span>
                       </button>
                     )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 pt-6 pb-8 min-h-screen">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8 w-full overflow-x-hidden">
          <RenderContent
            view={filters.view}
            loading={loading}
            currentCount={currentCount}
            filteredBranches={displayedBranches}
            filteredDoctors={displayedDoctors}
            filteredTreatments={displayedTreatments}
            totalBranches={filteredBranches.length}
            totalDoctors={filteredDoctors.length}
            totalTreatments={filteredTreatments.length}
            sortBy={filters.sortBy}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </div>
      </section>
    </>
  )
}

// =============================================================================
// ERROR BOUNDARY FALLBACK
// =============================================================================

function SearchErrorFallback({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <>
      <Banner
        bannerBgImage="/banner/search-banner.png"
        topSpanText="Premium Healthcare Services"
        title="Access Specialist Care Right From Your Home."
        description={`
          <p>Our virtual clinic offers <strong>24/7 access</strong> to board-certified physicians.</p>
          <p>Book a consultation in minutes and get the care you need.</p>
        `.trim()}
        ctas={[
          {
            text: "Book an Appointment",
            link: "/booking",
            isPrimary: true,
          },
          {
            text: "Call Us",
            link: "tel:1234567890",
            isPrimary: false,
          },
        ]}
      />

      <BreadcrumbNav items={defaultBreadcrumbItems} />

      <div className="container mx-auto px-5 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
<h2 className="text-2xl font-bold text-gray-900 mb-2" data-i18n-original="Unable to Load Search Data">Unable to Load Search Data</h2>
          <p className="text-gray-500 mb-6" data-i18n-original={error}>{error}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#E22026] text-white rounded-md hover:bg-[#c41c20] transition-colors"
            data-i18n-original="Try Again"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    </>
  )
}

// =============================================================================
// PAGE EXPORT
// =============================================================================

export default function SearchPage() {
  return (
<Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-[#E22026] mx-auto mb-4" aria-hidden="true" />
              <p className="text-gray-500" aria-live="polite" data-i18n-original="Loading search data...">
                Loading search data...
              </p>
            </div>
          </div>
        }
      >
        <SearchPageContent />
      </Suspense>
  )
}

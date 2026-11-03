// lib/services/departments.ts
// Department service with Wix CMS multi-reference data mapping

import {
  fetchAllDepartments,
  fetchAllSubDepartments,
  fetchAllTreatments,
  fetchAllDoctors,
  fetchAllSpecialists,
} from "@/lib/cms"
import type { PaginatedResult } from "@/lib/api/pagination"
import type { TreatmentData, CMSDataResponse, DoctorData } from "@/lib/cms/types"
import { generateSlug, generateUniqueSlug } from "@/lib/slug-utils"
import { getImageUrl } from "@/lib/utils/cms"
import { getWixImageUrl, getWixScaledToFillImageUrl } from "@/lib/wixMedia"
import { memoryCache, CACHE_CONFIG } from "@/lib/cms/cache"
import {
  createPaginatedResult,
  sortByAlphabet,
  isNonEmptyString,
} from "./base-service"

// =============================================================================
// TYPES
// =============================================================================

export interface DepartmentFilterParams {
  q?: string
  specialist?: string
  branch?: string
  treatment?: string
  page?: number
  pageSize?: number
  sortBy?: "az" | "za" | "default"
}

export interface Department {
  _id: string
  name: string
  slug: string
  departmentImage?: string | null
  subDepartments?: SubDepartment[]
  treatments?: DepartmentTreatment[]
  totalTreatments?: number
  description?: string | null
  descriptionHtml?: string | { nodes: unknown[] } | null
  richContent?: unknown
  BranchesMaster_department?: Array<{ _id: string; name: string }> | null
  subDepartment_departmentMap?: Array<{ _id: string; name: string }> | null
  image?: string | null
  ID?: string
  createdDate?: string
  updatedDate?: string
  Owner?: string
}

export interface SubDepartment {
  _id: string
  name: string
  treatments?: DepartmentTreatment[]
}

export interface DepartmentTreatment {
  _id: string
  name: string
  treatmentImage?: string | null
  cost?: string | null
  popular?: boolean
  description?: string | null
}

// =============================================================================
// WIX CMS DATA FETCHING
// =============================================================================

interface RawDepartment {
  _id: string
  name: string
  departmentImage?: string | null
  subDepartment_departmentMap?: Array<{ _id: string; name: string }> | null
  BranchesMaster_department?: Array<{ _id: string; name: string }> | null
  Description?: string | null
  DescriptionHtml?: string | { nodes: unknown[] } | null
  RichContent?: unknown
  richContent?: unknown
  about?: string | null
  aboutHtml?: string | null
  About?: string | null
  AboutHtml?: string | null
  AboutDepartment?: string | null
  description?: string | null
  descriptionHtml?: string | null
  image?: string | null
  ID?: string
  createdDate?: string
  updatedDate?: string
  Owner?: string
}

interface RawSubDepartment {
  _id: string
  name: string
  treatment?: Array<{ _id: string; name: string }> | null
  Treatment?: Array<{ _id: string; name: string }> | null
  departmentMap?: Array<{ _id: string; name: string }> | null
  subDepartment_departmentMap?: Array<{ _id: string; name: string }> | null
}

/** Fetch all departments from Department collection with multi-reference expansion */
export async function fetchDepartmentsFromWix(): Promise<RawDepartment[]> {
  const rawDepartments = await fetchAllDepartments()

  return rawDepartments.map((dept: any) => {
    const id = dept._id ?? dept.ID ?? ""
    const deptName = dept.name ??
      dept.departmentName ??
      dept.department ??
      dept.Department ??
      dept.title ??
      dept.Title ??
      "Unknown Department"

    let subDeptRefs: Array<{ _id: string; name: string }> | null = null
    if (dept.subDepartment_departmentMap) {
      subDeptRefs = Array.isArray(dept.subDepartment_departmentMap)
        ? dept.subDepartment_departmentMap
        : [dept.subDepartment_departmentMap]
    } else if (dept.subDepartment) {
      subDeptRefs = Array.isArray(dept.subDepartment)
        ? dept.subDepartment
        : [dept.subDepartment]
    }

    let branchDeptRefs: Array<{ _id: string; name: string }> | null = null
    if (dept.BranchesMaster_department) {
      branchDeptRefs = Array.isArray(dept.BranchesMaster_department)
        ? dept.BranchesMaster_department
        : [dept.BranchesMaster_department]
    }

    return {
      _id: id,
      name: deptName,
      departmentImage: dept.image ?? dept.departmentImage ?? null,
      subDepartment_departmentMap: subDeptRefs,
      BranchesMaster_department: branchDeptRefs,
      Description: dept.Description ?? dept.description ?? dept.about ??
        dept.About ?? dept.AboutDepartment ?? null,
      DescriptionHtml: dept.DescriptionHtml ?? dept.descriptionHtml ??
        dept.aboutHtml ?? dept.AboutHtml ?? null,
      RichContent: dept.RichContent ?? dept.richContent ?? null,
      image: dept.image ?? null,
      ID: dept.ID ?? null,
      createdDate: dept["Created date"] ?? dept.createdDate ?? null,
      updatedDate: dept["Updated date"] ?? dept.updatedDate ?? null,
      Owner: dept.Owner ?? null,
    }
  })
}

/** Fetch all sub-departments from SubDepartment collection with multi-reference expansion */
export async function fetchSubDepartmentsFromWix(): Promise<RawSubDepartment[]> {
  const rawSubDepartments = await fetchAllSubDepartments()

  return rawSubDepartments.map((subDept: any) => {
    const id = subDept._id ?? subDept.ID ?? ""
    const subDeptName = subDept.name ??
      subDept.subDepartmentName ??
      subDept.subDepartment ??
      subDept.SubDepartment ??
      "Unknown SubDepartment"

    let treatmentRefs: Array<{ _id: string; name: string }> | null = null
    if (subDept.treatment) {
      treatmentRefs = Array.isArray(subDept.treatment)
        ? subDept.treatment
        : [subDept.treatment]
    } else if (subDept.Treatment) {
      treatmentRefs = Array.isArray(subDept.Treatment)
        ? subDept.Treatment
        : [subDept.Treatment]
    }

    let deptMapRefs: Array<{ _id: string; name: string }> | null = null
    if (subDept.departmentMap) {
      deptMapRefs = Array.isArray(subDept.departmentMap)
        ? subDept.departmentMap
        : [subDept.departmentMap]
    } else if (subDept.subDepartment_departmentMap) {
      deptMapRefs = Array.isArray(subDept.subDepartment_departmentMap)
        ? subDept.subDepartment_departmentMap
        : [subDept.subDepartment_departmentMap]
    }

    return {
      _id: id,
      name: subDeptName,
      treatment: treatmentRefs,
      departmentMap: deptMapRefs,
    }
  })
}

/** Fetch all treatments from Treatment collection */
export async function fetchTreatmentsFromWix(): Promise<TreatmentData[]> {
  const treatments = await fetchAllTreatments()
  return treatments.map((t: any) => {
    const id = t._id ?? t.ID ?? ""
    const treatmentName = t.treatmentName ??
      t.name ??
      t.treatment ??
      t.Treatment ??
      t.title ??
      t.Title ??
      "Unknown Treatment"

    return {
      _id: id,
      name: treatmentName,
      treatmentImage: t.treatmentImage ?? t.image ?? null,
      cost: t.cost ?? t.startingCost ?? t.averageCost ?? null,
      popular: t.popular === true,
      category: t.category ?? null,
      description: t.description ?? null,
    }
  })
}

// =============================================================================
// DATA MAPPING - Department → SubDepartment → Treatments
// =============================================================================

/** Build department hierarchy with multi-reference mapping */
export function buildDepartmentHierarchy(
  departments: RawDepartment[],
  subDepartments: RawSubDepartment[],
  treatments: TreatmentData[],
): Department[] {
  // Create treatment lookup maps
  const treatmentMapById = new Map<string, TreatmentData>()
  const treatmentMapByName = new Map<string, TreatmentData>()
  treatments.forEach((t) => {
    if (t._id) treatmentMapById.set(t._id, t)
    if (t.name) treatmentMapByName.set(t.name.toLowerCase(), t)
  })

  // Create sub-department lookup map
  const subDeptMap = new Map<string, RawSubDepartment>()
  subDepartments.forEach((sd) => {
    if (sd._id) subDeptMap.set(sd._id, sd)
  })

  // Build reverse mapping: department ID -> sub-departments
  const departmentSubDeptMap = new Map<string, RawSubDepartment[]>()
  subDepartments.forEach((subDept) => {
    const deptRefs = subDept.departmentMap ?? subDept.subDepartment_departmentMap ?? []
    deptRefs.forEach((deptRef) => {
      const deptId = deptRef._id
      if (!deptId) return

      if (!departmentSubDeptMap.has(deptId)) {
        departmentSubDeptMap.set(deptId, [])
      }
      const existing = departmentSubDeptMap.get(deptId)!
      if (!existing.some((sd) => sd._id === subDept._id)) {
        existing.push(subDept)
      }
    })
  })

  // Build departments with treatments
  return departments
    .map((dept) => {
      const deptId = dept._id
      if (!deptId) return null

      const subDeptRefs = dept.subDepartment_departmentMap ?? []
      let subDepts: RawSubDepartment[] = []

      // Add sub-departments from department's direct reference
      subDeptRefs.forEach((ref) => {
        const subDept = subDeptMap.get(ref._id)
        if (subDept && !subDepts.some((sd) => sd._id === subDept._id)) {
          subDepts.push(subDept)
        }
      })

      // Add sub-departments that reference this department
      const reverseMappedSubDepts = departmentSubDeptMap.get(deptId) ?? []
      reverseMappedSubDepts.forEach((subDept) => {
        if (!subDepts.some((sd) => sd._id === subDept._id)) {
          subDepts.push(subDept)
        }
      })

      // Collect all treatments from all sub-departments
      const treatmentsMap = new Map<string, DepartmentTreatment>()

      subDepts.forEach((subDept) => {
        const treatmentRefs = subDept.treatment ?? subDept.Treatment ?? []

        treatmentRefs.forEach((treatRef) => {
          if (!treatRef) return

          const treatId = treatRef._id
          const treatName = treatRef.name

          if (treatId && treatmentsMap.has(treatId)) return
          if (treatName && treatmentsMap.has(treatName)) return

          let treatmentData: TreatmentData | undefined
          if (treatId) {
            treatmentData = treatmentMapById.get(treatId)
          }
          if (!treatmentData && treatName) {
            treatmentData = treatmentMapByName.get(treatName.toLowerCase())
          }

          if (treatmentData) {
            const key = treatId ?? treatName ?? treatmentData._id
            treatmentsMap.set(key, {
              _id: treatmentData._id,
              name: treatmentData.name,
              treatmentImage: treatmentData.treatmentImage,
              cost: treatmentData.cost,
              popular: treatmentData.popular,
              description: treatmentData.description || null,
            })
          }
        })
      })

      const allTreatments = Array.from(treatmentsMap.values()).sort((a, b) =>
        (a.name ?? "").localeCompare(b.name ?? "")
      )

      return {
        _id: deptId,
        name: dept.name,
        slug: generateSlug(dept.name),
        departmentImage: getImageUrl(dept.departmentImage),
        subDepartments: subDepts.map((sd) => ({
          _id: sd._id,
          name: sd.name,
          treatments: (sd.treatment ?? sd.Treatment ?? [])
            .map((ref) => {
              let t = ref._id ? treatmentMapById.get(ref._id) : undefined
              if (!t && ref.name) {
                t = treatmentMapByName.get(ref.name.toLowerCase())
              }
              return t
                ? {
                    _id: t._id,
                    name: t.name,
                    treatmentImage: t.treatmentImage,
                    cost: t.cost,
                    popular: t.popular,
                    description: t.description || null,
                  }
                : null
            })
            .filter(Boolean) as DepartmentTreatment[],
        })),
        treatments: allTreatments,
        totalTreatments: allTreatments.length,
        description: dept.Description ??
          dept.description ??
          dept.about ??
          dept.About ??
          dept.AboutDepartment ??
          null,
        descriptionHtml: dept.DescriptionHtml ??
          dept.Description ??
          dept.descriptionHtml ??
          dept.description ??
          dept.aboutHtml ??
          dept.AboutHtml ??
          null,
        richContent: dept.RichContent ?? dept.richContent ?? null,
        BranchesMaster_department: dept.BranchesMaster_department ?? null,
        subDepartment_departmentMap: dept.subDepartment_departmentMap ?? null,
        image: dept.departmentImage,
        ID: dept._id,
        createdDate: dept.createdDate ?? null,
        updatedDate: dept.updatedDate ?? null,
        Owner: dept.Owner ?? null,
      }
    })
    .filter(Boolean) as Department[]
}

// =============================================================================
// DATA FETCHING - Optimized single fetch
// =============================================================================

const DEPARTMENTS_CACHE_KEY = "departments_with_mapping"

const DEFAULT_DEPARTMENTS: Department[] = [
  { _id: "dept-1", name: "Cardiology", slug: "cardiology", departmentImage: null, subDepartments: [], treatments: [], totalTreatments: 0, description: null },
  { _id: "dept-2", name: "Neurology", slug: "neurology", departmentImage: null, subDepartments: [], treatments: [], totalTreatments: 0, description: null },
  { _id: "dept-3", name: "Orthopedics", slug: "orthopedics", departmentImage: null, subDepartments: [], treatments: [], totalTreatments: 0, description: null },
  { _id: "dept-4", name: "Oncology", slug: "oncology", departmentImage: null, subDepartments: [], treatments: [], totalTreatments: 0, description: null },
]

/**
 * Get all departments with full mapping (optimized)
 * Uses direct data fetching for latest data with fallback handling
 */
export async function getDepartmentsWithMapping(): Promise<Department[]> {
  const cached = memoryCache.get<Department[]>(DEPARTMENTS_CACHE_KEY)
  if (cached) return cached

  try {
    const [departments, subDepartments, treatments] = await Promise.all([
      fetchDepartmentsFromWix(),
      fetchSubDepartmentsFromWix(),
      fetchTreatmentsFromWix(),
    ])

    const result = buildDepartmentHierarchy(departments, subDepartments, treatments)

    if (result && result.length > 0) {
      const sortedResult = [...result].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
      )
      memoryCache.set(DEPARTMENTS_CACHE_KEY, sortedResult, CACHE_CONFIG.HOSPITALS * 1000)
      return sortedResult
    }

    console.warn("getDepartmentsWithMapping: No data from Wix, returning default departments")
    memoryCache.set(DEPARTMENTS_CACHE_KEY, DEFAULT_DEPARTMENTS, CACHE_CONFIG.HOSPITALS * 1000)
    return DEFAULT_DEPARTMENTS
  } catch (error) {
    console.error("Error in getDepartmentsWithMapping:", error, "Using default departments")
    memoryCache.set(DEPARTMENTS_CACHE_KEY, DEFAULT_DEPARTMENTS, CACHE_CONFIG.HOSPITALS * 1000)
    return DEFAULT_DEPARTMENTS
  }
}

// =============================================================================
// FILTERING
// =============================================================================

/** Apply filters to department data */
export function applyDepartmentFilters(
  departments: Department[],
  filters: DepartmentFilterParams,
): Department[] {
  let result = departments

  if (isNonEmptyString(filters.q)) {
    const query = filters.q.toLowerCase()
    result = result.filter((d) => d.name?.toLowerCase().includes(query))
  }

  if (filters.sortBy === "az") {
    result = sortByAlphabet(result, (d) => d.name)
  } else if (filters.sortBy === "za") {
    result = sortByAlphabet(result, (d) => d.name, "desc")
  }

  return result
}

// =============================================================================
// MAIN SERVICE
// =============================================================================

/** Get departments with filtering and pagination (mapped data) */
export async function getDepartments(
  filters: DepartmentFilterParams,
): Promise<PaginatedResult<Department>> {
  const allDepartments = await getDepartmentsWithMapping()
  const filteredDepartments = applyDepartmentFilters(allDepartments, filters)
  const page = filters.page ?? 0
  const pageSize = filters.pageSize ?? 500

  return createPaginatedResult(filteredDepartments, page, pageSize)
}

/** Get department with limited treatments (for homepage card display) */
export async function getDepartmentWithLimitedTreatments(
  departmentId: string,
): Promise<Department | null> {
  const allDepartments = await getDepartmentsWithMapping()
  const department = allDepartments.find(
    (d) => d._id === departmentId || d.slug === departmentId,
  )

  if (!department) return null

  const limitedTreatments = department.treatments?.slice(0, 4) ?? []

  return {
    ...department,
    treatments: limitedTreatments,
    totalTreatments: department.treatments?.length ?? 0,
  }
}

/** Get department with all treatments (for department slug page) */
export async function getDepartmentWithAllTreatments(
  slug: string,
): Promise<Department | null> {
  const allDepartments = await getDepartmentsWithMapping()
  return allDepartments.find((d) => d.slug === slug || d._id === slug) ?? null
}

/** Get all departments (for detail pages) */
export async function getAllDepartments(): Promise<Department[]> {
  return getDepartmentsWithMapping()
}

// =============================================================================
// LEGACY & ADDITIONAL EXPORTS
// =============================================================================

/**
 * Compute profileImageUrl from profileImage for doctor data
 */
function computeProfileImageUrl(profileImage?: string | null): string | null {
  if (!profileImage) return null
  if (profileImage.startsWith("http")) return profileImage
  if (profileImage.startsWith("wix:image://")) {
    return (
      getWixScaledToFillImageUrl(profileImage, 400, 300) ||
      getWixImageUrl(profileImage) ||
      null
    )
  }
  return profileImage
}

/**
 * Get doctors associated with a specific department
 * Matches doctors by departmentName, subDepartmentName, or specialistMappingName
 */
export function getDoctorsByDepartment(
  cmsData: CMSDataResponse,
  departmentName: string,
): DoctorData[] {
  const allDoctors = cmsData.doctors || []
  const deptNameLower = departmentName.toLowerCase().trim()

  const filtered = allDoctors.filter((doctor) => {
    const docDeptName = doctor.departmentName?.toLowerCase().trim() || ""
    const docSubDeptName = doctor.subDepartmentName?.toLowerCase().trim() || ""
    const docSpecialistMapping = doctor.specialistMappingName?.toLowerCase().trim() || ""

    return (
      docDeptName === deptNameLower ||
      docSubDeptName === deptNameLower ||
      docSpecialistMapping === deptNameLower ||
      deptNameLower.includes(docDeptName) ||
      deptNameLower.includes(docSubDeptName) ||
      deptNameLower.includes(docSpecialistMapping) ||
      docDeptName.includes(deptNameLower) ||
      docSubDeptName.includes(deptNameLower) ||
      docSpecialistMapping.includes(deptNameLower)
    )
  })

  // Deduplicate by _id
  const uniqueMap = new Map<string, DoctorData>()
  for (const doc of filtered) {
    if (doc._id && !uniqueMap.has(doc._id)) {
      uniqueMap.set(doc._id, doc)
    }
  }

  return Array.from(uniqueMap.values())
}

/** Extract all departments with their relationships (legacy) */
export function extractAllDepartments(cmsData: any): Department[] {
  const departmentsMap = new Map<string, Department>()

  cmsData.hospitals?.forEach((hospital: any) => {
    hospital.branches?.forEach((branch: any) => {
      branch.department?.forEach((dept: any) => {
        const deptId = dept._id || dept.name
        const deptName = dept.name || dept.title || ""

        if (!deptId || !deptName) return

        const existing = departmentsMap.get(deptId) || {
          _id: deptId,
          name: deptName,
          slug: generateSlug(deptName),
          departmentImage: null,
          subDepartments: [],
          treatments: [],
          totalTreatments: 0,
        }

        branch.treatments?.forEach((treatment: any) => {
          const treatId = treatment._id || treatment.name
          if (
            treatId &&
            !existing.treatments?.some((t: any) => t._id === treatId)
          ) {
            existing.treatments = existing.treatments || []
            existing.treatments.push({
              _id: treatId,
              name: treatment.name || treatment.treatmentName || "",
              treatmentImage: treatment.treatmentImage,
              popular: treatment.popular,
            })
          }
        })

        existing.totalTreatments = existing.treatments?.length ?? 0
        departmentsMap.set(deptId, existing)
      })
    })
  })

  return Array.from(departmentsMap.values())
}

/**
 * Get department with doctors based on Specialist Master collection
 * CSV Fields: "name","subDepartment_specialist","TreatmentMaster_specialistMap","doctor"
 * Doctors are linked from the "doctor" field in SpecialistMaster
 */
export async function getDepartmentWithDoctors(
  slug: string,
): Promise<{ department: Department | null; doctors: any[] }> {
  const allDepartments = await getDepartmentsWithMapping()
  const department = allDepartments.find(
    (d) => d.slug === slug || d._id === slug,
  )

  if (!department) {
    return { department: null, doctors: [] }
  }

  const doctorMap = new Map<string, any>()
  const deptId = department._id
  const deptNameLower = (department.name || "").toLowerCase()
  const subDeptIds = new Set(
    department.subDepartments?.map((sd) => sd._id).filter(Boolean) ?? [],
  )
  const treatmentIds = new Set(
    department.treatments?.map((t) => t._id).filter(Boolean) ?? [],
  )

  try {
    const [allSpecialists, allDoctors] = await Promise.all([
      fetchAllSpecialists(),
      fetchAllDoctors(),
    ])

    const doctorMasterMap = new Map<string, any>()
    for (const doc of allDoctors) {
      if (doc._id) doctorMasterMap.set(doc._id, doc)
    }

    for (const specialist of allSpecialists) {
      let isRelevant = false
      const specialistNameLower = String(specialist.name || "").toLowerCase()

      if (specialist.subDepartment_specialist) {
        const subDeptRefs = Array.isArray(specialist.subDepartment_specialist)
          ? specialist.subDepartment_specialist
          : [specialist.subDepartment_specialist]

        for (const subDeptRef of subDeptRefs) {
          if (subDeptRef?._id && subDeptIds.has(subDeptRef._id)) {
            isRelevant = true
            break
          }
        }
      }

      if (!isRelevant && specialist.SpecialistMaster_department) {
        const deptRefs = Array.isArray(specialist.SpecialistMaster_department)
          ? specialist.SpecialistMaster_department
          : [specialist.SpecialistMaster_department]

        for (const deptRef of deptRefs) {
          if (
            deptRef?._id === deptId ||
            (deptRef?.name?.toLowerCase() ?? "").includes(deptNameLower) ||
            deptNameLower.includes(deptRef?.name?.toLowerCase() ?? "")
          ) {
            isRelevant = true
            break
          }
        }
      }

      if (!isRelevant && specialist.TreatmentMaster_specialistMap) {
        const treatmentRefs = Array.isArray(
          specialist.TreatmentMaster_specialistMap,
        )
          ? specialist.TreatmentMaster_specialistMap
          : [specialist.TreatmentMaster_specialistMap]

        for (const treatRef of treatmentRefs) {
          if (treatRef?._id && treatmentIds.has(treatRef._id)) {
            isRelevant = true
            break
          }
        }
      }

      if (
        !isRelevant &&
        (specialistNameLower.includes(deptNameLower) ||
          deptNameLower.includes(specialistNameLower))
      ) {
        isRelevant = true
      }

      if (isRelevant && specialist.doctor) {
        const doctorRefs = Array.isArray(specialist.doctor)
          ? specialist.doctor
          : [specialist.doctor]

        for (const docRef of doctorRefs) {
          if (!docRef?._id || doctorMap.has(docRef._id)) continue

          const doctorData = doctorMasterMap.get(docRef._id)

          const subDeptNames = Array.isArray(
            specialist.subDepartment_specialist,
          )
            ? specialist.subDepartment_specialist
                .filter((sd: any) => sd?._id && subDeptIds.has(sd._id))
                .map((sd: any) => sd.name)
                .filter(Boolean)
            : []

          const deptNames = Array.isArray(
            specialist.SpecialistMaster_department,
          )
            ? specialist.SpecialistMaster_department.filter(
                (d: any) =>
                  d?._id === deptId ||
                  (d?.name?.toLowerCase() ?? "").includes(deptNameLower) ||
                  deptNameLower.includes(d?.name?.toLowerCase() ?? ""),
              )
                .map((d: any) => d.name)
                .filter(Boolean)
            : []

          let finalDeptName = deptNames[0] || null
          if (!finalDeptName) {
            if (
              specialistNameLower.includes(deptNameLower) ||
              deptNameLower.includes(specialistNameLower)
            ) {
              finalDeptName = department.name
            }
          }

          // Resolve branchId and branchName from the doctor's hospital field
          let resolvedBranchName = doctorData?.branchName || null
          let resolvedBranchId = doctorData?.branchId || null
          if (doctorData?.hospital && typeof doctorData.hospital === 'object' && !Array.isArray(doctorData.hospital)) {
            const hospitalRef = doctorData.hospital as any
            if (!resolvedBranchName) resolvedBranchName = hospitalRef.branchName || (hospitalRef.branch && hospitalRef.branch.name) || null
            if (!resolvedBranchId) resolvedBranchId = hospitalRef.branchId || (hospitalRef.branch && hospitalRef.branch._id) || null
          } else if (Array.isArray(doctorData?.hospital) && doctorData.hospital.length > 0) {
            const firstHospitalRef = doctorData.hospital[0] as any
            if (!resolvedBranchName) resolvedBranchName = firstHospitalRef.branchName || (firstHospitalRef.branch && firstHospitalRef.branch.name) || null
            if (!resolvedBranchId) resolvedBranchId = firstHospitalRef.branchId || (firstHospitalRef.branch && firstHospitalRef.branch._id) || null
          }

          if (doctorData) {
            const profileImg =
              doctorData["profile Image"] ||
              doctorData.profileImage ||
              specialist.image ||
              null
            doctorMap.set(docRef._id, {
              _id: doctorData._id,
              doctorName:
                doctorData["Doctor Name"] ||
                doctorData.doctorName ||
                doctorData.name ||
                docRef.name ||
                specialist.name ||
                "Doctor",
              specialization: specialist.name || null,
              specialistMappingName: specialist.name || null,
              subDepartmentName: subDeptNames[0] || null,
              departmentName: finalDeptName,
              experienceYears:
                doctorData["Experience (Years)"] ||
                doctorData.experienceYears ||
                specialist.experience ||
                null,
              qualification:
                doctorData.Qualification ||
                doctorData.qualification ||
                specialist.qualification ||
                null,
              profileImage: profileImg,
              profileImageUrl: computeProfileImageUrl(profileImg),
              designation:
                doctorData.Designation || doctorData.designation || null,
              aboutDoctor:
                doctorData["About Doctor"] || doctorData.aboutDoctor || null,
              popular: doctorData.popular || specialist.popular || false,
              hospitalName:
                doctorData.hospitalName ||
                (typeof (doctorData.hospital as any) === 'object' && !Array.isArray(doctorData.hospital)
                  ? ((doctorData.hospital as any).hospitalName || (doctorData.hospital as any).name || null)
                  : null),
              branchName: resolvedBranchName,
              slug:
                doctorData.slug ||
                (doctorData["Doctor Name"]
                  ? generateUniqueSlug(
                      doctorData["Doctor Name"],
                      doctorData._id,
                    )
                  : generateSlug(
                      doctorData["Doctor Name"] || docRef.name || "",
                    )),
            })
          } else {
            const profileImg = specialist.image || null
            let resolvedBranchName: string | null = null
            let resolvedHospitalName: string | null = (specialist.hospitalName as string | null) || null
            if (specialist.hospital && typeof specialist.hospital === 'object' && !Array.isArray(specialist.hospital)) {
              const hospitalRef = specialist.hospital as any
              if (!resolvedHospitalName) resolvedHospitalName = ((hospitalRef.hospitalName || hospitalRef.name || '') as string | null)
              resolvedBranchName = ((hospitalRef.branchName || (hospitalRef.branch && hospitalRef.branch.name) || '') as string | null)
            }
            doctorMap.set(docRef._id, {
              _id: docRef._id,
              doctorName: docRef.name || specialist.name || "Doctor",
              specialization: specialist.name || null,
              specialistMappingName: specialist.name || null,
              subDepartmentName: subDeptNames[0] || null,
              departmentName: finalDeptName,
              experienceYears: specialist.experience || null,
              qualification: specialist.qualification || null,
              profileImage: profileImg,
              profileImageUrl:
                typeof profileImg === "string"
                  ? computeProfileImageUrl(profileImg)
                  : null,
              popular: specialist.popular || false,
              hospitalName: resolvedHospitalName,
              branchName: resolvedBranchName,
              slug: docRef._id
                ? generateUniqueSlug(
                    docRef.name || specialist.name || "",
                    docRef._id,
                  )
                : generateSlug(docRef.name || specialist.name || ""),
            })
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching doctors:", error)
  }

  return { department, doctors: Array.from(doctorMap.values()) }
}
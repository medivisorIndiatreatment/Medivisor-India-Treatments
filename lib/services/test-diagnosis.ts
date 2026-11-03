// lib/services/test-diagnosis.ts
// Test & Diagnosis service with Wix CMS multi-reference data mapping

import {
  fetchAllTestDiagnoses,
  fetchAllSubTestDiagnoses,
  fetchAllTreatments,
  fetchAllDoctors,
  fetchAllSpecialists,
} from "@/lib/cms"
import { extractString } from "@/lib/services/homepage/transformers"
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

// TYPES
// =============================================================================

export interface TestDiagnosisFilterParams {
  q?: string
  specialist?: string
  branch?: string
  treatment?: string
  page?: number
  pageSize?: number
  sortBy?: "az" | "za" | "default"
  department?: string
  status?: string
}

export interface TestDiagnosis {
  _id: string
  name: string
  slug: string
  testDiagnosisImage?: string | null
  subTestDiagnoses?: SubTestDiagnosis[]
  treatments?: TestDiagnosisTreatment[]
  totalTreatments?: number
  description?: string | null
  descriptionHtml?: string | { nodes: unknown[] } | null
  richContent?: unknown
  department?: Array<{ _id: string; name: string }> | null
  status?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  startingCost?: string | null
  BranchesMaster_TestDiagnosis?: Array<{ _id: string; name: string }> | null
  subTestDiagnosis_departmentMap?: Array<{ _id: string; name: string }> | null
  image?: string | null
  ID?: string
  createdDate?: string | null
  updatedDate?: string | null
  Owner?: string | null
}

export interface SubTestDiagnosis {
  _id: string
  name: string
  treatments?: TestDiagnosisTreatment[]
}

export interface TestDiagnosisTreatment {
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

interface RawTestDiagnosis {
  _id: string
  name: string
  testDiagnosisImage?: string | null
  subTestDiagnosis_departmentMap?: Array<{ _id: string; name: string }> | null
  BranchesMaster_TestDiagnosis?: Array<{ _id: string; name: string }> | null
  Description?: string | null
  DescriptionHtml?: string | { nodes: unknown[] } | null
  RichContent?: unknown
  richContent?: unknown
  about?: string | null
  aboutHtml?: string | null
  About?: string | null
  AboutHtml?: string | null
  AboutTestDiagnosis?: string | null
  description?: string | null
  descriptionHtml?: string | null
  image?: string | null
  Image?: string | null
  department?: Array<{ _id: string; name: string }> | null
  status?: string | null
  Status?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  SeoTitle?: string | null
  SeoDescription?: string | null
  "Starting Cost"?: string | null
  startingCost?: string | null
  cost?: string | null
  ID?: string
  "Created Date"?: string
  "Updated Date"?: string
  createdDate?: string
  updatedDate?: string
  Owner?: string
  owner?: string
}

interface RawSubTestDiagnosis {
  _id: string
  name: string
  treatment?: Array<{ _id: string; name: string }> | null
  Treatment?: Array<{ _id: string; name: string }> | null
  departmentMap?: Array<{ _id: string; name: string }> | null
  subTestDiagnosis_departmentMap?: Array<{ _id: string; name: string }> | null
}

const SKIP_NAME_SCAN_KEYS = new Set([
  "_id", "ID", "image", "Image", "description", "Description",
  "descriptionHtml", "DescriptionHtml", "about", "About", "AboutHtml",
  "aboutHtml", "AboutTestDiagnosis", "richContent", "RichContent",
  "department", "status", "Status", "seoTitle", "SeoTitle",
  "seoDescription", "SeoDescription", "cost", "startingCost",
  "Starting Cost", "createdDate", "updatedDate", "Created Date",
  "Created date", "Updated Date", "Updated date", "Owner", "owner",
  "subTestDiagnosis_departmentMap", "BranchesMaster_TestDiagnosis",
  "title", "Title", "name", "Name", "testDiagnosisName",
  "TestDiagnosisName", "testDiagnosis", "TestDiagnosis",
  "diagnosisName", "testName", "testdiagnosisname",
  "diagnosis", "Diagnosis", "slug", "Slug", "data",
  "wixData", "_createdDate", "_updatedDate",
  "testDiagnosis_Image", "testDiagnosisImage",
])

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const WIX_IMAGE_PATTERN = /^wix:image:\/\//i

function looksLikeName(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.length === 0 || trimmed.length > 200) return false
  if (UUID_PATTERN.test(trimmed)) return false
  if (WIX_IMAGE_PATTERN.test(trimmed)) return false
  if (/^https?:\/\//i.test(trimmed)) return false
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return false
  if (!/[a-zA-Z]/.test(trimmed)) return false
  return true
}

function findNameFallback(td: Record<string, unknown>): string | undefined {
  for (const key of Object.keys(td)) {
    if (SKIP_NAME_SCAN_KEYS.has(key)) continue
    const v = td[key]
    if (typeof v === "string" && looksLikeName(v)) {
      return v
    }
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      const extracted = extractString(v)
      if (looksLikeName(extracted)) {
        return extracted
      }
    }
  }
  return undefined
}

/** Fetch all test diagnoses from TestDiagnosis collection with multi-reference expansion */
export async function fetchTestDiagnosesFromWix(): Promise<RawTestDiagnosis[]> {
  const rawTestDiagnoses = await fetchAllTestDiagnoses()

  return rawTestDiagnoses.map((td: any) => {
    const id = td._id ?? td.ID ?? ""
    const knownName = extractString(
      td.name ??
        td.Name ??
        td.testDiagnosisName ??
        td.TestDiagnosisName ??
        td.testDiagnosis ??
        td.TestDiagnosis ??
        td.title ??
        td.Title ??
        td["Test Diagnosis Name"] ??
        td["test diagnosis name"] ??
        td.diagnosisName ??
        td.testName ??
        td.testdiagnosisname ??
        td.diagnosis ??
        td.Diagnosis ??
        td.DisplayName ??
        td.displayName ??
        null,
    )
    const tdName = (knownName && knownName.trim().length > 0)
      ? knownName
      : (findNameFallback(td) ?? "Unknown Test & Diagnosis")

    let subTDRefs: Array<{ _id: string; name: string }> | null = null
    if (td.subTestDiagnosis_departmentMap) {
      subTDRefs = Array.isArray(td.subTestDiagnosis_departmentMap)
        ? td.subTestDiagnosis_departmentMap
        : [td.subTestDiagnosis_departmentMap]
    } else if (td.subTestDiagnosis) {
      subTDRefs = Array.isArray(td.subTestDiagnosis)
        ? td.subTestDiagnosis
        : [td.subTestDiagnosis]
    }

    let branchTDRefs: Array<{ _id: string; name: string }> | null = null
    if (td.BranchesMaster_TestDiagnosis) {
      branchTDRefs = Array.isArray(td.BranchesMaster_TestDiagnosis)
        ? td.BranchesMaster_TestDiagnosis
        : [td.BranchesMaster_TestDiagnosis]
    }

    return {
      _id: id,
      name: tdName,
      testDiagnosisImage: td.image ?? td.testDiagnosisImage ?? null,
      subTestDiagnosis_departmentMap: subTDRefs,
      BranchesMaster_TestDiagnosis: branchTDRefs,
      Description: td.Description ?? td.description ?? td.about ??
        td.About ?? td.AboutTestDiagnosis ?? null,
      DescriptionHtml: td.DescriptionHtml ?? td.descriptionHtml ??
        td.aboutHtml ?? td.AboutHtml ?? null,
      RichContent: td.RichContent ?? td.richContent ?? null,
      image: td.image ?? null,
      department: td.department ?? null,
      status: td.Status ?? td.status ?? null,
      seoTitle: td.SeoTitle ?? td.seoTitle ?? null,
      seoDescription: td.SeoDescription ?? td.seoDescription ?? null,
      ID: td.ID ?? null,
      createdDate: td["Created date"] ?? td.createdDate ?? null,
      updatedDate: td["Updated date"] ?? td.updatedDate ?? null,
      Owner: td.Owner ?? null,
    }
  })
}

/** Fetch all sub-test-diagnoses from SubTestDiagnosis collection with multi-reference expansion */
export async function fetchSubTestDiagnosesFromWix(): Promise<RawSubTestDiagnosis[]> {
  const rawSubTestDiagnoses = await fetchAllSubTestDiagnoses()

  return rawSubTestDiagnoses.map((subTD: any) => {
    const id = subTD._id ?? subTD.ID ?? ""
    const subTDName = subTD.name ??
      subTD.subTestDiagnosisName ??
      subTD.subTestDiagnosis ??
      subTD.SubTestDiagnosis ??
      "Unknown SubTestDiagnosis"

    let treatmentRefs: Array<{ _id: string; name: string }> | null = null
    if (subTD.treatment) {
      treatmentRefs = Array.isArray(subTD.treatment)
        ? subTD.treatment
        : [subTD.treatment]
    } else if (subTD.Treatment) {
      treatmentRefs = Array.isArray(subTD.Treatment)
        ? subTD.Treatment
        : [subTD.Treatment]
    }

    let deptMapRefs: Array<{ _id: string; name: string }> | null = null
    if (subTD.departmentMap) {
      deptMapRefs = Array.isArray(subTD.departmentMap)
        ? subTD.departmentMap
        : [subTD.departmentMap]
    } else if (subTD.subTestDiagnosis_departmentMap) {
      deptMapRefs = Array.isArray(subTD.subTestDiagnosis_departmentMap)
        ? subTD.subTestDiagnosis_departmentMap
        : [subTD.subTestDiagnosis_departmentMap]
    }

    return {
      _id: id,
      name: subTDName,
      treatment: treatmentRefs,
      departmentMap: deptMapRefs,
    }
  })
}

/** Fetch all treatments from Treatment collection */
export async function fetchTreatmentsFromWixForTestDiagnosis(): Promise<TreatmentData[]> {
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
// DATA MAPPING - TestDiagnosis → SubTestDiagnosis → Treatments
// =============================================================================

/** Build test diagnosis hierarchy with multi-reference mapping */
export function buildTestDiagnosisHierarchy(
  testDiagnoses: RawTestDiagnosis[],
  subTestDiagnoses: RawSubTestDiagnosis[],
  treatments: TreatmentData[],
): TestDiagnosis[] {
  const treatmentMapById = new Map<string, TreatmentData>()
  const treatmentMapByName = new Map<string, TreatmentData>()
  treatments.forEach((t) => {
    if (t._id) treatmentMapById.set(t._id, t)
    if (t.name) treatmentMapByName.set(t.name.toLowerCase(), t)
  })

  const subTestDiagnosisMap = new Map<string, RawSubTestDiagnosis>()
  subTestDiagnoses.forEach((sd) => {
    if (sd._id) subTestDiagnosisMap.set(sd._id, sd)
  })

  const testDiagnosisSubTestDiagnosisMap = new Map<string, RawSubTestDiagnosis[]>()
  subTestDiagnoses.forEach((subTD) => {
    const deptRefs = subTD.departmentMap ?? subTD.subTestDiagnosis_departmentMap ?? []
    deptRefs.forEach((deptRef) => {
      const deptId = deptRef._id
      if (!deptId) return

      if (!testDiagnosisSubTestDiagnosisMap.has(deptId)) {
        testDiagnosisSubTestDiagnosisMap.set(deptId, [])
      }
      const existing = testDiagnosisSubTestDiagnosisMap.get(deptId)!
      if (!existing.some((sd) => sd._id === subTD._id)) {
        existing.push(subTD)
      }
    })
  })

  return testDiagnoses
    .map((td) => {
      const tdId = td._id
      if (!tdId) return null

      const subTDRefs = td.subTestDiagnosis_departmentMap ?? []
      let subTestDiagnosesList: RawSubTestDiagnosis[] = []

      subTDRefs.forEach((ref) => {
        const subTD = subTestDiagnosisMap.get(ref._id)
        if (subTD && !subTestDiagnosesList.some((sd) => sd._id === subTD._id)) {
          subTestDiagnosesList.push(subTD)
        }
      })

      const reverseMappedSubTestDiagnoses = testDiagnosisSubTestDiagnosisMap.get(tdId) ?? []
      reverseMappedSubTestDiagnoses.forEach((subTD) => {
        if (!subTestDiagnosesList.some((sd) => sd._id === subTD._id)) {
          subTestDiagnosesList.push(subTD)
        }
      })

      const treatmentsMap = new Map<string, TestDiagnosisTreatment>()

      subTestDiagnosesList.forEach((subTD) => {
        const treatmentRefs = subTD.treatment ?? subTD.Treatment ?? []

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
        _id: tdId,
        name: td.name,
        slug: generateSlug(td.name),
        testDiagnosisImage: getImageUrl(td.testDiagnosisImage),
        subTestDiagnoses: subTestDiagnosesList.map((sd) => ({
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
            .filter(Boolean) as TestDiagnosisTreatment[],
        })),
        treatments: allTreatments,
        totalTreatments: allTreatments.length,
        description: td.Description ??
          td.description ??
          td.about ??
          td.About ??
          td.AboutTestDiagnosis ??
          null,
        descriptionHtml: td.DescriptionHtml ??
          td.Description ??
          td.descriptionHtml ??
          td.description ??
          td.aboutHtml ??
          td.AboutHtml ??
          null,
        richContent: td.RichContent ?? td.richContent ?? null,
        department: td.department ?? null,
        status: td.Status ?? td.status ?? null,
        seoTitle: td.SeoTitle ?? td.seoTitle ?? null,
        seoDescription: td.SeoDescription ?? td.seoDescription ?? null,
        startingCost: td["Starting Cost"] || td.startingCost || td.cost || null,
        BranchesMaster_TestDiagnosis: td.BranchesMaster_TestDiagnosis ?? null,
        subTestDiagnosis_departmentMap: td.subTestDiagnosis_departmentMap ?? null,
        image: td.testDiagnosisImage,
        ID: td._id,
        createdDate: td.createdDate ?? null,
        updatedDate: td.updatedDate ?? null,
        Owner: td.Owner ?? null,
      }
    })
    .filter(Boolean) as TestDiagnosis[]
}

// =============================================================================
// DATA FETCHING - Optimized single fetch
// =============================================================================

const TEST_DIAGNOSES_CACHE_KEY = "test_diagnoses_with_mapping"

/**
 * Get all test diagnoses with full mapping (optimized)
 * Uses direct data fetching for latest data from Wix CMS.
 * No fallback data — returns empty array when Wix CMS returns no results.
 */
async function loadTestDiagnosesWithMapping(): Promise<TestDiagnosis[]> {
  const cached = memoryCache.get<TestDiagnosis[]>(TEST_DIAGNOSES_CACHE_KEY)
  if (cached) return cached

  let result: TestDiagnosis[]

  try {
    const [testDiagnosesRes, subTestDiagnosesRes, treatmentsRes] =
      await Promise.allSettled([
        fetchTestDiagnosesFromWix(),
        fetchSubTestDiagnosesFromWix(),
        fetchTreatmentsFromWixForTestDiagnosis(),
      ])

    const testDiagnoses = testDiagnosesRes.status === "fulfilled" ? testDiagnosesRes.value : []
    const subTestDiagnoses =
      subTestDiagnosesRes.status === "fulfilled" ? subTestDiagnosesRes.value : []
    const treatments = treatmentsRes.status === "fulfilled" ? treatmentsRes.value : []

    if (testDiagnosesRes.status === "rejected") {
      console.warn(
        "[getTestDiagnosesWithMapping] TestDiagnosis fetch failed:",
        testDiagnosesRes.reason,
      )
    }
    if (subTestDiagnosesRes.status === "rejected") {
      console.warn(
        "[getTestDiagnosesWithMapping] SubTestDiagnosis fetch failed:",
        subTestDiagnosesRes.reason,
      )
    }
    if (treatmentsRes.status === "rejected") {
      console.warn(
        "[getTestDiagnosesWithMapping] Treatment fetch failed:",
        treatmentsRes.reason,
      )
    }

    console.debug('[getTestDiagnosesWithMapping] raw counts', {
      testDiagnoses: testDiagnoses.length,
      subTestDiagnoses: subTestDiagnoses.length,
      treatments: treatments.length,
      sampleTestDiagnosis: testDiagnoses[0] ? {
        _id: testDiagnoses[0]._id,
        name: testDiagnoses[0].name,
        hasImage: Boolean(testDiagnoses[0].testDiagnosisImage),
        subTestDiagnosisRefs: testDiagnoses[0].subTestDiagnosis_departmentMap?.length ?? 0,
      } : null,
    })

    result = buildTestDiagnosisHierarchy(testDiagnoses, subTestDiagnoses, treatments)

    console.debug('[getTestDiagnosesWithMapping] mapped counts', {
      result: result.length,
      withTreatments: result.filter(r => (r.treatments?.length ?? 0) > 0).length,
      withoutTreatments: result.filter(r => (r.treatments?.length ?? 0) === 0).length,
      sampleMapped: result[0] ? {
        _id: result[0]._id,
        name: result[0].name,
        treatmentCount: result[0].treatments?.length ?? 0,
      } : null,
    })
  } catch (error) {
    console.error("Error in getTestDiagnosesWithMapping:", error)
    result = []
  }

  if (result && result.length > 0) {
    const sortedResult = [...result].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
    )
    memoryCache.set(TEST_DIAGNOSES_CACHE_KEY, sortedResult, CACHE_CONFIG.HOSPITALS * 1000)
    return sortedResult
  }

  console.warn("getTestDiagnosesWithMapping: No data from Wix CMS, returning empty array")
  memoryCache.set(TEST_DIAGNOSES_CACHE_KEY, [], CACHE_CONFIG.HOSPITALS * 1000)
  return []
}

export function getTestDiagnosesWithMapping(): Promise<TestDiagnosis[]> {
  const cached = memoryCache.get<TestDiagnosis[]>(TEST_DIAGNOSES_CACHE_KEY)
  if (cached !== null) return Promise.resolve(cached)
  return memoryCache.dedupe(TEST_DIAGNOSES_CACHE_KEY, loadTestDiagnosesWithMapping)
}

// =============================================================================
// FILTERING
// =============================================================================

/** Apply filters to test diagnosis data */
export function applyTestDiagnosisFilters(
  testDiagnoses: TestDiagnosis[],
  filters: TestDiagnosisFilterParams,
): TestDiagnosis[] {
  let result = testDiagnoses

  if (isNonEmptyString(filters.q)) {
    const query = filters.q.toLowerCase()
    result = result.filter((td) => td.name?.toLowerCase().includes(query))
  }

  if (filters.department) {
    const deptLower = filters.department.toLowerCase()
    result = result.filter((td) =>
      td.department?.some((d) => d.name?.toLowerCase().includes(deptLower))
    )
  }

  if (filters.status) {
    const statusLower = filters.status.toLowerCase()
    result = result.filter((td) => (td.status || "").toLowerCase() === statusLower)
  }

  if (filters.sortBy === "az") {
    result = sortByAlphabet(result, (td) => td.name)
  } else if (filters.sortBy === "za") {
    result = sortByAlphabet(result, (td) => td.name, "desc")
  }

  return result
}

// =============================================================================
// MAIN SERVICE
// =============================================================================

/** Get test diagnoses with filtering and pagination (mapped data) */
export async function getTestDiagnoses(
  filters: TestDiagnosisFilterParams,
): Promise<PaginatedResult<TestDiagnosis>> {
  const allTestDiagnoses = await getTestDiagnosesWithMapping()
  const filteredTestDiagnoses = applyTestDiagnosisFilters(allTestDiagnoses, filters)
  const page = filters.page ?? 0
  const pageSize = filters.pageSize ?? 500

  return createPaginatedResult(filteredTestDiagnoses, page, pageSize)
}

/** Get test diagnosis with limited treatments (for homepage card display) */
export async function getTestDiagnosisWithLimitedTreatments(
  testDiagnosisId: string,
): Promise<TestDiagnosis | null> {
  const allTestDiagnoses = await getTestDiagnosesWithMapping()
  const testDiagnosis = allTestDiagnoses.find(
    (td) => td._id === testDiagnosisId || td.slug === testDiagnosisId,
  )

  if (!testDiagnosis) return null

  const limitedTreatments = testDiagnosis.treatments?.slice(0, 4) ?? []

  return {
    ...testDiagnosis,
    treatments: limitedTreatments,
    totalTreatments: testDiagnosis.treatments?.length ?? 0,
  }
}

/** Get test diagnosis with all treatments (for test diagnosis slug page) */
export async function getTestDiagnosisWithAllTreatments(
  slug: string,
): Promise<TestDiagnosis | null> {
  const allTestDiagnoses = await getTestDiagnosesWithMapping()
  return allTestDiagnoses.find((td) => td.slug === slug || td._id === slug) ?? null
}

/** Get all test diagnoses (for detail pages) */
export async function getAllTestDiagnoses(): Promise<TestDiagnosis[]> {
  return getTestDiagnosesWithMapping()
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
 * Get doctors associated with a specific test diagnosis
 * Matches doctors by testDiagnosisName, subTestDiagnosisName, or specialistMappingName
 */
export function getDoctorsByTestDiagnosis(
  cmsData: CMSDataResponse,
  testDiagnosisName: string,
): DoctorData[] {
  const allDoctors = cmsData.doctors || []
  const tdNameLower = testDiagnosisName.toLowerCase().trim()

  const filtered = allDoctors.filter((doctor) => {
    const docTDName = doctor.testDiagnosisName?.toLowerCase().trim() || ""
    const docSubTDName = doctor.subTestDiagnosisName?.toLowerCase().trim() || ""
    const docSpecialistMapping = doctor.specialistMappingName?.toLowerCase().trim() || ""

    return (
      docTDName === tdNameLower ||
      docSubTDName === tdNameLower ||
      docSpecialistMapping === tdNameLower ||
      tdNameLower.includes(docTDName) ||
      tdNameLower.includes(docSubTDName) ||
      tdNameLower.includes(docSpecialistMapping) ||
      docTDName.includes(tdNameLower) ||
      docSubTDName.includes(tdNameLower) ||
      docSpecialistMapping.includes(tdNameLower)
    )
  })

  const uniqueMap = new Map<string, DoctorData>()
  for (const doc of filtered) {
    if (doc._id && !uniqueMap.has(doc._id)) {
      uniqueMap.set(doc._id, doc)
    }
  }

  return Array.from(uniqueMap.values())
}

/**
 * Extract all test diagnoses with their relationships (legacy)
 */
export function extractAllTestDiagnoses(cmsData: any): TestDiagnosis[] {
  const testDiagnosesMap = new Map<string, TestDiagnosis>()

  cmsData.hospitals?.forEach((hospital: any) => {
    hospital.branches?.forEach((branch: any) => {
      branch.testDiagnosis?.forEach((td: any) => {
        const tdId = td._id || td.name
        const tdName = td.name || td.title || ""

        if (!tdId || !tdName) return

        const existing = testDiagnosesMap.get(tdId) || {
          _id: tdId,
          name: tdName,
          slug: generateSlug(tdName),
          testDiagnosisImage: null,
          subTestDiagnoses: [],
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
        testDiagnosesMap.set(tdId, existing)
      })
    })
  })

  return Array.from(testDiagnosesMap.values())
}

/**
 * Get test diagnosis with doctors based on Specialist Master collection
 */
export async function getTestDiagnosisWithDoctors(
  slug: string,
): Promise<{ testDiagnosis: TestDiagnosis | null; doctors: any[] }> {
  const allTestDiagnoses = await getTestDiagnosesWithMapping()
  const testDiagnosis = allTestDiagnoses.find(
    (td) => td.slug === slug || td._id === slug,
  )

  if (!testDiagnosis) {
    return { testDiagnosis: null, doctors: [] }
  }

  const doctorMap = new Map<string, any>()
  const tdId = testDiagnosis._id
  const tdNameLower = (testDiagnosis.name || "").toLowerCase()
  const subTDIds = new Set(
    testDiagnosis.subTestDiagnoses?.map((sd) => sd._id).filter(Boolean) ?? [],
  )
  const treatmentIds = new Set(
    testDiagnosis.treatments?.map((t) => t._id).filter(Boolean) ?? [],
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

      if (specialist.subTestDiagnosis_specialist) {
        const subTDRefs = Array.isArray(specialist.subTestDiagnosis_specialist)
          ? specialist.subTestDiagnosis_specialist
          : [specialist.subTestDiagnosis_specialist]

        for (const subTDRef of subTDRefs) {
          if (subTDRef?._id && subTDIds.has(subTDRef._id)) {
            isRelevant = true
            break
          }
        }
      }

      if (!isRelevant && specialist.SpecialistMaster_TestDiagnosis) {
        const tdRefs = Array.isArray(specialist.SpecialistMaster_TestDiagnosis)
          ? specialist.SpecialistMaster_TestDiagnosis
          : [specialist.SpecialistMaster_TestDiagnosis]

        for (const tdRef of tdRefs) {
          if (
            tdRef?._id === tdId ||
            (tdRef?.name?.toLowerCase() ?? "").includes(tdNameLower) ||
            tdNameLower.includes(tdRef?.name?.toLowerCase() ?? "")
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
        (specialistNameLower.includes(tdNameLower) ||
          tdNameLower.includes(specialistNameLower))
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

          const subTDNames = Array.isArray(
            specialist.subTestDiagnosis_specialist,
          )
            ? specialist.subTestDiagnosis_specialist
                .filter((sd: any) => sd?._id && subTDIds.has(sd._id))
                .map((sd: any) => sd.name)
                .filter(Boolean)
            : []

          const tdNames = Array.isArray(
            specialist.SpecialistMaster_TestDiagnosis,
          )
            ? specialist.SpecialistMaster_TestDiagnosis.filter(
                (d: any) =>
                  d?._id === tdId ||
                  (d?.name?.toLowerCase() ?? "").includes(tdNameLower) ||
                  tdNameLower.includes(d?.name?.toLowerCase() ?? ""),
              )
                .map((d: any) => d.name)
                .filter(Boolean)
            : []

          let finalTDName = tdNames[0] || null
          if (!finalTDName) {
            if (
              specialistNameLower.includes(tdNameLower) ||
              tdNameLower.includes(specialistNameLower)
            ) {
              finalTDName = testDiagnosis.name
            }
          }

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
              subTestDiagnosisName: subTDNames[0] || null,
              testDiagnosisName: finalTDName,
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
              subTestDiagnosisName: subTDNames[0] || null,
              testDiagnosisName: finalTDName,
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

  return { testDiagnosis, doctors: Array.from(doctorMap.values()) }
}

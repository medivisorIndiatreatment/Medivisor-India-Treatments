// lib/services/homepage/prepare.ts
// Server-side preparation of all homepage render data.
// Moves transformation logic out of client components so the homepage
// ships only lightweight, render-ready data to the browser.

import type { DepartmentData, CMSDataResponse, TechnologyData, TestDiagnosisData } from '@/lib/cms/types'
import type {
  DepartmentCardData,
  SearchOption,
} from '@/components/DepartmentServices'
import {
  mapDepartments,
  mapTechnologies,
  mapTestDiagnoses,
  mapPartnerLogos,
  transformDoctorsForHomepage,
  transformAllHospitals,
  extractString,
  type NormalizedLocation,
} from './transformers'
import type { DoctorCardData } from '@/components/cards/types'
import type { PartnerLogoData } from './types'
import {
  getWixImageUrl,
  getWixScaledToFillImageUrl,
} from '@/lib/wixMedia'
import { getImageUrl } from '@/lib/utils/cms'
import { generateSlug } from '@/lib/slug-utils'
import { stripHtmlTags, sanitizeHtml, extractRichTextHtml } from '@/lib/cms'

// -----------------------------------------------------------------------------
// DEPARTMENT CARDS
// Moved from components/DepartmentServices.tsx (was executed on the client).
// -----------------------------------------------------------------------------

function sortAlphabetically<T extends { name?: string; treatmentName?: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const nameA = (a.name || a.treatmentName || '').toLowerCase()
    const nameB = (b.name || b.treatmentName || '').toLowerCase()
    return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' })
  })
}

function sortByName<T extends { departmentName?: string; name?: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const nameA = (a.departmentName || a.name || '').toLowerCase()
    const nameB = (b.departmentName || b.name || '').toLowerCase()
    return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' })
  })
}

function getDepartmentTreatmentSlug(treatment: {
  slug?: string
  name?: string
}): string {
  return treatment.slug || generateSlug(treatment.name || '')
}

export function mapDepartmentsToCards(
  departments: DepartmentData[],
): DepartmentCardData[] {
  if (!departments || !Array.isArray(departments) || departments.length === 0) {
    return []
  }
  const mappedDepartments: DepartmentCardData[] = []
  for (const dept of departments) {
    if (!dept._id) continue
    const deptName = dept.name || ''
    if (!deptName) continue
    const imageUrl = (() => {
      if (dept.departmentImage) {
        if (
          typeof dept.departmentImage === 'string' &&
          /^https?:\/\//i.test(dept.departmentImage)
        ) {
          return dept.departmentImage
        }
        const wixRef = (dept.departmentImage as any)?._id
        if (typeof wixRef === 'string' && wixRef.startsWith('wix:image://')) {
          const converted = getWixImageUrl(wixRef)
          if (converted) return converted
        } else {
          const converted = getImageUrl(dept.departmentImage)
          if (converted) return converted
        }
      }
      const firstTreatmentImage = dept.treatments?.[0]?.treatmentImage
      if (firstTreatmentImage) {
        if (
          typeof firstTreatmentImage === 'string' &&
          /^https?:\/\//i.test(firstTreatmentImage)
        ) {
          return firstTreatmentImage
        }
        return getImageUrl(firstTreatmentImage)
      }
      return null
    })()
    const allTreatments: DepartmentCardData['allTreatments'] = []
    const treatmentIds = new Set<string>()
    const addTreatment = (t: DepartmentCardData['allTreatments'][number]) => {
      if (!t._id || !t.name) return
      if (treatmentIds.has(t._id)) return
      treatmentIds.add(t._id)
      allTreatments.push({
        _id: t._id,
        name: t.name,
        slug: t.slug || generateSlug(t.name),
        image: t.image || null,
      })
    }
    if (dept.subDepartments) {
      for (const subDept of dept.subDepartments) {
        if (subDept.treatments) {
          for (const t of subDept.treatments) {
            addTreatment({
              _id: t._id,
              name: t.name,
              slug: t.slug || generateSlug(t.name),
              image: t.treatmentImage || null,
            })
          }
        }
      }
    }
    if (dept.treatments) {
      for (const t of dept.treatments) {
        addTreatment({
          _id: t._id,
          name: t.name,
          slug: t.slug || generateSlug(t.name),
          image: t.treatmentImage || null,
        })
      }
    }
    const sortedTreatments = sortAlphabetically(allTreatments)
    const treatmentCount = sortedTreatments.length
    if (treatmentCount < 3) continue
    const displayTreatments = sortedTreatments.slice(0, 4)
    const remainingCount = Math.max(0, treatmentCount - 4)
    const deptSlug = dept.slug || generateSlug(deptName) || dept._id
    mappedDepartments.push({
      _id: dept._id,
      departmentName: deptName,
      departmentSlug: deptSlug,
      departmentImage: imageUrl || '/placeholder.svg',
      treatmentCount,
      allTreatments: sortedTreatments,
      displayTreatments,
      remainingCount,
    })
  }
  return sortByName(mappedDepartments)
}

export function buildSearchOptionsFromDepartments(
  departments: DepartmentCardData[],
): SearchOption[] {
  const options: SearchOption[] = []

  for (const dept of departments) {
    if (!dept._id || !dept.departmentName) continue
    options.push({
      id: 'dept-' + dept._id,
      name: dept.departmentName,
      slug: dept.departmentSlug,
      type: 'department',
    })
  }

  const seenTreatmentIds = new Set<string>()
  for (const dept of departments) {
    if (!dept._id || !dept.departmentName) continue
    for (const treatment of dept.allTreatments) {
      if (!treatment._id || !treatment.name) continue
      if (seenTreatmentIds.has(treatment._id)) continue
      seenTreatmentIds.add(treatment._id)
      options.push({
        id: 'treat-' + treatment._id,
        name: treatment.name,
        slug: getDepartmentTreatmentSlug(treatment),
        type: 'treatment',
        departmentId: dept._id,
        departmentName: dept.departmentName,
      })
    }
  }

  return sortAlphabetically(options)
}

// -----------------------------------------------------------------------------
// TECHNOLOGY CARDS
// Moved from components/TechnologiesServices.tsx (was executed on the client).
// -----------------------------------------------------------------------------

export interface TechnologyCard {
  _id: string
  heading: string
  subHeading?: string
  description: string
  image: string
  slug: string
}

function mapTechnologiesToCards(techs: TechnologyData[]): TechnologyCard[] {
  return techs
    .filter((tech) => tech.heading && typeof tech.heading === 'string')
    .map((tech) => {
      let imageUrl = (tech as any).image
      if (imageUrl && typeof imageUrl === 'string') {
        const scaledUrl = getWixScaledToFillImageUrl(imageUrl, 800, 600)
        if (scaledUrl) imageUrl = scaledUrl
        else imageUrl = getWixImageUrl(imageUrl) || imageUrl
      }
      if (!imageUrl) imageUrl = '/placeholder.svg'

      const slug = generateSlug((tech as any).heading || '')

      const descriptionHtml = extractRichTextHtml(
        (tech as any).descriptionHtml ||
          (tech as any).description ||
          (tech as any).detailsHtml ||
          (tech as any).details,
        true,
        false,
      )

      let description: string

      if (descriptionHtml) {
        description = sanitizeHtml(descriptionHtml)
        const textContent = stripHtmlTags(descriptionHtml)
        if (textContent.length > 150) {
          description = textContent.substring(0, 150).replace(/\s+\S*$/, '') + '...'
        }
      } else {
        description = stripHtmlTags(
          (tech as any).description || (tech as any).details || '',
        )
        if (description.length > 150) {
          description = description.substring(0, 150).replace(/\s+\S*$/, '') + '...'
        }
      }

      return {
        _id: tech._id,
        heading: (tech as any).heading || '',
        subHeading:
          (tech as any).subHeading && typeof (tech as any).subHeading === 'string'
            ? (tech as any).subHeading
            : undefined,
        description,
        image: imageUrl,
        slug,
      }
    })
    .sort((a, b) => (a.heading || '').localeCompare(b.heading || ''))
}

// -----------------------------------------------------------------------------
// TEST DIAGNOSIS CARDS
// Moved from components/TestDiagnosisServices.tsx (was executed on the client).
// -----------------------------------------------------------------------------

export interface TestDiagnosisCard {
  _id: string
  name: string
  slug: string
  testDiagnosisImage: string
  description: string
  startingCost: string | null
  treatmentCount: number
  displayTreatments: { _id: string; name: string; slug: string }[]
  remainingCount: number
}

function mapTestDiagnosesToCards(
  testDiagnoses: TestDiagnosisData[],
): TestDiagnosisCard[] {
  if (!testDiagnoses || !Array.isArray(testDiagnoses) || testDiagnoses.length === 0) {
    return []
  }

  const mapped: TestDiagnosisCard[] = []

  for (const td of testDiagnoses) {
    if (!td._id) continue
    const name = extractString(td.name) || ""
    if (!name) continue

    const imageUrl = (() => {
      if (td.testDiagnosisImage) {
        if (
          typeof td.testDiagnosisImage === 'string' &&
          /^https?:\/\//i.test(td.testDiagnosisImage)
        ) {
          return td.testDiagnosisImage
        }
        const wixRef = (td.testDiagnosisImage as any)?._id
        if (typeof wixRef === 'string' && wixRef.startsWith('wix:image://')) {
          const converted = getWixImageUrl(wixRef)
          if (converted) return converted
        } else {
          const converted = getImageUrl(td.testDiagnosisImage)
          if (converted) return converted
        }
      }
      const firstTreatmentImage = td.treatments?.[0]?.treatmentImage
      if (firstTreatmentImage) {
        if (
          typeof firstTreatmentImage === 'string' &&
          /^https?:\/\//i.test(firstTreatmentImage)
        ) {
          return firstTreatmentImage
        }
        return getImageUrl(firstTreatmentImage)
      }
      return null
    })()

    const allTreatments: { _id: string; name: string; slug: string }[] = []
    const treatmentIds = new Set<string>()
    const addTreatment = (t: { _id: string; name: string; slug?: string }) => {
      if (!t._id || !t.name) return
      if (treatmentIds.has(t._id)) return
      treatmentIds.add(t._id)
      allTreatments.push({
        _id: t._id,
        name: t.name,
        slug: t.slug || generateSlug(t.name),
      })
    }

    if (td.subTestDiagnoses) {
      for (const subTD of td.subTestDiagnoses) {
        if (subTD.treatments) {
          for (const t of subTD.treatments) {
            addTreatment({
              _id: t._id,
              name: t.name,
              slug: generateSlug(t.name),
            })
          }
        }
      }
    }
    if (td.treatments) {
      for (const t of td.treatments) {
        addTreatment({
          _id: t._id,
          name: t.name,
          slug: generateSlug(t.name),
        })
      }
    }

    const sortedTreatments = sortAlphabetically(allTreatments)
    const treatmentCount = sortedTreatments.length

    const displayTreatments = sortedTreatments.slice(0, 4)
    const remainingCount = Math.max(0, treatmentCount - 4)
    const slug = td.slug || generateSlug(name) || td._id

    const descriptionHtml = extractRichTextHtml(
      td.descriptionHtml || td.description || '',
      true,
      false,
    )

    let description: string
    if (descriptionHtml) {
      description = sanitizeHtml(descriptionHtml)
      const textContent = stripHtmlTags(descriptionHtml)
      if (textContent.length > 150) {
        description = textContent.substring(0, 150).replace(/\s+\S*$/, '') + '...'
      }
    } else {
      description = stripHtmlTags(td.description || '')
      if (description.length > 150) {
        description = description.substring(0, 150).replace(/\s+\S*$/, '') + '...'
      }
    }

    mapped.push({
      _id: td._id,
      name,
      slug,
      testDiagnosisImage: imageUrl || '/placeholder.svg',
      description,
      startingCost: td.startingCost || null,
      treatmentCount,
      displayTreatments,
      remainingCount,
    })
  }

  return sortByName(mapped)
}

// -----------------------------------------------------------------------------
// SINGLE ENTRY POINT
// Produces a fully render-ready payload for the homepage server component.
// -----------------------------------------------------------------------------

export interface PreparedHomepageData {
  /** Pre-transformed hospital/branch locations for PopularHospitals */
  hospitals: NormalizedLocation[]
  /** Pre-transformed doctor cards for DoctorsSection */
  doctors: DoctorCardData[]
  /** Department cards (A–Z sorted, >=3 treatments) */
  departmentCards: DepartmentCardData[]
  /** Search options derived from department cards */
  departmentSearchOptions: SearchOption[]
  /** Technology cards for TechnologiesServices */
  technologies: TechnologyCard[]
  /** Test & Diagnosis cards for TestDiagnosisServices */
  testDiagnoses: TestDiagnosisCard[]
  /** Partner logos with pre-resolved target URLs */
  partnersLogos: PartnerLogoData[]
  treatments: any[]
  lastUpdated: string | null
}

export function prepareHomepageData(
  cmsData: CMSDataResponse,
  technologiesData: any[],
  logosData: any[],
  testDiagnosesData: any[] = [],
): PreparedHomepageData {
  const departments = mapDepartments(cmsData)
  const departmentCards = mapDepartmentsToCards(departments)
  const departmentSearchOptions = buildSearchOptionsFromDepartments(departmentCards)
  const technologies = mapTechnologiesToCards(mapTechnologies(technologiesData))
  const testDiagnoses = mapTestDiagnosesToCards(mapTestDiagnoses(testDiagnosesData))
  const partnersLogos = mapPartnerLogos(logosData, cmsData.hospitals)
  // Strip non-serializable fields (e.g. Set instances used internally for
  // enrichment) so the prepared payload is safe to pass to Client Components
  // and to cache. These fields were never consumed by the homepage UI.
  const doctors = transformDoctorsForHomepage(
    cmsData.hospitals,
    cmsData.doctors,
    (cmsData as any).specialistWithBranch,
  ).map(({ _hospitalNames, _branchNames, ...rest }) => rest)
  const hospitals = transformAllHospitals(cmsData.hospitals)

  console.debug('[prepareHomepageData] counts', {
    rawHospitals: cmsData.hospitals.length,
    rawDoctors: cmsData.doctors.length,
    rawDepartments: departments.length,
    rawTestDiagnoses: testDiagnosesData.length,
    preparedHospitals: hospitals.length,
    preparedDoctors: doctors.length,
    preparedTestDiagnoses: testDiagnoses.length,
    doctorsWithBranchName: doctors.filter((d: any) => d.branchName).length,
    doctorsWithHospitalName: doctors.filter((d: any) => d.hospitalName).length,
  })

  return {
    hospitals,
    doctors,
    departmentCards,
    departmentSearchOptions,
    technologies,
    testDiagnoses,
    partnersLogos,
    treatments: cmsData.treatments || [],
    lastUpdated: (cmsData as any).lastUpdated ?? null,
  }
}

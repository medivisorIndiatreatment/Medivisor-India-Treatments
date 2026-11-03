// app/hospital-branches/[slug]/page.tsx
// Hospital Branch detail page with banner, rich content, and related branches

import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'
import {
  getValue,
  fetchAllBranchesCached,
  fetchAllBranches,
  fetchAllHospitalsCached,
  fetchAllDoctorsCached,
  fetchAllTreatmentsCached,
  fetchSpecialistWithTreatmentsCached,
  fetchSpecialistsByBranchId,
  fetchAllSubDepartmentsCached,
  fetchAllDepartmentsCached,
  stripHtmlTags,
  getDoctorsByBranchId,
  memoryCache,
  createCacheKey,
  getAllCMSData,
} from '@/lib/cms'
import { findBranchBySlug, generateSlug, generateBranchSlug } from '@/lib/slug-utils'
import { getLanguageFromCookie } from '@/lib/googleTranslate'
import { cookies } from 'next/headers'
import { getWixScaledToFillImageUrl } from '@/lib/wixMedia'
import { generateBranchMetadata } from '@/app/metadata'
import BranchDetailClient from './BranchDetailClient'
import type { DoctorData } from '@/lib/cms/types'
import { fetchBranchPageData } from '@/lib/cms/optimized-fetchers'

export const revalidate = 1800
export const dynamicParams = true

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ bid?: string }>
}

// ============================================================================
// IMAGE UTILITY FOR METADATA
// ============================================================================

function getMetaImageUrl(imageVal: any): string {
  if (!imageVal) return ''
  if (typeof imageVal === 'string') {
    if (imageVal.startsWith('http')) return imageVal
    if (imageVal.startsWith('wix:image://')) {
      const scaled = getWixScaledToFillImageUrl(imageVal, 1200, 630)
      return scaled || ''
    }
    if (imageVal.startsWith('/')) return imageVal
    return ''
  }
  if (typeof imageVal === 'object') {
    const url = imageVal.url || imageVal.src || imageVal.image || ''
    if (typeof url === 'string' && url.startsWith('wix:image://')) {
      const scaled = getWixScaledToFillImageUrl(url, 1200, 630)
      return scaled || ''
    }
    return typeof url === 'string' ? url : ''
  }
  return ''
}

function getBranchImageUrl(branch: any, hospital: any): string {
  const skipImages = ['/placeholder.svg', '/placeholder.png', 'placeholder.svg', 'placeholder.png']

  const candidates = [
    branch.branchImageUrl,
    branch.branchImage,
    branch.data?.branchImage,
    branch.image,
    branch.data?.image,
    branch.coverImage,
    branch.data?.coverImage,
    branch.heroImage,
    branch.data?.heroImage,
    branch.mainImage,
    branch.data?.mainImage,
    branch.logoUrl,
    branch.logo,
    branch.data?.logo,
    hospital?.hospitalImage,
    hospital?.hospitalImageUrl,
  ]

  for (const img of candidates) {
    if (!img) continue
    if (typeof img === 'string' && skipImages.includes(img)) continue
    const processed = getMetaImageUrl(img)
    if (processed) return processed
  }

  return ''
}

// ============================================================================
// METADATA GENERATION
// ============================================================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  const cookieStore = await cookies()
  const lang = getLanguageFromCookie(cookieStore.toString())

  let branchName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  let branchDescription = ''
  let branchImage = ''
  let hospitalName = ''

  try {
    const allBranches = await fetchAllBranchesCached()

    for (const branch of allBranches as any[]) {
      if (generateSlug(branch.branchName || branch.name || '') === generateSlug(slug)) {
        branchName = branch.branchName || branch.name || branchName
        hospitalName = (branch as any).hospitalName || ''

        const richContent = (branch as any).descriptionHtml || branch.description || ''
        branchDescription = extractDescription(richContent, branchName)

        branchImage = getBranchImageUrl(branch, null)
        break
      }
    }
  } catch (error) {
    console.error('Error fetching branch for metadata:', error)
  }

  return generateBranchMetadata(
    branchName,
    branchDescription,
    branchImage,
    hospitalName,
    slug,
    lang
  )
}

function extractDescription(richContent: string, branchName: string): string {
  if (!richContent) {
    return `Visit ${branchName} through Medivisor. World-class healthcare at affordable costs. Expert doctors and top hospitals in India.`
  }

  const plainText = stripHtmlTags(richContent)
  const paragraphs = plainText.split(/\n\n|\n/).filter(p => p.trim().length > 0)

  let firstParagraph = paragraphs[1]?.trim() || paragraphs[0]?.trim() || ''

  if (firstParagraph.toLowerCase() === 'skip' ||
      firstParagraph.toLowerCase().includes('skip')) {
    firstParagraph = paragraphs[2]?.trim() || ''
  }

  return truncateDescription(firstParagraph)
}

function truncateDescription(text: string): string {
  if (text.length <= 160) return text

  const truncated = text.substring(0, 160)
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  )

  if (lastSentenceEnd > 100) {
    return text.substring(0, lastSentenceEnd + 1)
  }
  return truncated.replace(/\s+\S*$/, '') + '...'
}

// ============================================================================
// DATA FETCHING UTILITIES
// ============================================================================

function extractAllBranches(hospitals: any[]): any[] {
  return hospitals.flatMap(hospital => {
    const branches = hospital.branches || hospital.data?.branches || []
    return branches.map((branch: any) => ({
      ...branch,
      hospitalId: hospital._id,
      hospitalName: hospital.hospitalName,
      hospitalData: hospital,
    }))
  })
}

function getExpectedBranchSlug(branch: any): string {
  const branchName = branch?.branchName || branch?.name
  if (!branchName) return ''

  if (branch?.slug) {
    return generateSlug(branch.slug)
  }

  const cityData = branch?.city?.[0]
  const cityName = cityData?.cityName || cityData?.name || branch?.cityName
  if (cityName) {
    return generateBranchSlug(branchName, cityName)
  }

  return generateSlug(branchName)
}

// ============================================================================
// TREATMENT IMAGE HELPER
// ============================================================================

function getTreatmentImage(treatment: any): string | null {
  const rawImage = [treatment.treatmentImageUrl, treatment.treatmentImage, treatment.image].find(
    (value) => typeof value === "string" && value.length > 0,
  )
  return rawImage || null
}

// ============================================================================
// TREATMENT FETCHING VIA SPECIALIST
// ============================================================================

async function getTreatmentsViaSpecialist(
  branch: any,
  allTreatments: any[],
  subDeptBranchMap?: Map<string, Set<string>>,
  branchToHospitalMap?: Map<string, string>
): Promise<any[]> {
  const branchTreatments: any[] = []
  const treatmentIdsSet = new Set<string>()
  const treatmentNamesSet = new Set<string>()

  const addTreatment = (
    treatment: any,
    specialistName?: string,
    specialistId?: string,
    departments?: any[]
  ) => {
    if (!treatment) return

    const id = treatment._id || treatment.ID
    let name = getValue(treatment, "name", "treatmentName", "title") || ''

    if (!name && id && allTreatments) {
      const full = allTreatments.find((t: any) => (t._id || t.ID) === id)
      if (full) {
        name = getValue(full, "name", "treatmentName", "title") || ''
      }
    }

    if (!name) return

    const description = typeof treatment.description === "string" ? treatment.description : ""
    const descriptionHtml = typeof treatment.descriptionHtml === "string" ? treatment.descriptionHtml : description

    const departmentNames = (departments || []).map((d: any) => d?.name || d?.departmentName || '').filter(Boolean)
    const departmentIds = (departments || []).map((d: any) => d?._id || d?.ID || '').filter(Boolean)
    const departmentName = departmentNames[0] || null
    const departmentId = departmentIds[0] || null

    if (id && treatmentIdsSet.has(id)) return
    if (name && treatmentNamesSet.has(name.toLowerCase())) return
    if (id) treatmentIdsSet.add(id)
    if (name) treatmentNamesSet.add(name.toLowerCase())

    branchTreatments.push({
      _id: id,
      name,
      description,
      descriptionHtml,
      category: treatment.category || null,
      duration: treatment.duration || null,
      cost: treatment.cost || treatment.minPrice || null,
      minPrice: treatment.minPrice || treatment.cost || null,
      treatmentImage: getTreatmentImage(treatment),
      specialistName: specialistName || treatment.specialistName,
      specialistId: specialistId || treatment.specialistId || null,
      department: departmentName,
      departmentId: departmentId,
      departments: departmentNames.length > 0
        ? departmentNames.map((name: string, i: number) => ({ _id: departmentIds[i] || '', name }))
        : [],
      branchesAvailableAt: [],
    })
  }

  const branchSpecialists = extractSpecialistIds(branch)

  // 1. Include treatments directly linked on the branch
  const branchTreatmentsList = branch?.treatments || branch?.data?.treatments || branch?.treatment || []
  if (Array.isArray(branchTreatmentsList) && branchTreatmentsList.length > 0) {
    branchTreatmentsList.forEach((treatment: any) => addTreatment(treatment))
  }

  // 2. Include treatments from specialists linked to the branch/hospital
  if (branchSpecialists.length > 0 || branch._id || branch.hospitalData?.specialist) {
    const specialistIds = branchSpecialists.map((spec: any) =>
      spec._id || spec.ID || spec
    ).filter(Boolean)

    const hospitalSpecialistIds = (branch.hospitalData?.specialist || branch.hospital?.specialist)
      ?.map((spec: any) => spec._id || spec.ID || spec)
      .filter(Boolean) || []

    const fetchPromises: Promise<void>[] = []

    if (specialistIds.length > 0) {
      fetchPromises.push(
        fetchSpecialistWithTreatmentsCached(specialistIds).then(data => processSpecialistTreatments(data, addTreatment))
      )
    }

    if (branch._id) {
      fetchPromises.push(
        fetchSpecialistsByBranchId(branch._id)
          .then(data => processSpecialistTreatments(data, addTreatment))
          .catch((error) => {
            console.error('Error fetching specialist by branch ID:', error)
          })
      )
    }

    if (hospitalSpecialistIds.length > 0) {
      fetchPromises.push(
        fetchSpecialistWithTreatmentsCached(hospitalSpecialistIds).then(data => processSpecialistTreatments(data, addTreatment))
      )
    }

    await Promise.allSettled(fetchPromises)
  }

  // 3. Include treatments from sub-departments and departments linked to this branch
  if (branch._id) {
    const branchDeptIds = new Set(
      (branch.department || [])
        .map((d: any) => d._id || d.ID || String(d))
        .filter(Boolean)
    )

    for (const treatment of allTreatments) {
      if (!treatment?._id) continue

      let matched = false

      if (subDeptBranchMap) {
        const subDeptRef = treatment.subDepartment_treatment || treatment.subDepartment || treatment.SubDepartment || null
        const subDeptArray = Array.isArray(subDeptRef) ? subDeptRef : subDeptRef ? [subDeptRef] : []

        for (const sd of subDeptArray) {
          const sdId = sd._id || sd.ID || String(sd)
          if (!sdId) continue

          const branchIds = subDeptBranchMap.get(sdId)
          if (branchIds && branchIds.has(branch._id)) {
            addTreatment(treatment)
            matched = true
            break
          }
        }
      }

      if (matched) continue

      const deptRef = treatment.department || treatment.Department || null
      const deptArray = Array.isArray(deptRef) ? deptRef : deptRef ? [deptRef] : []

      for (const dept of deptArray) {
        const deptId = dept._id || dept.ID || String(dept)
        if (!deptId) continue
        if (branchDeptIds.has(deptId)) {
          addTreatment(treatment)
          break
        }
      }

      const branchesAt = treatment.branchesAvailableAt || treatment.branches || treatment.BranchesMaster_treatmentMap || []
      const branchRefs = Array.isArray(branchesAt) ? branchesAt : branchesAt ? [branchesAt] : []
      const branchIdsFromAvail = branchRefs.map((b: any) => b.branchId || b._id || b.ID || String(b)).filter(Boolean)
      if (branchIdsFromAvail.includes(branch._id)) {
        addTreatment(treatment)
      }
    }
  }

  // 4. Include treatments from branchesAvailableAt linked to this hospital (fallback)
  const effectiveHospitalId = branch.hospitalId || branchToHospitalMap?.get(branch._id)
  if (effectiveHospitalId) {
    for (const treatment of allTreatments) {
      if (!treatment?._id) continue
      const branchesAt = treatment.branchesAvailableAt || treatment.branches || treatment.BranchesMaster_treatmentMap || []
      const branchRefs = Array.isArray(branchesAt) ? branchesAt : branchesAt ? [branchesAt] : []
      let matchesHospital = false
      for (const b of branchRefs) {
        const branchId = b.branchId || b._id || b.ID || String(b)
        if (!branchId) continue
        const hospitalId = b.hospitalId || b.hospital?._id || b.hospital?.ID
        if (hospitalId && hospitalId === effectiveHospitalId) {
          matchesHospital = true
          break
        }
        if (branchToHospitalMap && branchToHospitalMap.get(branchId) === effectiveHospitalId) {
          matchesHospital = true
          break
        }
      }
      if (matchesHospital) {
        addTreatment(treatment)
      }
    }
  }

  if (branchTreatments.length === 0) {
    return []
  }

  if (allTreatments.length > 0) {
    const treatmentLookup = new Map<string, any>()
    for (const t of allTreatments) {
      if (t._id) treatmentLookup.set(t._id, t)
      if (t.name) treatmentLookup.set(t.name.toLowerCase(), t)
    }

    return branchTreatments.map(branchTreatment => {
      const fullTreatment = treatmentLookup.get(branchTreatment._id) ||
                            (branchTreatment.name ? treatmentLookup.get(branchTreatment.name.toLowerCase()) : undefined)
      if (!fullTreatment) return branchTreatment
      const fullName = getValue(fullTreatment, "name", "treatmentName", "title") || branchTreatment.name
      return {
        ...branchTreatment,
        name: fullName,
        description: branchTreatment.description || fullTreatment.description,
        descriptionHtml: branchTreatment.descriptionHtml || fullTreatment.descriptionHtml,
        category: branchTreatment.category || fullTreatment.category,
        duration: branchTreatment.duration || fullTreatment.duration,
        cost: branchTreatment.cost || fullTreatment.cost,
        minPrice: branchTreatment.minPrice || fullTreatment.minPrice,
        treatmentImage: getTreatmentImage(branchTreatment) || getTreatmentImage(fullTreatment),
        specialistName: branchTreatment.specialistName || fullTreatment.specialistName,
        specialistId: branchTreatment.specialistId || fullTreatment.specialistId,
        departments: branchTreatment.departments?.length ? branchTreatment.departments : (fullTreatment.departments?.length ? fullTreatment.departments : []),
        branchesAvailableAt: branchTreatment.branchesAvailableAt?.length ? branchTreatment.branchesAvailableAt : (fullTreatment.branchesAvailableAt?.length ? fullTreatment.branchesAvailableAt : []),
      }
    })
  }

  return branchTreatments
}

function extractSpecialistIds(branch: any): any[] {
  const specialists = branch?.specialist || branch?.specialists ||
                      branch?.specialty || branch?.specialities ||
                      branch?.specialization || branch?.hospital?.specialist || []
  if (Array.isArray(specialists)) return specialists
  if (specialists) return [specialists]
  return []
}

function processSpecialistTreatments(
  specialistData: Record<string, any>,
  addTreatment: (treatment: any, specialistName?: string, specialistId?: string, departments?: any[]) => void
): void {
  Object.values(specialistData).forEach((specialist: any) => {
    const specialistId = specialist._id || specialist.ID
    const specialistName = specialist.name || specialist.specialty || ''
    const departments = Array.isArray(specialist.department) ? specialist.department : (specialist.department ? [specialist.department] : [])

    const treatmentsList =
      (specialist.treatments && Array.isArray(specialist.treatments) && specialist.treatments.length > 0)
        ? specialist.treatments
        : specialist.Treatment && Array.isArray(specialist.Treatment) && specialist.Treatment.length > 0
          ? specialist.Treatment
          : specialist.treatment
            ? Array.isArray(specialist.treatment)
              ? specialist.treatment
              : [specialist.treatment]
            : specialist.TreatmentMaster_specialistMap
              ? Array.isArray(specialist.TreatmentMaster_specialistMap)
                ? specialist.TreatmentMaster_specialistMap
                : [specialist.TreatmentMaster_specialistMap]
              : []

    if (treatmentsList.length > 0) {
      treatmentsList.forEach((treatment: any) => {
        addTreatment(treatment, specialistName, specialistId, departments)
      })
    }
  })
}

// ============================================================================
// HOSPITAL FILTERING FOR CAROUSEL
// ============================================================================

function getCityName(city: any): string {
  if (!city) return ''
  if (typeof city === 'string') return city
  if (typeof city === 'object') return city.cityName || city.name || ''
  return ''
}

// ============================================================================
// BRANCH DATA FETCHING
// ============================================================================

async function getBranchData(bid: string | undefined, slug: string) {
  // Use the targeted loader for normal slug requests so the page does not
  // build the full CMS relationship graph before rendering one branch.
  const optimized = await fetchBranchPageData(slug, bid)
  // Keep the legacy relationship enricher as a fallback when the targeted Wix
  // query returns a branch shell without its multi-reference doctors/treatments.
  if (optimized.branch && (optimized.doctors.length > 0 || optimized.treatments.length > 0)) return optimized

  if (!bid) {
    try {
      const cmsData = await getAllCMSData()
      const hospitals = cmsData.hospitals
      const allDoctors = cmsData.doctors
      const allTreatments = cmsData.treatments
      const allDepartments = cmsData.departments
      const allSubDepartments = await fetchAllSubDepartmentsCached()

      const allBranches = extractAllBranches(hospitals)

      const normalizedSlug = generateSlug(slug)
      const slugCacheKey = createCacheKey('branch', 'slug', normalizedSlug)
      let branch = memoryCache.get<any>(slugCacheKey)

      if (!branch) {
        branch = findBranchBySlug(allBranches, slug)
        if (branch) {
          memoryCache.set(slugCacheKey, branch, 5 * 60 * 1000)
        }
      }

      let allRawBranches: any[] = []
      if (!branch) {
        allRawBranches = await fetchAllBranchesCached()
        branch = findBranchBySlug(allRawBranches, slug)
        if (branch) {
          memoryCache.set(slugCacheKey, branch, 5 * 60 * 1000)
          const hospitalId = branch.hospital?._id || branch.hospital?.ID
          if (hospitalId) {
            branch.hospitalId = hospitalId
            if (!branch.hospitalData) {
              const parentHospital = hospitals.find((h: any) => h._id === hospitalId)
              if (parentHospital) {
                branch.hospitalData = parentHospital
              }
            }
          }
        }
      }

      if (branch) {
        const rawBranchesForEnrich = allRawBranches.length > 0 ? allRawBranches : allBranches
        const branchToHospitalMap = new Map<string, string>()
        for (const b of allBranches) {
          if (b._id && b.hospitalId) {
            branchToHospitalMap.set(b._id, b.hospitalId)
          }
        }
        if (!branch.hospitalId && branch.hospitalData?._id) {
          branch.hospitalId = branch.hospitalData._id
        }
        if (!branch.hospitalId && branchToHospitalMap.has(branch._id)) {
          branch.hospitalId = branchToHospitalMap.get(branch._id)
        }
        const { enrichedHospitals, mergedDoctors, mergedTreatments } = await enrichBranchData(
          branch, hospitals, allDoctors, allTreatments, allSubDepartments, rawBranchesForEnrich, branchToHospitalMap
        )

        return {
          branch,
          hospitals: enrichedHospitals,
          treatments: mergedTreatments,
          doctors: mergedDoctors,
          allDoctors,
          departments: allDepartments,
        }
      }

      return { branch: null, hospitals: [], treatments: [], doctors: [], allDoctors: [], departments: [] }
    } catch (error) {
      console.error('[BranchPage] Error finding branch by slug:', error)
      return { branch: null, hospitals: [], treatments: [], doctors: [], allDoctors: [], departments: [] }
    }
  }

  // Fetch by branch ID
  try {
    const cmsData = await getAllCMSData()
    const hospitals = cmsData.hospitals
    const allDoctors = cmsData.doctors
    const allTreatments = cmsData.treatments
    const allDepartments = cmsData.departments
    const allSubDepartments = await fetchAllSubDepartmentsCached()

    const allBranches = extractAllBranches(hospitals)

    const idCacheKey = createCacheKey('branch', 'id', bid)
    let branch = memoryCache.get<any>(idCacheKey)

    if (!branch) {
      branch = allBranches.find((b: any) => b._id === bid)
      if (branch) {
        memoryCache.set(idCacheKey, branch, 5 * 60 * 1000)
      }
    }

    if (branch) {
      const branchToHospitalMap = new Map<string, string>()
      for (const b of allBranches) {
        if (b._id && b.hospitalId) {
          branchToHospitalMap.set(b._id, b.hospitalId)
        }
      }
      if (!branch.hospitalId && branch.hospitalData?._id) {
        branch.hospitalId = branch.hospitalData._id
      }
      if (!branch.hospitalId && branchToHospitalMap.has(branch._id)) {
        branch.hospitalId = branchToHospitalMap.get(branch._id)
      }
      const { enrichedHospitals, mergedDoctors, mergedTreatments } = await enrichBranchData(
        branch, hospitals, allDoctors, allTreatments, allSubDepartments, allBranches, branchToHospitalMap
      )

      return {
        branch,
        hospitals: enrichedHospitals,
        treatments: mergedTreatments,
        doctors: mergedDoctors,
        allDoctors,
        departments: allDepartments,
      }
    }

    return { branch: null, hospitals: [], treatments: [], doctors: [], allDoctors: [], departments: [] }
  } catch (error) {
    console.error('[BranchPage] Error fetching branch data:', error)
    return { branch: null, hospitals: [], treatments: [], doctors: [], allDoctors: [], departments: [] }
  }
}

async function enrichBranchData(
  branch: any,
  hospitals: any[],
  allDoctors: any[],
  allTreatments: any[],
  allSubDepartments: any[],
  allRawBranches?: any[],
  branchToHospitalMap?: Map<string, string>
): Promise<{
  enrichedHospitals: any[]
  mergedDoctors: any[]
  mergedTreatments: any[]
}> {
  const rawBranches = allRawBranches || await fetchAllBranchesCached()

  const branchDataMap = new Map<string, any>()
  for (const b of rawBranches) {
    const bid = b._id || b.ID
    if (bid) branchDataMap.set(bid, b)
  }

  const enrichedHospitals = hospitals.map((hospital: any) => ({
    ...hospital,
    branches: (hospital.branches || []).map((b: any) => {
      const bid = b._id || b.ID
      const rawBranch = branchDataMap.get(bid)
      if (rawBranch) {
        const merged = { ...b }
        if (!merged.city || merged.city.length === 0) merged.city = rawBranch.city || rawBranch.data?.city || []
        if (!merged.specialist || merged.specialist.length === 0) merged.specialist = rawBranch.specialist || rawBranch.specialities || rawBranch.specialization || []
        if (!merged.treatments || merged.treatments.length === 0) merged.treatments = rawBranch.treatments || rawBranch.Treatment || []
        if (!merged.doctors || merged.doctors.length === 0) merged.doctors = rawBranch.doctors || rawBranch.branchDoctors || []
        if (!merged.subDepartment || merged.subDepartment.length === 0) merged.subDepartment = rawBranch.subDepartment || rawBranch.SubDepartment || []
        if (!merged.accreditation || merged.accreditation.length === 0) merged.accreditation = rawBranch.accreditation || rawBranch.Accreditation || []
        if (!merged.specialization || merged.specialization.length === 0) merged.specialization = rawBranch.specialization || rawBranch.specialities || rawBranch.specialty || []
        if (!merged.showHospital && rawBranch.showHospital !== undefined) merged.showHospital = rawBranch.showHospital
        if (!merged.ShowHospital && rawBranch.ShowHospital !== undefined) merged.ShowHospital = rawBranch.ShowHospital
        return merged
      }
      return b
    }),
  }))

  const subDeptBranchMap = buildSubDeptBranchMap(allSubDepartments)
  const branchTreatments = await getTreatmentsViaSpecialist(branch, allTreatments, subDeptBranchMap, branchToHospitalMap)
  const branchDoctors = getDoctorsByBranchId(
    { doctors: allDoctors, hospitals: enrichedHospitals, treatments: [] } as any,
    branch._id
  )

  const branchDoctorRefs = branch.DoctorMaster_hospital || branch['DoctorMaster_hospital'] || []
  const branchDoctorIds = Array.isArray(branchDoctorRefs)
    ? branchDoctorRefs.map((r: any) => r?._id || r?.ID || r).filter(Boolean)
    : [branchDoctorRefs].filter(Boolean)
  const doctorsFromBranchRef = allDoctors.filter((d: any) => branchDoctorIds.includes(d._id))

  const doctorMap = new Map<string, any>()
  branchDoctors.forEach((d: any) => { if (d._id) doctorMap.set(d._id, d) })
  doctorsFromBranchRef.forEach((d: any) => { if (d._id && !doctorMap.has(d._id)) doctorMap.set(d._id, d) })
  const mergedDoctors = Array.from(doctorMap.values())

  const treatmentSet = new Map<string, any>()
  branchTreatments.forEach((t: any) => { if (t._id) treatmentSet.set(t._id, t) })

  const allBranchDoctors = [...branchDoctors, ...doctorsFromBranchRef]
  const treatmentLookup = new Map<string, any>()
  for (const t of allTreatments) {
    if (t._id) treatmentLookup.set(t._id, t)
    if (t.name) treatmentLookup.set(t.name.toLowerCase(), t)
  }

  for (const doc of allBranchDoctors) {
    for (const spec of doc.specialization || []) {
      const treats = spec.treatments || spec.Treatment || spec.treatment || []
      const arr = Array.isArray(treats) ? treats : [treats].filter(Boolean)
      for (const t of arr) {
        const tid = t._id || t.ID || String(t)
        let tname = getValue(t, "treatmentName", "name", "title") || ""

        const full = (tid ? treatmentLookup.get(tid) : undefined) ||
                     (tname ? treatmentLookup.get(tname.toLowerCase()) : undefined)

        if ((!tname || tname === "Unknown Treatment") && full) {
          tname = getValue(full, "name", "treatmentName", "title") || ""
        }

        if (!tname) continue

        const key = tid || tname
        if (!treatmentSet.has(key)) {
          treatmentSet.set(key, {
            _id: tid,
            name: tname,
            description: typeof t.description === "string" ? t.description : (typeof full?.description === "string" ? full.description : ""),
            descriptionHtml: typeof t.descriptionHtml === "string" ? t.descriptionHtml : (typeof t.description === "string" ? t.description : (typeof full?.descriptionHtml === "string" ? full.descriptionHtml : "")),
            category: t.category || full?.category || null,
            duration: t.duration || full?.duration || null,
            cost: t.cost || full?.cost || null,
            minPrice: t.minPrice || full?.minPrice || null,
            treatmentImage: getTreatmentImage(t) || getTreatmentImage(full),
            specialistName: doc.doctorName || null,
            specialistId: doc._id || null,
            department: spec.department?.[0]?.name || null,
            departmentId: spec.department?.[0]?._id || null,
            departments: (spec.department || []).map((d: any) => ({ _id: d._id || '', name: d.name || '' })),
            branchesAvailableAt: [],
          })
        } else {
          const existing = treatmentSet.get(key)!
          const merged = { ...existing }
          if (!merged.specialistName) merged.specialistName = doc.doctorName || null
          if (!merged.specialistId) merged.specialistId = doc._id || null
          if (!merged.department) merged.department = spec.department?.[0]?.name || null
          if (!merged.departmentId) merged.departmentId = spec.department?.[0]?._id || null
          if (!merged.departments?.length) merged.departments = (spec.department || []).map((d: any) => ({ _id: d._id || '', name: d.name || '' }))
          if (!merged.treatmentImage) merged.treatmentImage = getTreatmentImage(t) || getTreatmentImage(full)
          if (!merged.descriptionHtml) merged.descriptionHtml = typeof t.descriptionHtml === "string" ? t.descriptionHtml : (typeof t.description === "string" ? t.description : (typeof full?.descriptionHtml === "string" ? full.descriptionHtml : ""))
          if (!merged.description && typeof t.description === "string") merged.description = t.description
          if (!merged.category) merged.category = t.category || full?.category || null
          if (!merged.duration) merged.duration = t.duration || full?.duration || null
          if (!merged.cost) merged.cost = t.cost || full?.cost || null
          if (!merged.minPrice) merged.minPrice = t.minPrice || full?.minPrice || null
          treatmentSet.set(key, merged)
        }
      }
    }
  }

  const branchHospitalId = branch.hospitalId || branch.hospitalData?._id
  const branchHospital = enrichedHospitals.find((h: any) => h._id === branchHospitalId)
  const hospitalTreatments = branchHospital?.treatments || branchHospital?.data?.treatments || []
  for (const t of hospitalTreatments) {
    const tid = t._id || t.ID || String(t)
    let tname = getValue(t, "name", "treatmentName", "title") || ""

    const full = (tid ? treatmentLookup.get(tid) : undefined) ||
                 (tname ? treatmentLookup.get(tname.toLowerCase()) : undefined)

    if ((!tname || tname === "Unknown Treatment") && full) {
      tname = getValue(full, "name", "treatmentName", "title") || ""
    }

    if (!tname) continue

    const key = tid || tname
    if (!treatmentSet.has(key)) {
      treatmentSet.set(key, {
        _id: tid,
        name: tname,
        description: typeof t.description === "string" ? t.description : (typeof full?.description === "string" ? full.description : ""),
        descriptionHtml: typeof t.descriptionHtml === "string" ? t.descriptionHtml : (typeof t.description === "string" ? t.description : (typeof full?.descriptionHtml === "string" ? full.descriptionHtml : "")),
        category: t.category || full?.category || null,
        duration: t.duration || full?.duration || null,
        cost: t.cost || full?.cost || null,
        minPrice: t.minPrice || full?.minPrice || null,
        treatmentImage: getTreatmentImage(t) || getTreatmentImage(full),
        branchesAvailableAt: [],
      })
    } else {
      const existing = treatmentSet.get(key)!
      const merged = { ...existing }
      if (!merged.treatmentImage) merged.treatmentImage = getTreatmentImage(t) || getTreatmentImage(full)
      if (!merged.descriptionHtml) merged.descriptionHtml = typeof t.descriptionHtml === "string" ? t.descriptionHtml : (typeof t.description === "string" ? t.description : (typeof full?.descriptionHtml === "string" ? full.descriptionHtml : ""))
      if (!merged.description && typeof t.description === "string") merged.description = t.description
      if (!merged.category) merged.category = t.category || full?.category || null
      if (!merged.duration) merged.duration = t.duration || full?.duration || null
      if (!merged.cost) merged.cost = t.cost || full?.cost || null
      if (!merged.minPrice) merged.minPrice = t.minPrice || full?.minPrice || null
      treatmentSet.set(key, merged)
    }
  }

  const mergedTreatments = Array.from(treatmentSet.values())

  return { enrichedHospitals, mergedDoctors, mergedTreatments }
}

function buildSubDeptBranchMap(subDepartments: any[]): Map<string, Set<string>> {
  const subDeptBranchMap = new Map<string, Set<string>>()

  for (const subDept of subDepartments) {
    const subDeptId = subDept._id || subDept.ID
    if (!subDeptId) continue

    const branchRefs = subDept.BranchesMaster_subDepartment
      || subDept.branchesMasterSubDepartment
      || subDept.branches
      || subDept.branch
      || []
    const branchIds = Array.isArray(branchRefs)
      ? branchRefs.map((b: any) => b?._id || b?.ID || b).filter(Boolean)
      : [branchRefs].filter(Boolean)

    for (const bid of branchIds) {
      if (!subDeptBranchMap.has(subDeptId)) {
        subDeptBranchMap.set(subDeptId, new Set())
      }
      subDeptBranchMap.get(subDeptId)!.add(bid)
    }
  }

  return subDeptBranchMap
}

// ============================================================================
// STATIC PARAMS FOR SSG
// ============================================================================

export async function generateStaticParams() {
  try {
    const allBranches = await fetchAllBranches(true)

    return allBranches
      .filter((branch: any) => {
        const name = branch.branchName || branch.name
        if (!name) return false
        return true
      })
      .map((branch: any) => {
        const name = branch.branchName || branch.name || ''
        const cityData = branch.city?.[0]
        const cityName = cityData?.cityName || cityData?.name || branch.cityName

        if (branch.slug) {
          return { slug: generateSlug(branch.slug) }
        }

        if (cityName) {
          return { slug: generateBranchSlug(name, cityName) }
        }

        return { slug: generateSlug(name) }
      })
  } catch (error) {
    console.error('Error generating static params for branches:', error)
    return []
  }
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function BranchPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { bid } = await searchParams

  const { branch: fullBranch, hospitals, treatments: branchTreatments, doctors: branchDoctors, allDoctors, departments } =
    await getBranchData(bid, slug)

  if (fullBranch) {
    const expectedSlug = getExpectedBranchSlug(fullBranch)
    const normalizedCurrentSlug = generateSlug(slug)
    const normalizedExpectedSlug = generateSlug(expectedSlug)

    if (normalizedCurrentSlug !== normalizedExpectedSlug) {
      redirect(`/hospital-branches/${expectedSlug}`)
    }
  }

  if (!fullBranch) {
    console.warn(`[BranchPage] No branch found for slug: ${slug}`)
    notFound()
  }

  return (
    <BranchDetailClient
      branch={fullBranch}
      hospitals={hospitals}
      slug={slug}
      treatments={branchTreatments || []}
      doctors={branchDoctors}
      allDoctors={allDoctors}
      departments={departments || []}
    />
  )
}

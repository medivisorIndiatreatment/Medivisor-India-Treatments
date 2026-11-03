// lib/services/homepage/transformers.ts
// Data transformation utilities for homepage data
// Combined: original mappers + new shared hospital/doctor transformers

import {
  getWixImageUrl,
  getWixScaledToFillImageUrl,
} from '@/lib/wixMedia'
import { getImageUrl } from '@/lib/utils/cms'
import { generateSlug } from '@/lib/slug-utils';
import type {
  HospitalData,
  TreatmentData,
  DoctorData,
  DepartmentData,
  TechnologyData,
  TestDiagnosisData,
} from '@/lib/cms/types'
import type { PartnerLogoData } from './types'
// New utilities and types
import {
  resolveBranchImage,
  extractPrimarySpecialty,
  extractCityInfo,
  extractNumeric,
  checkPopular,
  shouldShowHospital,
  generateBranchSlug,
} from './utils'
import type { BranchCardData, DoctorCardData, DoctorBranchInfo } from '@/components/cards/types'

/**
 * Extracts string value from potential rich text object
 */
export function extractString(value: unknown): string {
  if (!value) return ""
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)

  // Handle rich text objects like {nodes, documentStyle}
  if (typeof value === "object" && value !== null) {
    const obj = value as { nodes?: unknown[]; documentStyle?: unknown }
    if (obj.nodes && Array.isArray(obj.nodes)) {
      const nodes = obj.nodes as Array<{
        type?: string
        nodes?: Array<{ textData?: { text?: string }; text?: string }>
        textData?: { text?: string }
        text?: string
      }>
      try {
        // Try to extract from nested paragraph nodes (standard Wix ricos format)
        let result = nodes
          .filter((node) => node.type === "PARAGRAPH" && node.nodes)
          .map((node) =>
            node.nodes
              ?.map((n: any) => n.textData?.text || n.text || "")
              .join("") ?? ""
          )
          .join("\n")

        // If empty, try extracting from any node type that has text content
        if (!result) {
          result = nodes
            .map((node: any) => {
              const childText = node.nodes
                ? node.nodes
                    .map((n: any) => n.textData?.text || n.text || "")
                    .join("")
                : ""
              return node.textData?.text || node.text || childText
            })
            .filter((t) => t)
            .join("\n")
        }

        if (result) return result
      } catch {
        // fall through
      }
    }

    // Handle object with direct text property (e.g., { text: "..." } or { en: "..." })
    const objAny = value as Record<string, unknown>
    for (const key of Object.keys(objAny)) {
      const v = objAny[key]
      if (typeof v === "string" && v) return v
      if (typeof v === "number") return String(v)
    }
  }
  return String(value)
}

/**
 * Maps technologies data to standardized format
 */
export function mapTechnologies(technologiesData: any[]): TechnologyData[] {
  return (technologiesData || []).map((tech: any) => {
    let imageUrl = tech.image || tech.Image || null
    if (imageUrl) {
      const scaledUrl = getWixScaledToFillImageUrl(imageUrl, 800, 600)
      if (scaledUrl) imageUrl = scaledUrl
      else imageUrl = getWixImageUrl(imageUrl) || imageUrl
    }
    
    const heading = extractString(tech.Heading || tech.heading)
    const subHeading = extractString(tech['Sub Heading'] || tech.subHeading)
    const description = extractString(tech.Description || tech.description)
    
    return {
      _id: tech._id || tech.ID || "",
      heading,
      subHeading,
      description,
      image: imageUrl || "/placeholder.svg",
      slug: generateSlug(heading),
    }
  })
}

/**
 * Maps test diagnoses data to standardized format
 */
export function mapTestDiagnoses(testDiagnosesData: any[]): TestDiagnosisData[] {
  return (testDiagnosesData || []).map((td: any) => {
    let imageUrl = td.Image || td.image || td.testDiagnosisImage || null
    if (imageUrl) {
      const scaledUrl = getWixScaledToFillImageUrl(imageUrl, 800, 600)
      if (scaledUrl) imageUrl = scaledUrl
      else imageUrl = getWixImageUrl(imageUrl) || imageUrl
    }

    const name = extractString(
      td.name ||
        td.Name ||
        td.testDiagnosisName ||
        td.TestDiagnosisName ||
        td.testDiagnosis ||
        td.TestDiagnosis ||
        td.title ||
        td.Title ||
        td["Test Diagnosis Name"] ||
        td["test diagnosis name"] ||
        td.diagnosisName ||
        td.testName ||
        "",
    )

    const description = extractString(
      td.Description ||
        td.description ||
        td.about ||
        td.About ||
        td.AboutTestDiagnosis ||
        "",
    )

    const descriptionHtml =
      td.DescriptionHtml ||
      td.descriptionHtml ||
      td.aboutHtml ||
      td.AboutHtml ||
      null

    const richContent = td.RichContent || td.richContent || null

    const department = Array.isArray(td.department)
      ? td.department.map((d: any) => ({
          _id: d._id || d.ID || "",
          name: extractString(d.name || d.department || d.Department),
        }))
      : []

    const status = extractString(td.Status || td.status)

    const seoTitle = extractString(td.SeoTitle || td.seoTitle)
    const seoDescription = extractString(td.SeoDescription || td.seoDescription)

    const subTestDiagnoses: any[] = []
    const rawSubTestDiagnoses =
      td.subTestDiagnoses ||
      td.subTestDiagnosis_departmentMap ||
      []
    if (Array.isArray(rawSubTestDiagnoses)) {
      for (const subTD of rawSubTestDiagnoses) {
        const subTDName = extractString(
          subTD.name ||
            subTD.subTestDiagnosisName ||
            subTD.subTestDiagnosis ||
            subTD.SubTestDiagnosis,
        )
        if (!subTDName) continue

        const treatments: any[] = []
        const rawTreatments = subTD.treatment || subTD.Treatment || []
        if (Array.isArray(rawTreatments)) {
          for (const t of rawTreatments) {
            const treatId = t._id || t.ID || ""
            const treatName = extractString(
              t.name || t.treatmentName || t.treatment || t.Treatment,
            )
            if (!treatId && !treatName) continue
            treatments.push({
              _id: treatId,
              name: treatName,
              treatmentImage: t.treatmentImage || t.image || null,
              cost: t.cost || null,
              popular: t.popular === true,
              description: extractString(t.description) || null,
            })
          }
        }

        subTestDiagnoses.push({
          _id: subTD._id || subTD.ID || "",
          name: subTDName,
          treatments,
        })
      }
    }

    const treatments: any[] = []
    const rawTreatments = td.treatments || []
    if (Array.isArray(rawTreatments)) {
      for (const t of rawTreatments) {
        const treatId = t._id || t.ID || ""
        const treatName = extractString(
          t.name || t.treatmentName || t.treatment || t.Treatment,
        )
        if (!treatId && !treatName) continue
        treatments.push({
          _id: treatId,
          name: treatName,
          treatmentImage: t.treatmentImage || t.image || null,
          cost: t.cost || null,
          popular: t.popular === true,
          description: extractString(t.description) || null,
        })
      }
    }

    return {
      _id: td._id || td.ID || "",
      name,
      slug: generateSlug(name),
      testDiagnosisImage: imageUrl || null,
      subTestDiagnoses,
      treatments,
      totalTreatments: treatments.length,
      description,
      descriptionHtml,
      richContent,
      department: department.length > 0 ? department : null,
      status: status || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      createdDate: td["Created Date"] || td["Created date"] || td.createdDate || null,
      updatedDate: td["Updated Date"] || td["Updated date"] || td.updatedDate || null,
      startingCost: td["Starting Cost"] || td.startingCost || td.cost || null,
      owner: td.Owner || td.owner || null,
    }
  })
}

/**
 * Gets partner target URL based on hospital matching
 */
export function getPartnerTargetUrl(
  logo: any, 
  hospitals: HospitalData[]
): string | undefined {
  const name1 = logo.title || logo['Logo Title'] || ''
  const name2 = logo.logoTitle || logo.LogoTitle || logo['Logo Title'] || ''
  const candidateNames = [name1, name2].map(n => n.trim()).filter(Boolean)

  for (const name of candidateNames) {
    if (!name) continue
    const lowerName = name.toLowerCase()

    const matches = hospitals.filter((h: HospitalData) =>
      h.hospitalName && h.hospitalName.toLowerCase() === lowerName
    )

    if (matches.length > 0) {
      const matchedHospital = matches[0]
      const slug = matchedHospital.slug || generateSlug(matchedHospital.hospitalName)
      const isStandalone = matchedHospital.isStandalone === true
      const hasBranches = Array.isArray(matchedHospital.branches) && matchedHospital.branches.length > 0

      if (isStandalone) {
        return `/hospital-branches/${slug}`
      }

      if (hasBranches) {
        return `/hospital-groups/${slug}`
      }

      return `/hospital-branches/${slug}`
    }

    for (const hospital of hospitals) {
      if (hospital.isStandalone === true) continue
      const branchMatch = (hospital.branches || []).find((b: any) =>
        b.branchName && b.branchName.toLowerCase() === lowerName
      )
      if (branchMatch) {
        const slug = hospital.slug || generateSlug(hospital.hospitalName)
        return `/hospital-groups/${slug}`
      }
    }

    for (const hospital of hospitals) {
      if (hospital.isStandalone !== true) continue
      const branchMatch = (hospital.branches || []).find((b: any) =>
        b.branchName && b.branchName.toLowerCase() === lowerName
      )
      if (branchMatch) {
        const slug = hospital.slug || generateSlug(hospital.hospitalName)
        return `/hospital-branches/${slug}`
      }
    }
  }
  return undefined
}

/**
 * Gets logo URL from logo data with Wix conversion
 */
function getLogoUrl(logoValue: string | undefined): string {
  if (!logoValue) return ''
  if (logoValue.startsWith('wix:image://')) {
    return getWixScaledToFillImageUrl(logoValue, 400, 200) || getWixImageUrl(logoValue) || ''
  }
  if (logoValue.startsWith('http://') || logoValue.startsWith('https://')) {
    return logoValue
  }
  return ''
}

/**
 * Maps partner logos data to standardized format
 */
export function mapPartnerLogos(
  logosData: any[], 
  hospitals: HospitalData[]
): PartnerLogoData[] {
  return logosData.map((logo: any) => {
    // Try multiple possible field names for logo image in Wix collection
    const logoImage = logo.Logo || logo.logo || logo.image || logo.Image || ''
    const logoTitle = logo.logoTitle || logo.LogoTitle || logo['Logo Title'] || logo.title || ''
    
    return {
      _id: logo._id,
      title: logo.title || logo['Logo Title'] || logo.logoTitle || '',
      logoTitle: logoTitle,
      Logo: logoImage,
      logoUrl: getLogoUrl(logoImage),
      targetUrl: getPartnerTargetUrl(logo, hospitals),
    }
  })
}

/**
 * Gets image URL for a department with fallback to first treatment image
 */
function getDepartmentImage(dept: any): string | null {
  let imageUrl = null
  
  // Check departmentImage field first (prioritize resolved URLs)
  if (dept.departmentImage) {
    // Handle object with url property (from Wix include expansion)
    if (typeof dept.departmentImage === 'object' && dept.departmentImage !== null) {
      const imgObj = dept.departmentImage
      if (typeof imgObj.url === 'string') {
        if (imgObj.url.startsWith('http://') || imgObj.url.startsWith('https://')) {
          imageUrl = imgObj.url
        } else {
          imageUrl = getWixImageUrl(imgObj.url) || getImageUrl(dept.departmentImage)
        }
      }
    } else if (typeof dept.departmentImage === 'string') {
      // Already a resolved HTTPS URL - return directly
      if (dept.departmentImage.startsWith('http://') || dept.departmentImage.startsWith('https://')) {
        imageUrl = dept.departmentImage
      } else {
        imageUrl = getWixImageUrl(dept.departmentImage)
      }
    }
  }
  
  // Fallback to 'image' field (Department Master CSV field)
  if (!imageUrl && dept.image) {
    // Handle object with url property (from Wix include expansion)
    if (typeof dept.image === 'object' && dept.image !== null) {
      const imgObj = dept.image
      if (typeof imgObj.url === 'string') {
        if (imgObj.url.startsWith('http://') || imgObj.url.startsWith('https://')) {
          imageUrl = imgObj.url
        } else {
          imageUrl = getWixImageUrl(imgObj.url) || getImageUrl(dept.image)
        }
      }
    } else if (typeof dept.image === 'string') {
      // Already a resolved HTTPS URL - return directly
      if (dept.image.startsWith('http://') || dept.image.startsWith('https://')) {
        imageUrl = dept.image
      } else {
        imageUrl = getWixImageUrl(dept.image)
      }
    }
  }
  
  // Fallback to first treatment image
  if (!imageUrl && dept.treatments?.[0]?.treatmentImage) {
    const tImg = dept.treatments[0].treatmentImage
    if (typeof tImg === 'object' && tImg !== null && typeof tImg.url === 'string') {
      if (tImg.url.startsWith('http://') || tImg.url.startsWith('https://')) {
        imageUrl = tImg.url
      } else {
        imageUrl = getWixImageUrl(tImg.url) || getImageUrl(tImg)
      }
    } else if (typeof tImg === 'string') {
      if (tImg.startsWith('http://') || tImg.startsWith('https://')) {
        imageUrl = tImg
      } else {
        imageUrl = getWixImageUrl(tImg)
      }
    }
  }
  
  return imageUrl
}

/**
 * Maps a sub-department to standardized format
 */
function mapSubDepartment(sd: any) {
  return {
    _id: sd._id,
    name: sd.name,
    treatments: sd.treatments?.map((t: any) => ({
      _id: t._id,
      name: t.name,
      treatmentImage: t.treatmentImage,
      cost: t.cost,
      popular: t.popular,
    })),
  }
}

/**
 * Maps a department treatment to standardized format
 */
function mapDepartmentTreatment(t: any) {
  return {
    _id: t._id,
    name: t.name,
    treatmentImage: t.treatmentImage,
    cost: t.cost,
    popular: t.popular,
  }
}

/**
 * Maps departments data to standardized format
 */
export function mapDepartments(cmsData: any): DepartmentData[] {
  const departments = (cmsData.departments || [])
    .map((dept: any) => {
      const imageUrl = getDepartmentImage(dept)
      
      const mappedSubDepartments = dept.subDepartments?.map(mapSubDepartment)
      const mappedTreatments = dept.treatments?.map(mapDepartmentTreatment)
      
      // Calculate total treatments from both direct treatments and sub-department treatments
      const directTreatmentCount = mappedTreatments?.length || 0
      const subDeptTreatmentCount = (mappedSubDepartments || []).reduce(
        (sum: number, sd: any) => sum + (sd.treatments?.length || 0),
        0
      )
      const totalTreatments = dept.totalTreatments || directTreatmentCount + subDeptTreatmentCount
      
      // Extract name from various possible fields (name, title, departmentName)
      const deptName = dept.name || dept.title || dept.departmentName || ''
      // Generate slug: use existing slug if available, otherwise generate from name
      const slug = dept.slug || generateSlug(deptName)
      
      return {
        _id: dept._id,
        name: deptName,
        slug: slug,
        departmentImage: imageUrl,
        subDepartments: mappedSubDepartments,
        treatments: mappedTreatments,
        totalTreatments,
      }
    })
    .sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }))
  
  return departments
}

// =============================================================================
// NEW HOSPITAL/BRANCH NORMALIZATION (consolidated from DoctorSection & BranchDoctorsSection)
// =============================================================================

const hospitalNameLookup = new Map<string, any>()
const hospitalLookupCache = new Map<string, any>()
const branchToHospitalMapCache = new Map<string, { hospitalId: string; hospitalName: string; isStandalone: boolean; branchName: string }>()

/**
 * Transform doctors for homepage with optimized single-pass lookup
 * Avoids duplicate processing by using pre-built maps from getAllCMSData
 */
export function transformDoctorsForHomepage(
  hospitals: any[],
  cmsDoctors: any[],
  specialists: any[] = []
): any[] {
  const doctorsMap = new Map<string, any>()

  // Build a reverse lookup: doctorId -> specialization names from specialists
  const doctorSpecNames = new Map<string, Set<string>>()
  if (Array.isArray(specialists)) {
    for (const spec of specialists) {
      const specName = spec.name || ''
      if (!specName) continue
      const docRefs = spec.doctor || []
      const docArray = Array.isArray(docRefs) ? docRefs : [docRefs]
      for (const doc of docArray) {
        const docId = doc?._id || doc?.id || doc?.ID
        if (!docId) continue
        if (!doctorSpecNames.has(docId)) doctorSpecNames.set(docId, new Set())
        doctorSpecNames.get(docId)!.add(specName)
      }
    }
  }
  
  // Build hospital lookup maps once
  for (const h of hospitals) {
    if (h._id) hospitalLookupCache.set(h._id, h)
    if (h.hospitalName) hospitalNameLookup.set(h.hospitalName.trim().toLowerCase(), h)
    if (h.name && h.name !== h.hospitalName) hospitalNameLookup.set(h.name.trim().toLowerCase(), h)
    if (Array.isArray(h.branches) && h.branches.length) {
      for (const b of h.branches) {
        const branch = b as any
        if (b._id) {
          branchToHospitalMapCache.set(b._id, {
            hospitalId: h._id,
            hospitalName: h.hospitalName,
            isStandalone: h.isStandalone === true,
            branchName: (branch as { branchName?: string }).branchName || '',
          })
        }
        if ((branch.ID || branch.id) && !branchToHospitalMapCache.has(branch.ID || branch.id)) {
          const bid = branch.ID || branch.id
          branchToHospitalMapCache.set(bid, {
            hospitalId: h._id,
            hospitalName: h.hospitalName,
            isStandalone: h.isStandalone === true,
            branchName: (branch as { branchName?: string }).branchName || '',
          })
        }
      }
    }
  }

  // Extract enriched doctors with hospital/branch data - single pass
  for (const hospital of hospitals) {
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
  }

      // Also merge specialization names from specialists when a doctor's own
      // specialization array is empty or does not contain the specialist name.
      for (const [docId, existing] of doctorsMap) {
        const names = doctorSpecNames.get(docId)
        if (!names?.size) continue
        const currentSpecialization: any[] = Array.isArray(existing.specialization) ? existing.specialization.filter(Boolean) : []
        const currentNames = new Set(currentSpecialization.map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean))
        for (const name of names) {
          if (!currentNames.has(name)) {
            currentSpecialization.push({ _id: name, name })
            currentNames.add(name)
          }
        }
        doctorsMap.set(docId, { ...existing, specialization: currentSpecialization })
      }

       // Also merge specialization names from specialists for CMS doctors that may already exist from hospital/branch raw data
       for (const doc of cmsDoctors || []) {
         if (!doc._id) continue
         const names = doctorSpecNames.get(doc._id)
         const mappedSpecialization = Array.isArray(doc.specialization)
           ? doc.specialization.filter((s: any) => s && (typeof s === 'string' || typeof s.name === 'string'))
           : []
         if (!doctorsMap.has(doc._id)) {
           const specialization = mappedSpecialization.length
             ? mappedSpecialization
             : (names?.size
                 ? Array.from(names).map((name) => ({ _id: name, name }))
                 : [])
           doctorsMap.set(doc._id, {
             ...doc,
             specialization,
             // Preserve the branch/hospital enrichment already computed by
             // getAllCMSData() (inverse doctor→branch mapping) instead of
             // wiping it. Doctors linked only through that mapping would
             // otherwise lose their branch and render an empty location.
             hospitalName: doc.hospitalName || '',
             branchName: doc.branchName || '',
             hospitalId: doc.hospitalId || '',
             branchId: doc.branchId || '',
             city: doc.city || [],
             branchInfo: doc.branchInfo || [],
             _hospitalNames: doc._hospitalNames,
             _branchNames: doc._branchNames,
           })
         } else {
           const existing = doctorsMap.get(doc._id)!
           const currentSpecialization: any[] = Array.isArray(existing.specialization)
             ? existing.specialization.filter((s: any) => s && (typeof s === 'string' || typeof s.name === 'string'))
             : []
           if (!currentSpecialization.length && mappedSpecialization.length) {
             doctorsMap.set(doc._id, { ...existing, specialization: mappedSpecialization })
           }
           // Backfill missing branch/hospital info from the enriched CMS doctor
           // record. The hospital/branch traversal above may have added the
           // doctor with empty branchName (e.g. top-level hospital doctors),
           // so we supplement with the inverse mapping data here.
           const existingHospitalName = existing.hospitalName || ''
           const existingBranchName = existing.branchName || ''
           const existingHospitalId = existing.hospitalId || ''
           const existingBranchId = existing.branchId || ''
           const updated = {
             ...existing,
             hospitalName: existingHospitalName || doc.hospitalName || '',
             hospitalId: existingHospitalId || doc.hospitalId || '',
             branchName: existingBranchName || doc.branchName || '',
             branchId: existingBranchId || doc.branchId || '',
             branchInfo: (existing.branchInfo && existing.branchInfo.length > 0)
               ? existing.branchInfo
               : (doc.branchInfo && doc.branchInfo.length > 0)
                 ? doc.branchInfo
                 : existing.branchInfo || [],
           }
           if (
             updated.hospitalName !== existingHospitalName ||
             updated.branchName !== existingBranchName ||
             updated.branchId !== existingBranchId ||
             updated.branchInfo !== existing.branchInfo
           ) {
             doctorsMap.set(doc._id, updated)
           }
           // Backfill missing city from the enriched CMS doctor record so the
           // homepage card shows the same location data as the doctor detail page
           // (the hospital/branch traversal above may not carry a city).
           const existingCity = existing.city
           const hasCity = Array.isArray(existingCity)
             ? existingCity.length > 0
             : Boolean(existingCity)
           if (!hasCity && doc.city) {
             doctorsMap.set(doc._id, { ...doctorsMap.get(doc._id)!, city: doc.city })
           }
         }
       }
   // Build final list with lightweight doctor data - single map pass

    
    return Array.from(doctorsMap.values()).map((doc: any, i: number) => {
    const imageUrl = doc.profileImageUrl || (doc.profileImage ? getWixImageUrl(doc.profileImage) || doc.profileImage : null) || null
    
    const specializations = Array.isArray(doc.specialization)
      ? doc.specialization.map((s: any) => typeof s === 'string' ? s : (s && typeof s.name === 'string' ? s.name : '')).filter(Boolean)
      : []
    
    let experience = null
    if (doc.experienceYears) {
      const parsed = parseInt(String(doc.experienceYears), 10)
      if (!isNaN(parsed)) experience = parsed
    }
    
    const cityName = Array.isArray(doc.city)
      ? doc.city.find((c: any) => c?.cityName || c?.name)?.cityName || doc.city.find((c: any) => c?.name)?.name || ''
      : typeof doc.city === 'string' ? doc.city : ''
    
    const doctorSlug = doc.slug || (doc.doctorName ? generateBranchSlug(doc.doctorName) : '')
    
    return {
      _id: doc._id,
      doctorName: doc.doctorName || '',
      doctorSlug,
      profileImage: imageUrl || "/placeholder.svg",
      specialization: specializations,
      experienceYears: experience,
      qualification: doc.qualification || null,
      designation: doc.designation || null,
      hospitalName: doc.hospitalName || '',
      hospitalId: doc.hospitalId || '',
      branchName: doc.branchName || '',
      branchId: doc.branchId || '',
      city: cityName,
      popular: doc.popular === true,
      slug: doctorSlug,
      branchInfo: doc.branchInfo || [],
      _hospitalNames: doc._hospitalNames,
      _branchNames: doc._branchNames,
    }
  })
}

/**
 * Normalized branch/hospital data structure used across homepage components
 */
/**
 * NormalizedLocation represents a canonical, normalized form for hospital/branch
 * data used across all homepage components. It standardizes field names, ensures
 * slug availability, and provides computed fields like `stats` and `location`.
 *
 * Use this interface when passing hospital/branch data between homepage sections
 * to maintain consistency and avoid ad-hoc transformations at render time.
 */
export interface NormalizedLocation {
  _id: string
  name: string // hospitalName or branchName
  slug: string
  image: string
  branchId: string
  address?: string | null
  city?: any[]
  location?: string
  yearEstablished?: number | null
  totalBeds?: number | null
  noOfDoctors?: number | null
  specialty?: string
  specialization?: any[]
  specialities?: any[]
  logo?: string | null
  accreditation?: { _id?: string; image?: string; title?: string; logo?: string }[]
  popular?: boolean
  hospitalName?: string
  hospitalId?: string
  hospitalSlug?: string
  isStandalone?: boolean
  hospitalLinkType?: 'hospital-groups' | 'hospital-branches'
  department?: any[]
  [key: string]: any
}

/**
 * Transform a branch (with optional parent hospital) into normalized location data
 * Used by PopularHospitals and HospitalBranchesCarousel
 */
export function transformBranch(
  branch: any,
  hospital?: any,
  options: { includeRaw?: boolean; computeSlug?: boolean } = {}
): NormalizedLocation {
  const imageUrl = resolveBranchImage(branch, hospital)
  const { cityName, state: location } = extractCityInfo(branch)
  const firstSpecialty = extractPrimarySpecialty(branch, 'Multi Specialty')

  const yearEstablished = extractNumeric(
    branch.yearEstablished || branch.data?.yearEstablished || hospital?.yearEstablished
  )
  const totalBeds = extractNumeric(
    branch.totalBeds || branch.data?.totalBeds || hospital?.totalBeds
  )
  const noOfDoctors = extractNumeric(
    branch.noOfDoctors || branch.data?.noOfDoctors || hospital?.noOfDoctors
  )
  const isPopular = checkPopular(branch, hospital)

  const branchName = branch.branchName || hospital?.hospitalName || 'Hospital'
  const hospitalName = hospital?.hospitalName || ''
  const hospitalId = hospital?._id || branch.hospitalId || ''
  const isStandalone = hospital?.isStandalone === true
  const hasBranches = hospital?.branches?.length > 0
  const hospitalLinkType = isStandalone
    ? 'hospital-branches'
    : hasBranches
      ? 'hospital-groups'
      : 'hospital-branches'

  let hospitalSlug: string
  if (options.computeSlug) {
    hospitalSlug = generateBranchSlug(branchName, cityName)
  } else if (hospital?.hospitalSlug) {
    hospitalSlug = hospital.hospitalSlug
  } else {
    hospitalSlug = generateBranchSlug(branchName, cityName)
  }

  const logo = branch.logoUrl || branch.logo || branch.data?.logo || hospital?.logo || null

  const normalized: NormalizedLocation = {
    _id: branch._id ?? branch.id ?? branch.ID ?? '',
    name: branchName,
    slug: hospitalSlug,
    image: imageUrl,
    branchId: branch._id ?? branch.id ?? branch.ID ?? '',
    address: branch.address || branch.data?.address || null,
    city: branch.city || branch.data?.city || [],
    location,
    yearEstablished,
    totalBeds,
    noOfDoctors,
    specialty: firstSpecialty,
    specialization:
      branch.specialization ||
      branch.specialist ||
      branch.specialty ||
      branch.specialities ||
      branch.data?.specialization ||
      branch.data?.specialist ||
      branch.data?.specialty ||
      branch.data?.specialities ||
      [],
    specialities:
      branch.specialization ||
      branch.specialist ||
      branch.specialty ||
      branch.specialities ||
      branch.data?.specialization ||
      branch.data?.specialist ||
      branch.data?.specialty ||
      branch.data?.specialities ||
      [],
    logo,
    accreditation: branch.accreditation || branch.data?.accreditation || [],
    popular: isPopular,
    hospitalName,
    hospitalId,
    hospitalSlug,
    isStandalone,
    hospitalLinkType,
    department: branch.department || branch.data?.department || [],
  }

  if (options.includeRaw) {
    Object.assign(normalized, branch)
  }

  return normalized
}

/**
 * Transform a standalone hospital (no branches) into normalized location data
 */
export function transformStandaloneHospital(
  hospital: any,
  options: { includeRaw?: boolean; computeSlug?: boolean } = {}
): NormalizedLocation {
  const imageUrl = resolveBranchImage({}, hospital)
  const firstSpecialty = extractPrimarySpecialty(hospital, 'Multi Specialty')
  const yearEstablished = extractNumeric(hospital.yearEstablished)
  const totalBeds = extractNumeric(hospital.totalBeds)
  const noOfDoctors = extractNumeric(hospital.noOfDoctors)
  const isPopular = hospital.popular === true

  const hospitalName = hospital.hospitalName || 'Hospital'
  const hospitalSlug = options.computeSlug
    ? generateBranchSlug(hospitalName)
    : (hospital.hospitalSlug || generateBranchSlug(hospitalName))

  return {
    _id: hospital._id ?? '',
    name: hospitalName,
    slug: hospitalSlug,
    image: imageUrl,
    branchId: hospital._id ?? '',
    address: hospital.address || null,
    city: hospital.city || [],
    location: hospital.location || '',
    yearEstablished,
    totalBeds,
    noOfDoctors,
    specialty: firstSpecialty,
    specialization: hospital.specialty || hospital.specialization || hospital.specialist || [],
    specialities: hospital.specialty || hospital.specialization || hospital.specialist || [],
    logo: hospital.logo || null,
    accreditation: hospital.accreditation || [],
    popular: isPopular,
    hospitalName,
    hospitalId: hospital._id ?? '',
    hospitalSlug,
    isStandalone: true,
    hospitalLinkType: 'hospital-branches',
    ...(options.includeRaw ? hospital : {}),
  }
}

/**
 * Process all hospitals from server data: expand branches + standalone hospitals
 * Returns a flat array of normalized locations
 * Only includes branches/hospitals where showHospital is true
 */
export function transformAllHospitals(serverHospitals: any[]): NormalizedLocation[] {
  const allLocations: NormalizedLocation[] = []

  serverHospitals.forEach((hospital) => {
    if (hospital.branches && Array.isArray(hospital.branches)) {
      hospital.branches.forEach((branch: any) => {
        if (shouldShowHospital(branch)) {
          allLocations.push(transformBranch(branch, hospital, { computeSlug: true }))
        }
      })
    } else {
      if (shouldShowHospital(hospital)) {
        allLocations.push(transformStandaloneHospital(hospital, { computeSlug: true }))
      }
    }
  })

  return allLocations.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
}

/**
 * Deduplicate locations by hospital name (for carousel)
 * Keeps the first occurrence of each hospital name
 */
export function deduplicateByHospitalName(locations: NormalizedLocation[]): NormalizedLocation[] {
  const seen = new Set<string>()
  const unique: NormalizedLocation[] = []

  for (const loc of locations) {
    const nameKey = (loc.hospitalName || loc.name || '').toLowerCase()
    if (!seen.has(nameKey)) {
      seen.add(nameKey)
      unique.push(loc)
    }
  }

  return unique
}

export function mapNormalizedLocationToBranchCard(location: NormalizedLocation): BranchCardData {
  return {
    _id: location._id || location.branchId,
    branchName: location.name || location.branchName,
    hospitalName: location.hospitalName,
    branchImage: location.image,
    image: location.image,
    logo: location.logo || '',
    city: location.city,
    location: location.location,
    yearEstablished: location.yearEstablished === null ? undefined : location.yearEstablished,
    totalBeds: location.totalBeds === null ? undefined : location.totalBeds,
    noOfDoctors: location.noOfDoctors === null ? undefined : location.noOfDoctors,
    accreditation: location.accreditation || [],
    popular: location.popular ?? false,
    primarySpecialty: location.specialty || undefined,
    specialty: location.specialty ? [{ name: location.specialty }] : location.specialization || location.specialities || [],
    specialization: location.specialization,
    specialities: location.specialities,
    specialist: location.specialist,
    slug: location.slug,
    hospitalSlug: location.hospitalSlug || location.slug,
  }
}

// =============================================================================
// DOCTOR NORMALIZATION (shared between DoctorSection and BranchDoctorsSection)
// =============================================================================

/**
 * Transform raw doctor data into DoctorCardData for unified DoctorCard component
 * Consolidates the nearly identical processDoctor functions from multiple sections
 */
export interface TransformDoctorOptions {
   showHospital?: boolean;
   includeLocation?: boolean;
   hospitalLookup?: Map<string, any>;
   hospitalNameLookup?: Map<string, any>;
   branchToHospitalMap?: Map<string, { hospitalId: string; hospitalName: string; isStandalone: boolean; branchName: string }>;
 }

export function transformDoctor(
	doctor: any,
	hospitalLogos: Record<string, string | null>,
	hospitals: any[] = [],
	options: TransformDoctorOptions = {}
): DoctorCardData {
  const imageUrl =
    doctor.profileImageUrl || (doctor.profileImage ? getWixImageUrl(doctor.profileImage) || doctor.profileImage : null) || null

   // Specialization array
   const specializations = Array.isArray(doctor.specialization)
      ? doctor.specialization.map((s: any) => typeof s === 'string' ? s : (s && typeof s.name === 'string' ? s.name : '')).filter(Boolean)
      : []

  // Experience
    let experience = null
    if (doctor.experienceYears) {
      const parsed = parseInt(String(doctor.experienceYears), 10)
      if (!isNaN(parsed)) experience = parsed
    }

  // City and location
  const cityName = Array.isArray(doctor.city)
    ? doctor.city.find((c: any) => c?.cityName || c?.name)?.cityName || doctor.city.find((c: any) => c?.name)?.name || ''
    : typeof doctor.city === 'string'
      ? doctor.city
      : ''

  const cityState = Array.isArray(doctor.city)
    ? doctor.city.find((c: any) => c?.cityName || c?.name)
    : typeof doctor.city === 'object' && doctor.city
      ? doctor.city
      : null

  const stateName = (cityState as any)?.state || (cityState as any)?.State || (cityState as any)?.stateName || ''
  const location = cityName ? `${cityName}${stateName ? ', ' + stateName : ''}` : ''

  const doctorSlug = doctor.slug || (doctor.doctorName ? generateBranchSlug(doctor.doctorName) : '')

// Hospital resolution
   const hospitalLookup = options.hospitalLookup || new Map<string, any>()
   const hospitalNameLookup = options.hospitalNameLookup || new Map<string, any>()
   const branchesByHospital = new Map<string, any[]>()
   const branchToHospitalMap = options.branchToHospitalMap || new Map<string, { hospitalId: string; hospitalName: string; isStandalone: boolean; branchName: string }>()

   // Build branch-to-hospital map if not already provided
   if (!options.branchToHospitalMap && Array.isArray(hospitals) && hospitals.length) {
     for (const h of hospitals) {
       if (Array.isArray(h.branches) && h.branches.length) {
         branchesByHospital.set(h._id, h.branches)
         for (const b of h.branches) {
           if (b._id) {
             branchToHospitalMap.set(b._id, {
               hospitalId: h._id,
               hospitalName: h.hospitalName,
               isStandalone: h.isStandalone === true,
               branchName: b.branchName || '',
             })
           }
         }
       }
     }
   }
   
   // Only build lookup maps if they weren't provided
   if (Array.isArray(hospitals) && hospitals.length && !options.hospitalLookup && !options.hospitalNameLookup) {
     for (const h of hospitals) {
       const hShowHospital = options.showHospital !== false ? Boolean(h.showHospital ?? true) : true
       if (!hShowHospital) continue
       if (h._id) {
         hospitalLookup.set(h._id, h)
       }
       // Index hospital by hospitalName (primary CMS field)
       if (typeof h.hospitalName === 'string' && h.hospitalName.trim()) {
         hospitalNameLookup.set(h.hospitalName.trim().toLowerCase(), h)
       }
       // Also index hospital by .name (backward-compat / alt field)
       if (typeof h.name === 'string' && h.name.trim()) {
         hospitalNameLookup.set(h.name.trim().toLowerCase(), h)
       }
     }
   }

  let resolvedHospital = null
  let resolvedHospitalName = doctor.hospitalName || ''
  let resolvedHospitalId = doctor.hospitalId || ''
  let resolvedBranchName = doctor.branchName || ''

  // ── PASS 1: Resolve hospitalId by exact ID match ──────────────────────────
  if (doctor.hospitalId && hospitalLookup.has(doctor.hospitalId)) {
    resolvedHospital = hospitalLookup.get(doctor.hospitalId)
    resolvedHospitalName = resolvedHospital.hospitalName
    resolvedHospitalId = resolvedHospital._id
  }
  // ── PASS 2: Resolve by hospitalName (also checks .name alias) ──────────────
  else if (resolvedHospitalName) {
    const nameKey = resolvedHospitalName.trim().toLowerCase()
    const matchedHospital = hospitalNameLookup.get(nameKey) || hospitalNameLookup.get(nameKey.trim())
    if (matchedHospital) {
      resolvedHospital = matchedHospital
      resolvedHospitalName = matchedHospital.hospitalName || matchedHospital.name || resolvedHospitalName
      resolvedHospitalId = matchedHospital._id
    }
  }


  if (!resolvedHospital && doctor.DoctorMaster_hospital) {
    const dmh = doctor.DoctorMaster_hospital
    const refs: any[] = Array.isArray(dmh) ? dmh : [dmh]

    for (const ref of refs) {
      if (!ref) continue
      const refId = ref._id || ref.ID
      if (refId && hospitalLookup.has(refId)) {
        resolvedHospital = hospitalLookup.get(refId)
        resolvedHospitalName = resolvedHospital.hospitalName
        resolvedHospitalId = resolvedHospital._id
        break
      }
    }

    // If still not resolved, try matching by ref name against hospitalNameLookup
    if (!resolvedHospital) {
      for (const ref of refs) {
        if (!ref) continue
        const refName = ref.hospitalName || ref.name || ''
        if (refName) {
          const matched = hospitalNameLookup.get(refName.trim().toLowerCase())
          if (matched) {
            resolvedHospital = matched
            resolvedHospitalName = matched.hospitalName || matched.name || refName
            resolvedHospitalId = matched._id
            break
          }
        }
      }
    }

  }

// ── PASS 4: Resolve via _hospitalNames (Sets populated by getAllCMSData enrichment) ──
   if ((!resolvedHospital || !resolvedHospitalName) && doctor._hospitalNames) {
     const rawHN = doctor._hospitalNames
     const names = rawHN instanceof Set ? Array.from(rawHN) : typeof rawHN === 'string' ? [rawHN] : []
     for (const n of names) {
       if (!n || typeof n !== 'string') continue
       const matched = hospitalNameLookup.get(n.trim().toLowerCase())
       if (matched) {
         resolvedHospital = matched
         resolvedHospitalName = matched.hospitalName || matched.name || n
         resolvedHospitalId = matched._id
         break
       }
     }
   }

  if (doctor.branchId && branchToHospitalMap.has(doctor.branchId)) {
    const branchInfo = branchToHospitalMap.get(doctor.branchId)!
    resolvedBranchName = branchInfo.branchName
    if (!resolvedHospital) {
      resolvedHospitalId = branchInfo.hospitalId
      resolvedHospitalName = branchInfo.hospitalName
      if (hospitalLookup.has(branchInfo.hospitalId)) {
        resolvedHospital = hospitalLookup.get(branchInfo.hospitalId)
      }
    }
  }

const hospitalNameFinal = resolvedHospital ? (resolvedHospitalName || '') : ''

// Also check _branchNames for branch name if still empty
    let finalBranchName = resolvedBranchName
    const branchNamesValue = doctor._branchNames
    if ((!finalBranchName || finalBranchName === '') && branchNamesValue) {
      // Handle both Set and array formats
      const branchNames = branchNamesValue instanceof Set 
        ? Array.from(branchNamesValue) 
        : (Array.isArray(branchNamesValue) ? branchNamesValue : [])
      if (branchNames.length > 0 && typeof branchNames[0] === 'string') {
        finalBranchName = branchNames[0] as string
      }
    }

   // Collect all branch info from multi-reference fields (BranchesMaster_doctor, branches)
   const allBranchInfo = doctor.branchInfo || []
const branchInfoFromRefs: DoctorBranchInfo[] = []
    if (doctor.BranchesMaster_doctor || doctor.branches) {
      const branchRefs = doctor.BranchesMaster_doctor || doctor.branches || []
      const refArray = Array.isArray(branchRefs) ? branchRefs : [branchRefs]
      for (const ref of refArray) {
        if (!ref) continue
        const refId = typeof ref === 'string' ? ref : (ref._id || ref.ID || '')
        const branchData = branchToHospitalMap.get(refId)
        if (branchData && !branchInfoFromRefs.some((b) => b.branchId === refId)) {
          branchInfoFromRefs.push({
            branchId: refId,
            branchName: branchData.branchName,
            hospitalId: branchData.hospitalId,
            hospitalName: branchData.hospitalName,
          })
        }
      }
    }
    
    // Also build branchInfo from _branchNames if available
    if (doctor._branchNames) {
      const branchNames = doctor._branchNames instanceof Set 
        ? Array.from(doctor._branchNames) 
        : (Array.isArray(doctor._branchNames) ? doctor._branchNames : [])
      const hospitalId = resolvedHospitalId || doctor.hospitalId || ''
      for (const branchName of branchNames) {
        if (branchName && !branchInfoFromRefs.some((b) => b.branchName === branchName)) {
          branchInfoFromRefs.push({
            branchId: '',
            branchName: branchName,
            hospitalId: hospitalId,
            hospitalName: resolvedHospitalName || doctor.hospitalName || '',
          })
        }
      }
    }
    
    // Also build branchInfo from _branchIds if available (without full resolution)
    if (doctor._branchIds) {
      const branchIds = doctor._branchIds instanceof Set 
        ? Array.from(doctor._branchIds) 
        : (Array.isArray(doctor._branchIds) ? doctor._branchIds : [])
      const hospitalId = resolvedHospitalId || doctor.hospitalId || ''
      for (const branchId of branchIds) {
        if (branchId && !branchInfoFromRefs.some((b) => b.branchId === branchId)) {
          const branchData = branchToHospitalMap.get(branchId)
          if (branchData) {
            branchInfoFromRefs.push({
              branchId: branchId,
              branchName: branchData.branchName,
              hospitalId: branchData.hospitalId,
              hospitalName: branchData.hospitalName,
            })
          } else {
            branchInfoFromRefs.push({
              branchId: branchId,
              branchName: '',
              hospitalId: hospitalId,
              hospitalName: resolvedHospitalName || doctor.hospitalName || '',
            })
          }
        }
      }
    }

   const hospitalSlug = hospitalNameFinal ? generateBranchSlug(hospitalNameFinal) : ''
   const isStandalone = resolvedHospital?.isStandalone === true
   const hasBranches = resolvedHospital && Array.isArray(resolvedHospital.branches) && resolvedHospital.branches.length > 0
   const hospitalLinkType = isStandalone
     ? 'hospital-branches'
     : hasBranches
       ? 'hospital-groups'
       : 'hospital-branches'
   const hospitalLogo = resolvedHospitalId ? (hospitalLogos[resolvedHospitalId] || null) : null

   return {
     _id: doctor._id,
     doctorName: doctor.doctorName || '',
     doctorSlug,
     profileImage: imageUrl || "/placeholder.svg",
     specialization: specializations,
     experienceYears: experience,
     qualification: doctor.qualification || null,
     designation: doctor.designation || null,
     hospitalName: hospitalNameFinal,
     hospitalId: resolvedHospitalId || doctor.hospitalId || '',
     hospitalSlug,
     hospitalLogo,
     hospitalLinkType,
     branchName: finalBranchName || '',
     branchId: resolvedHospitalId || doctor.branchId || '',
     city: cityName,
     location: options.includeLocation ? location : undefined,
     popular: doctor.popular === true,
     branchInfo: [...allBranchInfo, ...branchInfoFromRefs].slice(0, 3),
   } as DoctorCardData
}

/**
 * Enrich branch data with computed fields for HospitalBranchesCarousel
 * This extends a branch object with normalized image, location, specialty, stats, etc.
 * Replaces duplicated mapping logic across multiple components.
 */
export function enrichBranchData(branch: any, hospital?: any): Partial<NormalizedLocation> {
  const imageUrl = resolveBranchImage(branch, hospital)
  const { cityName, state: location } = extractCityInfo(branch)
  const firstSpecialty = extractPrimarySpecialty(branch, 'Multi Specialty')
  const yearEstablished = extractNumeric(branch.yearEstablished || branch.data?.yearEstablished || hospital?.yearEstablished)
  const totalBeds = extractNumeric(branch.totalBeds || branch.data?.totalBeds || hospital?.totalBeds)
  const noOfDoctors = extractNumeric(branch.noOfDoctors || branch.data?.noOfDoctors || hospital?.noOfDoctors)
  const isPopular = checkPopular(branch, hospital)

  const branchName = branch.branchName || hospital?.hospitalName || 'Hospital'
  const hospitalSlug = generateBranchSlug(branchName, cityName)
  const logo = branch.logoUrl || branch.logo || branch.data?.logo || hospital?.logo || null

return {
    branchImage: imageUrl,
    location,
    specialty: [{ name: firstSpecialty }] as any,
    specialization:
      branch.specialization ||
      branch.specialist ||
      branch.specialty ||
      branch.specialities ||
      branch.data?.specialization ||
      branch.data?.specialist ||
      branch.data?.specialty ||
      branch.data?.specialities ||
      [],
    specialities:
      branch.specialization ||
      branch.specialist ||
      branch.specialty ||
      branch.specialities ||
      branch.data?.specialization ||
      branch.data?.specialist ||
      branch.data?.specialty ||
      branch.data?.specialities ||
      [],
     yearEstablished,
     totalBeds,
     noOfDoctors,
     popular: isPopular,
     showHospital: branch.showHospital === true || branch.showHospital === 'true' || branch.data?.showHospital === true || branch.ShowHospital === true,
     hospitalSlug,
     logo,
     hospitalName: hospital?.hospitalName || branch.hospitalName || '',
     hospitalId: hospital?._id || branch.hospitalId || '',
     isStandalone: hospital?.isStandalone,
     city: branch.city || branch.data?.city || [],
     accreditation: branch.accreditation || branch.data?.accreditation || [],
   }
}

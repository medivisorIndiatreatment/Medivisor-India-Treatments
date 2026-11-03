// lib/doctors/page-loader.ts
// Single-call data loader for the doctor slug page.
// Calls getAllCMSData() exactly once, then enriches and transforms via DoctorRelationshipResolver.

import type { CMSDataResponse, DoctorData, HospitalData, TreatmentData } from '@/lib/cms'
import { getAllCMSData } from '@/lib/cms'
import { cleanSlug, generateSlug } from '@/lib/slug-utils'
import { extractRichText, extractAchievementsText } from '@/lib/cms'
import type { TransformedDoctor, LoadedDoctorPageData } from './types'
import { DoctorRelationshipResolver } from './relations'
import { buildHospitalLookupMaps, processDoctorToCard } from '@/lib/utils/doctor-card-utils'
import { mapTreatmentToCard } from '@/lib/utils/treatment-card-utils'
import { getCardImageUrl } from '@/lib/utils/card-utils'
import { getWixImageUrl } from '@/lib/wixMedia'

// =============================================================================
// ERRORS
// =============================================================================

export class DoctorNotFoundError extends Error {
  constructor(slug: string) {
    super(`Doctor not found for slug: ${slug}`)
    this.name = 'DoctorNotFoundError'
  }
}

export class CMSDataError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CMSDataError'
  }
}

// =============================================================================
// LOADER
// =============================================================================

/**
 * Single entry point for doctor page data.
 * Eliminates duplicate getAllCMSData() calls by fetching once and reusing.
 */
export async function loadDoctorPageData(
  slug: string,
): Promise<LoadedDoctorPageData> {
  // 1. Fetch ALL CMS data exactly once
  let cmsData: CMSDataResponse
  try {
    cmsData = await getAllCMSData()
  } catch (error) {
    throw new CMSDataError(`Failed to load CMS data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  const allHospitals: HospitalData[] = cmsData.hospitals || []
  const allDoctors: DoctorData[] = cmsData.doctors || []
  const allTreatments: TreatmentData[] = cmsData.treatments || []
  const specialistWithBranch = cmsData.specialistWithBranch || []

  if (!allDoctors.length) {
    throw new DoctorNotFoundError(slug)
  }

  // 2. Build relationship resolver (single source of truth for all lookups)
  const resolver = new DoctorRelationshipResolver(allHospitals, allDoctors, allTreatments, specialistWithBranch)

  // 3. Find doctor by slug
  const doctor = allDoctors.find((d) => {
    const cleanStoredSlug = d.slug ? cleanSlug(d.slug) : ''
    const generatedSlug = d.doctorName ? generateSlug(d.doctorName) : ''
    return cleanStoredSlug === slug || generatedSlug === slug
  })

  if (!doctor) {
    throw new DoctorNotFoundError(slug)
  }

  // 4. Transform to client shape
  const transformed = transformDoctorForDetail(doctor, resolver)

  // 5. Resolve hospitals
  const doctorHospitals = resolver.getDoctorHospitals(doctor)

  // 6. Enrich from matched hospital / branch context
  if (doctorHospitals.length > 0) {
    const matchedHospital = doctorHospitals[0]

    if (!transformed.hospitalName) {
      transformed.hospitalName = matchedHospital.hospitalName || ''
      transformed.hospitalId = matchedHospital._id || transformed.hospitalId
    }

    if (!transformed.branchName || !transformed.branchId) {
      const matchedBranch = matchedHospital.branches?.find(
        (b: any) =>
          b._id === doctor.branchId ||
          b.branchName === doctor.branchName ||
          b.doctors?.some((d: any) => d._id === doctor._id),
      )
      if (matchedBranch) {
        transformed.branchName = matchedBranch.branchName || transformed.branchName
        transformed.branchId = matchedBranch._id || transformed.branchId
      }
    }

    if (!transformed.city) {
      const branch = matchedHospital.branches?.find(
        (b: any) =>
          b._id === transformed.branchId ||
          b._id === doctor.branchId ||
          b.branchName === transformed.branchName,
      )
      if (branch?.city?.length) {
        transformed.city = branch.city[0]?.cityName || ''
      }
    }
  }

  const matchedHospital = doctorHospitals.length > 0 ? doctorHospitals[0] : null

  // 7. Compute related data using resolver (no duplicate map building)
  const relatedScores = resolver.scoreRelatedDoctors(doctor, allDoctors)
  const relatedDoctors = relatedScores.slice(0, 8).map(({ doctor: doc }) => {
    const resolved = resolver.resolveDoctorBranchInfo(doc)
    const branchInfo = resolver.getDoctorBranchInfo(doc)

    const specialization = (doc.specialization || []).map((s: any) =>
      typeof s === 'string' ? s : (s && typeof s.name === 'string' ? s.name : ''),
    ).filter(Boolean)

    const slug = doc.slug || generateSlug(doc.doctorName || doc.name || '')

    const linkedHospital = resolver.getHospitalById(resolved.hospitalId)
    const hospitalLinkType: 'hospital-groups' | 'hospital-branches' = linkedHospital
      ? (linkedHospital.isStandalone === true || !linkedHospital.branches?.length ? 'hospital-branches' : 'hospital-groups')
      : 'hospital-branches'

    return {
      _id: doc._id,
      doctorName: doc.doctorName || doc.name || '',
      name: doc.doctorName || doc.name || '',
      specialization,
      qualification: doc.qualification || undefined,
      designation: doc.designation || undefined,
      experienceYears: doc.experienceYears ?? undefined,
      profileImage: doc.profileImage || undefined,
      profileImageUrl: getCardImageUrl((doc.profileImageUrl || doc.profileImage || undefined)) || undefined,
      popular: doc.popular || false,
      slug,
      hospitalName: resolved.hospitalName || undefined,
      hospitalId: resolved.hospitalId || undefined,
      hospitalSlug: resolved.hospitalName ? generateSlug(resolved.hospitalName) : '',
      hospitalLinkType,
      hospitalLogo: linkedHospital?.logo || null,
      branchName: resolved.branchName || undefined,
      branchId: resolved.branchId || undefined,
      city: normalizeCity(doc.city),
      branchInfo,
    }
  })

  const relatedTreatments = resolver.getTreatmentsByDoctorId(doctor._id || '')

  // 8. Build hospital logo map once
  const hospitalLogoMap: Record<string, string | null> = {}
  for (const hospital of allHospitals) {
    if (hospital._id) {
      hospitalLogoMap[hospital._id] = hospital.logoUrl || hospital.logo || null
    }
  }

  // 9. Build all doctor cards using resolver
  const allDoctorCards = resolver.buildAllDoctorCards(hospitalLogoMap)

  // 10. Build all treatment cards
  const allTreatmentsMapped = allTreatments.map((treatment) => mapTreatmentToCard(treatment))

  return {
    doctor: transformed,
    doctorHospitals,
    matchedHospital,
    relatedDoctors,
    relatedTreatments,
    allDoctors,
    allDoctorCards,
    allTreatments: allTreatmentsMapped,
  }
}

// =============================================================================
// HELPERS (mirrored from doctor-page-helpers.ts for self-containment)
// =============================================================================

function normalizeCity(city: unknown): { cityName: string }[] | string | undefined {
  if (!city) return undefined
  if (typeof city === 'string') return city
  if (Array.isArray(city)) {
    return city.map((c: any) => ({ cityName: c?.cityName || c?.name || '' }))
  }
  return undefined
}

function transformDoctorForDetail(doctor: DoctorData, resolver: DoctorRelationshipResolver): TransformedDoctor {
  let specialties: string[] = []
  if (Array.isArray(doctor.specialization)) {
    specialties = doctor.specialization
      .map((s: any) => {
        if (typeof s === 'object') return s.name || s.title || String(s)
        return String(s)
      })
      .filter(Boolean)
  } else if (doctor.specialization) {
    specialties = [String(doctor.specialization)]
  }

  const primaryCity: string =
    Array.isArray(doctor.city) && doctor.city.length > 0
      ? typeof doctor.city[0] === 'object'
        ? doctor.city[0].cityName || ''
        : String(doctor.city[0])
      : typeof doctor.city === 'string'
        ? doctor.city
        : ''

  const departmentSet = new Set<string>()
  if (doctor.departmentName && typeof doctor.departmentName === 'string') {
    departmentSet.add(doctor.departmentName.trim())
  }
  if (doctor.subDepartmentName && typeof doctor.subDepartmentName === 'string') {
    departmentSet.add(doctor.subDepartmentName.trim())
  }
  if (Array.isArray(doctor.specialization)) {
    for (const s of doctor.specialization) {
      if (s && Array.isArray((s as { department?: unknown[] }).department)) {
        for (const d of (s as { department: unknown[] }).department) {
          const name = typeof d === 'string' ? d : (d as { name?: string }).name
          if (name && typeof name === 'string') departmentSet.add(name.trim())
        }
      }
    }
  }
  const departments = Array.from(departmentSet).filter(Boolean)

  const experienceYears = parseInt(doctor.experienceYears || '0', 10) || 0

  const doctorImage = doctor.profileImage || null

  const qualification = doctor.qualification || ''
  const qualifications: string[] | null = Array.isArray(doctor.qualifications)
    ? doctor.qualifications.filter(Boolean)
    : qualification
      ? [qualification]
      : null

  const designation = doctor.designation || specialties[0] || ''

  const richTextContent = doctor.aboutDoctor
  const isRichText = richTextContent && typeof richTextContent === 'object' && 'nodes' in richTextContent

  const descriptionHtml: string | { nodes?: any[] } | null | undefined = isRichText
    ? (richTextContent as { nodes: unknown[] })
    : (doctor.aboutDoctorHtml as string | null ?? undefined)

  const about: string = isRichText
    ? (typeof doctor.aboutDoctor === 'object' ? extractRichText(doctor.aboutDoctor) : '')
    : (doctor.aboutDoctor || '')

  const isPopular = doctor.popular === true

  const achievementsAwards: string[] = extractAchievementsText(doctor.achievementsAwards)
  const awardsFromField: string[] = extractAchievementsText(doctor.awards)
  const achievementsFromField: string[] = extractAchievementsText(doctor.achievements)

  const awards: string[] | null = achievementsAwards.length > 0 ? achievementsAwards : awardsFromField
  const achievements: string[] | null = achievementsAwards.length > 0 ? null : achievementsFromField

  const resolved = resolver.resolveDoctorBranchInfo(doctor)

  return {
    id: doctor._id || '',
    name: doctor.doctorName || '',
    title: designation,
    rating: isPopular ? 4.8 : 4.5,
    reviewCount: isPopular ? 120 : 50,
    about,
    specialties: specialties.length > 0 ? specialties : [],
    department: departments.length > 0 ? departments : undefined,
    experienceYears: experienceYears || 0,
    languages: ['English', 'Hindi'],
    hospitalName: resolved.hospitalName || (Array.isArray(doctor.hospital) ? doctor.hospital.map((r:any)=> (r.hospital&&r.hospital.name)||r.name||r.hospitalName).filter(Boolean).join(', ') : doctor.hospitalName || ''),
    hospitalId: resolved.hospitalId,
    branchName: (Array.isArray(doctor.hospital) ? doctor.hospital.map((r:any)=> r.branchName || (r.branch&&r.branch.name) || '').filter(Boolean).join(', ') : (resolved.branchName || doctor.branchName || '')),
    branchId: resolved.branchId,
    city: primaryCity,
    image: doctorImage,
    qualification,
    qualifications,
    doctorImage: doctorImage ?? undefined,
    designation,
    descriptionHtml,
    isPopular,
    awards,
    achievements,
  }
}

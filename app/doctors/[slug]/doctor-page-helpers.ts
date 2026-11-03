// app/doctors/[slug]/doctor-page-helpers.ts
// Pure helper functions extracted from the doctor page for reusability and testability.
// Also defines the TransformedDoctor type so page.tsx stays fully typed.

import { cache } from 'react'
import type { DoctorData, CMSDataResponse, HospitalData } from '@/lib/cms'
import type { DoctorCardData, DoctorBranchInfo } from '@/components/cards/types'
import { generateSlug, cleanSlug } from '@/lib/slug-utils'
import {
  extractRichText,
  extractAchievementsText,
  getAllCMSData,
  getTreatmentsByDoctorId,
} from '@/lib/cms'
import { getCardImageUrl } from '@/lib/utils/card-utils'
import { buildHospitalLookupMaps, processDoctorToCard } from '@/lib/utils/doctor-card-utils'
import { mapTreatmentToCard } from '@/lib/utils/treatment-card-utils'
import { loadDoctorPageData as loadDoctorPageDataInternal } from '@/lib/doctors/page-loader'
import type { TransformedDoctor, LoadedDoctorPageData } from '@/lib/doctors/types'

// Re-export types for backward compatibility
export type { TransformedDoctor, LoadedDoctorPageData }

// ---------------------------------------------------------------------------
// transformDoctorForDetail – maps raw CMS doctor object → TransformedDoctor
// ---------------------------------------------------------------------------

export function transformDoctorForDetail(doctor: any): TransformedDoctor {
  // ---- Specialization ----
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

  // ---- City ----
  const primaryCity =
    Array.isArray(doctor.city) && doctor.city.length > 0
      ? typeof doctor.city[0] === 'object'
        ? doctor.city[0].cityName
        : String(doctor.city[0])
      : typeof doctor.city === 'string'
        ? doctor.city
        : ''

  // ---- Department (from departmentName, subDepartmentName, and specialization.department) ----
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

  // ---- Experience ----
  const experienceYears = parseInt(doctor.experienceYears || doctor.experience || '0', 10) || 0

  // ---- Image ----
  const doctorImage = doctor.profileImage || doctor.doctorImage || null

  // ---- Qualification ----
  const qualification = doctor.qualification || ''
  const qualifications: string[] | null = Array.isArray(doctor.qualifications)
    ? doctor.qualifications.filter(Boolean)
    : qualification
      ? [qualification]
      : null

  // ---- Designation ----
  const designation = doctor.designation || specialties[0] || ''

  // ---- Rich text / about ----
  const richTextContent = doctor.aboutDoctor
  const isRichText = richTextContent && typeof richTextContent === 'object' && 'nodes' in richTextContent

  const descriptionHtml: string | { nodes?: any[] } | null | undefined = isRichText
    ? (richTextContent as { nodes: unknown[] })
    : (doctor.aboutDoctorHtml as string | null ?? undefined)

  const about: string = isRichText
    ? (typeof doctor.aboutDoctor === 'object' ? extractRichText(doctor.aboutDoctor) : '')
    : (doctor.aboutDoctor || doctor.description || doctor.about || '')

  // ---- Popular flag ----
  const isPopular = doctor.popular === true

  // ---- Awards & achievements – deduplicate ----
  const achievementsAwards: string[] = extractAchievementsText(doctor.achievementsAwards)
  const awardsFromField: string[]  = extractAchievementsText(doctor.awards)
  const achievementsFromField: string[] = extractAchievementsText(doctor.achievements)

  // If achievementsAwards exists, use it as the sole source
  const awards: string[] | null = achievementsAwards.length > 0 ? achievementsAwards : awardsFromField
  const achievements: string[] | null = achievementsAwards.length > 0 ? null : achievementsFromField

  // ---- Hospital data – multi-reference primary, denormalized fallback ----
  let hospitalNames: string[] = []
  let hospitalIds: string[] = []
  let branchNames: string[] = []
  let branchIds: string[] = []

  if (doctor.hospital && Array.isArray(doctor.hospital) && doctor.hospital.length > 0) {
    for (const ref of doctor.hospital) {
      const h = ref.hospital && typeof ref.hospital === 'object' ? ref.hospital : ref
      const hn = h.name || h.hospitalName || ''
      if (hn) hospitalNames.push(hn)
      const hid = h._id || h.hospitalId || ''
      if (hid) hospitalIds.push(hid)
      const bn = ref.branchName || (ref.branch && ref.branch.name) || ''
      if (bn) branchNames.push(bn)
      const bid = ref.branchId || (ref.branch && ref.branch._id) || ''
      if (bid) branchIds.push(bid)
    }
  } else {
    const hn = doctor.hospitalName || ''
    if (hn) hospitalNames.push(hn)
    const hid = doctor.hospitalId || ''
    if (hid) hospitalIds.push(hid)
    const bn = doctor.branchName || ''
    if (bn) branchNames.push(bn)
    const bid = doctor.branchId || ''
    if (bid) branchIds.push(bid)
  }

  const hospitalName = hospitalNames.join(', ')
  const hospitalId = hospitalIds[0] || ''
  const branchName = (branchNames.length ? branchNames : hospitalNames).join(', ')
  const branchId = branchIds[0] || ''

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
    hospitalName,
    hospitalId,
    branchName,
    branchId,
    city: primaryCity,
    image: doctorImage,
    qualification,
    qualifications,
    doctorImage,
    designation,
    descriptionHtml,
    isPopular,
    awards,
    achievements,
  }
}

// ---------------------------------------------------------------------------
// getRelatedDoctors – score-based related doctor finder
// ---------------------------------------------------------------------------

/**
 * Score each doctor against `currentDoctor` on four axes:
 *   1. Specialization match: exact = +3, substring = +1
 *   2. Shared treatments (from specialisation.treatments or doctor.treatments): +5 each
 *   3. Shared departments (from specialisation.department): +3 each
 *   4. Same hospitalId or branchId: +1 each
 *
 * Non-zero scores are kept, sorted highest → lowest, then name ascending as tiebreaker.
 * Returns up to 8 results mapped to DoctorCardData.
 */
export function getRelatedDoctors(
  currentDoctor: any,
  allDoctors: any[],
  hospitals: any[] = [],
): DoctorCardData[] {
  if (!currentDoctor || !allDoctors?.length) return []

  const getSpecNames = (doc: any): string[] =>
    (doc.specialization || [])
      .map((s: any) => {
        if (typeof s === 'string') return s.toLowerCase()
        return (s?.name || '').toLowerCase()
      })
      .filter(Boolean)

  const getTreatmentSet = (doc: any) => {
    const set = new Set<string>()
    const add = (t: any) => {
      if (typeof t === 'string') set.add(t.toLowerCase())
      else if (t && typeof t === 'object') {
        if (t._id) set.add(t._id.toLowerCase())
        else if (t.name) set.add(t.name.toLowerCase())
      }
    }
    ;(doc.specialization || []).forEach((s: any) => (s.treatments || []).forEach(add))
    ;(doc.treatments || []).forEach(add)
    return set
  }

  const getDeptSet = (doc: any) => {
    const set = new Set<string>()
    const add = (d: any) => {
      if (typeof d === 'string') set.add(d.toLowerCase())
      else if (d && typeof d === 'object') {
        if (d._id) set.add(d._id.toLowerCase())
        else if (d.name) set.add(d.name.toLowerCase())
      }
    }
    ;(doc.specialization || []).forEach((s: any) => (s.department || []).forEach(add))
    return set
  }

  const currentSpecs   = new Set(getSpecNames(currentDoctor))
  const currentTreats  = getTreatmentSet(currentDoctor)
  const currentDepts   = new Set(getDeptSet(currentDoctor))

  const hospitalLookup = new Map<string, any>()
  hospitals.forEach((h: any) => { if (h._id) hospitalLookup.set(h._id, h) })

  const branchToHospitalMap = new Map<string, { hospitalId: string; hospitalName: string; branchName: string }>()
  for (const h of hospitals) {
    if (Array.isArray(h.branches)) {
      for (const b of h.branches) {
        const bid = b._id || b.ID || b.id
        if (bid && !branchToHospitalMap.has(bid)) {
          branchToHospitalMap.set(bid, {
            hospitalId: h._id,
            hospitalName: h.hospitalName,
            branchName: b.branchName || '',
          })
        }
      }
    }
  }

  const scored = allDoctors
    .filter((doc: any) => doc._id !== currentDoctor._id)
    .map((doc: any) => {
      let score = 0

      // 1. Specialization: exact = 3, partial = 1
      for (const spec of getSpecNames(doc)) {
        if (currentSpecs.has(spec)) {
          score += 3
        } else {
          for (const cur of currentSpecs) {
            if (spec.includes(cur) || cur.includes(spec)) { score += 1; break }
          }
        }
      }

      // 2. Shared treatments: +5 each
      score += [...currentTreats].filter(t => getTreatmentSet(doc).has(t)).length * 5

      // 3. Shared departments: +3 each
      score += [...currentDepts].filter(d => getDeptSet(doc).has(d)).length * 3

      // 4. Same hospital / branch: +1 each
      if (doc.hospitalId && currentDoctor.hospitalId && doc.hospitalId === currentDoctor.hospitalId) score += 1
      if (doc.branchId   && currentDoctor.branchId   && doc.branchId   === currentDoctor.branchId)   score += 1

      return { doc, score }
    })
    .filter((item: any) => item.score > 0)
    .sort((a: any, b: any) =>
      b.score !== a.score
        ? b.score - a.score
        : (a.doc.doctorName || a.doc.name || '').localeCompare(b.doc.doctorName || b.doc.name || '')
    )

  return scored.slice(0, 8).map((item: any) => {
    const doc = item.doc

    // Normalize city
    let normalizedCity: { cityName: string }[] | string | undefined
    if (doc.city) {
      if (typeof doc.city === 'string') normalizedCity = doc.city
      else if (Array.isArray(doc.city))
        normalizedCity = doc.city.map((c: any) => ({ cityName: c.cityName || c.name || '' }))
    }

    // Resolve hospital via lookup
    let resolvedHospitalName = doc.hospitalName || ''
    let resolvedHospitalId   = doc.hospitalId   || ''
    const linkedHospital = hospitalLookup.get(doc.hospitalId)
    if (linkedHospital) {
      resolvedHospitalName = linkedHospital.hospitalName || resolvedHospitalName
      resolvedHospitalId   = linkedHospital._id             || resolvedHospitalId
    }

    // Resolve branch info from hospital-reference object
    let resolvedBranchName = doc.branchName || ''
    let resolvedBranchId   = doc.branchId   || ''
    if (typeof doc.hospital === 'object' && doc.hospital !== null && !Array.isArray(doc.hospital)) {
      const h = doc.hospital as any
      resolvedBranchName = resolvedBranchName || h.branchName || (h.branch && h.branch.name) || ''
      resolvedBranchId   = resolvedBranchId   || h.branchId   || (h.branch && h.branch._id)   || ''
    }

    // Fallback branch resolution from multi-reference fields
    const branchRefs = doc.BranchesMaster_doctor || doc.branches || []
    const branchRefArray = Array.isArray(branchRefs) ? branchRefs : [branchRefs]
    for (const ref of branchRefArray) {
      if (!ref) continue
      const refId = typeof ref === 'string' ? ref : (ref._id || ref.ID || '')
      if (refId && branchToHospitalMap.has(refId)) {
        const branchData = branchToHospitalMap.get(refId)!
        if (!resolvedBranchName) resolvedBranchName = branchData.branchName
        if (!resolvedHospitalName) resolvedHospitalName = branchData.hospitalName
        break
      }
    }

    if (doc.branchId && branchToHospitalMap.has(doc.branchId)) {
      const branchData = branchToHospitalMap.get(doc.branchId)!
      if (!resolvedBranchName) resolvedBranchName = branchData.branchName
      if (!resolvedHospitalName) resolvedHospitalName = branchData.hospitalName
      if (!resolvedHospitalId)   resolvedHospitalId   = branchData.hospitalId
    }

    // Fallback: if still no branch name, use the hospital name so a card
    // never renders with an empty/incorrect branch for missing branch data.
    if (!resolvedBranchName && resolvedHospitalName) {
      resolvedBranchName = resolvedHospitalName
    }

    // Derive hospital link type from the linked hospital
    let hospitalLinkType: 'hospital-groups' | 'hospital-branches' = 'hospital-branches'
    if (linkedHospital) {
      hospitalLinkType = linkedHospital.isStandalone === true
        ? 'hospital-branches'
        : linkedHospital.branches?.length
          ? 'hospital-groups'
          : 'hospital-branches'
    }

    const specialization = (doc.specialization || []).map((s: any) =>
      typeof s === 'string' ? s : (s && typeof s.name === 'string' ? s.name : '')
    ).filter(Boolean)

    const slug = doc.slug || generateSlug(doc.doctorName || doc.name || '')

    const allBranchInfo: DoctorBranchInfo[] = []
    for (const ref of branchRefArray) {
      if (!ref) continue
      const refId = typeof ref === 'string' ? ref : (ref._id || ref.ID || '')
      if (refId && branchToHospitalMap.has(refId)) {
        const data = branchToHospitalMap.get(refId)!
        if (!allBranchInfo.some((b) => b.branchId === refId)) {
          allBranchInfo.push({
            branchId: refId,
            branchName: data.branchName,
            hospitalId: data.hospitalId,
            hospitalName: data.hospitalName,
          })
        }
      }
    }

    return {
      _id: doc._id,
      doctorName: doc.doctorName || doc.name || '',
      name:        doc.doctorName || doc.name || '',
      specialization,
      qualification: doc.qualification   || undefined,
      designation:   doc.designation     || undefined,
      experienceYears: doc.experienceYears ?? doc.experience ?? undefined,
      profileImage:    doc.profileImage   || undefined,
      profileImageUrl: getCardImageUrl(doc.profileImageUrl ?? doc.profileImage ?? null),
      popular:         doc.popular        || false,
      slug,
      hospitalName:    resolvedHospitalName || undefined,
      hospitalId:      resolvedHospitalId   || undefined,
      hospitalSlug:    resolvedHospitalName ? generateSlug(resolvedHospitalName) : '',
      hospitalLinkType,
      hospitalLogo:    linkedHospital?.logo || null,
      branchName:      resolvedBranchName || undefined,
      branchId:        resolvedBranchId   || undefined,
      city:            normalizedCity,
      branchInfo:      allBranchInfo.slice(0, 3),
    }
  })
}

// ---------------------------------------------------------------------------
// loadDoctorPageData – delegated to single-call page loader
// ---------------------------------------------------------------------------

export const loadDoctorPageData = cache(async function loadDoctorPageData(
  slug: string,
): Promise<LoadedDoctorPageData> {
  return loadDoctorPageDataInternal(slug)
})

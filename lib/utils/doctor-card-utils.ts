// lib/utils/doctor-card-utils.ts
// Shared utilities for doctor card rendering - consolidates logic from doctor-utils.ts and transformers.ts

import { getWixImageUrl } from '@/lib/wixMedia'
import { generateSlug } from '@/lib/slug-utils'
import { stripHtmlTags } from '@/lib/cms'
import type { HospitalData, DoctorData } from '@/lib/cms/types'
import type { DoctorCardData, DoctorBranchInfo } from '@/components/cards/types'

function cleanText(value: unknown): string {
  if (!value) return ''
  return stripHtmlTags(String(value)).trim()
}

/**
 * Build lookup maps from hospitals array (built ONCE, reused for all doctors)
 * Consolidated from doctor-utils.ts and transformers.ts
 */
export function buildHospitalLookupMaps(hospitals: HospitalData[]) {
  const hospitalLookup = new Map<string, HospitalData>()
  const hospitalNameLookup = new Map<string, HospitalData>()
  const branchToHospitalMap = new Map<string, {
    hospitalId: string
    hospitalName: string
    isStandalone: boolean
    branchName: string
  }>()

  if (Array.isArray(hospitals) && hospitals.length) {
    for (const h of hospitals) {
      if (h._id) {
        hospitalLookup.set(h._id, h)
      }
      if (typeof h.hospitalName === 'string' && h.hospitalName.trim()) {
        hospitalNameLookup.set(h.hospitalName.trim().toLowerCase(), h)
      }
      if (typeof h.name === 'string' && h.name.trim()) {
        hospitalNameLookup.set(h.name.trim().toLowerCase(), h)
      }
      if (Array.isArray(h.branches) && h.branches.length) {
        for (const b of h.branches) {
          const branch = b as any
          if (b._id) {
            branchToHospitalMap.set(b._id, {
              hospitalId: h._id,
              hospitalName: h.hospitalName,
              isStandalone: h.isStandalone === true,
              branchName: (branch as { branchName?: string }).branchName || '',
            })
          }
          if ((branch.ID || branch.id) && !branchToHospitalMap.has(branch.ID || branch.id)) {
            const bid = (branch.ID || branch.id) as string
            branchToHospitalMap.set(bid, {
              hospitalId: h._id,
              hospitalName: h.hospitalName,
              isStandalone: h.isStandalone === true,
              branchName: (branch as { branchName?: string }).branchName || '',
            })
          }
        }
      }
    }
  }

  return { hospitalLookup, hospitalNameLookup, branchToHospitalMap }
}

/**
 * Process a single doctor into DoctorCardData using pre-built lookup maps
 * Single source of truth - used by all components that need doctor card data
 */
export function processDoctorToCard(
  doctor: DoctorData,
  hospitalLogos: Record<string, string | null>,
  hospitalLookup: Map<string, HospitalData>,
  hospitalNameLookup: Map<string, HospitalData>,
  branchToHospitalMap: Map<string, {
    hospitalId: string
    hospitalName: string
    isStandalone: boolean
    branchName: string
  }>
): DoctorCardData {
  const imageUrl = doctor.profileImageUrl || (doctor.profileImage ? getWixImageUrl(doctor.profileImage) : null) || '/placeholder.svg'

  const specializations = Array.isArray(doctor.specialization)
    ? doctor.specialization.map(s => typeof s === 'string' ? s : (s && typeof s.name === 'string' ? s.name : '')).filter(Boolean)
    : []

  // Department extraction – derive from specialization.department references,
  // departmentName, and subDepartmentName (de-duplicated, lowercased-safe)
  const departmentSet = new Set<string>()
  if (doctor.departmentName && typeof doctor.departmentName === 'string') {
    departmentSet.add(doctor.departmentName.trim())
  }
  if (doctor.subDepartmentName && typeof doctor.subDepartmentName === 'string') {
    departmentSet.add(doctor.subDepartmentName.trim())
  }
  if (Array.isArray(doctor.specialization)) {
    for (const s of doctor.specialization) {
      if (s && Array.isArray((s as { department?: unknown }).department)) {
        for (const d of (s as { department: unknown[] }).department) {
          const name = typeof d === 'string' ? d : (d as { name?: string }).name
          if (name && typeof name === 'string') departmentSet.add(name.trim())
        }
      }
    }
  }
  const departments = Array.from(departmentSet).filter(Boolean)

  let experience: number | null = null
  if (doctor.experienceYears) {
    const parsed = parseInt(String(doctor.experienceYears), 10)
    if (!isNaN(parsed)) experience = parsed
  }

  const cityName = Array.isArray(doctor.city)
    ? doctor.city.find(c => c?.cityName || c?.name)?.cityName ||
      doctor.city.find(c => c?.name)?.name || ''
    : typeof doctor.city === 'string' ? doctor.city : ''

  // Hospital resolution with multi-pass fallback chain
  let resolvedHospital: HospitalData | null = null
  let resolvedHospitalName = doctor.hospitalName || ''
  let resolvedHospitalId = doctor.hospitalId || ''
  let resolvedBranchName = doctor.branchName || ''

  // PASS 1: Resolve hospitalId by exact ID match
  if (doctor.hospitalId && hospitalLookup.has(doctor.hospitalId)) {
    resolvedHospital = hospitalLookup.get(doctor.hospitalId)!
    resolvedHospitalName = resolvedHospital.hospitalName
    resolvedHospitalId = resolvedHospital._id
  }
  // PASS 2: Resolve by hospitalName
  else if (resolvedHospitalName) {
    const nameKey = resolvedHospitalName.trim().toLowerCase()
    const matchedHospital = hospitalNameLookup.get(nameKey) || hospitalNameLookup.get(nameKey.trim())
    if (matchedHospital) {
      resolvedHospital = matchedHospital
      resolvedHospitalName = matchedHospital.hospitalName || matchedHospital.name || resolvedHospitalName
      resolvedHospitalId = matchedHospital._id
    }
  }
  // PASS 3: Resolve via DoctorMaster_hospital multi-reference
  if (!resolvedHospital && doctor.DoctorMaster_hospital) {
    const dmh = doctor.DoctorMaster_hospital
    const refs: any[] = Array.isArray(dmh) ? dmh : [dmh]

    for (const ref of refs) {
      if (!ref) continue
      const refId = ref._id || ref.ID
      if (refId && hospitalLookup.has(refId)) {
        resolvedHospital = hospitalLookup.get(refId)!
        resolvedHospitalName = resolvedHospital.hospitalName
        resolvedHospitalId = resolvedHospital._id
        break
      }
    }

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

    if (!resolvedHospital && refs[0]) {
      const refName = refs[0].hospitalName || refs[0].name || ''
      if (refName) resolvedHospitalName = refName
    }
  }

  // PASS 3b: Resolve via doctor.hospital object reference
  if (!resolvedHospital && doctor.hospital) {
    const refs: any[] = Array.isArray(doctor.hospital) ? doctor.hospital : [doctor.hospital]
    for (const ref of refs) {
      if (!ref) continue
      const nestedHospital = ref?.hospital && typeof ref.hospital === 'object' && !Array.isArray(ref.hospital)
        ? ref.hospital
        : ref
      const nestedBranch = ref?.branch && typeof ref.branch === 'object'
        ? ref.branch
        : null

      const refId = nestedHospital?._id || nestedHospital?.ID || nestedHospital?.hospitalId || ref?._id || ref?.ID || ref?.hospitalId
      if (refId && hospitalLookup.has(refId)) {
        resolvedHospital = hospitalLookup.get(refId)!
        resolvedHospitalName = resolvedHospital.hospitalName
        resolvedHospitalId = resolvedHospital._id
      } else {
        const refName = nestedHospital?.hospitalName || nestedHospital?.name || ref?.hospitalName || ref?.name || ''
        if (refName) {
          const nameKey = refName.trim().toLowerCase()
          const matched = hospitalNameLookup.get(nameKey) || hospitalNameLookup.get(nameKey.trim())
          if (matched) {
            resolvedHospital = matched
            resolvedHospitalName = matched.hospitalName || matched.name || refName
            resolvedHospitalId = matched._id
          } else {
            resolvedHospitalName = refName
          }
        }
      }

      if (!resolvedBranchName) {
        resolvedBranchName = nestedHospital?.branchName || (nestedBranch?.branchName || nestedBranch?.name) || ref?.branchName || ''
      }
    }
  }

  // PASS 4: Resolve via _hospitalNames enrichment
  if ((!resolvedHospital || !resolvedHospitalName) && (doctor as any)._hospitalNames) {
    const rawHN = (doctor as any)._hospitalNames
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
    if (!resolvedHospital && !resolvedHospitalName && names[0]) {
      resolvedHospitalName = String(names[0])
    }
  }

  // PASS 5: Resolve branch and fallback hospital via branch ID.
  // The branchId is the authoritative Hospital → Branch link, so its canonical
  // branch name must override any stale denormalized `doctor.branchName`.
  if (doctor.branchId && branchToHospitalMap.has(doctor.branchId)) {
    const branchInfo = branchToHospitalMap.get(doctor.branchId)!
    if (branchInfo.branchName) resolvedBranchName = branchInfo.branchName
    if (!resolvedHospitalId || !resolvedHospitalName) {
      resolvedHospitalId = branchInfo.hospitalId
      resolvedHospitalName = branchInfo.hospitalName
      if (!resolvedHospital && hospitalLookup.has(branchInfo.hospitalId)) {
        resolvedHospital = hospitalLookup.get(branchInfo.hospitalId)!
      }
    }
  }

  // PASS 6: Resolve branch via _branchIds fallback
  if (!resolvedBranchName) {
    const branchIdsValue = (doctor as any)._branchIds
    if (branchIdsValue) {
      const branchIds = branchIdsValue instanceof Set
        ? Array.from(branchIdsValue)
        : (Array.isArray(branchIdsValue) ? branchIdsValue : [])
      for (const bid of branchIds) {
        if (!bid || !branchToHospitalMap.has(bid)) continue
        const branchInfo = branchToHospitalMap.get(bid)!
        resolvedBranchName = branchInfo.branchName
        if (!resolvedHospitalId || !resolvedHospitalName) {
          resolvedHospitalId = branchInfo.hospitalId
          resolvedHospitalName = branchInfo.hospitalName
          if (!resolvedHospital && hospitalLookup.has(branchInfo.hospitalId)) {
            resolvedHospital = hospitalLookup.get(branchInfo.hospitalId)!
          }
        }
        break
      }
    }
  }

  // Also check _branchNames for branch name if still empty
  let finalBranchName = resolvedBranchName
  const branchNamesValue = (doctor as any)._branchNames
  if ((!finalBranchName || finalBranchName === '') && branchNamesValue) {
    const branchNames = branchNamesValue instanceof Set
      ? Array.from(branchNamesValue)
      : (Array.isArray(branchNamesValue) ? branchNamesValue : [])
    if (branchNames.length > 0 && typeof branchNames[0] === 'string') {
      finalBranchName = cleanText(branchNames[0])
    }
  }

  const hospitalName = resolvedHospitalName || doctor.hospitalName || ''
  const hospitalId = resolvedHospitalId || doctor.hospitalId || ''
  const hospitalSlug = hospitalName ? generateSlug(hospitalName) : ''
  const isStandalone = resolvedHospital?.isStandalone === true
  const hasBranches = resolvedHospital &&
    Array.isArray(resolvedHospital.branches) &&
    resolvedHospital.branches.length > 0
  const hospitalLinkType = isStandalone
    ? 'hospital-branches'
    : hasBranches
      ? 'hospital-groups'
      : 'hospital-branches'
  const hospitalLogo = hospitalId ? (hospitalLogos[hospitalId] || null) : null

  // Collect branch info from multi-reference fields
  const allBranchInfo: DoctorBranchInfo[] = []
  const branchRefs = doctor.BranchesMaster_doctor || doctor.branches || []
  const refArray = Array.isArray(branchRefs) ? branchRefs : [branchRefs]
  for (const ref of refArray) {
    if (!ref) continue
    const refId = typeof ref === 'string' ? ref : (ref._id || ref.ID || '')
    const branchData = branchToHospitalMap.get(refId)
    if (branchData && !allBranchInfo.some((b) => b.branchId === refId)) {
      allBranchInfo.push({
        branchId: refId,
        branchName: branchData.branchName,
        hospitalId: branchData.hospitalId,
        hospitalName: branchData.hospitalName,
      })
    }
  }

  if (allBranchInfo.length === 0) {
    const branchIdsValue = (doctor as any)._branchIds
    if (branchIdsValue) {
      const branchIds = branchIdsValue instanceof Set
        ? Array.from(branchIdsValue)
        : (Array.isArray(branchIdsValue) ? branchIdsValue : [])
      for (const bid of branchIds) {
        if (!bid || !branchToHospitalMap.has(bid)) continue
        const branchData = branchToHospitalMap.get(bid)!
        if (!allBranchInfo.some((b) => b.branchId === bid)) {
          allBranchInfo.push({
            branchId: bid,
            branchName: branchData.branchName,
            hospitalId: branchData.hospitalId,
            hospitalName: branchData.hospitalName,
          })
        }
      }
    }
  }

  return {
    _id: doctor._id,
    doctorName: doctor.doctorName || '',
    name: doctor.doctorName || '',
    specialization: specializations,
    department: departments,
    qualification: doctor.qualification || null,
    designation: doctor.designation || null,
    experienceYears: doctor.experienceYears ?? undefined,
    profileImage: imageUrl,
    popular: doctor.popular === true,
    slug: doctor.slug || generateSlug(doctor.doctorName || ''),
    hospitalName,
    hospitalId,
    hospitalSlug,
    hospitalLinkType,
    hospitalLogo,
    branchName: finalBranchName || '',
    branchId: doctor.branchId || '',
    city: cityName,
    branchInfo: allBranchInfo.slice(0, 3),
  }
}

/**
 * Transform specialization array to string format for display
 */
export function getSpecializationString(
  specialization: DoctorCardData['specialization']
): string {
  if (!specialization) return ''
  if (typeof specialization === 'string') return specialization
  if (Array.isArray(specialization) && specialization.length > 0) {
    return specialization
      .map((s) => typeof s === 'string' ? s : (s && typeof s.name === 'string' ? s.name : ''))
      .filter(Boolean)
      .join(', ')
  }
  return ''
}

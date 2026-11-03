import { getDoctorsByTreatmentId, shouldShowHospital } from '@/lib/cms'
import type { BranchCardData, DoctorCardData } from '@/components/cards/types'
import {
  mapNormalizedLocationToBranchCard,
  transformBranch,
  transformDoctor,
  type NormalizedLocation,
} from '@/lib/services/homepage/transformers'
import type { CMSDataResponse, TreatmentData } from '@/lib/cms/types'
import { buildHospitalLookupMaps } from '@/lib/utils/doctor-utils'

export interface TreatmentPageMappedData {
  treatment: TreatmentData
  branchCards: BranchCardData[]
  doctors: DoctorCardData[]
}

function getId(value: string | undefined | null): string {
  return value?.trim() || ''
}

interface TreatmentBranchLocation {
  branchId?: string
  branchName?: string | null
  hospitalId?: string
  hospitalName?: string | null
}

function getStringValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function parseTreatmentLocation(value: unknown): TreatmentBranchLocation | null {
  if (!value) return null

  if (typeof value === 'object') {
    const location = value as Record<string, unknown>
    return {
      branchId: getId(getStringValue(location.branchId || location.branch_id || '')),
      branchName: getStringValue(location.branchName || location.branch_name),
      hospitalId: getId(getStringValue(location.hospitalId || location.hospital_id || '')),
      hospitalName: getStringValue(location.hospitalName || location.hospital_name),
    }
  }

  if (typeof value !== 'string') return null

  const text = value.trim()
  if (!text.startsWith('@{') || !text.endsWith('}')) return null

  const location: Record<string, string> = {}
  text
    .slice(2, -1)
    .split(/;\s*/)
    .filter(Boolean)
    .forEach((part) => {
      const separatorIndex = part.indexOf('=')
      if (separatorIndex === -1) return
      const key = part.slice(0, separatorIndex).trim()
      const rawValue = part.slice(separatorIndex + 1).trim()
      location[key] = rawValue === 'System.Object[]' ? '' : rawValue
    })

  return {
    branchId: getId(location.branchId),
    branchName: location.branchName || null,
    hospitalId: getId(location.hospitalId),
    hospitalName: location.hospitalName || null,
  }
}

function getTreatmentBranchLocationMap(treatment: TreatmentData) {
  return new Map(
    (treatment.branchesAvailableAt || [])
      .map(parseTreatmentLocation)
      .filter((location): location is TreatmentBranchLocation => Boolean(location?.branchId))
      .map((location) => [location.branchId as string, location])
  )
}

function enrichDoctorWithTreatmentBranch(
  doctor: DoctorCardData,
  branchLocations: Map<string, TreatmentBranchLocation>
): DoctorCardData {
  const primaryBranchId = doctor.branchId || ''
  const primaryLocation = branchLocations.get(primaryBranchId)

  const branchInfoIds = (doctor.branchInfo || [])
    .map((b) => b.branchId)
    .filter(Boolean)
  const matchingInfo = branchInfoIds
    .map((bid) => ({ bid, location: branchLocations.get(bid) }))
    .find((entry) => entry.location)

  const matchedLocation = primaryLocation || matchingInfo?.location || null
  const matchedBranchId = matchedLocation?.branchId || primaryBranchId || matchingInfo?.bid || ''

  if (matchedLocation) {
    return {
      ...doctor,
      branchId: matchedBranchId,
      branchName: matchedLocation.branchName || doctor.branchName || '',
      hospitalId: doctor.hospitalId || matchedLocation.hospitalId || '',
      hospitalName: doctor.hospitalName || matchedLocation.hospitalName || '',
    }
  }

  return doctor
}

export function getTreatmentBranchIds(treatment: TreatmentData): Set<string> {
  return new Set(
    (treatment.branchesAvailableAt || [])
      .map((branch) => getId(branch.branchId))
      .filter(Boolean)
  )
}

function getTreatmentNameKey(treatment: TreatmentData): string {
  return treatment.name.trim().toLowerCase()
}

function branchOffersTreatment(branch: any, treatment: TreatmentData): boolean {
  const treatmentId = treatment._id
  const treatmentName = getTreatmentNameKey(treatment)

  return (branch.treatments || []).some((item: any) => {
    const itemId = getId(item._id || item.ID)
    const itemName = (item.name || item.treatmentName || '').trim().toLowerCase()
    return itemId === treatmentId || itemName === treatmentName
  })
}

export function getTreatmentRelatedBranches(
  cmsData: CMSDataResponse,
  treatment: TreatmentData,
): NormalizedLocation[] {
  const branchIds = getTreatmentBranchIds(treatment)
  const branchMap = new Map<string, NormalizedLocation>()

  const addBranch = (branch: any, hospital: any) => {
    if (!branch?._id || !shouldShowHospital(branch)) return
    if (!branchMap.has(branch._id)) {
      branchMap.set(branch._id, transformBranch(branch, hospital, { computeSlug: true }))
    }
  }

  for (const hospital of cmsData.hospitals || []) {
    for (const branch of hospital.branches || []) {
      const isInBranchIds = branchIds.size > 0 && branchIds.has(branch._id)
      const offersTreatment = branchOffersTreatment(branch, treatment)
      if (isInBranchIds || offersTreatment) {
        addBranch(branch, hospital)
      }
    }
  }

  return Array.from(branchMap.values()).sort((a, b) => {
    const nameA = a.name || a.branchName || ''
    const nameB = b.name || b.branchName || ''
    return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' })
  })
}

export function mapTreatmentBranchesToCards(
  cmsData: CMSDataResponse,
  treatment: TreatmentData,
): BranchCardData[] {
  return getTreatmentRelatedBranches(cmsData, treatment).map(mapNormalizedLocationToBranchCard)
}

export function getTreatmentPageDoctors(
  cmsData: CMSDataResponse,
  treatment: TreatmentData,
): DoctorCardData[] {
  const hospitals = cmsData.hospitals || []
  const relatedDoctors = getDoctorsByTreatmentId(cmsData, treatment._id || treatment.name)

  if (!relatedDoctors.length) return []

  const branchLocations = getTreatmentBranchLocationMap(treatment)

  const hospitalLogoMap: Record<string, string | null> = {}
  if (Array.isArray(hospitals)) {
    hospitals.forEach((h) => {
      if (h._id) {
        hospitalLogoMap[h._id] = h.logoUrl || h.logo || null
      }
    })
  }

  const { hospitalLookup, hospitalNameLookup, branchToHospitalMap } =
    buildHospitalLookupMaps(hospitals)
  const seenIds = new Set<string>()

  return relatedDoctors
    .map((doctor) =>
      transformDoctor(doctor, hospitalLogoMap, hospitals, {
        showHospital: true,
        hospitalLookup,
        hospitalNameLookup,
        branchToHospitalMap,
      }),
    )
    .map((doctor) => enrichDoctorWithTreatmentBranch(doctor, branchLocations))
    .filter((doctor) => {
      if (!doctor._id || seenIds.has(doctor._id)) return false
      seenIds.add(doctor._id)
      return true
    })
}

export function mapTreatmentPageData(
  cmsData: CMSDataResponse,
  treatment: TreatmentData,
): TreatmentPageMappedData {
  return {
    treatment,
    branchCards: mapTreatmentBranchesToCards(cmsData, treatment),
    doctors: getTreatmentPageDoctors(cmsData, treatment),
  }
}

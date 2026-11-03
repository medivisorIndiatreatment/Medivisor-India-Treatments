// lib/utils/doctor-utils.ts
// Compatibility re-exports for consumers still importing from this path
// Canonical implementations are in lib/utils/doctor-card-utils.ts

import type { HospitalData, DoctorData } from "@/lib/cms/types"
import type { DoctorCardData } from "@/components/cards/types"
import { processDoctorToCard, buildHospitalLookupMaps, getSpecializationString } from './doctor-card-utils'

export { buildHospitalLookupMaps, getSpecializationString }

export function processDoctor(
  doctor: DoctorData,
  hospitalLogos: Record<string, string | null>,
  hospitalLookup: Map<string, HospitalData>,
  hospitalNameLookup: Map<string, HospitalData>,
  branchToHospitalMap: Map<string, {
    hospitalId: string
    hospitalName: string
    isStandalone: boolean
    branchName: string
  }>,
): DoctorCardData {
  return processDoctorToCard(doctor, hospitalLogos, hospitalLookup, hospitalNameLookup, branchToHospitalMap)
}
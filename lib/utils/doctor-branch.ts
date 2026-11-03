// lib/utils/doctor-branch.ts
// Centralized, type-safe branch / hospital / city resolution for doctor cards.
//
// This is the SINGLE source of truth for deriving the displayable location
// fields (hospital name, branch name, city) from any doctor-like object that
// may arrive with either fully denormalized strings, a `branchId` only, or a
// multi-reference `branchInfo` array. Previously this logic was duplicated
// across `DoctorDetailClient`, `doctor-page-helpers`, `relations.ts`,
// `doctor-card-utils.ts` and `card-utils.ts`, leading to inconsistent branch
// rendering. All card components now delegate to these helpers.

import type { DoctorCardData } from "@/components/cards/types"

/** Minimal shape any doctor record/card must satisfy to be resolved. */
export interface DoctorLocationSource {
  hospitalName?: string | null
  hospitalId?: string | null
  branchName?: string | null
  branchId?: string | null
  city?: DoctorCardData["city"] | null
  branchInfo?: DoctorCardData["branchInfo"] | null
}

/** Parsed, display-ready location fields for a doctor card. */
export interface ResolvedDoctorLocation {
  hospitalName?: string
  branchName?: string
  city?: string
  branchId?: string
  branchInfo?: DoctorCardData["branchInfo"]
}

/** Extract the first city name from the flexible city shape. */
export function firstCityName(city: DoctorCardData["city"] | null | undefined): string {
  if (!city) return ""
  if (typeof city === "string") return city.trim()
  if (Array.isArray(city)) {
    for (const c of city) {
      const name = (c as { cityName?: string; name?: string })?.cityName ||
        (c as { cityName?: string; name?: string })?.name
      if (name) return String(name).trim()
    }
  }
  return ""
}

/**
 * Resolve the canonical hospital name for a doctor.
 * Falls back to the hospital name carried on the primary branch reference so a
 * card never renders an empty hospital when only branch data is present.
 */
export function resolveDoctorHospitalName(
  doctor: DoctorLocationSource,
): string | undefined {
  const name =
    doctor.hospitalName ||
    doctor.branchInfo?.[0]?.hospitalName ||
    undefined
  return name ? name.trim() : undefined
}

/**
 * Resolve the canonical branch name for a doctor.
 *
 * Priority (authoritative Hospital → Branch link wins):
 *   1. branch resolved by `branchId` from `branchInfo`
 *   2. denormalized `branchName`
 *   3. first `branchInfo` entry
 *
 * Returns `undefined` only when no branch is known, so callers can apply their
 * own fallback instead of displaying an incorrect value.
 */
export function resolveDoctorBranchName(
  doctor: DoctorLocationSource,
): string | undefined {
  const branchId = doctor.branchId
  if (branchId && Array.isArray(doctor.branchInfo) && doctor.branchInfo.length > 0) {
    const match = doctor.branchInfo.find((b) => b.branchId === branchId)
    if (match?.branchName) return match.branchName.trim()
  }
  if (doctor.branchName) return doctor.branchName.trim()
  if (doctor.branchInfo?.[0]?.branchName) {
    return doctor.branchInfo[0].branchName.trim()
  }
  return undefined
}

/** Resolve the first displayable city string for a doctor. */
export function resolveDoctorCity(
  doctor: DoctorLocationSource,
): string {
  return firstCityName(doctor.city)
}

/**
 * Resolve every location field at once (single pass, no redundant lookups).
 * Used by card components that need hospital + branch + city together.
 */
export function resolveDoctorLocation(
  doctor: DoctorLocationSource,
): ResolvedDoctorLocation {
  return {
    hospitalName: resolveDoctorHospitalName(doctor),
    branchName: resolveDoctorBranchName(doctor),
    city: resolveDoctorCity(doctor),
    branchId: doctor.branchId ?? undefined,
    branchInfo: doctor.branchInfo ?? undefined,
  }
}

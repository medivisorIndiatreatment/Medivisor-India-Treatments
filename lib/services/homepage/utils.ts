// lib/services/homepage/utils.ts
// Shared utilities for homepage hospital/branch processing
// Extracted from PopularHospitals and HospitalBranchesCarousel to eliminate duplication

import { getWixImageUrl, getWixScaledToFillImageUrl } from '@/lib/wixMedia'
import { generateSlug } from '@/lib/slug-utils'
import { mapToDelhiNCR } from '@/lib/utils/city-utils'

/**
 * Resolves branch/hospital image URL with Wix transformations and fallbacks
 * Uses getWixImageUrl (deterministic) instead of getWixScaledToFillImageUrl
 * to avoid hydration mismatches and ensure consistent URLs across server/client.
 */
export function resolveBranchImage(branch: any, hospital?: any): string {
  const wixImage = branch.branchImage || branch.data?.branchImage || branch.image || hospital?.hospitalImage || hospital?.branchImage || undefined

  if (!wixImage) return "/placeholder.svg"

  if (typeof wixImage === 'string') {
    if (wixImage.startsWith('http://') || wixImage.startsWith('https://')) {
      return wixImage
    }
    const converted = getWixImageUrl(wixImage)
    if (converted) return converted
  } else if (typeof wixImage === 'object' && wixImage !== null) {
    const url = wixImage.url || wixImage.src || wixImage.image || ''
    if (typeof url === 'string' && url) {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
      }
      const converted = getWixImageUrl(url)
      if (converted) return converted
    }
  }

  return "/placeholder.svg"
}

/**
 * Extracts the primary specialty from various data structures
 * Handles CMS data structures: string entries, objects with name/specialty/title
 */
export function extractPrimarySpecialty(data: any, fallback = 'Multi Specialty'): string {
  const specializationData = data.specialty || data.specialities || data.specialization || data.specialist || data.data?.specialty || data.data?.specialities || data.data?.specialization || data.data?.specialist

  if (!specializationData) {
    return fallback
  }

if (Array.isArray(specializationData)) {
    if (specializationData.length === 0) return fallback


  // Handle array of specialty objects
    const first = specializationData[0]
    if (first) {
      const result =
        (first as { name?: string; specialty?: string; title?: string; specialization?: string })?.name ||
        (first as { name?: string; specialty?: string; title?: string; specialization?: string })?.specialty ||
        (first as { name?: string; specialty?: string; title?: string; specialization?: string })?.title ||
        (first as { name?: string; specialty?: string; title?: string; specialization?: string })?.specialization ||
        first
      if (result && typeof result === "string") return result
    }
    const joined = (specializationData as Array<{ name?: string }>)
      .map((s) => s?.name || s)
      .filter(Boolean)
      .join(", ")
    return joined.length > 0 ? joined : fallback
  }

  // Handle single object (not in array)
  if (typeof specializationData === 'object' && specializationData !== null) {
    const result = specializationData.name || specializationData.specialty || specializationData.title || fallback
    return result.length > 0 ? result : fallback
  }

  // Handle string directly
  if (typeof specializationData === 'string') {
    return specializationData.length > 0 ? specializationData : fallback
  }

  return fallback
}

/**
 * Extracts city information from branch/hospital data
 */
export function extractCityInfo(branch: any): { cityName: string; state: string } {
  const rawCity = branch?.city ?? branch?.data?.city ?? branch?.location ?? branch?.data?.location ?? ''
  const cityValue = Array.isArray(rawCity) ? rawCity[0] : rawCity
  const cityName = typeof cityValue === 'string'
    ? cityValue.trim()
    : cityValue && typeof cityValue === 'object'
      ? String(cityValue.cityName || cityValue.name || cityValue.city || '').trim()
      : ''
  const cityState = typeof cityValue === 'object' && cityValue
    ? cityValue.state || cityValue.stateName || cityValue.State || cityValue.stateNameRef || ''
    : branch?.state || branch?.stateName || branch?.data?.state || ''
  
  const normalizedCity = mapToDelhiNCR(cityName)
  const normalizedState = String(cityState || '').trim()
  const location = normalizedState && !normalizedCity.includes(normalizedState)
    ? `${normalizedCity}, ${normalizedState}`
    : normalizedCity
  
  return {
    cityName,
    state: location,
  }
}

/**
 * Determines if a hospital/branch should be shown based on the ShowHospital field
 * Accepts: true, 1, 'true', '1', 'yes' (case-insensitive)
 */
export function shouldShowHospital(item: any): boolean {
  const rawShowHospital =
    item.ShowHospital ??
    item.data?.ShowHospital ??
    item.showHospital ??
    item.data?.showHospital

  if (rawShowHospital === undefined || rawShowHospital === null) {
    return true
  }

  if (typeof rawShowHospital === "string") {
    const normalized = rawShowHospital.toLowerCase().trim()
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true
    }
  } else if (rawShowHospital === true || rawShowHospital === 1) {
    return true
  }
  return false
}

/**
 * Extracts numeric value with fallback handling
 */
export function extractNumeric(value: any): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseInt(value, 10) || null
  if (typeof value === 'object') return value.value || value.number || value.count || null
  return null
}

/**
 * Checks if a branch/hospital is popular
 */
export function checkPopular(branch: any, hospital?: any): boolean {
  return branch?.popular === true ||
    branch?.data?.popular === true ||
    hospital?.popular === true
}

/**
 * Generates a branch slug avoiding city duplication if already in name
 */
export function generateBranchSlug(name: string, city?: string): string {
  if (!name) return 'hospital'
  const baseSlug = generateSlug(name)
  if (city) {
    const normalizedName = name.toLowerCase().replace(/\s+/g, '')
    const normalizedCity = city.toLowerCase().replace(/\s+/g, '')
    if (!normalizedName.includes(normalizedCity)) {
      const citySlug = generateSlug(city)
      return `${baseSlug}-${citySlug}`
    }
  }
  return baseSlug
}

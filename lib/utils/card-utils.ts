/**
 * Card Utilities
 * Shared helper functions for search card components
 * Reduces code duplication across HospitalCard, DoctorCard, and TreatmentCard
 */

import { getWixImageUrl } from "@/lib/wixMedia"
import { formatCityWithState } from "@/lib/utils/city-utils"
import { generateSlug, generateBranchSlug } from "@/lib/slug-utils"

// =============================================================================
// IMAGE HELPERS
// =============================================================================

/**
 * Get proper image URL for Wix images or fallback to direct URL
 * Returns null when no image is available to prevent empty src warnings
 *
 * IMPORTANT: uses `getWixImageUrl` (deterministic) instead of
 * `getWixScaledToFillImageUrl`. The latter calls `sdk.getScaleToFillImageURL`
 * internally, which reads `target.pixelAspectRatio` from the image transform
 * context ('scaled pixels' in a pixel-ratio context). That value differs
 * between server (DPR=1, no browser context) and client (browser DPR=1.5/2/3),
 * so the same Wix media identifier can produce a *different device-ratio suffix*
 * (e.g. `.dr400x300.jpg` vs `.dr1080x720.jpg`) in the CDN URL on each side,
 * causing a React hydration mismatch on the generated `<img src="">`.
 *
 * `getWixImageUrl` only parses the media identifier and returns `{id}-md.jpg`
 * without any pixel-ratio dependency — deterministic in any execution context.
 */
export function getCardImageUrl(image?: string, _width?: number, _height?: number): string | null {
  if (!image) return null

  if (typeof image !== 'string') {
    if (typeof image === 'object' && image !== null) {
      const url = (image as any).url || (image as any).src || (image as any).image || null
      if (typeof url === 'string' && url) {
        if (url.startsWith('wix:image://')) {
          return getWixImageUrl(url) || null
        }
        if (url.startsWith('http')) {
          return url
        }
        return url
      }
    }
    return null
  }

  if (image.startsWith("wix:image://")) {
    return getWixImageUrl(image) || null
  }
  if (image.startsWith("http")) {
    return image
  }
  return image
}

/**
 * Get logo URL for hospital cards
 * Returns null when no logo is available
 */
export function getCardLogoUrl(logo?: string): string | null {
  if (!logo) return null
  if (logo.startsWith("wix:image://")) {
    return getWixImageUrl(logo) || null
  }
  if (logo.startsWith("http")) {
    return logo
  }
  return logo
}

/**
 * Get accreditation image URL
 * Returns null when no accreditation is available
 */
export function getAccreditationUrl(
  accreditation?: { _id: string; image?: string; title?: string; logo?: string }[]
): string | null {
  if (!accreditation || !accreditation.length) return null
  const firstAcc = accreditation[0]
  const accImage = firstAcc?.logo || firstAcc?.image || ""
  if (!accImage) return null
  if (accImage.startsWith("wix:image://")) {
    return getWixImageUrl(accImage) || null
  }
  if (accImage.startsWith("http")) {
    return accImage
  }
  return accImage
}

// =============================================================================
// CITY HELPERS
// =============================================================================

/**
 * Get city name from various city data formats
 */
export function getCardCityName(city: unknown): string {
  if (!city) return ""
  if (typeof city === "string") return city
  if (Array.isArray(city)) {
    return city.map((c) => getCardCityName(c)).filter(Boolean).join(", ")
  }
  return (city as { cityName?: string; name?: string }).cityName || (city as { name?: string }).name || ""
}

/**
 * Get city with state formatted properly (includes Delhi NCR mapping)
 */
export function getCardCityWithState(city: unknown): string {
  if (!city) return ""
  let cityName = ""
  let state = ""

  if (Array.isArray(city) && city.length > 0) {
    const firstCity = city[0] as { cityName?: string; name?: string; state?: string; State?: string }
    cityName = firstCity?.cityName || firstCity?.name || ""
    state = firstCity?.state || firstCity?.State || ""
  } else if (typeof city === "object") {
    const c = city as { cityName?: string; name?: string; state?: string; State?: string }
    cityName = c.cityName || c.name || ""
    state = c.state || c.State || ""
  } else if (typeof city === "string") {
    cityName = city
  }

  return formatCityWithState(cityName, state)
}

// =============================================================================
// SPECIALTY HELPERS
// =============================================================================

/**
 * Get specialty string from various specialty data formats
 */
export function getCardSpecialty(specialty: unknown): string {
  if (!specialty || (Array.isArray(specialty) && specialty.length === 0)) return ""

  // Handle array of specialty objects
  if (Array.isArray(specialty)) {
    const firstSpecialty = specialty[0]
    if (firstSpecialty) {
      const result =
        (firstSpecialty as { name?: string; specialty?: string; title?: string; specialization?: string })?.name ||
        (firstSpecialty as { name?: string; specialty?: string; title?: string; specialization?: string })?.specialty ||
        (firstSpecialty as { name?: string; specialty?: string; title?: string; specialization?: string })?.title ||
        (firstSpecialty as { name?: string; specialty?: string; title?: string; specialization?: string })?.specialization ||
        firstSpecialty
      if (result && typeof result === "string") return result
    }
    return (specialty as Array<{ name?: string }>)
      .map((s) => s?.name || s)
      .filter(Boolean)
      .join(", ")
  }

  // Handle string
  if (typeof specialty === "string") return specialty

  // Handle object
  const s = specialty as { name?: string; specialty?: string; title?: string }
  return s.name || s.specialty || s.title || ""
}

// =============================================================================
// BRANCH HELPERS
// =============================================================================

// Centralized branch / hospital / city resolution now lives in
// `@/lib/utils/doctor-branch`. These re-exports keep existing callers working
// while all new code should import directly from that module.
export {
  resolveDoctorBranchName as getDoctorBranchName,
  resolveDoctorHospitalName,
  resolveDoctorCity,
  resolveDoctorLocation,
  firstCityName,
} from "@/lib/utils/doctor-branch"


/**
 * Generate proper slug for branch/hospital links
 */
export function getCardBranchSlug(
  branchName: string,
  city?: string
): string {
  if (!branchName || typeof branchName !== "string") return "hospital"

  if (city && typeof city === "string") {
    const normalizedBranchName = branchName.toLowerCase().replace(/\s+/g, "")
    const normalizedCityName = city.toLowerCase().replace(/\s+/g, "")
    if (normalizedBranchName.includes(normalizedCityName)) {
      return generateSlug(branchName) || "hospital"
    }
    return generateSlug(`${branchName} ${city}`) || "hospital"
  }
  return generateSlug(branchName) || "hospital"
}

/**
 * Generate slug for doctor links - clean SEO-friendly (no ID suffix)
 */
export function getCardDoctorSlug(name: string, _id?: string): string {
  // Use clean slug generation without ID suffix for SEO-friendly URLs
  return generateSlug(name) || "doctor"
}

/**
 * Generate slug for treatment links - uses centralized generateSlug
 */
export function getCardTreatmentSlug(name: string): string {
  return generateSlug(name) || "treatment"
}

// =============================================================================
// NUMBER FORMAT HELPERS
// =============================================================================

/**
 * Convert numeric fields to display format
 */
export function formatNumberValue(
  value: string | number | null | undefined
): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === "number") return value
  const parsed = parseInt(value as string, 10)
  return isNaN(parsed) ? null : parsed
}
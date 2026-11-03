/**
 * lib/slug-utils.ts
 * Reusable slug generation and mapping utilities for CMS entities
 */

/**
 * Strip ID suffix from a slug (handles both with and without hyphen)
 * Examples:
 *   "bmt-specialist-15fa32" -> "bmt-specialist"
 *   "cataract-surgeon-a1b2c3" -> "cataract-surgeon"
 *   "heart-doctor" -> "heart-doctor"
 */
export function cleanSlug(slug: string): string {
  if (!slug) return ''

  // Remove trailing hyphen followed by 6+ hex characters (ID suffix)
  // Matches patterns like "-15fa32", "-a1b2c3d4", etc.
  const cleaned = slug.replace(/-[a-f0-9]{6,}$/i, '')

  // Also remove any trailing ID without hyphen (just in case)
  // But only if it's at the end and is 6+ hex chars
  const final = cleaned.replace(/[a-f0-9]{6,}$/i, '')

  // Remove any trailing hyphens left over
  return final.replace(/-+$/, '')
}

/**
 * Generate a URL-friendly slug from a name
 * Handles special characters ((), /, &, |, etc.), multiple spaces, and case
 * Produces consistent lowercase hyphenated slugs
 */
export function generateSlug(name: string | null | undefined): string {
  if (typeof name !== 'string') return ''
  if (!name) return ''

  return name
    .toLowerCase()
    .trim()
    .replace(/[\[\]&/\\#,+()$~%.'":*?<>{}|]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Generate a unique slug combining name and ID for disambiguation
 */
export function generateUniqueSlug(name: string | null | undefined, id?: string): string {
  const baseSlug = generateSlug(name)
  if (id) {
    return `${baseSlug}-${id.slice(-6)}`
  }
  return baseSlug
}

/**
 * Parse a slug back to its components (for debugging/reverse lookup)
 */
export function parseSlug(slug: string): { name: string; id?: string } {
  const parts = slug.split('-')
  if (parts.length > 1 && /^[a-f0-9]{6,}$/i.test(parts[parts.length - 1])) {
    const id = parts.pop()
    return {
      name: parts.join('-'),
      id
    }
  }
  return { name: slug }
}

/**
 * Check if two slugs match (considering URL decoding)
 */
export function slugsMatch(slug1: string, slug2: string): boolean {
  return decodeURIComponent(slug1.toLowerCase()) === decodeURIComponent(slug2.toLowerCase())
}

/**
 * Find a matching branch from a slug
 * Searches by exact slug match or generated slug
 * Handles both old format (without city) and new format (with city)
 */
export function findBranchBySlug<T extends {
  _id?: string
  branchName?: string
  name?: string
  slug?: string
  city?: { cityName?: string; name?: string }[]
  cityName?: string
  data?: { city?: { cityName?: string; name?: string }[]; cityName?: string }
}>(
  branches: T[],
  slug: string
): T | undefined {
  const normalizedSlug = slug.toLowerCase()
return branches.find(branch => {
    const branchName = branch.branchName || branch.name

    // Handle various city name patterns: cityName, name, nested data, and direct cityName
    const firstCity = branch.city?.[0]
    const cityFromData = branch.data?.city?.[0]
    const cityName =
      firstCity?.cityName ||
      firstCity?.name ||
      cityFromData?.cityName ||
      cityFromData?.name ||
      branch.cityName ||
      branch.data?.cityName ||
      ''

    // Direct slug match
    if (branch.slug && generateSlug(branch.slug) === normalizedSlug) {
      return true
    }
    // Match by branchName (old format without city)
    if (branchName && generateSlug(branchName) === normalizedSlug) {
      return true
    }
    // Match by name (fallback)
    if (branch.name && generateSlug(branch.name) === normalizedSlug) {
      return true
    }
    // Match by branchName with city (new format)
if (branchName && cityName && generateBranchSlug(branchName, cityName) === normalizedSlug) {
      return true
    }
    // Try remaining cities in the branch's city array (not just the first one)
    if (branchName) {
      const allCities: string[] = []
      if (Array.isArray(branch.city)) {
        for (const city of branch.city) {
          const cName = (city as any)?.cityName || (city as any)?.name || ''
          if (cName) allCities.push(cName)
        }
      }
      if (Array.isArray(branch.data?.city)) {
        for (const city of branch.data.city) {
          const cName = (city as any)?.cityName || (city as any)?.name || ''
          if (cName) allCities.push(cName)
        }
      }
      // Try cities starting from index 1 (first city already tried above)
      for (let i = 1; i < allCities.length; i++) {
        if (generateBranchSlug(branchName, allCities[i]) === normalizedSlug) {
          return true
        }
      }
    }
     // Match by ID suffix (for unique slugs)

    if (branchName && cityName && generateSlug(`${branchName} ${cityName}`) === normalizedSlug) {
    const parts = normalizedSlug.split('-')
    if (parts.length > 1) {
      const potentialId = parts[parts.length - 1]
      if (branch._id && branch._id.endsWith(potentialId)) {
        return true
      }
    }
  }

    // Fallback: fuzzy match — slug starts with branch name slug and contains
    // at least one city name (handles slugs generated from a prior data state
    // where the branch name or city composition was different)
    if (branchName) {
      const nameSlug = generateSlug(branchName)
      if (nameSlug && normalizedSlug.startsWith(nameSlug + '-')) {
        const remaining = normalizedSlug.slice(nameSlug.length + 1)
        if (remaining) {
          const allCityNames: string[] = []
          if (Array.isArray(branch.city)) {
            for (const city of branch.city) {
              const cName = (city as any)?.cityName || (city as any)?.name || ''
              if (cName) allCityNames.push(cName)
            }
          }
          if (allCityNames.length > 0) {
            const citySlugs = allCityNames.map(c => generateSlug(c))
            const remainingParts = remaining.split('-')
            if (remainingParts.some(part => citySlugs.includes(part))) {
              return true
            }
          }
        }
      }
    }
    return false
  })
}

/**
 * Get all unique slugs from a list of branches
 * Includes both old format (without city) and new format (with city)
 */
export function getAllBranchSlugs<T extends {
  _id?: string
  branchName?: string
  name?: string
  city?: { cityName?: string }[]
}>(
  branches: T[]
): string[] {
  const slugSet = new Set<string>()
  
  branches.forEach(branch => {
    const name = branch.branchName || branch.name
    const cityName = branch.city?.[0]?.cityName
    
    if (name) {
const branchSlug = generateBranchSlug(name, cityName)
      // Add slug without city (old format)
      slugSet.add(generateSlug(name))
      // Add canonical slug with city
      if (cityName) {
        slugSet.add(branchSlug)

      // Add slug with city (new format)
        slugSet.add(generateSlug(`${name} ${cityName}`))
      }
      // Also add unique slug with ID
      if (branch._id) {
        slugSet.add(generateUniqueSlug(name, branch._id))
        if (cityName) {
slugSet.add(`${branchSlug}-${branch._id.slice(-6)}`)

          slugSet.add(generateUniqueSlug(`${name} ${cityName}`, branch._id))
        }
      }
    }
  })
  
  return Array.from(slugSet)
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

/**
 * Normalize slug for comparison
 */
export function normalizeSlug(slug: string): string {
  return generateSlug(decodeURIComponent(slug))
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

/**
 * Find a matching treatment from a slug
 * Searches by exact slug match or generated slug
 */
export function findTreatmentBySlug<T extends {
  _id?: string
  name?: string
  slug?: string
}>(
  treatments: T[],
  slug: string
): T | undefined {
  const normalizedSlug = slug.toLowerCase()
  const cleanedSlug = cleanSlug(slug).toLowerCase()
  
  return treatments.find(treatment => {
    const treatmentSlug = treatment.slug ? generateSlug(treatment.slug) : ''
    const cleanTreatmentSlug = treatment.slug ? generateSlug(cleanSlug(treatment.slug)) : ''
    
    // Match by stored slug, cleaned stored slug, or generated name slug
    if (
      treatmentSlug === normalizedSlug ||
      cleanTreatmentSlug === normalizedSlug ||
      cleanTreatmentSlug === cleanedSlug
    ) {
      return true
    }
    if (treatment.name && generateSlug(treatment.name) === normalizedSlug) {
      return true
    }
    // Match by ID suffix (for unique slugs)
    const parts = normalizedSlug.split('-')
    if (parts.length > 1) {
      const potentialId = parts[parts.length - 1]
      if (treatment._id && treatment._id.endsWith(potentialId)) {
        return true
      }
    }
    return false
  })
}

/**
 * Find a matching hospital from a slug
 * Searches by exact slug match or generated slug
 */
export function findHospitalBySlug<T extends {
  _id?: string
  hospitalName?: string
  name?: string
}>(
  hospitals: T[],
  slug: string
): T | undefined {
  const normalizedSlug = slug.toLowerCase()
  
  return hospitals.find(hospital => {
    // Match by hospitalName
    if (hospital.hospitalName && generateSlug(hospital.hospitalName) === normalizedSlug) {
      return true
    }
    // Match by name (fallback)
    if (hospital.name && generateSlug(hospital.name) === normalizedSlug) {
      return true
    }
    // Match by ID suffix (for unique slugs)
    const parts = normalizedSlug.split('-')
    if (parts.length > 1) {
      const potentialId = parts[parts.length - 1]
      if (hospital._id && hospital._id.endsWith(potentialId)) {
        return true
      }
    }
    return false
  })
}

/**
 * Find a matching doctor from a slug
 * Searches by exact slug match or generated name slug
 */
export function findDoctorBySlug<T extends {
  _id?: string
  doctorName?: string
  name?: string
  slug?: string
}>(
  doctors: T[],
  slug: string
): T | undefined {
  const normalizedSlug = slug.toLowerCase()
  const cleanedSlug = cleanSlug(slug).toLowerCase()

  return doctors.find(doctor => {
    const doctorSlug = doctor.slug ? generateSlug(doctor.slug) : ''
    const cleanDoctorSlug = doctor.slug ? generateSlug(cleanSlug(doctor.slug)) : ''

    if (
      doctorSlug === normalizedSlug ||
      cleanDoctorSlug === normalizedSlug ||
      cleanDoctorSlug === cleanedSlug
    ) {
      return true
    }

    const doctorName = doctor.doctorName || doctor.name || ''
    if (doctorName && generateSlug(doctorName) === normalizedSlug) {
      return true
    }

    const parts = normalizedSlug.split('-')
    if (parts.length > 1) {
      const potentialId = parts[parts.length - 1]
      if (doctor._id && doctor._id.endsWith(potentialId)) {
        return true
      }
    }
    return false
  })
}

/**
 * Find a matching technology from a slug
 * Searches by exact slug match or generated name slug
 */
export function findTechnologyBySlug<T extends {
  _id?: string
  heading?: string
  name?: string
}>(
  technologies: T[],
  slug: string
): T | undefined {
  const normalizedSlug = slug.toLowerCase()
  
  return technologies.find(technology => {
    // Match by heading (primary name field for technology)
    if (technology.heading && generateSlug(technology.heading) === normalizedSlug) {
      return true
    }
    // Match by name (fallback)
    if (technology.name && generateSlug(technology.name) === normalizedSlug) {
      return true
    }
    // Match by ID suffix (for unique slugs)
    const parts = normalizedSlug.split('-')
    if (parts.length > 1) {
      const potentialId = parts[parts.length - 1]
      if (technology._id && technology._id.endsWith(potentialId)) {
        return true
      }
    }
    return false
  })
}

/**
 * Find a matching TestDiagnosis from a slug
 * Searches by exact slug match or generated name slug
 */
export function findTestDiagnosisBySlug<T extends {
  _id?: string
  name?: string
  slug?: string
}>(
  testDiagnoses: T[],
  slug: string
): T | undefined {
  const normalizedSlug = slug.toLowerCase()
  const cleanedSlug = cleanSlug(slug).toLowerCase()

  return testDiagnoses.find(testDiagnosis => {
    const testDiagnosisSlug = testDiagnosis.slug ? generateSlug(testDiagnosis.slug) : ''
    const cleanTestDiagnosisSlug = testDiagnosis.slug ? generateSlug(cleanSlug(testDiagnosis.slug)) : ''

    if (
      testDiagnosisSlug === normalizedSlug ||
      cleanTestDiagnosisSlug === normalizedSlug ||
      cleanTestDiagnosisSlug === cleanedSlug
    ) {
      return true
    }
    if (testDiagnosis.name && generateSlug(testDiagnosis.name) === normalizedSlug) {
      return true
    }
    const parts = normalizedSlug.split('-')
    if (parts.length > 1) {
      const potentialId = parts[parts.length - 1]
      if (testDiagnosis._id && testDiagnosis._id.endsWith(potentialId)) {
        return true
      }
    }
    return false
  })
}

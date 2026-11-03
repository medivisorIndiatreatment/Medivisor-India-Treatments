/**
 * lib/slug-resolver.ts
 * High-performance slug resolution with pre-computed slug maps
 * Eliminates O(n) lookups and provides instant slug matching
 */

import { getAllCMSData } from '@/lib/cms'
import { generateSlug, generateBranchSlug } from '@/lib/slug-utils'
import type { CMSDataResponse, HospitalData, BranchData, TreatmentData, SpecialistData, DepartmentData } from '@/lib/cms/types'

// Type definitions for slug mappings
export interface SlugEntry {
  type: 'hospital' | 'branch' | 'treatment' | 'specialist' | 'department'
  id: string
  slug: string
  canonicalSlug?: string // The preferred/correct URL slug
  entity: any
}

export interface SlugResolutionResult {
  found: boolean
  type?: 'hospital' | 'branch' | 'treatment' | 'specialist' | 'department'
  id?: string
  redirectUrl?: string
  entity?: any
}

// In-memory cache for slug mappings
let slugMapCache: Map<string, SlugEntry> | null = null
let slugMapLastUpdated = 0
let slugMapPromise: Promise<Map<string, SlugEntry>> | null = null
const CACHE_TTL = 5 * 60 * 1000

/**
 * Build a comprehensive slug map from CMS data
 * This is computed once and cached for subsequent requests
 */
async function buildSlugMap(): Promise<Map<string, SlugEntry>> {
  const now = Date.now()
  
  // Return cached map if still valid
  if (slugMapCache && (now - slugMapLastUpdated) < CACHE_TTL) {
    return slugMapCache
  }

  if (slugMapPromise) return slugMapPromise

  slugMapPromise = (async () => {
    const newSlugMap = new Map<string, SlugEntry>()
    try {
    const cmsData: CMSDataResponse = await getAllCMSData()
    
    // Map hospitals
    for (const hospital of cmsData.hospitals) {
      const hospitalData = hospital as unknown as HospitalData
      const hospitalName = hospitalData.hospitalName
      if (hospitalName) {
        const slug = generateSlug(hospitalName)
        const id = hospitalData._id
        
        newSlugMap.set(slug, {
          type: 'hospital',
          id,
          slug,
          canonicalSlug: slug,
          entity: hospital,
        })

        // Also add ID-based slug for disambiguation
        if (id) {
          const uniqueSlug = `${slug}-${id.slice(-6)}`
          newSlugMap.set(uniqueSlug, {
            type: 'hospital',
            id,
            slug: uniqueSlug,
            canonicalSlug: slug,
            entity: hospital,
          })
        }
      }

      // Map branches within each hospital
      if (hospitalData.branches && Array.isArray(hospitalData.branches)) {
        for (const branch of hospitalData.branches) {
          const branchData = branch as unknown as BranchData
          const branchName = branchData.branchName
          if (branchName) {
            const cityName = branchData.city?.[0]?.cityName
            let branchSlug = generateBranchSlug(branchName, cityName)
            // Only add city to slug if not already present in branch name
            if (cityName && !branchName.toLowerCase().includes(cityName.toLowerCase())) {
              branchSlug = generateSlug(`${branchName} ${cityName}`)
            }
            
            const branchId = branchData._id
            
            newSlugMap.set(branchSlug, {
              type: 'branch',
              id: branchId,
              slug: branchSlug,
              canonicalSlug: branchSlug,
              entity: { ...branch, hospitalId: hospitalData._id, hospitalName: hospitalData.hospitalName },
            })

            // Add unique slug with ID
            if (branchId) {
              const uniqueSlug = `${branchSlug}-${branchId.slice(-6)}`
              newSlugMap.set(uniqueSlug, {
                type: 'branch',
                id: branchId,
                slug: uniqueSlug,
                canonicalSlug: branchSlug,
                entity: { ...branch, hospitalId: hospitalData._id, hospitalName: hospitalData.hospitalName },
              })
            }
          }
        }
      }
    }

    // Map treatments
    for (const treatment of cmsData.treatments) {
      const treatmentData = treatment as unknown as TreatmentData
      const treatmentName = treatmentData.name
      if (treatmentName) {
        const slug = generateSlug(treatmentName)
        const id = treatmentData._id
        
        newSlugMap.set(slug, {
          type: 'treatment',
          id,
          slug,
          canonicalSlug: slug,
          entity: treatment,
        })

        // Add unique slug with ID
        if (id) {
          const uniqueSlug = `${slug}-${id.slice(-6)}`
          newSlugMap.set(uniqueSlug, {
            type: 'treatment',
            id,
            slug: uniqueSlug,
            canonicalSlug: slug,
            entity: treatment,
          })
        }
      }
    }

    // Map specialists (from specialistWithBranch if available)
    if (cmsData.specialistWithBranch) {
      for (const specialist of cmsData.specialistWithBranch) {
        const specialistName = specialist.name
        if (specialistName) {
          const slug = generateSlug(specialistName)
          const id = specialist._id
          
          newSlugMap.set(slug, {
            type: 'specialist',
            id,
            slug,
            canonicalSlug: slug,
            entity: specialist,
          })

          // Add unique slug with ID
          if (id) {
            const uniqueSlug = `${slug}-${id.slice(-6)}`
            newSlugMap.set(uniqueSlug, {
              type: 'specialist',
              id,
              slug: uniqueSlug,
              canonicalSlug: slug,
              entity: specialist,
            })
          }
        }
      }
    }

    // Update cache
    slugMapCache = newSlugMap
    slugMapLastUpdated = now
    

    } catch (error) {
      console.error('[SlugResolver] Error building slug map:', error)
      return slugMapCache ?? newSlugMap
    } finally {
      slugMapPromise = null
    }

    return newSlugMap
  })()

  return slugMapPromise
}

/**
 * Resolve a slug to its entity with O(1) lookup
 * Returns the entity and metadata if found
 */
export async function resolveSlug(slug: string): Promise<SlugResolutionResult> {
  const normalizedSlug = generateSlug(decodeURIComponent(slug))
  
  try {
    const slugMap = await buildSlugMap()
    
    // Direct O(1) lookup
    const entry = slugMap.get(normalizedSlug)
    
    if (!entry) {
      return { found: false }
    }

    // Check if we need to redirect to canonical slug
    const needsRedirect = entry.slug !== entry.canonicalSlug
    
    return {
      found: true,
      type: entry.type,
      id: entry.id,
      redirectUrl: needsRedirect ? undefined : undefined, // Will be handled by middleware
      entity: entry.entity,
    }
  } catch (error) {
    console.error('[SlugResolver] Error resolving slug:', error)
    return { found: false }
  }
}

/**
 * Check if a slug is canonical (correct URL)
 * If not, returns the correct URL to redirect to
 */
export async function getCanonicalUrl(slug: string, basePath: string): Promise<string | null> {
  const normalizedSlug = generateSlug(decodeURIComponent(slug))
  
  try {
    const slugMap = await buildSlugMap()
    const entry = slugMap.get(normalizedSlug)
    
    if (!entry) {
      return null // Slug not found
    }

    // If current slug is not canonical, return the canonical URL
    if (entry.slug !== entry.canonicalSlug) {
      return `${basePath}/${entry.canonicalSlug}`
    }

    return null // No redirect needed
  } catch (error) {
    console.error('[SlugResolver] Error getting canonical URL:', error)
    return null
  }
}

/**
 * Resolve hospital group slug
 */
export async function resolveHospitalSlug(slug: string): Promise<SlugResolutionResult> {
  const result = await resolveSlug(slug)
  
  if (result.found && result.type === 'hospital') {
    return result
  }
  
  return { found: false }
}

/**
 * Resolve hospital branch slug
 */
export async function resolveBranchSlug(slug: string): Promise<SlugResolutionResult> {
  const result = await resolveSlug(slug)
  
  if (result.found && result.type === 'branch') {
    return result
  }
  
  return { found: false }
}

/**
 * Resolve treatment slug
 */
export async function resolveTreatmentSlug(slug: string): Promise<SlugResolutionResult> {
  const result = await resolveSlug(slug)
  
  if (result.found && result.type === 'treatment') {
    return result
  }
  
  return { found: false }
}

/**
 * Pre-warm the slug cache
 * Call this during app initialization or in getStaticProps
 */
export async function warmSlugCache(): Promise<void> {
  await buildSlugMap()
}

/**
 * Get slug map statistics (for debugging)
 */
export function getSlugMapStats(): { size: number; lastUpdated: number; age: number } | null {
  if (!slugMapCache) return null
  
  return {
    size: slugMapCache.size,
    lastUpdated: slugMapLastUpdated,
    age: Date.now() - slugMapLastUpdated,
  }
}

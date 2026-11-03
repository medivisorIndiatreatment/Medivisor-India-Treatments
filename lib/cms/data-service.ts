// lib/cms/data-service.ts
// Main CMS data service - orchestrates fetching, mapping, and caching
// Optimized for performance with proper error handling and minimal duplication

import { cache } from 'react'
import { memoryCache, CACHE_CONFIG } from './cache'
import type { CMSDataResponse, DoctorData, WixItem, TreatmentData } from './types'
import {
  fetchAllBranches,
  fetchAllHospitals,
  fetchAllTreatments,
  fetchAllCities,
  fetchAllSpecialists,
  fetchAllDoctors,
  fetchAllDepartments,
  fetchAllStates,
  fetchAllSubDepartments,
  fetchByIds,
  fetchSpecialistWithTreatments,
  COLLECTIONS,
} from './fetchers'
import {
  mapHospital,
  mapCityWithStateRef,
  mapBranch,
  mapTreatment,
  mapDoctor,
  mapDepartment,
  extractIds,
} from './mappers'
import { generateSlug } from '@/lib/slug-utils'
import { DELHI_NCR_CITIES } from '@/lib/utils/city-utils'
import type { TreatmentLocation } from './types'
import { fetchDepartmentsFromWix, fetchSubDepartmentsFromWix, fetchTreatmentsFromWix, buildDepartmentHierarchy } from '@/lib/services/departments'


// =============================================================================
// SPECIALTY TREATMENT ALIASES
// Used to link specialist specialties to specific treatments
// =============================================================================
const SPECIALTY_TREATMENT_ALIASES: Readonly<Record<string, readonly string[]>> = Object.freeze({
  ophthalmology: ['cataract', 'lasik', 'retina', 'cornea', 'glaucoma', 'eye surgery', 'eye treatment'],
  cardiology: ['heart', 'cardiac', 'bypass', 'angioplasty', 'heart surgery'],
  orthopedics: ['bone', 'joint', 'knee', 'hip', 'spine', 'orthopedic', 'fracture'],
  neurology: ['brain', 'neural', 'spine surgery', 'neuro'],
  oncology: ['cancer', 'tumor', 'chemotherapy', 'radiation therapy'],
  gastroenterology: ['stomach', 'digestive', 'liver', 'gastro', 'intestine'],
  dermatology: ['skin', 'hair', 'cosmetic dermatology'],
  urology: ['urinary', 'kidney', 'bladder'],
  ent: ['ear', 'nose', 'throat', 'sinus'],
  pediatrics: ['child', 'children', 'pediatric'],
  gynecology: ['pregnancy', 'maternity', 'women health', 'obstetrics'],
  psychiatry: ['mental', 'psychological', 'depression', 'anxiety'],
  dentistry: ['dental', 'tooth', 'teeth', 'cavity'],
  'plastic surgery': ['cosmetic', 'reconstructive', 'aesthetic'],
})

// =============================================================================
// MAIN DATA ORCHESTRATOR
// =============================================================================

// =============================================================================
// INTERNAL IMPLEMENTATION (uncached)
// =============================================================================

/**
 * Internal uncached implementation of getAllCMSData.
 * This contains the actual fetching and enrichment logic.
 */
/**
 * Race a promise against a timeout. If the timeout wins, the wrapped promise
 * rejects with a descriptive error (which `Promise.allSettled` captures as a
 * rejected result) so the rest of the batch is unaffected. A no-op catch on the
 * inner promise prevents late rejections from becoming unhandled.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} fetch timed out after ${ms}ms`)),
      ms,
    )
  })
  promise.catch(() => {})
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer)
  })
}

async function _getAllCMSDataImpl(noCache = false): Promise<CMSDataResponse> {
  const cacheKey = 'cms_all_data'

  if (!noCache) {
    const cached = memoryCache.get<CMSDataResponse>(cacheKey)
    if (cached) return cached
  }

  const load = async () => {
      // Initialize with safe defaults in case all fetches fail
      let rawHospitals: WixItem[] = []
      let rawBranches: WixItem[] = []
      let rawTreatments: WixItem[] = []
      let rawCities: WixItem[] = []
      let rawSpecialists: WixItem[] = []
      let rawDoctors: WixItem[] = []
      let rawDepartments: WixItem[] = []
      let rawStates: WixItem[] = [] as any
      let rawSubDepartments: WixItem[] = []

       // Fetch all base data in parallel with robust error handling.
       // Each collection is time-boxed INDIVIDUALLY (withTimeout) so a single
       // slow/hanging Wix query can never block the others or abort the whole
       // payload. Previously a single 40s race rejected and discarded EVERY
       // result (the "getAllCMSData timed out after 40s" error); now every
       // collection is awaited and only the ones that actually exceed the cap
       // fall back to an empty array.
        try {
          // A page request should not hold a Vercel function for three minutes
          // while one CMS collection is unavailable. Other collections still
          // resolve independently through allSettled.
          const PER_FETCH_TIMEOUT_MS = 45000

          const fetchPromise = Promise.allSettled([
            withTimeout(fetchAllHospitals(), PER_FETCH_TIMEOUT_MS, 'hospitals'),
            withTimeout(fetchAllBranches(true), PER_FETCH_TIMEOUT_MS, 'branches'),
            withTimeout(fetchAllTreatments(), PER_FETCH_TIMEOUT_MS, 'treatments'),
            withTimeout(fetchAllCities(), PER_FETCH_TIMEOUT_MS, 'cities'),
            withTimeout(fetchAllSpecialists(), PER_FETCH_TIMEOUT_MS, 'specialists'),
            withTimeout(fetchAllDoctors(), PER_FETCH_TIMEOUT_MS, 'doctors'),
            withTimeout(fetchAllDepartments(), PER_FETCH_TIMEOUT_MS, 'departments'),
            withTimeout(fetchAllStates(), PER_FETCH_TIMEOUT_MS, 'states'),
            withTimeout(fetchAllSubDepartments(), PER_FETCH_TIMEOUT_MS, 'subDepartments'),
          ])

         const results = (await fetchPromise) as PromiseSettledResult<any[]>[]

        // Process each result, defaulting to empty array on failure
        const safeGet = (result: PromiseRejectedResult | PromiseFulfilledResult<any[]>) => {
          if (result?.status === 'fulfilled' && result.value) return result.value
          return []
        }

        rawHospitals = safeGet(results[0] as any)
        rawBranches = safeGet(results[1] as any)
        rawTreatments = safeGet(results[2] as any)
        rawCities = safeGet(results[3] as any)
        rawSpecialists = safeGet(results[4] as any)
        rawDoctors = safeGet(results[5] as any)
        rawDepartments = safeGet(results[6] as any)
        rawStates = safeGet(results[7] as any) || ([] as any)
        rawSubDepartments = safeGet(results[8] as any)
       } catch (error) {
         console.error('Error in getAllCMSData parallel fetch:', error)
       }

    // Build lookup maps for efficient access
    const citiesMap = new Map<string, any>()
    const departmentsMap = new Map<string, any>()
    const statesMap = rawStates as unknown as Record<string, { _id: string; name: string }>

    for (const dept of rawDepartments) {
      const deptData = mapDepartment(dept)
      if (deptData._id) {
        departmentsMap.set(deptData._id, deptData)
      }
    }

    const cities: WixItem[] = (rawCities as unknown as WixItem[]) || []
    for (const city of cities) {
      if (city._id) {
        citiesMap.set(city._id, mapCityWithStateRef(city, statesMap))
      }
    }

    // Build specialist → treatment mapping
    const specialistTreatmentMap = new Map<string, Set<string>>()
    const treatmentNameToId = new Map<string, string>()

    for (const item of rawTreatments) {
      const id = item._id ?? item.ID
      const name = getValue(item, 'treatmentName', 'Treatment Name', 'title', 'name')
      if (id && name) {
        treatmentNameToId.set(name.toLowerCase(), id as string)
      }
    }

    for (const spec of rawSpecialists) {
      const specId = spec._id ?? spec.ID
      if (!specId) continue

      const specName = ((spec.name as string) ?? (spec.specialty as string) ?? (spec.Specialty as string) ?? '').toLowerCase()
      // Extract treatments from specialist - handle multiple possible field names
      const treatments = spec.TreatmentMaster_specialistMap
        ?? spec.treatment
        ?? spec.Treatment
        ?? spec.data?.treatment
        ?? []
      const treatmentArray = Array.isArray(treatments) ? treatments : [treatments].filter(Boolean)

      const allTreatments = [...treatmentArray]
      const treatmentIds = new Set<string>()

      for (const t of allTreatments) {
        const tid = (t as { _id?: string })?._id ?? (t as { ID?: string })?.ID ?? t
        if (tid) treatmentIds.add(tid as string)

        const tname = (t as { treatmentName?: string })?.treatmentName ?? (t as { name?: string })?.name ?? (t as { title?: string })?.title
        if (tname) {
          const masterId = treatmentNameToId.get(tname.toLowerCase())
          if (masterId) treatmentIds.add(masterId)
        }
      }

      const aliases = SPECIALTY_TREATMENT_ALIASES[specName] ?? []
      for (const alias of aliases) {
        const treatmentId = treatmentNameToId.get(alias.toLowerCase())
        if (treatmentId) treatmentIds.add(treatmentId)
      }

      specialistTreatmentMap.set(specId, treatmentIds)
    }

    // =============================================================================
    // BUILD SUBDEPARTMENT → BRANCH MAPPING
    // =============================================================================
    // Treatment → subDepartment_treatment → SubDepartment → BranchesMaster_subDepartment → Branch
    const subDeptBranchMap = new Map<string, Set<string>>()

    for (const subDept of rawSubDepartments) {
      const subDeptId = subDept._id ?? subDept.ID
      if (!subDeptId) continue

      // Check all possible field name variations for branch references
      const branchRefs = subDept.BranchesMaster_subDepartment
        || subDept.branchesMasterSubDepartment
        || subDept.branches
        || subDept.branch
        || []
      const branchIds = Array.isArray(branchRefs)
        ? branchRefs.map((b: any) => b?._id || b?.ID || b).filter(Boolean)
        : [branchRefs].filter(Boolean)

      for (const bid of branchIds) {
        if (!subDeptBranchMap.has(subDeptId)) {
          subDeptBranchMap.set(subDeptId, new Set())
        }
        subDeptBranchMap.get(subDeptId)!.add(bid)
      }
    }

    // =============================================================================
    // BRANCH ↔ GROUP (HOSPITAL) ASSOCIATION
    // =============================================================================
    // The CMS stores the relationship ONLY on the HospitalMaster (Hospital Group)
    // side: each group record carries a `branches` multi-reference to BranchesMaster.
    // Individual branches do NOT carry a back-reference to their group, so we derive
    // membership from the group side. This is the authoritative mapping and guarantees
    // that every group shows ONLY its own branches and that grouped branches resolve
    // back to their correct group.
    const rawBranchById = new Map<string, any>()
    for (const b of rawBranches) {
      const bid = b._id || b.ID
      if (bid) rawBranchById.set(bid, b)
    }

    const branchesByHospital = new Map<string, any[]>()
    const groupedBranchIds = new Set<string>()

    for (const hospital of rawHospitals as any[]) {
      if (hospital.isStandalone === true) continue
      const refIds = (hospital.branches || [])
        .map((b: any) => b?._id || b?.ID)
        .filter(Boolean)
      for (const bid of refIds as string[]) {
        groupedBranchIds.add(bid)
        if (!branchesByHospital.has(hospital._id)) {
          branchesByHospital.set(hospital._id, [])
        }
        // Prefer the full BranchesMaster record for complete branch data.
        const full = rawBranchById.get(bid)
        if (full) branchesByHospital.get(hospital._id)!.push(full)
      }
    }

    const standaloneBranches: any[] = []
    const groupedBranches: any[] = []
    const standaloneBranchesMap = new Map<string, any>()

    for (const branch of rawBranches) {
      const bid = branch._id || branch.ID || ''
      if (groupedBranchIds.has(bid)) {
        groupedBranches.push(branch)
      } else {
        standaloneBranches.push(branch)
        standaloneBranchesMap.set(bid, branch)
      }
    }

    // Collect all IDs for batch fetching
    const allDoctorIds = new Set<string>()
    const allAccreditationIds = new Set<string>()
    const allTreatmentIds = new Set<string>()

    for (const branch of rawBranches) {
      const mapped = mapBranch(branch)
      extractIds(mapped.doctors).forEach((id: string) => allDoctorIds.add(id))
      extractIds(mapped.accreditation).forEach((id: string) => allAccreditationIds.add(id))
      extractIds(mapped.treatments).forEach((id: string) => allTreatmentIds.add(id))

      // Also collect doctor IDs from DoctorMaster_hospital multi-reference field on branch
      const doctorMasterHospitalRefs = branch.DoctorMaster_hospital || branch['DoctorMaster_hospital'] || []
      const doctorMasterHospitalIds = Array.isArray(doctorMasterHospitalRefs)
        ? doctorMasterHospitalRefs.map((ref: any) => ref?._id || ref?.ID || ref).filter(Boolean)
        : [doctorMasterHospitalRefs].filter(Boolean)
      doctorMasterHospitalIds.forEach((id: string) => allDoctorIds.add(id))
    }

    // Collect doctor IDs from treatments (DoctorCollection-treatment) and specialist mappings
    for (const treatment of rawTreatments) {
      const doctorRef = (treatment as any)['DoctorCollection-treatment'] || (treatment as any).doctorCollection
      const doctorRefs = Array.isArray(doctorRef) ? doctorRef : (doctorRef ? [doctorRef] : [])
      for (const ref of doctorRefs) {
        const id = (ref as { _id?: string; ID?: string })?._id || (ref as { _id?: string; ID?: string })?.ID || String(ref)
        if (id) allDoctorIds.add(id)
      }

      const specialistMap = (treatment as any).SpecialistMap || (treatment as any).specialistMap
      const specialistRefs = Array.isArray(specialistMap) ? specialistMap : (specialistMap ? [specialistMap] : [])
      for (const ref of specialistRefs) {
        const specId = (ref as { _id?: string; ID?: string })?._id || (ref as { _id?: string; ID?: string })?.ID || String(ref)
        if (specId) {
          const specialist = rawSpecialists.find((s: any) => (s._id || s.ID) === specId)
          if (specialist) {
            const specDoctors = specialist.doctor || []
            const docArray = Array.isArray(specDoctors) ? specDoctors : (specDoctors ? [specDoctors] : [])
            for (const docRef of docArray) {
              const docId = (docRef as { _id?: string; ID?: string })?._id || (docRef as { _id?: string; ID?: string })?.ID || String(docRef)
              if (docId) allDoctorIds.add(docId)
            }
          }
        }
      }
    }

    // Collect doctor IDs from specialists' doctor references
    for (const spec of rawSpecialists) {
      const specDoctors = spec.doctor || []
      const docArray = Array.isArray(specDoctors) ? specDoctors : (specDoctors ? [specDoctors] : [])
      for (const docRef of docArray) {
        const docId = (docRef as { _id?: string; ID?: string })?._id || (docRef as { _id?: string; ID?: string })?.ID || String(docRef)
        if (docId) allDoctorIds.add(docId)
      }
    }

    // Collect treatment IDs from subDepartment_treatment to fetch those treatments too
    for (const treatment of rawTreatments) {
      const subDeptRef = treatment.subDepartment_treatment || treatment.subDepartment || treatment.SubDepartment || null
      if (subDeptRef) {
        // Just mark that we need treatments - they're already in rawTreatments
        // But we need to build subDepartment→branch mapping later
      }
    }

    // Batch fetch related data
    const [doctorsMap, accreditationsMap, treatmentsMap, specialistsMap] = await Promise.all([
      fetchByIds('DoctorMaster', Array.from(allDoctorIds), mapDoctor),
      fetchByIds('Accreditation', Array.from(allAccreditationIds), (item) => ({
        _id: item._id ?? item.ID ?? '',
        title: getValue(item, 'title', 'Title') || 'Unknown',
        image: item.image || null,
      })),
      fetchByIds('TreatmentMaster', Array.from(allTreatmentIds), mapTreatment),
      fetchSpecialistWithTreatments([]),
    ])

    // Normalize specialistsMap to include a standardized 'treatments' array for consistent access
    // This ensures branch enrichment and filtering logic can reliably access specialist treatments
    for (const specId in specialistsMap) {
      if (Object.prototype.hasOwnProperty.call(specialistsMap, specId)) {
        const spec = specialistsMap[specId]
        const treatments = spec.TreatmentMaster_specialistMap
          ?? spec.treatment
          ?? spec.Treatment
          ?? spec.data?.treatment
          ?? []
        specialistsMap[specId] = {
          ...spec,
          treatments: Array.isArray(treatments) ? treatments : [treatments].filter(Boolean)
        }
      }
    }

    // Add department mapping to specialistsMap
    for (const spec of rawSpecialists) {
      const specId = spec._id ?? spec.ID
      if (!specId) continue

      const departmentRefs = spec.SubDepartment ?? spec.department ?? spec.Department ?? spec.SpecialistsMaster_department ?? []
      const deptArray = Array.isArray(departmentRefs) ? departmentRefs : (departmentRefs ? [departmentRefs] : [])
      const deptIds = deptArray.map((d: any) => d?._id ?? d?.ID ?? d).filter(Boolean)
      if (specId && deptIds.length > 0) {
        specialistsMap[specId] = {
          ...specialistsMap[specId],
          departmentIds: deptIds,
        }
      }
    }

    // Helper to enrich branch with related data
    const enrichBranch = (_branch: any, mapped: any, allRawDoctors: any[], parentHospitalId?: string, parentHospitalName?: string) => {
      // Get specialist IDs directly from branch
      let branchSpecialistIds = mapped.specialist.map((s: any) => s._id)
      const branchSpecialists = branchSpecialistIds
        .map((id: string) => specialistsMap[id])
        .filter(Boolean)

      // Fallback: if branch has no direct specialist refs, find specialists that reference this branch
      if (branchSpecialistIds.length === 0 && _branch._id) {
        const branchId = _branch._id
        const fallbackSpecialistIds: string[] = []

        for (const [specId, specialist] of Object.entries(specialistsMap)) {
          const branchRefs = specialist.BranchesMaster_specialist || specialist.branches || specialist.branchId || []
          const refIds = Array.isArray(branchRefs)
            ? branchRefs.map((b: any) => b?._id || b?.ID || b).filter(Boolean)
            : [branchRefs].filter(Boolean)

          if (refIds.some((id: string) => id === branchId || id?.toLowerCase() === branchId?.toLowerCase())) {
            fallbackSpecialistIds.push(specId)
          }
        }

        if (fallbackSpecialistIds.length > 0) {
          branchSpecialistIds = fallbackSpecialistIds
          // Also update branchSpecialists
          branchSpecialists.push(...fallbackSpecialistIds.map((id: string) => specialistsMap[id]).filter(Boolean))
        }
      }

      const branchDepartmentIds = mapped.department?.map((d: any) => d._id).filter(Boolean) ?? []
      const branchDepartments = branchDepartmentIds
        .map((id: string) => departmentsMap.get(id))
        .filter((d: any): d is any => d !== undefined)

      const enrichedCity = mapped.city.map((c: any) => {
        const enrichedCityData = citiesMap.get(c._id)
        if (enrichedCityData?.state && enrichedCityData.state !== 'Unknown State') {
          return enrichedCityData
        }
        return c
      })

// Collect doctors from branch doctors field (direct branch.doctors references)
       let doctors = mapped.doctors.map((d: any) => {
         const mappedDoc = doctorsMap[d._id] ?? d
         // Enrich with parent hospital/branch context if not already set
         return {
           ...mappedDoc,
           hospitalName: mappedDoc.hospitalName || parentHospitalName || '',
           hospitalId: mappedDoc.hospitalId || parentHospitalId || '',
           branchName: mappedDoc.branchName || mapped.branchName || '',
           branchId: mappedDoc.branchId || _branch._id || '',
         }
       })

// Also collect doctors from branch specialists (direct CMS mapping via specialist.doctor field)
       const doctorsFromSpecialists = branchSpecialists.flatMap((s: any) => {
         const specDoctors = s.doctor ? (Array.isArray(s.doctor) ? s.doctor : [s.doctor]) : []
         return specDoctors
           .map((d: any) => {
             const id = d._id || d
             const mappedDoc = doctorsMap[id] || (d._id ? d : null)
             // Enrich with parent context if available
             if (mappedDoc) {
               return {
                 ...mappedDoc,
                 hospitalName: mappedDoc.hospitalName || parentHospitalName || '',
                 hospitalId: mappedDoc.hospitalId || parentHospitalId || '',
                 branchName: mappedDoc.branchName || mapped.branchName || '',
                 branchId: mappedDoc.branchId || _branch._id || '',
               }
             }
             return null
           })
           .filter((d: any): d is any => d !== null && d._id)
       })



// Collect doctors that have this branch assigned directly (via branchId or BranchesMaster_doctor)
       const doctorsFromBranchId = allRawDoctors.filter((doc: any) => {
         // Check simple branchId field
         if (doc.branchId === _branch._id) return true

         // Check multi-reference field BranchesMaster_doctor (or branches)
         const branchRefs = doc.BranchesMaster_doctor || doc.branches || []
         const refIds = Array.isArray(branchRefs)
           ? branchRefs.map((b: any) => b?._id || b?.ID || b).filter(Boolean)
           : [branchRefs].filter(Boolean)

         return refIds.some((id: string) => id === _branch._id || id?.toLowerCase() === _branch._id?.toLowerCase())
       }).map((d: any) => {
         const mappedDoc = doctorsMap[d._id] || mapDoctor(d)
         // Enrich with parent context
         return {
           ...mappedDoc,
           hospitalName: mappedDoc.hospitalName || parentHospitalName || '',
           hospitalId: mappedDoc.hospitalId || parentHospitalId || '',
           branchName: mappedDoc.branchName || mapped.branchName || '',
           branchId: mappedDoc.branchId || _branch._id || '',
         }
       })

// Collect doctors assigned to the parent hospital (DoctorMaster_hospital / hospital reference)
         const doctorsFromHospital = parentHospitalId
           ? allRawDoctors.filter((doc: any) => {
                const hospitalRefs = doc.hospital || doc.hospitalId || doc.DoctorMaster_hospital || null
                if (!hospitalRefs) return false
                const refs = Array.isArray(hospitalRefs) ? hospitalRefs : [hospitalRefs]
                return refs.some((h: any) => {
                  if (typeof h === 'string') return h === parentHospitalId
                  const actual = h.hospital && typeof h.hospital === 'object' ? h.hospital : h
                  return (actual._id || actual.ID || '') === parentHospitalId
                })
              }).map((d: any) => {
                const mappedDoc = doctorsMap[d._id] || mapDoctor(d)
                return {
                  ...mappedDoc,
                  hospitalName: mappedDoc.hospitalName || parentHospitalName || '',
                  hospitalId: mappedDoc.hospitalId || parentHospitalId || '',
                }
              })
           : []

        // Collect doctors from branch's DoctorMaster_hospital multi-reference field
        // Also check raw branch data for DoctorMaster_hospital references
        const rawDoctorRefsFromBranch = _branch.DoctorMaster_hospital || _branch['DoctorMaster_hospital'] || []
        const rawDoctorIdsFromBranch = Array.isArray(rawDoctorRefsFromBranch)
          ? rawDoctorRefsFromBranch.map((ref: any) => ref?._id || ref?.ID || ref).filter(Boolean)
          : [rawDoctorRefsFromBranch].filter(Boolean)

        // Also check mapped branch doctors for additional doctor references
        // mapped.doctors may contain DoctorMaster_hospital references with IDs
        const mappedDoctorBranchRefs = mapped.doctors
          .filter((d: any) => d.DoctorMaster_hospital || d['DoctorMaster_hospital'])
          .flatMap((d: any) => {
            const refs = d.DoctorMaster_hospital || d['DoctorMaster_hospital'] || []
            return Array.isArray(refs) ? refs.map((r: any) => r?._id || r?.ID || r).filter(Boolean) : [refs].filter(Boolean)
          })

        const allDoctorIdsFromBranch = [...new Set([...rawDoctorIdsFromBranch, ...mappedDoctorBranchRefs])]

        const doctorsFromBranchMultiRef = allDoctorIdsFromBranch.length > 0
          ? allRawDoctors.filter((doc: any) =>
              allDoctorIdsFromBranch.includes(doc._id) || allDoctorIdsFromBranch.includes(doc.ID)
            ).map((d: any) => {
              const mappedDoc = doctorsMap[d._id] || mapDoctor(d)
              // Enrich with branch context
              return {
                ...mappedDoc,
                hospitalName: mappedDoc.hospitalName || parentHospitalName || '',
                hospitalId: mappedDoc.hospitalId || parentHospitalId || '',
                branchName: mappedDoc.branchName || mapped.branchName || '',
                branchId: mappedDoc.branchId || _branch._id || '',
              }
            })
          : []

// Combine and deduplicate doctors
       const doctorMap = new Map<string, any>()
        ;[...doctors, ...doctorsFromSpecialists, ...doctorsFromBranchId, ...doctorsFromHospital, ...doctorsFromBranchMultiRef].forEach((d) => {
         if (d._id && !doctorMap.has(d._id)) {
           doctorMap.set(d._id, d)
         }
       })

      return {
        ...mapped,
        doctors: Array.from(doctorMap.values()),
        specialist: branchSpecialists.length > 0 ? branchSpecialists : mapped.specialist,
        department: branchDepartments.length > 0 ? branchDepartments : mapped.department,
        city: enrichedCity,
        accreditation: mapped.accreditation.map((a: any) => accreditationsMap[a._id] ?? a),
        treatments: mapped.treatments.map((t: any) => treatmentsMap[t._id] ?? t),
      }
    }


      // Build hospitals with enriched branches
      const hospitals: any[] = []

      // Process standalone hospitals from HospitalMaster
      for (const rawHospital of rawHospitals) {
        if (rawHospital.isStandalone !== true) continue
        const hospital = mapHospital(rawHospital)
        const hospitalNameTrimmed = hospital.hospitalName?.trim() || ''
        const finalHospitalName = (hospitalNameTrimmed && hospitalNameTrimmed !== 'Unnamed Hospital')
          ? hospitalNameTrimmed
          : `Hospital ${hospital._id?.slice(-4) || 'Group'}`

        hospitals.push({
          ...hospital,
          isStandalone: true,
          hospitalName: finalHospitalName,
          branches: [],
          doctors: hospital.doctors || [],
          treatments: hospital.treatments || [],
          accreditations: hospital.accreditations || [],
          specialist: hospital.specialist || [],
        })
      }

      // Process regular hospitals
      for (const rawHospital of rawHospitals) {
        if (rawHospital.isStandalone === true) continue
        const hospital = mapHospital(rawHospital)
        const hospitalBranches = branchesByHospital.get(hospital._id) ?? []
        const enrichedBranches = hospitalBranches.map((b: any) => enrichBranch(b, mapBranch(b), rawDoctors, hospital._id, hospital.hospitalName))

        // Collect unique data
        const uniqueDoctors = new Map<string, any>()
        const uniqueTreatments = new Map<string, any>()
        const uniqueAccreditations = new Map<string, any>()
        const uniqueSpecialists = new Map<string, any>()

       for (const branch of enrichedBranches) {
         for (const d of branch.doctors) if (d._id) uniqueDoctors.set(d._id, d)
         for (const t of branch.treatments) if (t._id) uniqueTreatments.set(t._id, t)
         for (const a of branch.accreditation) if (a._id) uniqueAccreditations.set(a._id, a)
         for (const s of branch.specialist ?? []) if (s._id && !uniqueSpecialists.has(s._id)) uniqueSpecialists.set(s._id, s)
       }

        // Ensure hospitalName is never empty or default placeholder.
        // Use the original CMS name when available; otherwise derive a stable
        // fallback from the hospital ID so we never pollute the group identity
        // with a single branch name.
        const hospitalNameTrimmed = hospital.hospitalName?.trim() || ''
        const finalHospitalName = (hospitalNameTrimmed && hospitalNameTrimmed !== 'Unnamed Hospital')
          ? hospitalNameTrimmed
          : `Hospital ${hospital._id?.slice(-4) || 'Group'}`

       hospitals.push({
         ...hospital,
         hospitalName: finalHospitalName,
         branches: enrichedBranches,
         doctors: Array.from(uniqueDoctors.values()),
         treatments: Array.from(uniqueTreatments.values()),
         accreditations: Array.from(uniqueAccreditations.values()),
         specialist: Array.from(uniqueSpecialists.values()),
       })
     }

      // Process standalone branches as hospitals
      for (const branch of standaloneBranches) {
        const mapped = mapBranch(branch)
        // Get hospital ID from raw branch data (could be hospitalId, hospital._id, etc.)
        const branchHospitalId = branch.hospitalId || branch.hospital?._id || branch.hospital?.ID || ''
        const enrichedBranch = enrichBranch(branch, mapped, rawDoctors, branchHospitalId)
        const hospital = mapHospital(branch)

       // For standalone branches, ensure hospitalName comes from branch name when hospital name is missing/default
       const hospitalNameTrimmed = hospital.hospitalName?.trim() || ''
       const finalHospitalName = (hospitalNameTrimmed && hospitalNameTrimmed !== 'Unnamed Hospital')
         ? hospitalNameTrimmed
         : (enrichedBranch.branchName?.trim() || 'Hospital')

        hospitals.push({
          ...hospital,
          isStandalone: true,
          hospitalName: finalHospitalName,
          branches: [enrichedBranch],
          doctors: enrichedBranch.doctors,
          treatments: enrichedBranch.treatments,
          accreditations: enrichedBranch.accreditation,
          specialist: enrichedBranch.specialist,
        })
     }

    // Build extended treatments with branch availability
    const treatmentBranchMap = new Map<string, Map<string, TreatmentLocation>>()

    for (const hospital of hospitals) {
      for (const branch of hospital.branches) {
        for (const treatment of branch.treatments) {
          if (!treatmentBranchMap.has(treatment._id)) {
            treatmentBranchMap.set(treatment._id, new Map())
          }
          const branchMap = treatmentBranchMap.get(treatment._id)!

          if (!branchMap.has(branch._id)) {
            branchMap.set(branch._id, {
              branchId: branch._id,
              branchName: branch.branchName,
              hospitalName: hospital.hospitalName,
              hospitalId: hospital._id,
              cities: branch.city,
              departments: branch.department || [],
              cost: treatment.cost,
              // Include additional fields for complete branch data
              slug: branch.slug,
              logo: branch.logo,
              address: branch.address,
              specialty: branch.specialty,
            })
          }

          // Also map by treatment name
          if (treatment.name) {
            const masterId = treatmentNameToId.get(treatment.name.toLowerCase())
            if (masterId && masterId !== treatment._id) {
              if (!treatmentBranchMap.has(masterId)) {
                treatmentBranchMap.set(masterId, new Map())
              }
              const masterBranchMap = treatmentBranchMap.get(masterId)!
              if (!masterBranchMap.has(branch._id)) {
            masterBranchMap.set(branch._id, {
              branchId: branch._id,
              branchName: branch.branchName,
              hospitalName: hospital.hospitalName,
              hospitalId: hospital._id,
              cities: branch.city,
              departments: branch.department || [],
              cost: treatment.cost,
              // Include additional fields for complete branch data
              slug: branch.slug,
              logo: branch.logo,
              address: branch.address,
              specialty: branch.specialty,
            })
          }
            }
          }
        }

        // Handle specialist treatments
         for (const spec of branch.specialist ?? []) {
           const specTreatmentIds = specialistTreatmentMap.get(spec._id)
           if (specTreatmentIds) {
             for (const treatmentId of Array.from(specTreatmentIds)) {
               if (!treatmentBranchMap.has(treatmentId)) {
                 treatmentBranchMap.set(treatmentId, new Map())
               }
               const branchMap = treatmentBranchMap.get(treatmentId)!
               if (!branchMap.has(branch._id)) {
                 const treatmentData = treatmentsMap[treatmentId]
                  branchMap.set(branch._id, {
                    branchId: branch._id,
                    branchName: branch.branchName,
                    hospitalName: hospital.hospitalName,
                    hospitalId: hospital._id,
                    cities: branch.city,
                    departments: branch.department || [],
                    cost: treatmentData?.cost ?? null,
                    // Include additional fields for complete branch data
                    slug: branch.slug,
                    logo: branch.logo,
                    address: branch.address,
                    specialty: branch.specialty,
                  })
                }
             }
           }
          }
       }
     }

     // =============================================================================
     // MAP TREATMENTS TO BRANCHES VIA SUBDEPARTMENT RELATIONSHIP
     // =============================================================================
     // For treatments that have subDepartment_treatment links, find branches via:
     // Treatment.subDepartment_treatment → SubDepartment → BranchesMaster_subDepartment
for (const treatment of rawTreatments) {
        const treatmentId = treatment._id ?? treatment.ID
        if (!treatmentId) continue

        const treatmentObj = mapTreatment(treatment) // Get mapped treatment for cost

        const subDeptRef = treatment.subDepartment_treatment || treatment.subDepartment || treatment.SubDepartment || null
         const subDeptArray = Array.isArray(subDeptRef) ? subDeptRef : subDeptRef ? [subDeptRef] : []

         for (const sd of subDeptArray) {
           const sdId = sd._id || sd.ID || String(sd)
           if (!sdId) continue

          

          const branchIds = subDeptBranchMap.get(sdId)
          if (branchIds && branchIds.size > 0) {
            // Ensure treatment entry exists
            if (!treatmentBranchMap.has(treatmentId)) {
              treatmentBranchMap.set(treatmentId, new Map())
            }
             const branchMap = treatmentBranchMap.get(treatmentId)!

              for (const branchId of Array.from(branchIds)) {
              // Find hospital for this branch
              let hospitalId = ''
              let hospitalName = ''
              let foundInGrouped = false

              // Check grouped branches first
              for (const [hid, hbranches] of Array.from(branchesByHospital.entries())) {
               if (hbranches.some((b: any) => b._id === branchId)) {
                 hospitalId = hid
                 const h = hospitals.find(h => h._id === hid)
                 hospitalName = h?.hospitalName || ''
                 foundInGrouped = true
                 break
               }
             }

             // Check standalone branches
             if (!foundInGrouped) {
               const standalone = standaloneBranchesMap.get(branchId) || standaloneBranches.find(b => b._id === branchId)
               if (standalone) {
                 // For standalone branches, use the branch itself as the "hospital" reference
                 // but extract the actual hospital name if available
                 const branchHospitalName = standalone.hospitalName || standalone.hospital?.hospitalName || mapHospital(standalone).hospitalName
                 hospitalId = standalone._id || standalone.ID || ''
                 hospitalName = branchHospitalName || standalone.branchName || standalone.name || 'Standalone Branch'
               }
             }

             if (!branchMap.has(branchId)) {
               // Get branch data - check grouped hospital branches first
               let branchData: any = null
               for (const h of hospitals) {
                 const found = h.branches.find((b: any) => b._id === branchId)
                 if (found) {
                   branchData = mapBranch(found)
                   break
                 }
               }
               // Then check standalone branches
               if (!branchData) {
                 const s = standaloneBranchesMap.get(branchId) || standaloneBranches.find(b => b._id === branchId)
                 if (s) {
                   branchData = mapBranch(s)
                   // Ensure standalone branch has proper hospital reference
                   if (!branchData.hospitalName && hospitalName) {
                     branchData.hospitalName = hospitalName
                   }
                 }
               }

              if (branchData) {
                branchMap.set(branchId, {
                  branchId: branchId,
                  branchName: branchData.branchName,
                  hospitalName: hospitalName || branchData.hospitalName,
                  hospitalId: hospitalId,
                  cities: branchData.city || [],
                  departments: branchData.department || [],
                  cost: treatmentObj.cost || null,
                  // Include additional fields for complete branch data
                  slug: branchData.slug,
                  logo: branchData.logo,
                  address: branchData.address,
                  specialty: branchData.specialty,
                })
              }
             }
          }
        }
        }
      }

    // Build final treatments list
    const treatments: any[] = rawTreatments.map((item: any) => {
      const treatment = mapTreatment(item)
      let branchesMap = treatmentBranchMap.get(treatment._id)

      if (!branchesMap && treatment.name) {
        // Try to match by slug
        const treatmentSlug = generateSlug(treatment.name)
        for (const [key, value] of Array.from(treatmentBranchMap.entries())) {
          // Check if key (which is a treatment ID or slug) matches our slug or name
          if (key === treatmentSlug ||
              key === treatment.name.toLowerCase() ||
              key === treatment.name) {
            branchesMap = value
            break
          }
        }
      }

return {
         ...treatment,
         descriptionHtml: treatment.descriptionHtml ?? undefined,
         slug: generateSlug(treatment.name),
         branchesAvailableAt: branchesMap ? Array.from(branchesMap.values()) : [],
         departments: [],
       }
    })

    // Collect unique departments
    const uniqueDepartments = new Map<string, any>()
    for (const hospital of hospitals) {
      for (const branch of hospital.branches) {
        for (const dept of branch.department || []) {
          if (dept._id && !uniqueDepartments.has(dept._id)) {
            uniqueDepartments.set(dept._id, dept)
          }
        }
      }
    }

    // Transform departments using Wix data transformers
    const [wixDepartments, wixSubDepartments, wixTreatments] = await Promise.all([
      fetchDepartmentsFromWix(),
      fetchSubDepartmentsFromWix(),
      fetchTreatmentsFromWix(),
    ])
    const departments = buildDepartmentHierarchy(wixDepartments, wixSubDepartments, wixTreatments)

    // =============================================================================
    // BUILD DOCTORS FROM SPECIALIST REFERENCES
    // =============================================================================
    // Extract unique doctor items from specialists' doctor references
    const specialistDoctorMap = new Map<string, any>()

    for (const spec of rawSpecialists) {
      const specName = spec.name || ''
      // Doctor references (may be array or single)
      const docRefs = spec.doctor || []
      const docArray = Array.isArray(docRefs) ? docRefs : [docRefs]

      // Branch references for location enrichment
      const branchRefs = spec.branches || spec.BranchesMaster_specialist || []
      const branchArray = Array.isArray(branchRefs) ? branchRefs : [branchRefs]

      for (const doc of docArray) {
        if (!doc || !doc._id) continue

        const existing = specialistDoctorMap.get(doc._id)
        if (existing) {
          // Add specialization name if not already present
          if (!existing._specialistNames) existing._specialistNames = []
          if (specName && !existing._specialistNames.includes(specName)) {
            existing._specialistNames.push(specName)
          }
          // Enrich with location data (hospital, branch, city)
          if (!existing._hospitalNames) existing._hospitalNames = new Set<string>()
          if (!existing._hospitalIds) existing._hospitalIds = new Set<string>()
          if (!existing._branchNames) existing._branchNames = new Set<string>()
          if (!existing._branchIds) existing._branchIds = new Set<string>()
          if (!existing._cities) existing._cities = []

          for (const br of branchArray) {
            const hname = (br as any).hospitalName || (br as any).hospital?.hospitalName || (br as any).hospital?.name || ''
            const hid = (br as any).hospitalId || (br as any).hospital?._id || (br as any).hospital?.ID || ''
            const bname = (br as any).branchName || (br as any).name || ''
            const bid = (br as any)._id || (br as any).id || (br as any).ID || ''

            if (hname) existing._hospitalNames.add(hname)
            if (hid) existing._hospitalIds.add(hid)
            if (bname) existing._branchNames.add(bname)
            if (bid) existing._branchIds.add(bid)

            const cities = (br as any).city || []
            const cityArray = Array.isArray(cities) ? cities : [cities]
            for (const c of cityArray) {
              // Avoid duplicates by city id or name
              if (!existing._cities.some((c2: any) => c2._id === c._id || c2.cityName === c.cityName)) {
                existing._cities.push(c)
              }
            }
          }
        } else {
          // Create new entry with enrichment
          const newDoc: any = { ...doc, _specialistNames: [specName] }
          newDoc._hospitalNames = new Set<string>()
          newDoc._hospitalIds = new Set<string>()
          newDoc._branchNames = new Set<string>()
          newDoc._branchIds = new Set<string>()
          newDoc._cities = []

          for (const br of branchArray) {
            const hname = (br as any).hospitalName || (br as any).hospital?.hospitalName || (br as any).hospital?.name || ''
            const hid = (br as any).hospitalId || (br as any).hospital?._id || (br as any).hospital?.ID || ''
            const bname = (br as any).branchName || (br as any).name || ''
            const bid = (br as any)._id || (br as any).id || (br as any).ID || ''

            if (hname) newDoc._hospitalNames.add(hname)
            if (hid) newDoc._hospitalIds.add(hid)
            if (bname) newDoc._branchNames.add(bname)
            if (bid) newDoc._branchIds.add(bid)

            const cities = (br as any).city || []
            const cityArray = Array.isArray(cities) ? cities : [cities]
            for (const c of cityArray) {
              newDoc._cities.push(c)
            }
          }

          specialistDoctorMap.set(doc._id, newDoc)
        }
      }
    }

// Map collected doctors to DoctorData shape
      const finalDoctors = Array.from(specialistDoctorMap.values()).map((doc: any) => {
        // Base mapping using standard mapper (includes hospital/branch from raw doctor record)
        const base = mapDoctor(doc)

        // Build specialization array with name, treatments, and departments from specialist mapping
        const specNames = doc._specialistNames || []
        const enrichedSpecializations = specNames.map((name: string) => {
          // Find the specialist that corresponds to this name to get treatments and departments
          const specEntry = Object.entries(specialistsMap).find(
            ([, spec]) => (spec as any).name === name || (spec as any).specialty === name
          )
          let treatments: any[] = []
          let departments: any[] = []
          if (specEntry) {
            const [, spec] = specEntry

            // Get treatments
            const treatmentIds = specialistTreatmentMap.get(specEntry[0])
            if (treatmentIds) {
              treatments = Array.from(treatmentIds).map((tid) => {
                const treatment = treatmentsMap[tid]
                return { _id: tid, name: treatment?.name || '' }
              })
            }

            // Get departments
            if ((spec as any).departmentIds?.length) {
              departments = (spec as any).departmentIds.map((did: string) => {
                const dept = departmentsMap.get(did)
                return { _id: did, name: dept?.name || '' }
              })
            }
          }
          return { name, treatments, departments }
        })
        base.specialization = enrichedSpecializations

        // Enrich with location data from specialist-branch associations (if available)
        // Only override if we have data; otherwise keep base values from raw doctor record
        if (doc._hospitalNames && doc._hospitalNames.size > 0) {
          base.hospitalName = (Array.from(doc._hospitalNames)[0] as string)
        }
        if (doc._hospitalIds && doc._hospitalIds.size > 0) {
          base.hospitalId = (Array.from(doc._hospitalIds)[0] as string)
        }
        if (doc._branchNames && doc._branchNames.size > 0) {
          base.branchName = (Array.from(doc._branchNames)[0] as string)
        }
        if (doc._branchIds && doc._branchIds.size > 0) {
          base.branchId = (Array.from(doc._branchIds)[0] as string)
        }
        if (doc._cities && doc._cities.length > 0) {
          // If branchName is still missing but hospitalId exists, get first branch from that hospital
          if (!base.branchName && base.hospitalId) {
            const hospitalBranches = branchesByHospital.get(base.hospitalId)
            if (hospitalBranches && hospitalBranches.length > 0) {
              const firstBranch = mapBranch(hospitalBranches[0])
              base.branchName = firstBranch.branchName || ''
              base.branchId = firstBranch._id || ''
            }
          }
          base.city = doc._cities
        }

        // Ensure slug if missing
        if (!base.slug && doc.doctorName) {
          base.slug = generateSlug(doc.doctorName)
        }

        // Preserve aboutDoctorHtml if aboutDoctor exists and aboutDoctorHtml missing
        if (!base.aboutDoctorHtml && doc.aboutDoctor) {
          base.aboutDoctorHtml = doc.aboutDoctor
        }

        return base
      })

     // Ensure all doctors fetched from the CMS are included in the final doctors list,
     // even those not linked to any specialist (e.g., doctors directly linked to treatments).
     const existingDoctorIds = new Set(finalDoctors.map(d => d._id))
     for (const [docId, doc] of Object.entries(doctorsMap)) {
       if (!existingDoctorIds.has(docId)) {
         const mappedDoc = mapDoctor(doc);
            if (!mappedDoc.branchName && mappedDoc.hospitalId) {
              const hospitalBranches = branchesByHospital.get(mappedDoc.hospitalId)
              if (hospitalBranches && hospitalBranches.length > 0) {
                const firstBranch = mapBranch(hospitalBranches[0])
                mappedDoc.branchName = firstBranch.branchName || ''
                mappedDoc.branchId = firstBranch._id || ''
              }
            }
            finalDoctors.push(mappedDoc)
        }
      }

      // ---------------------------------------------------------------------------
      // INVERSE DOCTOR → BRANCH RESOLUTION
      // Many doctors are linked to a branch ONLY through the inverse
      // `branch.doctors` / `branch.DoctorMaster_hospital` reference (the branch
      // record explicitly lists its doctors). The DoctorMaster collection record
      // for these doctors carries no hospital/branch fields of its own, so the
      // normal mapper produces an empty branchName/hospitalName. Walk the
      // hospital→branch→doctor relationship (already nested in `hospitals`) and
      // back-fill the correct branch + hospital for every doctor that is missing
      // it. This is the canonical Doctor → Hospital → Branch mapping and fixes
      // branch display across the doctor detail page, related specialists, and
      // all doctor cards in one place.
      // ---------------------------------------------------------------------------
      const doctorToBranchMap = new Map<
        string,
        { branchId: string; branchName: string; hospitalId: string; hospitalName: string; city: any[] }
      >()

      for (const hospital of hospitals) {
        for (const branch of hospital.branches || []) {
          const branchDoctors = (branch as any).doctors || []
          const branchDoctorRefs = Array.isArray(branchDoctors) ? branchDoctors : [branchDoctors]
          for (const docRef of branchDoctorRefs) {
            if (!docRef) continue
            const doctorId =
              (docRef as any)._id || (docRef as any).ID || (typeof docRef === 'string' ? docRef : '')
            if (!doctorId) continue
            if (!doctorToBranchMap.has(doctorId)) {
              doctorToBranchMap.set(doctorId, {
                branchId: (branch as any)._id || '',
                branchName: (branch as any).branchName || '',
                hospitalId: (hospital as any)._id || '',
                hospitalName: (hospital as any).hospitalName || '',
                city: (branch as any).city || [],
              })
            }
          }
        }
      }

      const enrichDoctorFromBranch = (doc: any): void => {
        if (!doc || !doc._id) return
        if (doc.branchName && doc.branchId && doc.hospitalName) return
        const mapping = doctorToBranchMap.get(doc._id)
        if (!mapping) return
        // Prefer the inverse branch mapping only when the doctor has no explicit
        // branch info, so we never overwrite authoritative denormalized data.
        if (!doc.branchId) doc.branchId = mapping.branchId
        if (!doc.branchName) doc.branchName = mapping.branchName
        if (!doc.hospitalId) doc.hospitalId = mapping.hospitalId
        if (!doc.hospitalName) doc.hospitalName = mapping.hospitalName
        if ((!doc.city || (Array.isArray(doc.city) && doc.city.length === 0)) && mapping.city?.length) {
          doc.city = mapping.city
        }
        // Populate the multi-reference field so branchInfo lists resolve
        // consistently in the resolver and doctor-card utilities.
        if (!doc.BranchesMaster_doctor && mapping.branchId) {
          doc.BranchesMaster_doctor = [
            { _id: mapping.branchId, branchName: mapping.branchName, name: mapping.branchName },
          ]
        }
      }

      for (const doc of finalDoctors) {
        enrichDoctorFromBranch(doc)
      }

      const response: CMSDataResponse = {
      hospitals,
      treatments,
      doctors: finalDoctors,
      departments,
      totalHospitals: hospitals.length,
      totalTreatments: treatments.length,
      totalDoctors: finalDoctors.length,
      lastUpdated: new Date().toISOString(),
       specialistWithBranch: rawSpecialists.map((spec: any) => {
         // Extract treatments from specialist - handle multiple possible field names
         const treatmentData = spec.TreatmentMaster_specialistMap
           ?? spec.treatment
           ?? spec.Treatment
           ?? spec.data?.treatment
           ?? []
         const treatmentArray = Array.isArray(treatmentData) ? treatmentData : treatmentData ? [treatmentData] : []

        return {
          _id: spec._id ?? spec.ID ?? '',
          name: getValue(spec, 'specialty', 'Specialty Name', 'title', 'name') || 'Unknown Specialist',
          treatments: treatmentArray.map((t: any) => ({
            _id: (t as { _id?: string })?._id ?? (t as { ID?: string })?.ID ?? String(t),
            name: getValue(t, 'treatmentName', 'Treatment Name', 'title', 'name') || 'Unknown Treatment',
            description: getValue(t, 'Description') || getValue(t, 'description') || '',
            cost: getValue(t, 'cost', 'Cost', 'averageCost'),
            treatmentImage: (t as { treatmentImage?: string })?.treatmentImage ?? null,
          })),
          hospitalId: (spec.hospitalId as string) ?? '',
          hospitalName: (spec.hospitalName as string) ?? '',
          branchId: (spec.branchId as string) ?? '',
          branchName: (spec.branchName as string) ?? '',
          city: ((spec.city || []) as any[]).map((c: any) => {
            const cityName = c.cityName || c.name || 'Unknown City'
            let state = 'Unknown State'
            const stateRef = c.state ?? c.State ?? c.stateRef
            if (stateRef) {
              let stateId: string | undefined = undefined
              if (typeof stateRef === 'string') {
                stateId = stateRef
              } else if (typeof stateRef === 'object') {
                stateId = (stateRef as any)._id || (stateRef as any).ID
              }
              if (stateId && statesMap[stateId]) {
                state = statesMap[stateId].name
              } else if (typeof stateRef === 'object' && (stateRef as any).name) {
                state = (stateRef as any).name
              }
            }
            if (state === 'Unknown State') {
              const normalized = cityName.toLowerCase().trim()
              state = DELHI_NCR_CITIES.has(normalized) ? 'Delhi NCR' : 'Unknown State'
            }
            return {
              _id: c._id ?? '',
              cityName,
              state,
              country: 'India',
            }
          }),
        }
      }),
    }

    if (!noCache) {
      memoryCache.set(cacheKey, response, CACHE_CONFIG.HOSPITALS * 1000)
    }
    return response
  }

  return noCache ? load() : memoryCache.dedupe(cacheKey, load)
}

// =============================================================================
// CACHED EXPORTS
// =============================================================================

/**
 * Get all CMS data with in-memory caching.
 * Next.js unstable_cache is not used here because the combined payload
 * routinely exceeds the 2MB data-cache limit.
 * The underlying fetchers cache data in server memory via memoryCache,
 * and _getAllCMSDataImpl dedupes concurrent requests.
 */
// React's request-scoped cache prevents duplicate aggregation work when multiple
// server components ask for the same CMS snapshot during one render.
export const getAllCMSData = cache(async () =>
  memoryCache.dedupe('cms_all_data_request', () => _getAllCMSDataImpl(false)),
)

/**
 * Get cached CMS data (alias for getAllCMSData)
 */
export const getCachedCMSData = getAllCMSData

/**
 * Get fresh CMS data bypassing in-memory cache
 */
export async function getAllCMSDataNoCache(): Promise<CMSDataResponse> {
  return _getAllCMSDataImpl(true)
}

// =============================================================================
// DOCTOR FILTERING HELPERS
// =============================================================================

/**
 * Get treatments associated with a specific doctor by doctorId
 * Matches through:
 * 1. Doctor's specializations' treatments array
 * 2. Specialist treatment mappings (specialistWithBranch)
 * 3. Treatments offered at branches where the doctor works
 * Ensures only treatments matching the doctor's specializations and hospital/branch assignments are returned
 */
export function getTreatmentsByDoctorId(
  cmsData: CMSDataResponse,
  doctorId: string
): TreatmentData[] {
  const doctors = cmsData.doctors || []
  const treatments = cmsData.treatments || []
  const specialists = cmsData.specialistWithBranch || []
  const hospitals = cmsData.hospitals || []

  // Find the doctor to get their specializations and assignments
  const doctor = doctors.find(d => d._id === doctorId)
  if (!doctor) return []

  const uniqueTreatments = new Map<string, TreatmentData>()

  // Get doctor's specialization names for matching
  const doctorSpecNames = (doctor.specialization || [])
    .map(s => (s.name || '').toLowerCase())
    .filter(Boolean)

  // Helper to add treatment to map
  const addTreatment = (treatment: TreatmentData) => {
    if (treatment._id && !uniqueTreatments.has(treatment._id)) {
      uniqueTreatments.set(treatment._id, treatment)
    }
  }

  // Method 1: Check doctor's specializations for treatments
  for (const spec of doctor.specialization || []) {
    const specTreatments = spec.treatments || []
    for (const t of specTreatments) {
      const tId = typeof t === 'string' ? t : (t as any)._id || String(t)
      const treatment = treatments.find(tr => tr._id === tId)
      if (treatment && doctorSpecNames.some(name => name.includes((treatment.name || '').toLowerCase()))) {
        addTreatment(treatment)
      }
    }
  }

  // Method 2: Check specialistWithBranch mappings
  // Find specialists whose specialty matches the doctor's specializations
  for (const specialist of specialists) {
    const specName = specialist.name?.toLowerCase() || ''
    const hasMatchingSpec = doctorSpecNames.some(dSpec =>
      dSpec.includes(specName) || specName.includes(dSpec)
    )

    if (hasMatchingSpec && specialist.treatments) {
      for (const t of specialist.treatments) {
        const tId = t._id || String(t)
        const treatment = treatments.find(tr => tr._id === tId)
        if (treatment) {
          addTreatment(treatment)
        }
      }
    }
  }

  // Method 3: Check treatments at branches where the doctor works
  const doctorBranchId = doctor.branchId || ''
  const doctorHospitalId = doctor.hospitalId || ''

  for (const hospital of hospitals) {
    // Check if doctor works at this hospital
    const worksAtHospital = doctorHospitalId && hospital._id === doctorHospitalId

    for (const branch of hospital.branches || []) {
      // Check if doctor works at this branch
      const worksAtBranch = doctorBranchId && branch._id === doctorBranchId

      // Also check if doctor is in branch's doctor list
      const isInBranchDoctors = branch.doctors?.some((d: any) => d._id === doctorId)

      // Also check branch's doctor list for doctor references (using raw data access)
      const hasDoctorRef = (branch as any).DoctorMaster_hospital?.some((ref: any) =>
        (ref._id || ref.ID) === doctorId
      ) || false

      if (worksAtHospital || worksAtBranch || isInBranchDoctors || hasDoctorRef) {
        for (const t of branch.treatments || []) {
          const tId = typeof t === 'string' ? t : (t as any)._id || String(t)
          const treatment = treatments.find(tr => tr._id === tId)
          if (treatment) {
            addTreatment(treatment)
          }
        }
      }
    }
  }

  return Array.from(uniqueTreatments.values())
}

/**
 * Get doctors associated with a specific hospital by hospitalId
 * Includes doctors directly assigned to the hospital via hospitalId,
 * assigned to its branches via branchId, and via DoctorMaster_hospital field.
 */
export function getDoctorsByHospitalId(cmsData: CMSDataResponse, hospitalId: string): DoctorData[] {
  const allDoctors = cmsData.doctors || []
  const hospitals = cmsData.hospitals || []

  // Find the hospital to get its branch IDs
  const hospital = hospitals.find(h => h._id === hospitalId)
  const branchIds = hospital?.branches?.map(b => b._id).filter(Boolean) || []

  // Filter doctors: those with matching hospitalId, matching branchId, or matching DoctorMaster_hospital
  const uniqueDoctors = new Map<string, DoctorData>()

  for (const doctor of allDoctors) {
    let matches = false

    // Direct hospitalId match
    if (doctor.hospitalId === hospitalId) {
      matches = true
    }

    // BranchId match
    if (!matches && branchIds.includes(doctor.branchId || '')) {
      matches = true
    }

    // DoctorMaster_hospital match (multi-reference)
    if (!matches && doctor.DoctorMaster_hospital) {
      const hospitalRef = doctor.DoctorMaster_hospital
      const ids: string[] = []
      if (Array.isArray(hospitalRef)) {
        for (const h of hospitalRef) {
          const id = typeof h === 'string' ? h : ((h as any)?._id || (h as any)?.ID || '')
          if (id) ids.push(id)
        }
      } else if (typeof hospitalRef === 'object' && hospitalRef !== null) {
        const id = (hospitalRef as any)?._id || (hospitalRef as any)?.ID || ''
        if (id) ids.push(id)
      } else if (typeof hospitalRef === 'string') {
        ids.push(hospitalRef)
      }

      if (ids.includes(hospitalId)) {
        matches = true
      }
    }

    if (matches) {
      if (doctor._id && !uniqueDoctors.has(doctor._id)) {
        uniqueDoctors.set(doctor._id, doctor)
      }
    }
  }

  return Array.from(uniqueDoctors.values())
}

/**
 * Get doctors associated with a specific branch by branchId
 * Checks multiple CMS mapping fields:
 * - doctor.branchId (direct branch ID)
 * - doctor.BranchesMaster_doctor or doctor.branches (multi-reference arrays)
 * - doctor.DoctorMaster_hospital: if doctor's hospital(s) contain this branch
 * - doctor.hospitalId: if the referenced hospital contains this branch
 */
export function getDoctorsByBranchId(cmsData: CMSDataResponse, branchId: string): DoctorData[] {
  const allDoctors = cmsData.doctors || []
  const hospitals = cmsData.hospitals || []

  // Build hospital -> branches map for quick lookup
  const hospitalBranchesMap = new Map<string, Set<string>>()
  // Build branch -> specialist IDs map for quick lookup
  const branchSpecialistMap = new Map<string, Set<string>>()
  for (const hospital of hospitals) {
    const h = hospital as any
    const branches = h.branches || h.data?.branches || []
    const branchIds = branches.map((b: any) => b._id).filter(Boolean)
    hospitalBranchesMap.set(hospital._id, new Set(branchIds))

    // Populate branchSpecialistMap
    for (const branch of branches) {
      if (branch._id) {
        const specIds = new Set<string>()
        const specs = branch.specialist || branch.specialization || []
        for (const s of specs) {
          const sid = s._id || s.ID || (typeof s === 'string' ? s : '')
          if (sid) specIds.add(sid)
        }
        branchSpecialistMap.set(branch._id, specIds)
      }
    }
  }

  const filtered = allDoctors.filter(doctor => {
    // 1. Direct branchId match
    if (doctor.branchId === branchId) {
      return true
    }

    // 2. Multi-reference branches fields (BranchesMaster_doctor, branches)
    const branchRefs = doctor.BranchesMaster_doctor || doctor.branches || []
    const branchIdsFromRefs = Array.isArray(branchRefs)
      ? branchRefs.map((b: any) => b?._id || b?.ID || b).filter(Boolean)
      : [branchRefs].filter(Boolean)

    if (branchIdsFromRefs.some((id: string) => id === branchId || id?.toLowerCase() === branchId?.toLowerCase())) {
      return true
    }

    // 3. Check DoctorMaster_hospital: if doctor's hospital(s) contain this branch
    const hospitalRef = doctor.DoctorMaster_hospital
    if (hospitalRef) {
      const hospitalIds: string[] = []
      if (Array.isArray(hospitalRef)) {
        for (const h of hospitalRef) {
          const id = typeof h === 'string' ? h : ((h as any)?._id || (h as any)?.ID || '')
          if (id) hospitalIds.push(id)
        }
      } else if (typeof hospitalRef === 'object' && hospitalRef !== null) {
        const id = (hospitalRef as any)?._id || (hospitalRef as any)?.ID || ''
        if (id) hospitalIds.push(id)
      } else if (typeof hospitalRef === 'string') {
        hospitalIds.push(hospitalRef)
      }

      for (const hid of hospitalIds) {
        const branchIds = hospitalBranchesMap.get(hid)
        if (branchIds && branchIds.has(branchId)) {
          return true
        }
      }
    }

    // 4. Check doctor.hospitalId field (simple hospital reference)
    if (doctor.hospitalId) {
      const branchIds = hospitalBranchesMap.get(doctor.hospitalId)
      if (branchIds && branchIds.has(branchId)) {
        return true
      }
    }

    // 5. Check if doctor's specialization includes any specialist assigned to this branch
    const specialistIds = branchSpecialistMap.get(branchId)
    if (specialistIds && specialistIds.size > 0) {
      // Extract specialist IDs from doctor.specialization (can be string refs or objects)
      const docSpecIds: string[] = []
      for (const s of doctor.specialization || []) {
        if (typeof s === 'string') {
          docSpecIds.push(s)
        } else if (s && typeof s === 'object') {
          const id = s._id || s.ID
          if (id) docSpecIds.push(id)
        }
      }
      if (docSpecIds.some(id => specialistIds.has(id))) {
        return true
      }
    }

    // 6. Check if doctor is listed directly on the branch's doctors field
    for (const hospital of hospitals) {
      const h = hospital as any
      const branches = h.branches || h.data?.branches || []
      const targetBranch = branches.find((b: any) => (b._id || b.id || b.ID) === branchId)
      if (targetBranch) {
        const branchDoctors = targetBranch.doctors || []
        const doctorRefs = Array.isArray(branchDoctors) ? branchDoctors : [branchDoctors]
        for (const docRef of doctorRefs) {
          const d = docRef as any
          const docId = typeof docRef === 'string' ? docRef : (d._id || d.ID || '')
          if (docId && docId === doctor._id) {
            return true
          }
        }
      }
    }

    return false
  })

  // Deduplicate by _id
  const uniqueMap = new Map<string, DoctorData>()
  for (const doc of filtered) {
    if (doc._id && !uniqueMap.has(doc._id)) {
      uniqueMap.set(doc._id, doc)
    }
  }

  return Array.from(uniqueMap.values())
}


/**
 * Get doctors associated with a specific treatment by treatmentId or treatment name
 * Matches through:
 * 1. Doctor's specializations' treatments array
 * 2. Treatment's doctorCollection field
 * 3. Specialist treatment mappings (specialistWithBranch)
 */
export function getDoctorsByTreatmentId(
  cmsData: CMSDataResponse,
  treatmentIdentifier: string // can be treatment ID or treatment name
): DoctorData[] {
  const allDoctors = cmsData.doctors || []
  const treatments = cmsData.treatments || []
  const specialists = cmsData.specialistWithBranch || []
  const hospitals = cmsData.hospitals || []

  // Find the treatment to get its ID and name
  const treatment = treatments.find(t => t._id === treatmentIdentifier || t.name?.toLowerCase() === treatmentIdentifier?.toLowerCase())
  const treatmentId = treatment?._id
  const treatmentName = treatment?.name?.toLowerCase()

  const uniqueDoctors = new Map<string, DoctorData>()

  // Helper to add doctor to map
  const addDoctor = (doctor: DoctorData) => {
    if (doctor._id && !uniqueDoctors.has(doctor._id)) {
      uniqueDoctors.set(doctor._id, doctor)
    }
  }

  // Method 1: Check doctor's specializations for treatments
  for (const doctor of allDoctors) {
    for (const spec of doctor.specialization || []) {
      const specTreatments = spec.treatments || []
      const hasMatchingTreatment = specTreatments.some((t: any) => {
        const tId = t._id || t.ID || String(t)
        const tName = t.treatmentName || t.name || String(t)
        return tId === treatmentId || tName?.toLowerCase() === treatmentName
      })

      if (hasMatchingTreatment) {
        addDoctor(doctor)
        break // No need to check other specializations
      }
    }
  }

  // Method 2: Check treatment's doctorCollection (direct doctor links)
  if (treatment?.doctorCollection && treatment.doctorCollection.length > 0) {
    const doctorIds = treatment.doctorCollection.map((d: any) => d._id || d.ID || String(d)).filter(Boolean)
    for (const doctor of allDoctors) {
      if (doctorIds.includes(doctor._id)) {
        addDoctor(doctor)
      }
    }
  }

  // Method 3: Check specialistWithBranch mappings (specialist treatments include this treatment)
  // Then find doctors whose specialization name matches the specialist's specialty
  for (const specialist of specialists) {
    const hasTreatment = specialist.treatments?.some((t) =>
      t._id === treatmentId || t.name?.toLowerCase() === treatmentName
    )

    if (hasTreatment) {
      // Find doctors whose specialization name matches the specialist's specialty name
      const specName = specialist.name?.toLowerCase() || ''
      for (const doctor of allDoctors) {
        const doctorSpecNames = (doctor.specialization || []).map(s => (s.name || '').toLowerCase())
        if (specName && doctorSpecNames.some(name => name.includes(specName) || specName.includes(name))) {
          addDoctor(doctor)
        }
        // Also check if specialist ID matches any specialization _id (fallback)
        const doctorSpecIds = doctor.specialization?.map(s => s._id) || []
        if (doctorSpecIds.includes(specialist._id)) {
          addDoctor(doctor)
        }
      }
    }
  }

  // Method 4: Check doctors who work at branches that offer this treatment
  // Get all branch IDs that offer this treatment
  const branchIdsWithTreatment = new Set<string>()
  treatment?.branchesAvailableAt?.forEach(b => {
    if (b.branchId) branchIdsWithTreatment.add(b.branchId)
  })

  // Also check hospitals' branches
  for (const hospital of hospitals) {
    for (const branch of hospital.branches || []) {
      const branchTreatments = branch.treatments || []
      const hasTreatment = branchTreatments.some((t: any) => {
        const tId = t._id || t.ID || String(t)
        const tName = t.name?.toLowerCase() || ''
        return tId === treatmentId || tName === treatmentName
      })
      if (hasTreatment && branch._id) {
        branchIdsWithTreatment.add(branch._id)
      }
    }
  }

  // Add doctors who work at these branches
  if (branchIdsWithTreatment.size > 0) {
    for (const branchId of branchIdsWithTreatment) {
      getDoctorsByBranchId(cmsData, branchId).forEach(addDoctor)
    }
  }

  return Array.from(uniqueDoctors.values())
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function getValue(item: any | null | undefined, ...keys: string[]): string | null {
  if (!item) return null

  for (const key of keys) {
    let value = item[key]
    if (value === undefined && item.data) {
      value = (item.data as Record<string, unknown>)[key]
    }

    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'string') return value
      if (typeof value === 'object') {
        const obj = value as Record<string, unknown>
        const result = obj.name || obj.title || obj.state || obj.stateName || obj['State Name']
        if (typeof result === 'string') return result
      }
      return String(value)
    }
  }
  return null
}

// =============================================================================
// RE-EXPORTS FROM OTHER MODULES
// =============================================================================

export {
  fetchAllBranches,
  fetchAllHospitals,
  fetchAllTreatments,
  fetchAllDoctors,
  fetchAllSpecialists,
  fetchAllDepartments,
  fetchAllSubDepartments,
  fetchAllTechnologies,
  fetchAllLogos,
  fetchAllCities,
  fetchAllStates,
  fetchTreatmentById,
  fetchSpecialistWithTreatments,
  fetchSpecialistsByBranchId,
  fetchByIds,
  fetchAllBranchesCached,
  fetchAllHospitalsCached,
  fetchAllTreatmentsCached,
  fetchAllDoctorsCached,
  fetchAllCitiesCached,
  fetchAllDepartmentsCached,
  fetchAllSpecialistsCached,
  fetchAllStatesCached,
  fetchAllSubDepartmentsCached,
  fetchAllTechnologiesCached,
  fetchAllLogosCached,
  fetchSpecialistWithTreatmentsCached,
} from './fetchers'

export { extractMultiReference, extractIds, extractHospitalIds, isStandaloneBranch, shouldShowHospital } from './mappers'

export {
  extractRichText,
  extractRichTextHtml,
  extractTextFromRicos,
  stripHtmlTags,
  processWixRichContent,
  sanitizeHtml,
  getRichContentDescription,
  isRichTextContent,
} from './utils'

/**
 * Basic HTML sanitization for server-side rendering
 */
export function basicSanitize(html: string): string {
  if (!html) return ''

  let sanitized = html

  sanitized = sanitized.replace(/class="[^"]*font_8[^"]*"/gi, '')
  sanitized = sanitized.replace(/class='[^']*font_8[^']*'/gi, '')

  return sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s*on\w+="[^"]*"/gi, '')
    .replace(/\s*on\w+='[^']*'/gi, '')
    .replace(/\s*on\w+=\S+/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
}

// Re-export types
export type { RicosContent, ProcessedRichContent } from './types'

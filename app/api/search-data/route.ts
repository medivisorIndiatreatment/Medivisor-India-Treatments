// app/api/search-data/route.ts
// Unified search data endpoint - fetches all data needed for the search page in one call

import { NextResponse } from "next/server"
import { fetchAllHospitals, fetchAllBranches, fetchAllDoctors, fetchAllTreatments, fetchAllSubDepartments, fetchAllSpecialists, fetchAllDepartments, memoryCache } from "@/lib/cms"

// =============================================================================
// TYPES
// =============================================================================

interface SearchDataResponse {
  branches: Array<{
    _id: string
    branchName: string
    hospitalName: string
    address?: string | null
    city: Array<{ cityName?: string; name?: string; state?: string }>
    specialty: Array<{ name: string }>
    specialist: Array<{ name: string }>
    specialization: Array<{ name: string }>
    department: Array<{ name: string }>
    subDepartment: Array<{ name: string }>
    treatments: Array<{ name: string; category?: string }>
    totalBeds?: string | null
    noOfDoctors?: string | null
    yearEstablished?: string | null
    branchImage?: string | null
    popular?: boolean
    showHospital?: boolean
    slug?: string
    hospitalGroup?: string | null
  }>
  doctors: Array<{
    _id: string
    doctorName?: string
    name?: string
    specialization: Array<{ name: string }>
    qualification?: string | null
    designation?: string | null
    experienceYears?: string | null
    profileImage?: string | null
    popular?: boolean
    city: Array<{ cityName?: string; name?: string }>
    hospitalName?: string
    branchName?: string
    slug?: string
  }>
  treatments: Array<{
    _id: string
    name?: string
    description?: string | null
    category?: string | null
    treatmentImage?: string | null
    cost?: string | null
    duration?: string | null
    popular?: boolean
    slug?: string
  }>
  subDepartments: Array<{
    _id: string
    name: string
    specialistMaster: Array<{ _id: string; name: string }>
    treatment: Array<{ _id: string; name: string }>
    departmentMap: Array<{ _id: string; name: string }>
    branchesMasterSubDepartment: Array<{ _id: string; name: string; hospitalName?: string }>
  }>
  filters: {
    cities: Array<{ id: string; name: string; state?: string }>
    states: string[]
    treatments: Array<{ id: string; name: string; category?: string }>
    specializations: Array<{ id: string; name: string; department?: string }>
    specialist: Array<{ id: string; name: string; department?: string }>
    departments: Array<{ id: string; name: string }>
    branches: Array<{ id: string; name: string; hospitalName: string; cities: Array<{ id: string; name: string; state?: string }> }>
    hospitalGroups: Array<{ _id: string; hospitalName: string; slug?: string }>
  }
  meta: {
    totalBranches: number
    totalDoctors: number
    totalTreatments: number
    totalSubDepartments: number
    lastUpdated: string
  }
}

// =============================================================================
// DATA NORMALIZATION
// =============================================================================

function normalizeBranch(branch: any): SearchDataResponse["branches"][0] {
  return {
    _id: branch._id,
    branchName: branch.branchName || branch.name || "",
    hospitalName: branch.hospitalName || "",
    address: branch.address || null,
    city: Array.isArray(branch.city) ? branch.city.map((c: any) => ({
      cityName: c?.cityName || c?.name,
      name: c?.name || c?.cityName,
      state: c?.state,
    })) : [],
    specialty: Array.isArray(branch.specialty) ? branch.specialty.map((s: any) => ({ name: s?.name || "" })) : [],
    specialist: Array.isArray(branch.specialist) ? branch.specialist.map((s: any) => ({ name: s?.name || "" })) : [],
    specialization: Array.isArray(branch.specialization) ? branch.specialization.map((s: any) => ({ name: s?.name || "" })) : [],
    department: Array.isArray(branch.department) ? branch.department.map((d: any) => ({ name: d?.name || "" })) : [],
    subDepartment: Array.isArray(branch.subDepartment) ? branch.subDepartment.map((d: any) => ({ name: d?.name || "" })) : [],
    treatments: Array.isArray(branch.treatments) ? branch.treatments.map((t: any) => ({
      name: t?.name || t?.treatmentName || "",
      category: t?.category || null,
    })) : [],
    totalBeds: branch.totalBeds || null,
    noOfDoctors: branch.noOfDoctors || null,
    yearEstablished: branch.yearEstablished || null,
    branchImage: branch.branchImage || null,
    popular: branch.popular || false,
    showHospital: branch.showHospital !== undefined ? branch.showHospital : true,
    slug: branch.slug || "",
    hospitalGroup: branch.hospitalGroup || null,
  }
}

function normalizeDoctor(doctor: any): SearchDataResponse["doctors"][0] {
  return {
    _id: doctor._id,
    doctorName: doctor.doctorName || doctor.name || "",
    name: doctor.name || doctor.doctorName || "",
    specialization: Array.isArray(doctor.specialization) ? doctor.specialization.map((s: any) => ({ name: s?.name || "" })) : [],
    qualification: doctor.qualification || null,
    designation: doctor.designation || null,
    experienceYears: doctor.experienceYears || doctor.experience || null,
    profileImage: doctor.profileImage || doctor.profileImageUrl || null,
    popular: doctor.popular || false,
    city: Array.isArray(doctor.city) ? doctor.city.map((c: any) => ({
      cityName: c?.cityName || c?.name,
      name: c?.name || c?.cityName,
    })) : [],
    hospitalName: doctor.hospitalName || "",
    branchName: doctor.branchName || "",
    slug: doctor.slug || doctor.doctorSlug || "",
  }
}

function normalizeTreatment(treatment: any): SearchDataResponse["treatments"][0] {
  return {
    _id: treatment._id,
    name: treatment.name || treatment.treatmentName || "",
    description: treatment.description || treatment.descriptionHtml || null,
    category: treatment.category || null,
    treatmentImage: treatment.treatmentImage || treatment.treatmentImageUrl || null,
    cost: treatment.cost || treatment.minPrice || null,
    duration: treatment.duration || null,
    popular: treatment.popular || false,
    slug: treatment.slug || "",
  }
}

function normalizeSubDepartment(subDept: any): SearchDataResponse["subDepartments"][0] {
  const branchesRef = subDept.branchesMasterSubDepartment || subDept.branches || subDept.Branches || []
  const branchArray = Array.isArray(branchesRef) ? branchesRef : [branchesRef]

  return {
    _id: subDept._id,
    name: subDept.name || subDept.subDepartmentName || "",
    specialistMaster: Array.isArray(subDept.specialistMaster) ? subDept.specialistMaster.map((s: any) => ({
      _id: s._id || s.ID || "",
      name: s.name || "",
    })) : [],
    treatment: Array.isArray(subDept.treatment) ? subDept.treatment.map((t: any) => ({
      _id: t._id || t.ID || "",
      name: t.name || "",
    })) : [],
    departmentMap: Array.isArray(subDept.departmentMap) ? subDept.departmentMap.map((d: any) => ({
      _id: d._id || d.ID || d.name || "",
      name: d.name || d.title || "",
    })) : [],
    branchesMasterSubDepartment: branchArray.map((b: any) => ({
      _id: b._id || b.ID || b.name || "",
      name: b.name || b.branchName || "",
      hospitalName: b.hospitalName || "",
    })),
  }
}

function buildFilterOptions(data: {
  hospitals: any[]
  branches: any[]
  doctors: any[]
  treatments: any[]
  subDepartments: any[]
}): SearchDataResponse["filters"] {
  const cityMap = new Map<string, { id: string; name: string; state?: string }>()
  const stateSet = new Set<string>()
  const treatmentMap = new Map<string, { id: string; name: string; category?: string }>()
  const specMap = new Map<string, { id: string; name: string; department?: string }>()
  const deptMap = new Map<string, { id: string; name: string }>()
  const branchMap = new Map<string, { id: string; name: string; hospitalName: string; cities: Array<{ id: string; name: string; state?: string }> }>()
  const hospitalGroupMap = new Map<string, { _id: string; hospitalName: string; slug?: string }>()

  // Extract cities and states from branches
  for (const branch of data.branches) {
    if (branch.hospitalGroup) {
      hospitalGroupMap.set(branch.hospitalGroup, {
        _id: branch.hospitalGroup,
        hospitalName: branch.hospitalName,
        slug: branch.slug,
      })
    }

    for (const city of (branch.city || [])) {
      const cityName = city?.cityName || city?.name || ""
      if (!cityName) continue

      const normalized = cityName.toLowerCase().trim()
      if (!cityMap.has(normalized)) {
        cityMap.set(normalized, {
          id: city._id || normalized,
          name: cityName,
          state: city?.state,
        })
      }
      if (city?.state) stateSet.add(city.state)
    }

    for (const treatment of (branch.treatments || [])) {
      const tid = treatment._id || treatment.name
      const tname = treatment.name || treatment.treatmentName || ""
      if (tid && tname && !treatmentMap.has(tid)) {
        treatmentMap.set(tid, { id: tid, name: tname, category: treatment.category || null })
      }
    }

    for (const spec of (branch.specialist || branch.specialization || [])) {
      const sid = spec._id || spec.name
      const sname = spec.name || ""
      if (sid && sname && !specMap.has(sid)) {
        specMap.set(sid, { id: sid, name: sname })
      }
    }

    for (const dept of (branch.department || [])) {
      const did = dept._id || dept.name
      const dname = dept.name || ""
      if (did && dname && !deptMap.has(did)) {
        deptMap.set(did, { id: did, name: dname })
      }
    }
  }

  // Extract from treatments
  for (const treatment of data.treatments) {
    const tid = treatment._id
    const tname = treatment.name || ""
    if (tid && tname && !treatmentMap.has(tid)) {
      treatmentMap.set(tid, { id: tid, name: tname, category: treatment.category || null })
    }
  }

  // Extract from sub-departments
  for (const subDept of data.subDepartments) {
    for (const dept of (subDept.departmentMap || [])) {
      const did = dept._id || dept.name
      const dname = dept.name || ""
      if (did && dname && !deptMap.has(did)) {
        deptMap.set(did, { id: did, name: dname })
      }
    }
  }

  // Build branch filter options
  for (const branch of data.branches) {
    const branchCities = (branch.city || []).map((c: any) => ({
      id: c._id || (c.cityName || c.name || "").toLowerCase().trim(),
      name: c?.cityName || c?.name || "",
      state: c?.state,
    }))

    branchMap.set(branch._id, {
      id: branch._id,
      name: branch.branchName || branch.name || "",
      hospitalName: branch.hospitalName || "",
      cities: branchCities,
    })
  }

  return {
    cities: Array.from(cityMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    states: Array.from(stateSet).sort(),
    treatments: Array.from(treatmentMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    specializations: Array.from(specMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    specialist: Array.from(specMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    departments: Array.from(deptMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    branches: Array.from(branchMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    hospitalGroups: Array.from(hospitalGroupMap.values()).sort((a, b) => a.hospitalName.localeCompare(b.hospitalName)),
  }
}

// =============================================================================
// CACHED DATA FETCHER
// =============================================================================

async function fetchSearchDataUncached(): Promise<SearchDataResponse> {
   // Fetch all required collections in parallel using individually cached
   // fetchers. This avoids the heavy processing of getAllCMSData() which
   // does extensive branch enrichment and doctor mapping that the search
   // page doesn't need.
   const [hospitalsData, branchesData, doctorsData, treatmentsData, subDepartmentsData, specialistsData, departmentsData] = await Promise.all([
     fetchAllHospitals(),
     fetchAllBranches(true),
     fetchAllDoctors(),
     fetchAllTreatments(),
     fetchAllSubDepartments(),
     fetchAllSpecialists(),
     fetchAllDepartments(),
   ])

   const branches = (branchesData || []).map((branch: any) => normalizeBranch({
     ...branch,
     hospitalName: branch.hospitalName || branch.hospital?.hospitalName || "",
     hospitalGroup: branch.hospitalGroup || null,
     slug: branch.slug || "",
   }))

   const doctors = (doctorsData || []).map((doc: any) => normalizeDoctor(doc))

   const treatments = (treatmentsData || []).map((t: any) => normalizeTreatment(t))

   const subDepartments = (subDepartmentsData || []).map((sd: any) => normalizeSubDepartment(sd))

   const filters = buildFilterOptions({
     hospitals: hospitalsData || [],
     branches,
     doctors,
     treatments,
     subDepartments,
   })

   return {
     branches,
     doctors,
     treatments,
     subDepartments,
     filters,
     meta: {
       totalBranches: branches.length,
       totalDoctors: doctors.length,
       totalTreatments: treatments.length,
       totalSubDepartments: subDepartments.length,
       lastUpdated: new Date().toISOString(),
     },
   }
 }

// Next.js unstable_cache cannot store values larger than 2MB. The combined
// search payload routinely exceeds this (branches/doctors/treatments), so we
// cache the assembled result in module memory instead. The underlying fetchers
// already cache data in server memory via memoryCache, so per-source data
// stays cached; this layer only avoids re-running normalization on every request.
const SEARCH_DATA_TTL = 30 * 60 * 1000 // 30 minutes
let cachedSearchData: SearchDataResponse | null = null
let cachedSearchDataTime = 0

async function getCachedSearchData(): Promise<SearchDataResponse> {
  const now = Date.now()
  if (cachedSearchData && now - cachedSearchDataTime < SEARCH_DATA_TTL) {
    return cachedSearchData
  }

  return memoryCache.dedupe('search_data_payload', async () => {
    const refreshedAt = Date.now()
    if (cachedSearchData && refreshedAt - cachedSearchDataTime < SEARCH_DATA_TTL) {
      return cachedSearchData
    }

    const data = await fetchSearchDataUncached()
    cachedSearchData = data
    cachedSearchDataTime = refreshedAt
    return data
  })
}

// =============================================================================
// API ROUTE
// =============================================================================

export async function GET() {
  try {
    const data = await getCachedSearchData()

    return NextResponse.json(data, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=600, s-maxage=1800, stale-while-revalidate=3600",
        "X-Cache": "HIT",
        "X-Total-Branches": String(data.meta.totalBranches),
        "X-Total-Doctors": String(data.meta.totalDoctors),
        "X-Total-Treatments": String(data.meta.totalTreatments),
        "X-Total-SubDepartments": String(data.meta.totalSubDepartments),
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Search data API error:", errorMessage)

    return NextResponse.json(
      {
        error: "Failed to fetch search data",
        branches: [],
        doctors: [],
        treatments: [],
        subDepartments: [],
        filters: {
          cities: [],
          states: [],
          treatments: [],
          specializations: [],
          specialist: [],
          departments: [],
          branches: [],
          hospitalGroups: [],
        },
        meta: {
          totalBranches: 0,
          totalDoctors: 0,
          totalTreatments: 0,
          totalSubDepartments: 0,
          lastUpdated: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      }
    )
  }
}

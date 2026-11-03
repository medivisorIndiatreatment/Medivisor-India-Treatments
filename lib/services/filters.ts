// lib/services/filters.ts
// Clean filter service - provides all filter options for search pages

import { getAllCMSData, fetchAllSpecialistsCached, fetchAllSubDepartmentsCached, fetchAllDepartmentsCached, fetchAllTreatmentsCached } from '@/lib/cms'
import { DELHI_NCR_CITIES, isDelhiNCR, mapToDelhiNCR } from '@/lib/utils/city-utils'

// =============================================================================
// TYPES
// =============================================================================

export interface FilterOptions {
  cities: Array<{ id: string; name: string; state?: string }>
  states: string[]
  treatments: Array<{ id: string; name: string; category?: string }>
  specializations: Array<{ id: string; name: string; department?: string }>
  departments: Array<{ id: string; name: string }>
  hospitals: Array<{ id: string; name: string }>
  branches: any[]
}

// =============================================================================
// CITY UTILITIES (using centralized from city-utils)
// =============================================================================

function isNCRCity(cityName: string): boolean {
  return DELHI_NCR_CITIES.has(cityName.toLowerCase())
}

// =============================================================================
// MAIN SERVICE
// =============================================================================

/**
 * Get all filter options for search pages
 */
export async function getFilters(): Promise<FilterOptions> {
  const [cmsData, masterSpecialists, subDepartmentsData, departmentsData, treatmentsData] = await Promise.all([
    getAllCMSData(),
    fetchAllSpecialistsCached().catch(() => []),
    fetchAllSubDepartmentsCached().catch(() => []),
    fetchAllDepartmentsCached().catch(() => []),
    fetchAllTreatmentsCached().catch(() => []),
  ])

  const { hospitals } = cmsData

  // Extract unique cities
  const cityMap = new Map<string, { id: string; name: string; state?: string }>()
  const stateSet = new Set<string>()

  hospitals.forEach((hospital: any) => {
    hospital.branches?.forEach((branch: any) => {
      branch.city?.forEach((city: any) => {
        const cityName = city.cityName || city.name
        const state = city.state || city.State

        if (!cityName) return

        // Add individual city first (even if it's an NCR city)
        // This ensures NCR cities like Delhi, Ghaziabad, Noida are shown separately
        if (!cityMap.has(cityName.toLowerCase())) {
          cityMap.set(cityName.toLowerCase(), {
            id: city._id || cityName,
            name: cityName,
            state: state
          })
        }

        // Also add Delhi NCR as a group option (only once)
        // This allows filtering by all NCR cities at once
        if (isNCRCity(cityName)) {
          const ncrKey = 'delhi-ncr-group'
          if (!cityMap.has(ncrKey)) {
            cityMap.set(ncrKey, { id: 'delhi-ncr', name: 'Delhi NCR', state: 'Delhi' })
          }
        }

        if (state) {
          stateSet.add(state)
        }
      })
    })
  })

  const cities = Array.from(cityMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  const states = Array.from(stateSet).sort()

  // Extract unique treatments
  const treatmentMap = new Map<string, { id: string; name: string; category?: string }>()

  // From hospitals
  hospitals.forEach((hospital: any) => {
    hospital.treatments?.forEach((treatment: any) => {
      const treatId = treatment._id || treatment.name
      const treatName = treatment.name || treatment.treatmentName || ''

      if (treatId && treatName && !treatmentMap.has(treatId)) {
        treatmentMap.set(treatId, {
          id: treatId,
          name: treatName,
          category: treatment.category || null
        })
      }
    })

    hospital.branches?.forEach((branch: any) => {
      branch.treatments?.forEach((treatment: any) => {
        const treatId = treatment._id || treatment.name
        const treatName = treatment.name || treatment.treatmentName || ''

        if (treatId && treatName && !treatmentMap.has(treatId)) {
          treatmentMap.set(treatId, {
            id: treatId,
            name: treatName,
            category: treatment.category || null
          })
        }
      })
    })
  })

  // From CMS treatments collection
  treatmentsData.forEach((treatment: any) => {
    const treatId = treatment._id || treatment.name
    const treatName = treatment.name || treatment.treatmentName || ''

    if (treatId && treatName && !treatmentMap.has(treatId)) {
      treatmentMap.set(treatId, {
        id: treatId,
        name: treatName,
        category: treatment.category || null
      })
    }
  })

  const treatments = Array.from(treatmentMap.values()).sort((a, b) => a.name.localeCompare(b.name))

  // Extract unique specializations
  const specMap = new Map<string, { id: string; name: string; department?: string }>()

  // From master specialists
  masterSpecialists.forEach((spec: any) => {
    const specId = spec._id || spec.name
    const specName = spec.name || ''

    if (specId && specName && !specMap.has(specId)) {
      const deptName = spec.department?.[0]?.name || spec.department?.name
      specMap.set(specId, {
        id: specId,
        name: specName,
        department: deptName || null
      })
    }
  })

  // From hospital specialists
  hospitals.forEach((hospital: any) => {
    hospital.specialist?.forEach((spec: any) => {
      const specId = spec._id || spec.name
      const specName = spec.name || ''

      if (specId && specName && !specMap.has(specId)) {
        const deptName = spec.department?.[0]?.name
        specMap.set(specId, {
          id: specId,
          name: specName,
          department: deptName || null
        })
      }
    })

    hospital.branches?.forEach((branch: any) => {
      branch.specialist?.forEach((spec: any) => {
        const specId = spec._id || spec.name
        const specName = spec.name || ''

        if (specId && specName && !specMap.has(specId)) {
          const deptName = spec.department?.[0]?.name
          specMap.set(specId, {
            id: specId,
            name: specName,
            department: deptName || null
          })
        }
      })
    })
  })

  const specializations = Array.from(specMap.values()).sort((a, b) => a.name.localeCompare(b.name))

  // Extract unique departments from BOTH branch data AND sub-department data
  // This ensures the filter shows departments that have actual branches mapped
  const deptMap = new Map<string, { id: string; name: string }>()

  // First, add departments from sub-department data (this has the correct branch mapping)
  subDepartmentsData.forEach((subDept: any) => {
    const deptRefs = subDept.departmentMap || subDept.department || subDept.subDepartment_departmentMap || []
    const deptArray = Array.isArray(deptRefs) ? deptRefs : [deptRefs]
    
    deptArray.forEach((dept: any) => {
      if (!dept) return
      const deptId = dept._id || dept.ID || dept.name || ''
      const deptName = dept.name || dept.title || ''
      
      if (deptId && deptName && !deptMap.has(deptId)) {
        deptMap.set(deptId, { id: deptId, name: deptName })
      }
    })
  })

  // Also add departments from branch data (for backward compatibility)
  hospitals.forEach((hospital: any) => {
    hospital.branches?.forEach((branch: any) => {
      branch.department?.forEach((dept: any) => {
        const deptId = dept._id || dept.name
        const deptName = dept.name || dept.title || ''

        if (deptId && deptName && !deptMap.has(deptId)) {
          deptMap.set(deptId, { id: deptId, name: deptName })
        }
      })
    })

    hospital.specialist?.forEach((spec: any) => {
      spec.department?.forEach((dept: any) => {
        const deptId = dept._id || dept.name
        const deptName = dept.name || ''

        if (deptId && deptName && !deptMap.has(deptId)) {
          deptMap.set(deptId, { id: deptId, name: deptName })
        }
      })
    })
  })

  const departments = Array.from(deptMap.values()).sort((a, b) => a.name.localeCompare(b.name))

  // Extract unique hospitals
  const hospitalMap = new Map<string, { id: string; name: string }>()

  hospitals.forEach((hospital: any) => {
    const hospitalId = hospital._id
    const hospitalName = hospital.hospitalName

    if (hospitalId && hospitalName && !hospitalMap.has(hospitalId)) {
      hospitalMap.set(hospitalId, { id: hospitalId, name: hospitalName })
    }
  })

  const hospitalList = Array.from(hospitalMap.values()).sort((a, b) => a.name.localeCompare(b.name))

  // Extract branches with specialist and sub-department info
  const branchList: any[] = []
  const addedBranchIds = new Set<string>() // Track added branch IDs to avoid duplicates

  // First, add branches from sub-department data (this has the correct branch mapping)
  subDepartmentsData.forEach((subDept: any) => {
    const branchRefs = subDept.branchesMasterSubDepartment || subDept.BranchesMaster_subDepartment || subDept.branches || subDept.Branches || []
    const branchArray = Array.isArray(branchRefs) ? branchRefs : [branchRefs]
    
    branchArray.forEach((branch: any) => {
      if (!branch) return
      const branchId = branch._id || branch.ID || branch.id || ''
      if (branchId && !addedBranchIds.has(branchId)) {
        addedBranchIds.add(branchId)
        branchList.push({
          id: branchId,
          name: branch.name || branch.branchName || branch.branch_name || '',
          hospitalName: branch.hospitalName || branch.hospital?.hospitalName || '',
          cities: [], // Will be enriched from branch data
          specialist: [] // Will be enriched from branch data
        })
      }
    })
  })

  // Then, add branches from hospital data (for branches that might not be in sub-department)
  hospitals.forEach((hospital: any) => {
    hospital.branches?.forEach((branch: any) => {
      const branchId = branch._id

      if (branchId && !addedBranchIds.has(branchId)) {
        addedBranchIds.add(branchId)
        branchList.push({
          id: branchId,
          name: branch.branchName || branch.name || '',
          hospitalName: hospital.hospitalName,
          cities: branch.city?.map((c: any) => ({ id: c._id || c.cityName, name: c.cityName || c.name, state: c.state })) || [],
          specialist: branch.specialist?.map((s: any) => ({ id: s._id || s.name, name: s.name || '' })) || []
        })
      }
    })
  })

  return {
    cities,
    states,
    treatments,
    specializations,
    departments,
    hospitals: hospitalList,
    branches: branchList,
  }
}

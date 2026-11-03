// lib/services/master-data.ts
// Clean master data service - provides all master data with proper relationships

import { getAllCMSData } from '@/lib/cms'
import { generateSlug } from '@/lib/slug-utils'
import type { PaginatedResult } from '@/lib/api/pagination'

// =============================================================================
// TYPES
// =============================================================================

export interface MasterDataFilterParams {
  type?: 'all' | 'departments' | 'specialist' | 'treatments' | 'hospital-groups' | 'branches'
  q?: string
  page?: number
  pageSize?: number
}

// =============================================================================
// EXTRACTORS
// =============================================================================

/** Extract departments with relationships */
function extractDepartments(cmsData: any): any[] {
  const departmentsMap = new Map<string, any>()

  cmsData.hospitals?.forEach((hospital: any) => {
    hospital.branches?.forEach((branch: any) => {
      branch.department?.forEach((dept: any) => {
        const deptId = dept._id || dept.name
        const deptName = dept.name || dept.title || ''

        if (!deptId || !deptName) return

        const existing = departmentsMap.get(deptId) || {
          _id: deptId,
          name: deptName,
          specialist: [],
          branches: [],
          treatments: [],
        }

        const branchRef = { _id: branch._id, branchName: branch.branchName || branch.name || '', hospitalName: hospital.hospitalName }
        if (!existing.branches.some((b: any) => b._id === branchRef._id)) {
          existing.branches.push(branchRef)
        }

        branch.treatments?.forEach((treatment: any) => {
          const treatId = treatment._id || treatment.name
          if (treatId && !existing.treatments.some((t: any) => t._id === treatId)) {
            existing.treatments.push({ _id: treatId, name: treatment.name || treatment.treatmentName || '' })
          }
        })

        branch.specialist?.forEach((spec: any) => {
          const specId = spec._id || spec.name
          if (specId && !existing.specialist.some((s: any) => s._id === specId)) {
            existing.specialist.push({ _id: specId, name: spec.name || '' })
          }
        })

        departmentsMap.set(deptId, existing)
      })
    })
  })

  return Array.from(departmentsMap.values())
}

/** Extract specialists with relationships */
function extractSpecialists(cmsData: any): any[] {
  const specialistMap = new Map<string, any>()

  cmsData.hospitals?.forEach((hospital: any) => {
    // Hospital-level specialists
    hospital.specialist?.forEach((spec: any) => {
      const specId = spec._id || spec.name
      const specName = spec.name || ''

      if (!specId || !specName) return

      const existing = specialistMap.get(specId) || {
        _id: specId,
        specialty: specName,
        doctors: [],
        department: [],
        branches: [],
        treatments: [],
      }

      spec.department?.forEach((dept: any) => {
        const deptId = dept._id || dept.name
        if (deptId && !existing.department.some((d: any) => d._id === deptId)) {
          existing.department.push({ _id: deptId, name: dept.name || '' })
        }
      })

      const hospitalRef = { _id: hospital._id, hospitalName: hospital.hospitalName }
      if (!existing.branches.some((b: any) => b.hospitalId === hospital._id)) {
        existing.branches.push({ ...hospitalRef, branchName: '', branchId: '' })
      }

      spec.treatments?.forEach((treatment: any) => {
        const treatId = treatment._id || treatment.name
        if (treatId && !existing.treatments.some((t: any) => t._id === treatId)) {
          existing.treatments.push({ _id: treatId, name: treatment.name || treatment.treatmentName || '' })
        }
      })

      specialistMap.set(specId, existing)
    })

    // Branch-level specialists
    hospital.branches?.forEach((branch: any) => {
      branch.specialist?.forEach((spec: any) => {
        const specId = spec._id || spec.name
        const specName = spec.name || ''

        if (!specId || !specName) return

        const existing = specialistMap.get(specId) || {
          _id: specId,
          specialty: specName,
          doctors: [],
          department: [],
          branches: [],
          treatments: [],
        }

        const branchRef = {
          hospitalId: hospital._id,
          hospitalName: hospital.hospitalName,
          branchId: branch._id,
          branchName: branch.branchName || branch.name || '',
        }
        if (!existing.branches.some((b: any) => b.branchId === branch._id)) {
          existing.branches.push(branchRef)
        }

        spec.department?.forEach((dept: any) => {
          const deptId = dept._id || dept.name
          if (deptId && !existing.department.some((d: any) => d._id === deptId)) {
            existing.department.push({ _id: deptId, name: dept.name || '' })
          }
        })

        specialistMap.set(specId, existing)
      })
    })
  })

  return Array.from(specialistMap.values())
}

/** Extract treatments with relationships */
function extractTreatments(cmsData: any): any[] {
  const treatmentsMap = new Map<string, any>()

  cmsData.hospitals?.forEach((hospital: any) => {
    // Hospital-level treatments
    hospital.treatments?.forEach((treatment: any) => {
      const treatId = treatment._id || treatment.name
      const treatName = treatment.name || treatment.treatmentName || ''

      if (!treatId || !treatName) return

      const existing = treatmentsMap.get(treatId) || {
        _id: treatId,
        treatmentName: treatName,
        name: treatName,
        department: [],
        specialist: [],
        doctorCollection: [],
        popular: treatment.popular,
        startingCost: treatment.cost || treatment.minPrice,
        treatmentImage: treatment.treatmentImage,
      }

      treatment.department?.forEach((dept: any) => {
        const deptId = dept._id || dept.name
        if (deptId && !existing.department.some((d: any) => d._id === deptId)) {
          existing.department.push({ _id: deptId, name: dept.name || '' })
        }
      })

      if (!existing.hospitals?.some((h: any) => h.hospitalId === hospital._id)) {
        existing.hospitals = existing.hospitals || []
        existing.hospitals.push({ hospitalId: hospital._id, hospitalName: hospital.hospitalName })
      }

      treatmentsMap.set(treatId, existing)
    })

    // Branch-level treatments
    hospital.branches?.forEach((branch: any) => {
      branch.treatments?.forEach((treatment: any) => {
        const treatId = treatment._id || treatment.name
        const treatName = treatment.name || treatment.treatmentName || ''

        if (!treatId || !treatName) return

        const existing = treatmentsMap.get(treatId) || {
          _id: treatId,
          treatmentName: treatName,
          name: treatName,
          department: [],
          specialist: [],
          doctorCollection: [],
          popular: treatment.popular,
          startingCost: treatment.cost || treatment.minPrice,
          treatmentImage: treatment.treatmentImage,
        }

        treatment.department?.forEach((dept: any) => {
          const deptId = dept._id || dept.name
          if (deptId && !existing.department.some((d: any) => d._id === deptId)) {
            existing.department.push({ _id: deptId, name: dept.name || '' })
          }
        })

        treatmentsMap.set(treatId, existing)
      })
    })
  })

  // Also check CMS treatments collection
  cmsData.treatments?.forEach((treatment: any) => {
    const treatId = treatment._id || treatment.name
    const treatName = treatment.name || treatment.treatmentName || ''

    if (!treatId || !treatName) return

    const existing = treatmentsMap.get(treatId) || {
      _id: treatId,
      treatmentName: treatName,
      name: treatName,
      department: [],
      specialist: [],
      doctorCollection: [],
      popular: treatment.popular,
      startingCost: treatment.cost || treatment.minPrice,
      treatmentImage: treatment.treatmentImage,
    }

    treatment.department?.forEach((dept: any) => {
      const deptId = dept._id || dept.name
      if (deptId && !existing.department.some((d: any) => d._id === deptId)) {
        existing.department.push({ _id: deptId, name: dept.name || '' })
      }
    })

    treatmentsMap.set(treatId, existing)
  })

  return Array.from(treatmentsMap.values())
}

/** Extract hospital groups */
function extractHospitalGroups(cmsData: any): any[] {
  const groupsMap = new Map<string, any>()

  cmsData.hospitals?.forEach((hospital: any) => {
    // A hospital group must be a non-standalone hospital that owns branches.
    if (hospital.isStandalone === true) return
    if (!hospital.hospitalName) return
    if (!hospital.branches || hospital.branches.length === 0) return

    const hospitalId = hospital._id
    const hospitalName = hospital.hospitalName
    const slug = hospital.slug || generateSlug(hospitalName)

    // One group per HospitalMaster record, keyed by its unique _id so unrelated
    // hospitals that share a name/slug are never merged.
    if (groupsMap.has(hospitalId)) return

    const branches = hospital.branches
      .filter((branch: any) => branch?._id)
      .map((branch: any) => ({
        _id: branch._id,
        branchName: branch.branchName || branch.name || '',
        hospitalName: hospitalName,
        city: branch.city,
      }))

    const specialty = (hospital.specialty || []).map((spec: any) => ({
      _id: spec?._id || spec?.name,
      name: spec?.name || '',
    }))

    groupsMap.set(hospitalId, {
      _id: hospitalId,
      hospitalName: hospitalName,
      yearEstablished: hospital.yearEstablished,
      hospitalImage: hospital.hospitalImage,
      logo: hospital.logo,
      slug,
      description: hospital.description,
      branches,
      hospitalList: [
        {
          _id: hospitalId,
          hospitalName: hospitalName,
          description: hospital.description,
          yearEstablished: hospital.yearEstablished,
          hospitalImage: hospital.hospitalImage,
          logo: hospital.logo,
        },
      ],
      specialty,
    })
  })

  return Array.from(groupsMap.values())
}

/** Extract branches */
function extractBranches(cmsData: any): any[] {
  const branchesMap = new Map<string, any>()

  cmsData.hospitals?.forEach((hospital: any) => {
    hospital.branches?.forEach((branch: any) => {
      const branchId = branch._id

      if (!branchId) return

      const existing = branchesMap.get(branchId) || {
        _id: branchId,
        branchName: branch.branchName || branch.name || '',
        hospitalId: hospital._id,
        hospitalName: hospital.hospitalName,
        address: branch.address,
        city: branch.city,
        department: [],
        treatments: [],
        specialist: [],
        doctors: [],
        accreditation: [],
        description: branch.description,
        totalBeds: branch.totalBeds,
        yearEstablished: branch.yearEstablished,
        branchImage: branch.branchImage,
        logo: branch.logo,
      }

      branch.department?.forEach((dept: any) => {
        const deptId = dept._id || dept.name
        if (deptId && !existing.department.some((d: any) => d._id === deptId)) {
          existing.department.push({ _id: deptId, name: dept.name || '' })
        }
      })

      branch.treatments?.forEach((treatment: any) => {
        const treatId = treatment._id || treatment.name
        if (treatId && !existing.treatments.some((t: any) => t._id === treatId)) {
          existing.treatments.push({ _id: treatId, name: treatment.name || treatment.treatmentName || '' })
        }
      })

      branch.specialist?.forEach((spec: any) => {
        const specId = spec._id || spec.name
        if (specId && !existing.specialist.some((s: any) => s._id === specId)) {
          existing.specialist.push({ _id: specId, name: spec.name || '' })
        }
      })

      branch.doctors?.forEach((doc: any) => {
        const docId = doc._id || doc.doctorName
        if (docId && !existing.doctors.some((d: any) => d._id === docId)) {
          existing.doctors.push({ _id: docId, doctorName: doc.doctorName || doc.name || '' })
        }
      })

      branchesMap.set(branchId, existing)
    })
  })

  return Array.from(branchesMap.values())
}

// =============================================================================
// FILTERING
// =============================================================================

/** Apply search filter */
function applySearchFilter(items: any[], query: string): any[] {
  if (!query) return items

  const q = query.toLowerCase()
  return items.filter(item => {
    const name = item.name || item.hospitalName || item.branchName || item.specialty || item.treatmentName || ''
    return name.toLowerCase().includes(q)
  })
}

/** Apply pagination */
function applyPagination(items: any[], page: number, pageSize: number) {
  const total = items.length
  const startIndex = page * pageSize
  const endIndex = startIndex + pageSize

  return {
    items: items.slice(startIndex, endIndex),
    pagination: {
      page,
      pageSize,
      total,
      hasMore: endIndex < total,
    },
  }
}

// =============================================================================
// MAIN SERVICE
// =============================================================================

/**
 * Get master data with filtering
 */
export async function getMasterData(filters: MasterDataFilterParams): Promise<any> {
  const cmsData = await getAllCMSData()

  // Extract all data types
  const departments = extractDepartments(cmsData)
  const specialists = extractSpecialists(cmsData)
  const treatments = extractTreatments(cmsData)
  const hospitalGroups = extractHospitalGroups(cmsData)
  const branches = extractBranches(cmsData)

  // Apply filters based on type
  let result: any = {}

  if (filters.type === 'all' || !filters.type) {
    result = {
      departments: applySearchFilter(departments, filters.q || ''),
      specialist: applySearchFilter(specialists, filters.q || ''),
      treatments: applySearchFilter(treatments, filters.q || ''),
      hospitalGroups: applySearchFilter(hospitalGroups, filters.q || ''),
      branches: applySearchFilter(branches, filters.q || ''),
      totals: {
        departments: departments.length,
        specialist: specialists.length,
        treatments: treatments.length,
        hospitalGroups: hospitalGroups.length,
        branches: branches.length,
      },
    }
  } else {
    switch (filters.type) {
      case 'departments':
        result = applyPagination(applySearchFilter(departments, filters.q || ''), filters.page || 0, filters.pageSize || 100)
        break
      case 'specialist':
        result = applyPagination(applySearchFilter(specialists, filters.q || ''), filters.page || 0, filters.pageSize || 100)
        break
      case 'treatments':
        result = applyPagination(applySearchFilter(treatments, filters.q || ''), filters.page || 0, filters.pageSize || 100)
        break
      case 'hospital-groups':
        result = applyPagination(applySearchFilter(hospitalGroups, filters.q || ''), filters.page || 0, filters.pageSize || 100)
        break
      case 'branches':
        result = applyPagination(applySearchFilter(branches, filters.q || ''), filters.page || 0, filters.pageSize || 100)
        break
    }
  }

  return result
}

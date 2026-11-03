// app/api/sub-department/route.ts
// Clean sub-department API using centralized CMS functions

import { NextResponse } from 'next/server'
import { fetchAllSubDepartments, fetchAllDepartments, fetchAllSpecialists, fetchAllTreatments } from '@/lib/cms'
import { CACHE_HEADERS } from '@/lib/api/pagination'

// =============================================================================
// TYPES
// =============================================================================

interface SubDepartmentRef {
  _id?: string
  name?: string
  branchName?: string
  hospitalName?: string
}

interface SubDepartmentItem {
  _id: string
  name: string
  specialistMaster: SubDepartmentRef[]
  treatment: SubDepartmentRef[]
  departmentMap: SubDepartmentRef[]
  branchesMasterSubDepartment: SubDepartmentRef[]
}

// =============================================================================
// PARSING
// =============================================================================

function parseParams(url: URL) {
  return {
    search: url.searchParams.get('search') || undefined,
    department: url.searchParams.get('department') || undefined,
    specialist: url.searchParams.get('specialist') || undefined,
    treatment: url.searchParams.get('treatment') || undefined,
    branch: url.searchParams.get('branch') || undefined,
    page: Math.max(0, parseInt(url.searchParams.get('page') || '0', 10)),
    pageSize: Math.min(5000, Math.max(1, parseInt(url.searchParams.get('pageSize') || '1000', 10))),
  }
}

// =============================================================================
// NORMALIZATION - Using reverse lookup approach
// =============================================================================

// Note: normalizeSubDepartment function is now inlined in the GET handler
// to properly link specialists and treatments using reverse lookups

// =============================================================================
// FILTERING
// =============================================================================

function applyFilters(items: SubDepartmentItem[], filters: ReturnType<typeof parseParams>) {
  let result = [...items]

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    result = result.filter(item =>
      item.name.toLowerCase().includes(searchLower) ||
      item.departmentMap.some(d => d.name?.toLowerCase().includes(searchLower)) ||
      item.specialistMaster.some(s => s.name?.toLowerCase().includes(searchLower)) ||
      item.treatment.some(t => t.name?.toLowerCase().includes(searchLower))
    )
  }

  if (filters.department) {
    const deptLower = filters.department.toLowerCase()
    result = result.filter(item =>
      item.departmentMap.some(d => d.name?.toLowerCase().includes(deptLower))
    )
  }

  if (filters.specialist) {
    const specLower = filters.specialist.toLowerCase()
    result = result.filter(item =>
      item.specialistMaster.some(s => s.name?.toLowerCase().includes(specLower))
    )
  }

  if (filters.treatment) {
    const treatLower = filters.treatment.toLowerCase()
    result = result.filter(item =>
      item.treatment.some(t => t.name?.toLowerCase().includes(treatLower))
    )
  }

  if (filters.branch) {
    const branchLower = filters.branch.toLowerCase()
    result = result.filter(item =>
      item.branchesMasterSubDepartment.some(b => 
        b.name?.toLowerCase().includes(branchLower) ||
        b.hospitalName?.toLowerCase().includes(branchLower)
      )
    )
  }

  return result
}

// =============================================================================
// API ROUTE
// =============================================================================

/**
 * GET /api/sub-department
 * 
 * Query parameters:
 * - search: Search by name, department, specialist, or treatment
 * - department: Filter by department
 * - specialist: Filter by specialist
 * - treatment: Filter by treatment
 * - branch: Filter by branch
 * - page: Page number (default: 0)
 * - pageSize: Items per page (default: 20, max: 100)
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const filters = parseParams(url)

    // Fetch all sub-departments
    const rawItems = await fetchAllSubDepartments()
    
    // Fetch all departments for name resolution
    let departmentsData: any[] = []
    let specialistData: any[] = []
    let treatmentData: any[] = []
    
    try {
      departmentsData = await fetchAllDepartments() ?? []
    } catch (err) {
      console.error('Failed to fetch departments for sub-department normalization:', err)
      departmentsData = []
    }
    
    try {
      specialistData = await fetchAllSpecialists() ?? []
    } catch (err) {
      console.error('Failed to fetch specialists for sub-department normalization:', err)
      specialistData = []
    }
    
    try {
      treatmentData = await fetchAllTreatments() ?? []
    } catch (err) {
      console.error('Failed to fetch treatments for sub-department normalization:', err)
      treatmentData = []
    }
    
    // Create departments lookup map
    const departmentsLookup = new Map<string, string>()
    departmentsData.forEach((dept: any) => {
      const deptId = dept._id || dept.ID || dept.name
      const deptName = dept.name || dept.title || ''
      if (deptId && deptName) {
        departmentsLookup.set(String(deptId), deptName)
      }
    })
    
    // Create specialists lookup and REVERSE lookup for sub-department linking
    // Format: specialist ID -> specialist name
    const specialistLookup = new Map<string, string>()
    // Format: sub-department ID -> array of specialist IDs that belong to it
    const subDeptToSpecialistsMap = new Map<string, Set<string>>()
    
    specialistData.forEach((spec: any) => {
      const specId = spec._id || spec.ID || ''
      const specName = spec.name || spec.title || ''
      if (specId && specName) {
        specialistLookup.set(String(specId), specName)
        
        // Get the sub-department references from the specialist
        // The specialist has "SubDepartment" or "subDepartment_specialist" field
        const subDeptRefs = spec.SubDepartment || spec.subDepartment || spec.subDepartment_specialist || spec['subDepartment_specialist'] || []
        
        // Handle both array and single value
        const refs = Array.isArray(subDeptRefs) ? subDeptRefs : [subDeptRefs]
        refs.forEach((ref: any) => {
          const refId = typeof ref === 'string' ? ref : (ref._id || ref.ID || ref.id || '')
          if (refId) {
            if (!subDeptToSpecialistsMap.has(refId)) {
              subDeptToSpecialistsMap.set(refId, new Set())
            }
            subDeptToSpecialistsMap.get(refId)?.add(specId)
          }
        })
      }
    })
    
    // Create treatments lookup and REVERSE lookup for sub-department linking
    // Format: treatment ID -> treatment name
    const treatmentLookup = new Map<string, string>()
    // Format: sub-department ID -> array of treatment IDs that belong to it
    const subDeptToTreatmentsMap = new Map<string, Set<string>>()
    
    treatmentData.forEach((treat: any) => {
      const treatId = treat._id || treat.ID || ''
      const treatName = treat['Treatment Name'] || 
                       treat.treatmentName || 
                       treat.treatment_name || 
                       treat.name || 
                       treat.title || 
                       ''
      if (treatId && treatName) {
        treatmentLookup.set(String(treatId), treatName)
        
        const subDeptRefs = treat.subDepartment_treatment || 
                           treat['subDepartment_treatment'] || 
                           treat.SubDepartment ||
                           treat.subDepartment ||
                           []
        
        const refs = Array.isArray(subDeptRefs) ? subDeptRefs : [subDeptRefs]
        refs.forEach((ref: any) => {
          const refId = typeof ref === 'string' ? ref : (ref._id || ref.ID || ref.id || '')
          if (refId) {
            if (!subDeptToTreatmentsMap.has(refId)) {
              subDeptToTreatmentsMap.set(refId, new Set())
            }
            subDeptToTreatmentsMap.get(refId)?.add(treatId)
          }
        })
      }
    })
    
    // Now create the normalized items with linked specialists and treatments
    const items = rawItems.map((item: any) => {
      const subDeptId = item._id || item.ID || ''
      const name = item.name || item.subDepartmentName || item.title || item.subDepartment || ''
      
      // Get linked specialists from reverse lookup
      const linkedSpecIds = subDeptToSpecialistsMap.get(subDeptId) || new Set()
      const specialistMaster = Array.from(linkedSpecIds).map(specId => ({
        _id: specId,
        name: specialistLookup.get(specId) || '',
        branchName: '',
        hospitalName: '',
      }))
      
      // Get linked treatments from reverse lookup
      const linkedTreatIds = subDeptToTreatmentsMap.get(subDeptId) || new Set()
      const treatment = Array.from(linkedTreatIds).map(treatId => ({
        _id: treatId,
        name: treatmentLookup.get(treatId) || '',
        branchName: '',
        hospitalName: '',
      }))
      
      // Extract other fields normally
      const extractRefs = (field: any, lookup?: Map<string, string>): SubDepartmentRef[] => {
        if (!field) return []
        if (Array.isArray(field)) {
          return field.map((ref: any) => {
            const refId = ref._id || ref.ID || ref.id || (typeof ref === 'string' ? ref : '')
            let refName = ref.name || ref.title || ref.specialty || ref.specialtyName || ''
            if (!refName && refId && lookup?.has(refId)) {
              refName = lookup.get(refId) || ''
            }
            return {
              _id: refId,
              name: refName,
              branchName: ref.branchName || ref.name || '',
              hospitalName: ref.hospitalName || ref.hospital?.hospitalName || '',
            }
          }).filter((ref: SubDepartmentRef) => ref._id)
        }
        if (field && typeof field === 'object') {
          const refId = field._id || field.ID || field.id
          let refName = field.name || field.title || field.specialty || field.specialtyName || ''
          if (!refName && refId && lookup?.has(refId)) {
            refName = lookup.get(refId) || ''
          }
          return [{
            _id: refId,
            name: refName,
            branchName: field.branchName || field.name || '',
            hospitalName: field.hospitalName || field.hospital?.hospitalName || '',
          }]
        }
        return []
      }
      
      const departmentMapField = item.departmentMap || item.subDepartment_departmentMap || item.department || item.Department
      const branchesField = item.BranchesMaster_subDepartment || item.branchesMaster_subDepartment || item.branches || item.Branches
      
      return {
        _id: subDeptId,
        name,
        specialistMaster,
        treatment,
        departmentMap: extractRefs(departmentMapField, departmentsLookup),
        branchesMasterSubDepartment: extractRefs(branchesField),
      }
    })
    
    // Apply filters
    const filtered = applyFilters(items, filters)
    
    // Pagination
    const page = filters.page
    const pageSize = filters.pageSize
    const startIndex = page * pageSize
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize)
    const hasMore = startIndex + pageSize < filtered.length
    const total = filtered.length

    // Extract unique filter options - with proper deduplication
    const departments = [...new Set(
      items.flatMap(item => item.departmentMap.map(d => d.name)).filter(Boolean)
    )].sort()
    
    const specialists = [...new Set(
      items.flatMap(item => item.specialistMaster.map(s => s.name)).filter(Boolean)
    )].sort()
    
    const treatments = [...new Set(
      items.flatMap(item => item.treatment.map(t => t.name)).filter(Boolean)
    )].sort()
    
    // Proper branch deduplication using Map by ID
    const branchesMap = new Map<string, { id: string; name: string; hospitalName: string }>()
    items.forEach(item => {
      item.branchesMasterSubDepartment.forEach(b => {
        const branchId = b._id || b.name || ''
        if (branchId) {
          // Use branchName as the display name, fallback to hospitalName
          const displayName = b.branchName || b.name || b.hospitalName || ''
          if (!branchesMap.has(branchId)) {
            branchesMap.set(branchId, {
              id: branchId,
              name: displayName,
              hospitalName: b.hospitalName || '',
            })
          }
        }
      })
    })
    const branches = Array.from(branchesMap.values())

    return NextResponse.json({
      items: paginatedItems,
      total,
      page,
      pageSize,
      hasMore,
      filters: {
        departments,
        specialists,
        treatments,
        branches,
      },
    }, {
      headers: CACHE_HEADERS,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      {
        error: 'Failed to fetch sub-departments',
      },
      {
        status: 500,
      }
    )
  }
}

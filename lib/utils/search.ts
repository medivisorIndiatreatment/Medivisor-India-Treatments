// File: lib/utils/search.ts
// Utility functions for SearchInput component

import type {
  SearchItem,
  SearchItemType,
  BranchData,
  DoctorData,
  TreatmentData,
  SubDepartmentData,
  HierarchicalData,
  ViewType,
  HospitalGroupData,
} from '@/types/searchInput'
import { generateSlug } from '@/lib/slug-utils'

// ===========================================
// Icon Type Identifiers
// ===========================================

export type IconType = 'department' | 'subDepartment' | 'specialist' | 'treatment' | 'hospital' | 'hospitalGroup' | 'doctor'

// ===========================================
// Helper Functions
// ===========================================

/**
 * Safely get array length
 */
function getArrayLength(arr: unknown[] | undefined | null): number {
  if (!Array.isArray(arr)) return 0
  return arr.length
}

/**
 * Create unique ID with prefix
 */
function createId(prefix: string, id: string | undefined): string {
  return `${prefix}-${id || ''}`
}

/**
 * Get slug from name - uses centralized generateSlug for consistency
 */
function getSlug(name: string | null | undefined): string {
  return generateSlug(name)
}

// ===========================================
// Data Builders
// ===========================================

/**
 * Build department items from hierarchical data (departments + sub-departments only, NO specialists)
 * For Hospital tab search - no specialists shown
 */
function buildDepartmentItemsForHospitals(
  departments: HierarchicalData['departments']
): SearchItem[] {
  const items: SearchItem[] = []

  for (const dept of departments) {
    if (!dept.name) continue

    const isUnknownDept = dept.name.toLowerCase() === 'unknown department'
    const subDeptCount = getArrayLength(dept.subDepartments)

    // Build subInfo - no specialist count for hospitals view
    const subInfo = subDeptCount > 0 
      ? `${subDeptCount} sub-department${subDeptCount !== 1 ? 's' : ''}`
      : 'View department'

    // Only add department item if it's not "Unknown Department"
    if (!isUnknownDept) {
      items.push({
        id: `hier-dept-${dept._id || dept.name}`,
        name: dept.name,
        slug: getSlug(dept.name),
        type: 'Department',
        icon: 'department',
        subInfo,
        relatedData: dept,
        hierarchy: { department: dept.name },
      })
    }

    // Add sub-departments only - NO specialists for hospitals view
    if (dept.subDepartments) {
      for (const subDept of dept.subDepartments) {
        if (!subDept.name) continue

        const treatmentCount = getArrayLength(subDept.treatments)
        
        let subDeptSubInfo = ''
        if (treatmentCount > 0) {
          subDeptSubInfo = `${treatmentCount} treatment${treatmentCount !== 1 ? 's' : ''}`
        } else if (subDept.branchIds && subDept.branchIds.length > 0) {
          subDeptSubInfo = `${subDept.branchIds.length} hospital${subDept.branchIds.length !== 1 ? 's' : ''}`
        } else {
          subDeptSubInfo = 'View details'
        }

        // Build hierarchy: include department only if it's known
        const hierarchy: any = { subDepartment: subDept.name }
        if (!isUnknownDept) {
          hierarchy.department = dept.name
        }

        items.push({
          id: `hier-subdept-${subDept._id || subDept.name}`,
          name: subDept.name,
          slug: getSlug(subDept.name),
          type: 'SubDepartment',
          icon: 'subDepartment',
          subInfo: subDeptSubInfo,
          relatedData: subDept,
          hierarchy,
        })
        // NO specialists added for hospitals view
      }
    }
  }

  return items
}

/**
 * Build department items from hierarchical data (with specialists)
 * For default/all view - includes specialists
 */
function buildDepartmentItems(
  departments: HierarchicalData['departments']
): SearchItem[] {
  const items: SearchItem[] = []

  for (const dept of departments) {
    if (!dept.name) continue

    const isUnknownDept = dept.name.toLowerCase() === 'unknown department'
    const subDeptCount = getArrayLength(dept.subDepartments)
    const specCount = dept.totalSpecialists ?? 
      dept.subDepartments?.reduce((acc, sd) => acc + getArrayLength(sd.specialists), 0) ?? 0

    // Build subInfo
    let subInfo = ''
    if (subDeptCount > 0) {
      subInfo = `${subDeptCount} sub-department${subDeptCount !== 1 ? 's' : ''}`
      if (specCount > 0) {
        subInfo += ` • ${specCount} specialist${specCount !== 1 ? 's' : ''}`
      }
    } else {
      subInfo = 'View department'
    }

    // Only add department item if it's not "Unknown Department"
    if (!isUnknownDept) {
      items.push({
        id: `hier-dept-${dept._id || dept.name}`,
        name: dept.name,
        slug: getSlug(dept.name),
        type: 'Department',
        icon: 'department',
        subInfo,
        relatedData: dept,
        hierarchy: { department: dept.name },
      })
    }

    // Add sub-departments
    if (dept.subDepartments) {
      for (const subDept of dept.subDepartments) {
        if (!subDept.name) continue

        const specialistCount = getArrayLength(subDept.specialists)
        const treatmentCount = getArrayLength(subDept.treatments)
        
        let subDeptSubInfo = ''
        if (specialistCount > 0 || treatmentCount > 0) {
          const parts: string[] = []
          if (specialistCount > 0) {
            parts.push(`${specialistCount} specialist${specialistCount !== 1 ? 's' : ''}`)
          }
          if (treatmentCount > 0) {
            parts.push(`${treatmentCount} treatment${treatmentCount !== 1 ? 's' : ''}`)
          }
          subDeptSubInfo = parts.join(' • ')
        } else if (subDept.branchIds && subDept.branchIds.length > 0) {
          subDeptSubInfo = `${subDept.branchIds.length} hospital${subDept.branchIds.length !== 1 ? 's' : ''}`
        } else {
          subDeptSubInfo = 'View details'
        }

        // Build hierarchy: include department only if it's known
        const hierarchy: any = { subDepartment: subDept.name }
        if (!isUnknownDept) {
          hierarchy.department = dept.name
        }

        items.push({
          id: `hier-subdept-${subDept._id || subDept.name}`,
          name: subDept.name,
          slug: getSlug(subDept.name),
          type: 'SubDepartment',
          icon: 'subDepartment',
          subInfo: subDeptSubInfo,
          relatedData: subDept,
          hierarchy,
        })

        // Add specialists
        if (subDept.specialists) {
          for (const spec of subDept.specialists) {
            if (!spec.name) continue

            const treatmentCount = getArrayLength(spec.treatments)
            items.push({
              id: `hier-spec-${spec._id || spec.name}`,
              name: spec.name,
              slug: getSlug(spec.name),
              type: 'Specialist',
              icon: 'specialist',
              subInfo: treatmentCount > 0 
                ? `${treatmentCount} treatment${treatmentCount !== 1 ? 's' : ''}` 
                : subDept.name,
              relatedData: { ...spec, department: dept.name, subDepartment: subDept.name },
              hierarchy: { department: dept.name, subDepartment: subDept.name },
            })
          }
        }
      }
    }
  }

  return items
}

/**
 * Build treatment items from hierarchical data
 */
function buildTreatmentItems(
  allSubDepartments: HierarchicalData['allSubDepartments']
): SearchItem[] {
  const items: SearchItem[] = []
  const addedIds = new Set<string>()

  const addItem = (item: SearchItem) => {
    if (!addedIds.has(item.id)) {
      addedIds.add(item.id)
      items.push(item)
    }
  }

  for (const subDept of allSubDepartments) {
    const treatments = subDept.treatments
    if (!treatments) continue

    for (const treat of treatments) {
      if (!treat.name) continue

      addItem({
        id: `hier-treat-${treat._id || treat.name}`,
        name: treat.name,
        slug: getSlug(treat.name),
        type: 'Treatment',
        icon: 'treatment',
        subInfo: subDept.name,
        relatedData: { ...treat, subDepartment: subDept.name, department: subDept.departmentName },
        hierarchy: { department: subDept.departmentName, subDepartment: subDept.name },
      })
    }
  }

  return items
}

/**
 * Build hospital items from hierarchical data
 */
function buildHospitalItemsFromHierarchical(
  allSubDepartments: HierarchicalData['allSubDepartments']
): SearchItem[] {
  const items: SearchItem[] = []
  const addedIds = new Set<string>()

  const addItem = (item: SearchItem) => {
    if (!addedIds.has(item.id)) {
      addedIds.add(item.id)
      items.push(item)
    }
  }

  for (const subDept of allSubDepartments) {
    const branchIds = subDept.branchIds
    const branchNames = subDept.branchNames
    if (!branchIds) continue

    for (let idx = 0; idx < branchIds.length; idx++) {
      const branchId = branchIds[idx]
      const branchName = branchNames?.[idx]
      if (!branchName) continue

      addItem({
        id: `hier-branch-${branchId}`,
        name: branchName,
        slug: getSlug(branchName),
        type: 'Hospital',
        icon: 'hospital',
        subInfo: `${subDept.name} • ${subDept.departmentName}`,
        relatedData: { branchId, branchName, subDepartment: subDept.name, department: subDept.departmentName },
        hierarchy: { department: subDept.departmentName, subDepartment: subDept.name },
      })
    }
  }

  return items
}

/**
 * Get slug from name - check if city is already included
 */
function getCorrectSlug(name: string | null | undefined, city?: string): string {
  if (!name) return ''
  
  if (name && city) {
    // Check if city is already in branch name (same logic as HospitalCard.tsx)
    const normalizedName = name.toLowerCase().replace(/\s+/g, '')
    const normalizedCity = city.toLowerCase().replace(/\s+/g, '')
    
    if (normalizedName.includes(normalizedCity)) {
      return getSlug(name)
    }
    return getSlug(`${name} ${city}`)
  }
  return getSlug(name)
}

/**
 * Build hospital items from branches prop
 */
function buildBranchItems(branches: BranchData[]): SearchItem[] {
  const items: SearchItem[] = []

  for (const branch of branches) {
    const branchName = branch.branchName || branch.name
    if (!branchName) continue

    const cityName = branch.city?.[0]?.cityName || branch.cityName || ''
    const deptNames = branch.department?.map(d => d.name).join(', ') || ''
    const branchId = branch._id || ''
    
    // Generate slug - avoid duplicating city if it's already in branch name (matching HospitalCard.tsx)
    const slug = getCorrectSlug(branchName, cityName)

    items.push({
      id: `branch-${branchId || branchName}`,
      name: branchName,
      slug: slug,
      type: 'Hospital',
      icon: 'hospital',
      subInfo: cityName 
        ? `${cityName}${deptNames ? ' • ' + deptNames : ''}` 
        : (branch.hospitalName || deptNames || 'Hospital'),
      relatedData: { ...branch, branchId },
      hierarchy: { department: deptNames },
    })
  }

  return items
}

/**
 * Build doctor items
 */
function buildDoctorItems(doctors: DoctorData[]): SearchItem[] {
  const items: SearchItem[] = []

  for (const doc of doctors) {
    const docName = doc.doctorName || doc.name
    if (!docName) continue

    // Use stored slug if available (includes ID suffix for uniqueness), otherwise generate with ID
    const slug = doc.slug || (doc._id ? getSlug(docName) + '-' + doc._id.slice(-6) : getSlug(docName))

    items.push({
      id: `doc-${doc._id || docName}`,
      name: docName,
      slug: slug,
      type: 'Doctor',
      icon: 'doctor',
      subInfo: doc.specialization?.[0]?.name || doc.qualification || '',
      relatedData: doc,
    })
  }

  return items
}

/**
 * Build treatment items from treatments prop
 */
function buildTreatmentItemsDirect(treatments: TreatmentData[]): SearchItem[] {
  const items: SearchItem[] = []

  for (const treat of treatments) {
    if (!treat.name) continue

    items.push({
      id: `treat-${treat._id || treat.name}`,
      name: treat.name,
      slug: getSlug(treat.name),
      type: 'Treatment',
      icon: 'treatment',
      subInfo: treat.category || '',
      relatedData: treat,
    })
  }

  return items
}

/**
 * Build items from legacy sub-departments format
 */
function buildLegacySubDepartmentItems(subDepartments: SubDepartmentData[]): SearchItem[] {
  const items: SearchItem[] = []

  for (const subDept of subDepartments) {
    if (!subDept.name) continue

    // Add the sub-department itself
    const subDeptId = subDept._id || `subdept-${subDept.name}`
    items.push({
      id: subDeptId,
      name: subDept.name,
      slug: getSlug(subDept.name),
      type: 'SubDepartment',
      icon: 'subDepartment',
      subInfo: subDept.departmentMap?.[0]?.name || 'Sub-Department',
      relatedData: subDept,
    })

    // Add linked specialists
    const specialists = subDept.specialistMaster
    if (specialists) {
      for (const spec of specialists) {
        if (!spec.name) continue
        items.push({
          id: `spec-${spec._id || spec.name}`,
          name: spec.name,
          slug: getSlug(spec.name),
          type: 'Specialist',
          icon: 'specialist',
          subInfo: subDept.name,
          relatedData: { ...subDept, specialist: spec },
        })
      }
    }

    // Add linked treatments
    const treatments = subDept.treatment
    if (treatments) {
      for (const treat of treatments) {
        if (!treat.name) continue
        items.push({
          id: `treat-${treat._id || treat.name}`,
          name: treat.name,
          slug: getSlug(treat.name),
          type: 'Treatment',
          icon: 'treatment',
          subInfo: subDept.name,
          relatedData: { ...subDept, treatment: treat },
        })
      }
    }

    // Add linked branches/hospitals
    const branches = subDept.branchesMasterSubDepartment
    if (branches) {
      for (const branch of branches) {
        if (!branch.name) continue
        items.push({
          id: `branch-${branch._id || branch.name}`,
          name: branch.name,
          slug: getSlug(branch.name),
          type: 'Hospital',
          icon: 'hospital',
          subInfo: branch.hospitalName || subDept.name,
          relatedData: { ...subDept, branch },
        })
      }
    }
  }

  return items
}

/**
 * Build department items from branches (legacy)
 */
function buildDepartmentsFromBranches(branches: BranchData[], subDepartments: SubDepartmentData[]): SearchItem[] {
  const departments = new Map<string, string>()

  // Add from branches
  for (const branch of branches) {
    const depts = branch.department
    if (depts) {
      for (const d of depts) {
        if (d.name) departments.set(d.name, d.name)
      }
    }
  }

  // Add from sub-departments
  for (const subDept of subDepartments) {
    const deptMap = subDept.departmentMap
    if (deptMap) {
      for (const d of deptMap) {
        if (d.name) departments.set(d.name, d.name)
      }
    }
  }

  return Array.from(departments.keys()).map(name => ({
    id: name,
    name,
    slug: getSlug(name),
    type: 'Department' as SearchItemType,
    icon: 'department',
  }))
}

/**
 * Build specialist items from branches (legacy)
 */
function buildSpecialistsFromBranches(branches: BranchData[], subDepartments: SubDepartmentData[]): SearchItem[] {
  const specialists = new Map<string, string>()

  // Add from branches
  for (const branch of branches) {
    const specs = branch.specialist
    if (specs) {
      for (const s of specs) {
        if (s.name) specialists.set(s.name, s.name)
      }
    }
  }

  // Add from sub-departments
  for (const subDept of subDepartments) {
    const specs = subDept.specialistMaster
    if (specs) {
      for (const s of specs) {
        if (s.name) specialists.set(s.name, s.name)
      }
    }
  }

  return Array.from(specialists.keys()).map(name => ({
    id: name,
    name,
    slug: getSlug(name),
    type: 'Specialist' as SearchItemType,
    icon: 'specialist',
  }))
}

/**
 * Build treatment items from branches (legacy)
 */
function buildTreatmentsFromBranches(branches: BranchData[], subDepartments: SubDepartmentData[]): SearchItem[] {
  const treatmentsSet = new Map<string, string>()

  // Add from branches
  for (const branch of branches) {
    const treats = branch.treatments
    if (treats) {
      for (const t of treats) {
        if (t.name) treatmentsSet.set(t.name, t.name)
      }
    }
  }

  // Add from sub-departments
  for (const subDept of subDepartments) {
    const treats = subDept.treatment
    if (treats) {
      for (const t of treats) {
        if (t.name) treatmentsSet.set(t.name, t.name)
      }
    }
  }

  return Array.from(treatmentsSet.keys()).map(name => ({
    id: name,
    name,
    slug: getSlug(name),
    type: 'Treatment' as SearchItemType,
    icon: 'treatment',
  }))
}

/**
 * Build hospital group items
 */
function buildHospitalGroupItems(hospitalGroups: HospitalGroupData[]): SearchItem[] {
  const items: SearchItem[] = []

  for (const group of hospitalGroups) {
    if (!group.hospitalName) continue

    items.push({
      id: `hg-${group._id || group.hospitalName}`,
      name: group.hospitalName,
      slug: group.slug || getSlug(group.hospitalName),
      type: 'HospitalGroup',
      icon: 'hospitalGroup',
      subInfo: 'Hospital Group',
      relatedData: group,
    })
  }

  return items
}

// ===========================================
// Main GetAllData Function
// ===========================================

/**
 * Get all search items from various data sources
 */
export function getAllData(
  view: ViewType,
  branches: BranchData[],
  doctors: DoctorData[],
  treatments: TreatmentData[],
  subDepartments: SubDepartmentData[] = [],
  hierarchicalData?: HierarchicalData,
  hospitalGroups: HospitalGroupData[] = []
): SearchItem[] {
  // Use Set for O(1) deduplication
  const addedIds = new Set<string>()
  const items: SearchItem[] = []

  const addItem = (item: SearchItem) => {
    if (!addedIds.has(item.id)) {
      addedIds.add(item.id)
      items.push(item)
    }
  }

  // Use hierarchical data when available
  if (hierarchicalData) {
    // FOR HOSPITALS VIEW: show only hospitals, departments, sub-departments (NO specialists)
    if (view === 'hospitals') {
      // Add departments with sub-departments (NO specialists)
      for (const item of buildDepartmentItemsForHospitals(hierarchicalData.departments)) {
        addItem(item)
      }

      // Add hospitals from hierarchical data
      for (const item of buildHospitalItemsFromHierarchical(hierarchicalData.allSubDepartments)) {
        addItem(item)
      }

      // Add all branches from branches prop (ensures complete coverage)
      for (const item of buildBranchItems(branches)) {
        addItem(item)
      }

      return items
    }

    // FOR TREATMENTS VIEW: show only treatments
    if (view === 'treatments') {
      // Add treatments from hierarchical data
      for (const item of buildTreatmentItems(hierarchicalData.allSubDepartments)) {
        addItem(item)
      }

      // Add all treatments directly
      for (const item of buildTreatmentItemsDirect(treatments)) {
        addItem(item)
      }

      return items
    }

    // FOR DOCTORS VIEW: show only doctors
    if (view === 'doctors') {
      // Add all doctors
      for (const item of buildDoctorItems(doctors)) {
        addItem(item)
      }

      return items
    }

    // Default: include all (fallback for unknown view)
    // Add departments with sub-departments and specialists
    for (const item of buildDepartmentItems(hierarchicalData.departments)) {
      addItem(item)
    }

    // Add treatments from hierarchical data
    for (const item of buildTreatmentItems(hierarchicalData.allSubDepartments)) {
      addItem(item)
    }

    // Add hospitals from hierarchical data
    for (const item of buildHospitalItemsFromHierarchical(hierarchicalData.allSubDepartments)) {
      addItem(item)
    }

    // Add all branches from branches prop (ensures complete coverage)
    for (const item of buildBranchItems(branches)) {
      addItem(item)
    }

    // Add all hospital groups
    for (const item of buildHospitalGroupItems(hospitalGroups)) {
      addItem(item)
    }

    // Add all doctors
    for (const item of buildDoctorItems(doctors)) {
      addItem(item)
    }

    // Add all treatments
    for (const item of buildTreatmentItemsDirect(treatments)) {
      addItem(item)
    }

    return items
  }

  // Legacy fallback behavior
  // Add sub-department items first (from new CMS collection)
  for (const item of buildLegacySubDepartmentItems(subDepartments)) {
    addItem(item)
  }

  // Add all hospital branches
  for (const item of buildBranchItems(branches)) {
    addItem(item)
  }

  // Add all departments from branches
  for (const item of buildDepartmentsFromBranches(branches, subDepartments)) {
    addItem(item)
  }

  // Add all specialists from branches
  for (const item of buildSpecialistsFromBranches(branches, subDepartments)) {
    addItem(item)
  }

  // Add all treatments from branches
  for (const item of buildTreatmentsFromBranches(branches, subDepartments)) {
    addItem(item)
  }

  // Add all doctors
  for (const item of buildDoctorItems(doctors)) {
    addItem(item)
  }

  // Add all treatments directly
  for (const item of buildTreatmentItemsDirect(treatments)) {
    addItem(item)
  }

  return items
}

// ===========================================
// Filter Functions
// ===========================================

/**
 * Filter items based on search query
 * Matches against name, type, and subInfo (for doctors: specialization, qualification, hospital)
 */
export function filterItems(items: SearchItem[], query: string): SearchItem[] {
  if (!query) return items

  const lowerQuery = query.toLowerCase()
  return items.filter(item =>
    item.name.toLowerCase().includes(lowerQuery) ||
    item.type.toLowerCase().includes(lowerQuery) ||
    item.subInfo?.toLowerCase().includes(lowerQuery) ||
    // Also search in related data for more comprehensive results
    (item.relatedData && (
      // Search in strings and nested structures
      Object.values(item.relatedData).some((val: any) => {
        if (typeof val === 'string') {
          return val.toLowerCase().includes(lowerQuery)
        }
        if (Array.isArray(val)) {
          return val.some((v: any) => 
            typeof v === 'string' && v.toLowerCase().includes(lowerQuery)
          )
        }
        return false
      })
    ))
  )
}

// ===========================================
// Redirect Helper
// ===========================================

/**
 * Generate redirect URL based on item type
 */
export function getRedirectUrl(item: SearchItem, currentView: ViewType): string {
  const { type, name, slug, id, hierarchy } = item
  
  switch (type) {
    case 'SubDepartment':
      // Preserve existing hierarchy if available, otherwise set subDepartment
      if (hierarchy?.department) {
        return `/search?view=hospitals&department=${encodeURIComponent(hierarchy.department)}&subDepartment=${encodeURIComponent(name)}`
      }
      return `/search?view=hospitals&subDepartment=${encodeURIComponent(name)}`
    
    case 'Hospital':
      // Use correct slug generation with city if available
      return `/hospital-branches/${slug}`
    
    case 'HospitalGroup':
      return `/hospital-groups/${slug}`
    
    case 'Doctor':
      // Use stored slug if available (with ID suffix), otherwise generate unique slug
      const doctorSlug = item.slug || (id ? getSlug(name) + '-' + id.slice(-6) : getSlug(name))
      return `/doctors/${doctorSlug}`
    
    case 'Treatment':
      return `/treatment/${slug}`
    
    case 'Department':
      return `/search?view=hospitals&department=${encodeURIComponent(name)}`
    
    case 'Specialist':
      // If hierarchy is available, use it for more specific routing
      if (hierarchy?.department && hierarchy?.subDepartment) {
        return `/search?view=hospitals&department=${encodeURIComponent(hierarchy.department)}&subDepartment=${encodeURIComponent(hierarchy.subDepartment)}&specialization=${encodeURIComponent(name)}`
      }
      return `/search?view=${currentView}&specialization=${encodeURIComponent(name)}`
    
    case 'Specialization':
      return `/search?view=${currentView}&specialization=${encodeURIComponent(name)}`
    
    case 'Category':
      return `/search?view=treatments&category=${encodeURIComponent(name)}`
    
    default:
      return '/search'
  }
}

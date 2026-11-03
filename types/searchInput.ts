
// ===========================================
// Item Types
// ===========================================

export type SearchItemType = 
  | 'Department' 
  | 'SubDepartment' 
  | 'Specialist' 
  | 'Specialization'
  | 'Treatment' 
  | 'Hospital' 
  | 'HospitalGroup'
  | 'Doctor' 
  | 'Category'

export type ViewType = 'hospitals' | 'doctors' | 'treatments' | 'subdepartments'

// ===========================================
// Hierarchy Structure
// ===========================================

export interface SearchHierarchy {
  department?: string
  subDepartment?: string
}

// Icon type identifier (resolved in component)
export type IconType = 'department' | 'subDepartment' | 'specialist' | 'treatment' | 'hospital' | 'hospitalGroup' | 'doctor'

// ===========================================
// Search Item Interface
// ===========================================

export interface SearchItem {
  id: string
  name: string
  slug: string
  type: SearchItemType
  icon: IconType
  subInfo?: string
  relatedData?: unknown
  hierarchy?: SearchHierarchy
}

// ===========================================
// Props Interface
// ===========================================

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  view: ViewType
  branches: BranchData[]
  doctors: DoctorData[]
  treatments: TreatmentData[]
  subDepartments?: SubDepartmentData[]
  hierarchicalData?: HierarchicalData
  hospitalGroups?: HospitalGroupData[]
}

// ===========================================
// Data Type Definitions (from CMS)
// Using flexible types to match existing data structures from different sources
// ===========================================

export interface BranchData {
  _id?: string
  branchName?: string
  name?: string
  hospitalName?: string
  city?: CityData[]
  cityName?: string
  department?: DepartmentData[]
  specialist?: SpecialistData[]
  treatments?: TreatmentData[]
}

export interface CityData {
  cityName?: string
  state?: string | null
  country?: string | null
}

export interface DepartmentData {
  name?: string
  _id?: string
}

export interface SpecialistData {
  name?: string
  _id?: string
  treatments?: TreatmentData[]
}

export interface DoctorData {
  _id?: string
  doctorName?: string
  name?: string
  slug?: string
  specialization?: SpecializationData[]
  qualification?: string | null
  hospitalName?: string
  branchName?: string
}

export interface SpecializationData {
  name?: string
  title?: string
}

export interface TreatmentData {
  _id?: string
  name?: string
  category?: string | null
}

export interface SubDepartmentData {
  _id?: string
  name?: string
  departmentMap?: DepartmentData[]
  specialistMaster?: SpecialistData[]
  treatment?: TreatmentData[]
  branchesMasterSubDepartment?: BranchData[]
}

export interface HospitalGroupData {
  _id?: string
  hospitalName?: string
  slug?: string
  hospitalImage?: string
  logo?: string
}

// ===========================================
// Hierarchical Data Structure
// ===========================================

export interface HierarchicalDepartment {
  _id: string
  name?: string
  subDepartments?: HierarchicalSubDepartment[]
  totalSpecialists?: number
}

export interface HierarchicalSubDepartment {
  _id: string
  name?: string
  specialists?: SpecialistData[]
  treatments?: TreatmentData[]
  branchIds?: string[]
  branchNames?: string[]
  departmentName?: string
}

export interface HierarchicalData {
  departments: HierarchicalDepartment[]
  allSpecialists: SpecialistData[]
  allSubDepartments: HierarchicalSubDepartment[]
}

// ===========================================
// Configuration Constants
// ===========================================

export const ITEM_TYPE_LABELS: Record<SearchItemType, string> = {
  Department: 'Department',
  SubDepartment: 'Sub-Department',
  Specialist: 'Specialist',
  Specialization: 'Specialization',
  Treatment: 'Treatment',
  Hospital: 'Hospital',
  HospitalGroup: 'Hospital Group',
  Doctor: 'Doctor',
  Category: 'Category',
}

export const SEARCH_PLACEHOLDER = 'Search hospitals, departments...'

export const DROPDOWN_HEADER_TEXT = (query: string) => 
  query ? `Results for "${query}"` : 'Search hospitals, departments, specialists...'

export const RESULT_COUNT_TEXT = (count: number) => 
  `${count} result${count !== 1 ? 's' : ''} • Press Enter to view`

export const NO_RESULTS_TEXT = (query: string) => 
  `No results found for "${query}"`

// ===========================================
// Utility Functions
// ===========================================

/**
 * Formats a count with proper pluralization
 */
export function formatCount(count: number, singular: string): string {
  if (count === 0) return ''
  return `${count} ${singular}${count !== 1 ? 's' : ''}`
}

/**
 * Creates a subInfo string with multiple parts
 */
export function createSubInfo(parts: (string | undefined | null)[]): string {
  const validParts = parts.filter((part): part is string => Boolean(part))
  return validParts.join(' • ')
}

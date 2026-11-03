// lib/cms/types.ts
// Unified type definitions for CMS data

export interface WixItem {
  _id?: string
  ID?: string
  data?: Record<string, unknown>
  nodes?: WixItem[]
  textData?: { text?: string }
  type?: string
  [key: string]: unknown
}

export interface ReferenceItem {
  _id?: string
  ID?: string
  name?: string
  title?: string
  [key: string]: unknown
}

export interface ProcessedRichContent {
  hasContent: boolean
  excerpt: string
  plainText: string
}

export interface RicosContent {
  nodes: WixItem[]
}

export interface CityData {
  _id: string
  cityName: string
  state: string
  country: string
  stateId?: string
  countryId?: string
}

// Basic treatment information used in department and sub-department contexts
export interface TreatmentBasic {
  _id: string
  name: string
  slug?: string
  treatmentImage?: string | null
  cost?: string | null
  popular?: boolean
}

// Mapped sub-department with treatments
export interface SubDepartmentWithTreatments {
  _id: string
  name: string
  treatments?: TreatmentBasic[]
}

export interface DepartmentData {
  _id: string
  name: string
  slug: string
  departmentImage?: string | null
  subDepartments?: SubDepartmentWithTreatments[]
  treatments?: TreatmentBasic[]
  totalTreatments?: number
}

export interface AccreditationData {
  _id: string
  title: string
  image?: string | null
}

export interface SpecializationData {
  _id: string
  ID?: string // Alternative ID field for CMS compatibility
  name: string
  isTreatment?: boolean
  department?: DepartmentData[]
  treatments?: TreatmentData[]
}

/**
 * Specialist data from specialist Master CSV
 * CSV Field Mapping:
 * - Specialty → specialty
 * - ID → _id
 * - Created date → createdAt
 * - Updated date → updatedAt
 * - Owner → owner
 * - DoctorMaster_specialization → specialization
 * - Department → department
 * - BranchesMaster_specialist → branches (the branches this specialist works at)
 * - Treatment → treatments
 */
export interface SpecialistData {
  _id: string
  // CSV field: Specialty
  specialty: string
  // CSV field: DoctorMaster_specialization
  specialization?: string
  // CSV field: Department
  department?: string
  // CSV field: BranchesMaster_specialist (branch IDs this specialist works at)
  branches?: string[]
  // CSV field: Treatment
  treatments?: string[]
  createdAt?: string
  updatedAt?: string
  owner?: string
}

export interface TreatmentData {
  _id: string
  name: string
  title?: string // For backward compatibility
  description?: string | null
  descriptionHtml?: string | { nodes: unknown[] } | null
  category?: string | null
  duration?: string | null
  cost?: string | null
  minPrice?: string | null
  treatmentImage?: string | null
  treatmentImageUrl?: string | null // Pre-computed CDN URL for SSR/CSR consistency
  popular?: boolean
  // Branch references - populated from CMS via treatmentBranchMap
  branchesAvailableAt?: TreatmentLocation[] | null
  departments?: DepartmentData[]
  // New fields from Treatment Master CSV - all multi-reference
  subDepartment?: Array<{ _id: string; name: string }> | null
  specialists?: Array<{ _id: string; name: string }> | null
  // Multi-reference to doctors - array of doctor references
  doctorCollection?: Array<{ _id: string; name: string }> | null
}

export interface DoctorData {
    _id: string
    doctorName: string
    name?: string // For backward compatibility
    specialization: SpecializationData[]
    qualification?: string | null
    qualifications?: string[] | null // Multiple qualifications
    experienceYears?: string | null
    designation?: string | null
    aboutDoctor?: string | null
    aboutDoctorHtml?: string | null
    profileImage?: string | null
    profileImageUrl?: string | null // Pre-computed CDN URL for SSR/CSR consistency
    popular?: boolean
    slug?: string
    hospitalId?: string
    hospitalName?: string
    hospital?: HospitalData | null // Full hospital object
    branchId?: string
    branchName?: string
    specialistMappingName?: string
    departmentName?: string
    subDepartmentName?: string
    testDiagnosisName?: string
    subTestDiagnosisName?: string
    city?: Array<{ cityName?: string; name?: string; _id?: string }> | string
    awards?: string[] | null
    achievements?: string[] | null
    achievementsAwards?: string[] | null
    // Branch reference fields for CMS mapping
    BranchesMaster_doctor?: Array<{ _id?: string; ID?: string }> | string
    branches?: Array<{ _id?: string; ID?: string }> | string
    // Hospital reference field (from DoctorMaster_hospital in CSV)
    DoctorMaster_hospital?: string | { _id: string; name: string } | Array<{ _id: string; name: string }> | null
    // Enrichment fields populated by getAllCMSData
    _hospitalNames?: Set<string> | string[]
    _hospitalIds?: Set<string> | string[]
    _branchNames?: Set<string> | string[]
    _branchIds?: Set<string> | string[]
    _cities?: Array<{ cityName?: string; name?: string; _id?: string }> | string
    doctorSlug?: string
  }

export interface BranchData {
  _id: string
  branchName: string
  name?: string // For backward compatibility
  slug?: string
  address?: string | null
  city: CityData[]
  specialty: SpecializationData[]
  department?: DepartmentData[]
  subDepartment?: DepartmentData[]
  accreditation: AccreditationData[]
  description?: string | null
  descriptionHtml?: string | { nodes: unknown[] } | null
  totalBeds?: string | null
  noOfDoctors?: string | null
  yearEstablished?: string | null
  branchImage?: string | null
  logo?: string | null
  // Pre-computed URLs for consistent SSR/CSR
  logoUrl?: string | null
  branchImageUrl?: string | null
  doctors: DoctorData[]
  specialist: SpecializationData[]
  treatments: TreatmentData[]
  specialization: SpecializationData[]
  popular?: boolean
  isStandalone?: boolean
  showHospital?: boolean
  hospitalId?: string | null
  hospitalGroup?: string | null
  contactNumber?: string | null
  createdDate?: string | null
  updatedDate?: string | null
  owner?: string | null
  manualSort?: string | null
  doctorNames?: string[]
}

export interface HospitalData {
  _id: string
  hospitalName: string
  name?: string // For backward compatibility
  slug?: string
  description?: string | null
  specialty: SpecializationData[]
  yearEstablished?: string | null
  hospitalImage?: string | null
  logo?: string | null
  logoUrl?: string | null // Pre-computed CDN URL for SSR/CSR consistency
  isStandalone?: boolean
  originalBranchId?: string
  branches: BranchData[]
  doctors: DoctorData[]
  specialist: SpecializationData[]
  treatments: TreatmentData[]
  accreditations: AccreditationData[]
  showHospital?: boolean
  popular?: boolean
}

// Extended types for client-side use
export interface DoctorLocation {
  hospitalName: string
  hospitalId: string
  branchName?: string
  branchId?: string
  cities: CityData[]
}

export interface ExtendedDoctorData extends DoctorData {
  baseId: string
  locations: DoctorLocation[]
  departments: DepartmentData[]
  filteredLocations?: DoctorLocation[]
}

export interface TreatmentLocation {
  branchId?: string
  branchName?: string
  hospitalName: string
  hospitalId: string
  cities: CityData[]
  departments: DepartmentData[]
  cost?: string | null
  minPrice?: string | null
  // Additional fields for complete branch data
  slug?: string
  logo?: string
  address?: string | null
  specialty?: SpecializationData[]
}

export interface ExtendedTreatmentData extends TreatmentData {
  branchesAvailableAt: TreatmentLocation[]
  departments: DepartmentData[]
}

// API Response types
export interface CMSDataResponse {
  hospitals: HospitalData[]
  treatments: ExtendedTreatmentData[]
  doctors: DoctorData[]
  departments: DepartmentData[]
  totalHospitals: number
  totalTreatments: number
  totalDoctors: number
  lastUpdated: string
  // Specialist data with branch mapping for treatment filtering
  specialistWithBranch?: SpecialistWithBranchInfo[]
}

// Specialist with branch mapping for treatment filtering
export interface SpecialistWithBranchInfo {
  _id: string
  name: string
  treatments: Array<{
    _id: string
    name: string
    description?: string
    cost?: string | number | null
    treatmentImage?: string | null
  }>
  hospitalId: string
  hospitalName: string
  branchId: string
  branchName: string
  city?: Array<{
    _id?: string
    cityName: string
    state?: string
    country?: string
  }>
}

export interface HospitalDetailResponse {
  hospital: HospitalData | null
  similarHospitals: HospitalData[]
  error?: string
}

// Hospital Group - for managing hospital networks/chains
export interface HospitalGroupData {
  _id: string
  hospitalName: string
  yearEstablished?: string | null
  countryId?: string | null
  // References to branches
  branches?: BranchReference[]
  // References to hospitals in the group
  hospitalList?: HospitalListItem[]
  slug?: string
  description?: string | null
  descriptionHtml?: string | null
  hospitalImage?: string | null
  logo?: string | null
  // Specialty references
  specialty?: SpecializationData[]
  createdDate?: string
  updatedDate?: string
  owner?: string
}

// Branch reference (lightweight for relations)
export interface BranchReference {
  _id: string
  branchName: string
  hospitalName?: string
  city?: string | string[]
}

// Hospital reference for group (lightweight)
export interface HospitalListItem {
  _id: string
  hospitalName: string
  description?: string | null
  yearEstablished?: string | null
  hospitalImage?: string | null
  logo?: string | null
  branches?: BranchReference[]
}

// Department with all references
export interface DepartmentWithRelations {
  _id: string
  name: string
  // References to specialist who work in this department
  specialist?: SpecializationData[]
  // References to branches that have this department
  branches?: BranchReference[]
  // References to treatments in this department
  treatments?: TreatmentData[]
  // Copy treatments reference
  treatmentCopy?: TreatmentData[]
  createdDate?: string
  updatedDate?: string
  owner?: string
}

// Specialist with all references
export interface SpecialistWithRelations {
  _id: string
  specialty: string
  // Reference to doctors with this specialization
  doctors?: DoctorData[]
  // Reference to department
  department?: DepartmentData[]
  // Reference to branches where specialist works
  branches?: BranchData[]
  // Reference to treatments
  treatments?: TreatmentData[]
  // Treatment copy reference
  treatmentCopy?: TreatmentData[]
  createdDate?: string
  updatedDate?: string
  owner?: string
}

// Treatment with all references
export interface TreatmentWithRelations {
  _id: string
  treatmentName: string
  name?: string
  // Reference to department
  department?: DepartmentData[]
  // Reference to specialist who perform this treatment
  specialist?: SpecializationData[]
  // Popular flag
  popular?: boolean
  description?: string | null
  descriptionHtml?: string | null
  startingCost?: string | null
  cost?: string | null
  treatmentImage?: string | null
  // Reference to doctors
  doctorCollection?: DoctorData[]
  createdDate?: string
  updatedDate?: string
  owner?: string
}

// Filter types
export type FilterKey = 'city' | 'state' | 'treatment' | 'specialization' | 'department' | 'doctor' | 'branch' | 'location'

export interface FilterValue {
  id: string
  query: string
}

export interface FilterState {
  view: 'hospitals' | 'doctors' | 'treatments'
  city: FilterValue
  state: FilterValue
  treatment: FilterValue
  specialization: FilterValue
  department: FilterValue
  doctor: FilterValue
  branch: FilterValue
  location: FilterValue
  sortBy: 'all' | 'popular' | 'az' | 'za'
}

// Utility type for filter options
export interface FilterOption {
  id: string
  name: string
}

// SubDepartment collection type from CMS
// Collection ID: subDepartment
// Fields: name, specialist master, Treatment, departmentMap, BranchesMaster_subDepartment, ID, Created date, Updated date, Owner
export interface SubDepartmentData {
  _id: string
  name: string
  // Multi-reference fields
   specialistMaster?: Array<{ _id: string; name: string }>
   treatment?: Array<{ _id: string; name: string }>
   departmentMap?: Array<{ _id: string; name: string }>
   branchesMasterSubDepartment?: Array<{ _id: string; branchName: string; hospitalName?: string }>
   // Mapped treatments for UI usage
   treatments?: TreatmentBasic[]
   // System fields
  ID?: string
  createdDate?: string
  updatedDate?: string
  owner?: string
}

// Technology data from Technologies CMS collection
export interface TechnologyData {
  _id: string
  heading?: string | null
  subHeading?: string | null
  description?: string | null
  image?: string | null
  details?: string | null
  detailsHtml?: string | { nodes: unknown[] } | null
  technologiesGallery?: Array<{
    _id?: string
    image?: string | null
    title?: string | null
    description?: string | null
  }> | null
  createdDate?: string
  updatedDate?: string
  owner?: string
}

// Test & Diagnosis data from TestDiagnosis CMS collection
export interface TestDiagnosisData {
  _id: string
  name: string
  slug: string
  testDiagnosisImage?: string | null
  subTestDiagnoses?: SubTestDiagnosisData[]
  treatments?: TreatmentBasic[]
  totalTreatments?: number
  description?: string | null
  descriptionHtml?: string | { nodes: unknown[] } | null
  richContent?: unknown
  department?: Array<{ _id: string; name: string }> | null
  status?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  startingCost?: string | null
  createdDate?: string
  updatedDate?: string
  owner?: string
}

// SubTestDiagnosis collection type from CMS
export interface SubTestDiagnosisData {
  _id: string
  name: string
  treatment?: Array<{ _id: string; name: string }> | null
  departmentMap?: Array<{ _id: string; name: string }> | null
  treatments?: TreatmentBasic[]
  createdDate?: string
  updatedDate?: string
  owner?: string
}

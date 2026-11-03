/**
 * Card Types
 * Centralized type definitions for all card components
 */

// Doctor Card Types
export interface DoctorBranchInfo {
  branchId: string
  branchName: string
  hospitalId: string
  hospitalName: string
}

export interface DoctorCardData {
  _id: string
  doctorName?: string
  name?: string
  slug?: string
  doctorSlug?: string
  specialization?: { name: string }[] | string[] | string
  department?: string[]
  qualification?: string | null
  designation?: string | null
  experienceYears?: number | string | null
  profileImage?: string
  profileImageUrl?: string | null
  popular?: boolean
  city?: { cityName: string; name?: string; state?: string; State?: string }[] | string
  hospitalName?: string
  hospitalId?: string
  hospitalSlug?: string
  hospitalLinkType?: 'hospital-groups' | 'hospital-branches'
  hospitalLogo?: string | null
  branchName?: string
  branchId?: string
  branchInfo?: DoctorBranchInfo[]
  location?: string
  departmentName?: string
}

// Treatment Card Types
export interface TreatmentCardData {
  _id: string
  name?: string
  description?: string
  category?: string
  treatmentImage?: string
  image?: string
  cost?: string
  duration?: string
  slug?: string
  specialistName?: string
  specialistId?: string
  department?: string
  departmentId?: string
}

// Hospital/Branch Card Types
export interface BranchCardData {
  _id: string
  branchImage?: string
  image?: string
  hospitalName?: string
  branchName?: string
  city?: { cityName: string; name?: string }[] | string
  location?: string
  yearEstablished?: number
  totalBeds?: number
  noOfDoctors?: number
  accreditation?: { _id?: string; logo?: string; image?: string; title?: string }[]
  accreditationImage?: string | null
  popular?: boolean
  primarySpecialty?: string
  specialty?: { name: string }[] | string
  specialization?: { name: string }[] | string
  specialities?: { name: string }[] | string
  specialist?: { name: string }[]
  slug?: string
  hospitalSlug?: string
  href?: string
  logo?: string
}

// Department Card Types
export interface DepartmentCardData {
  _id: string
  name: string
  slug: string
  description?: string
  icon?: string
  image?: string
  totalTreatments?: number
}
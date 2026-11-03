// lib/types/index.ts
// Unified type definitions for the entire application
// Single source of truth: lib/cms/types.ts

import type {
  CityData,
  DepartmentData,
  AccreditationData,
  SpecializationData,
  TreatmentData,
  DoctorData,
  BranchData,
  HospitalData,
  ExtendedDoctorData,
  TreatmentLocation,
  ExtendedTreatmentData,
  DoctorLocation,
  CMSDataResponse,
  SpecialistWithBranchInfo,
  HospitalDetailResponse,
  DepartmentWithRelations,
  SpecialistWithRelations,
  TreatmentWithRelations,
  HospitalGroupData,
  BranchReference,
  HospitalListItem,
  FilterKey,
  FilterValue,
  FilterState,
  FilterOption,
  RicosContent,
  ProcessedRichContent,
  SubDepartmentData,
  TechnologyData,
} from '@/lib/cms/types'

// Re-export Core Entity Types
export type {
  CityData,
  DepartmentData,
  AccreditationData,
  SpecializationData,
  TreatmentData,
  DoctorData,
  BranchData,
  HospitalData,
  ExtendedDoctorData,
  TreatmentLocation,
  ExtendedTreatmentData,
  DoctorLocation,
  CMSDataResponse,
  SpecialistWithBranchInfo,
  HospitalDetailResponse,
  DepartmentWithRelations,
  SpecialistWithRelations,
  TreatmentWithRelations,
  HospitalGroupData,
  BranchReference,
  HospitalListItem,
  FilterKey,
  FilterValue,
  FilterState,
  FilterOption,
  RicosContent,
  ProcessedRichContent,
  SubDepartmentData,
  TechnologyData,
}

// Additional API Response Types
export interface TreatmentDetailResponse {
  treatment: ExtendedTreatmentData | null
  relatedTreatments: ExtendedTreatmentData[]
  error?: string
}

export interface DoctorDetailResponse {
  doctor: ExtendedDoctorData | null
  relatedDoctors: DoctorData[]
  error?: string
}

// Card Component Props
export interface HospitalCardProps {
  branch: BranchData
  hospitalName: string
  hospitalLogo?: string | null
  treatmentName?: string | null
  showAccreditation?: boolean
}

export interface TreatmentCardProps {
  treatment: TreatmentData
  showSpecialty?: boolean
}

export interface DoctorCardProps {
  doctor: DoctorData
  treatmentName?: string | null
}

export interface BranchCardProps {
  branch: BranchData
  hospitalName?: string
  showFullDetails?: boolean
}

// UI Component Types
export type SortByType = 'all' | 'popular' | 'az' | 'za'
export type ViewType = 'hospitals' | 'doctors' | 'treatments'

export interface ViewToggleProps {
  view: ViewType
  setView: (view: ViewType) => void
}

export interface SortingProps {
  sortBy: SortByType
  setSortBy: (sortBy: SortByType) => void
}

export interface ResultsHeaderProps {
  view: ViewType
  currentCount: number
  clearFilters: () => void
  sortBy: SortByType
  setSortBy: (sortBy: SortByType) => void
}

// Utility Types
export interface ImageData {
  url?: string
  thumbnailUrl?: string
  fileName?: string
}

export interface SeoMetadata {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
}

// Type aliases for backward compatibility
export type ExtendedTreatmentType = ExtendedTreatmentData
export type ExtendedDoctorType = ExtendedDoctorData
export type DoctorType = DoctorData
export type TreatmentType = TreatmentData
export type BranchType = BranchData
export type HospitalType = HospitalData
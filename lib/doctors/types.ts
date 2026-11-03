// lib/doctors/types.ts
// Shared types for doctor page module to avoid circular dependencies.

import type { HospitalData } from '@/lib/cms'
import type { DoctorCardData, DoctorBranchInfo } from '@/components/cards/types'

export interface TransformedDoctor {
  id: string
  name: string
  title: string
  rating: number
  reviewCount: number
  about: string
  specialties: string[]
  department?: string[]
  experienceYears: number
  languages: string[]
  hospitalName: string
  hospitalId: string
  branchName: string
  branchId: string
  city: string
  image: string | null
  qualification: string
  qualifications: string[] | null
  doctorImage?: string
  designation?: string
  descriptionHtml?: string | { nodes?: any[] } | null
  isPopular?: boolean
  awards: string[] | null
  achievements: string[] | null
}

export interface LoadedDoctorPageData {
  doctor: TransformedDoctor
  doctorHospitals: HospitalData[]
  matchedHospital: HospitalData | null
  relatedDoctors: DoctorCardData[]
  relatedTreatments: any[]
  allDoctors: any[]
  allDoctorCards: DoctorCardData[]
  allTreatments: any[]
}

// lib/services/homepage/types.ts
// Clean, typed data structures for homepage

import type { 
  HospitalData, 
  DoctorData,
  DepartmentData
} from '@/lib/cms/types'

export interface PartnerLogoData {
  _id: string
  title: string
  logoTitle: string
  Logo: string
  logoUrl: string
  targetUrl?: string
}


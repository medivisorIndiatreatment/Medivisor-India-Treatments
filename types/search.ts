// types/search.ts
// Re-export types from centralized CMS module for backward compatibility

export type {
  CityData as CityType,
  DepartmentData as DepartmentType,
  AccreditationData as AccreditationType,
  SpecializationData as SpecialtyType,
  TreatmentData as TreatmentType,
  DoctorData as DoctorType,
  BranchData as BranchType,
  HospitalData as HospitalType,
  ExtendedDoctorData as ExtendedDoctorType,
  ExtendedTreatmentData as ExtendedTreatmentType,
  TreatmentLocation,
  FilterKey,
  FilterValue,
  FilterState,
  FilterOption as OptionType,
} from '@/lib/cms/types'

// Re-export utility functions
export { generateSlug } from '@/lib/cms'

// Utility functions that were in the original file
export const getWixImageUrl = (imageStr: string | null | undefined): string | null => {
  if (!imageStr || typeof imageStr !== 'string' || !imageStr.startsWith('wix:image://v1/')) return null
  const parts = imageStr.split('/')
  return parts.length >= 4 ? `https://static.wixstatic.com/media/${parts[3]}` : null
}

export const isUUID = (str: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)
}

// Helper function to format location: "City, State, Country"
export const formatLocation = (city: { cityName?: string; state?: string | null; country?: string | null } | null | undefined): string => {
  if (!city) return 'Location not specified'

  const cityName = (city.cityName || '').trim()
  const state = (city.state || '').trim()
  const country = (city.country || '').trim()

  const parts: string[] = []
  if (cityName) parts.push(cityName)
  if (state) parts.push(state)
  if (country) parts.push(country)

  return parts.length > 0 ? parts.join(', ') : 'Location not specified'
}

// Base item interface for backward compatibility
export interface BaseItem {
  _id: string
  name?: string
  title?: string
  doctorName?: string
  popular?: boolean
}

// API Response type for backward compatibility
export interface ApiResponse {
  items: any[]
  total: number
}

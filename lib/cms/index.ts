// lib/cms/index.ts
// Central export for CMS module

// Core types
export type {
  CityData,
  DepartmentData,
  AccreditationData,
  SpecializationData,
  SpecialistData,
  TreatmentData,
  DoctorData,
  BranchData,
  HospitalData,
  ExtendedTreatmentData,
  DoctorLocation,
  TreatmentLocation,
  CMSDataResponse,
  SpecialistWithBranchInfo,
  HospitalDetailResponse,
  DepartmentWithRelations,
  SpecialistWithRelations,
  TreatmentWithRelations,
  HospitalGroupData,
  BranchReference,
  HospitalListItem,
  SubDepartmentData,
  TechnologyData,
  TestDiagnosisData,
  SubTestDiagnosisData,
  FilterKey,
  FilterValue,
  FilterState,
  FilterOption,
  RicosContent,
  ProcessedRichContent,
} from './types'

// Cache utilities
export { memoryCache, CACHE_CONFIG, createCachedFetcher, createCacheKey, getCacheControl } from './cache'

// Mappers
export {
  mapHospital,
  mapBranch,
  mapDoctor,
  mapTreatment,
  mapSpecialistWithTreatments,
  mapCityWithStateRef,
  mapCity,
  mapCities,
  mapSpecializations,
  mapDepartments,
  mapDepartment,
  mapAccreditation,
  mapAccreditations,
  mapExtendedTreatment,
  isStandaloneBranch,
  shouldShowHospital,
  extractHospitalIds,
  getValue,
  extractIds,
} from './mappers'

// Utils
export {
  extractRichText,
  extractRichTextHtml,
  extractFirstParagraphText,
  extractTextFromRicos,
  stripHtmlTags,
  processWixRichContent,
  sanitizeHtml,
  basicSanitize,
  getRichContentDescription,
  isRichTextContent,
  extractAchievementsText,
} from './utils'

// Fetchers
export {
  fetchAllBranches,
  fetchAllHospitals,
  fetchAllTreatments,
  fetchAllDoctors,
  fetchAllSpecialists,
  fetchAllDepartments,
  fetchAllSubDepartments,
  fetchAllTechnologies,
  fetchAllLogos,
  fetchAllCities,
  fetchAllStates,
  fetchTreatmentById,
  fetchSpecialistWithTreatments,
  fetchSpecialistsByBranchId,
  fetchByIds,
  fetchHospitalsPage,
  fetchTreatmentsPage,
  fetchDoctorsPage,
  fetchAllBranchesCached,
  fetchAllHospitalsCached,
  fetchAllTreatmentsCached,
  fetchAllDoctorsCached,
  fetchAllCitiesCached,
  fetchAllDepartmentsCached,
  fetchAllSpecialistsCached,
  fetchAllStatesCached,
  fetchAllSubDepartmentsCached,
  fetchAllTechnologiesCached,
  fetchAllLogosCached,
  fetchSpecialistWithTreatmentsCached,
  fetchAllTestDiagnoses,
  fetchAllSubTestDiagnoses,
  fetchAllTestDiagnosesCached,
  fetchAllSubTestDiagnosesCached,
} from './fetchers'

// Main data service
export {
  getAllCMSData,
  getAllCMSDataNoCache,
  getCachedCMSData,
  getDoctorsByHospitalId,
  getDoctorsByBranchId,
  getDoctorsByTreatmentId,
  getTreatmentsByDoctorId,
} from './data-service'

// Slug utilities
export { generateSlug, generateBranchSlug, findBranchBySlug, findTreatmentBySlug, findHospitalBySlug, findTechnologyBySlug, findDoctorBySlug, findTestDiagnosisBySlug } from '@/lib/slug-utils'

// Deprecated - kept for backward compatibility
export { generateSlug as generateUniqueSlug } from '@/lib/slug-utils'

import {
  getAllCMSData,
  fetchAllTechnologiesCached,
  fetchAllLogosCached,
  mapHospital,
  mapDoctor,
  mapDepartment,
  memoryCache,
} from '@/lib/cms'
import type { CMSDataResponse } from '@/lib/cms'
import { wixServerClient } from '@/lib/wix'
import { assertWixConfigured } from '@/lib/config/env'
import { prepareHomepageData, type PreparedHomepageData } from './prepare'

const INITIAL_PAGE_SIZE = 8

async function fetchInitialHomepageCollections() {
  assertWixConfigured()
  const [hospitals, doctors, departments] = await Promise.all([
    wixServerClient.items.query('HospitalMaster').include('branches', 'specialty').limit(INITIAL_PAGE_SIZE).find(),
    wixServerClient.items.query('DoctorMaster').include('hospital', 'branch', 'specialization').limit(INITIAL_PAGE_SIZE).find(),
    wixServerClient.items.query('Department').include('image', 'subDepartment_departmentMap').limit(INITIAL_PAGE_SIZE).find(),
  ])
  return {
    hospitals: (hospitals.items || []).map(mapHospital),
    doctors: (doctors.items || []).map(mapDoctor),
    departments: (departments.items || []).map(mapDepartment) as any[],
  }
}
import type { Locale } from '@/lib/i18n/config'

const HOMEPAGE_CACHE_KEY = 'homepage-prepared'

const EMPTY_DATA: PreparedHomepageData = {
  hospitals: [],
  doctors: [],
  departmentCards: [],
  departmentSearchOptions: [],
  technologies: [],
  testDiagnoses: [],
  partnersLogos: [],
  treatments: [],
  lastUpdated: null,
}

async function prepareHomepage(cmsData: CMSDataResponse, technologiesData: any[], logosData: any[]): Promise<PreparedHomepageData> {
  return prepareHomepageData(cmsData, technologiesData, logosData)
}

async function refreshHomepageData(cacheKey: string): Promise<PreparedHomepageData> {
  return memoryCache.dedupe(cacheKey, async () => {
    try {
      const [cmsData, technologiesData, logosData] = await Promise.all([
        getAllCMSData(),
        fetchAllTechnologiesCached(),
        fetchAllLogosCached(),
      ])
      const prepared = await prepareHomepage(cmsData, technologiesData, logosData)
      memoryCache.set(cacheKey, prepared, 5 * 60 * 1000)
      return prepared
    } catch (error) {
      console.error('Error fetching full homepage data:', error)
      const previous = memoryCache.getWithMeta<PreparedHomepageData>(cacheKey).data
      return previous ?? EMPTY_DATA
    }
  })
}

export async function fetchFullHomepageData(locale?: Locale): Promise<PreparedHomepageData> {
  const cacheKey = locale ? `${HOMEPAGE_CACHE_KEY}:full:${locale}` : `${HOMEPAGE_CACHE_KEY}:full`
  const cached = memoryCache.get<PreparedHomepageData>(cacheKey)
  if (cached) return cached

  // Serve an expired complete snapshot immediately while one request refreshes
  // Wix in the background. This avoids making users wait on a cold CMS refresh
  // every five minutes while preserving complete homepage content.
  const stale = memoryCache.getWithMeta<PreparedHomepageData>(cacheKey)
  if (stale.data) {
    void refreshHomepageData(cacheKey)
    return stale.data
  }

  return refreshHomepageData(cacheKey)
}

export async function fetchHomepageData(locale?: Locale): Promise<PreparedHomepageData> {
  // The homepage uses the complete CMS graph so department cards retain their
  // expanded sub-department treatments and never render empty placeholders.
  return fetchFullHomepageData(locale)
}

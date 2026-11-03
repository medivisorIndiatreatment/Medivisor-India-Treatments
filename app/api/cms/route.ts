import { NextResponse } from 'next/server'
import {
  fetchHospitalsPage,
  fetchTreatmentsPage,
  fetchDoctorsPage,
  fetchAllTechnologiesCached,
  fetchAllLogosCached,
} from '@/lib/cms'
import { getLocaleFromRequest } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import type { HospitalData, TreatmentData, DoctorData } from '@/lib/cms/types'

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=10800',
}

function stripLargeFields<T>(item: T): T {
  if (!item || typeof item !== 'object') return item
  const result = { ...item } as any
  if ('aboutDoctorHtml' in result && result.aboutDoctorHtml && typeof result.aboutDoctorHtml === 'object') {
    if (typeof result.aboutDoctor === 'string' || !result.aboutDoctor) {
      delete result.aboutDoctor
    }
    delete result.aboutDoctorHtml
  }
  if ('aboutDoctor' in result && result.aboutDoctor && typeof result.aboutDoctor === 'object') {
    delete result.aboutDoctor
  }
  if ('descriptionHtml' in result && result.descriptionHtml && typeof result.descriptionHtml === 'object') {
    delete result.descriptionHtml
  }
  return result
}

function stripLargeFieldsFromArray<T>(items: T[]): T[] {
  return items.map(stripLargeFields)
}

export async function GET(req: Request) {
  const requestId = crypto.randomUUID?.() || Date.now().toString()

  try {
    const url = new URL(req.url)
    const page = Math.min(10000, Math.max(0, Number(url.searchParams.get('page') || 0)))
    // Keep each response small enough for fast first paint. Consumers can use
    // hasMore* and request subsequent pages to progressively append records.
    const pageSize = Math.min(8, Math.max(1, Number(url.searchParams.get('pageSize') || 8)))
    const offset = page * pageSize
    const locale = getLocaleFromRequest(req)
    const includeHomepageExtras = page === 0

    const timeoutMs = 45000
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('CMS data fetch timed out')), timeoutMs)
    )

    const dataPromise = (async () => {
      const [
        hospitalsResult,
        treatmentsResult,
        doctorsResult,
        technologiesData,
        logosData,
      ] = await Promise.all([
        fetchHospitalsPage(offset, pageSize),
        fetchTreatmentsPage(offset, pageSize),
        fetchDoctorsPage(offset, pageSize),
        includeHomepageExtras ? fetchAllTechnologiesCached() : Promise.resolve([]),
        includeHomepageExtras ? fetchAllLogosCached() : Promise.resolve([]),
      ])
      return {
        hospitalsResult,
        treatmentsResult,
        doctorsResult,
        technologiesData,
        logosData,
      }
    })()

    const {
      hospitalsResult,
      treatmentsResult,
      doctorsResult,
      technologiesData,
      logosData,
    } = await Promise.race([dataPromise, timeoutPromise]) as any

    const hospitals = hospitalsResult.items
    const treatments = treatmentsResult.items
    const doctors = doctorsResult.items
    const totalHospitals = hospitalsResult.totalCount
    const totalTreatments = treatmentsResult.totalCount
    const totalDoctors = doctorsResult.totalCount

    if (!hospitals && !treatments && !doctors) {
      return NextResponse.json(
        {
          hospitals: [],
          treatments: [],
          doctors: [],
          totalHospitals: 0,
          totalTreatments: 0,
          totalDoctors: 0,
        },
        {
          headers: {
            ...CACHE_HEADERS,
            'X-Request-Id': requestId,
          },
        }
      )
    }

    const hasMoreHospitals = offset + pageSize < totalHospitals
    const hasMoreTreatments = offset + pageSize < totalTreatments
    const hasMoreDoctors = offset + pageSize < totalDoctors

    return NextResponse.json(
      {
        hospitals: stripLargeFieldsFromArray(hospitals),
        treatments: stripLargeFieldsFromArray(treatments),
        doctors: stripLargeFieldsFromArray(doctors),
        technologies: technologiesData,
        partnersLogos: logosData,
        totalHospitals,
        totalTreatments,
        totalDoctors,
        page,
        pageSize,
        hasMoreHospitals,
        hasMoreTreatments,
        hasMoreDoctors,
        lastUpdated: new Date().toISOString(),
        locale,
      },
      {
        headers: {
          ...CACHE_HEADERS,
          'X-Request-Id': requestId,
          'X-Total-Count': String(totalHospitals),
          'X-Has-More': String(hasMoreHospitals || hasMoreTreatments || hasMoreDoctors),
          'X-Locale': locale,
        },
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      {
        error: 'Failed to fetch CMS data',
        message: errorMessage,
      },
      {
        status: 500,
        headers: {
          'X-Request-Id': requestId,
        },
      }
    )
  }
}

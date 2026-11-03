import { NextResponse } from 'next/server'
import {
  fetchAllHospitalsCached,
  fetchAllTreatmentsCached,
  fetchAllDoctorsCached,
  fetchAllDepartmentsCached,
  memoryCache,
} from '@/lib/cms'
import { getLocaleFromRequest } from '@/lib/i18n/server'
import { getTestDiagnosesWithMapping } from '@/lib/services/test-diagnosis'
import { CACHE_HEADERS } from '@/lib/api/pagination'

const CACHE_KEY_PREFIX = 'navigation_data_lightweight_v3'
const CACHE_TTL = 30 * 60 * 1000

export const revalidate = 1800

export async function GET(request: Request) {
  const locale = getLocaleFromRequest(request)
  const cacheKey = `${CACHE_KEY_PREFIX}:${locale}`

  try {
    const cached = memoryCache.get<NavigationData>(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          ...CACHE_HEADERS,
          'X-Cache': 'HIT',
          'X-Locale': locale,
        },
      })
    }

    const navigationData = await memoryCache.dedupe(cacheKey, async () => {
      const [hospitals, treatments, doctors, testDiagnoses, departments] = await Promise.all([
        fetchAllHospitalsCached(),
        fetchAllTreatmentsCached(),
        fetchAllDoctorsCached(),
        getTestDiagnosesWithMapping(),
        fetchAllDepartmentsCached(),
      ])

      return {
        hospitals: hospitals.map((h: any) => ({
          _id: h._id,
          hospitalName: h.hospitalName,
          slug: h.slug,
          branches: (h.branches || []).map((b: any) => ({
            _id: b._id,
            branchName: b.branchName || b.name,
            city: b.city?.[0]?.cityName || '',
            slug: b.slug,
          })),
        })),
        treatments: treatments.filter((t: any) => t?.name || t?.treatmentName).map((t: any) => ({ _id: t._id, name: t.name || t.treatmentName, slug: t.slug, category: t.category })), 
        doctors: doctors.map((d: any) => ({
          _id: d._id,
          doctorName: d.doctorName,
          slug: d.slug,
          specialization: d.specialization?.map((s: any) => typeof s === 'string' ? s : s?.name).filter(Boolean),
          hospitalName: d.hospitalName,
          branchName: d.branchName,
        })),
        testDiagnoses: testDiagnoses
          .map((td: any) => ({
            _id: td._id,
            name: td.name || td.testDiagnosisName || td.testName,
            slug: td.slug,
          }))
          .filter((td: any) => td.name),
        departments: departments.filter((d: any) => d.name).map((d: any) => ({ _id: d._id, name: d.name, slug: d.slug, totalTreatments: d.totalTreatments || 0 })).slice(0, 50),
      } satisfies NavigationData
    })

    memoryCache.set(cacheKey, navigationData, CACHE_TTL)

    return NextResponse.json(navigationData, {
      headers: {
        ...CACHE_HEADERS,
        'X-Cache': 'MISS',
        'X-Locale': locale,
      },
    })
  } catch (error) {
    console.error('Error fetching navigation data:', error)
    return NextResponse.json(
      { hospitals: [], treatments: [], doctors: [], testDiagnoses: [], departments: [] },
      {
        headers: {
          ...CACHE_HEADERS,
          'X-Cache': 'ERROR',
        },
      }
    )
  }
}

interface NavigationData {
  hospitals: Array<{
    _id: string
    hospitalName: string
    slug: string
    branches: Array<{
      _id: string
      branchName: string
      city: string
      slug: string
    }>
  }>
  treatments: Array<{
    _id: string
    name: string
    slug: string
    category?: string
  }>
  doctors: Array<{
    _id: string
    doctorName: string
    slug: string
    specialization: string[]
    hospitalName?: string
    branchName?: string
  }>
  testDiagnoses: Array<{
    _id: string
    name: string
    slug: string
  }>
  departments: Array<{
    _id: string
    name: string
    slug: string
    totalTreatments: number
  }>
}

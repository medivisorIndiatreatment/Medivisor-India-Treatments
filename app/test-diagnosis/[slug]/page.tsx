// app/test-diagnosis/[slug]/page.tsx
// Test & Diagnosis detail page with parallel data fetching

import { notFound, redirect } from 'next/navigation'
import { getTestDiagnosisWithDoctors } from '@/lib/services/test-diagnosis'
import { getAllCMSData } from '@/lib/cms'
import { getDoctorsByTestDiagnosis } from '@/lib/services/test-diagnosis'
import { generateSlug } from '@/lib/slug-utils'
import { generateTestDiagnosisMetadata } from '@/app/metadata'
import type { DoctorData } from '@/lib/cms/types'
import TestDiagnosisDetailClient from './TestDiagnosisDetailClient'

const MAX_HOSPITALS_PER_TEST_DIAGNOSIS = 100
const MAX_BRANCHES_PER_HOSPITAL = 50

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params

  let testDiagnosisName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  let testDiagnosisImage = ''
  let treatmentCount = 0
  let testDiagnosisDescription = ''

  try {
    const tdResult = await getTestDiagnosisWithDoctors(slug)
    const testDiagnosis = tdResult?.testDiagnosis

    if (testDiagnosis) {
      testDiagnosisName = testDiagnosis.name
      testDiagnosisImage = testDiagnosis.testDiagnosisImage ?? ''
      treatmentCount = testDiagnosis.totalTreatments ?? testDiagnosis.treatments?.length ?? 0
      testDiagnosisDescription = `Explore ${treatmentCount} medical tests and diagnoses in ${testDiagnosis.name}. World-class healthcare services in India through Medivisor.`
    }
  } catch (error) {
    console.error('Error fetching test diagnosis for metadata:', error)
  }

  return generateTestDiagnosisMetadata(
    testDiagnosisName,
    testDiagnosisDescription,
    testDiagnosisImage,
    treatmentCount,
    slug
  )
}

export default async function TestDiagnosisPage({ params }: PageProps) {
  const { slug } = await params

  const [tdResult, cmsData] = await Promise.all([
    getTestDiagnosisWithDoctors(slug).catch(() => ({ testDiagnosis: null, doctors: [] })),
    getAllCMSData().catch(() => ({ hospitals: [], treatments: [], doctors: [] })),
  ])

  const testDiagnosis = tdResult?.testDiagnosis
  const tdDoctors = tdResult?.doctors || []
  const allDoctors = cmsData.doctors || []

  if (!testDiagnosis) {
    notFound()
  }

  const expectedSlug = testDiagnosis.slug
  if (slug !== expectedSlug) {
    redirect(`/test-diagnosis/${expectedSlug}`)
  }

  const hospitals = processHospitals(
    cmsData.hospitals || [],
    testDiagnosis
  )

  const testDiagnosisTreatments = processTreatments(
    testDiagnosis.treatments || []
  )

  const doctors = processDoctors(tdDoctors, allDoctors, cmsData.hospitals || [], testDiagnosis.name)

  return (
    <TestDiagnosisDetailClient
      testDiagnosis={testDiagnosis}
      hospitals={hospitals}
      slug={slug}
      doctors={doctors}
      allDoctors={allDoctors}
      testDiagnosisTreatments={testDiagnosisTreatments}
      allTreatments={cmsData.treatments || []}
    />
  )
}

function processHospitals(hospitals: any[], testDiagnosis: any) {
  const tdId = testDiagnosis._id || ''
  const tdNameLower = (testDiagnosis.name || '').toLowerCase().trim()

  const subTDNames = new Set<string>()
  if (testDiagnosis.subTestDiagnoses?.length) {
    testDiagnosis.subTestDiagnoses.forEach((sd: any) => {
      if (sd.name) subTDNames.add(sd.name.toLowerCase().trim())
    })
  }

  const matchedBranchesByHospital = new Map<string, any[]>()

  for (const hospital of hospitals) {
    if (!hospital?._id || !hospital.branches?.length) continue

    const matchedBranchIds = new Set<string>()

    for (const branch of hospital.branches) {
      if (!branch?._id || matchedBranchIds.size >= MAX_BRANCHES_PER_HOSPITAL) continue

      if (branchMatchesTestDiagnosis(branch, tdId, tdNameLower, subTDNames) &&
          shouldShowHospital(branch)) {
        matchedBranchIds.add(branch._id)

        const branches = matchedBranchesByHospital.get(hospital._id) || []
        branches.push(transformBranchData(branch))
        matchedBranchesByHospital.set(hospital._id, branches)
      }
    }
  }

  if (testDiagnosis) {
    return hospitals
      .filter((h: any) => h && h._id && matchedBranchesByHospital.has(h._id))
      .slice(0, MAX_HOSPITALS_PER_TEST_DIAGNOSIS)
      .map((hospital: any) => ({
        _id: hospital._id,
        hospitalName: hospital.hospitalName,
        hospitalSlug: hospital.hospitalSlug || generateSlug(hospital.hospitalName || ''),
        image: hospital.hospitalImage || hospital.branchImage || null,
        address: hospital.address || null,
        location: hospital.location || null,
        yearEstablished: hospital.yearEstablished,
        totalBeds: hospital.totalBeds,
        noOfDoctors: hospital.noOfDoctors,
        specialty: Array.isArray(hospital.specialty)
          ? hospital.specialty.map((s: any) => s?.name || s?.title || '').filter(Boolean)
          : [],
        accreditation: Array.isArray(hospital.accreditation)
          ? hospital.accreditation.map((a: any) => ({ _id: a._id, title: a.title, logo: a.logo, image: a.image }))
          : [],
        branches: matchedBranchesByHospital.get(hospital._id) || [],
        popular: hospital.popular,
        showHospital: hospital.showHospital,
      }))
  }

  return hospitals.map((hospital: any) => ({
    _id: hospital._id,
    hospitalName: hospital.hospitalName,
    hospitalSlug: hospital.hospitalSlug || generateSlug(hospital.hospitalName || ''),
    image: hospital.hospitalImage || hospital.branchImage || null,
    address: hospital.address || null,
    location: hospital.location || null,
    yearEstablished: hospital.yearEstablished,
    totalBeds: hospital.totalBeds,
    noOfDoctors: hospital.noOfDoctors,
    specialty: Array.isArray(hospital.specialty)
      ? hospital.specialty.map((s: any) => s?.name || s?.title || '').filter(Boolean)
      : [],
    accreditation: Array.isArray(hospital.accreditation)
      ? hospital.accreditation.map((a: any) => ({ _id: a._id, title: a.title, logo: a.logo, image: a.image }))
      : [],
    branches: (hospital.branches || []).filter(shouldShowHospital),
    popular: hospital.popular,
    showHospital: hospital.showHospital,
  }))
}

function branchMatchesTestDiagnosis(branch: any, tdId: string, tdNameLower: string, subTDNames: Set<string>) {
  const branchTDs = Array.isArray(branch.testDiagnosis)
    ? branch.testDiagnosis
    : branch.testDiagnosis ? [branch.testDiagnosis] : []

  for (const td of branchTDs) {
    if (!td) continue
    const tdName = (typeof td === 'string' ? td : td?.name)?.toLowerCase().trim() || ''
    const tdIdRef = td?._id

    if (tdIdRef === tdId || tdName === tdNameLower ||
        (tdNameLower && tdName.includes(tdNameLower)) ||
        subTDNames.has(tdName)) {
      return true
    }
  }
  return false
}

function shouldShowHospital(branch: any) {
  const showHospital = branch.showHospital ?? branch.ShowHospital ?? branch.data?.showHospital ?? branch.data?.ShowHospital
  return showHospital === true ||
         showHospital === 1 ||
         (typeof showHospital === 'string' &&
           (showHospital.toLowerCase() === 'true' ||
            showHospital === '1' ||
            showHospital.toLowerCase() === 'yes'))
}

function transformBranchData(branch: any) {
  return {
    _id: branch._id,
    branchName: branch.branchName,
    hospitalSlug: (branch as any).hospitalSlug || generateSlug(branch.branchName || ''),
    branchImage: branch.branchImage,
    address: branch.address,
    city: Array.isArray(branch.city) ? branch.city.map((c: any) => ({ cityName: c.cityName, state: c.state })) : [],
    location: (branch as any).location || null,
    department: Array.isArray(branch.department)
      ? branch.department.map((d: any) => ({ _id: d._id, name: d.name }))
      : [],
    specialty: Array.isArray(branch.specialty)
      ? branch.specialty.map((s: any) => ({ _id: s._id, name: s.name }))
      : [],
    totalBeds: branch.totalBeds,
    noOfDoctors: branch.noOfDoctors,
    yearEstablished: branch.yearEstablished,
    popular: branch.popular,
    showHospital: branch.showHospital === true || branch.showHospital === 'true' || (branch as any).ShowHospital === true,
  }
}

function processTreatments(treatments: any[]) {
  const treatmentMap = new Map<string, any>()

  treatments.forEach((t: any) => {
    if (!t || !t._id || treatmentMap.has(t._id)) return

    treatmentMap.set(t._id, {
      _id: t._id,
      name: t.name || 'Unknown Treatment',
      description: t.description || '',
      descriptionHtml: typeof t.descriptionHtml === 'string' ? t.descriptionHtml : (t.description || ''),
      category: null,
      testDiagnosis: t.testDiagnosis,
      testDiagnosisId: t.testDiagnosisId,
      duration: null,
      cost: t.cost || null,
      minPrice: t.cost || null,
      treatmentImage: t.treatmentImage || null,
      specialistName: null,
      specialistId: null,
    })
  })

  return Array.from(treatmentMap.values())
}

function processDoctors(
  tdDoctors: any[],
  allDoctors: DoctorData[],
  hospitals: any[],
  testDiagnosisName: string
) {
  if (!tdDoctors?.length) {
    return getDoctorsByTestDiagnosis({ doctors: allDoctors, hospitals } as any, testDiagnosisName) || []
  }

  const allDoctorsMap = new Map<string, DoctorData>()
  allDoctors.forEach((doc) => {
    if (doc._id) allDoctorsMap.set(doc._id, doc)
  })

  const processedDoctors = tdDoctors
    .map((tdDoc) => {
      if (tdDoc.specialistMappingName && tdDoc.testDiagnosisName) {
        return tdDoc as DoctorData
      }
      const fullDoc = tdDoc._id ? allDoctorsMap.get(tdDoc._id) : null
      if (fullDoc) {
        return {
          ...fullDoc,
          ...tdDoc,
          specialistMappingName: tdDoc.specialistMappingName || fullDoc.specialistMappingName,
          testDiagnosisName: tdDoc.testDiagnosisName || fullDoc.testDiagnosisName,
          subTestDiagnosisName: tdDoc.subTestDiagnosisName || fullDoc.subTestDiagnosisName,
        } as DoctorData
      }
      return tdDoc as DoctorData
    })
    .filter((d): d is DoctorData => d._id != null)

  if (processedDoctors.length === 0) {
    return getDoctorsByTestDiagnosis({ doctors: allDoctors, hospitals } as any, testDiagnosisName) || []
  }

  return processedDoctors
}

export const revalidate = 300
export const dynamicParams = true

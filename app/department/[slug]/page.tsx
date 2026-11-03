// app/department/[slug]/page.tsx
// Department detail page with parallel data fetching

import { notFound, redirect } from 'next/navigation'
import { getDepartmentWithDoctors } from '@/lib/services/departments'
import { getAllCMSData } from '@/lib/cms'
import { getDoctorsByDepartment } from '@/lib/services/departments'
import { generateSlug } from '@/lib/slug-utils'
import { generateDepartmentMetadata } from '@/app/metadata'
import type { DoctorData } from '@/lib/cms/types'
import DepartmentDetailClient from './DepartmentDetailClient'

const MAX_HOSPITALS_PER_DEPT = 100
const MAX_BRANCHES_PER_HOSPITAL = 50

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params

  let departmentName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  let departmentImage = ''
  let treatmentCount = 0
  let departmentDescription = ''

  try {
    const deptResult = await getDepartmentWithDoctors(slug)
    const department = deptResult?.department

    if (department) {
      departmentName = department.name
      departmentImage = department.departmentImage ?? ''
      treatmentCount = department.totalTreatments ?? department.treatments?.length ?? 0
      departmentDescription = `Explore ${treatmentCount} medical treatments in ${department.name}. World-class healthcare services in India through Medivisor.`
    }
  } catch (error) {
    console.error('Error fetching department for metadata:', error)
  }

  return generateDepartmentMetadata(
    departmentName,
    departmentDescription,
    departmentImage,
    treatmentCount,
    slug
  )
}

export default async function DepartmentPage({ params }: PageProps) {
  const { slug } = await params

  // Fetch all data in parallel
  const [deptResult, cmsData] = await Promise.all([
    getDepartmentWithDoctors(slug).catch(() => ({ department: null, doctors: [] })),
    getAllCMSData().catch(() => ({ hospitals: [], treatments: [], doctors: [] }))
  ])
  const allTreatments = cmsData.treatments || []

  const department = deptResult?.department
  const deptDoctors = deptResult?.doctors || []
  const allDoctors = cmsData.doctors || []

  if (!department) {
    notFound()
  }

  // Validate slug and redirect if needed
  const expectedSlug = department.slug
  if (slug !== expectedSlug) {
    redirect(`/department/${expectedSlug}`)
  }

  // Process hospitals with matching branches
  const hospitals = processHospitals(
    cmsData.hospitals || [],
    department
  )

  // Process treatments
  const departmentTreatments = processTreatments(
    department.treatments || []
  )

  // Process doctors
  const doctors = processDoctors(deptDoctors, allDoctors, cmsData.hospitals || [], department.name)

  return (
    <DepartmentDetailClient
      department={department}
      hospitals={hospitals}
      slug={slug}
      doctors={doctors}
      allDoctors={allDoctors}
      departmentTreatments={departmentTreatments}
      allTreatments={allTreatments || []}
    />
  )
}

// Helper function to process hospitals with matching branches
function processHospitals(hospitals: any[], department: any) {
  const deptId = department._id || ''
  const deptNameLower = (department.name || '').toLowerCase().trim()

  // Build sub-department name set
  const subDeptNames = new Set<string>()
  if (department.subDepartments?.length) {
    department.subDepartments.forEach((sd: any) => {
      if (sd.name) subDeptNames.add(sd.name.toLowerCase().trim())
    })
  }

  const matchedBranchesByHospital = new Map<string, any[]>()

  // Find matching branches for each hospital
  for (const hospital of hospitals) {
    if (!hospital?._id || !hospital.branches?.length) continue

    const matchedBranchIds = new Set<string>()

    for (const branch of hospital.branches) {
      if (!branch?._id || matchedBranchIds.size >= MAX_BRANCHES_PER_HOSPITAL) continue

      if (branchMatchesDepartment(branch, deptId, deptNameLower, subDeptNames) &&
          shouldShowHospital(branch)) {
        matchedBranchIds.add(branch._id)

        const branches = matchedBranchesByHospital.get(hospital._id) || []
        branches.push(transformBranchData(branch))
        matchedBranchesByHospital.set(hospital._id, branches)
      }
    }
  }

  // Filter hospitals with matches
  if (department) {
    return hospitals
      .filter((h: any) => h && h._id && matchedBranchesByHospital.has(h._id))
      .slice(0, MAX_HOSPITALS_PER_DEPT)
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

  // Fallback: map all hospitals but filter branches by showHospital
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

// Helper to check if branch matches department
function branchMatchesDepartment(branch: any, deptId: string, deptNameLower: string, subDeptNames: Set<string>) {
  const branchDepts = Array.isArray(branch.department)
    ? branch.department
    : branch.department ? [branch.department] : []

  for (const d of branchDepts) {
    if (!d) continue
    const dName = (typeof d === 'string' ? d : d?.name)?.toLowerCase().trim() || ''
    const dId = d?._id

    if (dId === deptId || dName === deptNameLower ||
        (deptNameLower && dName.includes(deptNameLower)) ||
        subDeptNames.has(dName)) {
      return true
    }
  }
  return false
}

// Helper to check if branch should be shown
function shouldShowHospital(branch: any) {
  const showHospital = branch.showHospital ?? branch.ShowHospital ?? branch.data?.showHospital ?? branch.data?.ShowHospital
  return showHospital === true ||
         showHospital === 1 ||
         (typeof showHospital === 'string' &&
           (showHospital.toLowerCase() === 'true' ||
            showHospital === '1' ||
            showHospital.toLowerCase() === 'yes'))
}

// Helper to transform branch data
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

// Helper to process treatments
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
      department: t.department,
      departmentId: t.departmentId,
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

// Helper to process doctors
function processDoctors(
  deptDoctors: any[],
  allDoctors: DoctorData[],
  hospitals: any[],
  departmentName: string
) {
  if (!deptDoctors?.length) {
    return getDoctorsByDepartment({ doctors: allDoctors, hospitals } as any, departmentName) || []
  }

  // Build lookup map
  const allDoctorsMap = new Map<string, DoctorData>()
  allDoctors.forEach((doc) => {
    if (doc._id) allDoctorsMap.set(doc._id, doc)
  })

  // Process and enrich doctors
  const processedDoctors = deptDoctors
    .map((deptDoc) => {
      if (deptDoc.specialistMappingName && deptDoc.departmentName) {
        return deptDoc as DoctorData
      }
      const fullDoc = deptDoc._id ? allDoctorsMap.get(deptDoc._id) : null
      if (fullDoc) {
        return {
          ...fullDoc,
          ...deptDoc,
          specialistMappingName: deptDoc.specialistMappingName || fullDoc.specialistMappingName,
          departmentName: deptDoc.departmentName || fullDoc.departmentName,
          subDepartmentName: deptDoc.subDepartmentName || fullDoc.subDepartmentName,
        } as DoctorData
      }
      return deptDoc as DoctorData
    })
    .filter((d): d is DoctorData => d._id != null)

  // Fallback if no doctors found
  if (processedDoctors.length === 0) {
    return getDoctorsByDepartment({ doctors: allDoctors, hospitals } as any, departmentName) || []
  }

  return processedDoctors
}

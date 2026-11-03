// app/hospital-groups/[slug]/page.tsx
// Hospital Group detail page showing all branches of a hospital network
// Optimized with pre-computed slug mapping for instant resolution

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAllCMSData, stripHtmlTags, fetchAllHospitalsCached } from '@/lib/cms'
import type { CMSDataResponse } from '@/lib/cms/types'
import { findHospitalBySlug, generateSlug, generateBranchSlug } from '@/lib/slug-utils'
import { getHospitalGroupBySlug } from '@/lib/services/hospital-groups'
import { generateHospitalGroupMetadata } from '@/app/metadata'
import { getLanguageFromCookie } from '@/lib/googleTranslate'
import { cookies } from 'next/headers'
import HospitalGroupClient from './HospitalGroupClient'

export const revalidate = 300
export const dynamicParams = true

interface PageProps {
  params: Promise<{ slug: string }>
}

// ============================================================================
// METADATA GENERATION
// ============================================================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  const cookieStore = await cookies()
  const lang = getLanguageFromCookie(cookieStore.toString())

  let hospitalName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  let hospitalDescription = ''
  let hospitalImage = ''
  let branchCount = 0
  let cmsData: CMSDataResponse | null = null
  let group: Awaited<ReturnType<typeof getHospitalGroupBySlug>> | null = null

  try {
    group = await getHospitalGroupBySlug(slug)

    if (!group) {
      cmsData = { hospitals: await fetchAllHospitalsCached() as any, treatments: [], doctors: [], departments: [], totalHospitals: 0, totalTreatments: 0, totalDoctors: 0, lastUpdated: '' } as CMSDataResponse
      group = await getHospitalGroupBySlug(slug, cmsData)
    }

    if (group) {
      hospitalName = group.hospitalName
      branchCount = group.branches?.length || 0

      const richContent = group.descriptionHtml || group.description
      hospitalDescription = extractDescription(richContent, hospitalName)
      hospitalImage = group.hospitalImage || group.logo || ''
    }
  } catch (error) {
    // Fallback to legacy method
    try {
      const hospitals = cmsData ? cmsData.hospitals as any[] : await fetchAllHospitalsCached()
      const hospital = findHospitalBySlug(hospitals, slug)

      if (hospital?.hospitalName) {
        hospitalName = hospital.hospitalName
        branchCount = hospital.branches?.length || 0

        const richContent = (hospital as any).descriptionHtml || hospital.description
        hospitalDescription = extractDescription(richContent, hospitalName)
        hospitalImage = (hospital as any).hospitalImage || ''
      }
    } catch {
      // Silent fail for metadata
    }
  }

  return generateHospitalGroupMetadata(
    hospitalName,
    hospitalDescription,
    hospitalImage,
    branchCount,
    slug,
    lang
  )
}

function extractDescription(richContent: string | null | undefined, hospitalName: string): string {
  if (!richContent) {
    return `Explore ${hospitalName} hospital branches in India. Medivisor provides world-class healthcare at affordable costs. Expert doctors and top facilities.`
  }

  const htmlContent = typeof richContent === 'string' ? richContent : ''
  const plainText = stripHtmlTags(htmlContent)
  const paragraphs = plainText.split(/\n\n|\n/).filter(p => p.trim().length > 0)

  let firstParagraph = paragraphs[1]?.trim() || paragraphs[0]?.trim() || ''

  if (firstParagraph.toLowerCase() === 'skip' || firstParagraph.toLowerCase().includes('skip')) {
    firstParagraph = paragraphs[2]?.trim() || ''
  }

  return truncateDescription(firstParagraph)
}

function truncateDescription(text: string): string {
  if (text.length <= 160) return text

  const truncated = text.substring(0, 160)
  const endPos = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  )

  if (endPos > 100) {
    return text.substring(0, endPos + 1)
  }
  return truncated.replace(/\s+\S*$/, '') + '...'
}

// ============================================================================
// DATA FETCHING
// ============================================================================

async function getHospitalData(slug: string) {
  try {
    const cmsData = await getAllCMSData()
    const group = await getHospitalGroupBySlug(slug, cmsData)

    if (group) {
      return { hospital: group, allHospitals: cmsData.hospitals }
    }

    const hospital = findHospitalBySlug(cmsData.hospitals, slug)
    return {
      hospital: hospital || null,
      allHospitals: cmsData.hospitals,
    }
  } catch (error) {
    console.error('Error fetching hospital data:', error)
    return { hospital: null, allHospitals: [] }
  }
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function HospitalGroupPage({ params }: PageProps) {
  const { slug } = await params
  const { hospital, allHospitals } = await getHospitalData(slug)

  // If no hospital found, show all hospitals listing
  if (!hospital) {
    return (
      <HospitalGroupClient
        hospital={null}
        allHospitals={allHospitals}
        slug={slug}
      />
    )
  }

  // Redirect standalone hospitals to branch page
  if (hospital.isStandalone === true) {
    const branch = hospital.branches?.[0]
    if (branch) {
      const branchName = branch.branchName || branch.name || hospital.hospitalName
      const cityData = branch.city?.[0]
      const cityName = cityData?.cityName || cityData?.name || branch.cityName
      const branchSlug = cityName
        ? generateBranchSlug(branchName, cityName)
        : generateSlug(branchName)
      if (branchSlug) {
        redirect(`/hospital-branches/${branchSlug}`)
      }
    }
    redirect(`/hospital-branches/${slug}`)
  }

  return (
    <HospitalGroupClient
      hospital={hospital}
      allHospitals={allHospitals}
      slug={slug}
    />
  )
}
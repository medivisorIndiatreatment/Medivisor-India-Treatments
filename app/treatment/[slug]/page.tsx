// app/treatment/[slug]/page.tsx
// Treatment detail page - server-side data fetching and processing

import { notFound } from 'next/navigation'
import { getAllCMSData, stripHtmlTags, extractTextFromRicos, type CMSDataResponse, type TreatmentData, generateSlug } from '@/lib/cms'
import { cleanSlug, findTreatmentBySlug } from '@/lib/slug-utils'
import { generateTreatmentMetadata } from '@/app/metadata'
import { mapTreatmentPageData } from '@/lib/services/treatment-page'
import { getLanguageFromCookie } from '@/lib/googleTranslate'
import { fetchAllTreatmentsCached } from '@/lib/cms'
import { fetchTreatmentPageData } from '@/lib/cms/optimized-fetchers'
import { cookies } from 'next/headers'
import TreatmentDetailClient from './TreatmentDetailClient'

export const revalidate = 300
export const dynamicParams = true

interface PageProps {
  params: Promise<{
    slug: string
  }>
  searchParams?: Promise<{
    tid?: string
  }>
}

interface TreatmentPageData {
  treatment: TreatmentData | null
  branchCards: ReturnType<typeof mapTreatmentPageData>['branchCards']
  doctors: ReturnType<typeof mapTreatmentPageData>['doctors']
}

function extractDescription(richContent: string | { nodes: unknown[] } | null | undefined): string {
  if (!richContent) return ''

let plainText: string

  if (typeof richContent === 'string') {
    plainText = stripHtmlTags(richContent)
  } else if (typeof richContent === 'object' && Array.isArray((richContent as { nodes?: unknown[] }).nodes)) {
    const nodes = (richContent as { nodes: unknown[] }).nodes as any[]
    plainText = stripHtmlTags(extractTextFromRicos(nodes))
  } else {
    return ''
  }
  const paragraphs = plainText.split(/\n\n|\n/).filter((paragraph) => paragraph.trim().length > 0)

  let firstParagraph = paragraphs[0]?.trim() || ''
  if (firstParagraph.toLowerCase().includes('skip')) {
    firstParagraph = paragraphs[1]?.trim() || ''
  }
  if (firstParagraph.toLowerCase().includes('skip')) {
    firstParagraph = paragraphs[2]?.trim() || ''
  }

  if (firstParagraph.length > 160) {
    const truncated = firstParagraph.substring(0, 160)
    const lastSentenceEnd = truncated.lastIndexOf('.')
    const lastExclamationEnd = truncated.lastIndexOf('!')
    const lastQuestionEnd = truncated.lastIndexOf('?')
    const endPos = Math.max(lastSentenceEnd, lastExclamationEnd, lastQuestionEnd)

    if (endPos > 100) {
      return firstParagraph.substring(0, endPos + 1)
    }
    return truncated.replace(/\s+\S*$/, '') + '...'
  }

  return firstParagraph
}

function getTreatmentImage(treatment: any): string {
  return treatment.treatmentImageUrl || treatment.treatmentImage || treatment.image || ''
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params

  const cookieStore = await cookies()
  const lang = getLanguageFromCookie(cookieStore.toString())

  let treatmentName = slug.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
  let treatmentDescription = ''
  let treatmentImage = ''

  try {
    const treatments = await fetchAllTreatmentsCached()
    const treatment = findTreatmentBySlug(treatments as any[], slug)

    if (treatment) {
      treatmentName = treatment.name
      const richContent = treatment.descriptionHtml || treatment.description
      treatmentDescription =
        extractDescription(richContent) ||
        `${treatment.name} treatment in India. World-class healthcare at affordable costs. Expert doctors and top hospitals.`
      treatmentImage = getTreatmentImage(treatment as any)
    }
  } catch (error) {
    console.error('Error generating metadata for treatment page:', error)
  }

  return generateTreatmentMetadata(treatmentName, treatmentDescription, treatmentImage, slug, lang)
}

async function getTreatmentData(slug: string): Promise<TreatmentPageData> {
  const optimized = await fetchTreatmentPageData(slug)
  if (optimized.treatment && (optimized.branchCards.length > 0 || optimized.doctors.length > 0)) {
    return {
      treatment: optimized.treatment,
      branchCards: optimized.branchCards,
      doctors: optimized.doctors as any,
    }
  }

  const cmsData: CMSDataResponse = await getAllCMSData()

  if (!cmsData.treatments?.length) {
    return {
      treatment: null,
      branchCards: [],
      doctors: [],
    }
  }

  const normalizedSlug = slug.toLowerCase()
  const cleanedSlug = cleanSlug(slug).toLowerCase()

  const treatment = cmsData.treatments.find((t: any) => {
    const storedSlug = t.slug ? generateSlug(t.slug) : ''
    const cleanStoredSlug = t.slug ? generateSlug(cleanSlug(t.slug)) : ''

    if (
      storedSlug === normalizedSlug ||
      cleanStoredSlug === normalizedSlug ||
      cleanStoredSlug === cleanedSlug
    ) {
      return true
    }
    if (t.name && generateSlug(t.name) === normalizedSlug) {
      return true
    }
    const parts = normalizedSlug.split('-')
    if (parts.length > 1) {
      const potentialId = parts[parts.length - 1]
      if (t._id && t._id.endsWith(potentialId)) {
        return true
      }
    }
    return false
  })

  if (!treatment) {
    return {
      treatment: null,
      branchCards: [],
      doctors: [],
    }
  }

  return mapTreatmentPageData(cmsData, treatment)
}

export default async function TreatmentPage({ params }: PageProps) {
  const { slug } = await params
  const { treatment, branchCards, doctors } = await getTreatmentData(slug)

  if (!treatment) {
    notFound()
  }

  return (
    <TreatmentDetailClient
      treatment={treatment}
      branchCards={branchCards}
      slug={slug}
      doctors={doctors}
    />
  )
}

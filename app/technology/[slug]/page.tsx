// app/technology/[slug]/page.tsx
// Technology detail page with rich content, hospitals, and specialists
// Matching treatment slug page format

import { Metadata } from 'next'
import { fetchAllTechnologiesCached, getAllCMSData, getDoctorsByTreatmentId, getDoctorsByHospitalId, extractRichTextHtml, isRichTextContent } from '@/lib/cms'
import { generateSlug } from '@/lib/slug-utils'
import { processImageForMetadata, getWixImageUrl } from '@/lib/wixMedia'
import TechnologyDetailClient from './TechnologyDetailClient'

export const revalidate = 300
export const dynamicParams = true

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  let techName = slug.replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
  let techDescription = ''
  let techImage = ''

  try {
    const technologies = await fetchAllTechnologiesCached()
    const tech = technologies.find((t: any) => generateSlug(t.Heading || t.heading || '') === slug)

    if (tech) {
      techName = String(tech.Heading || tech.heading || techName)

      // Try to extract description from DetailsHtml first (rich text), then Details
      const detailsHtml = tech.DetailsHtml || tech.detailsHtml
      const details = tech.Details || tech.details

      if (isRichTextContent(detailsHtml as any)) {
        techDescription = extractRichTextHtml(detailsHtml as any, false).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
      } else if (details) {
        const plainText = String(details).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
        const paragraphs = plainText.split(/\n\n|\n/).filter((p: string) => p.trim().length > 0)
        let firstParagraph = paragraphs[0]?.trim() || ''
        if (firstParagraph.length > 160) {
          firstParagraph = firstParagraph.substring(0, 160).replace(/\s+\S*$/, '') + '...'
        }
        techDescription = firstParagraph
      }

      const imageField = tech.Image || tech.image
      if (imageField) {
        techImage = String(imageField)
      }
    }
  } catch {
    // Silent fail for metadata
  }

  const siteUrl = 'https://medivisorindiatreatment.com'
  const pageUrl = `${siteUrl}/technology/${slug}`

  let ogImage = processImageForMetadata(techImage, siteUrl, false)
  if (!ogImage) {
    ogImage = processImageForMetadata(techImage, siteUrl, true)
  }

  // Final fallback to logo
  if (!ogImage) {
    ogImage = `${siteUrl}/logo_medivisor.png`
  }

  return {
    title: `${techName} Technology in India | Medivisor India Treatment`,
    description: techDescription || `Discover advanced ${techName} technology in India with Medivisor. World-class healthcare facilities and cutting-edge medical technology at affordable costs.`,
    keywords: [techName, 'medical technology India', 'healthcare technology', 'advanced treatment India'],
    authors: [{ name: 'Medivisor Team' }],
    publisher: 'Medivisor India Treatment',

    metadataBase: new URL(siteUrl),

    alternates: {
      canonical: pageUrl,
    },

    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      siteName: 'Medivisor India Treatment',
      title: `${techName} Technology in India | Medivisor India Treatment`,
      description: techDescription || `Discover advanced ${techName} technology in India with Medivisor.`,
      images: [
        {
          url: ogImage,
          secureUrl: ogImage,
          width: 1200,
          height: 630,
          type: 'image/jpeg',
          alt: `${techName} - Medivisor`,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: `${techName} Technology in India | Medivisor India Treatment`,
      description: techDescription || `Discover advanced ${techName} technology in India with Medivisor.`,
      site: '@medivisorindiatreatment',
      creator: '@medivisorindiatreatment',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${techName} - Medivisor`,
        },
      ],
    },

    robots: {
      index: true,
      follow: true,
    },
  }
}

interface TechnologyData {
  _id: string
  heading: string
  subHeading?: string
  description?: string
  descriptionHtml?: string | { nodes: unknown[] } | null
  image?: string
  details?: any
  detailsHtml?: string | { nodes: unknown[] } | null
  detailsRichText?: string | { nodes: unknown[] } | null
  technologiesGallery?: Array<{
    _id?: string
    image?: string | null
    title?: string | null
    description?: string | null
  }> | null
  slug: string
}

interface TechnologyPageData {
  technology: TechnologyData
  hospitals: any[]
  doctors: any[]
  relatedBranchIds: string[]
  relatedDoctorIds: string[]
}

/**
 * Helper: try to parse a value as a rich-text object { nodes: [...] }
 * Handles cases where DetailsHtml arrives as a stringified JSON object.
 */
function tryParseRichTextContent(value: unknown): unknown {
  if (!value) return value
  if (typeof value === 'object') return value
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!(trimmed.startsWith('{') && trimmed.endsWith('}'))) return value
  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.nodes)) {
      return parsed
    }
    return value
  } catch {
    return value
  }
}

/**
 * Helper: extract string from potential rich text object
 */
function extractString(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') {
    const parsed = tryParseRichTextContent(value)
    if (parsed !== value) {
      const obj = parsed as { nodes?: unknown[] }
      if (obj.nodes && Array.isArray(obj.nodes)) {
        const nodes = obj.nodes as Array<{ type?: string; nodes?: Array<{ textData?: { text?: string } }> }>
        try {
          return nodes
            .filter((node) => node.type === 'PARAGRAPH' && node.nodes)
            .map((node) => node.nodes?.map((n: any) => n.textData?.text || '').join('') ?? '')
            .join('\n')
        } catch {
          return ''
        }
      }
    }
    return value
  }
  if (typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null) {
    const obj = value as { nodes?: unknown[]; documentStyle?: unknown }
    if (obj.nodes && Array.isArray(obj.nodes)) {
      const nodes = obj.nodes as Array<{ type?: string; nodes?: Array<{ textData?: { text?: string } }> }>
      try {
        return nodes
          .filter((node) => node.type === 'PARAGRAPH' && node.nodes)
          .map((node) => node.nodes?.map((n: any) => n.textData?.text || '').join('') ?? '')
          .join('\n')
      } catch {
        return ''
      }
    }
    const objAny = value as Record<string, unknown>
    for (const key of Object.keys(objAny)) {
      const v = objAny[key]
      if (typeof v === 'string' && v) return v
      if (typeof v === 'number') return String(v)
    }
  }
  return String(value)
}

/**
 * Helper: resolve a Wix image URI to an http(s) CDN URL.
 */
function resolveWixImageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  const src = String(raw)
  if (src.startsWith('http://') || src.startsWith('https://')) return src
  if (src.startsWith('wix:image://')) return getWixImageUrl(src) || null
  return null
}

const TECHNOLOGY_KEYWORD_MAP: Record<string, string[]> = {
  'car-t': ['oncology', 'cancer', 'immunotherapy', 'leukemia', 'lymphoma', 'hematology', 'blood cancer', 'cell therapy', 'targeted therapy', 'bone marrow', 'stem cell', 'cancer care', 'hemato', 'immuno'],
  'robotic surgery': ['robotic', 'minimally invasive', 'laparoscopic', 'surgery', 'robotic surgery'],
  'da vinci': ['robotic', 'minimally invasive', 'surgery', 'robotic surgery'],
  'mako': ['robotic joint', 'orthopedic', 'knee replacement', 'hip replacement', 'joint replacement', 'robotic'],
  'proton therapy': ['radiation therapy', 'cancer', 'oncology', 'radiation', 'proton', 'tumor'],
  'mr-linac': ['radiation therapy', 'cancer', 'oncology', 'radiation', 'stereotactic', 'mri guided'],
  'ngs': ['genetic testing', 'genomics', 'molecular', 'diagnostics', 'dna', 'sequencing', 'genetic'],
  'brain suite': ['neurosurgery', 'brain', 'neurology', 'neuronavigation', 'stereotactic', 'neuro'],
  'hybrid operating': ['cardiac surgery', 'heart surgery', 'hybrid', 'cardiovascular', 'cardiac'],
  'robotic bronchoscopy': ['lung', 'pulmonology', 'bronchoscopy', 'pulmonary', 'chest', 'respiratory'],
  'radixact': ['radiation therapy', 'cancer', 'oncology', 'tomotherapy', 'stereotactic', 'radiation'],
}

function getTechnologyKeywords(heading: string): string[] {
  const lower = heading.toLowerCase()
  const keywords: string[] = []

  for (const [key, values] of Object.entries(TECHNOLOGY_KEYWORD_MAP)) {
    if (lower.includes(key)) {
      keywords.push(...values)
    }
  }

  const stopWords = new Set(['for', 'and', 'the', 'in', 'of', 'to', 'with', 'a', 'an', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could'])
  const words = lower.split(/[\s\-/()]+/).filter(w => w.length > 3 && !stopWords.has(w))
  keywords.push(...words)

  return [...new Set(keywords.map(k => k.toLowerCase()))]
}

function getSpecialtyNames(specialtyData: any): string[] {
  if (!specialtyData) return []
  if (Array.isArray(specialtyData)) {
    return specialtyData.map((s: any) => (typeof s === 'string' ? s : (s as any)?.name || '')).filter(Boolean)
  }
  if (typeof specialtyData === 'string') return [specialtyData]
  if (typeof specialtyData === 'object' && (specialtyData as any).name) return [(specialtyData as any).name]
  return []
}

function isBranchRelevantToTechnology(branch: any, keywords: string[]): boolean {
  if (!keywords.length) return false

  const treatmentNames: string[] = (branch.treatments || branch.Treatments || [])
    .map((t: any) => extractString(t.heading || t.Heading || t.name || t.Title || '').toLowerCase())
    .filter((name: string) => Boolean(name))

  const specialtyNames: string[] = getSpecialtyNames(branch.specialty || branch.specialization || branch.specialities || branch.specialist)
    .map((s: string) => s.toLowerCase())

  const branchName = (branch.branchName || '').toLowerCase()
  const hospitalName = (branch.hospitalName || branch.hospital?.hospitalName || '').toLowerCase()

  return keywords.some(keyword =>
    treatmentNames.some(name => name.includes(keyword)) ||
    specialtyNames.some(name => name.includes(keyword)) ||
    branchName.includes(keyword) ||
    hospitalName.includes(keyword)
  )
}

function isDoctorRelevantToTechnology(doctor: any, keywords: string[]): boolean {
  if (!keywords.length) return false

  const specializationNames = getSpecialtyNames(doctor.specialization)
    .map(s => s.toLowerCase())

  const doctorName = (doctor.doctorName || '').toLowerCase()
  const designation = (doctor.designation || '').toLowerCase()
  const qualification = (doctor.qualification || '').toLowerCase()

  return keywords.some(keyword =>
    specializationNames.some(name => name.includes(keyword)) ||
    doctorName.includes(keyword) ||
    designation.includes(keyword) ||
    qualification.includes(keyword)
  )
}

async function getTechnologyData(slug: string): Promise<TechnologyPageData | null> {
  try {
    const [technologies, cmsData] = await Promise.all([
      fetchAllTechnologiesCached(),
      getAllCMSData()
    ])

    const tech = technologies.find((t: any) => generateSlug(t.Heading || t.heading || '') === slug)

    if (!tech) return null

    // Helper to extract string from potential rich text object
    const heading = extractString(tech.Heading || tech.heading)
    const subHeading = extractString(tech['Sub Heading'] || tech.subHeading)
    const description = extractString(tech.Description || tech.description)

    // Resolve image via wixMedia
    const imageUrl = resolveWixImageUrl(String(tech.Image || tech.image || ''))

// Preserve rich text structure - check all potential rich content fields
    // Wix may store rich content in Details, DetailsHtml, Description, or DescriptionHtml
    const rawRichContent = tech.DetailsHtml || tech.detailsHtml || tech.DescriptionHtml || tech.descriptionHtml || tech.Details || tech.details || tech.Description || tech.description
    const parsedRichContent = tryParseRichTextContent(rawRichContent)

    // Determine which rich content to use (prioritize fields with nodes)
    let finalRichContent: any = null
    if (parsedRichContent && typeof parsedRichContent === 'object' && (parsedRichContent as any).nodes) {
      finalRichContent = parsedRichContent
    }

    const technologiesGallery = tech.TechnologiesGallery || tech.technologiesGallery || []

    // ── Build technology keywords for semantic matching ──
    const techKeywords = getTechnologyKeywords(heading)

    // ── Hospitals: find branches whose treatments, specialties, or keywords match this tech ──
    const techHeadingLower = heading.toLowerCase()
    const relatedHospitals = cmsData.hospitals
      .map((hospital: any) => ({
        ...hospital,
        branches: hospital.branches.filter((branch: any) => {
          // 1. Exact treatment name match (existing logic)
          const branchTreatments = branch.treatments || branch.Treatments || []
          const branchTechs: string[] = Array.isArray(branchTreatments)
            ? branchTreatments
                .map((t: any) => extractString(t.heading || t.Heading || t.name || t.Title || ''))
                .filter(Boolean)
            : []
          const exactMatch = branchTechs.some((t: string) =>
            t.toLowerCase().includes(techHeadingLower) || techHeadingLower.includes(t.toLowerCase())
          )
          if (exactMatch) return true

          // 2. Keyword-based match (treatment names, specialties, branch/hospital names)
          if (techKeywords.length > 0 && isBranchRelevantToTechnology(branch, techKeywords)) {
            return true
          }

          return false
        }),
      }))
      .filter((h: any) => h.branches.length > 0)

    // ── Collect matched hospital IDs for doctor lookup ──
    const matchedHospitalIds = new Set<string>()
    for (const hospital of relatedHospitals) {
      if (hospital._id) matchedHospitalIds.add(hospital._id)
    }

    // ── Doctors: find doctors via multiple matching strategies ──
    let filteredDoctors: any[] = []
    try {
      const techObj = { _id: tech._id || tech.ID || '', name: heading }
      const treatmentDoctors = getDoctorsByTreatmentId(cmsData, techObj._id || heading)

      // Doctors directly matched to treatments
      const doctorsByTreatment = new Map<string, any>()
      for (const doc of treatmentDoctors) {
        if (doc._id) doctorsByTreatment.set(doc._id, doc)
      }

      // Doctors from matched hospitals
      const doctorsByHospital = new Map<string, any>()
      for (const hospitalId of matchedHospitalIds) {
        const hospitalDoctors = getDoctorsByHospitalId(cmsData, hospitalId)
        for (const doc of hospitalDoctors) {
          if (doc._id) doctorsByHospital.set(doc._id, doc)
        }
      }

      // Doctors matched by specialization keywords
      const doctorsByKeyword = new Map<string, any>()
      if (techKeywords.length > 0) {
        for (const doc of cmsData.doctors || []) {
          if (isDoctorRelevantToTechnology(doc, techKeywords)) {
            if (doc._id) doctorsByKeyword.set(doc._id, doc)
          }
        }
      }

      // Merge all sources, preserving the most complete data
      const allMatchedIds = new Set([
        ...doctorsByTreatment.keys(),
        ...doctorsByHospital.keys(),
        ...doctorsByKeyword.keys(),
      ])

      for (const docId of allMatchedIds) {
        const byTreatment = doctorsByTreatment.get(docId)
        const byHospital = doctorsByHospital.get(docId)
        const byKeyword = doctorsByKeyword.get(docId)

        // Merge: prefer treatment data, supplement with hospital and keyword data
        const merged = { ...byTreatment, ...byHospital, ...byKeyword }
        filteredDoctors.push(merged)
      }
    } catch {
      filteredDoctors = []
    }

    const relatedBranchIds = new Set<string>()
    const relatedHospitalIds = new Set<string>()
    for (const hospital of relatedHospitals) {
      if (hospital._id) relatedHospitalIds.add(hospital._id)
      for (const branch of hospital.branches || []) {
        if (branch._id) relatedBranchIds.add(branch._id)
      }
    }

    const sortedHospitals = [
      ...relatedHospitals.map((hospital: any) => {
        const originalHospital = cmsData.hospitals.find((h: any) => h._id === hospital._id)
        return {
          ...hospital,
          branches: originalHospital ? (originalHospital.branches || []) : (hospital.branches || []),
        }
      }),
      ...cmsData.hospitals.filter((h: any) => !relatedHospitalIds.has(h._id)),
    ]

    const relatedDoctorIds = new Set(filteredDoctors.map((d: any) => d._id))
    const sortedDoctors = [
      ...filteredDoctors,
      ...(cmsData.doctors || []).filter((d: any) => !relatedDoctorIds.has(d._id)),
    ]

    return {
      technology: {
        _id: tech._id || tech.ID || '',
        heading,
        subHeading: subHeading || undefined,
        description: description || undefined,
        descriptionHtml: (rawRichContent || undefined) as any,
        image: imageUrl || undefined,
        detailsHtml: finalRichContent,
        technologiesGallery: Array.isArray(technologiesGallery) ? technologiesGallery : null,
        slug,
      },
      hospitals: sortedHospitals,
      doctors: sortedDoctors,
      relatedBranchIds: Array.from(relatedBranchIds),
      relatedDoctorIds: Array.from(relatedDoctorIds),
    }
  } catch (error) {
    console.error('Error fetching technology:', error)
    return null
  }
}

export default async function TechnologyPage({ params }: PageProps) {
  const { slug } = await params

  const result = await getTechnologyData(slug)

  if (!result) {
    return (
      <TechnologyDetailClient
        technology={null}
        slug={slug}
        hospitals={[]}
        doctors={[]}
        relatedBranchIds={[]}
        relatedDoctorIds={[]}
      />
    )
  }

  return (
    <TechnologyDetailClient
      technology={result.technology}
      slug={slug}
      hospitals={result.hospitals}
      doctors={result.doctors}
      relatedBranchIds={result.relatedBranchIds}
      relatedDoctorIds={result.relatedDoctorIds}
    />
  )
}

"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import Image from "next/image"
import BreadcrumbNav from "@/components/ui/BreadcrumbNav"
import { sanitizeHtml, extractRichTextHtml, isRichTextContent } from "@/lib/cms"
import { RicosRenderer } from "@/components/RichContentViewer"
import { TableOfContents, extractHeadingsFromNodes, extractHeadingsFromHtml } from "@/components/ui/TableOfContents"
import ContactForm from "@/components/ContactForm"
import ContactModal from "@/components/ContactModal"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import { TreatmentDoctorsSection } from "@/components/department"
import HospitalSection from "@/components/sections/HospitalSection"
import { useTranslatedStrings, useTranslatedHtmlString, useTranslatedRicosContent } from "@/lib/i18n"
import type { BranchCardData } from "@/components/cards/types"

interface TechnologyDetailClientProps {
  technology: any
  slug: string
  hospitals?: any[]
  doctors?: any[]
  relatedBranchIds?: string[]
  relatedDoctorIds?: string[]
}

// Helper function to generate branch slug
function generateBranchSlug(branchName: string, cityName?: string): string {
  if (!branchName) return 'hospital'

  const baseSlug = branchName
    .toLowerCase()
    .trim()
    .replace(/[&/\\#,+()$~%.'":*?<>{}|]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (cityName) {
    const normalizedName = branchName.toLowerCase().replace(/\s+/g, '')
    const normalizedCity = cityName.toLowerCase().replace(/\s+/g, '')
    if (!normalizedName.includes(normalizedCity)) {
      const citySlug = cityName
        .toLowerCase()
        .trim()
        .replace(/[&/\\#,+()$~%.'":*?<>{}|]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      return `${baseSlug}-${citySlug}`
    }
  }

  return baseSlug
}

function tryParseRichText(value: unknown): unknown {
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
  } catch {}
  return value
}

// Helper to get city name from branch data
function getBranchCityName(branch: any): string {
  if (!branch.city) return ''
  if (Array.isArray(branch.city) && branch.city.length > 0) {
    return branch.city[0]?.cityName || branch.city[0]?.name || ''
  }
  if (typeof branch.city === 'string') return branch.city
  if (typeof branch.city === 'object') return branch.city.cityName || branch.city.name || ''
  return ''
}

// Helper to get location string from branch data
function getBranchLocation(branch: any): string {
  if (!branch.city) return ''
  if (Array.isArray(branch.city) && branch.city.length > 0) {
    const city = branch.city[0]
    if (typeof city === 'object') {
      const cityName = city.cityName || city.name || ''
      const state = city.state || city.State || ''
      return state ? `${cityName}, ${state}` : cityName
    }
    return String(branch.city[0])
  }
  if (typeof branch.city === 'string') return branch.city
  return ''
}

// Helper to get specialty string from branch data
function getBranchSpecialty(branch: any): string {
  const specData = branch.specialty || branch.specialization || branch.specialities || branch.specialist
  if (!specData) return ''
  if (Array.isArray(specData) && specData.length > 0) {
    const first = specData[0]
    return typeof first === 'string' ? first : first?.name || ''
  }
  if (typeof specData === 'object') return specData.name || ''
  return ''
}

export default function TechnologyDetailClient({
  technology,
  slug,
  hospitals = [],
  doctors = [],
  relatedBranchIds = [],
  relatedDoctorIds = [],
}: TechnologyDetailClientProps) {
  const displayName = technology?.heading || slug.replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())

  // Translate all text content reactively
  const translatableStrings = useMemo(() => {
    const strings: string[] = [
      displayName,
      "Technologies",
      "Related Doctors",
      "Related Hospitals",
    ]
    if (technology?.description) {
      strings.push(technology.description)
    }
    return Array.from(new Set(strings))
  }, [displayName, technology?.description])

  const translatedStrings = useTranslatedStrings(translatableStrings)

  const translationMap = useMemo(() => {
    const map = new Map<string, string>()
    translatableStrings.forEach((original, i) => {
      map.set(original, translatedStrings[i] ?? original)
    })
    return map
  }, [translatableStrings, translatedStrings])

  const t = useCallback((text: string): string => {
    if (!text) return text
    return translationMap.get(text) || text
  }, [translationMap])

  const breadcrumbItems = [
    { label: "Technologies", href: "" },
    { label: displayName, href: "#" },
  ]

  const i18nKeyPrefix = `technology.${slug}`

  // Resolve hero image — handles wix://, https://, and plain string formats
  const heroImage = useMemo(() => {
    if (!technology?.image) return "/placeholder.svg"

    // Use pre-computed CDN URL from server for SSR/CSR consistency
    if (technology.technologyImageUrl) {
      return technology.technologyImageUrl
    }

    // Fallback for cases where technologyImageUrl wasn't pre-computed
    if (!technology.image) return "/placeholder.svg"
    return technology.image
  }, [technology?.technologyImageUrl, technology?.image])

// Extract raw rich content (Ricos nodes) for React-based translation
  const rawRicosContent = useMemo(() => {
    if (!technology) return null

    const parsedDescriptionHtml = tryParseRichText(technology.descriptionHtml)
    if (isRichTextContent(parsedDescriptionHtml as any)) return parsedDescriptionHtml

    if (isRichTextContent(technology.detailsHtml as any)) return technology.detailsHtml

    const parsedDetailsHtml = tryParseRichText(technology.detailsHtml)
    if (isRichTextContent(parsedDetailsHtml as any)) return parsedDetailsHtml

    return null
  }, [technology?.descriptionHtml, technology?.detailsHtml])

  // Extract raw HTML content for React-based translation
  const rawHtmlContent = useMemo(() => {
    if (!technology) return ""
    const content = technology.descriptionHtml || technology.detailsHtml || ""
    if (!content) return ""
    return extractRichTextHtml(content, false)
  }, [technology?.descriptionHtml, technology?.detailsHtml])

  // Always call hooks (Rules of Hooks) — translate rich content reactively
  const translatedRicos = useTranslatedRicosContent(rawRicosContent)
  const translatedHtml = useTranslatedHtmlString(rawHtmlContent)

  const renderContent = useMemo(() => {
    if (!technology) return null

    if (rawRicosContent && isRichTextContent(rawRicosContent as any)) {
      return (
        <div>
          <RicosRenderer content={translatedRicos as any} />
        </div>
      )
    }

    const html = translatedHtml
    if (html) {
      return (
        <div
          className={`prose custom-list space-y-2 first-heading max-w-none ${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION}`}
          dangerouslySetInnerHTML={{
__html: sanitizeHtml(html),
          }}
          suppressHydrationWarning
        />
      )
    }

    return null
}, [technology, rawRicosContent, translatedRicos, translatedHtml])

  // Transform hospitals data to BranchCardData format for HospitalSection
  const relatedBranchIdsSet = useMemo(() => new Set(relatedBranchIds), [relatedBranchIds])

  const branchCards = useMemo((): BranchCardData[] => {
    if (!hospitals || hospitals.length === 0) return []

    const cards: BranchCardData[] = []
    hospitals.forEach((hospital) => {
      const hospitalBranches = hospital.branches || []
      hospitalBranches.forEach((branch: any) => {
        const cityName = getBranchCityName(branch)
        const branchName = branch.branchName || hospital.hospitalName || 'Hospital'
        const branchSlug = generateBranchSlug(branchName, cityName)

        cards.push({
          _id: branch._id,
          branchName: branch.branchName,
          hospitalName: hospital.hospitalName,
          image: branch.branchImageUrl || branch.branchImage || branch.logoUrl || branch.logo,
          logo: branch.logo,
          city: branch.city,
          primarySpecialty: getBranchSpecialty(branch),
          location: getBranchLocation(branch),
          totalBeds: branch.totalBeds,
          noOfDoctors: branch.noOfDoctors,
          yearEstablished: branch.yearEstablished,
          accreditation: branch.accreditation,
          popular: branch.popular === true,
          slug: branchSlug,
        })
      })
    })

    return cards.sort((a, b) => {
      const aRelated = relatedBranchIdsSet.has(a._id)
      const bRelated = relatedBranchIdsSet.has(b._id)
      if (aRelated && !bRelated) return -1
      if (!aRelated && bRelated) return 1
      const nameA = a.branchName || a.hospitalName || ''
      const nameB = b.branchName || b.hospitalName || ''
      return nameA.localeCompare(nameB)
    })
  }, [hospitals, relatedBranchIdsSet])

  const relatedDoctorIdsSet = useMemo(() => new Set(relatedDoctorIds), [relatedDoctorIds])

  const sortedDoctors = useMemo(() => {
    if (!doctors || doctors.length === 0) return []

    return [...doctors].sort((a, b) => {
      const aRelated = relatedDoctorIdsSet.has(a._id)
      const bRelated = relatedDoctorIdsSet.has(b._id)
      if (aRelated && !bRelated) return -1
      if (!aRelated && bRelated) return 1
      const nameA = a.doctorName || a.name || ''
      const nameB = b.doctorName || b.name || ''
      return nameA.localeCompare(nameB)
    })
  }, [doctors, relatedDoctorIdsSet])

  return (
    <div className="bg-white min-h-screen smooth-load loaded">
      {/* Hero Section - Full width banner matching department/branch pages */}
      <section className={`relative overflow-hidden ${DESIGN_TOKENS.SECTION_SPACING.HERO_OUTER_PY} ${DESIGN_TOKENS.BACKGROUNDS.WHITE}`}>
        {/* Background image and overlay */}
        <div className="absolute inset-0 z-0">
          {heroImage && heroImage !== "/placeholder.svg" ? (
            <Image
              src={heroImage}
alt={`${t(displayName)} technology`}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
              data-i18n-original={`${displayName} technology`}
              data-trans-managed="true"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200" />
          )}
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-white/10" />

        {/* Container */}
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} px-12 w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-12 items-end gap-10 md:h-full overflow-hidden h-full min-h-[40vh] md:min-h-[70dvh]`}>
          <div className="text-white lg:col-span-8 flex items-end relative z-[15]">
            <div className="md:w-[85%]">
<h1 className={DESIGN_TOKENS.TYPOGRAPHY.HERO_HEADING} data-i18n-original={displayName} data-trans-managed="true">
                {t(displayName)}
            </h1>
            </div>
          </div>
        </div>
      </section>

      <BreadcrumbNav items={breadcrumbItems} />
      {technology && (
        <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
          <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}> 
            <div className={`grid grid-cols-1 lg:grid-cols-4 ${DESIGN_TOKENS.SECTION_SPACING.GAP}`}>
              <div className="lg:col-span-3 space-y-6 md:space-y-8">
                <div className={` first-heading lg:p-6 md:p-8`}>
                  {renderContent}
                </div>
              </div>
              <div className="lg:col-span-1 hidden md:block">
                <div className="sticky top-24">
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

{/* Related Doctors Section */}
<TreatmentDoctorsSection
  doctors={sortedDoctors}
  hospitals={hospitals}
  title="Related Doctors"
  titleI18nKey="doctors.related_doctors"
  showSearch
/>

        {/* Related Hospital Branches Section */}
        <HospitalSection
          hospitals={branchCards}
          title="Related Hospitals"
          titleI18nKey="hospitals.related_hospitals"
          visualIndex={1}
        />

      <ContactModal isOpen={false} onClose={() => {}} />

      {/* Mobile Contact Form */}
      <section className={`${DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT} ${DESIGN_TOKENS.SECTION_SPACING.PY} md:hidden block`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="md:bg-white md:rounded-xl md:p-6 md:shadow-sm md:border border-gray-100">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}
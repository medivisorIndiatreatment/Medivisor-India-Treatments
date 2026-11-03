"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import SectionHeading from "@/components/ui/SectionHeading"
import BreadcrumbNav from "@/components/ui/BreadcrumbNav"
import HeroSection from "@/components/ui/HeroSection"
import BranchHeroBanner from "@/components/BranchHeroBanner"
import { generateSlug, cleanSlug } from "@/lib/slug-utils"
import { sanitizeHtml, getRichContentDescription, isRichTextContent, extractRichTextHtml } from "@/lib/cms"
import { getImageUrl } from "@/lib/utils/cms"
import { RicosRenderer } from "@/components/RichContentViewer"
import ContactModal from "@/components/ContactModal"
import ContactForm from "@/components/ContactForm"
import CtaSection from "@/components/CtaSection"
import HospitalBranchesCarousel from "@/components/HospitalBranchesCarousel"
import OverviewSection from "@/components/ui/OverviewSection"
import BranchTreatments from "@/components/BranchTreatments"
import BranchDoctorsSection from "@/components/BranchDoctorsSection"
import { useI18n, useTranslatedString, useTranslatedHtmlString, useLang } from "@/lib/i18n"
import { isDelhiNCR } from "@/lib/utils/city-utils"
import { Trans } from "@/lib/i18n/Trans"
import type { DoctorData } from "@/lib/cms/types"
import type { DoctorCardData } from "@/components/cards/types"
import { DESIGN_TOKENS } from "@/components/design-tokens"

// Module-level constants (not recreated on each render)
function getCityName(city: any): string {
  if (!city) return ''
  if (typeof city === 'string') return city
  if (typeof city === 'object') return city.cityName || city.name || ''
  return ''
}

function getStateName(city: any): string {
  if (!city) return ''
  if (typeof city === 'string') return ''
  if (typeof city === 'object') return city.state || city.State || ''
  return ''
}

function getSpecialtyName(specialty: any): string {
  if (!specialty) return ''
  if (typeof specialty === 'string') return specialty
  if (typeof specialty === 'object') {
    const name = specialty.name || specialty.specialty || specialty.title || specialty.specialization
    if (typeof name === 'string') return name
    return ''
  }
  return ''
}

function extractSpecialtyFromName(name: string): string {
  if (!name) return ''
  const lower = name.toLowerCase()
  if (lower.includes('multi-super specialty') || lower.includes('multi-superspecialty')) return 'Multi-Super Specialty'
  if (lower.includes('super specialty') || lower.includes('superspecialty')) return 'Super Specialty'
  if (lower.includes('multi-specialty') || lower.includes('multispecialty') || lower.includes('multi specialty')) return 'Multi Specialty'
  if (lower.includes('specialty')) return 'Specialty'
  return ''
}

function getNumberValue(val: any): number | null {
  if (val === null || val === undefined) return null
  if (typeof val === 'number') return val
  if (typeof val === 'string') return parseInt(val, 10) || null
  if (typeof val === 'object') return val.value || val.number || val.count || null
  return null
}

function getImageValue(val: any): string | null {
  if (!val) return null
  if (typeof val === 'string') return getImageUrl(val) || val
  if (typeof val === 'object') {
    const url = val.url || val.src || val.image || null
    if (!url) return null
    return getImageUrl(url) || url
  }
  return null
}

function getDisplayLocation(city: string, state: string): string {
  if (!city) return ''
  if (isDelhiNCR(city)) return 'Delhi NCR'
  if (state && state !== 'Delhi NCR') return `${city}, ${state}`
  return city
}

interface BranchDetailClientProps {
  branch: any | null
  hospitals: any[]
  slug: string
  treatments?: any[]
  doctors?: DoctorData[]
  allDoctors?: DoctorData[]
  departments?: any[]
  isLoading?: boolean
}

export default function BranchDetailClient({
  branch,
  hospitals,
  slug,
  treatments = [],
  doctors = [],
   allDoctors = [],
  departments = [],
  isLoading = false,
}: BranchDetailClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { t } = useI18n()
  const { dir } = useLang()

  const displayName = useMemo(() => {
    const name = branch?.branchName
    if (!name) return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    if (typeof name === 'string') return name
    if (typeof name === 'object') return name.name || name.title || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }, [branch?.branchName, slug])

  const translatedDisplayName = useTranslatedString(displayName)

  const ricosNodes = useMemo(() => {
    if (!branch?.descriptionHtml) return null
    if (isRichTextContent(branch.descriptionHtml)) {
      const ricaContent = branch.descriptionHtml as any
      if (ricaContent?.nodes && Array.isArray(ricaContent.nodes)) {
        return ricaContent.nodes
      }
      if (Array.isArray(branch.descriptionHtml)) {
        return branch.descriptionHtml
      }
    }
    return null
  }, [branch])

  const contentHtml = useMemo(() => {
    if (!branch) return null
    if (ricosNodes) return null
    const content = branch?.descriptionHtml
    if (typeof content === 'string' && content.trim()) {
      return content
    }
    const fallback = branch?.description || branch?.data?.description || null
    if (fallback && typeof fallback === 'string') {
      return `<p>${fallback}</p>`
    }
    return null
  }, [branch, ricosNodes])

  const translatedHtmlString = useTranslatedHtmlString(contentHtml || "")

  const cityData = branch?.city || branch?.data?.city || []
  const firstCity = useMemo(() => getCityName(cityData[0]), [cityData])
  const state = useMemo(() => getStateName(cityData[0]), [cityData])
  const displayLocation = useMemo(() => getDisplayLocation(firstCity, state), [firstCity, state])

  const specialtyName = useMemo(() => {
    const fromCms =
      getSpecialtyName(branch?.specialty?.[0]) ||
      getSpecialtyName(branch?.specialization?.[0]) ||
      getSpecialtyName(branch?.specialities?.[0]) ||
      getSpecialtyName(branch?.specialist?.[0]) ||
      getSpecialtyName(branch?.data?.specialty?.[0]) ||
      getSpecialtyName(branch?.data?.specialization?.[0]) ||
      getSpecialtyName(branch?.data?.specialities?.[0]) ||
      getSpecialtyName(branch?.data?.specialist?.[0]) ||
      getSpecialtyName(branch?.hospitalData?.specialty?.[0]) ||
      getSpecialtyName(branch?.hospitalData?.specialization?.[0]) ||
      getSpecialtyName(branch?.hospitalData?.specialities?.[0]) ||
      getSpecialtyName(branch?.hospitalData?.specialist?.[0])

    if (fromCms) return fromCms

    const fromName = extractSpecialtyFromName(branch?.branchName || '')
    if (fromName) return fromName

    return 'Multi Specialty'
  }, [branch])

  const translatedSpecialty = useTranslatedString(specialtyName)

  const yearEstablished = useMemo(() => getNumberValue(branch?.yearEstablished || branch?.data?.yearEstablished || branch?.hospitalData?.yearEstablished), [branch])
  const totalBeds = useMemo(() => getNumberValue(branch?.totalBeds || branch?.data?.totalBeds || branch?.hospitalData?.totalBeds), [branch])
  const noOfDoctors = useMemo(() => getNumberValue(branch?.noOfDoctors || branch?.data?.noOfDoctors || branch?.hospitalData?.noOfDoctors), [branch])

  const breadcrumbItems = useMemo(() => [
    { label: t("Hospitals"), href: "/search" },
    { label: translatedDisplayName, href: `#` },
  ], [t, translatedDisplayName])

  const heroImage = useMemo(() => {
    if (!branch) return null

    const candidates = [
      branch.branchImageUrl,
      branch.branchImage,
      branch.image,
      branch.coverImage,
      branch.heroImage,
      branch.mainImage,
      branch.logoUrl,
      branch.logo,
      branch.hospitalData?.hospitalImage,
      branch.hospitalData?.hospitalImageUrl,
    ]

    const skipImages = ['/placeholder.svg', '/placeholder.png', 'placeholder.svg', 'placeholder.png']

    for (const img of candidates) {
      if (!img) continue
      if (typeof img === 'string' && skipImages.includes(img)) continue
      return getImageValue(img)
    }

    return null
  }, [branch])
  const branchLogo = useMemo(() => getImageValue(branch?.logoUrl || branch?.logo || branch?.hospitalData?.logoUrl || branch?.hospitalData?.logo), [branch])

  const branchAddress = useMemo(() => {
    const addr = branch?.address || branch?.data?.address
    if (!addr) return null
    if (typeof addr === 'string') return addr
    if (typeof addr === 'object') return addr.address || addr.street || JSON.stringify(addr)
    return null
  }, [branch])

  const branchAccreditations = useMemo(() =>
    branch?.accreditation || branch?.data?.accreditation ||
    branch?.hospitalData?.accreditations || branch?.hospitalData?.accreditation ||
    branch?.accreditations || [],
    [branch]
  )

  const hospitalName = useMemo(() => {
    const name = branch?.hospitalName || branch?.hospitalData?.hospitalName
    if (!name) return null
    if (typeof name === 'string') return name
    if (typeof name === 'object') return name.name || name.title || null
    return null
  }, [branch])

  // Resolve the Hospital Group this branch belongs to. The branch → group mapping is
  // authoritative: a branch belongs to a group ONLY if its `hospitalId` matches a
  // non-standalone group AND that group actually lists this branch among its own
  // branches. A standalone branch (no group relationship) has no valid mapping, so
  // the "Read about [group]" button must be hidden for it.
  const matchedHospitalGroup = useMemo(() => {
    if (!branch) return null
    if (!hospitals || hospitals.length === 0) return null

    const branchId = branch._id || branch.id
    const branchHospitalId = branch?.hospitalId || branch?.hospitalData?._id
    if (!branchHospitalId || !branchId) return null

    const group = hospitals.find((h: any) => {
      if (!h?._id) return false
      if (h.isStandalone === true) return false
      // A hospital created from a standalone branch (originalBranchId set) is not
      // a real Hospital Group and must never be treated as one.
      if (h.originalBranchId) return false
      // A synthetic single-branch "hospital" shares the branch's own _id. Excluding
      // it guarantees a standalone branch never resolves to a phantom group.
      if (h._id === branchId) return false
      if (!h.branches || h.branches.length === 0) return false
      if (h._id !== branchHospitalId) return false
      // Verify this branch is genuinely one of the group's own branches.
      return h.branches.some((b: any) => (b?._id || b?.ID) === branchId)
    })

    return group || null
  }, [branch, hospitals])

  // Use the matched group's own slug (same as getHospitalGroupBySlug) for the link.
  const hospitalGroupSlug = useMemo(() => {
    if (!matchedHospitalGroup?.hospitalName) return null
    return matchedHospitalGroup.slug || generateSlug(matchedHospitalGroup.hospitalName)
  }, [matchedHospitalGroup])

  const quickOverviewTitle = t("Quick Overview")

  const relatedTreatmentsTitle = t("Related treatments")

  const similarHospitalsTitle = useMemo(() => {
    if (displayLocation) {
      return t(`Similar Hospitals near ${displayName} `)
    }
    return t(`Top Hospitals near ${displayName} in India`)
  }, [t, displayLocation, displayName])

  const handleModalOpen = useCallback(() => setIsModalOpen(true), [])
  const handleModalClose = useCallback(() => setIsModalOpen(false), [])

  if (!branch) {
    return (
      <div className="bg-white min-h-screen">
        <HeroSection
          title={t("Hospital Branches in India")}
          titleI18nKey="page.hospital-branches.title"
          image='/banner/process-banner.png'
        />
        <BreadcrumbNav items={breadcrumbItems} />

        <section className="py-8 md:py-12">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeading
              title={t("Explore Our Hospital Branches")}
              titleI18nKey="page.hospital-branches.explore_title"
              subtitle={t("Find the best hospital branch for your treatment in India")}
              subtitleI18nKey="page.hospital-branches.explore_subtitle"
              className="mb-8"
            />

            <div className="prose max-w-none mb-8">
              <p className="text-base md:text-lg" data-i18n-original="Medivisor partners with top hospital chains across India to provide world-class healthcare at affordable costs. Browse our network of hospital branches to find the best option for your medical needs.">
                <Trans id="page.hospital-branches.description">
                  Medivisor partners with top hospital chains across India to provide world-class healthcare at affordable costs. Browse our network of hospital branches to find the best option for your medical needs.
                </Trans>
              </p>
            </div>
          </div>
        </section>

        <CtaSection />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="animate-pulse">
          <div className="h-[40vh] lg:h-[70vh] bg-gray-200"></div>
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 py-8">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="lg:col-span-3">
                <div className="h-64 bg-gray-200 rounded mb-6"></div>
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-1 hidden md:block">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isRicosContent = ricosNodes !== null
  const htmlContentToRender = isRicosContent ? null : translatedHtmlString

  const validTreatments = useMemo(
    () => (treatments || []).filter((t: any) => t.name && t.name !== "Unknown Treatment" && t.name !== "Treatment"),
    [treatments]
  )

  return (
    <div className="bg-white min-h-screen" dir={dir}>
      <BranchHeroBanner
        title={displayName}
        titleI18nKey="branch.branch-name"
        branchImage={heroImage}
        logo={branchLogo}
        address={branchAddress}
        description={contentHtml || branch?.description || branch?.data?.description || undefined}
        accreditations={branchAccreditations}
        hospitalName={hospitalName || undefined}
      />
      <BreadcrumbNav items={breadcrumbItems} />

      {/* Overview Section - WHITE background (Visual Index 2) */}
      <section className={`bg-white ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="lg:col-span-3">
              {/* Overview Card - Matching HospitalGroupClient style */}
              <div className="bg-white md:rounded-xl md:border md:border-gray-100 md:shadow-sm md:p-8 mb-6">
                <SectionHeading
                  title={quickOverviewTitle}
                  titleI18nKey="branch.quick-overview"
                  className="mb-0!"
                />
                <div className="mt-6">
                  <OverviewSection
                    yearEstablished={yearEstablished}
                    totalBeds={totalBeds}
                    noOfDoctors={noOfDoctors}
                    specialty={translatedSpecialty}
                  />
                </div>
              </div>

              {/* Description Card - Matching HospitalGroupClient style */}
              <div className="md:bg-white md:rounded-xl first-heading md:border border-gray-100 md:shadow-sm md:p-8" data-trans-managed="true" dir={dir}>
                {(() => {
                  if (isRicosContent) {
                    return <RicosRenderer content={ricosNodes as any} />
                  }

                  return (
                    <div
                      className={`prose custom-list space-y-2 first-heading text-base md:text-lg text-[#241d1f] leading-relaxed max-w-none ${dir === 'ltr' ? 'text-left' : ''}`}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(extractRichTextHtml(htmlContentToRender, false))
                      }}
                    />
                  )
                })()}
                {hospitalGroupSlug && (
                  <Link
                    href={`/hospital-groups/${hospitalGroupSlug}`}
                    className="border-b border-gray-600 text-gray-700 hover:text-gray-900 text-sm md:text-base transition-colors inline-block mt-4"
                    data-i18n-original={`Read about ${matchedHospitalGroup?.hospitalName || hospitalName}`}
                    data-trans-managed="true"
                  >
                    {t(`Read about ${matchedHospitalGroup?.hospitalName || hospitalName}`)}
                  </Link>
                )}
              </div>
            </div>

            {/* Right Column - Sticky Contact Form */}
            <div className="lg:col-span-1 hidden md:block">
              <div className="sticky top-24">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {validTreatments && validTreatments.length > 0 && (
        <BranchTreatments
          treatments={validTreatments}
          branchName={relatedTreatmentsTitle}
          title={`${displayName}`}
          titleI18nKey="branch.related-treatments"
        />
      )}

      {/* Doctors Section - Display doctors mapped to this branch */}
      {doctors && doctors.length > 0 && (
        <BranchDoctorsSection
          doctors={doctors}
          searchDoctors={allDoctors.length > 0 ? allDoctors : doctors}
          hospitals={hospitals}
          branchName={translatedDisplayName}
          branchId={branch?._id}
          title={`Top Doctors at ${displayName} in India`}
          titleI18nKey="branch.related-doctors"
        />
      )}

      {hospitals && hospitals.length > 0 && (
        <HospitalBranchesCarousel
          title={similarHospitalsTitle}
          titleI18nKey="branch.similar-hospitals"
          hospitals={hospitals}
          showSearch={true}
          autoplay={true}
          autoplayDelay={4000}
          filterCity={displayLocation || undefined}
          excludeBranchId={branch?._id}
          className={DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT}
        />
      )}

      <ContactModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />


      {/* Mobile Contact Section - WHITE background */}
      <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} ${DESIGN_TOKENS.SECTION_SPACING.PY} md:hidden block`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <ContactForm />
        </div>
      </section>
    </div>
  )
}

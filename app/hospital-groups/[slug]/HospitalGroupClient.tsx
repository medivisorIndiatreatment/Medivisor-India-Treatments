"use client"

import Link from "next/link"
import Image from "next/image"
import { Building2 } from "lucide-react"
import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import SectionHeading from "@/components/ui/SectionHeading"
import BreadcrumbNav from "@/components/ui/BreadcrumbNav"
import ContactModal from "@/components/ContactModal"
import ContactForm from "@/components/ContactForm"
import CtaSection from "@/components/CtaSection"
import { getWixImageUrl } from "@/lib/wixMedia"
import { generateSlug } from "@/lib/slug-utils"
import { extractRichTextHtml, getRichContentDescription, isRichTextContent } from "@/lib/cms"
import { sanitizeHtml } from "@/lib/utils/cms"
import { RicosRenderer } from "@/components/RichContentViewer"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import SearchDropdown from "@/components/ui/SearchDropdown"
import HomepageCarousel from "@/components/ui/HomepageCarousel"
import HeroSection from "@/components/ui/HeroSection"
import HospitalGroupCard from "@/components/ui/HospitalGroupCard"
import CityFilter from "@/components/ui/CityFilter"
import HospitalCard from "@/components/ui/HospitalCard"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import MarqueeHeading from "@/components/ui/MarqueeHeading"
import { useI18n, useTranslatedString, useTranslatedStrings, useTranslatedHtml, useTranslatedRicosContent, Trans } from "@/lib/i18n"

interface GroupOption {
  id: string
  name: string
}

interface HospitalGroupClientProps {
  hospital: any | null
  allHospitals: any[]
  slug: string
  isLoading?: boolean
}

interface GroupOption {
  id: string
  name: string
}

// ============================================================================
// Helper Functions
// ============================================================================

function useBranchData(hospital: any) {
  return useMemo(() => {
    const branches = hospital?.branches || []
    
    const totalBeds = branches.reduce((sum: number, b: any) =>
      sum + (b.totalBeds || b.data?.totalBeds || 0), 0)
    
    const totalDoctors = branches.reduce((sum: number, b: any) =>
      sum + (b.noOfDoctors || b.data?.noOfDoctors || 0), 0)
    
    return { branches, totalBeds, totalDoctors }
  }, [hospital])
}

function useCityData(branches: any[]) {
  return useMemo(() => {
    const cities = new Set<string>()
    branches.forEach((branch: any) => {
      const cityData = branch.city || branch.data?.city || []
      const cityName = cityData[0]?.cityName || cityData[0]?.name
      if (cityName) cities.add(cityName)
    })
    
    const sortedCities = Array.from(cities).sort()
    const delhiRelatedCities = ['Delhi', 'New Delhi', 'Noida', 'Gurgaon', 'Gurugram', 'Faridabad', 'Ghaziabad']
    const hasDelhiRelated = sortedCities.some(city =>
      delhiRelatedCities.some(d => city.toLowerCase().includes(d.toLowerCase()))
    )
    
    return hasDelhiRelated ? ['Delhi NCR', ...sortedCities] : sortedCities
  }, [branches])
}

function useFilteredBranches(branches: any[], selectedCity: string) {
  return useMemo(() => {
    if (selectedCity === "all") return branches
    
    if (selectedCity === "Delhi NCR") {
      const delhiRelatedCities = ['Delhi', 'New Delhi', 'Noida', 'Gurgaon', 'Gurugram', 'Faridabad', 'Ghaziabad']
      return branches.filter((branch: any) => {
        const cityData = branch.city || branch.data?.city || []
        const cityName = cityData[0]?.cityName || cityData[0]?.name || ''
        return delhiRelatedCities.some(d => cityName.toLowerCase().includes(d.toLowerCase()))
      })
    }
    
    return branches.filter((branch: any) => {
      const cityData = branch.city || branch.data?.city || []
      const cityName = cityData[0]?.cityName || cityData[0]?.name
      return cityName === selectedCity
    })
  }, [branches, selectedCity])
}

function useGroupOptions(allHospitals: any[], hospitalId: string) {
  return useMemo((): GroupOption[] => {
    if (!allHospitals?.length) return []
    return allHospitals
      .filter((h: any) => h.hospitalName && h._id !== hospitalId && h.isStandalone !== true)
      .map((h: any) => ({ id: h._id, name: h.hospitalName }))
      .slice(0, 20)
  }, [allHospitals, hospitalId])
}

function useSimilarGroups(allHospitals: any[], hospitalId: string) {
  return useMemo(() => {
    if (!allHospitals?.length) return []
    return allHospitals
      .filter((h: any) => h._id !== hospitalId && h.branches?.length > 0 && h.isStandalone !== true)
      .slice(0, 8)
  }, [allHospitals, hospitalId])
}

// ============================================================================
// Main Component
// ============================================================================

export default function HospitalGroupClient({
  hospital,
  allHospitals,
  slug,
}: HospitalGroupClientProps) {
  const { t } = useI18n()
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCity, setSelectedCity] = useState("all")
  const [hoveredBranchIndex, setHoveredBranchIndex] = useState<number | null>(null)
  const [hoveredGroupIndex, setHoveredGroupIndex] = useState<number | null>(null)
  const [hoveredAllHospitalIndex, setHoveredAllHospitalIndex] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

const rawDisplayName = hospital?.hospitalName || slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())

  const displayName = useTranslatedString(rawDisplayName)
  const hospitalDescription = getRichContentDescription({
    descriptionHtml: hospital?.descriptionHtml,
    about: null,
    description: hospital?.description,
fallbackMessage: t("Learn about {{name}} hospital network in India. Medivisor provides world-class healthcare at affordable costs.").replace("{{name}}", displayName)
  })

  const translatedHospitalDescription = useTranslatedHtml(hospitalDescription)

  const translatedRicosContent = useTranslatedRicosContent(hospital?.descriptionHtml)
  const resolveHeroImage = (img: any): string => {
    if (!img) return "/placeholder.svg"
    if (typeof img === 'string') {
      if (img.startsWith('http://') || img.startsWith('https://')) return img
      return getWixImageUrl(img) || "/placeholder.svg"
    }
    if (typeof img === 'object' && img !== null) {
      const url = img.url || img.src || img.image || ''
      if (typeof url === 'string' && url) {
        if (url.startsWith('http://') || url.startsWith('https://')) return url
        return getWixImageUrl(url) || "/placeholder.svg"
      }
    }
    return "/placeholder.svg"
  }
  const heroImage = resolveHeroImage(hospital?.hospitalImage)

  const { branches } = useBranchData(hospital)
  const branchCities = useCityData(branches)
  const filteredBranches = useFilteredBranches(branches, selectedCity)
  const groupSearchOptions = useGroupOptions(allHospitals, hospital?._id)
  const similarGroups = useSimilarGroups(allHospitals, hospital?._id)

  const allBranchesLabel = t("All Branches")
  const similarGroupsLabel = t("Similar Hospital Groups")
  const viewAllBranchesLabel = t("View All Branches")
  const viewBranchLabel = t("View Branch")
  const exploreNetworksLabel = t("Explore Our Hospital Networks")
  const hospitalNetworksLabel = t("Hospital Networks in India")
  const findBestNetworkLabel = t("Find the best hospital network for your treatment in India")
  const exploreOtherNetworksLabel = t("Explore other hospital networks in India")
  const searchHospitalGroupsLabel = t("Search hospital groups...")
  const branchesLabel = t("Branches")
  const bedsLabel = t("Beds")
  const similarGroupsTitle = t("Similar Hospital Groups")

  const translatableHospitalStrings = useMemo(() => {
    const strings: string[] = []
    const descriptions: string[] = []
    allHospitals.slice(0, 6).forEach((hosp: any) => {
      if (hosp.hospitalName) strings.push(hosp.hospitalName)
      if (hosp.description) {
        strings.push(hosp.description)
        descriptions.push(hosp.description)
      }
    })
    return { strings, descriptions }
  }, [allHospitals])

  const translatedHospitalStrings = useTranslatedStrings(translatableHospitalStrings.strings)
  const translatedHospitalDescriptions = useTranslatedHtml(translatableHospitalStrings.descriptions)

  const hospitalTranslationMap = useMemo(() => {
    const map = new Map<string, string>()
    translatableHospitalStrings.strings.forEach((original, i) => {
      map.set(original, translatedHospitalStrings[i] ?? original)
    })
    return map
  }, [translatableHospitalStrings.strings, translatedHospitalStrings])

  const hospitalDescriptionTranslationMap = useMemo(() => {
    const map = new Map<string, string>()
    translatableHospitalStrings.descriptions.forEach((original, i) => {
      const translated = Array.isArray(translatedHospitalDescriptions) ? translatedHospitalDescriptions[i] : translatedHospitalDescriptions
      map.set(original, translated ?? original)
    })
    return map
  }, [translatableHospitalStrings.descriptions, translatedHospitalDescriptions])

  const handleGroupSelect = useCallback((id: string) => {
    const selectedGroup = allHospitals?.find((h: any) => h._id === id)
    if (selectedGroup) {
      router.push(`/hospital-groups/${generateSlug(selectedGroup.hospitalName)}`)
    }
  }, [allHospitals, router])

  const breadcrumbItems = [
{ label: t("Hospitals"), href: "/search", i18nKey: "breadcrumb.hospitals" },
    { label: displayName, href: "#" },
  ]

  // ============================================================================
  // All Hospitals Listing (when no specific hospital)
  // ============================================================================

  if (!hospital) {
    return (
      <div className="bg-white min-h-screen">
        <HeroSection 
title={hospitalNetworksLabel}
          titleI18nKey="page.hospital-networks.title"
          subtitle={findBestNetworkLabel}
          subtitleI18nKey="page.hospital-networks.subtitle"
          image={heroImage}
        />
        <BreadcrumbNav items={breadcrumbItems} />

        <section className={DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT}>
          <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-2 md:mb-4 px-2">
              <SectionHeading 
title={exploreNetworksLabel} 
                titleI18nKey="page.hospital-networks.explore_title"
                subtitle={findBestNetworkLabel}
                subtitleI18nKey="page.hospital-networks.explore_subtitle"
                className="!mb-0" 
              />
              <div className="relative w-full md:w-[340px]">
                <SearchDropdown
                  value={searchTerm}
                  onChange={setSearchTerm}
placeholder={searchHospitalGroupsLabel}
                  placeholderI18nKey="search.hospital-groups"
                  options={groupSearchOptions}
                  onOptionSelect={handleGroupSelect}
                  onClear={() => setSearchTerm("")}
                  type="branch"
                />
              </div>
            </div>

            <div className="space-y-6">
              {allHospitals.slice(0, 6).map((hosp: any, index: number) => {
                const accreditation = hosp.accreditation || []
                const firstAccreditation = accreditation[0]
                const isStandalone = hosp.isStandalone === true
                const hospitalLink = isStandalone
                  ? `/hospital-branches/${hosp.slug || generateSlug(hosp.hospitalName)}`
                  : `/hospital-groups/${hosp.slug || generateSlug(hosp.hospitalName)}`

                return (
                  <Card key={hosp._id}
                    className="overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 rounded-md"
                    onMouseEnter={() => setHoveredAllHospitalIndex(index)}
                    onMouseLeave={() => setHoveredAllHospitalIndex(null)}
                  >
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="relative h-48 md:h-auto">
                        <ImageWithFallback
                          src={hosp.hospitalImage ? (getWixImageUrl(hosp.hospitalImage) || hosp.hospitalImage) : "/placeholder.svg"}
                          alt={hosp.hospitalName || "Hospital"}
                          fill
                          className="object-cover"
                        />
                        {firstAccreditation?.logo && (
                          <div className="absolute top-2 right-2">
                            <Image
                              src={getWixImageUrl(firstAccreditation.logo) || firstAccreditation.logo}
                              alt="Accreditation"
                              width={32}
                              height={32}
                              className="h-8 w-auto object-contain bg-white/90 rounded-md px-1 py-0.5 shadow-sm"
                            />
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2 p-4 md:p-6">
<div className="mb-2 overflow-hidden">
                           <MarqueeHeading
                             isHovered={hoveredAllHospitalIndex === index}
                             className="text-xl md:text-2xl font-medium text-[#241d1f]"
                             data-i18n-original={hosp.hospitalName}
                             data-trans-managed="true"
                           >
                             {hospitalTranslationMap.get(hosp.hospitalName || '') || hosp.hospitalName}
                           </MarqueeHeading>
                         </div>
                         <p className="text-base md:text-lg text-gray-600 mb-4 line-clamp-2" data-i18n-original={hosp.description || ''} data-trans-managed="true">
                           {hospitalDescriptionTranslationMap.get(hosp.description || '') || hosp.description}
                         </p>
                         <div className="flex flex-wrap gap-3 text-base text-gray-600 mb-4">
                           <span className="flex items-center gap-1">
                             <Building2 className="w-4 h-4 text-[#E22026]" />
                             <span data-i18n-original={`${hosp.branches?.length || 0} Branches`} data-trans-managed="true">
                               {hosp.branches?.length || 0} {branchesLabel}
                             </span>
                           </span>
                           <span className="flex items-center gap-1">
                             <Building2 className="w-4 h-4 text-[#E22026]" />
                             <span data-i18n-original={`${hosp.totalBeds || 0}+ Beds`} data-trans-managed="true">
                               {hosp.totalBeds || 0}+ {bedsLabel}
                             </span>
                           </span>
                         </div>
                         <Link
                           href={hospitalLink}
                           className="inline-block bg-[#E22026] text-white px-5 py-2.5 rounded-md font-medium hover:bg-red-700 transition-colors text-sm md:text-base"
                         >
                           <span data-i18n-original={isStandalone ? "View Branch" : "View All Branches"} data-trans-managed="true">
                             {isStandalone ? viewBranchLabel : viewAllBranchesLabel}
                           </span>
                         </Link>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {similarGroups.length > 0 && (
          <section className={DESIGN_TOKENS.BACKGROUNDS.WHITE}>
            <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
              <SectionHeading
title={similarGroupsTitle}
                titleI18nKey="hospitals.similar_groups"
                subtitle={exploreOtherNetworksLabel}
                subtitleI18nKey="hospitals.explore_other_networks"
                className="mb-6"
              />
              <HomepageCarousel autoplay>
                {similarGroups.map((group: any, index: number) => (
                  <div key={group._id} className="px-2">
                    <HospitalGroupCard 
                      group={group} 
                      isHovered={hoveredGroupIndex === index}
                      onMouseEnter={() => setHoveredGroupIndex(index)}
                      onMouseLeave={() => setHoveredGroupIndex(null)}
                    />
                  </div>
                ))}
              </HomepageCarousel>
            </div>
          </section>
        )}

        <CtaSection />
        <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    )
  }

  // ============================================================================
  // Specific Hospital Group Detail
  // ============================================================================

return (
    <div className="bg-white min-h-screen">
      <HeroSection 
        title={displayName}
        titleI18nKey="hospital-group.name"
        image={heroImage}
      />
      <BreadcrumbNav items={breadcrumbItems} />

      <section className={DESIGN_TOKENS.BACKGROUNDS.WHITE}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="lg:col-span-3">
<div className="bg-white rounded-xl p-6 md:p-8 first-heading shadow-sm border border-gray-100 md:mb-0 mb-6" data-trans-managed="true" data-i18n-html>
                {hospital?.descriptionHtml && isRichTextContent(hospital.descriptionHtml) ? (
                  <RicosRenderer content={translatedRicosContent as any} />
                ) : (
                  <div
                    className="prose custom-list space-y-2 first-heading text-base md:text-lg text-[#241d1f] leading-relaxed max-w-none"
                    dangerouslySetInnerHTML={{
__html: sanitizeHtml(extractRichTextHtml(translatedHospitalDescription as string, false))
                    }}
                  />
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {branches.length > 0 && (
        <section className={DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT}>
          <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
            <SectionHeading
title={allBranchesLabel}
              titleI18nKey="hospital-group.all-branches"
              className="mb-4"
            />

            {branchCities.length > 1 && (
              <CityFilter
                cities={branchCities}
                selectedCity={selectedCity}
                onCityChange={setSelectedCity}
              />
            )}

            <HomepageCarousel autoplay autoplayDelay={4000}>
              {filteredBranches.map((branch: any, index: number) => (
                <div key={branch._id}>
                  <HospitalCard
                    index={index}
                    hoveredIndex={hoveredBranchIndex}
                    onHover={setHoveredBranchIndex}
                    data={{
                      _id: branch._id,
                      branchName: branch.branchName,
                      hospitalName: displayName,
                      branchImage: branch.branchImage || branch.data?.branchImage,
                      image: branch.branchImage || branch.data?.branchImage,
                      logo: branch.logo,
                      accreditation: branch.accreditation,
                      specialty: branch.specialty || branch.data?.specialty || branch.specialization || branch.data?.specialization || branch.specialist || branch.data?.specialist,
                      totalBeds: branch.totalBeds || branch.data?.totalBeds,
                      noOfDoctors: branch.noOfDoctors || branch.data?.noOfDoctors,
                      yearEstablished: branch.yearEstablished || branch.data?.yearEstablished,
                      city: branch.city || branch.data?.city,
                      popular: branch.popular
                    }}
                    showStats={true}
                    showAccreditation={true}
                    showLogo={true}
                  />
                </div>
              ))}
            </HomepageCarousel>
          </div>
        </section>
      )}

      {similarGroups.length > 0 && (
        <section className={DESIGN_TOKENS.BACKGROUNDS.WHITE}>
          <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-2 md:mb-4 px-2">
<SectionHeading title={similarGroupsTitle} titleI18nKey="hospitals.similar_groups" />
              <div className="relative w-full md:w-[340px]">
                <SearchDropdown
                  value={searchTerm}
                  onChange={setSearchTerm}
placeholder={searchHospitalGroupsLabel}
                  placeholderI18nKey="search.hospital-groups"
                  options={groupSearchOptions}
                  onOptionSelect={handleGroupSelect}
                  onClear={() => setSearchTerm("")}
                  type="branch"
                />
              </div>
            </div>

            <HomepageCarousel autoplay autoplayDelay={5000}>
              {similarGroups.map((group: any, index: number) => (
                <div key={group._id || index} className="px-2">
                  <HospitalGroupCard 
                    group={group} 
                    isHovered={hoveredGroupIndex === index}
                    onMouseEnter={() => setHoveredGroupIndex(index)}
                    onMouseLeave={() => setHoveredGroupIndex(null)}
                  />
                </div>
              ))}
            </HomepageCarousel>
          </div>
        </section>
      )}

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
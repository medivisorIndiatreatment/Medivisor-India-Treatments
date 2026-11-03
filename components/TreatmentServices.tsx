"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { BriefcaseMedical, AlertCircle } from "lucide-react"
import ContactModal from "@/components/ContactModal"
import { getAllCMSData, ExtendedTreatmentData, extractRichTextHtml } from "@/lib/cms"
import { getWixImageUrl, getWixScaledToFillImageUrl } from "@/lib/wixMedia"
import Link from "next/link"
import { generateSlug } from "@/lib/cms"
import MarqueeHeading from "@/components/ui/MarqueeHeading"
import SearchDropdown from "@/components/ui/SearchDropdown"
import { useRouter } from "next/navigation"
import SectionHeading from "@/components/ui/SectionHeading"
import HomepageCarousel from "@/components/ui/HomepageCarousel"
import TreatmentDescription from "@/components/ui/TreatmentDescription"
import { DESIGN_TOKENS } from "@/components/design-tokens"

interface Service {
  _id: string
  treatmentName: string
  treatmentSlug: string
  image: string | null
  treatmentId: string
  description?: string
  cost?: string
  minPrice?: string
  duration?: string
  popular?: boolean
  priceLabel?: string
}

interface TreatmentServicesProps {
  initialTreatments?: any[]
}

/**
 * FIXED: Extracted mapping function to eliminate code duplication
 */
function mapTreatmentsToServices(treatments: ExtendedTreatmentData[]): Service[] {
  return treatments
    .map((treatment: ExtendedTreatmentData) => {
      const wixImage = treatment.treatmentImage || undefined
      let imageUrl = getWixScaledToFillImageUrl(wixImage, 800, 600)
      if (!imageUrl) {
        imageUrl = getWixImageUrl(wixImage) || treatment.treatmentImage || "/placeholder.svg"
      }

      const slug = generateSlug(treatment.name || "")
      const rawDescription = treatment.description || ""
      const formattedDescription = extractRichTextHtml(treatment.descriptionHtml, true)
      const cleanDescription = rawDescription.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()

      const priceLabel =
        treatment.cost || treatment.minPrice
          ? `INR ${treatment.cost || treatment.minPrice}`
          : ""

      return {
        _id: treatment._id,
        treatmentName: treatment.name || "Treatment",
        treatmentSlug: slug,
        image: imageUrl,
        treatmentId: treatment._id,
        description: formattedDescription || cleanDescription,
        cost: treatment.cost || undefined,
        minPrice: treatment.minPrice || undefined,
        duration: treatment.duration || undefined,
        popular: treatment.popular === true,
        priceLabel,
      }
    })
    .sort((a: Service, b: Service) => (a.treatmentName || '').localeCompare(b.treatmentName || ''))
}

export default function TreatmentServices({ initialTreatments }: TreatmentServicesProps) {
  const router = useRouter()
  const hasInitialData = initialTreatments !== undefined
  const [services, setServices] = useState<Service[]>([])
  const [allTreatments, setAllTreatments] = useState<Service[]>([])
  const [loading, setLoading] = useState(!hasInitialData)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [displayCount, setDisplayCount] = useState(6)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [searchInputValue, setSearchInputValue] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  // Debounce search term for better performance
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchInputValue), 150)
    return () => clearTimeout(timer)
  }, [searchInputValue])

  // FIXED: Single source of truth for data loading
  // Only fetch from API when no initialTreatments provided
  // Previously had double-fetch bug where initial data was ignored
  useEffect(() => {
    if (hasInitialData) {
      const mapped = mapTreatmentsToServices((initialTreatments ?? []) as ExtendedTreatmentData[])
      setServices(mapped)
      setAllTreatments(mapped)
      setLoading(false)
      return
    }

    let cancelled = false

    const loadData = async () => {
      try {
        setLoading(true)
        const { treatments } = await getAllCMSData()

        if (cancelled) return

        if (treatments?.length) {
          const mapped = mapTreatmentsToServices(treatments as ExtendedTreatmentData[])
          setAllTreatments(mapped)
          setServices(mapped)
        }
      } catch (err: any) {
        if (cancelled) return
        setError("Unable to load services data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [initialTreatments])

  // Carousel treatments - shows all treatments by default, filtered when searching, minimum 4 items
  const carouselTreatments = useMemo(() => {
    let results: Service[] = []
    const searchTermToUse = debouncedSearchTerm

    if (searchTermToUse) {
      const term = searchTermToUse.toLowerCase()
      const filtered = allTreatments.filter(treatment =>
        treatment.treatmentName?.toLowerCase().includes(term) ||
        treatment.description?.toLowerCase().includes(term)
      )

      const uniqueFilteredMap = new Map<string, typeof filtered[0]>()
      filtered.forEach(treatment => {
        if (!uniqueFilteredMap.has(treatment.treatmentName)) {
          uniqueFilteredMap.set(treatment.treatmentName, treatment)
        }
      })
      results = Array.from(uniqueFilteredMap.values())

      if (results.length < 4) {
        const popularTreatments = services.filter(t => t.popular === true)
        const uniquePopularMap = new Map<string, typeof popularTreatments[0]>()
        popularTreatments.forEach(treatment => {
          if (!uniquePopularMap.has(treatment.treatmentName)) {
            uniquePopularMap.set(treatment.treatmentName, treatment)
          }
        })
        const popularResults = Array.from(uniquePopularMap.values())

        popularResults.forEach(treatment => {
          if (results.length >= 4) return
          if (!results.find(r => r.treatmentName === treatment.treatmentName)) {
            results.push(treatment)
          }
        })

        if (results.length < 4) {
          allTreatments.forEach(treatment => {
            if (results.length >= 4) return
            if (!results.find(r => r.treatmentName === treatment.treatmentName)) {
              results.push(treatment)
            }
          })
        }
      }
    } else {
      const allUniqueMap = new Map<string, typeof allTreatments[0]>()
      allTreatments.forEach(treatment => {
        if (!allUniqueMap.has(treatment.treatmentName)) {
          allUniqueMap.set(treatment.treatmentName, treatment)
        }
      })
      results = Array.from(allUniqueMap.values())
    }

    return results.sort((a, b) => (a.treatmentName || '').localeCompare(b.treatmentName || ''))
  }, [allTreatments, services, debouncedSearchTerm])

  const searchOptions = useMemo(() =>
    allTreatments
      .map(treatment => ({
        id: treatment._id,
        name: treatment.treatmentName
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  [allTreatments])

  const handleSelect = useCallback((id: string) => {
    const treatment = allTreatments.find(t => t._id === id)
    if (treatment) {
      setSearchTerm("")
      router.push(`/treatment/${treatment.treatmentSlug}`)
    }
  }, [allTreatments, router])

  if (loading) {
    return (
      <section className="bg-gray-50 py-10 md:py-16">
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-2 md:mb-4 px-2">
            <div className="h-8 w-56 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-11 w-full md:w-[340px] bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <div className="relative h-48 md:h-52 bg-gray-100 animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse"></div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="h-6 w-3/4 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-4 w-4/6 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (services.length === 0 && !error) {
    return (
      <section className="bg-gray-50 py-10 md:py-16">
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <BriefcaseMedical className="h-10 w-10 text-gray-400" />
            </div>
            <SectionHeading title="Available Treatments" align="center" />
            <p className="text-gray-500 mt-4">No treatments available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="bg-gray-50 py-10 md:py-16">
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-2 md:mb-4 px-2">
            <SectionHeading title="Available Treatments" className="!mb-0" />
            <div className="relative w-full md:w-[340px]">
              <SearchDropdown
                value={searchInputValue}
                onChange={setSearchInputValue}
                placeholder="Search Treatments"
                options={searchOptions}
                onOptionSelect={handleSelect}
                onClear={() => { setSearchInputValue(""); setSearchTerm(""); }}
                type="treatment"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 mb-6 text-sm text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <HomepageCarousel autoplay>
            {carouselTreatments.map((service, index) => (
              <div key={service._id || index}>
                <Link
                  href={`/treatment/${service.treatmentSlug}`}
                  className="group bg-white border border-gray-200 rounded-md overflow-hidden flex flex-col h-full min-h-[300px] hover:shadow-lg hover:border-gray-300 transition-all duration-300 cursor-pointer block"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Image Section - FIXED: proper width/height, no layout shift */}
                  <div className="relative w-full h-48 md:h-52 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.treatmentName || 'Treatment'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading={index < 6 ? "eager" : "lazy"}
                        decoding={index < 6 ? "sync" : "async"}
                        width={400}
                        height={300}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          if (!target.dataset.fallbackAttempted) {
                            target.dataset.fallbackAttempted = "true"
                            target.src = "/placeholder.svg"
                          }
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M14 4h.01" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4 md:p-5 flex flex-col flex-1">
                    <div className="mb-2 overflow-hidden">
                      <MarqueeHeading
                        isHovered={hoveredIndex === index}
                        className="text-lg md:text-xl font-semibold text-[#241d1f] leading-tight tracking-tight group-hover:text-[#E22026] transition-colors"
                      >
                        {service.treatmentName}
                      </MarqueeHeading>
                    </div>
                    {service.priceLabel && (
                      <div className="text-base font-semibold text-[#23366E] mb-1">
                        {service.priceLabel}
                      </div>
                    )}
                    {service.description && (
                      <TreatmentDescription
                        className="text-base md:text-base text-gray-900 line-clamp-3 leading-relaxed"
                        htmlContent={service.description}
                        maxLines={3}
                      />
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </HomepageCarousel>
        </div>
      </section>

      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

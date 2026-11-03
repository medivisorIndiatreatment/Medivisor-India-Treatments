// components/TechnologiesServices.tsx
// Homepage Technologies section with carousel.
// Receives server-prepared cards so no client-side data transformation is needed.

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Image from "next/image"
import MarqueeHeading from "@/components/ui/MarqueeHeading"
import SectionHeading from "@/components/ui/SectionHeading"
import HomepageCarousel from "@/components/ui/HomepageCarousel"
import TreatmentDescription from "@/components/ui/TreatmentDescription"
import { DESIGN_TOKENS, SECTION_INDEX, getAlternatingBackground } from "@/components/design-tokens"
import { useTranslatedStrings } from "@/lib/i18n"
import type { TechnologyCard } from "@/lib/services/homepage/prepare"

interface TechnologiesServicesProps {
  initialTechnologies?: TechnologyCard[]
}

export default function TechnologiesServices({ initialTechnologies }: TechnologiesServicesProps) {
  // Data is prepared on the server; no client-side transformation or artificial loading.
  const [technologies, setTechnologies] = useState<TechnologyCard[]>(initialTechnologies ?? [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchInputValue, setSearchInputValue] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const translatableStrings = useMemo(() => {
    const strings: string[] = ["Advanced World-Class Technologies in India"]
    const seen = new Set<string>(["Advanced World-Class Technologies in India"])
    for (const tech of technologies) {
      if (tech.heading && !seen.has(tech.heading)) {
        seen.add(tech.heading)
        strings.push(tech.heading)
      }
    }
    return strings
  }, [technologies])

  const translatedStrings = useTranslatedStrings(translatableStrings)

  const contentTranslationMap = useMemo(() => {
    const map = new Map<string, string>()
    translatableStrings.forEach((original, i) => {
      map.set(original, translatedStrings[i] ?? original)
    })
    return map
  }, [translatableStrings, translatedStrings])

  const t = useCallback((text: string): string => {
    if (!text) return text
    return contentTranslationMap.get(text) || text
  }, [contentTranslationMap])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInputValue)
    }, 150)
    return () => clearTimeout(timer)
  }, [searchInputValue])

  // Filter technologies based on search
  const carouselTechnologies = useMemo(() => {
    let results: TechnologyCard[] = []

    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase()
      results = technologies.filter(tech =>
        tech.heading?.toLowerCase().includes(term) ||
        tech.description?.toLowerCase().includes(term)
      )
    } else {
results = [...technologies]
    }

    return results.slice(0, 12)
  }, [technologies, debouncedSearchTerm])

  const handleSelect = useCallback((id: string) => {
    const tech = technologies.find(t => t._id === id)
    if (tech) {
      setSearchInputValue("")
      window.location.href = `/technology/${tech.slug}`
    }
  }, [technologies])

  if (technologies.length === 0) {
    return null
  }

  return (
    <section className={`${getAlternatingBackground(SECTION_INDEX.TECHNOLOGIES)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-6 md:px-0">
          <SectionHeading
            title="Advanced World-Class Technologies in India"
            titleI18nKey="technologies.section-title"
            className="!mb-0"
          />
        </div>

        <div>
          <HomepageCarousel autoplay>
            {carouselTechnologies.map((tech, index) => (
              <div key={tech._id || index}>
                <a
                  href={`/technology/${tech.slug}`}
                  className={`group bg-white border border-gray-200 ${DESIGN_TOKENS.BORDER_RADIUS.MD} overflow-hidden flex flex-col h-full min-h-[280px] md:min-h-[320px] hover:shadow-lg hover:border-gray-300 ${DESIGN_TOKENS.TRANSITIONS.BASE} cursor-pointer block`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-50">
<Image
                       src={tech.image}
                       alt={t(tech.heading)}
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading={index < 6 ? "eager" : "lazy"}
                      width={400}
                      height={320}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        if (!target.dataset.fallbackAttempted) {
                          target.dataset.fallbackAttempted = "true"
                          target.src = "/placeholder.svg"
                        }
                      }}
                    />
                  </div>

                  <div className="p-4 md:p-5 flex flex-col flex-1">
<h3 className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_TITLE} mb-2 transition-colors`} data-i18n-original={tech.heading} data-trans-managed="true">
                       <MarqueeHeading isHovered={hoveredIndex === index} className="w-full">
                         {t(tech.heading)}
                       </MarqueeHeading>
                     </h3>

                      {tech.description && (
                      <div className="mt-auto">
                        <TreatmentDescription htmlContent={tech.description} maxLines={3} />
                      </div>
                    )}
                  </div>
                </a>
              </div>
            ))}
          </HomepageCarousel>
        </div>
      </div>
    </section>
  )
}

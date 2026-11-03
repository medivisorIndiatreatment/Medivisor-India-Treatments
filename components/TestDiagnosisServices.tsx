// components/TestDiagnosisServices.tsx
// Homepage Test & Diagnosis section with carousel.
// Receives server-prepared cards so no client-side data transformation is needed.

"use client"

import { useState, useMemo, useCallback } from "react"
import Image from "next/image"
import MarqueeHeading from "@/components/ui/MarqueeHeading"
import SectionHeading from "@/components/ui/SectionHeading"
import HomepageCarousel from "@/components/ui/HomepageCarousel"
import TreatmentDescription from "@/components/ui/TreatmentDescription"
import { DESIGN_TOKENS, SECTION_INDEX, getAlternatingBackground } from "@/components/design-tokens"
import { useTranslatedStrings } from "@/lib/i18n"
import type { TestDiagnosisCard } from "@/lib/services/homepage/prepare"

interface TestDiagnosisServicesProps {
  initialTestDiagnoses?: TestDiagnosisCard[]
}

export default function TestDiagnosisServices({ initialTestDiagnoses }: TestDiagnosisServicesProps) {
  const [testDiagnoses, setTestDiagnoses] = useState<TestDiagnosisCard[]>(initialTestDiagnoses ?? [])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const translatableStrings = useMemo(() => {
    const strings: string[] = ["Tests & Diagnoses in India"]
    const seen = new Set<string>(["Tests & Diagnoses in India"])
    for (const td of testDiagnoses) {
      if (td.name && !seen.has(td.name)) {
        seen.add(td.name)
        strings.push(td.name)
      }
    }
    return strings
  }, [testDiagnoses])

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

  if (testDiagnoses.length === 0) {
    return null
  }

  return (
    <section className={`${getAlternatingBackground(SECTION_INDEX.TEST_DIAGNOSIS)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-6 md:px-0">
          <SectionHeading
            title="Tests & Diagnoses in India"
            titleI18nKey="test-diagnosis.section-title"
            className="!mb-0"
          />
        </div>

        <div>
          <HomepageCarousel autoplay>
            {testDiagnoses.map((td, index) => (
              <div key={td._id || index}>
                <a
                  href={`/test-diagnosis/${td.slug}`}
                  className={`group bg-white border border-gray-200 ${DESIGN_TOKENS.BORDER_RADIUS.MD} overflow-hidden flex flex-col h-full min-h-[280px] md:min-h-[320px] hover:shadow-lg hover:border-gray-300 ${DESIGN_TOKENS.TRANSITIONS.BASE} cursor-pointer block`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-50">
                    <Image
                      src={td.testDiagnosisImage}
                      alt={t(td.name || td.slug)}
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
                      <h3 className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_TITLE} mb-2 transition-colors`} data-i18n-original={td.name} data-trans-managed="true">
                        <MarqueeHeading isHovered={hoveredIndex === index} className="w-full">
                          {t(td.name || td.slug)}
                        </MarqueeHeading>
                      </h3>

                    {td.description && (
                      <div className="mt-auto">
                        <TreatmentDescription htmlContent={td.description} maxLines={3} />
                      </div>
                    )}

                    {td.startingCost && Number(td.startingCost) > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-[#241d1f] flex items-center">
                          <span className="mr-1">₹</span>
                          <span className="truncate" data-i18n-original={`From ${td.startingCost}`} data-trans-managed="true">
                            From {td.startingCost}
                          </span>
                        </p>
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

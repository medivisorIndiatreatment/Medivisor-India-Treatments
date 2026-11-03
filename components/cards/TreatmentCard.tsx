"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useMemo, useCallback } from "react"
import MarqueeHeading from "@/components/ui/MarqueeHeading"
import TreatmentDescription from "@/components/ui/TreatmentDescription"
import { getCardImageUrl } from "@/lib/utils/card-utils"
import { generateSlug } from "@/lib/slug-utils"
import { useTranslatedStrings } from "@/lib/i18n"
import { getValue } from "@/lib/cms"
import type { TreatmentCardData } from "./types"
import { DESIGN_TOKENS } from "../design-tokens"

interface TreatmentCardProps {
  treatment: TreatmentCardData
  index?: number
  hoveredIndex?: number | null
  onHover?: (index: number | null) => void
  showDescription?: boolean  // default false
  showCost?: boolean          // default false
  showCategory?: boolean      // default true
  showSpecialist?: boolean    // default false
  showDepartment?: boolean    // default false
  showDuration?: boolean      // default false
  href?: string
  hoverTextColor?: boolean    // default false
}

export default function TreatmentCard({
  treatment,
  index = 0,
  hoveredIndex,
  onHover,
  showDescription = false,
  showCost = false,
  showCategory = true,
  showSpecialist = false,
  showDepartment = false,
  showDuration = false,
  href,
  hoverTextColor = false,
}: TreatmentCardProps) {
  const [imageError, setImageError] = useState(false)
  const isHovered = hoveredIndex === index

  // FIXED: Memoized image URL computation with proper fallback chain
  const imageUrl = useMemo(() => {
    if (imageError) return null
    const rawImage = treatment.treatmentImage || treatment.image || ""
    if (!rawImage) return null
    const result = getCardImageUrl(rawImage, 400, 300)
    return result
  }, [treatment.treatmentImage, treatment.image, imageError])

  const slug = useMemo(() => {
    const raw = treatment.slug || getValue(treatment, "name", "treatmentName", "title") || ""
    const str = typeof raw === 'string' ? raw : (typeof raw === 'object' && raw !== null ? '' : String(raw))
    if (!str || str === "[object Object]") return treatment._id || ""
    return generateSlug(str) || treatment._id || ""
  }, [treatment.slug, treatment.name, treatment._id])

  const displayName = getValue(treatment, "name", "treatmentName", "title") || "Treatment"

  const translatableStrings = useMemo(() => {
    const strings: string[] = [displayName]
    if (treatment.specialistName) strings.push(treatment.specialistName)
    if (treatment.department) strings.push(treatment.department)
    if (treatment.duration) strings.push(treatment.duration)
    if (treatment.cost) strings.push(`From ${treatment.cost}`)
    if (treatment.category) strings.push(treatment.category)
    return Array.from(new Set(strings))
  }, [displayName, treatment.specialistName, treatment.department, treatment.duration, treatment.cost, treatment.category])

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

  return (
    <Link
      href={href || `/treatment/${slug}`}
      className="group bg-white rounded-md shadow-xs w-full overflow-hidden border border-gray-100 block h-full transition-all duration-300 hover:shadow-md flex flex-col"
      onMouseEnter={() => onHover?.(index)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Image Section - FIXED: proper width/height, no layout shift */}
      <div className="relative h-44 sm:h-52 w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {imageUrl ? (
          <Image
            src={imageUrl}
alt={t(displayName)}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading={index < 6 ? "eager" : "lazy"}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
          </div>
        )}
        {/* Dark gradient overlay for image contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Category Badge */}
        {showCategory && treatment.category && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm z-10">
{t(treatment.category)}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1 min-h-[100px]">
        {/* Treatment Name */}
<div className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_TITLE} mb-2 transition-colors`} data-i18n-original={displayName} data-trans-managed="true">
          <MarqueeHeading
            isHovered={isHovered}
            className={`font-medium text-[#241d1f] leading-tight`}
          >
{t(displayName)}
          </MarqueeHeading>
        </div>

        {/* Specialist Name (optional) */}
        {/* {showSpecialist && treatment.specialistName && (
          <div className="flex items-center gap-1.5 mb-2 text-sm text-[#241d1f]">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
<span data-i18n-original={treatment.specialistName} data-trans-managed="true">{t(treatment.specialistName)}</span>
          </div>
        )} */}

        {/* Department (optional) */}
        {showDepartment && treatment.department && (
          <div className="flex items-center gap-1.5 mb-2 text-sm text-[#241d1f]">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21.75l1.5-1.5m0 0l1.5-1.5m-1.5 1.5l-1.5-1.5m1.5 1.5l1.5-1.5m-1.5-1.5l-1.5 1.5" />
            </svg>
<span data-i18n-original={treatment.department} data-trans-managed="true">{t(treatment.department)}</span>
          </div>
        )}

        {/* Description (optional) */}
        {showDescription && treatment.description && (
          <TreatmentDescription
        className={DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}
            htmlContent={treatment.description}
            maxLines={3}
          />
        )}

        {/* Duration (optional) */}
        {showDuration && treatment.duration && (
          <div className="mt-auto pt-2">
            <p className="text-sm font-medium text-[#241d1f]">
              <span className="mr-1">⏱</span>
<span data-i18n-original={treatment.duration} data-trans-managed="true">{t(treatment.duration)}</span>
            </p>
          </div>
        )}

        
        {showCost && treatment.cost && (
          <div className="mt-auto pt-2">
            <p className="text-base font-medium text-[#241d1f] flex items-center">
              <span className="mr-1"> Starting Cost: $</span>
<span className="truncate" data-i18n-original={`From ${treatment.cost}`} data-trans-managed="true"> {t(`${treatment.cost}`)}</span>
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}
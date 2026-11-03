/**
 * TreatmentCard Component
 * Displays treatment information in a search result card
 * Uses shared utilities from @/lib/utils/card-utils for consistent behavior
 */

"use client"

import { memo } from "react"
import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { DollarSign } from "lucide-react"
import MarqueeHeading from "@/components/ui/MarqueeHeading"
import { getCardImageUrl, getCardTreatmentSlug } from "@/lib/utils/card-utils"

export interface TreatmentCardData {
  _id: string
  name?: string
  description?: string
  category?: string
  treatmentImage?: string
  image?: string
  cost?: string
  duration?: string
}

interface TreatmentCardProps {
  treatment: TreatmentCardData
}

function TreatmentCardComponent({ treatment }: TreatmentCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const name = useMemo(
    () => treatment.name || "Treatment",
    [treatment.name]
  )

  const imageUrl = useMemo(
    () => getCardImageUrl(treatment.treatmentImage || treatment.image, 400, 300),
    [treatment.treatmentImage, treatment.image]
  )

  const slug = useMemo(
    () => getCardTreatmentSlug(name),
    [name]
  )

  return (
    <Link
      href={`/treatment/${slug}`}
      className="group bg-white rounded-md shadow-xs w-full overflow-hidden border border-gray-100 block h-full transition-all duration-300 hover:shadow-md flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-44 sm:h-52 w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {treatment.category && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">
            {treatment.category}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col min-h-[48px]">
        <div className="mb-2">
          <MarqueeHeading
            isHovered={isHovered}
            className="font-medium text-gray-900 leading-tight line-clamp-1"
          >
            {name}
          </MarqueeHeading>
        </div>

        {/* <div className="mt-auto space-y-1.5">
          {treatment.cost ? (
            <p className="text-sm text-gray-900 flex items-center line-clamp-1">
              <DollarSign className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="truncate">From {treatment.cost}</span>
            </p>
          ) : (
            <div className="h-[20px]" />
          )}
        </div> */}
  </div>
</Link>
  )
}

export const TreatmentCard = memo(TreatmentCardComponent)
export default TreatmentCard

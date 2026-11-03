"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Building2 } from "lucide-react"
import { getWixImageUrl } from "@/lib/wixMedia"
import { generateSlug } from "@/lib/slug-utils"
import MarqueeHeading from "@/components/ui/MarqueeHeading"
import { Trans } from "@/lib/i18n/Trans"
import { useI18n, useTranslatedString } from "@/lib/i18n"

interface HospitalGroupCardProps {
  group: {
    _id: string
    hospitalName?: string
    hospitalImage?: string
    branches?: any[]
    accreditation?: any[]
  }
  isHovered: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function HospitalGroupCard({ group, isHovered, onMouseEnter, onMouseLeave }: HospitalGroupCardProps) {
  const { t } = useI18n()
  const rawName = group.hospitalName || t("Hospital Group")
  const imageUrl = group.hospitalImage ? (getWixImageUrl(group.hospitalImage) || group.hospitalImage) : null
  const branchCount = group.branches?.length || 0
  const [imageError, setImageError] = useState(false)
  const [accreditationError, setAccreditationError] = useState(false)

  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  const handleAccreditationError = useCallback(() => {
    setAccreditationError(true)
  }, [])

  const accreditation = group.accreditation || []
  const firstAccreditation = accreditation[0]

  return (
    <Link
href={`/hospital-groups/${generateSlug(rawName)}`}
      className="block group bg-white border border-gray-100 rounded-md overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col h-full min-h-[280px] md:min-h-[300px]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-50">
          {imageUrl && !imageError ? (
              <Image
                src={imageUrl}
                alt={rawName}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                data-i18n-original={group.hospitalName}
                onError={handleImageError}
              />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          )}
         {firstAccreditation?.logo && (
           <div className="absolute top-2 right-2">
             {!accreditationError ? (
               <Image
                 src={getWixImageUrl(firstAccreditation.logo) || firstAccreditation.logo}
                 alt="Accreditation"
                 width={32}
                 height={32}
                 className="h-8 w-auto object-contain bg-white/90 rounded-md px-1 py-0.5 shadow-sm"
                 onError={handleAccreditationError}
               />
             ) : (
               <div className="w-8 h-8 flex items-center justify-center bg-white/90 rounded-md">
                 <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h.75" />
                 </svg>
               </div>
             )}
           </div>
         )}
       </div>
      <div className="p-3 md:p-4 flex flex-col bg-gray-50 flex-1">
<div className="mb-2 overflow-hidden">
           <MarqueeHeading
             isHovered={isHovered}
             className="font-medium text-xl text-[#241d1f] leading-tight"
             data-i18n-original={group.hospitalName}
             data-trans-managed="true"
           >
             {rawName}
           </MarqueeHeading>
         </div>
        <p className="text-base text-[#241d1f] flex items-center mt-2" data-i18n-original={`${branchCount} Branches`} data-trans-managed="true">
          <Building2 className="w-3.5 h-3.5 mr-1.5 text-gray-900 flex-shrink-0" />
          {branchCount} {t("Branches")}
        </p>
      </div>
    </Link>
  )
}

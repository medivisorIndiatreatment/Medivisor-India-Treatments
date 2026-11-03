"use client";

import { memo } from "react";
import Link from "next/link";
import { MapPin, ShieldPlus } from "lucide-react";
import { generateSlug, generateBranchSlug } from "@/lib/slug-utils";
import { useMemo, useCallback } from "react";
import MarqueeHeading from "@/components/ui/MarqueeHeading";
import {
  getCardImageUrl,
  getCardLogoUrl,
  getAccreditationUrl,
  getCardCityWithState,
  getCardSpecialty,
  formatNumberValue,
} from "@/lib/utils/card-utils";
import { DESIGN_TOKENS } from "../design-tokens";
import { Trans } from "@/lib/i18n/Trans";
import { useI18n, useTranslatedStrings } from "@/lib/i18n";

export interface HospitalCardData {
   _id: string
   branchName?: string
   hospitalName?: string
   address?: string
   city?: { cityName: string; state?: string }[] | string
   specialization?: { name: string }[] | string
   specialist?: { name: string }[] | string
   specialty?: { name: string }[] | string
   specialities?: { name: string }[] | string
   data?: {
     specialization?: { name: string }[] | string
     specialist?: { name: string }[] | string
     specialty?: { name: string }[] | string
     specialities?: { name: string }[] | string
   }
   totalBeds?: string | number
   noOfDoctors?: string | number
   yearEstablished?: string | number
   branchImage?: string
   image?: string
   logo?: string
   accreditation?: { _id: string; image?: string; title?: string; logo?: string }[]
    popular?: boolean
    hospitalSlug?: string
    href?: string
  }


interface HospitalCardProps {
  data: HospitalCardData;
  showStats?: boolean;
    index?: number
  hoveredIndex?: number | null
  onHover?: (index: number | null) => void
  showAccreditation?: boolean;
  showLogo?: boolean;
}

function HospitalCardComponent({
  data,
  showStats = true,
  index = 0,
   onHover,
  hoveredIndex,
  showAccreditation = true,
  showLogo = true,
}: HospitalCardProps) {
   const isHovered = hoveredIndex === index
   const { t } = useI18n()

  // Determine image URL; getAll CMS data feeds user requests
  // and forces the code flow (or plays) with dynamic code branching.
  //
  const imageUrl = useMemo(() => {
    const imageSrc = data.branchImage || data.image;
    if (!imageSrc) return null;
    return getCardImageUrl(imageSrc, 400, 300);
  }, [data.branchImage, data.image]);

  const logoUrl = useMemo(() => {
    return data.logo ? getCardLogoUrl(data.logo) : null;
  }, [data.logo]);

  const accreditationUrl = useMemo(() => {
    return data.accreditation && data.accreditation.length > 0
      ? getAccreditationUrl(data.accreditation)
      : null;
  }, [data.accreditation]);

  const branchDisplayName = useMemo(() => {
return data.branchName || data.hospitalName || t("Hospital")
  }, [data.branchName, data.hospitalName, t])

  const hospitalDisplayName = useMemo(() => {
    return data.hospitalName;
  }, [data.hospitalName]);

const specialty = useMemo(() => {
    const specializationData =
      (data.specialty && data.specialty.length > 0
        ? data.specialty
        : data.specialization && data.specialization.length > 0
        ? data.specialization
        : data.specialist && data.specialist.length > 0
        ? data.specialist
        : data.specialities) ||
      (data.data?.specialty && data.data.specialty.length > 0
        ? data.data.specialty
        : data.data?.specialization && data.data.specialization.length > 0
        ? data.data.specialization
        : data.data?.specialist && data.data.specialist.length > 0
        ? data.data.specialist
        : data.data?.specialities) ||
      [];
    return getCardSpecialty(specializationData);
  }, [
    data.specialty,
    data.specialization,
    data.specialist,
    data.specialities,
    data.data,
  ]);

  const cityNameState = useMemo(() => {
    return getCardCityWithState(data.city);
  }, [data.city]);

  const branchCity = useMemo(() => {
    if (data.city && Array.isArray(data.city)) {
      return data.city[0]?.cityName || "";
    }
    return "";
  }, [data.city]);

  const slug = useMemo(() => {
    if (data.hospitalSlug) return data.hospitalSlug
    return generateBranchSlug(branchDisplayName, branchCity);
  }, [branchDisplayName, branchCity, data.hospitalSlug]);

  const cardHref = useMemo(() => {
    if (data.href) return data.href
    return `/hospital-branches/${slug}`
  }, [data.href, slug]);

  const displayBeds = useMemo(() => {
    return formatNumberValue(data.totalBeds);
  }, [data.totalBeds]);

  const displayDoctors = useMemo(() => {
    return formatNumberValue(data.noOfDoctors);
  }, [data.noOfDoctors]);

  const displayYearEstablished = useMemo(() => {
    return formatNumberValue(data.yearEstablished);
  }, [data.yearEstablished]);

  const translatableStrings = useMemo(() => {
    const strings: string[] = []
    if (branchDisplayName) strings.push(branchDisplayName)
    if (specialty) strings.push(`${specialty} Specialty`)
    if (cityNameState) strings.push(cityNameState)
    return Array.from(new Set(strings))
  }, [branchDisplayName, specialty, cityNameState])

  const translatedStrings = useTranslatedStrings(translatableStrings)

  const translationMap = useMemo(() => {
    const map = new Map<string, string>()
    translatableStrings.forEach((original, i) => {
      map.set(original, translatedStrings[i] ?? original)
    })
    return map
  }, [translatableStrings, translatedStrings])

  const translate = useCallback((text: string): string => {
    if (!text) return text
    return translationMap.get(text) || text
  }, [translationMap])

  return (
    <Link
      href={cardHref}
      className="group bg-gray-50 border border-gray-100 rounded-md overflow-hidden flex flex-col h-full min-h-[280px] md:min-h-[300px] transition-all duration-300 hover:shadow-xl hover:border-gray-200"
      onMouseEnter={() => onHover?.(index)}
      onMouseLeave={() => onHover?.(null)}
      suppressHydrationWarning
    >
       {/* Image Section - native img: src is deterministic across server/client, */}
       {/* avoiding next/image hydration mismatch for external CDN URLs */}
       <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-50">
         {imageUrl ? (
          <img
            src={imageUrl}
alt={translate(branchDisplayName)}
            width={400}
            height={320}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (!target.dataset.fallbackAttempted) {
                target.dataset.fallbackAttempted = "true"
                target.src = "/placeholder.svg"
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 md:p-4 flex flex-col bg-white flex-1">
<div className="mb-2" data-i18n-original={branchDisplayName} data-trans-managed="true">
          <MarqueeHeading
            isHovered={isHovered}
            className={DESIGN_TOKENS.TYPOGRAPHY.CARD_TITLE}
          >
{translate(branchDisplayName)}
          </MarqueeHeading>
      </div>
          {specialty && (
            <p className={`flex items-center mb-1  ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}`} >
             <ShieldPlus className="w-4 h-4 mr-1 text-[#29A9B9] flex-shrink-0" />
             <span className={DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} data-i18n-original={specialty.toLowerCase().endsWith('specialty') ? specialty : `${specialty} Specialty`} data-trans-managed="true">
                {translate(specialty.toLowerCase().endsWith('specialty') ? specialty : `${specialty} Specialty`)}
             </span>
           </p>
            
           )}
         {cityNameState && (
           <p className={`flex items-center mb-1  ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}`} >
             <MapPin className="w-4 h-4 mr-1 text-[#29A9B9] flex-shrink-0" />
              <span className="truncate" data-i18n-original={cityNameState || "Location not available"} data-trans-managed="true">
                {cityNameState ? t(cityNameState) : <Trans id="hospital.location-unavailable">Location not available</Trans>}
              </span>
           </p>
         )}
        {/* Stats Footer */}
        
        {showStats && (
          <footer className="border-t border-gray-100 pt-2.5 md:pt-2 mt-auto">
            <div className="grid grid-cols-3 gap-1.5">
              {data.yearEstablished && (
                <div className="text-center rounded-xs bg-gray-50 p-1.5 md:p-2 border border-gray-100">
<p className={DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} data-i18n-original={String(displayYearEstablished)} data-trans-managed="true">
                     {displayYearEstablished}
                   </p>
                  <p className={DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} data-i18n="hospital.estd" data-i18n-original="Estd.">
                    <Trans id="hospital.estd">Estd.</Trans>
                  </p>
                </div>
              )}
              {data.totalBeds && (
                <div className="text-center rounded-xs bg-gray-50 p-1.5 md:p-2 border border-gray-100">
<p className={DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} data-i18n-original={`${displayBeds}+`} data-trans-managed="true">
                     {displayBeds}+
                   </p>
                  <p className={DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} data-i18n="hospital.beds" data-i18n-original="Beds">
                    <Trans id="hospital.beds">Beds</Trans>
                  </p>
                </div>
              )}
              {data.noOfDoctors && (
                <div className="text-center rounded-xs bg-gray-50 p-1.5 md:p-2 border border-gray-100">
<p className={DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} data-i18n-original={`${displayDoctors}+`} data-trans-managed="true">
                     {displayDoctors}+
                   </p>
                  <p className={DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} data-i18n="hospital.doctors" data-i18n-original="Doctors">
                    <Trans id="hospital.doctors">Doctors</Trans>
                  </p>
                </div>
              )}
            </div>
          </footer>
        )}
      </div>
    </Link>
  );
}

export const HospitalCard = memo(HospitalCardComponent)
export default HospitalCard

"use client"

/**
 * Unified DoctorCard Component
 * Displays doctor information with consistent styling across the application
 * Full card is clickable as a Link to the doctor detail page
 */

import Link from "next/link";
import Image from "next/image";
import { useMemo, memo } from "react";
import { MapPin, Stethoscope, Building2 } from "lucide-react";
import MarqueeHeading from "@/components/ui/MarqueeHeading";
import { getCardImageUrl, getDoctorBranchName } from "@/lib/utils/card-utils";
import { generateSlug } from "@/lib/slug-utils";
import { stripHtmlTags } from "@/lib/cms";
import type { DoctorCardData } from "@/components/cards/types";
import { DESIGN_TOKENS } from "../design-tokens";
import { Button } from "../ui";
import { Trans } from "@/lib/i18n/Trans";
import { useTranslatedString, useTranslatedStrings } from "@/lib/i18n";

interface DoctorCardProps {
  doctor: DoctorCardData;
  index?: number;
  hoveredIndex?: number | null;
  onHover?: (index: number | null) => void;
  showHospital?: boolean;
  showAdditionalBranches?: boolean;
}

function DoctorCard({
  doctor,
  index = 0,
  hoveredIndex,
  onHover,
  showHospital = true,
  showAdditionalBranches = false,
}: DoctorCardProps) {
  const isHovered = hoveredIndex === index;

  // FIXED: Properly compute image URL with fallback chain
  const imageUrl = useMemo(() => {
    const url = doctor.profileImageUrl || doctor.profileImage;
    if (!url) return null;
    return getCardImageUrl(url, 400, 300);
  }, [doctor.profileImageUrl, doctor.profileImage]);

const getAllSpecs = useMemo(() => {
    if (!doctor.specialization) return "";
    if (typeof doctor.specialization === "string") return doctor.specialization;
    if (
      Array.isArray(doctor.specialization) &&
      doctor.specialization.length > 0
    ) {
      return doctor.specialization
        .map((s) => typeof s === "string" ? s : (s && typeof s.name === "string" ? s.name : ""))
        .filter(Boolean)
        .join(", ");
    }
    return "";
  }, [doctor.specialization]);

const displayBranch = useMemo(() => {
    const rawBranchName = getDoctorBranchName(doctor) || null
    const cityStr = typeof doctor.city === 'string'
      ? doctor.city
      : Array.isArray(doctor.city)
        ? (doctor.city.find((c: any) => c?.cityName || c?.name)?.cityName || doctor.city.find((c: any) => c?.name)?.name || '')
        : ''
    const formattedName = rawBranchName
      ? (cityStr && !rawBranchName.toLowerCase().includes(cityStr.toLowerCase())
          ? `${rawBranchName}, ${cityStr}`
          : rawBranchName)
      : null
    return formattedName || 'Location not available'
  }, [doctor])

  const additionalBranchNames = useMemo(() => {
    if (showAdditionalBranches && doctor.branchInfo && doctor.branchInfo.length > 1) {
      return doctor.branchInfo.slice(1, 4).map(b => b.branchName).filter(Boolean)
    }
    return []
  }, [showAdditionalBranches, doctor.branchInfo])

  const translatedSpecs = useTranslatedString(getAllSpecs || stripHtmlTags(doctor.designation || doctor.qualification || "") || 'Specialty not available')
  const translatedBranch = useTranslatedString(displayBranch)
  const translatedAdditionalBranches = useTranslatedStrings(additionalBranchNames)
  const doctorSlug = useMemo(() => {
    return (
      doctor.slug ||
      doctor.doctorSlug ||
      generateSlug(doctor.doctorName || doctor.name || "")
    );
  }, [doctor.slug, doctor.doctorSlug, doctor.doctorName, doctor.name]);

  const href = `/doctors/${doctorSlug}`;

  return (
    <Link
      href={href}
      className="group block bg-gray-50 border border-gray-200 rounded-lg shadow-sm h-full w-full overflow-hidden flex flex-col hover:shadow-lg hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#E22026]/20"
      onMouseEnter={() => onHover?.(index)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="flex flex-col h-full">
        {/* Doctor Image Section */}
        <div className="relative w-full h-44 md:h-52 overflow-hidden bg-gray-100">
          {imageUrl ? (
             <Image
               src={imageUrl}
               alt={doctor.doctorName || doctor.name || "Doctor"}
               fill
               sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
               className="object-cover transition-transform duration-500 group-hover:scale-105"
               loading={index < 6 ? "eager" : "lazy"}
               onError={(e) => {
                 const target = e.target as HTMLImageElement;
                 if (!target.dataset.fallbackAttempted) {
                   target.dataset.fallbackAttempted = "true";
                   target.src = "/placeholder.svg";
                 }
               }}
             />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 md:px-5 pt-5 pb-1 flex flex-col space-y-1.5">
          <div className="overflow-hidden">
            <MarqueeHeading
              isHovered={isHovered}
              className={`line-clamp-1 ${DESIGN_TOKENS.TYPOGRAPHY.CARD_TITLE}`}
            >
<Trans id="doctor-card.name">{doctor.doctorName || doctor.name || "Doctor"}</Trans>
            </MarqueeHeading>
          </div>

          <div className={`flex items-center gap-2 ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}`}>
            <Stethoscope className="w-4 h-4 text-[#29A9B9] flex-shrink-0" />
            <span className="block truncate">
              {translatedSpecs}
            </span>
          </div>

          <div className="space-y-1">
            <div className={`flex items-start gap-2 ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}`}>
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#29A9B9] mt-0.5" />
              <span className="line-clamp-1 font-normal leading-snug">
                {translatedBranch}
              </span>
            </div>
            {showAdditionalBranches && doctor.branchInfo && doctor.branchInfo.length > 1 && (
              <div className="space-y-1 mt-1">
                {doctor.branchInfo.slice(1, 4).map((branch, idx) => (
                  <div key={branch.branchId || idx} className={`flex items-center gap-2 ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}`}>
                    <MapPin className="w-3 h-3 flex-shrink-0 text-slate-400 mt-0.5" />
                    <span className="line-clamp-1">
                      {translatedAdditionalBranches[idx] || branch.branchName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {doctor.experienceYears && (
            <div className="mt-1 pt-2 border-t border-gray-200">
              <div className="inline-flex items-center gap-1.5 rounded-lg px-3">
                <span className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}`}>
                  {typeof doctor.experienceYears === 'number' ? doctor.experienceYears : parseInt(doctor.experienceYears, 10) || 0}+
                </span>
                <span className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}`} data-i18n="doctor-card.years-experience" data-i18n-original="years experience">
                  <Trans id="doctor-card.years-experience">years experience</Trans>
                </span>
              </div>
            </div>
          )}

        </div>
        <div className="px-4 py-4">
          <Button variant="primary" className="text-sm w-full py-2" >
            <Trans id="doctor-card.view-profile">View Profile</Trans>
          </Button>
        </div>
      </div>
    </Link>
  );
}

export default memo(DoctorCard);

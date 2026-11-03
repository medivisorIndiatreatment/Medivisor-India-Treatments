"use client"

import { useMemo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import SectionHeading from "@/components/ui/SectionHeading"
import SearchDropdown from "@/components/ui/SearchDropdown"
import HomepageCarousel from "@/components/ui/HomepageCarousel"
import MarqueeHeading from "@/components/ui/MarqueeHeading"
import { DESIGN_TOKENS, getAlternatingBackground } from "@/components/design-tokens"
import { extractFirstParagraphText } from "@/lib/cms"
import { generateSlug } from "@/lib/slug-utils"
import { getWixScaledToFitImageUrl } from "@/lib/wixMedia"
import { resolveDoctorLocation } from "@/lib/utils/card-utils"
import type { DoctorCardData } from "@/components/cards/types"
import { Building2, MapPin, Navigation } from "lucide-react"
import { useI18n, useTranslatedStrings } from "@/lib/i18n"

export interface SearchableCarouselSectionProps {
  visualIndex: number
  title: string
  titleI18nKey?: string
  searchValue: string
  onSearchChange: (value: string) => void
  onSearchClear: () => void
  searchPlaceholder: string
  searchPlaceholderI18nKey?: string
  searchType: "treatment" | "doctor"
  items: any[]
  filteredItems: any[]
  searchOptions: { id: string; name: string }[]
  onOptionSelect: (id: string) => void
  renderItem: (item: any, index: number) => React.ReactNode
  className?: string
  /** Enable windowed virtualization for large datasets. */
  virtualize?: boolean
}

export function SearchableCarouselSection({
  visualIndex,
  title,
  titleI18nKey,
  searchValue,
  onSearchChange,
  onSearchClear,
  searchPlaceholder,
  searchPlaceholderI18nKey,
  searchType,
  items,
  filteredItems,
  searchOptions,
  onOptionSelect,
  renderItem,
  className = "",
  virtualize = false,
}: SearchableCarouselSectionProps) {
  const sectionBg = getAlternatingBackground(visualIndex)

  return (
    <section className={`${sectionBg} ${DESIGN_TOKENS.SECTION_SPACING.PY} ${className}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-2 md:mb-6 md:px-0">
<SectionHeading title={title} titleI18nKey={titleI18nKey} className="!mb-0" />
          <div className="w-full md:w-auto md:min-w-[320px]">
            <SearchDropdown
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              placeholderI18nKey={searchPlaceholderI18nKey}
              options={searchOptions}
              onOptionSelect={onOptionSelect}
              onClear={onSearchClear}
              type={searchType}
            />
          </div>
        </div>

        <HomepageCarousel autoplay virtualize={virtualize}>
          {filteredItems.map((item, index) => renderItem(item, index))}
        </HomepageCarousel>
      </div>
    </section>
  )
}

export interface TreatmentCardItem {
  _id: string
  name: string
  slug: string
  image: string
  treatmentImage?: string
  cost?: string
  description: string
}

export interface DoctorCardItem {
  _id: string
  doctorName: string
  name: string
  specialization: DoctorCardData['specialization']
  department?: string[]
  qualification?: string | null
  designation?: string | null
  experienceYears?: number | string | null
  profileImage?: string
  profileImageUrl?: string | null
  city?: string | { cityName: string; name?: string }[]
  hospitalName?: string
  hospitalId?: string
  hospitalSlug?: string
  hospitalLinkType?: string
  hospitalLogo?: string
  branchName?: string
  branchId?: string
  branchInfo?: DoctorCardData['branchInfo']
  slug?: string
  popular?: boolean
}

export interface DoctorCarouselItemProps {
  doctor: DoctorCardItem
  index: number
  hoveredIndex: number | null
  onHover: (index: number | null) => void
}

export function DoctorCarouselItem({
  doctor,
  index,
  hoveredIndex,
  onHover,
}: DoctorCarouselItemProps) {
  const doctorSlug = doctor.slug || generateSlug(doctor.doctorName || doctor.name || "")

  const { t: tGlobal } = useI18n()

  const specializationArray = useMemo(() => {
    const spec = doctor.specialization
    if (Array.isArray(spec)) {
      return spec
        .map((s) => (typeof s === "string" ? s : s && typeof s.name === "string" ? s.name : ""))
        .filter(Boolean)
    }
    if (typeof spec === "string") return [spec]
    return []
  }, [doctor.specialization])

  // Resolve all location fields from a single centralized source of truth.
  // This keeps Hospital Name, Branch Name and City consistent with every other
  // doctor card in the app and guarantees no undefined/empty branch values.
  const location = useMemo(
    () => resolveDoctorLocation(doctor),
    [
      doctor.hospitalName,
      doctor.hospitalId,
      doctor.branchName,
      doctor.branchId,
      doctor.city,
      doctor.branchInfo,
    ],
  )
  const resolvedHospitalName = location.hospitalName ?? ""
  const resolvedBranchName = location.branchName ?? ""
  const cityDisplay = location.city ?? ""

  // Experience can arrive as a number or a numeric string from the CMS.
  // Normalize to a positive integer so it renders consistently.
  const experienceValue = useMemo(() => {
    const raw = doctor.experienceYears
    if (raw == null) return null
    const parsed = typeof raw === "number" ? raw : parseInt(String(raw), 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  }, [doctor.experienceYears])

  // Pre-fetch all translatable CMS strings + static labels for flash-free,
  // real-time translation.
  const doctorDisplayName = doctor.doctorName || doctor.name || "Doctor"
  const specDisplay =
    specializationArray.length > 0
      ? specializationArray.join(", ")
      : doctor.designation || doctor.qualification || "Specialty not available"
  const locationDisplay = resolvedBranchName || resolvedHospitalName || ""

  const translatableStrings = useMemo(() => {
    const strings: string[] = [
      doctorDisplayName,
      specDisplay,
      "View Profile",
      "years experience",
    ]
    if (locationDisplay) strings.push(locationDisplay)
    if (cityDisplay) strings.push(cityDisplay)
    return Array.from(new Set(strings.filter(Boolean)))
  }, [doctorDisplayName, specDisplay, locationDisplay, cityDisplay])

  const translatedStrings = useTranslatedStrings(translatableStrings)

  const translationMap = useMemo(() => {
    const map = new Map<string, string>()
    translatableStrings.forEach((original, i) => {
      map.set(original, translatedStrings[i] ?? original)
    })
    return map
  }, [translatableStrings, translatedStrings])

  const t = useCallback(
    (text: string): string => {
      if (!text) return text
      return translationMap.get(text) || tGlobal(text)
    },
    [translationMap, tGlobal],
  )

  // Translate specializations individually then join, for better quality
  const translatedSpecDisplay =
    specializationArray.length > 0
      ? specializationArray.map((s) => t(s)).join(", ")
      : t(specDisplay)

  return (
    <Link
      href={`/doctors/${doctorSlug}`}
      className="group block bg-gray-50 border border-gray-200 rounded-lg shadow-sm h-full w-full overflow-hidden flex flex-col hover:shadow-lg hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#E22026]/20"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex flex-col h-full">
        <div className="relative w-full h-44 md:h-52 overflow-hidden bg-gray-100">
          {doctor.profileImageUrl || doctor.profileImage ? (
             <Image
               src={doctor.profileImageUrl || doctor.profileImage || ""}
               alt={t(doctorDisplayName)}
               fill
               sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
               className="object-cover transition-transform duration-500 group-hover:scale-105"
               loading={index < 6 ? "eager" : "lazy"}
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 md:px-5 pt-5 pb-1 flex flex-col flex-1 space-y-1">
<div className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_TITLE} overflow-hidden`} data-i18n-original={doctorDisplayName} data-trans-managed="true">
            <MarqueeHeading
              isHovered={hoveredIndex === index}
              className="font-medium text-[#241d1f] leading-tight line-clamp-1"
            >
{t(doctorDisplayName)}
            </MarqueeHeading>
          </div>

          <div className={`flex items-center gap-2 ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}`}>
            <svg className="w-4 h-4 text-[#29A9B9] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
<span className="block truncate" data-i18n-original={specDisplay} data-trans-managed="true">
              {translatedSpecDisplay}
            </span>
          </div>

          {/* Hospital Name — shown only when it differs from the branch name
              so we never render the same value twice for standalone branches. */}
          {/* {resolvedHospitalName && resolvedHospitalName !== resolvedBranchName && (
            <div className={`flex items-center gap-2 ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}`}>
              <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-[#29A9B9]" />
              <span className="truncate">{resolvedHospitalName}</span>
            </div>
          )} */}

          {/* Branch Name — the canonical, authoritative location for the doctor.
Falls back to the hospital name for standalone hospitals where the
                branch and hospital are the same entity, so the card never shows an
                empty or undefined branch value. */}
          {(resolvedBranchName || resolvedHospitalName) && (
            <div className={`flex items-center gap-2 ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}`}>
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#29A9B9]" />
              <span className="truncate font-normal" data-i18n-original={locationDisplay} data-trans-managed="true">{t(locationDisplay)}</span>
            </div>
          )}

          {/* City — shown when present and not already implied by the branch name. */}
          {/* {cityDisplay && cityDisplay !== resolvedBranchName && cityDisplay !== resolvedHospitalName && (
            <div className={`flex items-center gap-2 ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}`}>
              <Navigation className="w-3.5 h-3.5 flex-shrink-0 text-[#29A9B9]" />
              <span className="truncate">{cityDisplay}</span>
            </div>
          )} */}

          {experienceValue !== null && (
            <div className="mt-1 pt-2 border-t border-gray-200">
              <div className="inline-flex items-center gap-1.5 rounded-lg px-3">
<span className={DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} data-i18n-original={`${experienceValue}+`} data-trans-managed="true">{experienceValue}+</span>
                <span className={DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} data-i18n="doctors.years-experience" data-i18n-original="years experience" data-trans-managed="true">
                  {t("years experience")}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="px-4 py-4">
<span className="inline-flex items-center justify-center text-sm w-full py-2 bg-[#23366E] text-white rounded-lg" data-i18n="doctors.view-profile" data-i18n-original="View Profile" data-trans-managed="true">
            {t("View Profile")}
          </span>
        </div>
      </div>
    </Link>
  )
}

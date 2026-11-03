/**
 * DoctorCard Component
 * Displays doctor information in a search result card
 * Uses shared utilities from @/lib/utils/card-utils for consistent behavior
 */

"use client"

import { memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Stethoscope, Star, Hospital, Briefcase } from "lucide-react"
import { useMemo, useState } from "react"
import {
  getCardImageUrl,
  getCardCityName,
  getCardSpecialty,
  getCardDoctorSlug,
} from "@/lib/utils/card-utils"
import { cleanSlug } from "@/lib/slug-utils"
import { stripHtmlTags } from "@/lib/cms"
import MarqueeHeading from "@/components/ui/MarqueeHeading"
import { Trans } from "@/lib/i18n/Trans"

/**
 * Doctor data interface - flexible to handle various data structures
 */
export interface DoctorCardData {
  _id: string
  doctorName?: string
  name?: string
  specialization?: { name: string }[] | string
  qualification?: string
  designation?: string
  experience?: string
  experienceYears?: string
  profileImage?: string
  profileImageUrl?: string | null // Pre-computed URL for SSR/CSR consistency
  popular?: boolean
  city?: { cityName: string }[] | string
  hospitalName?: string
  slug?: string
  departmentName?: string // For search filtering
  subDepartmentName?: string // For search filtering
}

interface DoctorCardProps {
  doctor: DoctorCardData
}

/**
 * DoctorCard displays doctor information with image, name, qualification, specialty, and location
 */
const DoctorCardComponent = ({ doctor }: DoctorCardProps) => {
  const [isHovered, setIsHovered] = useState(false)

  // Get doctor name
  const name = useMemo(
    () => doctor.doctorName || doctor.name || "Doctor",
    [doctor.doctorName, doctor.name]
  )

  // Get specialty
  const specialty = useMemo(
    () => getCardSpecialty(doctor.specialization),
    [doctor.specialization]
  )

  // Get city name
  const cityName = useMemo(
    () => getCardCityName(doctor.city),
    [doctor.city]
  )

  // Get image URL - use pre-computed profileImageUrl (deterministic SSR/CSR)
  const imageUrl = doctor.profileImageUrl ?? null

  // Generate slug - use stored slug if available (cleaned), otherwise generate from name
  const slug = useMemo(() => {
    if (doctor.slug) {
      return cleanSlug(doctor.slug) || doctor.slug
    }
    return getCardDoctorSlug(name, doctor._id)
  }, [doctor.slug, name, doctor._id])

  // Additional derived fields
  const designation = doctor.designation
  const cleanDesignation = useMemo(() => stripHtmlTags(designation || ""), [designation])
  const experienceYears = doctor.experience || doctor.experienceYears
  const hospitalName = doctor.hospitalName

  return (
    <Link
      href={`/doctors/${slug}`}
      className="group bg-gray-50  rounded-md shadow-xs w-full overflow-hidden border border-gray-100 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative h-44 sm:h-52 w-full shrink-0 overflow-hidden bg-linear-to-br from-slate-100 to-slate-200">
        {imageUrl ? (
          <div className="relative w-full h-full overflow-hidden">
  <Image
    src={imageUrl}
    alt={name}
    fill
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
    className="object-fill object-bottom"
  />
</div>
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
  </div>
        {/* Hover overlay with view profile button */}

      {/* Content Section */}
      <div className="p-4 flex h-40 flex-col">
        <div className="mb-2">
          <MarqueeHeading
            isHovered={isHovered}
            className="font-medium text-gray-900 leading-tight line-clamp-1"
          >
<Trans id="search-doctor-card.name">{name}</Trans>
          </MarqueeHeading>
        </div>

        <div className="mt-1 space-y-1">
          {cleanDesignation && (
            <p className="text-base text-gray-800 flex items-center gap-1 capitalize line-clamp-1">
<span className="truncate" data-i18n-original={cleanDesignation}>{cleanDesignation}</span>
            </p>
          )}
           {specialty && (
            <p className="text-base text-gray-900 flex items-center gap-1">
              <span className="block" data-i18n-original={specialty}>{specialty}</span>
            </p>
          )}
          {cityName && (
            <p className="text-base text-gray-800 flex items-center gap-1 line-clamp-1">
              <MapPin className="w-4 h-4 text-gray-800 shrink-0" />
              <span className="truncate" data-i18n-original={cityName}>{cityName}</span>
            </p>
          )}
          {hospitalName && (
            <p className="text-base text-gray-800 flex items-center gap-1 line-clamp-1">
              <Hospital className="w-4 h-4 text-gray-800 shrink-0" />
<span className="truncate" data-i18n-original={hospitalName}>{hospitalName}</span>
            </p>
          )}
          {experienceYears && (
            <p className="text-base text-gray-800 flex items-center gap-1 line-clamp-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
<span className="truncate" data-i18n-original={`${experienceYears}+ years experience`}>{experienceYears}+ <Trans id="search-doctor-card.years">years experience</Trans></span>
            </p>
          )}


        </div>
      </div>

    </Link>
  )
}

export const DoctorCard = memo(DoctorCardComponent)
export default DoctorCard

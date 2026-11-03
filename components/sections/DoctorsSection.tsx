/**
 * Unified DoctorsSection Component
 * Consolidates DoctorSection, BranchDoctorsSection, and DepartmentDoctorsSection
 * Provides consistent doctor listing with A-Z sorting and carousel
 */

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import SectionHeading from "@/components/ui/SectionHeading"
import HomepageCarousel from "@/components/ui/HomepageCarousel"
import SearchDropdown from "@/components/ui/SearchDropdown"
import DoctorCard from "@/components/cards/DoctorCard"
import { DESIGN_TOKENS, SECTION_INDEX, getAlternatingBackground } from "@/components/design-tokens"
import type { DoctorCardData } from "@/components/cards/types"
import type { DoctorData, HospitalData } from "@/lib/cms/types"
import { buildHospitalLookupMaps } from "@/lib/utils/doctor-utils"
import { transformDoctor } from "@/lib/services/homepage/transformers"
import { generateSlug } from "@/lib/slug-utils"
import { Trans } from "@/lib/i18n/Trans"

interface DoctorsSectionProps {
  doctors?: DoctorCardData[]
  initialDoctors?: DoctorData[]
  initialHospitals?: HospitalData[]
  title?: string
  subtitle?: string
  limit?: number
  searchDoctors?: DoctorCardData[]
  showHospital?: boolean
  showBranchName?: string
  showAdditionalBranches?: boolean
  sortAlphabetically?: boolean
}

export default function DoctorsSection({
  doctors: initialDoctorCards,
  initialDoctors,
  initialHospitals,
  title = "Available Doctors",
  subtitle,
  limit,
  searchDoctors,
  showHospital = true,
  showBranchName,
  showAdditionalBranches = false,
  sortAlphabetically = true,
}: DoctorsSectionProps) {
  const router = useRouter()
  const [searchInputValue, setSearchInputValue] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInputValue)
    }, 150)
    return () => clearTimeout(timer)
  }, [searchInputValue])

  // Build lookup maps ONCE from hospitals if processing raw doctors
  const { hospitalLookup, hospitalNameLookup, branchToHospitalMap } = useMemo(
    () => buildHospitalLookupMaps(Array.isArray(initialHospitals) ? initialHospitals : []),
    [initialHospitals]
  )

  // Build hospital logo map
  const hospitalLogoMap = useMemo(() => {
    const logoMap: Record<string, string | null> = {}
    if (Array.isArray(initialHospitals) && initialHospitals.length) {
      initialHospitals.forEach((h) => {
        if (h._id) {
          logoMap[h._id] = h.logoUrl || h.logo || null
        }
      })
    }
    return logoMap
  }, [initialHospitals])

  // Process doctors using shared utility - memoized for performance
  // Use initialDoctorCards if provided, otherwise process from initialDoctors
  const doctors = useMemo(() => {
    if (initialDoctorCards && Array.isArray(initialDoctorCards) && initialDoctorCards.length > 0) {
      return initialDoctorCards
    }
    if (!Array.isArray(initialDoctors) || initialDoctors.length === 0) return []
    return initialDoctors.map((doctor) =>
      transformDoctor(doctor, hospitalLogoMap, Array.isArray(initialHospitals) ? initialHospitals : [], { showHospital })
    )
  }, [initialDoctorCards, initialDoctors, hospitalLogoMap, initialHospitals, showHospital])

  const searchSource = searchDoctors && searchDoctors.length > 0 ? searchDoctors : doctors

  // Filter and optionally sort doctors for display.
  const displayDoctors = useMemo(() => {
    if (!Array.isArray(doctors) || doctors.length === 0) return []

    let result = [...doctors]

    // Apply search filter
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase().trim()
      result = result.filter((doctor) => {
        const searchableFields = [
          doctor.doctorName,
          doctor.name,
          doctor.designation,
          doctor.hospitalName,
          doctor.branchName,
          doctor.location,
        ]

        // Check specialization field
        const specMatch = doctor.specialization
          ? (Array.isArray(doctor.specialization)
            ? doctor.specialization.some((spec: any) => {
                const specStr = typeof spec === 'string' ? spec : spec?.name
                return specStr?.toLowerCase().includes(term)
              })
            : String(doctor.specialization).toLowerCase().includes(term))
          : false

        return searchableFields.some((field) =>
          field?.toLowerCase().includes(term)
        ) || specMatch
      })
    }

    // Sort A-Z unless caller needs ranked related-content order.
    if (sortAlphabetically) {
      result = [...result].sort((a, b) => {
        const nameA = a.doctorName || a.name || ""
        const nameB = b.doctorName || b.name || ""
        return nameA.localeCompare(nameB)
      })
    }

    // Apply limit only if specified (for backward compatibility)
    if (limit && limit > 0) {
      return result.slice(0, limit)
    }

    return result
  }, [doctors, debouncedSearchTerm, limit, sortAlphabetically])

  // Search options for dropdown
  const searchOptions = useMemo(() => {
    return searchSource.map((doctor) => ({
      id: doctor._id,
      name: doctor.doctorName || doctor.name || "Doctor",
      type: "doctor" as const,
    }))
  }, [searchSource])

  const handleSelect = useCallback(
    (id: string) => {
      const doctor = searchSource.find((d) => d._id === id)
      if (doctor) {
        setSearchInputValue("")
        const slug = doctor.doctorSlug || doctor.slug || generateSlug(doctor.doctorName || doctor.name || "")
        router.push(`/doctors/${slug}`)
      }
    },
    [router, searchSource]
  )

  if (!Array.isArray(doctors) || doctors.length === 0) {
    return null
  }

  return (
    <section className={`${getAlternatingBackground(SECTION_INDEX.DOCTORS)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-6 md:px-0">
          <SectionHeading
            title={title}
            subtitle={subtitle}
            className="!mb-0"
          />
          <div className="relative w-full md:w-[340px]">
<SearchDropdown
               value={searchInputValue}
               onChange={setSearchInputValue}
               placeholder="Search Doctors"
               options={searchOptions}
               onOptionSelect={handleSelect}
               onClear={() => setSearchInputValue("")}
               type="doctor"
               data-i18n="search.doctors"
               data-i18n-original="Search Doctors"
             />
          </div>
        </div>

        <HomepageCarousel autoplay>
          {displayDoctors.map((doctor, index) => (
            <DoctorCard
              key={doctor._id || index}
              doctor={doctor}
              index={index}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
              showHospital={showHospital}
              showAdditionalBranches={showAdditionalBranches}
            />
          ))}
        </HomepageCarousel>
      </div>
    </section>
  )
}

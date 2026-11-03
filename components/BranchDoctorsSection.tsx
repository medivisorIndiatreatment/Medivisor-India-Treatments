"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { generateSlug } from "@/lib/slug-utils"
import SectionHeading from "@/components/ui/SectionHeading"
import SearchDropdown from "@/components/ui/SearchDropdown"
import HomepageCarousel from "@/components/ui/HomepageCarousel"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import type { DoctorData, HospitalData } from "@/lib/cms/types"
import type { DoctorCardData } from "@/components/cards/types"
import { buildHospitalLookupMaps, processDoctor } from "@/lib/utils/doctor-utils"
import DoctorCard from "@/components/cards/DoctorCard"
import { useI18n } from "@/lib/i18n"

interface BranchDoctorsSectionProps {
  doctors: DoctorData[]
  searchDoctors?: any[]
   hospitals?: HospitalData[]
  branchName?: string
  branchId?: string
  title?: string
  titleI18nKey?: string
}

export default function BranchDoctorsSection({
  doctors,
  searchDoctors,
  hospitals = [],
branchName,
  branchId,
  title,
  titleI18nKey,
}: BranchDoctorsSectionProps) {
  const router = useRouter()
  const { t } = useI18n()
  const resolvedBranchName = branchName || t("Doctors")
  const resolvedTitle = title || resolvedBranchName || t("Related Specialists")
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

  // Build lookup maps ONCE from hospitals
  const { hospitalLookup, hospitalNameLookup, branchToHospitalMap } = useMemo(
    () => buildHospitalLookupMaps(Array.isArray(hospitals) ? hospitals : []),
    [hospitals]
  )

  // Build hospital logo map
  const hospitalLogoMap = useMemo(() => {
    const logoMap: Record<string, string | null> = {}
    if (Array.isArray(hospitals) && hospitals.length) {
      hospitals.forEach((hospital: HospitalData) => {
        if (hospital._id) {
          logoMap[hospital._id] = hospital.logoUrl || hospital.logo || null
        }
      })
    }
    return logoMap
  }, [hospitals])

  // Process doctors using shared utility - memoized for performance
  const processedDoctors = useMemo(() => {
    if (!Array.isArray(doctors) || doctors.length === 0) return []
    return doctors.map((doctor) =>
      processDoctor(doctor, hospitalLogoMap, hospitalLookup, hospitalNameLookup, branchToHospitalMap)
    )
  }, [doctors, hospitalLogoMap, hospitalLookup, hospitalNameLookup, branchToHospitalMap])

  // Filter and sort doctors based on search term
  const displayDoctors = useMemo(() => {
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase().trim()
      let filtered = processedDoctors.filter((doctor) => {
        if (doctor.doctorName?.toLowerCase().includes(term)) return true
        if (doctor.specialization) {
          const specs = Array.isArray(doctor.specialization) ? doctor.specialization : [doctor.specialization]
          if (specs.some((spec: any) => String(spec).toLowerCase().includes(term))) return true
        }
        if (doctor.qualification?.toLowerCase().includes(term)) return true
        if (doctor.designation?.toLowerCase().includes(term)) return true
        if (doctor.hospitalName?.toLowerCase().includes(term)) return true
        if (doctor.location?.toLowerCase().includes(term)) return true
        if (doctor.branchName?.toLowerCase().includes(term)) return true
        return false
      })
      return filtered.sort((a, b) => (a.doctorName || '').localeCompare(b.doctorName || ''))
    }
    // Default: popular first, then alphabetical
    return [...processedDoctors]
      .sort((a, b) => {
        if (a.popular && !b.popular) return -1
        if (!a.popular && b.popular) return 1
        return (a.doctorName || '').localeCompare(b.doctorName || '')
      })
  }, [processedDoctors, debouncedSearchTerm])

  // Use searchDoctors for autocomplete if provided, otherwise fall back to branch doctors
  const searchSource = searchDoctors && searchDoctors.length > 0 ? searchDoctors : processedDoctors

  // Search options for dropdown - from all doctors (Doctor Master)
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
        // Navigate to doctor profile page using slug from Doctor Master data
        const slug = doctor.slug || doctor.doctorSlug || generateSlug(doctor.doctorName || doctor.name || "")
        router.push(`/doctors/${slug}`)
      }
    },
    [searchSource, router]
  )

  if (processedDoctors.length === 0) return null

  return (
    <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 mb-2 md:mb-4">
<SectionHeading
              title={resolvedTitle}
              titleI18nKey={titleI18nKey}
              className="!mb-0"
            />
          <div className="relative w-full md:w-[340px]">
            <SearchDropdown
              value={searchInputValue}
              onChange={setSearchInputValue}
              placeholder="Search Doctors"
              placeholderI18nKey="doctors.search"
              options={searchOptions}
              onOptionSelect={handleSelect}
              onClear={() => {
                setSearchInputValue("")
              }}
              type="doctor"
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
              />
            ))}
          </HomepageCarousel>
      </div>
    </section>
  )
}
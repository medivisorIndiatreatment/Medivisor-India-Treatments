"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import SectionHeading from "@/components/ui/SectionHeading"
import HomepageCarousel from "@/components/ui/HomepageCarousel"
import SearchDropdown from "@/components/ui/SearchDropdown"
import TreatmentCard from "@/components/cards/TreatmentCard"
import type { TreatmentCardData } from "@/components/cards/types"
import { DESIGN_TOKENS, getAlternatingBackground } from "@/components/design-tokens"
import { generateSlug } from "@/lib/slug-utils"
import { getCardImageUrl } from "@/lib/utils/card-utils"
import { getWixImageUrl, getWixScaledToFillImageUrl } from "@/lib/wixMedia"
import { isRichTextContent, extractRichTextHtml, extractTextFromRicos, getValue } from "@/lib/cms"

interface Treatment {
  _id: string
  name: string
  treatmentImage?: string | null
  treatmentImageUrl?: string | null
  image?: string | null
  cost?: string | null
  description?: string | null
  descriptionHtml?: string | null
}

interface DepartmentTreatmentsSectionProps {
  treatments: Treatment[]
  departmentName: string
  departmentTreatments?: Treatment[]
  allTreatments?: Treatment[]
  title?: string
  titleI18nKey?: string
}

/**
 * Maps raw treatment data to TreatmentCardData format
 * Consistent mapping across the application
 */
function mapToTreatmentCardData(treatment: Treatment): TreatmentCardData {
  const rawName = treatment.name || "Treatment"
  let rawHtmlDescription = treatment.descriptionHtml || ""
  if (!rawHtmlDescription && typeof treatment.description === "string") {
    rawHtmlDescription = treatment.description
  } else if (typeof treatment.description === "object" && treatment.description !== null) {
    const descText = getValue(treatment.description, "text", "content", "html", "name", "title")
    if (descText) rawHtmlDescription = descText
  }
  let formattedDescription = ""
  if (isRichTextContent(rawHtmlDescription)) {
    if (Array.isArray(rawHtmlDescription)) {
      formattedDescription = extractTextFromRicos(rawHtmlDescription)
    } else {
      formattedDescription = extractRichTextHtml(rawHtmlDescription, true)
    }
  } else if (typeof rawHtmlDescription === "string") {
    formattedDescription = extractRichTextHtml(rawHtmlDescription, true)
  }
  const cleanDescription = (typeof treatment.description === "string" ? treatment.description : "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim()

  const rawImage = [treatment.treatmentImageUrl, treatment.treatmentImage, treatment.image].find(
    (value) => typeof value === "string" && value.length > 0,
  )
  const imageUrl = rawImage ? getCardImageUrl(rawImage, 400, 300) || undefined : undefined

  return {
    _id: treatment._id,
    name: rawName,
    slug: rawName ? generateSlug(rawName) : undefined,
    treatmentImage: imageUrl,
    description: formattedDescription || cleanDescription || undefined,
    cost: treatment.cost ? String(treatment.cost) : undefined,
  }
}

export default function DepartmentTreatmentsSection({
  treatments,
  departmentName,
  departmentTreatments = [],
  allTreatments = [],
  title,
  titleI18nKey,
}: DepartmentTreatmentsSectionProps) {
  const router = useRouter()
  const [searchInputValue, setSearchInputValue] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Debounce search term for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInputValue)
    }, 150)
    return () => clearTimeout(timer)
  }, [searchInputValue])

  // Map treatments to card data format
  const mappedTreatments = useMemo((): TreatmentCardData[] => {
    const source = departmentTreatments.length > 0
      ? departmentTreatments
      : treatments.length > 0
      ? treatments
      : allTreatments

    return source.map(mapToTreatmentCardData)
  }, [treatments, departmentTreatments, allTreatments])

  // Map all treatments for search (searches across all available treatments)
  const allMappedTreatments = useMemo((): TreatmentCardData[] => {
    const allSource = allTreatments.length > 0
      ? allTreatments
      : [...departmentTreatments, ...treatments].filter(Boolean)
    return allSource.map(mapToTreatmentCardData)
  }, [allTreatments, departmentTreatments, treatments])

  // Filter and sort treatments based on search
  const displayTreatments = useMemo(() => {
    let result: TreatmentCardData[]

    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase()
      result = allMappedTreatments.filter((t) =>
        t.name?.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term)
      )
    } else {
      result = [...mappedTreatments]
    }

    // Always sort alphabetically by name
    return result.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
  }, [mappedTreatments, allMappedTreatments, debouncedSearchTerm])

  // Build search options for dropdown
  const searchOptions = useMemo(() => {
    return allMappedTreatments
      .map((t) => ({ id: t._id, name: t.name || "Treatment" }))
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  }, [allMappedTreatments])

  const handleSelect = useCallback(
    (id: string) => {
      const treatment = allMappedTreatments.find((t) => t._id === id)
      if (treatment) {
        setSearchInputValue("")
        router.push(`/treatment/${treatment.slug || generateSlug(treatment.name || "")}`)
      }
    },
    [allMappedTreatments, router]
  )

  // Show nothing if no treatments available
  const hasTreatments = treatments.length > 0 || departmentTreatments.length > 0
  if (!hasTreatments) return null

  return (
    <section className={`${getAlternatingBackground(5)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-2 md:mb-6 md:px-0">
          <SectionHeading
title={title || "Related Treatments"}
            titleI18nKey={titleI18nKey || "department.treatments"}
            size="md"
            className="!mb-0"
          />

          <div className="relative w-full md:w-[340px]">
            <SearchDropdown
              value={searchInputValue}
              onChange={setSearchInputValue}
              placeholder="Search Treatments"
              placeholderI18nKey="treatments.search"
              options={searchOptions}
              onOptionSelect={handleSelect}
              onClear={() => {
                setSearchInputValue("")
              }}
              type="treatment"
            />
          </div>
        </div>

        <HomepageCarousel autoplay>
          {displayTreatments.map((treatment, index) => (
            <TreatmentCard
              key={treatment._id || index}
              treatment={treatment}
              index={index}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
              showDescription={true}
              showCategory={false}
              hoverTextColor={true}
            />
          ))}
        </HomepageCarousel>
      </div>
    </section>
  )
}

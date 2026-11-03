"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { generateSlug } from "@/lib/slug-utils"
import { extractRichTextHtml, extractTextFromRicos, isRichTextContent } from "@/lib/cms"
import SectionHeading from "@/components/ui/SectionHeading"
import HomepageCarousel from "@/components/ui/HomepageCarousel"
import SearchDropdown from "@/components/ui/SearchDropdown"
import TreatmentCard from "@/components/cards/TreatmentCard"
import type { TreatmentCardData } from "@/components/cards/types"
import { DESIGN_TOKENS, getAlternatingBackground } from "@/components/design-tokens"
import { Trans } from "@/lib/i18n/Trans"
import { useI18n } from "@/lib/i18n"
import { getValue } from "@/lib/cms"
import { getCardImageUrl } from "@/lib/utils/card-utils"

interface Treatment {
  _id: string
  name: string
  description?: string | null
  descriptionHtml?: string | null
  category?: string | null
  duration?: string | null
  cost?: string | null
  minPrice?: string | null
  treatmentImage?: string | null
  treatmentImageUrl?: string | null
  image?: string | null
  specialistName?: string
  specialistId?: string
  department?: string | null
  departmentId?: string | null
}

interface BranchTreatmentsProps {
  treatments: Treatment[]
branchName?: string
  title?: string
  titleI18nKey?: string
}

/**
 * Format cost for display with "Starting from" prefix
 */
function formatCost(costString: string | null | undefined): string {
  if (!costString) return ""
  const lowerCost = costString.toLowerCase()
  if (lowerCost.includes("starting") || lowerCost.includes("from")) {
    return costString
  }
  return `Starting from ${costString}`
}

/**
 * Maps a Branch treatment record to TreatmentCardData
 */
function mapTreatmentToCardData(treatment: Treatment): TreatmentCardData {
  const rawName = getValue(treatment, "name", "treatmentName", "title") || "Treatment"
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

  const costValue = treatment.minPrice || treatment.cost
  const rawImage = [treatment.treatmentImageUrl, treatment.treatmentImage, treatment.image].find(
    (value) => typeof value === "string" && value.length > 0,
  )
  const imageUrl = rawImage ? getCardImageUrl(rawImage) || undefined : undefined

  return {
    _id: treatment._id,
    name: rawName,
    slug: rawName ? generateSlug(rawName) : undefined,
    treatmentImage: imageUrl,
    description: formattedDescription || cleanDescription || undefined,
    cost: costValue ? formatCost(costValue) : undefined,
    duration: treatment.duration || undefined,
    category: treatment.category || undefined,
    specialistName: treatment.specialistName || undefined,
    specialistId: treatment.specialistId || undefined,
    department: treatment.department || undefined,
    departmentId: treatment.departmentId || undefined,
  }
}

export default function BranchTreatments({ treatments, branchName, title, titleI18nKey }: BranchTreatmentsProps) {
  const router = useRouter()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { t } = useI18n()

  const resolvedTitle = title || branchName || t("Related Treatments")

  // Map all treatments (filter out entries with no valid name)
  const mappedTreatments = useMemo(
    () => treatments
      .filter((t) => t.name && t.name !== "Unknown Treatment" && t.name !== "Treatment")
      .map(mapTreatmentToCardData),
    [treatments]
  )

  // Filter based on search
  const displayTreatments = useMemo(() => {
    if (!searchTerm) return mappedTreatments
    const term = searchTerm.toLowerCase()
    return mappedTreatments
      .filter((t) =>
        t.name?.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term)
      )
      .sort((a, b) =>
        (a.name || "").toLowerCase().localeCompare((b.name || "").toLowerCase())
      )
  }, [mappedTreatments, searchTerm])

  // Search dropdown options
  const searchOptions = useMemo(
    () =>
      mappedTreatments
        .map((t) => ({ id: t._id, name: t.name || "Treatment" }))
        .sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        ),
    [mappedTreatments]
  )

  const handleSelect = useCallback((id: string) => {
    const treatment = mappedTreatments.find((t) => t._id === id)
    if (treatment) {
      setSearchTerm("")
      router.push(`/treatment/${treatment.slug || generateSlug(treatment.name || "")}`)
    }
  }, [mappedTreatments, router])

  if (!treatments || treatments.length === 0) return null

  return (
    <section className={`${getAlternatingBackground(1)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-2 md:mb-4 px-2">
<SectionHeading
                title={resolvedTitle}
                titleI18nKey={titleI18nKey}
                className="!mb-0"
              />

          <div className="relative w-full md:w-[340px]">
            <SearchDropdown
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search Treatments"
              placeholderI18nKey="treatments.search"
              options={searchOptions}
              onOptionSelect={handleSelect}
              onClear={() => setSearchTerm("")}
              type="treatment"
              data-i18n="branch-treatments.search"
              data-i18n-original="Search Treatments"
            />
          </div>
        </div>

        {displayTreatments.length > 0 ? (
          <HomepageCarousel autoplay>
            {displayTreatments.map((treatment, index) => (
              <TreatmentCard
                key={treatment._id || index}
                treatment={treatment}
                index={index}
                hoveredIndex={hoveredIndex}
                onHover={setHoveredIndex}
                showDescription={true}
                showCategory={true}
                showSpecialist={true}
                hoverTextColor={true}
              />
            ))}
          </HomepageCarousel>
        ) : (
          <div className="py-8 text-gray-500" data-i18n-original="No treatments found matching your search.">
            <Trans id="branch-treatments.no-results">No treatments found matching your search.</Trans>
          </div>
        )}
      </div>
    </section>
  )
}

"use client"

import { useMemo, useState, useEffect, useCallback, useRef } from "react"

import Image from "next/image"
import { DollarSign, Clock } from "lucide-react"
import BreadcrumbNav from "@/components/ui/BreadcrumbNav"
import { sanitizeHtml, extractRichTextHtml, isRichTextContent } from "@/lib/cms"
import { RicosRenderer } from "@/components/RichContentViewer"
import { TableOfContents, extractHeadingsFromNodes, extractHeadingsFromHtml } from "@/components/ui/TableOfContents"
import ContactForm from "@/components/ContactForm"
import ContactModal from "@/components/ContactModal"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import { TreatmentDoctorsSection } from "@/components/department"
import HospitalSection from "@/components/sections/HospitalSection"
import { useTranslatedStrings, useTranslatedRicosContent, useTranslatedHtmlString } from "@/lib/i18n"
import type { BranchCardData, DoctorCardData } from "@/components/cards/types"
import type { TreatmentData } from "@/lib/cms/types"

interface Heading {
  id: string
  text: string
  level: number
}
interface TreatmentDetailClientProps {
  treatment: TreatmentData | null
  branchCards: BranchCardData[]
  slug: string
  doctors?: DoctorCardData[]
}

export default function TreatmentDetailClient({
  treatment: initialTreatment,
  branchCards,
  slug,
  doctors = [],
}: TreatmentDetailClientProps) {
  const [treatment, setTreatment] = useState<TreatmentData | null>(initialTreatment)
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    setTreatment(initialTreatment)
    setFetchError(null)

    // The server page already fetched this record. Do not repeat that CMS
    // request after hydration; the API fallback is only for standalone usage.
    if (initialTreatment) {
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    let mounted = true

    const fetchTreatmentData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `/api/treatments/${encodeURIComponent(slug)}?slug=${encodeURIComponent(slug)}`,
          { signal: controller.signal, cache: "force-cache" }
        )

        if (!response.ok) {
          if (response.status === 404) throw new Error("Treatment not found")
          throw new Error("Failed to fetch treatment data")
        }

        const data = await response.json()
        if (mounted && data) setTreatment(data as TreatmentData)
      } catch (error) {
        if (mounted && !(error instanceof DOMException && error.name === "AbortError")) {
          setFetchError(error instanceof Error ? error.message : "Failed to load treatment data")
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void fetchTreatmentData()
    return () => {
      mounted = false
      controller.abort()
    }
  }, [initialTreatment, slug])

  const displayName = treatment?.name || slug.replace(/-/g, ' ').replace(/,/g, '')
    .replace(/\b\w/g, l => l.toUpperCase())

  // All translatable strings pre-fetched in a single batch for optimal performance.
  // This covers CMS data (treatment name, cost, duration) + static UI labels.
  const translatableStrings = useMemo(() => {
    const strings: string[] = [
      displayName,
      "Treatment",
      "Related Doctors",
      "Related Hospitals",
    ]
    if (treatment?.cost) strings.push(treatment.cost)
    if (treatment?.duration) strings.push(treatment.duration)
    strings.push(
      "Estimated Cost",
      "Starting from",
      "Treatment Duration",
      "Average stay"
    )
    return Array.from(new Set(strings))
  }, [displayName, treatment?.cost, treatment?.duration])

  const translatedStrings = useTranslatedStrings(translatableStrings)

  const translationMap = useMemo(() => {
    const map = new Map<string, string>()
    translatableStrings.forEach((original, i) => {
      map.set(original, translatedStrings[i] ?? original)
    })
    return map
  }, [translatableStrings, translatedStrings])

  // Synchronous translation helper with English fallback.
  // Reads from the pre-fetched translation map; falls back to the original
  // English text when no translation is available (guarantees no empty content).
  const t = useCallback((text: string): string => {
    if (!text) return text
    return translationMap.get(text) || text
  }, [translationMap])

  // --- Breadcrumb items (original English text — BreadcrumbNav translates via sync cache) ---
  const breadcrumbItems = useMemo(
    () => [
      { label: "Treatment", href: "/search/?view=treatments" },
      { label: displayName, href: "#" },
    ],
    [displayName]
  )

  // --- Hero image ---
  const heroImage = useMemo(() => {
    if (!treatment) return "/placeholder.svg"
    return treatment.treatmentImageUrl || treatment.treatmentImage || "/placeholder.svg"
  }, [treatment?.treatmentImageUrl, treatment?.treatmentImage])

  // --- Rich content: Ricos nodes vs HTML string ---
  const ricosNodes = useMemo(() => {
    if (!treatment) return null
    const descriptionHtml = treatment.descriptionHtml
    if (!descriptionHtml) return null
    if (isRichTextContent(descriptionHtml)) {
      const ricaContent = descriptionHtml as any
      if (ricaContent?.nodes && Array.isArray(ricaContent.nodes)) {
        return ricaContent.nodes
      }
      // If descriptionHtml is a plain nodes array (not wrapped in an object)
      if (Array.isArray(descriptionHtml)) {
        return descriptionHtml
      }
    }

    return null
  }, [treatment])

  const contentHtml = useMemo(() => {
    if (!treatment) return null
    // If we have Ricos nodes, RicosRenderer handles rendering
    if (ricosNodes) return null
    const content = treatment.descriptionHtml
    if (typeof content === 'string' && content.trim()) {
      return content
    }
    // Fallback to plain description
    const fallback = treatment.description
    if (fallback && typeof fallback === 'string') {
      return `<p>${fallback}</p>`
    }
    return null
  }, [treatment, ricosNodes])

  // Translate rich content FIRST (before heading extraction), so headings
  // and anchor conversions use translated text.
  const translatedRicosContent = useTranslatedRicosContent(ricosNodes)
  const translatedHtmlString = useTranslatedHtmlString(contentHtml || "")

  // Extract headings from the TRANSLATED content (not original).
  // Using useMemo for synchronous extraction — avoids a flash of English headings.
  const headings = useMemo((): Heading[] => {
    if (translatedRicosContent) {
      return extractHeadingsFromNodes(translatedRicosContent as any[])
    }
    if (typeof translatedHtmlString === 'string' && translatedHtmlString) {
      return extractHeadingsFromHtml(translatedHtmlString)
    }
    return []
  }, [translatedRicosContent, translatedHtmlString])

  // Post-process translated HTML: convert <u> tags that match headings into
  // anchor links AND inject id attributes into heading tags so the TableOfContents
  // anchor links work correctly with translated heading text.
  const processedHtml = useMemo(() => {
    if (!translatedHtmlString) return null

    const headingSet = new Set(headings.map((h) => h.text.trim().toLowerCase()))

    // Step 1: Convert <u> tags matching headings into anchor links
    let html = translatedHtmlString.replace(
      /<u>(.*?)<\/u>/gs,
      (match, text) => {
        const plainText = text.replace(/<[^>]*>/g, '').trim().toLowerCase()
        if (headingSet.has(plainText)) {
          const heading = headings.find(
            (h) => h.text.trim().toLowerCase() === plainText
          )
          if (heading) {
            return `<a href="#${heading.id}" class=" font-medium">${text}</a>`
          }
        }
        return match
      }
    )
    // Step 2: Inject id attributes into heading tags (for TOC anchor links)
    const headingSlugMap = new Map(
      headings.map((h) => [h.text.trim().toLowerCase(), h.id])
    )

    html = html.replace(
      /<h([1-6])([^>]*)>(.*?)<\/h\1>/gi,
      (match, level: string, attrs: string, content: string) => {
        if (/id\s*=/i.test(attrs)) return match // already has an id
        const text = content.replace(/<[^>]*>/g, '').trim().toLowerCase()
        const id = headingSlugMap.get(text)
        if (id) {
          return `<h${level} id="${id}"${attrs}>${content}</h${level}>`
        }
        return match
      }
    )

    return html
  }, [translatedHtmlString, headings])

  // Inject id attributes into Ricos-rendered heading elements (DOM-based, for
  // the RicosRenderer path which doesn't support id attributes natively).
  const contentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!contentRef.current || !headings.length) return
    const headingElements = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headings.forEach((heading, i) => {
      const el = headingElements[i]
      if (el && !el.hasAttribute('id')) {
        el.id = heading.id
      }
    })
  }, [headings, translatedRicosContent, processedHtml])

  const renderContent = useMemo(() => {
    if (!treatment) return null

    if (translatedRicosContent) {
      return (
        <div
          ref={contentRef}
          className="prose custom-list space-y-2  max-w-none text-sm md:text-lg department-description-content"
          data-i18n-html
          data-trans-managed="true"
          dir="auto"
        >
          <RicosRenderer content={{ nodes: translatedRicosContent as any }} />
        </div>
      )
    }

    if (processedHtml) {
      return (
        <div
          className="prose custom-list space-y-2  max-w-none text-sm md:text-lg department-description-content"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(extractRichTextHtml(processedHtml, false)),
          }}
          data-i18n-html
          data-trans-managed="true"
          dir="auto"
          suppressHydrationWarning
        />
      )
    }

    return null
  }, [treatment, translatedRicosContent, processedHtml])

  if (!treatment) {
    return null
  }

  return (
    <div className="bg-white min-h-screen smooth-load loaded">
      <section className={`relative overflow-hidden ${DESIGN_TOKENS.SECTION_SPACING.HERO_OUTER_PY} ${DESIGN_TOKENS.BACKGROUNDS.WHITE}`}>
        <div className="absolute inset-0 z-0">
          {heroImage && heroImage !== "/placeholder.svg" ? (
            <Image
              src={heroImage}
              alt={`${t(displayName)} ${t("Treatment")}`}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200" />
          )}
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-white/10" />

        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} px-6 w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-12 items-end gap-10 md:h-full overflow-hidden h-full min-h-[40vh] md:min-h-[70dvh]`}>
          <div className="text-white lg:col-span-8 flex items-end relative z-[15]">
            <div className="md:w-[85%]">
              <h1
                className="text-xl sm:text-xl md:text-2xl md:px-6 lg:text-4xl font-normal md:font-light text-white mb-2 sm:mb-3 md:mb-4 leading-tight drop-shadow-lg"
                data-i18n={displayName}
                data-i18n-original={displayName}
                data-trans-managed="true"
              >
                {t(displayName)}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <BreadcrumbNav items={breadcrumbItems} />

      <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className={`grid grid-cols-1 lg:grid-cols-4 ${DESIGN_TOKENS.SECTION_SPACING.GAP}`}>
            <div className="lg:col-span-3 first-heading space-y-2 md:space-y-8">
              {headings.length > 0 && (
                <div className="lg:hidden mb-4">
                  <TableOfContents headings={headings} />
                </div>
              )}
              <div className={`bg-white md:border border-gray-200 md:rounded-xl f md:shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#29A9B9]/30  lg:p-6 md:p-8`}>
                {renderContent}


                {(treatment.cost || treatment.duration) && (
                  <div className="mt-7 md:mt-8">


                    {/* COST */}
                    {treatment.cost && (
                      <div className="mt-4">
                        <h4 className="font_4 ">
                          {treatment?.name || displayName} {t("Cost in India")}
                        </h4>
                        <p className="mt-2 text-lg  text-[#241d1f]">
                          {`The cost of ${treatment?.name || displayName} in India is generally affordable compared with many other countries, making India a popular destination for international patients seeking quality medical care. The treatment cost depends on factors such as the hospital, doctor's experience, treatment approach, medical condition, hospital stay, diagnostic tests, medicines, and any additional procedures required. For international patients, the starting cost of ${treatment?.name || displayName} in India is approximately ${treatment?.cost} USD, although the final price may vary based on individual treatment requirements. Patients are advised to obtain a personalized treatment estimate after medical evaluation.`}
                        </p>
                      </div>
                    )}

                    {/* DURATION */}
                    {/* {treatment.duration && (
          <div className="p-5 md:p-7">
            <div className="flex items-start gap-3 mb-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#29A9B9]/10 text-[#29A9B9]">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("Treatment Information")}
                </p>
                <h3
                  className="mt-0.5 text-lg font-semibold tracking-tight text-[#241d1f]"
                  data-i18n="treatment.treatment-duration"
                  data-i18n-original="Treatment Duration"
                  data-trans-managed="true"
                >
                  {t("Treatment Duration")}
                </h3>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <p
                className="text-3xl md:text-4xl font-bold leading-none tracking-tight text-[#241d1f]"
                data-i18n={treatment.duration}
                data-i18n-original={treatment.duration}
                data-trans-managed="true"
              >
                {t(treatment.duration)}
              </p>
            </div>

            <p className="text-xs text-gray-500">
              {t("Average stay")}
            </p>
          </div>
        )} */}

                  </div>
                )}

              </div>
            </div>

            <div className="lg:col-span-1 hidden md:block">
              <div className="sticky top-24 space-y-6">
                {headings.length > 0 && (
                  <div className="hidden lg:block">
                    <TableOfContents headings={headings} />
                  </div>
                )}
                <div data-trans-managed="true" data-i18n-html>
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {doctors.length > 0 && (
        <TreatmentDoctorsSection
          doctors={doctors}
          title={t(`Top Doctors for ${displayName} in India`)}
          titleI18nKey="doctors.related_doctors"
        />
      )}

      {branchCards.length > 0 && (
        <HospitalSection
          hospitals={branchCards}
          title={t(`Top Hospitals for ${displayName} in India`)}
          titleI18nKey="hospitals.related_hospitals"
          visualIndex={1}
        />
      )}

      <div data-trans-managed="true" data-i18n-html>
        <ContactModal isOpen={false} onClose={() => { }} />
      </div>

      <section className={`${DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT} ${DESIGN_TOKENS.SECTION_SPACING.PY} md:hidden block`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="md:bg-white md:rounded-xl md:p-6 md:shadow-sm md:border border-gray-100" data-trans-managed="true" data-i18n-html>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}

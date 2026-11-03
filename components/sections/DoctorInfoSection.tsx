"use client"

import { useMemo, useCallback } from "react"
import { useState } from "react"
import {
  GraduationCap,
  CheckCircle,
  Shield,
  Trophy,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import SectionHeading from "@/components/ui/SectionHeading"
import { RicosRenderer } from "@/components/RichContentViewer"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import {
  sanitizeHtml,
  extractRichTextHtml,
  isRichTextContent,
} from "@/lib/cms"
import { useI18n, useTranslatedStrings, useTranslatedRicosContent, useTranslatedHtmlString } from "@/lib/i18n"
import type { DoctorDetailClientProps } from "@/components/DoctorDetailClient"

export interface DoctorInfoSectionProps {
  doctor: DoctorDetailClientProps["doctor"]
}

export interface AccordionItem {
  label: string;
  icon: React.ReactNode;
}

export interface AccordionSection {
  id: string;
  title: string;
  titleI18nKey?: string;
  icon: React.ReactNode;
  items: AccordionItem[];
}

export interface DoctorInfoSectionProps {
  doctor: DoctorDetailClientProps["doctor"]
}

function splitRichTextLabel(
  label: string,
  icon: React.ReactNode,
): { label: string; icon: React.ReactNode }[] {
  if (!/[\n\r]+/.test(label)) return [{ label, icon }]
  return label
    .split(/[\n\r]+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((part) => ({ label: part, icon }))
}

export function DoctorInfoSection({ doctor }: DoctorInfoSectionProps) {
  const { t: tGlobal } = useI18n()

  const hasRichText = isRichTextContent(doctor.descriptionHtml)

  // ---------------------------------------------------------------------------
  // Pre-fetch all translatable strings (CMS data + static labels) for
  // flash-free, real-time translation on language change.
  // ---------------------------------------------------------------------------
  const translatableStrings = useMemo(() => {
    const strings: string[] = [
      doctor.name,
      "About",
      "Education & Qualifications",
      "Awards & Achievements",
      "Board Certified in",
      "No education & qualifications available",
      "No awards & achievements available",
    ]

    // Qualification labels (may contain newlines → split into parts)
    doctor.qualifications?.forEach((q) => {
      splitRichTextLabel(q, null).forEach((part) => {
        if (part.label) strings.push(part.label)
      })
    })
    // Award / achievement labels
    doctor.awards?.forEach((a) => {
      splitRichTextLabel(a, null).forEach((part) => {
        if (part.label) strings.push(part.label)
      })
    })
    doctor.achievements?.forEach((a) => {
      splitRichTextLabel(a, null).forEach((part) => {
        if (part.label) strings.push(part.label)
      })
    })
    // Specialties
    doctor.specialties?.forEach((s) => {
      if (s) strings.push(s)
      if (s) strings.push(`Board Certified in ${s}`)
    })

    return Array.from(new Set(strings.filter(Boolean)))
  }, [doctor.name, doctor.qualifications, doctor.awards, doctor.achievements, doctor.specialties])

  const translatedStrings = useTranslatedStrings(translatableStrings)

  const translationMap = useMemo(() => {
    const map = new Map<string, string>()
    translatableStrings.forEach((original, i) => {
      map.set(original, translatedStrings[i] ?? original)
    })
    return map
  }, [translatableStrings, translatedStrings])

  // Local translation helper with English fallback.  Falls back to the global
  // cache reader for any string not in the pre-fetched set.
  const t = useCallback(
    (text: string): string => {
      if (!text) return text
      return translationMap.get(text) || tGlobal(text)
    },
    [translationMap, tGlobal],
  )

  // ---------------------------------------------------------------------------
  // Rich content: HTML string path (non-Ricos)
  // ---------------------------------------------------------------------------
  const rawHtml = useMemo(() => {
    if (hasRichText) return ""
    if (doctor.descriptionHtml && typeof doctor.descriptionHtml === "string") {
      return extractRichTextHtml(doctor.descriptionHtml, false)
    }
    if (doctor.about) {
      return extractRichTextHtml(doctor.about, false)
    }
    return ""
  }, [doctor.descriptionHtml, doctor.about, hasRichText])

  // Translate rich HTML content in React (preserves formatting, real-time on lang change)
  const translatedHtml = useTranslatedHtmlString(rawHtml)

  const aboutContent = useMemo(() => {
    if (!translatedHtml) return null
    return { __html: sanitizeHtml(translatedHtml) }
  }, [translatedHtml])

  // Translate Ricos content (React-based, preserves node structure)
  const translatedRicosContent = useTranslatedRicosContent(
    hasRichText ? doctor.descriptionHtml : null,
  )

  // ---------------------------------------------------------------------------
  // Accordion sections (titles + item labels kept in original English so the
  // AccordionList can translate them via the passed t() and set proper
  // data-i18n-original attributes for DOM-runner cache warming).
  // ---------------------------------------------------------------------------
  const accordionSections = useMemo<AccordionSection[]>(() => {
    const sections: AccordionSection[] = [
      {
        id: "education",
        title: "Education & Qualifications",
        titleI18nKey: "doctor.education",
        icon: (
          <GraduationCap
            className="w-5 h-5 shrink-0"
            style={{ color: DESIGN_TOKENS.COLORS.PRIMARY }}
          />
        ),
        items: [
          ...(doctor.qualifications && doctor.qualifications.length > 0
            ? doctor.qualifications.flatMap((q) =>
              splitRichTextLabel(
                q,
                <GraduationCap
                  className="w-4 h-4 shrink-0"
                  style={{ color: DESIGN_TOKENS.COLORS.PRIMARY }}
                />,
              ),
            )
            : []),
          ...(doctor.specialties.length > 0
            ? [
              {
                label: `Board Certified in ${doctor.specialties[0]}`,
                icon: (
                  <Shield
                    className="w-4 h-4 shrink-0"
                    style={{ color: DESIGN_TOKENS.COLORS.PRIMARY }}
                  />
                ),
              },
            ]
            : []),
        ],
      },
      {
        id: "awards",
        title: "Awards & Achievements",
        titleI18nKey: "doctor.awards",
        icon: (
          <Trophy
            className="w-5 h-5 shrink-0"
            style={{ color: DESIGN_TOKENS.COLORS.PRIMARY }}
          />
        ),
        items: [
          ...(doctor.awards && doctor.awards.length > 0
            ? doctor.awards.flatMap((a) =>
              splitRichTextLabel(
                a,
                <CheckCircle
                  className="w-4 h-4 shrink-0"
                  style={{ color: DESIGN_TOKENS.COLORS.SECONDARY }}
                />,
              ),
            )
            : []),
          ...(doctor.achievements && doctor.achievements.length > 0
            ? doctor.achievements.flatMap((a) =>
              splitRichTextLabel(
                a,
                <CheckCircle
                  className="w-4 h-4 shrink-0"
                  style={{ color: DESIGN_TOKENS.COLORS.SECONDARY }}
                />,
              ),
            )
            : []),
        ],
      },
    ]
    return sections
  }, [
    doctor.qualifications,
    doctor.specialties,
    doctor.awards,
    doctor.achievements,
  ])

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="md:bg-white md:rounded-xl md:p-6 md:shadow-sm md:border border-gray-100">
        <h2 className="text-[28px] md:text-3xl font-medium leading-normal" data-i18n-original="About" data-trans-managed="true">
          {t("About")} {t(doctor.name)}
        </h2>

        {(hasRichText || aboutContent) && (
          <div className="mt-4">
            <div className="prose custom-list space-y-2 max-w-none text-sm md:text-lg department-description-content">
              {hasRichText && doctor.descriptionHtml ? (
                <div data-i18n-html data-trans-managed="true">
                  <RicosRenderer content={translatedRicosContent as any} />
                </div>
              ) : (
                aboutContent && (
                  <div
                    dangerouslySetInnerHTML={aboutContent}
                    data-i18n-html
                    data-trans-managed="true"
                    suppressHydrationWarning
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>

      <AccordionList sections={accordionSections} t={t} />
    </div>
  )
}

export interface AccordionListProps {
  sections: AccordionSection[]
  defaultOpenId?: string | null
  onToggle?: (id: string) => void
  activeId?: string | null
  t?: (text: string) => string
}

export function AccordionList({
  sections,
  defaultOpenId = null,
  onToggle,
  activeId: controlledActiveId,
  t: tProp,
}: AccordionListProps) {
  const [internalActiveId, setInternalActiveId] = useState<string | null>(
    defaultOpenId,
  )

  const { t: tGlobal } = useI18n()

  // Use the parent-provided t (pre-fetched) or fall back to global t
  const t = useCallback(
    (text: string): string => {
      if (!text) return text
      return tProp ? tProp(text) : tGlobal(text)
    },
    [tProp, tGlobal],
  )

  const activeId = controlledActiveId ?? internalActiveId

  const handleToggle = (id: string) => {
    const next = activeId === id ? null : id
    if (controlledActiveId === undefined) {
      setInternalActiveId(next)
    }
    onToggle?.(id)
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const isOpen = activeId === section.id
        const hasItems = section.items.length > 0
        const translatedTitle = t(section.title)
        const emptyOriginal =
          section.id === "education"
            ? "No education & qualifications available"
            : "No awards & achievements available"
        const emptyMessage = t(emptyOriginal)

        return (
          <div
            key={section.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow duration-300 hover:shadow-md"
          >
            <button
              onClick={() => handleToggle(section.id)}
              className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3">
                <span className="shrink-0 text-[#29A9B9]">{section.icon}</span>
                <h2 className="md:text-2xl text-base text-normal md:font-medium text-gray-900" data-i18n={section.titleI18nKey} data-i18n-original={section.title} data-trans-managed="true">
                  {translatedTitle}
                </h2>
              </div>
              <span
                className={`shrink-0 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              >
                {isOpen ? (
                  <ChevronUp className="w-7 h-7" />
                ) : (
                  <ChevronDown className="w-7 h-7" />
                )}
              </span>
            </button>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-200 opacity-100" : "max-h-0 opacity-0"}`}
            >
              <div
                className={`px-6 pb-6 ${isOpen ? "pt-4" : "pt-0"}`}
              >
                {hasItems ? (
                  <div className="space-y-3">
                    {section.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-all duration-200"
                      >
                        <span className="shrink-0 mt-0.5 text-[#29A9B9]">
                          {item.icon}
                        </span>
                        <span className="text-base text-gray-900 leading-relaxed" data-i18n-original={item.label} data-trans-managed="true">
                          {t(item.label)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4 text-base" data-i18n-original={emptyOriginal} data-trans-managed="true">
                    {emptyMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

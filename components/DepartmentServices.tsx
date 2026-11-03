"use client";

import { useMemo, useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stethoscope, CircleCheckBig } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import SearchDropdown from "@/components/ui/SearchDropdown";
import MarqueeHeading from "@/components/ui/MarqueeHeading";
import HomepageCarousel from "@/components/ui/HomepageCarousel";
import { Button } from "@/components/ui/button";
import { generateSlug } from "@/lib/slug-utils";
import { Trans } from "@/lib/i18n/Trans"
import { useTranslatedStrings } from "@/lib/i18n";
import {
  DESIGN_TOKENS,
  getAlternatingBackground,
  SECTION_INDEX,
} from "@/components/design-tokens";

/** Card-level data shape rendered by the department carousel */
export interface DepartmentCardData {
  _id: string;
  departmentName: string;
  departmentSlug: string;
  departmentImage: string;
  treatmentCount: number;
  allTreatments: TreatmentCardData[];
  displayTreatments: TreatmentCardData[];
  remainingCount: number;
}

/** Treatment data consumed by the card list */
export interface TreatmentCardData {
  _id: string;
  name: string;
  slug: string;
  image?: string | null;
}

/** Unified search option emitted for both departments and treatments */
export interface SearchOption {
  id: string;
  name: string;
  slug: string;
  type: "department" | "treatment";
  departmentId?: string;
  departmentName?: string;
}

interface DepartmentServicesProps {
  departmentCards: DepartmentCardData[];
  searchOptions: SearchOption[];
  error?: string | null;
  searchInputValue?: string;
  onSearchChange?: (value: string) => void;
}

export default function DepartmentServices({
  departmentCards,
  searchOptions,
  error: propError,
}: DepartmentServicesProps) {
  const router = useRouter()
  const error = propError
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const translatableContentStrings = useMemo(() => {
    const strings: string[] = [];
    const seen = new Set<string>();
    for (const dept of departmentCards) {
      if (dept.departmentName && !seen.has(dept.departmentName)) {
        seen.add(dept.departmentName);
        strings.push(dept.departmentName);
      }
      for (const treatment of dept.displayTreatments) {
        if (treatment.name && !seen.has(treatment.name)) {
          seen.add(treatment.name);
          strings.push(treatment.name);
        }
      }
    }
    return strings;
  }, [departmentCards]);

  const translatedContentStrings = useTranslatedStrings(translatableContentStrings);

  const contentTranslationMap = useMemo(() => {
    const map = new Map<string, string>();
    translatableContentStrings.forEach((original, i) => {
      map.set(original, translatedContentStrings[i] ?? original);
    });
    return map;
  }, [translatableContentStrings, translatedContentStrings]);

  const t = useCallback((text: string): string => {
    if (!text) return text;
    return contentTranslationMap.get(text) || text;
  }, [contentTranslationMap]);

  const handleSelect = useCallback(
    (id: string) => {
      const option = searchOptions.find((opt) => opt.id === id);
      if (option) {
        const path =
          option.type === "department"
            ? "/department/" + option.slug
            : "/treatment/" + option.slug;
        router.push(path);
      }
    },
    [searchOptions, router],
  );

  if (error) {
    return (
      <section
        className={`${getAlternatingBackground(SECTION_INDEX.DEPARTMENT_SERVICES)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}
      >
        <div
          className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} text-center max-w-2xl mx-auto`}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-amber-50 rounded-full mb-4 md:mb-6">
            <Stethoscope className="h-8 w-8 md:h-10 md:w-10 text-amber-600" />
          </div>
<SectionHeading title="Popular Treatments" align="center" />
           <p className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE} mb-6`} data-i18n-original={error}>
             {error}
           </p>
           <button
             onClick={() => window.location.reload()}
             className={`${DESIGN_TOKENS.COMPONENT.BUTTON.PRIMARY.replace('inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2', '')} bg-[#E22026] hover:bg-[#c01b21] focus:ring-[#E22026]/50`}
             data-i18n="department.try-again"
             data-i18n-original="Try Again"
           >
             <Trans id="department.try-again">Try Again</Trans>
           </button>
        </div>
      </section>
    );
  }

  if (!departmentCards || departmentCards.length === 0) {
    return (
      <section
        className={`${getAlternatingBackground(SECTION_INDEX.DEPARTMENT_SERVICES)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}
      >
        <div
          className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} text-center max-w-2xl mx-auto`}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-amber-50 rounded-full mb-4 md:mb-6">
            <Stethoscope className="h-8 w-8 md:h-10 md:w-10 text-amber-600" />
          </div>
<SectionHeading title="Popular Treatments" align="center" />
           <p className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE}`} data-i18n="department.no-departments" data-i18n-original="No departments available at the moment.">
             <Trans id="department.no-departments">No departments available at the moment.</Trans>
           </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${getAlternatingBackground(SECTION_INDEX.DEPARTMENT_SERVICES)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}
    >
      <div
        className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-6">
          <SectionHeading title="Top Medical Treatments in India" className="!mb-0" />
          <div className="relative w-full md:w-[340px]">
            <SearchDropdown
              value=""
              onChange={() => {}}
              placeholder="Search Treatments"
              options={searchOptions}
              onOptionSelect={handleSelect}
              onClear={() => {}}
              type="treatment"
              maxHeight={400}
              showAllOnFocus={false}
              data-i18n="search.treatments"
              data-i18n-original="Search Treatments"
            />
          </div>
        </div>
        <div>
          <HomepageCarousel
            autoplay
          >
            {departmentCards.map((department, index) => (
              <div key={department._id || index}>
                <div
                  className="group bg-white border border-gray-200 rounded-md overflow-hidden flex flex-col h-full min-h-[280px] md:min-h-[320px] hover:shadow-lg hover:border-gray-300 transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    const slug = department.departmentSlug?.trim();
                    if (slug) router.push("/department/" + slug);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      const slug = department.departmentSlug?.trim();
                      if (slug) router.push("/department/" + slug);
                    }
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-50">
                    <Image
                      src={department.departmentImage}
alt={t(department.departmentName)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading={index < 6 ? "eager" : "lazy"}
                      width={400}
                      height={320}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.dataset.fallbackAttempted) {
                          target.dataset.fallbackAttempted = "true";
                          target.src = "/placeholder.svg";
                        }
                      }}
                    />
                  </div>
                  <div className="p-4 md:p-5 pb-3 mb:pb-3 flex flex-col flex-1">
                   <h3 className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_TITLE} mb-2 transition-colors`} data-i18n-original={department.departmentName} data-trans-managed="true">
                      <MarqueeHeading
                        isHovered={hoveredIndex === index}
                        className="w-full"
                      >
<Trans id="department.name">{department.departmentName}</Trans>
                      </MarqueeHeading>
                    </h3>
                    <div className="mt-auto">
                      {department.displayTreatments.length > 0 ? (
                        <ul className="space-y-1.5">
                          {department.displayTreatments.map(
                            (treatment, tIndex) => (
                              <li
                                key={treatment._id || tIndex}
                                className="flex items-start"
                              >
                                <CircleCheckBig className={`w-4 h-4 ${DESIGN_TOKENS.TYPOGRAPHY.SECONDARY} mr-2 mt-0.5 flex-shrink-0`} />
<Link
                                   href={
                                     "/treatment/" + (treatment.slug || generateSlug(treatment.name))
                                   }
                                   className={` ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} line-clamp-1 hover:text-[#29A9B9] transition-colors`}
                                   onClick={(e) => e.stopPropagation()}
                                   data-i18n-original={treatment.name}
                                 >
                                   {t(treatment.name)}
                                 </Link>
                              </li>
                            ),
                          )}
                        </ul>
                      ) : (
<div className="text-sm text-gray-500 italic" data-i18n="department.view-details" data-i18n-original="View department for details">
                          <Trans id="department.view-details">View department for details</Trans>
                        </div>
                      )}
                    </div>
                  </div>
                  <footer className="p-4 mt-auto pt-2 md:pt-0">
                    <Button variant="primary" fullWidth onClick={(e: React.MouseEvent) => { e.stopPropagation(); router.push("/department/" + department.departmentSlug); }}>
<Trans id="department.view-more-treatments">{`View +${department.treatmentCount} More Treatments`}</Trans>
                    </Button>
                  </footer>
                </div>
              </div>
            ))}
          </HomepageCarousel>
        </div>
      </div>
    </section>
  );
}

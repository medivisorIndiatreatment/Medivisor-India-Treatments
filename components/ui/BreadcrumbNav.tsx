"use client";

import type { ReactNode } from "react";
import { Fragment, useCallback, useMemo } from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { useTranslatedStrings, useI18n } from "@/lib/i18n";


export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbNavProps {
  /** Breadcrumb items - will show ellipsis on mobile after 3 items */
  items: BreadcrumbItem[];
  /** Additional CSS classes */
  className?: string;
  /** Show home link at the start */
  showHome?: boolean;
  /** Custom home label */
  homeLabel?: string;
  /** Custom home href */
  homeHref?: string;
}

/**
 * Unified Breadcrumb Navigation Component
 * - Shows ellipsis (...) on mobile after 3 items
 * - Fully responsive
 * - Works for hospital, treatment, and doctor pages
 */
export default function BreadcrumbNav({
  items,
  className = "",
  showHome = true,
  homeLabel = "Home",
  homeHref = "/",
}: BreadcrumbNavProps) {
const { t: tGlobal } = useI18n()

  const translatableStrings = useMemo(() => {
    const strings: string[] = ["Home", "..."]
    items.forEach((item) => {
      if (item.label) strings.push(item.label)
    })
    return Array.from(new Set(strings.filter(Boolean)))
  }, [items])

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
  const shouldShowEllipsis = items.length > 3;

  const renderItems = () => {
    if (!shouldShowEllipsis) {
      return items.map((item, index) => (
        <Fragment key={item.label}>
<BreadcrumbLinkItem item={item} isLast={index === items.length - 1} t={t} />
          {index < items.length - 1 && <BreadcrumbSeparator />}
        </Fragment>
      ));
    }

    // Mobile view with ellipsis
    return (
      <>
<BreadcrumbLinkItem item={items[0]} isLast={false} t={t} />

     <span className="text-gray-400 px-1" data-i18n="breadcrumb.ellipsis" data-i18n-original="..." data-trans-managed="true">
      {t("...")}</span>
        <BreadcrumbSeparator />
        <BreadcrumbLinkItem item={items[items.length - 2]} isLast={false} t={t} />
        <BreadcrumbSeparator />
        <BreadcrumbLinkItem item={items[items.length - 1]} isLast={true} t={t} />
      </>
    );
  };

  return (
    <nav
      className={`bg-gray-100 border-b border-gray-100 `}
      aria-label="Breadcrumb"
    >
      <div className="container mx-auto px-4 md:px-6">
        <ol className="flex items-center gap-1 md:gap-2 py-2 text-sm md:text-base text-gray-700 overflow-x-auto whitespace-nowrap">
          {showHome && (
            <>
<li className="flex items-center">
                 <Link
                   href={homeHref}
                   className="flex items-center gap-1 hover:text-gray-800 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-400/50 rounded"
                 >
                   <Home className="w-4 h-4" />
                    {t("Home")}
                 </Link>
               </li>
              <BreadcrumbSeparator />
            </>
          )}
          {renderItems()}
        </ol>
      </div>
    </nav>
  );
}

/** Individual breadcrumb link item */
function BreadcrumbLinkItem({ item, isLast, t }: { item: BreadcrumbItem; isLast: boolean; t: (text: string) => string }) {
  const translatedLabel = t(item.label || "")

  const content = (
    <span className={isLast ? "text-gray-700 font-medium" : "hover:text-gray-700"} data-i18n-original={item.label} data-trans-managed="true">
      {translatedLabel}
    </span>
  );

  return (
    <li className="flex items-center">
      {item.href && !isLast ? (
        <Link
          href={item.href}
          className="hover:text-gray-800 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-400/50 rounded"
        >
{translatedLabel}
        </Link>
      ) : (
        content
      )}
    </li>
  );
}

/** Breadcrumb separator */
function BreadcrumbSeparator() {
  return (
    <li className="flex items-center text-gray-700" aria-hidden="true">
      <ChevronRight className="w-4 h-4" />
    </li>
  );
}

// =============================================================================
// Convenience components for specific page types
// =============================================================================

/**
 * Hospital Breadcrumb - for hospital detail pages
 */
export function HospitalBreadcrumb({
  hospitalName,
  branchName,
  hospitalSlug,
}: {
  hospitalName: string;
  branchName?: string;
  hospitalSlug: string;
}) {
  const items: BreadcrumbItem[] = [
    { label: "Hospitals", href: "/" },
  ];

  if (hospitalName) {
    items.push({
      label: hospitalName,
      href: `/hospital-branches/${hospitalSlug}`,
    });
  }

  if (branchName && branchName !== hospitalName) {
    items.push({ label: branchName });
  }

  return <BreadcrumbNav items={items} showHome={true} />;
}

/**
 * Treatment Breadcrumb - for treatment detail pages
 */
export function TreatmentBreadcrumb({
  treatmentName,
}: {
  treatmentName: string;
}) {
  const items: BreadcrumbItem[] = [
    { label: "Treatments", href: "/" },
    { label: treatmentName },
  ];

  return <BreadcrumbNav items={items} showHome={true} />;
}

/**
 * Doctor Breadcrumb - for doctor detail pages
 */
export function DoctorBreadcrumb({
  doctorName,
  specialization,
}: {
  doctorName: string;
  specialization?: string;
}) {
  const items: BreadcrumbItem[] = [
    { label: "Doctors", href: "/doctors" },
  ];

  if (specialization) {
    items.push({ label: specialization });
  }

  items.push({ label: doctorName });

  return <BreadcrumbNav items={items} showHome={true} />;
}

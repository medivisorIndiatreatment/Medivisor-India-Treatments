"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import BreadcrumbNav from "@/components/ui/BreadcrumbNav";
import ContactForm from "@/components/ContactForm";
import DoctorHeroBanner from "@/components/DoctorHeroBanner";
import { DESIGN_TOKENS, getAlternatingBackground } from "@/components/design-tokens";
import { generateSlug } from "@/lib/slug-utils";
import { getCardImageUrl } from "@/lib/utils/card-utils";
import type { HospitalData } from "@/lib/cms";
import type { DoctorCardData } from "@/components/cards/types";
import type { TransformedDoctor } from "@/app/doctors/[slug]/doctor-page-helpers";

import { useI18n, useTranslatedStrings } from "@/lib/i18n";
import { useSearchableItems } from "@/hooks/useSearchableItems";
import { DoctorInfoSection } from "@/components/sections/DoctorInfoSection";
import { DoctorHospitalsSection } from "@/components/sections/DoctorHospitalsSection";
import {
  SearchableCarouselSection,
  DoctorCarouselItem,
  type TreatmentCardItem,
  type DoctorCardItem,
} from "@/components/sections/DoctorCarouselSection";
import TreatmentCard from "@/components/cards/TreatmentCard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DoctorDetailClientProps {
  doctor: TransformedDoctor
  hospitals: HospitalData[]
  matchedHospital?: HospitalData | null
  relatedDoctors?: DoctorCardData[]
  relatedTreatments?: any[]
  allDoctorCards?: DoctorCardData[]
  allTreatments?: any[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMappedBranches(
  doctor: TransformedDoctor,
  hospitals: HospitalData[],
): { branch: any; hospitalName: string }[] {
  const mappedBranches: { branch: any; hospitalName: string }[] = [];

  hospitals.forEach((hospital) => {
    if (!hospital.branches) return;

    hospital.branches.forEach((branch) => {
      const isMapped =
        branch._id === doctor.branchId ||
        branch.branchName === doctor.branchName ||
        (branch.doctors &&
          branch.doctors.some((d: any) => d._id === doctor.id));

      if (isMapped) {
        const exists = mappedBranches.some(
          (item) => item.branch._id === branch._id,
        );
        if (!exists) {
          mappedBranches.push({ branch, hospitalName: hospital.hospitalName });
        }
      }
    });
  });

  return mappedBranches;
}

function mapRelatedTreatments(treatments: any[], t: (text: string) => string): TreatmentCardItem[] {
  const treatmentFallback = t("Treatment")
  return treatments
    .map((t_item) => {
      const rawImage = [t_item.treatmentImageUrl, t_item.treatmentImage, t_item.image].find(
        (value) => typeof value === "string" && value.length > 0,
      );
      const imageUrl = getCardImageUrl(rawImage) || "";

const name = t_item.name || treatmentFallback;

      return {
        _id: t_item._id,
        name,
        slug: t_item.slug || generateSlug(t_item.name || ""),
        image: imageUrl,
        treatmentImage: imageUrl || undefined,
        cost: t_item.cost || undefined,
        description: t_item.description || "",
      };
    })
    .filter((t_item) => t_item.name && t_item.name !== treatmentFallback);
}

function mapToDoctorCardItem(d: DoctorCardData): DoctorCardItem {
  const normalizeSpecs = (spec: DoctorCardData["specialization"]): string[] => {
    if (!spec) return []
    if (typeof spec === "string") return [spec]
    if (Array.isArray(spec)) {
      return spec
        .map((s) => (typeof s === "string" ? s : (s && typeof s.name === "string" ? s.name : "")))
        .filter(Boolean)
    }
    return []
  }

  // Branch name is already resolved upstream (page-loader / processDoctorToCard)
  // and carried on the card. Keep this local resolution as a defensive fallback
  // so the card never receives an empty branch value.
  const resolvedBranchName =
    d.branchName ||
    (d.branchId && d.branchInfo?.find((b) => b.branchId === d.branchId)?.branchName) ||
    d.branchInfo?.[0]?.branchName ||
    undefined

  const resolvedHospitalName = d.hospitalName || d.branchInfo?.[0]?.hospitalName || undefined
  const resolvedHospitalId = d.hospitalId || d.branchInfo?.[0]?.hospitalId || undefined
  const resolvedHospitalSlug = d.hospitalSlug || (resolvedHospitalName ? generateSlug(resolvedHospitalName) : '')
  const resolvedHospitalLinkType = d.hospitalLinkType || (resolvedHospitalId ? 'hospital-branches' : undefined)
  const resolvedHospitalLogo = d.hospitalLogo ?? undefined

  return {
    _id: d._id,
    doctorName: d.doctorName || "",
    name: d.doctorName || "",
    specialization: normalizeSpecs(d.specialization),
    department: d.department || undefined,
    qualification: d.qualification ?? undefined,
    designation: d.designation ?? undefined,
    experienceYears: d.experienceYears ?? undefined,
    profileImage: d.profileImage,
    profileImageUrl: d.profileImageUrl ?? undefined,
    city: d.city,
    hospitalName: resolvedHospitalName,
    hospitalId: resolvedHospitalId,
    hospitalSlug: resolvedHospitalSlug,
    hospitalLinkType: resolvedHospitalLinkType,
    hospitalLogo: resolvedHospitalLogo,
    branchName: resolvedBranchName,
    branchId: d.branchId || undefined,
    branchInfo: d.branchInfo,
    slug: d.slug || generateSlug(d.doctorName || d.name || ""),
    popular: d.popular,
  }
}

type RelatedDoctorContext = {
  id: string;
  specialties: string[];
  department?: string[];
  hospitalId?: string;
  hospitalName?: string;
  branchId?: string;
  branchName?: string;
};

function normalizeSpecNames(spec: DoctorCardData["specialization"]): string[] {
  if (!spec) return [];
  if (typeof spec === "string") return [spec];
  if (Array.isArray(spec)) {
    return spec
      .map((s) => (typeof s === "string" ? s : (s && typeof s.name === "string" ? s.name : "")))
      .filter(Boolean);
  }
  return [];
}

function getRelatedSpecialists(
  allDoctors: DoctorCardData[],
  current: RelatedDoctorContext,
  relatedDoctors: DoctorCardData[],
  limit?: number,
): DoctorCardItem[] {
  const sourceDoctors = Array.isArray(allDoctors) ? allDoctors : [];

  const currentSpecs = new Set(
    (current.specialties || []).map((s) => s.toLowerCase().trim()).filter(Boolean),
  );
  const currentDepts = new Set(
    (current.department || []).map((s) => s.toLowerCase().trim()).filter(Boolean),
  );
  const currentHospitalId = current.hospitalId || "";
  const currentHospitalName = (current.hospitalName || "").toLowerCase().trim();
  const currentBranchId = current.branchId || "";
  const currentBranchName = (current.branchName || "").toLowerCase().trim();

  const seen = new Set<string>();
  const scored = sourceDoctors
    .filter((d) => d._id && d._id !== current.id)
    .map((d) => {
      let score = 0;

      const specs = normalizeSpecNames(d.specialization).map((s) => s.toLowerCase().trim());
      for (const spec of specs) {
        if (currentSpecs.has(spec)) score += 3;
      }

      if (currentDepts.size) {
        const depts = (d.department || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
        for (const dep of depts) {
          if (currentDepts.has(dep)) score += 3;
        }
      }

      if (currentHospitalId && d.hospitalId && d.hospitalId === currentHospitalId) {
        score += 1;
      } else if (
        currentHospitalName &&
        d.hospitalName &&
        d.hospitalName.toLowerCase().trim() === currentHospitalName
      ) {
        score += 1;
      }

      const doctorBranchName = (d.branchName || "").toLowerCase().trim();
      if (currentBranchId && d.branchId && d.branchId === currentBranchId) {
        score += 2;
      } else if (currentBranchName) {
        const branchMatches =
          doctorBranchName === currentBranchName ||
          (d.branchInfo || []).some(
            (b) => (b.branchName || "").toLowerCase().trim() === currentBranchName,
          );
        if (branchMatches) score += 2;
      }

      return { d, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const nameA = (a.d.doctorName || "").toLowerCase();
      const nameB = (b.d.doctorName || "").toLowerCase();
      return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    })
    .filter((item) => {
      if (seen.has(item.d._id)) return false;
      seen.add(item.d._id);
      return true;
    });

  const result = (typeof limit === "number" ? scored.slice(0, limit) : scored).map(
    (item) => mapToDoctorCardItem(item.d),
  );
  if (result.length > 0) return result;

  const fallbackSource = Array.isArray(relatedDoctors) ? relatedDoctors : [];
  return fallbackSource
    .filter((d) => d._id && d._id !== current.id)
    .map(mapToDoctorCardItem);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DoctorDetailClient({
  doctor,
  hospitals,
  relatedDoctors = [],
  relatedTreatments = [],
  allDoctorCards = [],
  allTreatments = [],
}: DoctorDetailClientProps) {
  const { t: tGlobal } = useI18n()
  const router = useRouter();
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [hoveredTreatmentId, setHoveredTreatmentId] = useState<string | null>(null);
  const [hoveredRelatedDoctorIndex, setHoveredRelatedDoctorIndex] = useState<number | null>(null);
  const [hoveredBranchIndex, setHoveredBranchIndex] = useState<number | null>(null);

  // ---------------------------------------------------------------------------
  // Pre-fetch all translatable CMS strings + static labels in one batch for
  // flash-free, real-time translation.  Child components independently
  // pre-fetch their own CMS data (fetchTranslations deduplicates by language).
  // ---------------------------------------------------------------------------
   const translatableStrings = useMemo(() => {
     const strings: string[] = [
       doctor.name,
       "Doctors",
       "Related Treatments",
       "Related Specialists",
     ]
    doctor.specialties?.forEach((s) => {
      if (s) strings.push(s)
    })
    return Array.from(new Set(strings.filter(Boolean)))
  }, [doctor.name, doctor.specialties])

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
  // Derived data
  // ---------------------------------------------------------------------------
   const mappedBranches = useMemo(
    () => getMappedBranches(doctor, hospitals),
    [doctor, hospitals],
  );

  const allBranchNames = useMemo(() => {
    const names = mappedBranches
      .map((mb) => mb.branch?.branchName)
      .filter(Boolean)
      .map((b: string) => b.replace(/\s+/g, " ").trim()) as string[]
    const source = names.length > 0 ? names : (doctor.branchName ? doctor.branchName.split(',').map((b) => b.replace(/\s+/g, " ").trim()).filter(Boolean) : [])
    const seen = new Set<string>()
    return source.filter((b) => {
      const key = b.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [mappedBranches, doctor.branchName])

  const mappedTreatments = useMemo(
() => mapRelatedTreatments(relatedTreatments, t),
    [relatedTreatments, t],
  );
  const allMappedTreatments = useMemo(
    () => mapRelatedTreatments(allTreatments, t),
    [allTreatments, t],
  );

  const relatedDoctorsList = useMemo(
    () =>
      getRelatedSpecialists(
        allDoctorCards,
        {
          id: doctor.id,
          specialties: doctor.specialties,
          department: doctor.department,
          hospitalId: doctor.hospitalId,
          hospitalName: doctor.hospitalName,
          branchId: doctor.branchId,
          branchName: doctor.branchName,
        },
        relatedDoctors,
      ),
    [allDoctorCards, doctor, relatedDoctors],
  );

  const relatedDoctorsTitle = useMemo(() => {
if (!doctor.specialties?.length) return t("Related Specialists")
    const firstSpec = t(doctor.specialties[0])
    return firstSpec
      ? firstSpec.charAt(0).toUpperCase() + firstSpec.slice(1)
      : t("Related Specialists")
  }, [doctor.specialties, t])

  const allDoctorsMapped = useMemo(() => {
    const sourceDoctors =
      allDoctorCards.length > 0 ? allDoctorCards : relatedDoctors;
    if (!Array.isArray(sourceDoctors) || sourceDoctors.length === 0) return [];
    const seenIds = new Set<string>();
    return sourceDoctors.filter((d) => {
      if (!d._id || seenIds.has(d._id)) return false;
      seenIds.add(d._id);
      return true;
    });
  }, [allDoctorCards, relatedDoctors]);

  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------
  const treatmentSearch = useSearchableItems<TreatmentCardItem>({
    items: allMappedTreatments,
    searchFields: (item) => [item.name, item.description],
  });

  const doctorSearch = useSearchableItems<DoctorCardItem>({
    items: allDoctorsMapped.map(mapToDoctorCardItem),
    customSearchFn: (item, term) => {
      const doctorName = (item.doctorName || item.name || "").toLowerCase();
      if (doctorName.includes(term)) return true;

      if (item.specialization) {
        if (Array.isArray(item.specialization)) {
          const specMatch = item.specialization.some((spec: any) => {
            const name = typeof spec === "object" ? spec?.name : String(spec);
            return name?.toLowerCase().includes(term);
          });
          if (specMatch) return true;
        } else if (typeof item.specialization === "string") {
          if ((item.specialization as string).toLowerCase().includes(term)) {
            return true;
          }
        }
      }

      const fieldsToSearch = [
        item.qualification,
        item.designation,
        item.hospitalName,
        item.branchName,
        item.city,
      ];
      return fieldsToSearch.some(
        (field) => field != null && String(field).toLowerCase().includes(term),
      );
    },
  });

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleTreatmentSelect = useCallback(
    (id: string) => {
      const selectedTreatment = allMappedTreatments.find((t) => t._id === id);
      if (selectedTreatment) {
        router.push(
          `/treatment/${selectedTreatment.slug || generateSlug(selectedTreatment.name || "")}`,
        );
        treatmentSearch.clearSearch();
      }
    },
    [allMappedTreatments, router, treatmentSearch],
  );

  const handleDoctorSelect = useCallback(
    (id: string) => {
      const selectedDoctor = doctorSearch.filteredItems.find((d) => d._id === id);
      if (selectedDoctor) {
        doctorSearch.clearSearch();
        router.push(`/doctors/${selectedDoctor.slug}`);
      }
    },
    [doctorSearch, router],
  );

  const toggleAccordion = useCallback((section: string) => {
    setActiveAccordion((prev) => (prev === section ? null : section));
  }, []);

  // ---------------------------------------------------------------------------
  // Display data
  // ---------------------------------------------------------------------------
  const displayTreatments = treatmentSearch.debouncedSearch
    ? treatmentSearch.filteredItems
    : mappedTreatments;

  const displayDoctors = doctorSearch.debouncedSearch
    ? doctorSearch.filteredItems
    : relatedDoctorsList;

  // ---------------------------------------------------------------------------
  // Breadcrumb
  // ---------------------------------------------------------------------------
const breadcrumbItems = [
     { label: "Doctors", href: "/search/?view=doctors" },
     { label: doctor.name, href: "#" },
   ];

  return (
    <div className="bg-white min-h-screen">
       <DoctorHeroBanner
        name={doctor.name}
        nameI18nKey={doctor.name}
        title={doctor.title}
        titleI18nKey={doctor.title}
        designation={doctor.designation}
        designationI18nKey={doctor.designation}
        image={doctor.doctorImage || doctor.image}
        qualification={doctor.qualification}
        specialties={doctor.specialties}
        experienceYears={doctor.experienceYears}
        rating={doctor.rating}
        reviewCount={doctor.reviewCount}
        languages={doctor.languages}
        hospitalName={doctor.hospitalName}
        branchName={doctor.branchName}
        city={doctor.city}
         hospitalBranches={allBranchNames}
       />

      <BreadcrumbNav items={breadcrumbItems} />

      <section
        className={`${DESIGN_TOKENS.SECTION_SPACING.PY} ${getAlternatingBackground(0)}`}
      >
        <div
          className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}
        >
           <div className="md:grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
              <div className="lg:col-span-3 space-y-6 md:space-y-8">
                <DoctorInfoSection doctor={doctor} />

               {hospitals && hospitals.length > 0 && (
                 <DoctorHospitalsSection
                   visualIndex={0}
                   hospitals={hospitals}
                   doctor={doctor}
                   hoveredBranchIndex={hoveredBranchIndex}
                   onHoverBranch={setHoveredBranchIndex}
                 />
               )}
             </div>

             <div className="lg:col-span-1">
               <div className="sticky md:block hidden top-24">
                 <ContactForm />
               </div>
             </div>
           </div>
         </div>
       </section>

{mappedTreatments.length > 0 && (
          <SearchableCarouselSection
            visualIndex={1}
             title={t("Related Treatments")}
             titleI18nKey="doctors.related_treatments"
             searchValue={treatmentSearch.searchValue}
             onSearchChange={treatmentSearch.setSearchValue}
             onSearchClear={treatmentSearch.clearSearch}
             searchPlaceholder="Search treatments"
            searchPlaceholderI18nKey="search.treatments"
            searchType="treatment"
            items={mappedTreatments}
            filteredItems={displayTreatments}
            searchOptions={treatmentSearch.searchOptions}
            onOptionSelect={handleTreatmentSelect}
            renderItem={(treatment, index) => (
              <TreatmentCard
                key={treatment._id}
                treatment={treatment}
                index={index}
                hoveredIndex={hoveredTreatmentId === treatment._id ? index : null}
                onHover={(idx) =>
                  setHoveredTreatmentId(idx === null ? null : treatment._id)
                }
                showDescription
                showCost
              />
            )}
            virtualize
          />
        )}

        {relatedDoctorsList.length > 0 && (
          <SearchableCarouselSection
            visualIndex={2}
             title={t("Related Specialists")}
             titleI18nKey="doctors.related_specialists"
             searchValue={doctorSearch.searchValue}
             onSearchChange={doctorSearch.setSearchValue}
             onSearchClear={doctorSearch.clearSearch}
             searchPlaceholder="Search doctors"
            searchPlaceholderI18nKey="search.doctors"
            searchType="doctor"
            items={relatedDoctorsList}
            filteredItems={displayDoctors}
            searchOptions={doctorSearch.searchOptions}
            onOptionSelect={handleDoctorSelect}
            renderItem={(doctorData, index) => (
              <DoctorCarouselItem
                key={doctorData._id}
                doctor={doctorData}
                index={index}
                hoveredIndex={hoveredRelatedDoctorIndex}
                onHover={setHoveredRelatedDoctorIndex}
              />
            )}
            virtualize
          />
        )}

      <section
        className={`py-8 md:py-10 block md:hidden ${getAlternatingBackground(1)}`}
      >
        <div
          className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}
        >
          <div className="md:bg-white md:rounded-xl md:p-6 md:shadow-sm md:border border-gray-100">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}

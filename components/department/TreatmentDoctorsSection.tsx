"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import SectionHeading from "@/components/ui/SectionHeading";
import HomepageCarousel from "@/components/ui/HomepageCarousel";
import SearchDropdown from "@/components/ui/SearchDropdown";
import DoctorCard from "@/components/cards/DoctorCard";
import { DESIGN_TOKENS, SECTION_INDEX, getAlternatingBackground } from "@/components/design-tokens";
import type { DoctorCardData } from "@/components/cards/types";
import type { DoctorData } from "@/lib/cms/types";
import { buildHospitalLookupMaps } from "@/lib/utils/doctor-utils";
import { transformDoctor } from "@/lib/services/homepage/transformers";

interface TreatmentDoctorsSectionProps {
  doctors: DoctorCardData[] | DoctorData[]
  allDoctors?: DoctorData[]
  title?: string
  titleI18nKey?: string
  hospitals?: any[]
  showSearch?: boolean
}

export default function TreatmentDoctorsSection({
  doctors,
  allDoctors,
  title = "Related Doctors",
  titleI18nKey,
  hospitals = [],
  showSearch = true,
}: TreatmentDoctorsSectionProps) {
  const router = useRouter();
  const [searchInputValue, setSearchInputValue] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInputValue);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchInputValue]);

  // Build lookup maps ONCE from hospitals for hospital resolution
  const { hospitalLookup, hospitalNameLookup, branchToHospitalMap } = useMemo(
    () => buildHospitalLookupMaps(Array.isArray(hospitals) ? hospitals : []),
    [hospitals]
  );

  // Build hospital logo map
  const hospitalLogoMap = useMemo(() => {
    const logoMap: Record<string, string | null> = {};
    if (Array.isArray(hospitals) && hospitals.length) {
      hospitals.forEach((h) => {
        if (h._id) {
          logoMap[h._id] = h.logoUrl || h.logo || null;
        }
      });
    }
    return logoMap;
  }, [hospitals]);

  // Process doctors for carousel display
  const mappedDoctors = useMemo(() => {
    if (!Array.isArray(doctors) || doctors.length === 0) return [];

    const seenIds = new Set<string>();
    const uniqueDoctors = doctors.filter((doctor) => {
      if (!doctor._id || seenIds.has(doctor._id)) return false;
      seenIds.add(doctor._id);
      return true;
    });

    if (!Array.isArray(hospitals) || hospitals.length === 0) {
      return uniqueDoctors
    }

    return uniqueDoctors.map((doctor) =>
      transformDoctor(doctor, hospitalLogoMap, hospitals, {
        showHospital: true,
        hospitalLookup,
        hospitalNameLookup,
        branchToHospitalMap,
      })
    );
  }, [doctors, hospitals, hospitalLogoMap, hospitalLookup, hospitalNameLookup, branchToHospitalMap]);

  // Process all doctors for search dropdown only
  const allDoctorsMapped = useMemo(() => {
    const sourceDoctors = allDoctors && allDoctors.length > 0 ? allDoctors : doctors;
    if (!Array.isArray(sourceDoctors) || sourceDoctors.length === 0) return [];

    const seenIds = new Set<string>();
    const uniqueDoctors = sourceDoctors.filter((doctor) => {
      if (!doctor._id || seenIds.has(doctor._id)) return false;
      seenIds.add(doctor._id);
      return true;
    });

    if (!Array.isArray(hospitals) || hospitals.length === 0) {
      return uniqueDoctors
    }

    return uniqueDoctors.map((doctor) =>
      transformDoctor(doctor, hospitalLogoMap, hospitals, {
        showHospital: true,
        hospitalLookup,
        hospitalNameLookup,
        branchToHospitalMap,
      })
    );
  }, [allDoctors, doctors, hospitals, hospitalLogoMap, hospitalLookup, hospitalNameLookup, branchToHospitalMap]);

  // Filter doctors based on search term
  const filteredDoctors = useMemo(() => {
    if (!debouncedSearchTerm) return mappedDoctors;
    
    const term = debouncedSearchTerm.toLowerCase();
    return allDoctorsMapped.filter((doctor) => {
      const doctorName = (doctor.doctorName || doctor.name || "").toLowerCase();
      if (doctorName.includes(term)) return true;

      if (doctor.specialization) {
        if (Array.isArray(doctor.specialization)) {
          const specMatch = doctor.specialization.some((spec) => {
            const name = typeof spec === 'object' ? spec?.name : String(spec);
            return name?.toLowerCase().includes(term);
          });
          if (specMatch) return true;
        } else if (typeof doctor.specialization === 'string') {
          if ((doctor.specialization as string).toLowerCase().includes(term)) return true;
        }
      }

        const fieldsToSearch = [
          doctor.qualification,
          doctor.designation,
          doctor.hospitalName,
          doctor.branchName,
          doctor.city,
          ...((doctor as any).branchInfo || []).map((branch: any) => branch.branchName),
        ];
      return fieldsToSearch.some(
        (field) => field != null && String(field).toLowerCase().includes(term)
      );
    });
  }, [mappedDoctors, allDoctorsMapped, debouncedSearchTerm]);

  const handleSelect = useCallback(
    (id: string) => {
      const doctor = allDoctorsMapped.find((d) => d._id === id);
      if (doctor) {
        setSearchInputValue("");
        setDebouncedSearchTerm("");
        const slug = doctor.doctorSlug || doctor.slug || doctor.doctorName?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || id;
        router.push(`/doctors/${slug}`);
      }
    },
    [allDoctorsMapped, router]
  );

  // Show section if we have any mapped doctors
  if (!mappedDoctors.length) return null;

  return (
    <section className={`${getAlternatingBackground(SECTION_INDEX.DOCTORS)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-6 md:px-0">
          <SectionHeading
            title={title}
            titleI18nKey={titleI18nKey}
            size="md"
            className="!mb-0"
          />

          {showSearch && (
            <div className="relative w-full md:w-[340px]">
              <SearchDropdown
                value={searchInputValue}
                onChange={setSearchInputValue}
                placeholder="Search Doctors"
                placeholderI18nKey="doctors.search"
                options={allDoctorsMapped.map((d) => ({
                  id: d._id,
                  name: d.doctorName || "Doctor"
                }))}
                onOptionSelect={handleSelect}
                onClear={() => {
                  setSearchInputValue("");
                  setDebouncedSearchTerm("");
                }}
                type="doctor"
                maxHeight={300}
              />
            </div>
          )}
        </div>

        {/* All doctors in carousel - matching HospitalSection pattern */}
        <HomepageCarousel autoplay>
          {filteredDoctors.map((doctor, index) => (
            <div key={doctor._id || index}>
              <DoctorCard
                doctor={doctor as DoctorCardData}
                index={index}
                hoveredIndex={hoveredIndex}
                onHover={setHoveredIndex}
                showHospital={true}
                showAdditionalBranches={true}
              />
            </div>
          ))}
        </HomepageCarousel>
      </div>
    </section>
  );
}
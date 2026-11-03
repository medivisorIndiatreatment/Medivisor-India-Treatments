"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import SectionHeading from "@/components/ui/SectionHeading";
import HomepageCarousel from "@/components/ui/HomepageCarousel";
import SearchDropdown from "@/components/ui/SearchDropdown";
import DoctorCard from "@/components/cards/DoctorCard";
import { DESIGN_TOKENS, getAlternatingBackground } from "@/components/design-tokens";
import type { DoctorCardData } from "@/components/cards/types";
import { transformDoctor } from "@/lib/services/homepage/transformers";
import { buildHospitalLookupMaps } from "@/lib/utils/doctor-utils";

interface TestDiagnosisDoctorsSectionProps {
  doctors: any[];
  allDoctors?: any[];
  testDiagnosisName?: string;
  title?: string;
  titleI18nKey?: string;
  hospitals?: any[];
}

export default function TestDiagnosisDoctorsSection({
  doctors,
  allDoctors,
  testDiagnosisName,
  title,
  titleI18nKey,
  hospitals = [],
}: TestDiagnosisDoctorsSectionProps) {
  const router = useRouter();
  const [searchInputValue, setSearchInputValue] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInputValue);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchInputValue]);

  const { hospitalLookup, hospitalNameLookup, branchToHospitalMap } = useMemo(
    () => buildHospitalLookupMaps(Array.isArray(hospitals) ? hospitals : []),
    [hospitals]
  );

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

  const testDiagnosisDoctors = useMemo(() => {
    if (!Array.isArray(doctors) || doctors.length === 0) return [];

    const seenIds = new Set<string>();
    return doctors
      .filter((d) => {
        if (!d._id || seenIds.has(d._id)) return false;
        seenIds.add(d._id);
        return true;
      })
      .map((doctor) =>
        transformDoctor(doctor, hospitalLogoMap, hospitals, {
          showHospital: true,
          hospitalLookup,
          hospitalNameLookup,
          branchToHospitalMap,
        })
      );
  }, [doctors, hospitalLogoMap, hospitals, hospitalLookup, hospitalNameLookup, branchToHospitalMap]);

  const allDoctorsMapped = useMemo(() => {
    const sourceDoctors =
      allDoctors && Array.isArray(allDoctors) && allDoctors.length > 0
        ? allDoctors
        : doctors;
    if (!Array.isArray(sourceDoctors) || sourceDoctors.length === 0) return [];

    const seenIds = new Set<string>();
    return sourceDoctors
      .filter((d) => {
        if (!d._id || seenIds.has(d._id)) return false;
        seenIds.add(d._id);
        return true;
      })
      .map((doctor) =>
        transformDoctor(doctor, hospitalLogoMap, hospitals, {
          showHospital: true,
          hospitalLookup,
          hospitalNameLookup,
          branchToHospitalMap,
        })
      );
  }, [allDoctors, doctors, hospitalLogoMap, hospitals, hospitalLookup, hospitalNameLookup, branchToHospitalMap]);

  const displayDoctors = useMemo(() => {
    return debouncedSearchTerm ? allDoctorsMapped : testDiagnosisDoctors;
  }, [debouncedSearchTerm, testDiagnosisDoctors, allDoctorsMapped]);

  const filteredDoctors = useMemo(() => {
    if (!debouncedSearchTerm) return displayDoctors;
    const term = debouncedSearchTerm.toLowerCase().trim();
    return displayDoctors.filter((doctor: DoctorCardData) => {
      const doctorName = (doctor.doctorName || doctor.name || "").toLowerCase();
      if (doctorName.includes(term)) return true;

      if (doctor.specialization) {
        if (Array.isArray(doctor.specialization)) {
          const specMatch = doctor.specialization.some((spec: any) => {
            const name = typeof spec === 'string' ? spec : spec?.name;
            return name?.toLowerCase().includes(term);
          });
          if (specMatch) return true;
        } else if (typeof doctor.specialization === 'string') {
          if ((doctor.specialization as string).toLowerCase().includes(term)) return true;
        }
      }

      const fieldsToSearch: (string | undefined)[] = [
        doctor.qualification ?? undefined,
        doctor.designation ?? undefined,
        doctor.hospitalName ?? undefined,
        doctor.branchName ?? undefined,
        typeof doctor.city === 'string' ? doctor.city : undefined,
      ];
      return fieldsToSearch.some(
        (field) => field != null && String(field).toLowerCase().includes(term)
      );
    });
  }, [displayDoctors, debouncedSearchTerm]);

  const handleSelect = useCallback(
    (id: string) => {
      const doctor = allDoctorsMapped.find((d: DoctorCardData) => d._id === id);
      if (doctor) {
        setSearchInputValue("");
        setDebouncedSearchTerm("");
        const slug = doctor.doctorSlug || doctor.slug || doctor.doctorName?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || id;
        router.push(`/doctors/${slug}`);
      }
    },
    [allDoctorsMapped, router]
  );

  if (!testDiagnosisDoctors || testDiagnosisDoctors.length === 0) return null;

  return (
    <section className={`${getAlternatingBackground(5)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-2 md:mb-6 md:px-0">
          <SectionHeading
            title={title || "Related Specialists"}
            titleI18nKey={titleI18nKey || "doctors.related_doctors"}
            size="md"
            className="!mb-0"
          />

          <div className="relative w-full md:w-[340px]">
            <SearchDropdown
              value={searchInputValue}
              onChange={setSearchInputValue}
              placeholder="Search Doctors"
              options={allDoctorsMapped.map((d: DoctorCardData) => ({
                id: d._id,
                name: d.doctorName || "Doctor"
              }))}
              onOptionSelect={handleSelect}
              onClear={() => {
                setSearchInputValue("");
                setDebouncedSearchTerm("");
              }}
              type="doctor"
            />
          </div>
        </div>

        <HomepageCarousel autoplay>
            {filteredDoctors.map((doctor: DoctorCardData, index: number) => (
              <DoctorCard key={doctor._id} doctor={doctor} index={index} hoveredIndex={hoveredIndex} onHover={setHoveredIndex} />
            ))}
        </HomepageCarousel>
      </div>
    </section>
  );
}

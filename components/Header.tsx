"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { generateSlug } from "@/lib/slug-utils";
import { DESIGN_TOKENS } from "@/components/design-tokens";
import { useI18n } from "@/lib/i18n";
import { useTranslatedString } from "@/lib/i18n";

// Components
import ContactCTA from "./header/ContactCTA";
import MobileMenu from "./header/MobileMenu";
import NavItemComponent from "./header/NavItem";
import ContactModal from "./ContactModal";
import LanguageSwitcher from "./header/LanguageSwitcher";

// Types
import type {
  Hospital,
  TreatmentItem,
  HospitalBranch,
  DoctorItem,
  TestDiagnosisItem,
} from "./header/types";
import type { NavItem as NavItemType } from "./header/types";

// Constants
import { SOCIAL_LINKS } from "./header/constants";

const CONTACT_ITEMS = [
  { type: "phone" as const, value: "+91 83682 47758" },
  { type: "email" as const, value: "info@medivisorhealth.com" },
] as const;

const NAV_ITEMS: NavItemType[] = [
  { href: "/", label: "Home", i18nKey: "nav.home" },
  {
    label: "About Us",
    i18nKey: "nav.about",
    subItems: [
      { href: "/aboutus", label: "About Us", i18nKey: "nav.about" },
      { href: "/services", label: "Our Services", i18nKey: "nav.services" },
      { href: "/team", label: "Our Team", i18nKey: "nav.team" },
      { href: "/safety-measures", label: "Our Safety Measures", i18nKey: "nav.safety" },
    ],
  },
  {
    label: "Treatments",
    subItems: [],
    isDynamic: true,
    dataType: "treatments",
    i18nKey: "nav.treatments",
  },
  
  {
    label: "Hospitals",
    subItems: [],
    isDynamic: true,
    dataType: "hospitals",
    i18nKey: "nav.hospitals",
  },
  
  {
    label: "Doctors",
    subItems: [],
    isDynamic: true,
    dataType: "doctors",
    i18nKey: "nav.doctors",
  },
  {
    label: "Tests",
    subItems: [],
    isDynamic: true,
    dataType: "testDiagnoses",
    i18nKey: "nav.test-diagnosis",
  },
  {
    label: "Patient Guide",
    i18nKey: "nav.patient-guide",
    subItems: [
      { href: "/treatment-cost", label: "Treatment Cost", i18nKey: "nav.treatment-cost" },
      { href: "/treatment-process", label: "Treatment Process", i18nKey: "nav.treatment-process" },
      { href: "/visa-process", label: "Visa Process", i18nKey: "nav.visa-process" },
      { href: "/travel-guide", label: "Travel Guide", i18nKey: "nav.travel-guide" },
      { href: "/faqs", label: "FAQs", i18nKey: "nav.faqs" },
      { href: "/why-medivisor", label: "Why Medivisor", i18nKey: "nav.why-medivisor" },
    ],
  },
  {
    label: "Gallery",
    i18nKey: "nav.gallery",
    subItems: [
      { href: "/patient-testimonials", label: "Success Stories", i18nKey: "nav.success-stories" },
      { href: "/patient-activities", label: "Patient Activities", i18nKey: "nav.patient-activities" },
      { href: "/social-activity", label: "Social Activities", i18nKey: "nav.social-activities" },
      { href: "/media-coverage", label: "News Coverage", i18nKey: "nav.news-coverage" },
      { href: "/blog", label: "Blog", i18nKey: "nav.blog" },
    ],
  },
  {
    href: "/medivisor-expanded-patient-support-network",
    label: "Become a Partner",
    i18nKey: "nav.become-partner",
  },
];

interface NavigationResponse {
  hospitals: Array<{
    _id: string;
    hospitalName: string;
    slug: string;
    branches: Array<{
      _id: string;
      branchName: string;
      city: string | { cityName?: string; name?: string }[];
      slug: string;
    }>;
  }>;
  treatments: Array<{
    _id: string;
    name: string;
    slug: string;
    category?: string;
  }>;
  doctors: Array<{
    _id: string;
    doctorName: string;
    slug: string;
    specialization?: string[];
    hospitalName?: string;
    branchName?: string;
  }>;
  testDiagnoses: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
  departments: Array<{
    _id: string;
    name: string;
    slug: string;
    totalTreatments: number;
  }>;
}

const getCityString = (data: unknown): string => {
  if (!data) return "";
  if (typeof data === "string") return data.trim();
  if (Array.isArray(data) && data[0]) {
    const c = data[0] as Record<string, string>;
    return typeof c === "string" ? c : c.cityName || c.name || "";
  }
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, string>;
    return obj.cityName || obj.name || "";
  }
  return "";
};

const getBranchUrl = (branchName: string, city?: string): string => {
  const cleanCity = (city || "").replace(/,?\s*delhi\s*ncr$/i, "").trim();
  const normalizedName = branchName.toLowerCase().replace(/\s+/g, "");
  const normalizedCity = cleanCity.toLowerCase().replace(/\s+/g, "");
  const combined = normalizedName.includes(normalizedCity)
    ? branchName
    : `${branchName} ${cleanCity}`;
  return `/hospital-branches/${generateSlug(combined)}`;
};

const filterHospitals = (
  hospitals: Hospital[],
  search: string,
): HospitalBranch[] => {
  if (!search.trim()) {
    return hospitals.flatMap(
      (h) =>
        h.branches?.map((b) => ({
          hospitalName: h.hospitalName,
          branchName: b.branchName,
          city: getCityString(b.city),
          href: getBranchUrl(b.branchName, getCityString(b.city)),
        })) || [],
    );
  }

  const q = search.toLowerCase().trim();
  const results: HospitalBranch[] = [];

  hospitals.forEach((h) => {
    if (!h.branches?.length) return;
    h.branches.forEach((b) => {
      const branchName = b.branchName || "";
      const city = getCityString(b.city);
      if (
        q &&
        !branchName.toLowerCase().includes(q) &&
        !city.toLowerCase().includes(q) &&
        !(h.hospitalName || "").toLowerCase().includes(q)
      ) {
        return;
      }
      results.push({
        hospitalName: h.hospitalName || "",
        branchName,
        city,
        href: getBranchUrl(branchName, city),
      });
    });
  });

  return results.sort((a, b) => a.branchName.localeCompare(b.branchName));
};

const fetchNavigationData = async (signal?: AbortSignal): Promise<NavigationResponse> => {
  try {
    const response = await fetch("/api/navigation", {
      cache: "force-cache",
      signal,
    });

    if (!response.ok) {
      return { hospitals: [], treatments: [], doctors: [], testDiagnoses: [], departments: [] };
    }

    const data = await response.json();
    return {
      hospitals: Array.isArray(data.hospitals) ? data.hospitals : [],
      treatments: Array.isArray(data.treatments) ? data.treatments : [],
      doctors: Array.isArray(data.doctors) ? data.doctors : [],
      testDiagnoses: Array.isArray(data.testDiagnoses) ? data.testDiagnoses : [],
      departments: Array.isArray(data.departments) ? data.departments : [],
    };
  } catch {
    return { hospitals: [], treatments: [], doctors: [], testDiagnoses: [], departments: [] };
  }
};

export default function Header() {
  const { lang, dir } = useI18n();
  const isRtl = dir === "rtl";
  const closeMenuLabel = useTranslatedString("Close menu");
  const openMenuLabel = useTranslatedString("Open menu");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1024);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [treatmentSearch, setTreatmentSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [testDiagnosisSearch, setTestDiagnosisSearch] = useState("");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [treatments, setTreatments] = useState<TreatmentItem[]>([]);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [testDiagnoses, setTestDiagnoses] = useState<TestDiagnosisItem[]>([]);
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const data = await fetchNavigationData(controller.signal);

        setHospitals(
          data.hospitals.map((h) => ({
            _id: h._id,
            hospitalName: h.hospitalName,
            slug: h.slug,
            branches: h.branches.map((b) => ({
              _id: b._id,
              branchName: b.branchName,
              city: getCityString(b.city) ? [{ cityName: getCityString(b.city), _id: "" }] : [],
              treatments: [],
              doctors: [],
            })),
          })),
        );

        setTreatments(
          data.treatments.map((t) => ({
            _id: t._id,
            name: t.name,
            slug: t.slug,
            category: t.category || "",
          })),
        );

        setDoctors(
          data.doctors.map((d) => ({
            _id: d._id,
            doctorName: d.doctorName,
            slug: d.slug,
            specialization: d.specialization?.join(", ") || "",
            href: d.slug || generateSlug(d.doctorName || ""),
          })),
        );

        setTestDiagnoses(
          data.testDiagnoses
            .filter((td) => td.name)
            .map((td) => ({
              _id: td._id,
              name: td.name,
              slug: td.slug,
            })),
        );
      } catch {
        // Silently fail
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredHospitals = useMemo(
    () => filterHospitals(hospitals, hospitalSearch),
    [hospitals, hospitalSearch],
  );

  const filteredTreatments = useMemo(() => {
    if (!treatments.length) return [];
    const q = treatmentSearch.toLowerCase().trim();
    return treatments
      .filter(
        (t) =>
          !q ||
          t.name?.toLowerCase().includes(q) ||
          (t.category || "").toLowerCase().includes(q),
      )
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [treatments, treatmentSearch]);

  const filteredTestDiagnoses = useMemo(() => {
    if (!testDiagnoses.length) return [];
    const q = testDiagnosisSearch.toLowerCase().trim();
    return testDiagnoses
      .filter(
        (td) =>
          !q || td.name?.toLowerCase().includes(q),
      )
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [testDiagnoses, testDiagnosisSearch]);

  const filteredDoctors = useMemo(() => {
    if (!doctors.length) return [];
    const q = doctorSearch.toLowerCase().trim();
    return doctors
      .filter(
        (d) =>
          !q ||
          d.doctorName?.toLowerCase().includes(q) ||
          (d.specialization || "").toLowerCase().includes(q),
      )
      .sort((a, b) => (a.doctorName || "").localeCompare(b.doctorName || ""));
  }, [doctors, doctorSearch]);

  const handleSubmenuToggle = useCallback(
    (label: string) => {
      setOpenSubmenu(openSubmenu === label ? null : label);
    },
    [openSubmenu],
  );

  const closeContactModal = useCallback(() => {
    setIsContactModalOpen(false);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMenuOpen(false);
    setHospitalSearch("");
    setTreatmentSearch("");
    setDoctorSearch("");
    setTestDiagnosisSearch("");
    setOpenSubmenu(null);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    let rafId: number | null = null

    const updateWidth = () => setWindowWidth(window.innerWidth)
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 40)
      })
    }

    updateWidth()

    window.addEventListener("resize", updateWidth, { passive: true })
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("resize", updateWidth)
      window.removeEventListener("scroll", handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    };
  }, []);

  return (
    <header className="z-50 w-full">
      <div className="w-full bg-[#23366E]">
        <div className="p-2 text-white flex w-full items-center justify-end container mx-auto gap-4">
          <div className="flex w-full flex-row items-center justify-between gap-4 md:justify-end">
            <div className="md:flex items-center space-y-1 md:mt-2 gap-2">
              {CONTACT_ITEMS.map((item) => (
                <ContactCTA
                  key={item.value}
                  type={item.type}
                  value={item.value}
                />
              ))}
            </div>

            <LanguageSwitcher />
          </div>
        </div>
      </div>
      <nav
        suppressHydrationWarning
        className={`w-full py-2.5 ${isScrolled ? "bg-white shadow-sm fixed top-0" : "bg-transparent"}`}
      >
        <div suppressHydrationWarning className={`flex items-center justify-between px-4 md:px-10 gap-4 ${isRtl ? 'flex-row-reverse' : ''} ${DESIGN_TOKENS.CONTAINER.BASE} items-center`}>
          <Link href="/" className="shrink-0 block w-[150px] md:w-[200px] relative h-[50px] md:h-[75px]">
            <Image
              src="/medivisor-logo.png"
              alt="Medivisor India Treatment Logo"
              data-i18n-original="Medivisor India Treatment Logo"
              fill
              sizes="(max-width: 767px) 150px, 200px"
              className="object-contain"
              priority
              fetchPriority="high"
            />
          </Link>

          <button
            type="button"
            className="md:hidden ps-2 rounded-md"
            onClick={toggleMobileMenu}
            aria-label={isMenuOpen ? closeMenuLabel : openMenuLabel}
          >
            <Menu size={28} />
          </button>

          <div className="hidden md:block md:w-full md:ms-auto items-center justify-end gap-2">
            <ul className="flex items-center mt-0 order-2 justify-end gap-3">
              {NAV_ITEMS.map((item) => (
                <NavItemComponent
                  key={item.label}
                  item={item}
                  isOpen={openSubmenu === item.label}
                  onToggle={handleSubmenuToggle}
                  windowWidth={windowWidth}
                  treatments={filteredTreatments}
                  hospitals={filteredHospitals}
                  doctors={filteredDoctors}
                  testDiagnoses={filteredTestDiagnoses}
                  treatmentSearch={treatmentSearch}
                  setTreatmentSearch={setTreatmentSearch}
                  hospitalSearch={hospitalSearch}
                  setHospitalSearch={setHospitalSearch}
                  doctorSearch={doctorSearch}
                  setDoctorSearch={setDoctorSearch}
                  testDiagnosisSearch={testDiagnosisSearch}
                  setTestDiagnosisSearch={setTestDiagnosisSearch}
                />
              ))}
            </ul>
          </div>
        </div>
      </nav>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={closeMobileMenu}
        navItems={NAV_ITEMS}
        windowWidth={windowWidth}
        openSubmenu={openSubmenu}
        onSubmenuToggle={handleSubmenuToggle}
        treatments={filteredTreatments}
        hospitals={filteredHospitals}
        doctors={filteredDoctors}
        testDiagnoses={filteredTestDiagnoses}
        treatmentSearch={treatmentSearch}
        setTreatmentSearch={setTreatmentSearch}
        hospitalSearch={hospitalSearch}
        setHospitalSearch={setHospitalSearch}
        doctorSearch={doctorSearch}
        setDoctorSearch={setDoctorSearch}
        testDiagnosisSearch={testDiagnosisSearch}
        setTestDiagnosisSearch={setTestDiagnosisSearch}
        socialLinks={SOCIAL_LINKS}
      />

      <ContactModal isOpen={isContactModalOpen} onClose={closeContactModal} />
    </header>
  );
}

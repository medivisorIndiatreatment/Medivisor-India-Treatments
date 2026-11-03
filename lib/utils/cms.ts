// lib/utils/cms.ts
// Utility functions for CMS data handling

import { generateSlug } from "@/lib/slug-utils";
import { getWixImageUrl } from "@/lib/wixMedia";

import {
  HospitalData,
  BranchData,
  DoctorData,
  TreatmentData,
} from "@/lib/types";

/**
 * Sanitize HTML to prevent XSS attacks
 * Uses DOMPurify to clean HTML content
 */
export function sanitizeHtml(dirty: unknown): string {
  if (!dirty) return "";
  if (typeof dirty !== "string") return "";

  let sanitized = dirty;

  sanitized = sanitized.replace(/class="[^"]*font_8[^"]*"/gi, "");
  sanitized = sanitized.replace(/class='[^']*font_8[^']*'/gi, "");

  // Dynamic import to avoid SSR issues with DOMPurify
  const DOMPurify = require("dompurify");
  try {
    if (typeof window === "undefined") {
      // Server-side: use JSDOM
      const { JSDOM } = require("jsdom");
      const window = new JSDOM("").window;
      const purify = DOMPurify(window);
      const result = purify.sanitize(sanitized, {
        ALLOWED_TAGS: [
          "p",
          "br",
          "b",
          "i",
          "u",
          "em",
          "strong",
          "a",
          "ul",
          "ol",
          "li",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "span",
          "div",
          "img",
          "table",
          "thead",
          "tbody",
          "tr",
          "th",
          "td",
          "blockquote",
          "code",
          "pre",
        ],
        ALLOWED_ATTR: [
          "href",
          "src",
          "alt",
          "title",
          "class",
          "style",
          "target",
          "rel",
        ],
      });
      return typeof result === "string" ? result : sanitized;
    }
    // Client-side
    const result = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "b",
        "i",
        "u",
        "em",
        "strong",
        "a",
        "ul",
        "ol",
        "li",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "span",
        "div",
        "img",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "blockquote",
        "code",
        "pre",
      ],
      ALLOWED_ATTR: [
        "href",
        "src",
        "alt",
        "title",
        "class",
        "style",
        "target",
        "rel",
      ],
    });
    return typeof result === "string" ? result : sanitized;
  } catch {
    return sanitized;
  }
}

/**
 * Get image URL from various possible image fields
 * Handles Wix image format and regular URLs
 */
export const getImageUrl = (
  imageData: string | null | undefined | { url?: string },
): string | null => {
  if (!imageData) return null;

  // Handle object with url property (e.g. Wix reference object { _id, type, url })
  if (typeof imageData === "object" && imageData.url !== undefined) {
    const url = imageData.url
    if (typeof url === "string" && url.startsWith("wix:image://")) {
      const converted = getWixImageUrl(url)
      return converted || null
    }
    // Already a plain URL — pass through as-is
    if (typeof url === "string" && url) return url
    return null
  }

  // Handle string URLs
  if (typeof imageData === "string") {
    if (imageData.startsWith("wix:image://")) {
      const converted = getWixImageUrl(imageData)
      return converted || null
    }
    if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
      return imageData
    }
  }
  return null
};

/**
 * Get treatment image from various possible fields
 */
export const getTreatmentImage = getImageUrl;
export const getDoctorImage = getImageUrl;
export const getHospitalImage = getImageUrl;
export const getBranchImage = getImageUrl;

/**
 * Get specialization names from various possible formats
 */
export const getSpecializationNames = (
  specialization: any[] | string | undefined,
): string => {
  if (!specialization) return "Specialist";

  if (Array.isArray(specialization)) {
    const names = specialization
      .map((s) => {
        if (typeof s === "object" && s !== null) return s.name || s.title || "";
        return String(s);
      })
      .filter(Boolean);

    if (names.length === 0) return "Specialist";
    if (names.length === 1) return names[0];
    return `${names[0]} +${names.length - 1}`;
  }

  if (typeof specialization === "string") return specialization;
  return "Specialist";
};

/**
 * Get the primary city name from a branch
 */
export const getPrimaryCity = (branch: BranchData): string => {
  if (!branch.city || !Array.isArray(branch.city) || branch.city.length === 0) {
    return "N/A";
  }
  return branch.city[0]?.cityName || "N/A";
};

/**
 * Get hospital name (handles both hospitalName and name fields)
 */
export const getHospitalName = (hospital: HospitalData): string => {
  return hospital.hospitalName || hospital.name || "N/A Hospital";
};

/**
 * Get branch name (handles both branchName and name fields)
 */
export const getBranchName = (branch: BranchData): string => {
  return branch.branchName || branch.name || "N/A Branch";
};

/**
 * Get treatment name (handles both name and title fields)
 */
export const getTreatmentName = (treatment: TreatmentData): string => {
  return treatment.name || treatment.title || "N/A Treatment";
};

/**
 * Get doctor name (handles both doctorName and name fields)
 */
export const getDoctorName = (doctor: DoctorData): string => {
  return doctor.doctorName || doctor.name || "N/A Doctor";
};

/**
 * Format cost display
 */
export const formatCost = (cost: string | null | undefined): string => {
  if (!cost) return "";
  return cost.startsWith("From ") ? cost : `From ${cost}`;
};

/**
 * Format experience years
 */
export const formatExperience = (
  experience: string | null | undefined,
): string => {
  if (!experience) return "Experience N/A";
  return `${experience} yrs Exp.`;
};

/**
 * Filter and sort hospitals
 */
export const filterAndSortHospitals = (
  hospitals: HospitalData[],
  filters: {
    city?: string;
    sortBy?: "all" | "popular" | "az" | "za";
  },
): HospitalData[] => {
  let result = [...hospitals];

  // Filter by city
  if (filters.city) {
    result = result.filter((hospital) =>
      hospital.branches.some((branch) =>
        branch.city?.some((city) =>
          city.cityName.toLowerCase().includes(filters.city!.toLowerCase()),
        ),
      ),
    );
  }

  // Sort
  switch (filters.sortBy) {
    case "popular":
      result = result
        .filter((h) => h.showHospital !== false)
        .sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
      break;
    case "az":
      result.sort((a, b) =>
        (a.hospitalName || a.name || "").localeCompare(
          b.hospitalName || b.name || "",
        ),
      );
      break;
    case "za":
      result.sort((a, b) =>
        (b.hospitalName || b.name || "").localeCompare(
          a.hospitalName || a.name || "",
        ),
      );
      break;
  }

  return result;
};

/**
 * Filter and sort treatments
 */
export const filterAndSortTreatments = (
  treatments: TreatmentData[],
  filters: {
    category?: string;
    sortBy?: "all" | "popular" | "az" | "za";
  },
): TreatmentData[] => {
  let result = [...treatments];

  // Filter by category
  if (filters.category) {
    result = result.filter((t) =>
      t.category?.toLowerCase().includes(filters.category!.toLowerCase()),
    );
  }

  // Sort
  switch (filters.sortBy) {
    case "popular":
      result = result
        .filter((t) => t.popular)
        .sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
      break;
    case "az":
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      break;
    case "za":
      result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
      break;
  }

  return result;
};

/**
 * Filter and sort doctors
 */
export const filterAndSortDoctors = (
  doctors: DoctorData[],
  filters: {
    specialization?: string;
    sortBy?: "all" | "popular" | "az" | "za";
  },
): DoctorData[] => {
  let result = [...doctors];

  // Filter by specialization
  if (filters.specialization) {
    result = result.filter((doctor) => {
      const specs = Array.isArray(doctor.specialization)
        ? doctor.specialization
        : [doctor.specialization];
      return specs.some((s) => {
        if (typeof s === "object")
          return s.name
            ?.toLowerCase()
            .includes(filters.specialization!.toLowerCase());
        return String(s)
          .toLowerCase()
          .includes(filters.specialization!.toLowerCase());
      });
    });
  }

  // Sort
  switch (filters.sortBy) {
    case "popular":
      result = result
        .filter((d) => d.popular)
        .sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
      break;
    case "az":
      result.sort((a, b) =>
        (a.doctorName || a.name || "").localeCompare(
          b.doctorName || b.name || "",
        ),
      );
      break;
    case "za":
      result.sort((a, b) =>
        (b.doctorName || b.name || "").localeCompare(
          a.doctorName || a.name || "",
        ),
      );
      break;
  }

  return result;
};

/**
 * Get unique cities from hospitals
 */
export const getUniqueCities = (hospitals: HospitalData[]): string[] => {
  const cities = new Set<string>();
  hospitals.forEach((hospital) => {
    hospital.branches.forEach((branch) => {
      branch.city?.forEach((city) => {
        if (city.cityName) cities.add(city.cityName);
      });
    });
  });
  return Array.from(cities).sort();
};

/**
 * Get unique categories from treatments
 */
export const getUniqueCategories = (treatments: TreatmentData[]): string[] => {
  const categories = new Set<string>();
  treatments.forEach((treatment) => {
    if (treatment.category) categories.add(treatment.category);
  });
  return Array.from(categories).sort();
};

/**
 * Get unique specializations from doctors
 */
export const getUniqueSpecializations = (doctors: DoctorData[]): string[] => {
  const specs = new Set<string>();
  doctors.forEach((doctor) => {
    const doctorSpecs = Array.isArray(doctor.specialization)
      ? doctor.specialization
      : [doctor.specialization];
    doctorSpecs.forEach((s) => {
      if (typeof s === "object" && s.name) specs.add(s.name);
      else if (typeof s === "string") specs.add(s);
    });
  });
  return Array.from(specs).sort();
};

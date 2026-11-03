// lib/cms/mappers.ts
// Clean, reusable data mappers for CMS entities

import { generateSlug, cleanSlug, generateBranchSlug } from "@/lib/slug-utils";
import { getWixImageUrl } from "@/lib/wixMedia";

import type {
  HospitalData,
  BranchData,
  DoctorData,
  TreatmentData,
  CityData,
  SpecializationData,
  SpecialistData,
  ExtendedTreatmentData,
  TreatmentLocation,
} from "./types";
import {
  extractRichText,
  stripHtmlTags,
  extractAchievementsText,
} from "./utils";
import { DELHI_NCR_CITIES } from "@/lib/utils/city-utils";

// =============================================================================
// VALUE EXTRACTION UTILITY
// =============================================================================

/**
 * Safely extracts a value from an item using multiple key paths
 * Supports nested data property and various name formats
 */
export function getValue(
  item: any | null | undefined,
  ...keys: string[]
): string | null {
  if (!item) return null;

  for (const key of keys) {
    let value = item[key];
    if (value === undefined && item.data) {
      value = (item.data as Record<string, unknown>)[key];
    }

    if (value !== undefined && value !== null && value !== "") {
      if (typeof value === "string") return value;
      if (typeof value === "object") {
        const obj = value as Record<string, unknown>;
        const result =
          obj.name ||
          obj.title ||
          obj.state ||
          obj.stateName ||
          obj["State Name"];
        if (typeof result === "string") return result;
      }
      return String(value);
    }
  }
  return null;
}

// =============================================================================
// HOSPITAL MAPPERS
// =============================================================================

/**
 * Map raw hospital data to typed HospitalData
 */
export function mapHospital(raw: any): HospitalData {
  const hospitalLogo = raw.logo || null;
  const hospitalLogoUrl = hospitalLogo
    ? hospitalLogo.startsWith("http")
      ? hospitalLogo
      : getWixImageUrl(hospitalLogo) || null
    : null;

  return {
    _id: raw._id || raw.id || "",
    hospitalName: raw.hospitalName || raw.name || "Unnamed Hospital",
    slug: raw.slug ? cleanSlug(raw.slug) : generateSlug(raw.hospitalName || raw.name || ""),
    description: raw.description || raw.descriptionHtml || null,
    specialty: mapSpecializations(raw.specialty || raw.specialties),
    yearEstablished: raw.yearEstablished || raw.year || null,
    hospitalImage: raw.hospitalImage || raw.image || null,
    logo: hospitalLogo,
    logoUrl: hospitalLogoUrl,
    isStandalone: raw.isStandalone === true,
    originalBranchId: raw.originalBranchId || null,
    branches: mapBranches(raw.branches || []),
    doctors: mapDoctors(raw.doctors || []),
    specialist: mapSpecializations(raw.specialist || raw.specializations),
    treatments: mapTreatments(raw.treatments || []),
    accreditations: mapAccreditations(raw.accreditations || []),
    showHospital: shouldShowHospital(raw),
  };
}

/**
 * Map raw hospitals array
 */
export function mapHospitals(raw: any[]): HospitalData[] {
  return raw.map(mapHospital);
}

// =============================================================================
// MULTI-REFERENCE EXTRACTION
// =============================================================================

/**
 * Extracts multi-reference field values with proper type safety
 */
export function extractMultiReference<
  T extends { _id: string; name: string } = { _id: string; name: string },
>(field: unknown, ...nameKeys: string[]): T[] {
  if (!field) return [];

  const items = Array.isArray(field) ? field : [field];

  function processRef(ref: unknown): { _id: string; name: string } | null {
    if (typeof ref === "string") return { _id: ref, name: ref };
    if (typeof ref === "object" && ref !== null) {
      const obj = ref as Record<string, unknown>;
      let name = "";

      for (const key of nameKeys) {
        if (obj[key]) {
          name = String(obj[key]);
          break;
        }
      }

      if (!name) {
        name =
          (obj.name as string) ||
          (obj.title as string) ||
          (obj.department as string) ||
          (obj as any).Department ||
          "Unknown";
      }

      const id =
        (obj._id as string) ??
        (obj as any).ID ??
        ((obj as any).data?._id as string);
      if (!id) return null;

      return { _id: id, name, ...obj };
    }
    return null;
  }

  const results = items
    .filter(Boolean)
    .map(processRef)
    .filter((item): item is { _id: string; name: string } => item !== null);

  return results as T[];
}

/**
 * Extracts IDs from reference array
 */
export function extractIds(
  refs: Array<{ _id?: string; ID?: string } | string>,
): string[] {
  return refs
    .map((r) => (typeof r === "string" ? r : (r?._id ?? r?.ID)))
    .filter((id): id is string => Boolean(id));
}

// =============================================================================
// BRANCH & HOSPITAL FILTERING
// =============================================================================

/**
 * Determines if a hospital should be shown based on the ShowHospital field
 */
export function shouldShowHospital(item: any): boolean {
  const showHospital =
    item.ShowHospital ??
    item.data?.ShowHospital ??
    item.showHospital ??
    item.data?.showHospital;

  if (typeof showHospital === "string") {
    const normalized = showHospital.toLowerCase().trim();
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true;
    }
  } else if (showHospital === true || showHospital === 1) {
    return true;
  }
  return false;
}

/**
 * Checks if a branch is standalone (not part of a hospital group)
 */
export function isStandaloneBranch(branch: any): boolean {
  const hospitalGroupRefs = [
    branch.HospitalMaster_branches,
    branch.data?.HospitalMaster_branches,
    branch.hospitalGroup,
    branch.data?.hospitalGroup,
    branch["Hospital Group Master"],
    branch.data?.["Hospital Group Master"],
  ];

  const hasHospitalGroupRef = hospitalGroupRefs.some((ref) => {
    if (!ref) return false;
    if (typeof ref === "string" && ref.trim() !== "") return true;
    if (Array.isArray(ref) && ref.length > 0) return true;
    if (typeof ref === "object" && Object.keys(ref).length > 0) return true;
    return false;
  });

  const directHospitalRef = branch.hospital || branch.data?.hospital;
  const hasDirectHospitalRef =
    (typeof directHospitalRef === "string" &&
      directHospitalRef.trim() !== "") ||
    (Array.isArray(directHospitalRef) && directHospitalRef.length > 0) ||
    (typeof directHospitalRef === "object" && directHospitalRef !== null);

  return !hasHospitalGroupRef && !hasDirectHospitalRef;
}

/**
 * Extracts all hospital IDs from a branch
 */
export function extractHospitalIds(branch: any): string[] {
  const set = new Set<string>();
  const keys: (keyof any)[] = [
    "hospital",
    "HospitalMaster_branches",
    "hospitalGroup",
    "Hospital Group Master",
  ];

  for (const k of keys) {
    const val = branch[k] ?? branch.data?.[k];
    if (!val) continue;

    if (typeof val === "string") {
      set.add(val);
    } else if (Array.isArray(val)) {
      for (const item of val) {
        const id =
          typeof item === "string"
            ? item
            : ((item as Record<string, unknown>)?._id ??
              (item as Record<string, unknown>)?.ID);
        if (typeof id === "string") set.add(id);
      }
    } else if ((val as Record<string, unknown>)?._id) {
      set.add((val as Record<string, unknown>)._id as string);
    }
  }
  return Array.from(set);
}

// =============================================================================
// SPECIALIST MAPPER
// =============================================================================

export function mapSpecialistWithTreatments(item: any) {
  const treatments =
    item.treatments ??
    item.treatment ??
    item.data?.treatments ??
    item.data?.treatment ??
    [];
  const treatmentArray = Array.isArray(treatments)
    ? treatments
    : [treatments].filter(Boolean);

  const department =
    item.SubDepartment ??
    item.department ??
    item.Department ??
    item.SpecialistsMaster_department ??
    item.data?.department ??
    null;
  const departmentArray = Array.isArray(department)
    ? department
    : [department].filter(Boolean);
  const departmentData = departmentArray
    .map((d: any) => ({
      _id: d?._id ?? d?.ID ?? String(d),
      name:
        d.departmentName ??
        d.department ??
        d.Department ??
        d.name ??
        d.title ??
        d.Title ??
        "Unknown Department",
    }))
    .filter((d: any) => d._id);

  return {
    _id: item._id ?? item.ID ?? "",
    name:
      getValue(
        item,
        "specialtyName",
        "specialty",
        "Specialty Name",
        "title",
        "name",
        "specialization",
      ) || "Unknown specialist",
    specialty:
      getValue(
        item,
        "specialtyName",
        "specialty",
        "Specialty Name",
        "title",
        "name",
        "specialization",
      ) || "Unknown specialist",
    department: departmentData,
    treatments: treatmentArray.map((t: any) => ({
      _id: t._id ?? t.ID ?? String(t),
      name:
        getValue(t, "treatmentName", "Treatment Name", "title", "name") ||
        "Unknown Treatment",
      description: extractRichText(t.Description ?? t.description),
      cost: getValue(t, "cost", "Cost", "averageCost"),
      treatmentImage: t.treatmentImage ?? t["treatment image"] ?? null,
    })),
  };
}

/**
 * Enriches city data with state information
 */
export function mapCityWithStateRef(
  item: any,
  stateMap: Record<string, { _id: string; name: string }>,
): any {
  const cityName =
    getValue(item, "cityName", "city name", "name", "City Name") ||
    "Unknown City";

  let state = "Unknown State";
  let stateId: string | undefined = undefined;

  const stateRef =
    item.state ??
    item.State ??
    item.stateRef ??
    item.state_master ??
    item.stateMaster ??
    item.StateMaster ??
    item.StateMaster_state;

  if (stateRef) {
    if (Array.isArray(stateRef)) {
      const firstRef = stateRef[0];
      if (firstRef) {
        if (typeof firstRef === "object") {
          state =
            getValue(
              firstRef,
              "state",
              "State Name",
              "name",
              "title",
              "State",
              "stateName",
              "StateName",
            ) || "Unknown State";
          stateId =
            (firstRef as { _id?: string })._id ??
            (firstRef as { ID?: string }).ID;
        } else if (typeof firstRef === "string") {
          stateId = firstRef;
          const resolvedState = stateMap[firstRef];
          if (resolvedState) state = resolvedState.name;
        }
      }
    } else if (typeof stateRef === "object") {
      state =
        getValue(
          stateRef,
          "state",
          "State Name",
          "name",
          "title",
          "State",
          "stateName",
          "StateName",
        ) || "Unknown State";
      stateId =
        (stateRef as { _id?: string })._id ?? (stateRef as { ID?: string }).ID;
    } else if (typeof stateRef === "string") {
      stateId = stateRef;
      const resolvedState = stateMap[stateRef];
      if (resolvedState) state = resolvedState.name;
    }
  }

  if (state === "Unknown State") {
    state =
      getValue(item, "state", "State Name", "stateName") || "Unknown State";
  }

  if (state === "Unknown State") {
    const normalizedCity = cityName.toLowerCase().trim();
    const fallbackState = DELHI_NCR_CITIES.has(normalizedCity)
      ? "Delhi NCR"
      : undefined;
    if (fallbackState) state = fallbackState;
  }

  return {
    _id: item._id ?? item.ID ?? "",
    cityName,
    state,
    stateId,
    country: getValue(item, "country", "Country Name") || "India",
  };
}

// =============================================================================
// BRANCH MAPPERS
// =============================================================================

/**
 * Map raw branch data to typed BranchData
 * CSV Field Mapping (Hospital Branches Master):
 * - Branch Name → branchName
 * - Specialist → specialist
 * - BranchesMaster_specialist → specialist (explicit)
 * - department → department
 * - SubDepartment → department (from Hospital Branches CSV)
 * - City → city
 * - Speciality → specialty
 * - Total Beds → totalBeds
 * - Total Doctors → noOfDoctors
 * - Hospital Group Master → hospitalGroup
 * - Address → address
 * - Description → description
 * - Doctor Names → doctorNames
 * - Established Year → yearEstablished
 * - branchImage → branchImage
 * - Logo → logo
 * - ShowHospital → showHospital
 * - Accreditation → accreditation
 */
export function mapBranch(raw: any): BranchData {
  const branchLogo = raw.logo || raw.Logo || null;
  const branchImage = raw.branchImage || raw.image || null;

  // Compute final branch image URL (deterministic across server/client)
  const computeImageUrl = (img: string | null): string => {
    if (!img) return "/placeholder.svg";
    if (img.startsWith("http")) return img;
    if (img.startsWith("wix:image://")) {
      const base = getWixImageUrl(img);
      if (base) return base;
    }
    return "/placeholder.svg";
  };

  const branchImageUrl = computeImageUrl(branchImage);
  const logoUrl = branchLogo
    ? branchLogo.startsWith("http")
      ? branchLogo
      : getWixImageUrl(branchLogo) || null
    : null;

  // Extract first city name for slug generation
  const rawCity = raw.city || raw.City || [];
  const rawFirstCity = Array.isArray(rawCity) && rawCity.length > 0 ? rawCity[0] : null;
  const firstCityName = rawFirstCity
    ? typeof rawFirstCity === 'string'
      ? rawFirstCity
      : (rawFirstCity.cityName || rawFirstCity.name || '')
    : '';

  const branchName = raw.branchName || raw.name || raw["Branch Name"] || "Hospital Branch";

  // Extract multi-reference doctor field (DoctorMaster_hospital)
  const doctorsRaw =
    raw.doctors ||
    raw["Doctor Names"] ||
    raw.DoctorMaster_hospital ||
    raw["DoctorMaster_hospital"] ||
    raw.doctor ||
    raw.branchDoctors ||
    [];

  // Manual sort field (Wix field name contains hyphens, use bracket notation)
  const manualSortKey = "_manualsort_60d65ed8-1133-47d7-b824-35399b5cc771";
  const manualSort = raw[manualSortKey] ?? raw.manualSort ?? null;

  return {
    _id: raw._id || raw.id || raw.ID || "",
    slug: raw.slug ? cleanSlug(raw.slug) : generateBranchSlug(branchName, firstCityName || undefined),
    branchName:
      raw.branchName || raw.name || raw["Branch Name"] || "Hospital Branch",
    address: raw.address || raw.Address || null,
    city: mapCities(raw.city || raw.City || []),
    specialty: mapSpecializations(
      raw.specialty ||
        raw.specialities ||
        raw.Speciality ||
        raw.specializations ||
        [],
    ),
    specialist: mapSpecializations(
      raw.Specialist ||
        raw.specialistList ||
        raw.BranchesMaster_specialist ||
        raw.specialist ||
        raw.specialists ||
        [],
    ),
    treatments: mapTreatments(
      raw.treatment ||
        raw.treatments ||
        raw.Treatment ||
        raw.treatmentsList ||
        [],
    ),
    specialization: mapSpecializations(
      raw.specialization ||
        raw.specialist ||
        raw.Specialist ||
        raw.specialities ||
        [],
    ),
    // Department from department/BranchesMaster_department
    department: mapDepartments(
      raw.department || raw.Department || raw.BranchesMaster_department || [],
    ),
    // SubDepartment from SubDepartment field
    subDepartment: mapDepartments(raw.SubDepartment || []),
    accreditation: mapAccreditations(
      raw.accreditation || raw.accreditations || raw.Accreditation || [],
    ),
    description: raw.description || raw.Description || null,
    totalBeds: raw.totalBeds || raw["Total Beds"] || null,
    noOfDoctors: raw.noOfDoctors || raw["Total Doctors"] || null,
    yearEstablished: raw.yearEstablished || raw["Established Year"] || null,
    branchImage,
    logo: branchLogo,
    logoUrl,
    branchImageUrl,
    doctors: mapDoctors(doctorsRaw),
    popular: raw.popular === true || raw.popular === "true",
    isStandalone: raw.isStandalone === true,
    showHospital: shouldShowHospital(raw),
    hospitalId: raw.hospitalId || raw.HospitalMaster_branches?.[0]?._id || raw.HospitalMaster_branches?.[0]?.ID || null,
    hospitalGroup: raw.hospitalGroup || raw["Hospital Group Master"] || null,
    createdDate:
      raw["Created date"] || raw.createdDate || raw._createdDate || null,
    updatedDate:
      raw["Updated date"] || raw.updatedDate || raw._updatedDate || null,
    owner: raw.Owner || raw.owner || null,
    manualSort: manualSort,
    doctorNames: raw["Doctor Names"] || raw.doctorNames || null,
  };
}

/**
 * Map raw branches array
 */
export function mapBranches(raw: any[]): BranchData[] {
  return raw.map(mapBranch);
}

// =============================================================================
// DOCTOR MAPPERS
// =============================================================================

/**
 * Map raw doctor data to typed DoctorData
 */
export function mapDoctor(raw: any): DoctorData {
  // ── Resolve hospital info from CMS multi-reference or scalar fields ─────────
  const resolveHospitalRef = (ref: any) => {
    if (!ref || typeof ref !== 'object') return null
    const actual = ref.hospital && typeof ref.hospital === 'object' ? ref.hospital : ref
    return {
      hospitalId: actual._id || actual.ID || '',
      hospitalName: actual.hospitalName || actual.name || actual.title || '',
      branchId: ref.branchId || '',
      branchName: ref.branchName || actual.branchName || actual.name || '',
    }
  }

  const hospitalRefRaw =
    raw.DoctorMaster_hospital ??
    raw['DoctorMaster_hospital'] ??
    raw.doctorMaster_hospital ??
    raw.hospital

  let hospitalId = ''
  let hospitalName = ''
  let branchId = ''
  let branchName = ''
  let doctorMasterHospital: DoctorData['DoctorMaster_hospital'] = null

  if (hospitalRefRaw) {
    const refs = Array.isArray(hospitalRefRaw) ? hospitalRefRaw : [hospitalRefRaw]
    for (const ref of refs) {
      const resolved = resolveHospitalRef(ref)
      if (!resolved) continue
      if (!hospitalId) hospitalId = resolved.hospitalId
      if (!hospitalName) hospitalName = resolved.hospitalName
      if (!branchId) branchId = resolved.branchId
      if (!branchName) branchName = resolved.branchName
    }
    doctorMasterHospital = refs.map((h: any) => {
      if (typeof h === 'string') return { _id: h, name: h }
      const a = h.hospital && typeof h.hospital === 'object' ? h.hospital : h
      if (!a || typeof a !== 'object') return { _id: '', name: '' }
      return {
        _id: a._id || a.ID || '',
        name: a.hospitalName || a.name || a.title || 'Unknown Hospital',
      }
    }).filter((h: any) => h._id)
  }

  if (raw.hospitalId && !hospitalId) hospitalId = raw.hospitalId
  if (raw.branchId && !branchId) branchId = raw.branchId

  if (!hospitalName) {
    hospitalName =
      raw.hospitalName ||
      raw.hospital?.hospitalName ||
      raw.hospital?.name ||
      ''
  }
  if (!branchName) {
    branchName =
      raw.branchName ||
      raw.branch?.branchName ||
      raw.branch?.name ||
      ''
  }

  // Extract BranchesMaster_doctor and branches multi-reference fields
  const branchesMasterDoctor =
    raw.BranchesMaster_doctor || raw.branchesMaster_doctor || null
  const branchesRef = raw.branches || null

  const branchRefsForResolution = branchesMasterDoctor || branchesRef || []
  const branchRefArray = Array.isArray(branchRefsForResolution)
    ? branchRefsForResolution
    : [branchRefsForResolution]

  if ((!branchId || !branchName) && branchRefArray.length) {
    for (const ref of branchRefArray) {
      if (!ref) continue
      const candidateId = typeof ref === 'string' ? ref : (ref._id || ref.ID || '')
      const candidateName =
        (typeof ref === 'object' && ref !== null
          ? ref.branchName || ref.name || ref.title || ''
          : '') || ''
      if (!branchId && candidateId) branchId = candidateId
      if (!branchName && candidateName) branchName = candidateName
      if (branchId && branchName) break
    }
  }

  // Map city
  const city = mapCities(raw.city || raw.City || [])

  // Pre-compute profile image URL (deterministic across server/client)
  const profileImageRaw =
    raw.profileImage || raw.image || raw.doctorImage || null
  let profileImageUrl: string | null = null
  if (profileImageRaw) {
    if (profileImageRaw.startsWith('http')) {
      profileImageUrl = profileImageRaw
    } else if (profileImageRaw.startsWith('wix:image://')) {
      profileImageUrl = getWixImageUrl(profileImageRaw) || null
    } else {
      profileImageUrl = profileImageRaw
    }
  }

  // Department / subDepartment mapping fields
  const specialistMappingName =
    raw.specialistMappingName || raw.specialist_mapping_name || null
  const departmentName =
    raw.departmentName ||
    raw.department?.name ||
    raw.department?.departmentName ||
    raw.department ||
    null
  const subDepartmentName =
    raw.subDepartmentName ||
    raw.subDepartment?.name ||
    raw.subDepartment?.subDepartmentName ||
    raw.subDepartment ||
    null

  return {
    _id: raw._id || raw.id || raw.ID || "",
    doctorName: raw.doctorName || raw.name || raw["Doctor Name"] || "",
    specialization: mapSpecializations(
      raw.specialization ||
        raw.specializations ||
        raw.Specialty ||
        raw["DoctorMaster_specialization"] ||
        [],
    ),
    qualification: raw.qualification || raw.Qualification || null,
    experienceYears: raw.experienceYears || raw["Experience Years"] || null,
    designation: raw.designation || null,
    aboutDoctor: raw.aboutDoctor || null,
    aboutDoctorHtml: raw.aboutDoctorHtml || null,
    profileImage: profileImageRaw,
    profileImageUrl,
    popular: raw.popular === true || raw.popular === "true",
    hospitalId: hospitalId || '',
    hospitalName: hospitalName || '',
    branchId: branchId || '',
    branchName: branchName || '',
    city,
    slug: raw.slug
      ? cleanSlug(raw.slug)
      : raw.doctorName
        ? generateSlug(raw.doctorName)
        : undefined,
    awards: extractAchievementsText(raw.awards || raw.achievementsAwards),
    achievements: extractAchievementsText(
      raw.achievements || raw.achievementsAwards,
    ),
    achievementsAwards: extractAchievementsText(raw.achievementsAwards),
    DoctorMaster_hospital: doctorMasterHospital,
    BranchesMaster_doctor: branchesMasterDoctor,
    branches: branchesRef,
    specialistMappingName,
    departmentName,
    subDepartmentName,
  };
}

/**
 * Map raw doctors array
 */
export function mapDoctors(raw: any[]): DoctorData[] {
  return raw.map(mapDoctor);
}

// =============================================================================
// TREATMENT MAPPERS
// =============================================================================

/**
 * Map raw treatment data to typed TreatmentData
 */
export function mapTreatment(raw: any): TreatmentData {
  const name = raw.name || raw["Treatment Name"] || raw.treatmentName || "";
  const description = raw.description || raw.Description || null;

  // Handle Wix rich text field for descriptionHtml
  const descriptionHtml =
    raw.descriptionHtml ||
    raw.descriptionHTML ||
    raw.richDescription ||
    raw.richDescription?.html ||
    raw.Description?.html ||
    null;

  // Extract multi-reference fields with proper name key fallbacks
  const subDepartmentRaw =
    raw.subDepartment_treatment ||
    raw.subDepartment ||
    raw.SubDepartment ||
    null;
  const subDepartment = extractMultiReference(
    subDepartmentRaw,
    "name",
    "subDepartmentName",
    "title",
    "subDepartment",
  );

  const specialistRaw =
    raw.SpecialistMap || raw.specialistMap || raw.specialists || null;
  const specialists = extractMultiReference(
    specialistRaw,
    "specialty",
    "specialtyName",
    "name",
    "title",
    "specialization",
  );

  const doctorRaw =
    raw["DoctorCollection-treatment"] || raw.doctorCollection || null;
  const doctorCollection = extractMultiReference(
    doctorRaw,
    "doctorName",
    "name",
    "title",
    "Doctor Name",
  );

  // Pre-compute treatment image URL for SSR/CSR consistency
  const treatmentImageRaw =
    raw.treatmentImage || raw.image || raw["treatment image"] || null;
  let treatmentImage: string | null = null;
  let treatmentImageUrl: string | null = null;
  if (treatmentImageRaw) {
    if (typeof treatmentImageRaw === 'string') {
      treatmentImage = treatmentImageRaw;
      if (treatmentImageRaw.startsWith("http")) {
        treatmentImageUrl = treatmentImageRaw;
      } else if (treatmentImageRaw.startsWith("wix:image://")) {
        treatmentImageUrl = getWixImageUrl(treatmentImageRaw) || null;
      } else {
        treatmentImageUrl = treatmentImageRaw;
      }
    } else if (typeof treatmentImageRaw === 'object' && treatmentImageRaw !== null) {
      const url = treatmentImageRaw.url || treatmentImageRaw.src || treatmentImageRaw.image || null;
      if (typeof url === 'string' && url) {
        treatmentImage = url;
        if (url.startsWith("wix:image://")) {
          treatmentImageUrl = getWixImageUrl(url) || null;
        } else if (url.startsWith("http")) {
          treatmentImageUrl = url;
        } else {
          treatmentImageUrl = url;
        }
      }
    }
  }

  return {
    _id: raw._id || raw.id || raw.ID || "",
    name,
    description,
    descriptionHtml,
    category: raw.category || raw.Department || raw.department || null,
    duration: raw.duration || null,
    cost:
      raw.cost ||
      raw.averageCost ||
      raw["Starting Cost"] ||
      raw.minPrice ||
      raw["Min Price"] ||
      null,
    minPrice:
      raw.minPrice ||
      raw["Min Price"] ||
      raw.averageCost ||
      raw["Starting Price"] ||
      raw.startingPrice ||
      null,
    treatmentImage: treatmentImage,
    treatmentImageUrl,
    popular: raw.popular === true || raw.popular === "true",
    branchesAvailableAt: mapTreatmentLocations(raw.branchesAvailableAt || []),
    subDepartment,
    specialists,
    doctorCollection,
  };
}

/**
 * Map raw treatments array
 */
export function mapTreatments(raw: any[]): TreatmentData[] {
  return raw.map(mapTreatment);
}

// =============================================================================
// SPECIALIST MAPPERS (from specialist Master CSV)
// =============================================================================

/**
 * Map raw specialist data to typed SpecialistData
 * CSV Field Mapping (specialist Master):
 * - Specialty → specialty
 * - ID → _id
 * - Created date → createdAt
 * - Updated date → updatedAt
 * - Owner → owner
 * - DoctorMaster_specialization → specialization
 * - Department → department
 * - BranchesMaster_specialist → branches
 * - Treatment → treatments
 */
export function mapSpecialist(raw: any): SpecialistData {
  // Handle branches (BranchesMaster_specialist)
  const branches =
    raw.BranchesMaster_specialist || raw.branches || raw.specialist || [];
  const branchesArray = Array.isArray(branches) ? branches : [branches];

  // Handle treatments (Treatment)
  const treatments = raw.Treatment || raw.treatments || [];
  const treatmentsArray = Array.isArray(treatments) ? treatments : [treatments];

  return {
    _id: raw._id || raw.ID || "",
    // CSV field: Specialty
    specialty: raw.Specialty || raw.specialty || raw.name || "",
    // CSV field: DoctorMaster_specialization
    specialization:
      raw.DoctorMaster_specialization ||
      raw.specialization ||
      raw.specialist ||
      "",
    // CSV field: Department
    department: raw.Department || raw.department || "",
    // CSV field: BranchesMaster_specialist
    branches: branchesArray.filter(Boolean),
    // CSV field: Treatment
    treatments: treatmentsArray.filter(Boolean),
    // CSV fields: Created date, Updated date, Owner
    createdAt: raw["Created date"] || raw.createdAt || null,
    updatedAt: raw["Updated date"] || raw.updatedAt || null,
    owner: raw.Owner || raw.owner || null,
  };
}

/**
 * Map raw specialist array
 */
export function mapspecialist(raw: any[]): SpecialistData[] {
  return raw.map(mapSpecialist);
}

/**
 * Map raw treatment locations
 */
export function mapTreatmentLocation(raw: any): TreatmentLocation {
  return {
    branchId: raw.branchId || null,
    branchName: raw.branchName || null,
    hospitalName: raw.hospitalName || "",
    hospitalId: raw.hospitalId || "",
    cities: mapCities(raw.cities || []),
    departments: mapDepartments(raw.departments || []),
    cost: raw.cost || raw.averageCost || raw["Starting Cost"] || raw.minPrice || null,
    minPrice: raw.minPrice || raw["Min Price"] || raw.averageCost || raw["startingPrice"] || null,
  };
}

/**
 * Map raw treatment locations array
 */
export function mapTreatmentLocations(raw: any[]): TreatmentLocation[] {
  return raw.map(mapTreatmentLocation);
}

/**
 * Map to ExtendedTreatmentData
 */
export function mapExtendedTreatment(
  raw: any,
  treatmentLocations: TreatmentLocation[],
): ExtendedTreatmentData {
  return {
    ...mapTreatment(raw),
    branchesAvailableAt: treatmentLocations,
    departments: extractDepartmentsFromTreatment(raw),
  };
}

// =============================================================================
// CITY/STATE MAPPERS
// =============================================================================

/**
 * Map raw city data to typed CityData
 */
export function mapCity(raw: any): CityData {
  // Handle CSV format where city can be a string or object
  if (typeof raw === "string") {
    return {
      _id: "",
      cityName: raw,
      state: "",
      country: "",
      stateId: undefined,
      countryId: undefined,
    };
  }
  return {
    _id: raw._id || raw.id || "",
    cityName: raw.cityName || raw.name || raw.cityName || "",
    state: raw.state || raw.State || raw.stateName || "",
    country: raw.country || "",
    stateId: raw.stateId || undefined,
    countryId: raw.countryId || undefined,
  };
}

/**
 * Map raw cities array
 */
export function mapCities(raw: any[]): CityData[] {
  const items = Array.isArray(raw) ? raw : [raw];
  return items.filter(Boolean).map(mapCity);
}

// =============================================================================
// SPECIALIZATION MAPPERS
// =============================================================================

/**
 * Map raw specialization data to typed SpecializationData
 */
export function mapSpecialization(raw: any): SpecializationData {
  // Extract treatments from multiple possible field names
  let treatmentsInput: any[] = [];
  if (Array.isArray(raw.treatments)) {
    treatmentsInput = raw.treatments;
  } else if (Array.isArray(raw.TreatmentMaster_specialistMap)) {
    treatmentsInput = raw.TreatmentMaster_specialistMap;
  } else if (Array.isArray(raw.Treatment)) {
    treatmentsInput = raw.Treatment;
  } else if (raw.treatments) {
    treatmentsInput = [raw.treatments];
  } else if (raw.TreatmentMaster_specialistMap) {
    treatmentsInput = [raw.TreatmentMaster_specialistMap];
  } else if (raw.Treatment) {
    treatmentsInput = [raw.Treatment];
  }

  return {
    _id: raw._id || raw.id || "",
    name: raw.name || raw.specialty || raw.specialtyName || raw.title || "",
    isTreatment: raw.isTreatment === true,
    department: mapDepartments(raw.department || raw.departments || []),
    treatments: mapTreatments(treatmentsInput),
  };
}

/**
 * Map raw specializations array
 */
export function mapSpecializations(raw: any[]): SpecializationData[] {
  const items = Array.isArray(raw) ? raw : [raw];
  return items.filter(Boolean).map(mapSpecialization);
}

// =============================================================================
// DEPARTMENT MAPPERS
// =============================================================================

/**
 * Map raw department data
 */
export function mapDepartment(raw: any) {
  return {
    _id: raw._id || raw.id || "",
    name:
      raw.name ||
      raw.department ||
      raw.Department ||
      raw.title ||
      raw.Title ||
      "Unknown Department",
  };
}

/**
 * Map raw departments array
 */
export function mapDepartments(raw: any[]): any[] {
  const items = Array.isArray(raw) ? raw : [raw];
  return items.filter(Boolean).map(mapDepartment);
}

// =============================================================================
// ACCREDITATION MAPPERS
// =============================================================================

/**
 * Map raw accreditation data
 */
export function mapAccreditation(raw: any) {
  return {
    _id: raw._id || raw.id || "",
    title: raw.title || "",
    image: raw.image || null,
  };
}

/**
 * Map raw accreditations array
 */
export function mapAccreditations(raw: any[]): any[] {
  const items = Array.isArray(raw) ? raw : [raw];
  return items.filter(Boolean).map(mapAccreditation);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Extract departments from treatment data
 */
function extractDepartmentsFromTreatment(raw: any): any[] {
  if (raw.departments) return raw.departments;
  return [];
}

/**
 * Normalize search query for matching
 */
export function normalizeSearchQuery(query: string): string {
  return query.toLowerCase().trim();
}

/**
 * Check if a string contains the search query
 */
export function containsQuery(
  text: string | null | undefined,
  query: string,
): boolean {
  if (!text || !query) return false;
  return text.toLowerCase().includes(query.toLowerCase());
}

// lib/cms/optimized-fetchers.ts
// Lightweight, targeted fetchers for dynamic slug pages.
// These fetch only the minimum required data instead of the full CMS dataset,
// dramatically reducing cold-start time and memory pressure.

import { assertWixConfigured } from "@/lib/config/env";
import { wixServerClient as wixClient } from "@/lib/wix";
import { memoryCache, CACHE_CONFIG } from "./cache";
import { generateSlug, cleanSlug, generateBranchSlug } from "@/lib/slug-utils";
import {
  mapTreatment,
  mapBranch,
  mapDoctor,
  mapHospital,
  mapDepartment,
  mapDepartments,
  shouldShowHospital,
  getValue,
} from "./mappers";
import type {
  TreatmentData,
  DoctorData,
  BranchData,
  HospitalData,
  SpecialistWithBranchInfo,
  CMSDataResponse,
} from "./types";
import {
  fetchAllHospitalsCached,
  fetchAllDoctorsCached,
  fetchAllSpecialistsCached,
  fetchAllBranchesCached,
  fetchAllTreatmentsCached,
  fetchAllDepartmentsCached,
} from "./fetchers";
import { DELHI_NCR_CITIES } from "@/lib/utils/city-utils";

const PER_FETCH_TIMEOUT_MS = 180000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} fetch timed out after ${ms}ms`)), ms);
  });
  promise.catch(() => {});
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

// =============================================================================
// SPECIALIST → SPECIALISTWITHBRANCHINFO MAPPING
// =============================================================================

/**
 * Transforms raw specialist CMS records into the SpecialistWithBranchInfo
 * shape expected by getDoctorsByTreatmentId / getTreatmentsByDoctorId.
 *
 * Specialist records carry treatment references via `TreatmentMaster_specialistMap`
 * (or fallbacks `treatment` / `Treatment`).  Each referenced treatment may be a
 * string-ID or a full object; we resolve names to master IDs using the treatment
 * name→ID map when the reference is a bare string.
 */
export function buildSpecialistWithBranch(
  rawSpecialists: any[],
  treatmentNameToId?: Map<string, string>,
): SpecialistWithBranchInfo[] {
  const result: SpecialistWithBranchInfo[] = [];

  for (const spec of rawSpecialists) {
    const specId = spec._id ?? spec.ID ?? "";
    if (!specId) continue;

    const specName =
      getValue(spec, "specialty", "Specialty Name", "title", "name", "specialization") ||
      "Unknown Specialist";

    const treatmentRefs =
      spec.TreatmentMaster_specialistMap ??
      spec.treatment ??
      spec.Treatment ??
      spec.data?.treatment ??
      [];
    const treatmentArray = Array.isArray(treatmentRefs)
      ? treatmentRefs
      : treatmentRefs
        ? [treatmentRefs]
        : [];

    const treatments = treatmentArray
      .map((t: any) => {
        if (!t) return null;

        let tId =
          (t as { _id?: string })?._id ??
          (t as { ID?: string })?.ID ??
          (typeof t === "string" ? t : "");

        const tName =
          getValue(
            t,
            "treatmentName",
            "Treatment Name",
            "title",
            "name",
          ) || "Unknown Treatment";

        // Resolve bare-string references to master treatment IDs
        if ((!tId || tId === String(t)) && treatmentNameToId && tName) {
          const resolvedId = treatmentNameToId.get(tName.toLowerCase());
          if (resolvedId) tId = resolvedId;
        }

        if (!tId) return null;

        return {
          _id: tId,
          name: tName,
          description: getValue(t, "Description") || getValue(t, "description") || "",
          cost: getValue(t, "cost", "Cost", "averageCost"),
          treatmentImage:
            (t as { treatmentImage?: string })?.treatmentImage ?? null,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);

    const cityRefs = Array.isArray(spec.city) ? spec.city : spec.city ? [spec.city] : [];
    const cities = cityRefs.map((c: any) => {
      const cityName = getValue(c, "cityName", "name", "City Name") || "Unknown City";
      let state = "Unknown State";
      const stateRef =
        c.state ?? c.State ?? c.stateRef ?? c.stateMaster ?? c.StateMaster ?? c.StateMaster_state;
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
        } else if (typeof stateRef === "string") {
          state = stateRef;
        }
      }
      if (state === "Unknown State") {
        state = getValue(spec, "state", "State Name", "stateName") || "Unknown State";
      }
      if (state === "Unknown State") {
        const normalizedCity = cityName.toLowerCase().trim();
        if (DELHI_NCR_CITIES.has(normalizedCity)) state = "Delhi NCR";
      }
      return {
        _id: c._id ?? c.ID ?? "",
        cityName,
        state,
        country: "India",
      };
    });

    result.push({
      _id: specId,
      name: specName,
      treatments,
      hospitalId: spec.hospitalId || "",
      hospitalName: spec.hospitalName || "",
      branchId: spec.branchId || "",
      branchName: spec.branchName || "",
      city: cities,
    });
  }

  return result;
}

// =============================================================================
// LIGHTWEIGHT TREATMENT SLUG INDEX
// =============================================================================

const TREATMENT_SLUG_INDEX_KEY = "treatment_slug_index_light_v2";

export interface LightTreatmentEntry {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  treatmentImageUrl?: string;
}

export interface TreatmentSlugIndex {
  bySlug: Map<string, any>;
  byId: Map<string, any>;
  staticParams: Array<{ slug: string }>;
}

export async function fetchTreatmentSlugIndex(): Promise<TreatmentSlugIndex> {
  const cached = memoryCache.get<TreatmentSlugIndex>(TREATMENT_SLUG_INDEX_KEY);
  if (cached) return cached;

  return memoryCache.dedupe(TREATMENT_SLUG_INDEX_KEY, async () => {
    assertWixConfigured();

    const [treatmentsRes, hospitalsRes] = await Promise.allSettled([
      withTimeout(fetchAllTreatmentsCached(), PER_FETCH_TIMEOUT_MS, "treatment_slug_index"),
      withTimeout(fetchAllHospitalsCached(), PER_FETCH_TIMEOUT_MS, "treatment_slug_index_hospitals"),
    ]);

    const treatmentItems =
      treatmentsRes.status === "fulfilled" ? (treatmentsRes.value || []) : [];
    const hospitals =
      (hospitalsRes.status === "fulfilled" ? hospitalsRes.value || [] : []) as any[];

    const bySlug = new Map<string, LightTreatmentEntry>();
    const byId = new Map<string, LightTreatmentEntry>();
    const seenSlugs = new Set<string>();

    const registerEntry = (
      id: string,
      name: string,
      rawSlug: string,
      imageUrl: string,
      description?: string
    ) => {
      const candidates = new Set<string>();
      if (rawSlug) {
        candidates.add(generateSlug(rawSlug));
        candidates.add(generateSlug(cleanSlug(rawSlug)));
      }
      if (name) candidates.add(generateSlug(name));

      const entry: LightTreatmentEntry = {
        _id: id,
        name,
        slug: rawSlug || generateSlug(name),
        description: description || undefined,
        treatmentImageUrl: imageUrl || undefined,
      };

      for (const slug of candidates) {
        if (slug && !bySlug.has(slug)) {
          bySlug.set(slug, entry);
        }
      }
      if (!byId.has(id)) byId.set(id, entry);
    };

    // 1) Top-level TreatmentMaster items (canonical treatments)
    for (const item of treatmentItems) {
      const id = item._id || item.ID;
      if (!id) continue;

      const name = getValue(item, "name", "Treatment Name", "treatmentName", "title") || "";
      const rawSlug = typeof item.slug === "string" ? item.slug : "";
      const imageUrl =
        getValue(item, "treatmentImageUrl", "treatmentImage", "image", "treatment image") || "";
      const description = getValue(item, "description", "Description") || undefined;

      registerEntry(id, name, rawSlug, imageUrl, description);
    }

    // 2) Treatments defined only at the branch level (HospitalMaster.branches[].treatments[])
    // These treatments may not exist as standalone TreatmentMaster records but are still
    // reachable via /treatment/[slug] URLs.
    const branchOnlyTreatmentIds = new Set<string>();

    for (const h of hospitals) {
      for (const branch of (h.branches || [])) {
        for (const t of (branch?.treatments || [])) {
          if (!t) continue;
          const tid = t._id || t.ID || t.treatmentId;
          const tname = getValue(t, "name", "treatmentName", "Treatment Name", "title") || "";
          const tslug = typeof t.slug === "string" ? t.slug : "";
          const timg =
            getValue(t, "treatmentImageUrl", "treatmentImage", "image", "treatment image") || "";

          if (tid && !byId.has(tid)) {
            branchOnlyTreatmentIds.add(tid);
            registerEntry(tid, tname, tslug, timg);
          } else if (!tid && tname) {
            // Synthesize a deterministic id so the entry is reachable but doesn't
            // collide with real TreatmentMaster records.
            const synthId = `branch-treatment-${generateSlug(tname)}`;
            if (!byId.has(synthId)) {
              registerEntry(synthId, tname, tslug, timg);
            }
          }
        }
      }
    }

    const staticParams: Array<{ slug: string }> = [];
    for (const [slug, t] of bySlug) {
      if (t && t._id && !seenSlugs.has(slug)) {
        seenSlugs.add(slug);
        staticParams.push({ slug });
      }
    }

    const index = { bySlug, byId, staticParams };
    memoryCache.set(TREATMENT_SLUG_INDEX_KEY, index, CACHE_CONFIG.HOSPITALS * 1000);
    return index;
  });
}

// =============================================================================
// LIGHTWEIGHT BRANCH SLUG INDEX
// =============================================================================

const BRANCH_SLUG_INDEX_KEY = "branch_slug_index_light";

export interface LightBranchEntry {
  _id: string;
  branchName: string;
  slug: string;
  hospitalId: string;
  hospitalName: string;
  cityName: string;
}

export interface BranchSlugIndex {
  bySlug: Map<string, LightBranchEntry>;
  byId: Map<string, LightBranchEntry>;
  staticParams: Array<{ slug: string }>;
}

export async function fetchBranchSlugIndex(): Promise<BranchSlugIndex> {
  const cached = memoryCache.get<BranchSlugIndex>(BRANCH_SLUG_INDEX_KEY);
  if (cached) return cached;

  return memoryCache.dedupe(BRANCH_SLUG_INDEX_KEY, async () => {
    assertWixConfigured();

    const [hospitalsRes, branchesRes] = await Promise.allSettled([
      withTimeout(fetchAllHospitalsCached(), PER_FETCH_TIMEOUT_MS, "branch_index_hospitals"),
      withTimeout(fetchAllBranchesCached(true), PER_FETCH_TIMEOUT_MS, "branch_index_branches"),
    ]);

    const hospitals = (hospitalsRes.status === "fulfilled" ? hospitalsRes.value || [] : []) as any[];
    const branches = (branchesRes.status === "fulfilled" ? branchesRes.value || [] : []) as any[];

    const hospitalIdToName = new Map<string, string>();
    const groupedBranchIds = new Set<string>();

    for (const h of hospitals) {
      if (h.isStandalone === true) continue;
      hospitalIdToName.set(h._id, h.hospitalName || h.name || "");
      for (const b of (h.branches || [])) {
        const bid = b?._id || b?.ID;
        if (bid) groupedBranchIds.add(bid);
      }
    }

    const bySlug = new Map<string, LightBranchEntry>();
    const byId = new Map<string, LightBranchEntry>();
    const seenSlugs = new Set<string>();

    for (const branch of branches) {
      const bid = branch._id || branch.ID;
      if (!bid) continue;

      const branchName = branch.branchName || branch.name || "";
      if (!branchName) continue;

      const cityData = Array.isArray(branch.city) ? branch.city[0] : null;
      const cityName = cityData?.cityName || cityData?.name || branch.cityName || "";

      const storedSlug = typeof branch.slug === "string" ? branch.slug : "";
      const hospitalId = branch.hospitalId || (typeof branch.hospital === "object" ? branch.hospital?._id : "") || "";
      const hospitalName = hospitalIdToName.get(hospitalId) || branch.hospitalName || "";

      const candidates = new Set<string>();
      if (storedSlug) candidates.add(generateSlug(storedSlug));
      candidates.add(generateSlug(branchName));
      if (cityName) {
        candidates.add(generateBranchSlug(branchName, cityName));
        candidates.add(generateSlug(`${branchName} ${cityName}`));
      }

      const entry: LightBranchEntry = {
        _id: bid,
        branchName,
        slug: storedSlug || generateSlug(branchName),
        hospitalId,
        hospitalName,
        cityName,
      };

      for (const slug of candidates) {
        if (slug && !bySlug.has(slug)) bySlug.set(slug, entry);
      }
      if (!byId.has(bid)) byId.set(bid, entry);
    }

    const staticParams: Array<{ slug: string }> = [];
    for (const [slug, b] of bySlug) {
      if (b && b._id && !seenSlugs.has(slug)) {
        seenSlugs.add(slug);
        staticParams.push({ slug });
      }
    }

    const index = { bySlug, byId, staticParams };
    memoryCache.set(BRANCH_SLUG_INDEX_KEY, index, CACHE_CONFIG.HOSPITALS * 1000);
    return index;
  });
}

// =============================================================================
// TARGETED TREATMENT PAGE DATA FETCHER
// =============================================================================

export interface OptimizedTreatmentData {
  treatment: TreatmentData | null;
  branchCards: any[];
  doctors: DoctorData[];
  hospitals: HospitalData[];
}

/**
 * When a treatment is only defined inside HospitalMaster.branches[].treatments[]
 * (no standalone TreatmentMaster record), build a minimal TreatmentData object
 * plus the related branch cards and doctors so /treatment/[slug] still renders.
 *
 * Receives already-mapped hospitals, doctors, and a CMSDataResponse-compatible
 * object so that getDoctorsByTreatmentId works with correctly typed data.
 */
async function findBranchOnlyTreatment(
  mappedHospitals: HospitalData[],
  cmsData: Omit<CMSDataResponse, "treatments">,
  treatmentId: string,
  treatmentName: string
): Promise<OptimizedTreatmentData | null> {
  const nameLower = (treatmentName || "").toLowerCase();

  let foundRaw: any = null;
  const matchingBranches: { branch: BranchData; hospital: HospitalData }[] = [];

  for (const h of mappedHospitals) {
    if (!h) continue;
    for (const branch of (h.branches || [])) {
      if (!branch) continue;
      const branchTreatments = branch.treatments || [];
      const match = branchTreatments.find((t: any) => {
        if (!t) return false;
        const tid = t._id || t.ID;
        const tname = (t.name || "").toLowerCase();
        return (tid && tid === treatmentId) || (tname && nameLower && tname === nameLower);
      });
      if (match) {
        if (!foundRaw) foundRaw = match;
        matchingBranches.push({ branch, hospital: h });
      }
    }
  }

  if (!foundRaw && !treatmentName) return null;

  const name = foundRaw?.name || treatmentName || "Treatment";
  const description =
    foundRaw?.description ||
    `${name} treatment in India. World-class healthcare at affordable costs.`;
  const imageUrl =
    foundRaw?.treatmentImageUrl ||
    foundRaw?.treatmentImage ||
    foundRaw?.image ||
    "";
  const cost = foundRaw?.cost || undefined;
  const minPrice = foundRaw?.minPrice || undefined;
  const duration = foundRaw?.duration || undefined;

  const branchesAvailableAt = matchingBranches.map(({ branch, hospital }) => ({
    branchId: branch._id || "",
    branchName: branch.branchName || "",
    hospitalId: branch.hospitalId || hospital._id || "",
    hospitalName: branch.hospitalId ? hospital.hospitalName : hospital.hospitalName || "",
  }));

  const treatment: TreatmentData = {
    _id: treatmentId || `findBranch-${generateSlug(name)}`,
    name,
    description,
    descriptionHtml: undefined,
    treatmentImageUrl: imageUrl || undefined,
    treatmentImage: imageUrl || undefined,
    cost,
    minPrice,
    duration,
    overview: undefined,
    branchesAvailableAt,
  } as unknown as TreatmentData;

  const { mapNormalizedLocationToBranchCard, transformBranch } = await import(
    "@/lib/services/homepage/transformers"
  );
  const transformedBranches = matchingBranches.map(({ branch, hospital }) =>
    transformBranch(branch, hospital, { computeSlug: true })
  );
  const branchCards = transformedBranches.map(mapNormalizedLocationToBranchCard);

  const { getDoctorsByTreatmentId } = await import("./data-service");
  const doctors = getDoctorsByTreatmentId(
    {
      ...cmsData,
      treatments: [{ ...treatment, branchesAvailableAt } as any],
    },
    treatmentId || name
  );

  return { treatment, branchCards, doctors, hospitals: [] };
}

export async function fetchTreatmentPageData(slug: string): Promise<OptimizedTreatmentData> {
  const index = await fetchTreatmentSlugIndex();
  const normalizedSlug = slug.toLowerCase();
  const cleanedSlug = cleanSlug(slug).toLowerCase();
  const generatedSlug = generateSlug(slug);
  const cleanedGeneratedSlug = generateSlug(cleanSlug(slug));
  const treatmentEntry =
    index.bySlug.get(normalizedSlug) ||
    index.bySlug.get(cleanedSlug) ||
    index.bySlug.get(generatedSlug) ||
    index.bySlug.get(cleanedGeneratedSlug) ||
    index.bySlug.get(decodeURIComponent(normalizedSlug)) ||
    null;

  if (!treatmentEntry) {
    return { treatment: null, branchCards: [], doctors: [], hospitals: [] };
  }

  assertWixConfigured();

  const treatmentId = treatmentEntry._id;
  const treatmentName = treatmentEntry.name;

  // Use cached fetchers for hospitals, doctors, and specialists — these are
  // memory-cached and deduplicated so repeated calls (e.g. from multiple slug
  // pages in the same request) return instantly after the first fetch.
  const [treatmentRes, hospitalsRes, doctorsRes, specialistsRes] = await Promise.allSettled([
    withTimeout(
      wixClient.items
        .query("TreatmentMaster")
        .eq("_id", treatmentId)
        .include("branches", "hospital", "city", "department", "subDepartment_treatment", "SpecialistMap", "doctorCollection")
        .limit(1)
        .find(),
      PER_FETCH_TIMEOUT_MS,
      "treatment_by_id"
    ),
    withTimeout(fetchAllHospitalsCached(), PER_FETCH_TIMEOUT_MS, "hospitals_for_treatment"),
    withTimeout(fetchAllDoctorsCached(), PER_FETCH_TIMEOUT_MS, "doctors_for_treatment"),
    withTimeout(fetchAllSpecialistsCached(), PER_FETCH_TIMEOUT_MS, "specialists_for_treatment"),
  ]);

  const treatmentItem = treatmentRes.status === "fulfilled" ? (treatmentRes.value as any).items?.[0] : null;
  const rawHospitals = hospitalsRes.status === "fulfilled" ? hospitalsRes.value : [];
  const rawDoctors = doctorsRes.status === "fulfilled" ? doctorsRes.value : [];
  const rawSpecialists = specialistsRes.status === "fulfilled" ? specialistsRes.value : [];

  // Map hospitals — fetchAllHospitals returns all hospitals; shouldShowHospital
  // filtering is applied at the presentation layer (e.g. transformAllHospitals).
  // We keep the full set here so getDoctorsByTreatmentId can match doctors
  // across all hospitals/branches without missing associations.
  const mappedHospitals: HospitalData[] = [];
  for (const h of rawHospitals) {
    const hospital = mapHospital(h);
    hospital.branches = hospital.branches || [];
    mappedHospitals.push(hospital);
  }

  // Map all doctors via the canonical mapper so downstream functions receive
  // DoctorData[] with specialization, branch refs, and hospital refs populated.
  const mappedDoctors: DoctorData[] = rawDoctors.map(mapDoctor);

  // Build treatment name → ID map for specialist treatment-resolution.
  // Populated from TreatmentMaster items AND from treatments nested in hospital branches.
  const treatmentNameToId = new Map<string, string>();
  for (const t of index.byId.values()) {
    if (t._id && t.name) {
      treatmentNameToId.set(t.name.toLowerCase(), t._id);
    }
  }
  for (const h of mappedHospitals) {
    for (const b of h.branches || []) {
      for (const t of b.treatments || []) {
        if (t._id && t.name && !treatmentNameToId.has(t.name.toLowerCase())) {
          treatmentNameToId.set(t.name.toLowerCase(), t._id);
        }
      }
    }
  }

  // Build SpecialistWithBranchInfo[] for specialist→doctor matching.
  const specialistWithBranch = buildSpecialistWithBranch(rawSpecialists, treatmentNameToId);

  // Assemble a minimal CMSDataResponse for getDoctorsByTreatmentId.
  const cmsData: CMSDataResponse = {
    hospitals: mappedHospitals,
    treatments: [],
    doctors: mappedDoctors,
    departments: [],
    totalHospitals: mappedHospitals.length,
    totalTreatments: 0,
    totalDoctors: mappedDoctors.length,
    lastUpdated: new Date().toISOString(),
    specialistWithBranch,
  };

  if (!treatmentItem) {
    // Fallback: treatment may only exist as a nested entry in HospitalMaster.branches[].treatments[].
    const branchOnlyTreatment = await findBranchOnlyTreatment(
      mappedHospitals,
      cmsData,
      treatmentId,
      treatmentName
    );
    if (!branchOnlyTreatment) {
      return { treatment: null, branchCards: [], doctors: [], hospitals: [] };
    }
    return { ...branchOnlyTreatment, hospitals: mappedHospitals };
  }

  const treatment = mapTreatment(treatmentItem);

  // Build branch lookup map from MAPPED hospitals
  const branchMap = new Map<string, { branch: BranchData; hospital: HospitalData }>();

  for (const h of mappedHospitals) {
    for (const b of (h.branches || [])) {
       const bid = b._id;
      if (bid) branchMap.set(bid, { branch: b, hospital: h });
    }
  }

  // Find branches that offer this treatment
  const branchCards: any[] = [];
  const seenBranchIds = new Set<string>();

  // Check branchesAvailableAt on treatment
  for (const loc of (treatment.branchesAvailableAt || [])) {
    const branchId = (loc as any).branchId;
    if (!branchId || seenBranchIds.has(branchId)) continue;
    const entry = branchMap.get(branchId);
    if (entry) {
      seenBranchIds.add(branchId);
      branchCards.push(entry);
    }
  }

  // Also scan all branch treatments for matches (uses mapped treatment objects)
  for (const [bid, entry] of branchMap) {
    if (seenBranchIds.has(bid)) continue;
    const hasTreatment = (entry.branch.treatments || []).some((t: any) => {
      const tid = t._id || t.ID;
      const tname = (t.name || "").toLowerCase();
      return tid === treatmentId || tname === treatmentName?.toLowerCase();
    });
    if (hasTreatment) {
      seenBranchIds.add(bid);
      branchCards.push(entry);
    }
  }

  // Transform to card format
  const { mapNormalizedLocationToBranchCard, transformBranch } = await import(
    "@/lib/services/homepage/transformers"
  );
  const transformedBranches = branchCards.map(({ branch, hospital }) =>
    transformBranch(branch, hospital, { computeSlug: true })
  );
  const branchCardsFinal = transformedBranches.map(mapNormalizedLocationToBranchCard);

  // Filter doctors for this treatment using fully-mapped data
  const { getDoctorsByTreatmentId } = await import("./data-service");
  const relatedDoctors = getDoctorsByTreatmentId(
    {
      ...cmsData,
      treatments: [{ ...treatment, branchesAvailableAt: treatment.branchesAvailableAt || [] } as any],
    },
    treatmentId || treatmentName || ""
  );

    return {
      treatment,
      branchCards: branchCardsFinal,
      doctors: relatedDoctors,
      hospitals: mappedHospitals,
    };
  }

// =============================================================================
// TARGETED BRANCH PAGE DATA FETCHER
// =============================================================================

export interface OptimizedBranchData {
  branch: BranchData | null;
  hospitals: HospitalData[];
  treatments: any[];
  doctors: DoctorData[];
  allDoctors: DoctorData[];
  departments: any[];
}

export async function fetchBranchPageData(slug: string, bid?: string): Promise<OptimizedBranchData> {
  const index = await fetchBranchSlugIndex();
  const normalizedSlug = generateSlug(slug);
  const branchEntry =
    index.bySlug.get(normalizedSlug) ||
    index.bySlug.get(slug.toLowerCase()) ||
    (bid ? index.byId.get(bid) : undefined) ||
    null;

  if (!branchEntry) {
    return { branch: null, hospitals: [], treatments: [], doctors: [], allDoctors: [], departments: [] };
  }

  assertWixConfigured();

  const branchId = branchEntry._id;
  const hospitalId = branchEntry.hospitalId;

  // Targeted fetch for the branch itself, plus cached fetches for the
  // large datasets (hospitals, doctors, specialists, departments).
  // Cached fetchers avoid duplicate network round-trips and benefit from
  // memory deduplication.
  const [branchRes, hospitalsRes, doctorsRes, treatmentsRes, specialtiesRes, departmentsRes] = await Promise.allSettled([
    withTimeout(
      wixClient.items
        .query("BranchesMaster")
        .eq("_id", branchId)
        .include("hospital", "city", "specialty", "department", "doctors", "treatments", "specialist", "accreditation", "subDepartment")
        .limit(1)
        .find(),
      PER_FETCH_TIMEOUT_MS,
      "branch_by_id"
    ),
    withTimeout(fetchAllHospitalsCached(), PER_FETCH_TIMEOUT_MS, "hospitals_for_branch"),
    withTimeout(fetchAllDoctorsCached(), PER_FETCH_TIMEOUT_MS, "doctors_for_branch"),
    withTimeout(fetchAllTreatmentsCached(), PER_FETCH_TIMEOUT_MS, "treatments_for_branch"),
    withTimeout(fetchAllSpecialistsCached(), PER_FETCH_TIMEOUT_MS, "specialists_for_branch"),
      withTimeout(fetchAllDepartmentsCached(), PER_FETCH_TIMEOUT_MS, "departments_for_branch"),
  ]);

  const branchItem = branchRes.status === "fulfilled" ? (branchRes.value as any).items?.[0] : null;
  const rawHospitals = hospitalsRes.status === "fulfilled" ? hospitalsRes.value : [];
  const rawDoctors = doctorsRes.status === "fulfilled" ? doctorsRes.value : [];
  const rawTreatments = treatmentsRes.status === "fulfilled" ? treatmentsRes.value : [];
  const rawSpecialists = specialtiesRes.status === "fulfilled" ? specialtiesRes.value : [];
  const departmentsRaw = departmentsRes.status === "fulfilled" ? (departmentsRes.value || []) : [];

  if (!branchItem) {
    return { branch: null, hospitals: [], treatments: [], doctors: [], allDoctors: [], departments: [] };
  }

  // Map the branch
  const branch = mapBranch(branchItem);

  // Map hospitals — fetchAllHospitals returns all hospitals; shouldShowHospital
  // filtering is applied at the presentation layer (e.g. transformAllHospitals).
  const mappedHospitals: HospitalData[] = [];
  for (const h of rawHospitals) {
    const hospital = mapHospital(h);
    hospital.branches = hospital.branches || [];
    mappedHospitals.push(hospital);
  }

  // Map all doctors via the canonical mapper
  const mappedDoctors: DoctorData[] = rawDoctors.map(mapDoctor);

  // Build SpecialistWithBranchInfo[] for getDoctorsByBranchId
  const treatmentNameToId = new Map<string, string>();
  for (const h of mappedHospitals) {
    for (const b of h.branches || []) {
      for (const t of b.treatments || []) {
        if (t._id && t.name && !treatmentNameToId.has(t.name.toLowerCase())) {
          treatmentNameToId.set(t.name.toLowerCase(), t._id);
        }
      }
    }
  }
  const specialistWithBranch = buildSpecialistWithBranch(rawSpecialists, treatmentNameToId);

  // Find the target hospital for this branch
  const targetHospital = mappedHospitals.find((h) => h._id === branch.hospitalId);

  // Build a minimal CMSDataResponse for getDoctorsByBranchId
  const { getDoctorsByBranchId } = await import("./data-service");
  const cmsData: CMSDataResponse = {
    hospitals: mappedHospitals,
    treatments: [],
    doctors: mappedDoctors,
    departments: [],
    totalHospitals: mappedHospitals.length,
    totalTreatments: 0,
    totalDoctors: mappedDoctors.length,
    lastUpdated: new Date().toISOString(),
    specialistWithBranch,
  };

  // Get doctors for this branch using the canonical resolver, then merge direct
  // Wix branch references because expanded multi-reference fields can be returned
  // under different keys depending on the collection configuration.
  const resolvedBranchId = branch._id || branchId;
  const doctorsById = new Map<string, DoctorData>();
  for (const doctor of getDoctorsByBranchId(cmsData, resolvedBranchId)) {
    if (doctor._id) doctorsById.set(doctor._id, doctor);
  }

  const directDoctorRefs = [
    branchItem.doctors,
    branchItem.DoctorMaster_branch,
    branchItem.BranchesMaster_doctor,
    branchItem.data?.doctors,
  ].flatMap((value: any) => Array.isArray(value) ? value : value ? [value] : []);
  const directDoctorIds = new Set(
    directDoctorRefs.map((ref: any) => typeof ref === "string" ? ref : ref?._id || ref?.ID).filter(Boolean),
  );
  const hasReference = (value: any, id: string): boolean => {
    if (!value) return false;
    if (typeof value === "string") return value === id;
    if (Array.isArray(value)) return value.some((entry) => hasReference(entry, id));
    if (typeof value === "object") {
      if (value._id === id || value.id === id || value.ID === id || value.branchId === id) return true;
      return Object.values(value).some((entry) => entry && typeof entry === "object" && hasReference(entry, id));
    }
    return false;
  };
  const normalize = (value: any) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const targetBranchName = normalize(branch.branchName);
  for (const [index, doctor] of mappedDoctors.entries()) {
    const rawDoctor = rawDoctors[index];
    const rawBranchName = normalize((rawDoctor as any)?.branchName || (rawDoctor as any)?.branch?.branchName || (rawDoctor as any)?.location);
    const matchesBranchName = Boolean(targetBranchName && rawBranchName && (rawBranchName === targetBranchName || rawBranchName.includes(targetBranchName) || targetBranchName.includes(rawBranchName)));
    if (doctor._id && (directDoctorIds.has(doctor._id) || doctor.branchId === resolvedBranchId || hasReference(rawDoctor?.branches, resolvedBranchId) || hasReference(rawDoctor?.branch, resolvedBranchId) || hasReference(rawDoctor?.DoctorMaster_hospital, resolvedBranchId) || hasReference(rawDoctor?.BranchesMaster_doctor, resolvedBranchId) || matchesBranchName)) {
      doctorsById.set(doctor._id, doctor);
    }
  }
  if (doctorsById.size === 0 && targetHospital) {
    const hospitalName = normalize(targetHospital.hospitalName);
    for (const doctor of mappedDoctors) {
      const doctorHospital = normalize(doctor.hospitalName);
      if (doctor.hospitalId === targetHospital._id || (hospitalName && doctorHospital === hospitalName)) {
        if (doctor._id) doctorsById.set(doctor._id, doctor);
      }
    }
  }
  const doctors = Array.from(doctorsById.values());

  // Enrich doctors with target hospital/branch context where missing
  for (const d of doctors) {
    if (!d.hospitalName) d.hospitalName = targetHospital?.hospitalName || "";
    if (!d.hospitalId) d.hospitalId = targetHospital?._id || "";
    if (!d.branchName) d.branchName = branch.branchName || "";
    if (!d.branchId) d.branchId = branch._id || "";
  }

  // Collect treatments for this branch with full field set
  const treatments: any[] = [];
  const seenTreatmentIds = new Set<string>();
  const branchTreatmentRefs = [
    branchItem.treatments,
    branchItem.TreatmentMaster_branch,
    branchItem.BranchesMaster_treatment,
    branchItem.data?.treatments,
  ].flatMap((value: any) => Array.isArray(value) ? value : value ? [value] : []);

  for (const t of branchTreatmentRefs) {
    const tid = t?._id || t?.ID || t?.treatmentId;
    if (!tid || seenTreatmentIds.has(tid)) continue;
    seenTreatmentIds.add(tid);
    treatments.push({
      _id: tid,
      name: t.name || t.treatmentName || "",
      description: t.description || t.Description || null,
      descriptionHtml: t.descriptionHtml || null,
      treatmentImage: t.treatmentImage || t.treatmentImageUrl || null,
      treatmentImageUrl: t.treatmentImageUrl || t.treatmentImage || null,
      image: t.image || t.treatmentImage || null,
      cost: t.cost || t.averageCost || null,
      minPrice: t.minPrice || null,
      duration: t.duration || null,
      popular: t.popular === true || t.popular === "true",
    });
  }

  // Wix may expose the reverse branch relationship on TreatmentMaster.
  for (const t of rawTreatments) {
    const rawTreatment = t as any;
    const rawBranchNames = [rawTreatment?.branchName, rawTreatment?.branch?.branchName, ...(Array.isArray(rawTreatment?.branchNames) ? rawTreatment.branchNames : [])].map(normalize);
    const matchesBranchName = rawBranchNames.some((name: string) => name && (name === targetBranchName || name.includes(targetBranchName) || targetBranchName.includes(name)));
    if (!hasReference(t?.branches, resolvedBranchId) && !hasReference(t?.branch, resolvedBranchId) && !hasReference(t?.hospitalBranches, resolvedBranchId) && !matchesBranchName) continue;
    const tid = t?._id || t?.ID;
    if (!tid || seenTreatmentIds.has(tid)) continue;
    seenTreatmentIds.add(tid);
    treatments.push({
      _id: tid,
      name: t.name || t.treatmentName || t.title || "",
      description: t.description || null,
      descriptionHtml: t.descriptionHtml || null,
      treatmentImage: t.treatmentImage || t.treatmentImageUrl || t.image || null,
      treatmentImageUrl: t.treatmentImageUrl || t.treatmentImage || t.image || null,
      cost: t.cost || t.averageCost || null,
      minPrice: t.minPrice || null,
      duration: t.duration || null,
      popular: t.popular === true || t.popular === "true",
    });
  }

  // Also scan mapped hospital branch treatments for additional entries
  for (const h of mappedHospitals) {
    for (const b of (h.branches || [])) {
      if (b._id !== (branch._id || branchId)) continue;
      for (const t of (b.treatments || [])) {
        const tid = t._id;
        if (!tid || seenTreatmentIds.has(tid)) continue;
        seenTreatmentIds.add(tid);
        treatments.push({
          _id: tid,
          name: t.name || "",
          description: t.description || null,
          descriptionHtml: t.descriptionHtml || null,
          treatmentImage: t.treatmentImage || t.treatmentImageUrl || null,
          treatmentImageUrl: t.treatmentImageUrl || t.treatmentImage || null,
          cost: t.cost || t.minPrice || null,
          minPrice: t.minPrice || null,
          duration: t.duration || null,
          popular: t.popular === true,
        });
      }
    }
  }

  // Map departments
  const departments = mapDepartments(departmentsRaw);

  return {
    branch,
    hospitals: mappedHospitals,
    treatments,
    doctors,
    allDoctors: mappedDoctors,
    departments,
  };
}

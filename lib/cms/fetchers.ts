// lib/cms/fetchers.ts
// Optimized data fetching with pagination, caching, and request deduplication

import { wixServerClient as wixClient } from "@/lib/wix";
import {
  memoryCache,
  CACHE_CONFIG,
  CACHE_TAGS,
} from "./cache";
import { assertWixConfigured } from "@/lib/config/env";
import type { WixItem } from "./types";

// =============================================================================
// CONFIG
// =============================================================================

// Export collections and limits for use in other modules
export const COLLECTIONS = {
  BRANCHES: 'BranchesMaster',
  DOCTORS: 'DoctorMaster',
  CITIES: 'CityMaster',
  HOSPITALS: 'HospitalMaster',
  ACCREDITATIONS: 'Accreditation',
  SPECIALTIES: 'Specialistmaster',
  DEPARTMENTS: 'Department',
  TREATMENTS: 'TreatmentMaster',
  STATES: 'StateMaster',
  SUB_DEPARTMENT: 'subDepartment',
  TECHNOLOGIES: 'Technologies',
  LOGO_SECTION: 'LogoSection',
  TEST_DIAGNOSIS: 'TestDiagnosis',
  SUB_TEST_DIAGNOSIS: 'SubTestDiagnosis',
} as const;

export const MAX_FETCH_LIMIT = 1000;

// Reduced page size prevents memory pressure with large datasets
export const PAGE_SIZE = 200;

// Timeout helper - creates a fresh timeout promise for each page fetch
// to prevent premature timeouts when paginating through slow Wix API responses.
const createFetchTimeout = (collection: string, ms: number = 120000) =>
  new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Fetch timeout for ${collection}`)), ms),
  );

// Detect Wix errors that indicate a collection does not exist (WDE0025).
// Retrying these is pointless — the collection will never appear.
function isCollectionNotFoundError(error: any): boolean {
  if (!error) return false
  const msg = error.message || error?.error?.message || String(error)
  return msg.includes("does not exist") || msg.includes("WDE0025")
}

// =============================================================================
// FALLBACK DATA - Kept minimal for critical failures only
// =============================================================================

export const FALLBACK_CITIES = [
  { _id: 'city-1', name: 'Delhi', cityName: 'Delhi' },
  { _id: 'city-2', name: 'Mumbai', cityName: 'Mumbai' },
  { _id: 'city-3', name: 'Bangalore', cityName: 'Bangalore' },
] as const;

export const FALLBACK_DEPARTMENTS = [
  { _id: 'dept-1', name: 'Cardiology' },
  { _id: 'dept-2', name: 'Neurology' },
  { _id: 'dept-3', name: 'Orthopedics' },
] as const;

// =============================================================================
// GENERIC FETCH WITH CACHING AND DEDUPLICATION
// =============================================================================

async function fetchCollection(
  collection: string,
  options: {
    limit?: number;
    offset?: number;
    include?: string[];
    filter?: any;
    sort?: { field: string; order: "asc" | "desc" };
    projection?: string[];
  } = {},
  cacheKey: string,
  fallback: readonly any[] | null = null,
  ttlSeconds?: number,
): Promise<any[]> {
  assertWixConfigured();

  const cached = memoryCache.get<any[]>(cacheKey);
  // Empty results are valid cache entries. Treating [] as a miss causes
  // repeated Wix requests for missing/empty collections.
  if (cached !== null) return cached;

  return memoryCache.dedupe(cacheKey, async () => {
    // Retry logic with exponential backoff
    let lastError: any = null;
    const maxRetries = 2;
    const baseDelay = 1000; // 1 second

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Limit page size to prevent oversized responses and memory pressure
        const pageSize = Math.min(options.limit || MAX_FETCH_LIMIT, PAGE_SIZE)

        // Build the base query
        let query = wixClient.items
          .query(collection)
          .limit(pageSize);

        // Apply offset if provided
        if (options.offset !== undefined) {
          query = query.skip(options.offset);
        }

        if (options.include?.length) {
          query = query.include(...options.include);
        }

        if (options.sort) {
          query =
            options.sort.order === "asc"
              ? query.ascending(options.sort.field)
              : query.descending(options.sort.field);
        }

        // Race the actual query against a timeout and accumulate all pages.
        // Wix SDK v1's @wix/data uses CursorBasedIterator for find() results —
        // the default page size is 10, so we must loop .hasNext()/.next() to
        // collect the full result set regardless of collection size.
        let allItems: any[] = [];

        const firstPage: any = await Promise.race([
          query.find(),
          createFetchTimeout(collection),
        ]);
        let pageItems = (firstPage.items || []) as any[];

        allItems = allItems.concat(pageItems);

        // Walk through remaining pages via the CursorBasedIterator.
        // Use totalCount as a hard ceiling; fall back one item length-based
        // detector to defend against a Wix cursor that silently reports
        // totalCount == pageSize rather than the full collection size.
        const totalLimit = options.limit || MAX_FETCH_LIMIT;
        const totalCount = firstPage.totalCount ?? 0;

        let currentIterator: any = firstPage;
        while (
          allItems.length < totalLimit &&
          currentIterator?.hasNext?.()
        ) {
          try {
            const nextIter = await Promise.race([
              currentIterator.next(),
              createFetchTimeout(collection),
            ]);
            const batch = (nextIter.items || []) as any[];
            // Zero items returned is the definitive end-of-data signal
            if (batch.length === 0) break;
            allItems = allItems.concat(batch);
            currentIterator = nextIter;
          } catch (error: any) {
            console.warn(
              `Error fetching next page for ${collection}:`,
              error?.message,
            );
            break;
          }
        }

        if (allItems.length === 0 && fallback) {
          console.warn(`Wix returned empty ${collection}, using fallback data`);
          const result = [...fallback];
          if (result.length > 0) {
            memoryCache.set(
              cacheKey,
              result,
              ttlSeconds ? ttlSeconds * 1000 : CACHE_CONFIG.HOSPITALS * 1000,
            );
          }
          return result;
        }

        // Cache empty results too. A missing or currently empty Wix collection is
        // a valid result; leaving it uncached creates a request storm on every
        // render and makes outages much more expensive.
        memoryCache.set(
          cacheKey,
          allItems,
          ttlSeconds ? ttlSeconds * 1000 : CACHE_CONFIG.HOSPITALS * 1000,
        );
        return allItems;
      } catch (error: any) {
        lastError = error;

        // If the collection itself does not exist, retrying is pointless —
        // return the fallback immediately instead of wasting retry attempts.
        if (isCollectionNotFoundError(error)) {
          console.debug(
            `Collection ${collection} does not exist, skipping retries and using fallback.`,
          );
          if (fallback !== null) {
            return [...fallback];
          }
          return [];
        }

        console.warn(
          `Attempt ${attempt + 1} failed for ${collection}:`,
          error?.message,
        );

        // If we've exhausted retries, break and handle error
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff delay
        await new Promise((resolve) =>
          setTimeout(resolve, baseDelay * Math.pow(2, attempt)),
        );
      }
    }

    // All retries exhausted
    if (fallback !== null) {
      console.warn(
        `Error fetching ${collection} after ${maxRetries + 1} attempts, using fallback:`,
        lastError?.message,
      );
      return [...fallback];
    }
    console.error(
      `Error fetching ${collection} after ${maxRetries + 1} attempts:`,
      lastError,
    );
    return [];
  });
}

// =============================================================================
// SPECIALIZED FETCH FUNCTIONS
// =============================================================================

export async function fetchAllBranches(includeAll = false, limit?: number): Promise<WixItem[]> {
    const cacheKey = includeAll ? "branches_unfiltered" : "branches_filtered";
    const cached = memoryCache.get<WixItem[]>(cacheKey);
    if (cached !== null) return cached;

    return memoryCache.dedupe(cacheKey, async () => {
      const res = await fetchCollection(
        COLLECTIONS.BRANCHES,
        {
          include: [
            "hospital",
            "city",
            "specialty",
            "department",
            "BranchesMaster_department",
            "doctors",
            "DoctorMaster_hospital",
            "treatments",
            "specialist",
          ],
          limit: limit ?? MAX_FETCH_LIMIT,
          projection: [
            "_id",
            "branchName",
            "address",
            "city",
            "specialty",
            "specialist",
            "treatments",
            "specialization",
            "department",
            "subDepartment",
            "accreditation",
            "totalBeds",
            "noOfDoctors",
            "yearEstablished",
            "branchImage",
            "logo",
            "popular",
            "isStandalone",
            "hospitalGroup",
            "createdDate",
            "updatedDate",
            "owner",
            "manualSort",
            "doctorNames",
            "ShowHospital",
            "showHospital",
"descriptionHtml",
            "description",
            "slug",

            "doctors",
            "DoctorMaster_hospital",
          ]
        },
        cacheKey,
        null,
        CACHE_CONFIG.HOSPITALS,
      );

      if (includeAll) {
        return res;
      }

      const filtered = res.filter((item: WixItem) => {
        const showHospital =
          item.ShowHospital ??
          item.showHospital ??
          (item.data as Record<string, unknown>)?.ShowHospital ??
          false;
        return (
          showHospital === true ||
          showHospital === "true" ||
          showHospital === 1 ||
          showHospital === "1" ||
          showHospital === "yes"
        );
      });

      // Keep the filtered variant separate so list pages do not re-fetch the
      // full collection on every request.
      memoryCache.set(cacheKey, filtered, CACHE_CONFIG.HOSPITALS * 1000);
      return filtered;
    });
  }

export async function fetchAllHospitals(limit?: number): Promise<WixItem[]> {
    return fetchCollection(
      COLLECTIONS.HOSPITALS,
      {
        include: [
          "specialty",
          "ShowHospital",
          "branches",
          "branches.doctors",
          "branches.city",
          "branches.specialty",
          "branches.department",
          "branches.subDepartment",
          "branches.accreditation",
          "branches.treatments",
          "branches.specialist",
          "branches.specialization",
          "treatments",
          "doctors",
          "hospital",
        ],
        sort: { field: "_createdDate", order: "asc" },
        limit: limit,
        projection: [
          "_id",
          "hospitalName",
          "logo",
          "specialty",
          "yearEstablished",
          "hospitalImage",
          "isStandalone",
          "originalBranchId",
          "branches",
          "branches.doctors",
          "doctors",
          "specialist",
          "treatments",
          "accreditations",
          "showHospital",
        ]
      },
      `all_hospitals_${limit ?? MAX_FETCH_LIMIT}`,
      [],
      CACHE_CONFIG.HOSPITALS,
    );
  }

  export async function fetchAllTreatments(limit?: number): Promise<WixItem[]> {
    return fetchCollection(
      COLLECTIONS.TREATMENTS,
      {
        include: [
          "branches",
          "hospital",
          "city",
          "department",
          "subDepartment_treatment",
          "SpecialistMap",
          "doctorCollection",
        ],
        limit: limit,
        projection: [
          "_id",
          "name",
          "slug",
          "description",
          "descriptionHtml",
          "category",
          "duration",
          "cost",
          "minPrice",
          "treatmentImage",
          "popular",
          "branchesAvailableAt",
          "subDepartment_treatment",
          "department",
          "SpecialistMap",
          "doctorCollection",
        ]
      },
      "all_treatments",
      [],
      CACHE_CONFIG.TREATMENTS,
    );
  }

export async function fetchAllDoctors(limit?: number): Promise<WixItem[]> {
    return fetchCollection(
      COLLECTIONS.DOCTORS,
      {
        include: [
          "specialist",
          "SpecialistMaster_specialist",
          "subDepartment_specialist",
          "BranchesMaster_doctor",
          "DoctorMaster_hospital",
          "hospital",
          "image",
          "specialization.treatments",
          "specialization.department",
        ],
        limit: limit,
        projection: [
          "_id",
          "doctorName",
          "profileImage",
          "specialization",
          "experienceYears",
          "designation",
          "popular",
          "hospitalId",
          "branchId",
          "slug",
          "awards",
          "achievements",
          "achievementsAwards",
          "DoctorMaster_hospital",
          "BranchesMaster_doctor",
          "branches",
          "city",
          "hospitalName",
          "branchName",
          "qualification",
          "hospital",
          "branch",
          // Exclude large fields: aboutDoctorHtml, aboutDoctor
        ]
      },
      `all_doctors_${limit ?? MAX_FETCH_LIMIT}`,
      [],
      CACHE_CONFIG.HOSPITALS,
    );
  }

export async function fetchHospitalsPage(offset: number = 0, limit: number = 20): Promise<{ items: any[]; totalCount: number }> {
    const cacheKey = `hospitals_page_${offset}_${limit}`;
    return fetchCollectionPaginated(
      COLLECTIONS.HOSPITALS,
      {
        include: [
          "specialty",
          "ShowHospital",
          "branches",
          "treatments",
          "doctors",
        ],
        sort: { field: "_createdDate", order: "asc" },
        limit: limit,
        offset: offset,
        projection: [
          "_id",
          "hospitalName",
          "logo",
          "specialty",
          "yearEstablished",
          "hospitalImage",
          "isStandalone",
          "originalBranchId",
          "branches",
          "doctors",
          "specialist",
          "treatments",
          "accreditations",
          "showHospital",
          // Exclude large fields: description, descriptionHtml
        ]
      },
      cacheKey,
      [],
      CACHE_CONFIG.HOSPITALS,
    );
  }

export async function fetchTreatmentsPage(offset: number = 0, limit: number = 20): Promise<{ items: any[]; totalCount: number }> {
    const cacheKey = `treatments_page_${offset}_${limit}`;
    return fetchCollectionPaginated(
      COLLECTIONS.TREATMENTS,
      {
        include: [
          "branches",
          "hospital",
          "city",
          "department",
          "subDepartment_treatment",
          "SpecialistMap",
          "doctorCollection",
        ],
        limit: limit,
        offset: offset,
        projection: [
          "_id",
          "name",
          "description",
          "descriptionHtml",
          "category",
          "duration",
          "cost",
          "minPrice",
          "treatmentImage",
          "popular",
          "branchesAvailableAt",
          "subDepartment_treatment",
          "SpecialistMap",
          "doctorCollection",
        ]
      },
      cacheKey,
      [],
      CACHE_CONFIG.TREATMENTS,
    );
  }

export async function fetchDoctorsPage(offset: number = 0, limit: number = 20): Promise<{ items: any[]; totalCount: number }> {
    const cacheKey = `doctors_page_${offset}_${limit}`;
    return fetchCollectionPaginated(
      COLLECTIONS.DOCTORS,
      {
        include: [
          "specialist",
          "SpecialistMaster_specialist",
          "subDepartment_specialist",
          "BranchesMaster_doctor",
          "hospital",
          "DoctorMaster_hospital",
          "image",
        ],
        limit: limit,
        offset: offset,
        projection: [
          "_id",
          "doctorName",
          "profileImage",
          "specialization",
          "experienceYears",
          "designation",
          "popular",
          "hospitalId",
          "branchId",
          "slug",
          "awards",
          "achievements",
          "achievementsAwards",
          "DoctorMaster_hospital",
          "BranchesMaster_doctor",
          "branches",
          "city",
          "hospitalName",
          "branchName",
          "qualification",
          // Exclude large fields: aboutDoctorHtml, aboutDoctor
        ]
      },
      cacheKey,
      [],
      CACHE_CONFIG.HOSPITALS,
    );
  }

export async function fetchAllStates(): Promise<
  Record<string, { _id: string; name: string }>
> {
    const cacheKey = "all_states_map";
    const cached =
      memoryCache.get<Record<string, { _id: string; name: string }>>(cacheKey);
    if (cached) return cached;

    return memoryCache.dedupe(cacheKey, async () => {
      const items = await fetchCollection(
        COLLECTIONS.STATES,
        { limit: MAX_FETCH_LIMIT, projection: ["_id", "state", "State Name", "name"] },
        cacheKey,
        [],
        CACHE_CONFIG.HOSPITALS,
      );

      const stateMap: Record<string, { _id: string; name: string }> = {};
      for (const item of items) {
        const id = item._id ?? item.ID;
        if (id) {
          stateMap[id] = {
            _id: id,
            name:
              item.state ||
              item["State Name"] ||
              item.name ||
              "Unknown State",
          };
        }
      }

      return Object.freeze(stateMap);
    });
  }
  

export async function fetchAllCities(): Promise<WixItem[]> {
    return fetchCollection(
      COLLECTIONS.CITIES,
      {
        include: ["state", "State", "stateRef", "stateMaster", "state_master"],
        projection: [
          "_id",
          "cityName",
          "name",
          "state",
          "State",
          "stateName",
          "country",
          "countryName",
        ]
      },
      "all_cities",
      FALLBACK_CITIES as any,
      CACHE_CONFIG.CITIES,
    );
  }

export async function fetchAllDepartments(limit?: number): Promise<WixItem[]> {
  return fetchCollection(
    COLLECTIONS.DEPARTMENTS,
    {
      // include 'image' so the Wix SDK expands the media field into a usable URL
      include: [
        "subDepartment_departmentMap",
        "BranchesMaster_department",
        "image",
      ],
      limit: limit,
    },
    `all_departments_${limit ?? MAX_FETCH_LIMIT}`,
    FALLBACK_DEPARTMENTS as any,
    CACHE_CONFIG.HOSPITALS,
  );
}

export async function fetchAllSpecialists(): Promise<WixItem[]> {
    return fetchCollection(
      COLLECTIONS.SPECIALTIES,
      {
        include: [
          "subDepartment_specialist",
          "TreatmentMaster_specialistMap",
          "treatment",
          "SpecialistMaster_department",
          "doctor",
          "branches",
          "BranchesMaster_specialist",
        ],
        projection: [
          "_id",
          "specialty",
          "DoctorMaster_specialization",
          "department",
          "BranchesMaster_specialist",
          "Treatment",
          "treatment",
          "createdAt",
          "updatedAt",
          "owner",
          // Exclude any large fields if present
        ]
      },
      "all_specialist",
      [],
      CACHE_CONFIG.HOSPITALS,
    );
  }

export async function fetchAllSubDepartments(): Promise<WixItem[]> {
  return fetchCollection(
    COLLECTIONS.SUB_DEPARTMENT,
    {
      include: [
        "subDepartment_specialist",
        "treatment",
        "Treatment",
        "departmentMap",
        "subDepartment_departmentMap",
        "BranchesMaster_subDepartment",
        "department",
      ],
      projection: [
        "_id",
        "name",
        "subDepartmentName",
        "subDepartment_specialist",
        "treatment",
        "Treatment",
        "departmentMap",
        "subDepartment_departmentMap",
        "BranchesMaster_subDepartment",
        "department",
      ],
    },
    "all_sub_departments",
    [],
    CACHE_CONFIG.HOSPITALS,
  );
}

export async function fetchAllTechnologies(): Promise<WixItem[]> {
    return fetchCollection(
      COLLECTIONS.TECHNOLOGIES,
      {
        limit: MAX_FETCH_LIMIT,
        include: ["TechnologiesGallery", "technologiesGallery", "DetailsHtml", "detailsHtml", "Details", "details", "DescriptionHtml", "descriptionHtml"],
        projection: [
          "_id",
          "heading",
          "Heading",
          "name",
          "description",
          "Description",
          "TechnologiesGallery",
          "technologiesGallery",
          "DetailsHtml",
          "detailsHtml",
          "Details",
          "details",
          "DescriptionHtml",
          "descriptionHtml",
          // Exclude any large fields if present
        ]
      },
      "all_technologies",
      [],
      CACHE_CONFIG.TECHNOLOGIES,
    );
  }

export async function fetchAllLogos(): Promise<WixItem[]> {
  return fetchCollection(
    COLLECTIONS.LOGO_SECTION,
    {
      limit: MAX_FETCH_LIMIT,
      projection: [
        "_id",
        "title",
        "logoTitle",
        "Logo Title",
        "logo",
        "Logo",
        "image",
        "Image",
      ]
    },
    "all_logos",
    [],
    CACHE_CONFIG.DEPARTMENTS,
  );
}

export async function fetchAllTestDiagnoses(): Promise<WixItem[]> {
  return fetchCollection(
    COLLECTIONS.TEST_DIAGNOSIS,
    {
      include: [
        "subTestDiagnosis_departmentMap",
        "BranchesMaster_TestDiagnosis",
        "image",
      ],
    },
    "all_test_diagnoses",
    [],
    CACHE_CONFIG.HOSPITALS,
  );
}

export async function fetchAllSubTestDiagnoses(): Promise<WixItem[]> {
  return fetchCollection(
    COLLECTIONS.SUB_TEST_DIAGNOSIS,
    {
      include: [
        "treatment",
        "Treatment",
        "departmentMap",
        "subTestDiagnosis_departmentMap",
      ],
      projection: [
        "_id",
        "name",
        "subTestDiagnosisName",
        "subTestDiagnosis",
        "treatment",
        "Treatment",
        "departmentMap",
        "subTestDiagnosis_departmentMap",
      ],
    },
    "all_sub_test_diagnoses",
    [],
    CACHE_CONFIG.HOSPITALS,
  );
}

export async function fetchTreatmentById(
  treatmentId: string,
): Promise<WixItem | null> {
  if (!treatmentId) return null;

  assertWixConfigured();

  const cacheKey = `treatment_${treatmentId}`;
  const cached = memoryCache.get<WixItem>(cacheKey);
  if (cached) return cached;

  return memoryCache.dedupe(cacheKey, async () => {
    try {
      const res = await wixClient.items
        .query(COLLECTIONS.TREATMENTS)
        .include(
          "branches",
          "hospital",
          "city",
          "department",
          "doctorCollection",
        )
        .eq("_id", treatmentId)
        .limit(1)
        .find();

      const item = res.items[0] ?? null;
      if (item) {
        memoryCache.set(cacheKey, item, CACHE_CONFIG.TREATMENTS * 1000);
      }
      return item;
    } catch (error) {
      console.error("Error fetching treatment by ID:", error);
      return null;
    }
  });
}

// =============================================================================
// BATCH FETCH UTILITY
// =============================================================================

export async function fetchByIds<T>(
  collection: string,
  ids: string[],
  mapper: (item: WixItem) => T,
): Promise<Record<string, T>> {
  if (!ids.length) return {};

  assertWixConfigured();

  const sortedIds = [...ids].sort();
  const cacheKey = `${collection}_${sortedIds.slice(0, 10).join("_")}_${sortedIds.length}`;
  const cached = memoryCache.get<Record<string, T>>(cacheKey);
  if (cached) return cached;

  return memoryCache.dedupe(cacheKey, async () => {
  let query = wixClient.items
    .query(collection)
    .hasSome("_id", sortedIds)
    .limit(MAX_FETCH_LIMIT);

  const firstPage: any = await Promise.race([
    query.find(),
    createFetchTimeout(collection),
  ]);

  const result: Record<string, T> = {};
  for (const item of firstPage.items || []) {
    const id = item._id;
    if (id) result[id] = mapper(item);
  }

  let currentIterator: any = firstPage;
  while (currentIterator?.hasNext?.()) {
    try {
      const nextIter = await Promise.race([
        currentIterator.next(),
        createFetchTimeout(collection),
      ]);
      const batch = (nextIter.items || []) as any[];
      if (batch.length === 0) break;
      for (const item of batch) {
        const id = item._id;
        if (id) result[id] = mapper(item);
      }
      currentIterator = nextIter;
    } catch (error: any) {
      console.warn(`Error fetching next page for ${collection}:`, error?.message);
      break;
    }
  }

  if (Object.keys(result).length > 0) {
    memoryCache.set(cacheKey, result, CACHE_CONFIG.HOSPITALS * 1000);
  }
  return result;
});
}

// =============================================================================
// GENERIC FETCH WITH PAGINATION AND TOTAL COUNT
// =============================================================================

/**
 * Fetch a paginated collection with total count
 * @param collection The collection name
 * @param options Query options (limit, offset, include, filter, sort, projection)
 * @param cacheKey The cache key for this request
 * @param fallback Fallback data if the fetch returns empty
 * @param ttlSeconds Time to live in seconds for the cache
 * @returns Object with items array and totalCount
 */
async function fetchCollectionPaginated(
  collection: string,
  options: {
    limit?: number;
    offset?: number;
    include?: string[];
    filter?: any;
    sort?: { field: string; order: "asc" | "desc" };
    projection?: string[];
  } = {},
  cacheKey: string,
  fallback: readonly any[] | null = null,
  ttlSeconds?: number,
): Promise<{ items: any[]; totalCount: number }> {
  assertWixConfigured();

  const cached = memoryCache.get<{ items: any[]; totalCount: number }>(cacheKey);
  if (cached) return cached;

  return memoryCache.dedupe(cacheKey, async () => {
    // Retry logic with exponential backoff
    let lastError: any = null;
    const maxRetries = 2;
    const baseDelay = 1000; // 1 second

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Limit page size to prevent oversized responses
        const pageSize = Math.min(options.limit ?? MAX_FETCH_LIMIT, PAGE_SIZE)

        // Build the base query
        let query = wixClient.items
          .query(collection)
          .limit(pageSize);

        // Apply offset if provided
        if (options.offset !== undefined) {
          query = query.skip(options.offset);
        }

        if (options.include?.length) {
          query = query.include(...options.include);
        }

        if (options.sort) {
          query =
            options.sort.order === "asc"
              ? query.ascending(options.sort.field)
              : query.descending(options.sort.field);
        }

        // Race the actual query against a timeout and accumulate all pages.
        // Wix SDK v1's @wix/data uses CursorBasedIterator for find() results —
        // the default page size is 10, so we must loop .hasNext()/.next() to
        // collect the full result set regardless of collection size.
        const firstPage: any = await Promise.race([
          query.find(),
          createFetchTimeout(collection),
        ]);
        const pageItems = (firstPage.items || []) as any[];

        // Walk through remaining pages via the CursorBasedIterator.
        // Use totalCount as a hard ceiling; fall back one item length-based
        // detector to defend against a Wix cursor that silently reports
        // totalCount == pageSize rather than the full collection size.
        const totalLimit = options.limit ?? MAX_FETCH_LIMIT;
        const totalCount = firstPage.totalCount ?? 0;

        let allItems: any[] = [];
        allItems = allItems.concat(pageItems);

        let currentIterator: any = firstPage;
        while (
          allItems.length < totalLimit &&
          currentIterator?.hasNext?.()
        ) {
          try {
            const nextIter = await Promise.race([
              currentIterator.next(),
              createFetchTimeout(collection),
            ]);
            const batch = (nextIter.items || []) as any[];
            // Zero items returned is the definitive end-of-data signal
            if (batch.length === 0) break;
            allItems = allItems.concat(batch);
            currentIterator = nextIter;
          } catch (error: any) {
            console.warn(
              `Error fetching next page for ${collection}:`,
              error?.message,
            );
            break;
          }
        }

        if (allItems.length === 0 && fallback) {
          console.warn(`Wix returned empty ${collection}, using fallback data`);
          const result = { items: [...fallback], totalCount: fallback.length };
          if (result.items.length > 0) {
            memoryCache.set(
              cacheKey,
              result,
              ttlSeconds ? ttlSeconds * 1000 : CACHE_CONFIG.HOSPITALS * 1000,
            );
          }
          return result;
        }

        // Cache empty pages as well. Otherwise a valid empty page repeatedly
        // hits Wix and defeats request deduplication after the promise settles.
        const result = { items: allItems, totalCount };
        memoryCache.set(
          cacheKey,
          result,
          ttlSeconds ? ttlSeconds * 1000 : CACHE_CONFIG.HOSPITALS * 1000,
        );
        return result;
      } catch (error: any) {
        lastError = error;

        // If the collection itself does not exist, retrying is pointless —
        // return the fallback immediately instead of wasting retry attempts.
        if (isCollectionNotFoundError(error)) {
          console.debug(
            `Collection ${collection} does not exist, skipping retries and using fallback.`,
          );
          if (fallback !== null) {
            return { items: [...fallback], totalCount: fallback.length };
          }
          return { items: [], totalCount: 0 };
        }

        console.warn(
          `Attempt ${attempt + 1} failed for ${collection}:`,
          error?.message,
        );

        // If we've exhausted retries, break and handle error
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff delay
        await new Promise((resolve) =>
          setTimeout(resolve, baseDelay * Math.pow(2, attempt)),
        );
      }
    }

    // All retries exhausted
    if (fallback !== null) {
      console.warn(
        `Error fetching ${collection} after ${maxRetries + 1} attempts, using fallback:`,
        lastError?.message,
      );
      return { items: [...fallback], totalCount: fallback.length };
    }
    console.error(
      `Error fetching ${collection} after ${maxRetries + 1} attempts:`,
      lastError,
    );
    return { items: [], totalCount: 0 };
  });
}

// =============================================================================
// SPECIALIST FETCHERS
// =============================================================================

export async function fetchSpecialistWithTreatments(
  specialistIds: string[],
): Promise<Record<string, any>> {
  assertWixConfigured();

  const allIdsEmpty = !specialistIds || specialistIds.length === 0;

  if (allIdsEmpty) {
    const cacheKey = "all_specialist_enriched";
    const cached = memoryCache.get<Record<string, any>>(cacheKey);
    if (cached) return cached;

    try {
      const specialists = await fetchAllSpecialists();
      const result: Record<string, any> = {};
      for (const item of specialists) {
        if (item._id) result[item._id] = item;
      }
      if (Object.keys(result).length > 0) {
        memoryCache.set(cacheKey, result, CACHE_CONFIG.HOSPITALS * 1000);
      }
      return result;
    } catch {
      return {};
    }
  }

  const sortedIds = [...specialistIds].sort();
  const cacheKey = `specialist_with_treatments_${sortedIds.slice(0, 10).join("_")}_${sortedIds.length}`;
  const cached = memoryCache.get<Record<string, any>>(cacheKey);
  if (cached) return cached;

  return memoryCache.dedupe(cacheKey, async () => {
    let query = wixClient.items
      .query(COLLECTIONS.SPECIALTIES)
      .hasSome("_id", sortedIds)
      .include(
        "treatment",
        "SubDepartment",
        "SpecialistMaster_department",
        "TreatmentMaster_specialistMap",
      )
      .limit(MAX_FETCH_LIMIT);

    const firstPage: any = await Promise.race([
      query.find(),
      createFetchTimeout(COLLECTIONS.SPECIALTIES),
    ]);

    const result: Record<string, any> = {};
    for (const item of firstPage.items || []) {
      if (item._id) result[item._id] = item;
    }

    let currentIterator: any = firstPage;
    while (currentIterator?.hasNext?.()) {
      try {
        const nextIter = await Promise.race([
          currentIterator.next(),
          createFetchTimeout(COLLECTIONS.SPECIALTIES),
        ]);
        const batch = (nextIter.items || []) as any[];
        if (batch.length === 0) break;
        for (const item of batch) {
          if (item._id) result[item._id] = item;
        }
        currentIterator = nextIter;
      } catch (error: any) {
        console.warn(`Error fetching next page for ${COLLECTIONS.SPECIALTIES}:`, error?.message);
        break;
      }
    }

    if (Object.keys(result).length > 0) {
      memoryCache.set(cacheKey, result, CACHE_CONFIG.HOSPITALS * 1000);
    }
    return result;
  });
}

export async function fetchSpecialistsByBranchId(
  branchId: string,
): Promise<Record<string, any>> {
  const cacheKey = `specialist_by_branch_${branchId}`;
  const cached = memoryCache.get<Record<string, any>>(cacheKey);
  if (cached) return cached;

  try {
    const allSpecialists = await fetchAllSpecialists();
    const result: Record<string, any> = {};

    for (const spec of allSpecialists) {
      const branchRefs =
        spec.BranchesMaster_specialist || spec.branches || spec.branchId;
      let branchIds: string[] = [];

      if (Array.isArray(branchRefs)) {
        branchIds = branchRefs.map((b: any) => b?._id || b?.ID || b);
      } else if (branchRefs && typeof branchRefs === "object") {
        branchIds = [
          (branchRefs as any)?._id ||
            (branchRefs as any)?.ID ||
            String(branchRefs),
        ];
      } else if (branchRefs) {
        branchIds = [String(branchRefs)];
      }

      if (
        branchIds.some(
          (id) =>
            id === branchId || id?.toLowerCase() === branchId?.toLowerCase(),
        )
      ) {
        const id = spec._id || spec.ID;
        if (id) result[id] = spec;
      }
    }

    if (Object.keys(result).length > 0) {
      memoryCache.set(cacheKey, result, CACHE_CONFIG.HOSPITALS * 1000);
    }
    return result;
  } catch {
    return {};
  }
}

// =============================================================================
// SERVER-SIDE EXPORTS
// The underlying fetchers already use in-memory caching via memoryCache.
// unstable_cache is intentionally not used here because the CMS payloads
// routinely exceed Next.js's 2MB data-cache limit.
// =============================================================================

const cmsRevalidate = CACHE_CONFIG.HOSPITALS;

export const fetchAllBranchesCached = fetchAllBranches
export const fetchAllHospitalsCached = fetchAllHospitals
export const fetchAllTreatmentsCached = fetchAllTreatments
export const fetchAllDoctorsCached = fetchAllDoctors
export const fetchAllCitiesCached = fetchAllCities
export const fetchAllDepartmentsCached = fetchAllDepartments
export const fetchAllSpecialistsCached = fetchAllSpecialists
export const fetchAllStatesCached = fetchAllStates
export const fetchAllSubDepartmentsCached = fetchAllSubDepartments
export const fetchAllTechnologiesCached = fetchAllTechnologies
export const fetchAllLogosCached = fetchAllLogos
export const fetchSpecialistWithTreatmentsCached = fetchSpecialistWithTreatments
export const fetchAllTestDiagnosesCached = fetchAllTestDiagnoses
export const fetchAllSubTestDiagnosesCached = fetchAllSubTestDiagnoses

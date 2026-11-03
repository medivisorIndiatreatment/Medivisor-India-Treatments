// lib/cms/slug-index.ts
// Slug -> entity indexes used by treatment/[slug] and hospital-branches/[slug] pages.
// These now use lightweight fetchers that only pull the minimum required fields
// instead of the full CMS dataset, dramatically improving cold-start performance.

import { memoryCache, CACHE_CONFIG } from './cache';
import {
  generateSlug,
  generateBranchSlug,
  cleanSlug,
} from '@/lib/slug-utils';
import {
  fetchTreatmentSlugIndex,
  fetchBranchSlugIndex,
  type TreatmentSlugIndex as LightTreatmentSlugIndex,
  type BranchSlugIndex as LightBranchSlugIndex,
} from './optimized-fetchers';

const TREATMENT_INDEX_KEY = 'cms_treatment_slug_index';
const BRANCH_INDEX_KEY = 'cms_branch_slug_index';

export interface TreatmentSlugIndex {
  bySlug: Map<string, any>;
  byId: Map<string, any>;
  staticParams: Array<{ slug: string }>;
}

export interface BranchSlugIndex {
  bySlug: Map<string, any>;
  byId: Map<string, any>;
  staticParams: Array<{ slug: string }>;
}

export async function getTreatmentSlugIndex(): Promise<TreatmentSlugIndex> {
  const cached = memoryCache.get<TreatmentSlugIndex>(TREATMENT_INDEX_KEY);
  if (cached) return cached;

  return memoryCache.dedupe(TREATMENT_INDEX_KEY, async () => {
    const lightIndex = await fetchTreatmentSlugIndex();

    // Convert lightweight entries to full entries for backward compatibility
    const bySlug = new Map<string, any>();
    const byId = new Map<string, any>();

    for (const [slug, entry] of lightIndex.bySlug) {
      bySlug.set(slug, entry);
    }
    for (const [id, entry] of lightIndex.byId) {
      byId.set(id, entry);
    }

    const index: TreatmentSlugIndex = { bySlug, byId, staticParams: lightIndex.staticParams };
    memoryCache.set(TREATMENT_INDEX_KEY, index, CACHE_CONFIG.HOSPITALS * 1000);
    return index;
  });
}

export async function getBranchSlugIndex(): Promise<BranchSlugIndex> {
  const cached = memoryCache.get<BranchSlugIndex>(BRANCH_INDEX_KEY);
  if (cached) return cached;

  return memoryCache.dedupe(BRANCH_INDEX_KEY, async () => {
    const lightIndex = await fetchBranchSlugIndex();

    const bySlug = new Map<string, any>();
    const byId = new Map<string, any>();

    for (const [slug, entry] of lightIndex.bySlug) {
      bySlug.set(slug, entry);
    }
    for (const [id, entry] of lightIndex.byId) {
      byId.set(id, entry);
    }

    const index: BranchSlugIndex = { bySlug, byId, staticParams: lightIndex.staticParams };
    memoryCache.set(BRANCH_INDEX_KEY, index, CACHE_CONFIG.HOSPITALS * 1000);
    return index;
  });
}

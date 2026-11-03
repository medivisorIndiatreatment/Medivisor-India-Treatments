/**
 * hooks/index.ts
 * Central export for all custom hooks
 * 
 * CONSOLIDATION PLAN:
 * Phase 1 (NEW): Generic hooks replacing 133 duplicate patterns:
 * - useDataFetcher: Generic data fetching with caching, retries, timeout
 * - useListData: Paginated lists with built-in pagination controls
 * - useDetailData: Single item/detail page data
 * - useSearchData: Search with debouncing
 * - useAsyncState: Unified async state management
 * 
 * Phase 2 (LEGACY - Migrate gradually):
 * - useCMSData, useDepartmentData, useBranchData, etc. 
 *   These will be refactored to use new generic hooks internally
 */

// ============================================================================
// NEW CONSOLIDATED HOOKS (Use these for new components)
// ============================================================================

// Generic data fetching hooks - recommended for all new components
export { useDataFetcher } from '../lib/hooks/useDataFetcher'
export { useListData } from '../lib/hooks/useListData'
export { useDetailData } from '../lib/hooks/useDetailData'
export { useSearchData } from '../lib/hooks/useSearchData'
export { useAsyncState } from '../lib/hooks/useAsyncState'

export type { DataFetcherConfig, DataFetcherReturn } from '../lib/hooks/useDataFetcher'
export type { ListFetcherConfig, ListResult, UseListDataReturn } from '../lib/hooks/useListData'
export type { DetailFetcherConfig, UseDetailDataReturn } from '../lib/hooks/useDetailData'
export type { SearchDataConfig, UseSearchDataReturn } from '../lib/hooks/useSearchData'
export type { AsyncState, UseAsyncStateReturn } from '../lib/hooks/useAsyncState'

// ============================================================================
// LEGACY HOOKS (Gradually migrate to new hooks above)
// ============================================================================

// Data fetching hooks
export { useVideos } from './useVideos'

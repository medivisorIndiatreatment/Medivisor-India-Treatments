/**
 * Search Components Index
 * Central export for all search-related components
 * 
 * Organization:
 * - Cards: HospitalCard, DoctorCard, TreatmentCard
 * - Inputs: UnifiedSearchInput (recommended for new code)
 * - Filters: FilterDropdown
 * - Layout: ViewToggle, ResultsHeader, BreadcrumbNav, RenderContent, LoadMoreButton
 */

// =============================================================================
// CARD COMPONENTS
// =============================================================================

export { default as HospitalCard } from "@/components/ui/HospitalCard"
export { default as DoctorCard } from "./DoctorCard"
export { default as TreatmentCard } from "./TreatmentCard"

// =============================================================================
// SEARCH INPUTS
// =============================================================================

// Recommended: UnifiedSearchInput for combined search functionality
export { default as UnifiedSearchInput } from "./UnifiedSearchInput"

// Legacy exports - use UnifiedSearchInput for new code
export { default as SearchInput } from "./SearchInput"
export { default as TreatmentSearchInput } from "./TreatmentSearchInput"

// =============================================================================
// FILTERS
// =============================================================================

export { default as FilterDropdown } from "./FilterDropdown"

// =============================================================================
// VIEW TOGGLE
// =============================================================================

export { default as ViewToggle } from "./ViewToggle"
export type { ViewType } from "./ViewToggle"

// =============================================================================
// LAYOUT COMPONENTS
// =============================================================================

export { 
  ResultsHeader, 
  MobileFilterButton, 
  BreadcrumbNav, 
  RenderContent,
  LoadMoreButton,
  defaultBreadcrumbItems 
} from "./LayoutComponents"

export type { SortOption, ResultsHeaderProps, RenderContentProps } from "./LayoutComponents"

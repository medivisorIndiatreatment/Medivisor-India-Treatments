/**
 * LayoutComponents Module
 * Contains layout-related components for the search page:
 * - ResultsHeader: Sort dropdown for filtering results
 * - BreadcrumbNav: Breadcrumb navigation
 * - MobileFilterButton: Mobile filter toggle
 * - RenderContent: Main content renderer with loading/empty states
 * - ResultsGrid: Modern responsive grid with equal-height cards
 * - LoadMoreButton: Pagination button for loading more results
 */

"use client";

import { memo } from "react";
import { Filter, Grid3X3, SlidersHorizontal, ChevronDown, Loader2 } from "lucide-react";
import BreadcrumbNav from "@/components/ui/BreadcrumbNav";
import HospitalCard from "@/components/ui/HospitalCard";
import DoctorCard from "@/components/cards/DoctorCard"
import TreatmentCard from "./TreatmentCard";

// =============================================================================
// EXPORTS
// =============================================================================

export { BreadcrumbNav };

export const defaultBreadcrumbItems = [{ label: "Search", href: "/search" }];

// =============================================================================
// TYPES
// =============================================================================

export type SortOption = "relevance" | "popular" | "az" | "za";

export interface ResultsHeaderProps {
  sortBy: SortOption;
  setSortBy: (sortBy: SortOption) => void;
}

export interface MobileFilterButtonProps {
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
}

export type ViewType = "hospitals" | "doctors" | "treatments";

export interface RenderContentProps {
  view: ViewType;
  loading: boolean;
  currentCount: number;
  filteredBranches: unknown[];
  filteredDoctors: unknown[];
  filteredTreatments: unknown[];
  sortBy?: SortOption;
  totalBranches?: number;
  totalDoctors?: number;
  totalTreatments?: number;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

// =============================================================================
// MEMOIZED COMPONENTS
// =============================================================================

export const MemoizedResultsHeader = memo(function ResultsHeader({ sortBy, setSortBy }: ResultsHeaderProps) {
  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "popular", label: "Most Popular" },
    { value: "az", label: "A-Z" },
    { value: "za", label: "Z-A" },
  ];

  return (
    <div className="relative w-full max-w-[140px]">
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortOption)}
        className="appearance-none w-full pl-3 pr-8 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#74BF44]/30 focus:border-[#74BF44]/50 cursor-pointer shadow-xs"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
});

export const MemoizedMobileFilterButton = memo(function MobileFilterButton({
  setShowFilters,
}: MobileFilterButtonProps) {
  return (
    <button
      onClick={() => setShowFilters(true)}
      className="fixed bottom-4 right-4 z-40 bg-[#E22026] text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 md:hidden hover:bg-[#c41c20] transition-colors"
    >
      <Filter className="w-5 h-5" />
      <span>Filters</span>
    </button>
  );
});

// =============================================================================
// SKELETON & GRID
// =============================================================================

function SkeletonCard() {
  return (
    <div className="bg-white rounded-md p-4 shadow-sm animate-pulse flex flex-col h-full border border-gray-100">
      <div className="h-44 sm:h-52 w-full flex-shrink-0 bg-gray-200 rounded-lg mb-4" />
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-1/2 min-h-[16px]" />
    </div>
  );
}

const ResultsGrid = memo(function ResultsGrid({
  data,
  renderCard,
}: {
  data: unknown[];
  renderCard: (item: unknown, index: number) => React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
      {data.map((item, index) => (
        <div
          key={(item as { _id?: string })._id ?? index}
          className="h-full transform transition-all duration-300 animate-fade-in"
          style={{
            animationDelay: `${(index % 8) * 50}ms`,
          }}
        >
          {renderCard(item, index)}
        </div>
      ))}
    </div>
  );
});

// =============================================================================
// LOAD MORE BUTTON
// =============================================================================

export const LoadMoreButton = memo(function LoadMoreButton({
  loading,
  onClick,
  hasMore,
}: {
  loading: boolean;
  onClick: () => void;
  hasMore: boolean;
}) {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-10">
      <button
        onClick={onClick}
        disabled={loading}
        className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            Load More
          </>
        )}
      </button>
    </div>
  );
});

// =============================================================================
// EMPTY STATE
// =============================================================================

const EmptyState = memo(function EmptyState({ view }: { view: ViewType }) {
  const viewLabel =
    view === "hospitals"
      ? "hospitals"
      : view === "doctors"
        ? "doctors"
        : "treatments";

  return (
    <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <SlidersHorizontal className="w-12 h-12 text-gray-300" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        No {viewLabel} found
      </h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        Try adjusting your filters or search criteria to find what you are
        looking for.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="px-4 py-2 bg-gray-50 text-gray-600 text-sm rounded-lg">
          Check spelling
        </span>
        <span className="px-4 py-2 bg-gray-50 text-gray-600 text-sm rounded-lg">
          Try broader search
        </span>
        <span className="px-4 py-2 bg-gray-50 text-gray-600 text-sm rounded-lg">
          Remove filters
        </span>
      </div>
    </div>
  );
});

// =============================================================================
// RENDER CONTENT
// =============================================================================

export const RenderContent = memo(function RenderContent({
  view,
  loading,
  currentCount,
  filteredBranches,
  filteredDoctors,
  filteredTreatments,
  sortBy = "relevance",
  totalBranches = 0,
  totalDoctors = 0,
  totalTreatments = 0,
  hasMore = false,
  onLoadMore,
}: RenderContentProps) {
  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // Render a single card based on the active view type
  const renderItemCard = (item: unknown, cardView: ViewType, index: number) => {
    const itemData = item as { _id?: string };
    const key = itemData._id || index;

    if (cardView === "hospitals") {
      return (
        <HospitalCard
          key={key}
          data={item as Parameters<typeof HospitalCard>[0]["data"]}
        />
      );
    }
    if (cardView === "doctors") {
      return (
        <DoctorCard
          key={key}
          doctor={item as Parameters<typeof DoctorCard>[0]["doctor"]}
        />
      );
    }
    return (
      <TreatmentCard
        key={key}
        treatment={item as Parameters<typeof TreatmentCard>[0]["treatment"]}
      />
    );
  };

  const data = view === "hospitals" ? filteredBranches
    : view === "doctors" ? filteredDoctors
    : filteredTreatments;

  // Empty state
  if (data.length === 0) {
    return <EmptyState view={view} />;
  }

  // Render content
  const renderCard = (item: unknown, index: number) =>
    renderItemCard(item, view, index);

  return (
    <div>
      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-bold text-gray-900">{currentCount}</span> result
          {currentCount !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">Grid View</span>
        </div>
      </div>

      {/* Results Grid */}
      <ResultsGrid data={data} renderCard={renderCard} />

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <LoadMoreButton loading={loading} onClick={onLoadMore} hasMore={hasMore} />
      )}
    </div>
  );
})

// Backward-compatible aliases
export const ResultsHeader = MemoizedResultsHeader
export const MobileFilterButton = MemoizedMobileFilterButton

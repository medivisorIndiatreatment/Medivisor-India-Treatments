// app/search/loading.tsx
// Loading skeleton for search page with pixel-perfect UI matching

function SearchPageSkeleton() {
  return (
    <div className="bg-white min-h-screen">
      {/* Banner Skeleton */}
      <div className="relative w-full h-[280px] md:h-[320px] bg-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800/90 to-gray-800/70" />
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl space-y-4">
            <div className="h-5 w-40 bg-gray-300/60 rounded" />
            <div className="h-10 w-[350px] bg-gray-200 rounded" />
            <div className="h-6 w-[280px] bg-gray-200/80 rounded" />
          </div>
        </div>
      </div>

      {/* Breadcrumb Skeleton */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-4 bg-gray-300 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Sticky Filter Section Skeleton */}
      <div className="sticky top-[56px] lg:top-[75px] z-40 bg-white border-b border-gray-200">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <div className="py-3 sm:py-4">
            <div className="grid lg:grid-cols-12 gap-4 items-center">
              {/* Left: View Tabs Skeleton */}
              <div className="lg:col-span-4">
<div className="w-full max-w-md bg-white rounded-lg p-1 shadow-sm border border-gray-200/70">
                   <div className="flex gap-2">
                     <div className="flex-1 h-10 bg-gray-100 rounded-md" />
                     <div className="flex-1 h-10 bg-gray-100 rounded-md" />
                     <div className="flex-1 h-10 bg-gray-100 rounded-md" />
                   </div>
                 </div>
              </div>

              {/* Right Section Skeleton */}
              <div className="lg:col-span-8">
                <div className="flex flex-wrap items-center justify-end gap-3">
                  {/* Search Input Skeleton */}
                  <div className="min-w-[200px] flex-1 max-w-[300px]">
                    <div className="h-10 w-full bg-gray-100 rounded-md" />
                  </div>

                  {/* City Filter Skeleton */}
                  <div className="min-w-[180px] flex-1 max-w-[220px]">
                    <div className="h-10 w-full bg-gray-100 rounded-md" />
                  </div>

                  {/* Sort Skeleton */}
                  <div className="min-w-[140px]">
                    <div className="h-10 w-full bg-gray-100 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Content Skeleton */}
      <section className="bg-gray-50 pt-6 pb-10">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          {/* Results Count Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>

          {/* Cards Grid Skeleton - matches grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SearchResultCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// Individual card skeleton matching HospitalCard/TreatmentCard structure
function SearchResultCardSkeleton() {
  return (
    <div className="bg-white rounded-md shadow-xs overflow-hidden border border-gray-100 h-full">
      {/* Image Section - matches h-56 md:h-48 */}
      <div className="relative h-56 md:h-48 overflow-hidden bg-gray-200" />
      
      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1 overflow-hidden space-y-3">
        {/* Name skeleton */}
        <div className="h-5 w-full bg-gray-100 rounded" />
        
        {/* Specialty skeleton */}
        <div className="h-4 w-[70%] bg-gray-100 rounded" />
        
        {/* Location skeleton */}
        <div className="h-4 w-[60%] bg-gray-100 rounded" />
      </div>
    </div>
  )
}

export default SearchPageSkeleton
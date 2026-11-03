// components/ui/HospitalGroupSkeletons.tsx
// Premium skeleton components matching exact section heights and layouts for Hospital Group Detail Page

"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function HospitalGroupHeroSkeleton({ className }: SkeletonProps) {
  return (
    <section className={cn("relative w-full h-[40vh] md:h-[70vh]", className)}>
      {/* Full Width Banner Image Skeleton */}
      <div className="absolute inset-0 bg-gray-200" />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      {/* Bottom Content - matches actual HeroSection */}
      <div className="absolute bottom-0 left-0 w-full z-10 pb-4 md:pb-12 text-white">
        <div className="container mx-auto">
          {/* Main Title Skeleton - matches h1 styles */}
          <div className="text-3xl sm:text-5xl md:text-4xl lg:text-5xl font-normal md:font-light leading-tight">
            <div className="h-[50px] w-[350px] bg-gray-200 rounded mb-2" />
          </div>
          
          {/* Subtitle Skeleton */}
          <div className="text-lg md:text-xl mt-2 text-gray-200">
            <div className="h-6 w-[250px] bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HospitalGroupInfoSkeleton({ className }: SkeletonProps) {
  return (
    <section className={cn("py-10 md:py-10", className)}>
      <div className="container mx-auto px-[5px] md:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Content Skeleton */}
          <div className="lg:col-span-3">
            {/* Rich Content Skeleton - matching prose styling */}
            <div className="prose custom-list space-y-2 first-heading prose-lg max-w-none">
              {/* Title skeleton */}
              <div className="h-8 w-[200px] bg-gray-200 rounded mb-4" />
              
              {/* Paragraph lines - matching actual content */}
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-[90%] bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-[85%] bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-[80%] bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-[90%] bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
              </div>
            </div>
          </div>
          
          {/* Right Column - Sticky Contact Form Skeleton */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-md shadow-xs overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-100">
                  <div className="h-6 w-[150px] bg-gray-200 rounded mx-auto" />
                </div>
                <div className="p-6 space-y-5">
                  <div className="h-10 w-full bg-gray-100 rounded-md" />
                  <div className="h-10 w-full bg-gray-100 rounded-md" />
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="h-10 w-24 bg-gray-100 rounded-md flex-shrink-0" />
                      <div className="h-10 flex-1 bg-gray-100 rounded-md" />
                    </div>
                    <div className="h-4 w-[200px] bg-gray-100 rounded-md" />
                  </div>
                  <div className="h-[120px] w-full bg-gray-100 rounded-md" />
                  <div className="h-12 w-full bg-gray-100 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HospitalGroupBranchesSkeleton({ className }: SkeletonProps) {
  return (
    <section className={cn("py-10 md:py-10 bg-gray-50", className)}>
      <div className="container mx-auto px-[5px] md:px-0">
        {/* Section Heading Skeleton */}
        <div className="mb-4">
          <div className="h-10 w-[220px] bg-gray-200 rounded" />
        </div>
        
        {/* City Filter Skeleton */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <div key={index} className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-100 text-gray-700 h-8 w-[80px]" />
          ))}
        </div>
        
        {/* Branches Grid Skeleton - 4 cards per row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
            <div key={index} className="block group bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-full">
              <div className="relative h-60 md:h-40 overflow-hidden">
                <div className="absolute inset-0 bg-gray-200" />
                {/* Accreditation Badge Skeleton - Top Right */}
                <div className="absolute top-2 right-2">
                  <div className="h-8 w-auto bg-gray-200 rounded-md px-1 py-0.5" />
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1 bg-gray-50 overflow-hidden">
                <div className="mb-1 overflow-hidden">
                  <div className="h-5 w-full bg-gray-200 rounded" />
                </div>
                
                <div className="h-4 w-[80%] bg-gray-200 rounded mb-1" />
                
                <div className="h-4 w-full flex items-center bg-gray-200 mb-3">
                  <div className="h-4 w-4 bg-gray-200 mr-1" />
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                </div>
                
                <footer className="border-t border-gray-100 pt-2 mt-auto">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center rounded-xs bg-gray-50 p-2 border border-gray-50">
                      <div className="h-5 w-full bg-gray-200 rounded" />
                      <div className="h-3 w-full bg-gray-200 rounded mt-1" />
                    </div>
                    <div className="text-center rounded-xs bg-gray-50 p-2 border border-gray-50">
                      <div className="h-5 w-full bg-gray-200 rounded" />
                      <div className="h-3 w-full bg-gray-200 rounded mt-1" />
                    </div>
                    <div className="text-center rounded-xs bg-gray-50 p-2 border border-gray-50">
                      <div className="h-5 w-full bg-gray-200 rounded" />
                      <div className="h-3 w-full bg-gray-200 rounded mt-1" />
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HospitalGroupSimilarGroupsSkeleton({ className }: SkeletonProps) {
  return (
    <section className={cn("py-10 md:py-10 bg-white", className)}>
      <div className="container mx-auto px-[5px] md:px-0">
        {/* Section Heading Skeleton */}
        <div className="md:flex items-center md:mb-4 mb-2 md:px-0 px-[5px] justify-between w-full">
          <div className="h-10 w-[200px] bg-gray-200 rounded" />
          <div className="relative w-full md:w-[340px] mb-2 md:mb-0">
            <div className="h-10 w-full bg-gray-100 rounded-md" />
          </div>
        </div>
        
        {/* Similar Groups Carousel Skeleton */}
        <div className="relative">
          <div className="px-0">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
              <div key={index} className="px-0">
                <div className="block group bg-white border border-gray-100 rounded-xs overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="relative h-60 md:h-40 overflow-hidden">
                    <div className="absolute inset-0 bg-gray-200" />
                    {/* Accreditation Badge Skeleton - Top Right */}
                    <div className="absolute top-2 right-2">
                      <div className="h-8 w-auto bg-gray-200 rounded-md px-1 py-0.5" />
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1 bg-gray-50 border border-gray-200 overflow-hidden">
                    <div className="mb-1 overflow-hidden">
                      <div className="h-5 w-full bg-gray-200 rounded" />
                    </div>
                    <div className="h-4 w-[60%] bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HospitalGroupBreadcrumbSkeleton({ className }: SkeletonProps) {
  return (
    <nav className={cn("container mx-auto px-4 py-4", className)}>
      <div className="flex items-center gap-2">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-300 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
    </nav>
  );
}
// components/ui/TreatmentPageSkeletons.tsx
// Premium skeleton components matching exact section heights and layouts for Treatment Detail Page

"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function TreatmentHeroSkeleton({ className }: SkeletonProps) {
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
            <div className="h-[50px] w-[320px] bg-gray-200 rounded mb-2" />
          </div>
          
          {/* Subtitle Skeleton */}
          <div className="text-lg md:text-xl mt-2 text-gray-200">
            <div className="h-6 w-[180px] bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function TreatmentBreadcrumbSkeleton({ className }: SkeletonProps) {
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

export function TreatmentContentSkeleton({ className }: SkeletonProps) {
  return (
    <section className={cn("py-10 md:py-10 md:px-0 px-[5px]", className)}>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left Column - Content */}
          <div className="lg:col-span-3">
            {/* Main Content Section - matches prose styling */}
            <div className="prose custom-list space-y-2 first-heading prose-lg max-w-none mb-8">
              {/* Title skeleton */}
              <div className="h-8 w-[200px] bg-gray-200 rounded mb-4" />
              
              {/* Paragraph lines - matches actual content */}
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

            {/* Treatment Info Cards - matches Card component */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {/* Cost Card */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 md:p-6">
                  <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-8 w-40 bg-gray-200 rounded" />
                </div>
              </div>
              
              {/* Duration Card */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 md:p-6">
                  <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-8 w-40 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Contact Form - matches actual layout */}
          <div className="lg:col-span-1 md:block hidden">
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

export function TreatmentHospitalsSkeleton({ className }: SkeletonProps) {
  return (
    <section className={cn("bg-gray-50 px-2 md:px-0 pb-5 py-8 md:pb-10 md:py-12", className)}>
      <div className="container mx-auto">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 md:mb-5 mb-2 md:px-0 px-[5px]">
          <div className="h-10 w-[180px] bg-gray-200 rounded" />
          <div className="h-10 w-full md:w-96 bg-gray-100 rounded-md" />
        </div>
        
        {/* Hospital Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xs overflow-hidden">
              <div className="h-60 md:h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                  <div className="h-12 bg-gray-100 rounded" />
                  <div className="h-12 bg-gray-100 rounded" />
                  <div className="h-12 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TreatmentMobileContactSkeleton({ className }: SkeletonProps) {
  return (
    <section className={cn("px-[5px] py-5 md:hidden block", className)}>
      <div className="bg-white rounded-md shadow-xs overflow-hidden border border-gray-200 p-4 space-y-4">
        <div className="h-10 w-full bg-gray-100 rounded-md" />
        <div className="h-10 w-full bg-gray-100 rounded-md" />
        <div className="flex gap-2">
          <div className="h-10 w-20 bg-gray-100 rounded-md flex-shrink-0" />
          <div className="h-10 flex-1 bg-gray-100 rounded-md" />
        </div>
        <div className="h-20 w-full bg-gray-100 rounded-md" />
        <div className="h-12 w-full bg-gray-100 rounded-md" />
      </div>
    </section>
  );
}
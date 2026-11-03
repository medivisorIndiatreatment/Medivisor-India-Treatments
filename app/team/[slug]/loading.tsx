// app/team/[slug]/loading.tsx
// Loading skeleton for team member detail page with staggered animations

import { Skeleton, SkeletonItem } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section Skeleton - loads first */}
      <div className="relative w-full h-[40vh] md:h-[50vh] bg-gray-200 skeleton-shimmer">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-white/10" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 pb-6 md:pb-12">
            <div className="flex items-center gap-6">
              {/* Team Member Avatar Skeleton */}
              <SkeletonItem className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-400" delay={0} />
              <div>
                <SkeletonItem className="h-10 w-64 mb-3 bg-gray-400" delay={50} />
                <SkeletonItem className="h-6 w-48 mb-2 bg-gray-400" delay={100} />
                <SkeletonItem className="h-5 w-56 bg-gray-400" delay={150} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb Skeleton - loads second */}
      <div className="container mx-auto px-4 py-4">
        <SkeletonItem className="h-6 w-48 bg-gray-300" delay={100} />
      </div>

      {/* Main Content Skeleton - loads third */}
      <section className="container mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Details */}
          <div className="lg:col-span-2">
            {/* About Section - loads fourth */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <SkeletonItem className="h-8 w-32 mb-4 bg-gray-300" delay={250} />
              <SkeletonItem className="h-4 w-full mb-2 bg-gray-200" delay={300} />
              <SkeletonItem className="h-4 w-full mb-2 bg-gray-200" delay={350} />
              <SkeletonItem className="h-4 w-full mb-2 bg-gray-200" delay={400} />
              <SkeletonItem className="h-4 w-4/5 bg-gray-200" delay={450} />
            </div>

            {/* Specializations - loads fifth */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
              <SkeletonItem className="h-8 w-40 mb-4 bg-gray-300" delay={400} />
              <div className="flex flex-wrap gap-2">
                <SkeletonItem className="h-8 w-24 bg-gray-200 rounded-full" delay={450} />
                <SkeletonItem className="h-8 w-28 bg-gray-200 rounded-full" delay={500} />
                <SkeletonItem className="h-8 w-32 bg-gray-200 rounded-full" delay={550} />
              </div>
            </div>

            {/* Experience - loads sixth */}
            <div className="bg-gray-50 rounded-lg p-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
              <SkeletonItem className="h-8 w-36 mb-4 bg-gray-300" delay={550} />
              <SkeletonItem className="h-4 w-full mb-2 bg-gray-200" delay={600} />
              <SkeletonItem className="h-4 w-full mb-2 bg-gray-200" delay={650} />
              <SkeletonItem className="h-4 w-3/4 bg-gray-200" delay={700} />
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-gray-50 rounded-lg p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <SkeletonItem className="h-8 w-3/4 mb-3 bg-gray-300" delay={450} />
                <SkeletonItem className="h-4 w-full mb-2 bg-gray-200" delay={500} />
                <SkeletonItem className="h-4 w-full mb-2 bg-gray-200" delay={550} />
                <SkeletonItem className="h-4 w-full mb-4 bg-gray-200" delay={600} />
                <SkeletonItem className="h-10 w-full bg-gray-200 mb-3" delay={650} />
                <SkeletonItem className="h-10 w-full bg-gray-200" delay={700} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Team Members Section - loads last */}
      <section className="bg-gray-50 px-2 md:px-0 pb-5 py-8 md:pb-10 md:py-12">
        <div className="container mx-auto">
          <SkeletonItem className="h-10 w-56 mb-6 bg-gray-300" delay={600} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="bg-white rounded-lg h-64 skeleton-shimmer"
                style={{ animationDelay: `${700 + i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
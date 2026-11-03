// app/doctors/[slug]/loading.tsx
// Loading skeleton for doctor detail page with staggered animations

import { SkeletonItem } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section Skeleton */}
      <section className="bg-white py-8 md:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 md:gap-10 items-center min-h-[480px]">
            <div className="flex flex-col justify-end col-span-12 lg:col-span-7 py-10">
              <SkeletonItem className="h-12 w-64 mb-3 bg-gray-300" delay={0} />
              <SkeletonItem className="h-7 w-48 mb-4 bg-gray-300" delay={50} />
              <SkeletonItem className="h-6 w-56 mb-2 bg-gray-200" delay={100} />
              <div className="flex flex-wrap gap-2 mt-2">
                <SkeletonItem className="h-7 w-24 bg-gray-200 rounded-full" delay={150} />
                <SkeletonItem className="h-7 w-28 bg-gray-200 rounded-full" delay={200} />
              </div>
            </div>
            <div className="relative order-1 lg:order-1 col-span-12 md:col-span-3 min-h-[350px] border-4 border-gray-200 rounded-lg mx-auto lg:mx-0 aspect-square overflow-hidden">
              <SkeletonItem className="w-full h-full bg-gray-300" delay={100} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-3 space-y-6 md:space-y-8">
              {/* About Section */}
              <div className="md:bg-white md:rounded-xl md:p-6 md:shadow-sm md:border border-gray-100">
                <SkeletonItem className="h-8 w-48 mb-4 bg-gray-300" delay={200} />
                <SkeletonItem className="h-4 w-full mb-2 bg-gray-200" delay={250} />
                <SkeletonItem className="h-4 w-full mb-2 bg-gray-200" delay={300} />
                <SkeletonItem className="h-4 w-full mb-2 bg-gray-200" delay={350} />
                <SkeletonItem className="h-4 w-4/5 bg-gray-200" delay={400} />
              </div>

              {/* Accordion Sections */}
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <SkeletonItem className="w-5 h-5 bg-gray-300" delay={400 + i * 50} />
                      <SkeletonItem className="h-7 w-48 bg-gray-300" delay={450 + i * 50} />
                    </div>
                    <SkeletonItem className="h-4 w-full mb-2 bg-gray-200" delay={500 + i * 50} />
                    <SkeletonItem className="h-4 w-5/6 bg-gray-200" delay={550 + i * 50} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Sticky Contact Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 hidden md:block">
                <div className="md:bg-white md:rounded-xl md:p-6 md:shadow-sm md:border border-gray-100">
                  <SkeletonItem className="h-8 w-32 mb-3 bg-gray-300" delay={600} />
                  <SkeletonItem className="h-4 w-full mb-2 bg-gray-200" delay={650} />
                  <SkeletonItem className="h-4 w-full mb-2 bg-gray-200" delay={700} />
                  <SkeletonItem className="h-10 w-full bg-gray-200" delay={750} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Contact Form */}
      <section className="py-8 md:py-10 block md:hidden bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:bg-white md:rounded-xl md:p-6 md:shadow-sm md:border border-gray-100">
            <SkeletonItem className="h-8 w-32 mb-3 bg-gray-300" />
            <SkeletonItem className="h-4 w-full mb-2 bg-gray-200" />
            <SkeletonItem className="h-10 w-full bg-gray-200" />
          </div>
        </div>
      </section>

      {/* Related Treatments Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonItem className="h-8 w-48 mb-4 bg-gray-300" delay={800} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-md h-64">
                <SkeletonItem className="w-full h-40 bg-gray-200 rounded-t-md" delay={800 + i * 50} />
                <SkeletonItem className="h-5 w-5/6 mt-3 mx-3 bg-gray-300" delay={850 + i * 50} />
                <SkeletonItem className="h-4 w-4/5 mt-2 mx-3 bg-gray-200" delay={900 + i * 50} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Doctors Section */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonItem className="h-8 w-48 mb-4 bg-gray-300" delay={1000} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-md h-72">
                <SkeletonItem className="w-full h-48 bg-gray-200 rounded-t-md" delay={1000 + i * 50} />
                <SkeletonItem className="h-5 w-4/5 mt-3 mx-3 bg-gray-300" delay={1050 + i * 50} />
                <SkeletonItem className="h-4 w-3/4 mt-2 mx-3 bg-gray-200" delay={1100 + i * 50} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
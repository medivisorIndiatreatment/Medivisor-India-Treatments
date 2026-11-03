// components/ui/BranchPageSkeletons.tsx
// Premium skeleton components matching exact section heights and layouts for Branch Detail Page

"use client"

import { cn } from "@/lib/utils"

const shimmer = "skeleton-shimmer"

interface SkeletonProps {
  className?: string
}

export function DepartmentHeroSkeleton({ className }: SkeletonProps) {
  return (
    <section className={cn("relative w-full h-[40vh] lg:h-[70vh]", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-white/10" />
      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="container mx-auto px-4 pb-6 md:pb-12">
          <div className="max-w-4xl space-y-6">
            <div className={cn(shimmer, "h-12 w-[280px] rounded-lg mb-3 md:mb-4")} />
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <div className={cn(shimmer, "h-5 w-5 rounded")} />
              <div className={cn(shimmer, "h-4 w-[200px] rounded")} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function BranchHeroSkeleton({ className }: SkeletonProps) {
  return (
    <section className={cn("relative w-full h-[40vh] lg:h-[70vh]", className)}>
      <div className="absolute inset-0 bg-[#f3f3f3]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-white/10" />
      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="container mx-auto px-4 pb-6 md:pb-12">
          <div className="max-w-4xl space-y-6">
            <div className="mb-3 md:mb-4">
              <div className={cn(shimmer, "h-[50px] w-[120px] rounded-lg")} />
            </div>
            <div className={cn(shimmer, "h-12 w-[280px] rounded-lg mb-3 md:mb-4")} />
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <div className={cn(shimmer, "h-5 w-5 rounded")} />
              <div className={cn(shimmer, "h-4 w-[200px] rounded")} />
            </div>
            <div className="flex flex-wrap absolute top-4 right-4 items-center gap-1 md:gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative w-12 h-12 md:w-16 md:h-16 bg-white/90 rounded-full flex items-center justify-center p-1">
                  <div className={cn(shimmer, "h-8 w-8 rounded-full")} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function OverviewSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("bg-gray-50 py-10 md:p-6 md:py-10 px-[5px] md:px-5 rounded-lg mb-4", className)}>
      <div className={cn(shimmer, "h-10 w-[200px] rounded-lg mb-3")} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center p-2 md:p-4 bg-white rounded-xs border border-gray-100 shadow-xs space-y-2">
            <div className={cn(shimmer, "h-8 w-8 mx-auto rounded-full")} />
            <div className={cn(shimmer, "h-5 w-16 mx-auto rounded")} />
            <div className={cn(shimmer, "h-3 w-12 mx-auto rounded")} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ContentSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("md:p-6 md:bg-gray-50 md:rounded-lg mb-4", className)}>
      <div className="space-y-4">
        <div className={cn(shimmer, "h-6 w-[200px] rounded")} />
        <div className={cn(shimmer, "h-4 w-full rounded")} />
        <div className={cn(shimmer, "h-4 w-[80%] rounded")} />
        <div className={cn(shimmer, "h-4 w-[70%] rounded")} />
        <div className={cn(shimmer, "h-4 w-full rounded")} />
        <div className={cn(shimmer, "h-4 w-[60%] rounded")} />
        <div className={cn(shimmer, "h-4 w-full rounded")} />
        <div className={cn(shimmer, "h-4 w-[80%] rounded")} />
        <div className={cn(shimmer, "h-4 w-[70%] rounded")} />
        <div className={cn(shimmer, "h-4 w-full rounded")} />
        <div className={cn(shimmer, "h-4 w-[60%] rounded")} />
      </div>
    </div>
  )
}

export function ContactFormSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("", className)}>
      <div className="bg-white rounded-md shadow-xs overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className={cn(shimmer, "h-6 w-[150px] rounded mx-auto")} />
        </div>
        <div className="p-6 space-y-5">
          <div className={cn(shimmer, "h-10 w-full rounded-md")} />
          <div className={cn(shimmer, "h-10 w-full rounded-md")} />
          <div className="space-y-2">
            <div className="flex gap-2 mt-2">
              <div className={cn(shimmer, "h-10 w-24 rounded-md flex-shrink-0")} />
              <div className={cn(shimmer, "h-10 flex-1 rounded-md")} />
            </div>
            <div className={cn(shimmer, "h-4 w-[200px] rounded")} />
          </div>
          <div className={cn(shimmer, "h-[120px] w-full rounded-md")} />
          <div className={cn(shimmer, "h-12 w-full rounded-md")} />
        </div>
      </div>
    </div>
  )
}

export function TreatmentsSectionSkeleton({ className }: SkeletonProps) {
  return (
    <section className={cn("bg-gray-50 md:px-0 py-12", className)}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 md:mb-5 md:px-2">
          <div className={cn(shimmer, "h-8 w-48 rounded-lg")} />
          <div className={cn(shimmer, "h-10 w-96 rounded-md hidden md:block")} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xs overflow-hidden">
              <div className={cn(shimmer, "h-60 rounded-none")} />
              <div className="p-4 space-y-3">
                <div className={cn(shimmer, "h-5 w-3/4 rounded-lg")} />
                <div className={cn(shimmer, "h-4 w-1/2 rounded")} />
                <div className={cn(shimmer, "h-4 w-full rounded")} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function RelatedBranchesSkeleton({ className }: SkeletonProps) {
  return (
    <section className={cn("bg-gray-50 px-[5px] md:px-0 py-5 md:py-12", className)}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-y-2 md:gap-y-4 md:mb-5">
          <div className={cn(shimmer, "h-8 w-56 rounded-lg")} />
          <div className={cn(shimmer, "h-10 w-96 rounded-md hidden md:block")} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xs overflow-hidden">
              <div className={cn(shimmer, "h-60 rounded-none")} />
              <div className="p-4 space-y-3">
                <div className={cn(shimmer, "h-5 w-3/4 rounded-lg")} />
                <div className={cn(shimmer, "h-4 w-1/2 rounded")} />
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                  <div className={cn(shimmer, "h-10 rounded")} />
                  <div className={cn(shimmer, "h-10 rounded")} />
                  <div className={cn(shimmer, "h-10 rounded")} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function MobileContactSkeleton({ className }: SkeletonProps) {
  return (
    <section className={cn("px-[5px] py-5 md:hidden block", className)}>
      <div className="bg-white rounded-md shadow-xs overflow-hidden border border-gray-200 p-4 space-y-4">
        <div className={cn(shimmer, "h-10 w-full rounded-md")} />
        <div className={cn(shimmer, "h-10 w-full rounded-md")} />
        <div className="flex gap-2">
          <div className={cn(shimmer, "h-10 w-20 rounded-md flex-shrink-0")} />
          <div className={cn(shimmer, "h-10 flex-1 rounded-md")} />
        </div>
        <div className={cn(shimmer, "h-20 w-full rounded-md")} />
        <div className={cn(shimmer, "h-12 w-full rounded-md")} />
      </div>
    </section>
  )
}

export function BreadcrumbSkeleton({ className }: SkeletonProps) {
  return (
    <nav className={cn("container mx-auto px-4 py-4", className)}>
      <div className="flex items-center gap-2">
        <div className={cn(shimmer, "h-4 w-16 rounded")} />
        <div className={cn(shimmer, "h-4 w-4 rounded")} />
        <div className={cn(shimmer, "h-4 w-24 rounded")} />
      </div>
    </nav>
  )
}

export function DoctorsSectionSkeleton({ className }: SkeletonProps) {
  return (
    <section className={cn("py-10 bg-gray-50", className)}>
      <div className="container mx-auto px-4">
        <div className={cn(shimmer, "h-8 w-56 rounded-lg mb-6")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-md shadow-xs overflow-hidden border border-gray-100">
              <div className={cn(shimmer, "h-44 rounded-none")} />
              <div className="p-5 space-y-3">
                <div className={cn(shimmer, "h-5 w-3/4 rounded-lg")} />
                <div className={cn(shimmer, "h-4 w-1/2 rounded")} />
                <div className={cn(shimmer, "h-4 w-2/3 rounded")} />
                <div className="pt-3 border-t border-gray-100">
                  <div className={cn(shimmer, "h-4 w-24 rounded")} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CtaSectionSkeleton({ className }: SkeletonProps) {
  return (
    <section className={cn("py-12 bg-gray-100", className)}>
      <div className="container mx-auto px-4">
        <div className={cn(shimmer, "h-96 w-full rounded-xl bg-gray-200")} />
      </div>
    </section>
  )
}

// app/treatment/[slug]/loading.tsx
// Loading skeleton for treatment detail page with pixel-perfect UI matching

import {
  TreatmentHeroSkeleton,
  TreatmentBreadcrumbSkeleton,
  TreatmentContentSkeleton,
  TreatmentHospitalsSkeleton,
  TreatmentMobileContactSkeleton
} from "@/components/ui/TreatmentPageSkeletons"

export default function Loading() {
  return (
    <div className="bg-white min-h-screen">
      <TreatmentHeroSkeleton className="h-[40vh] md:h-[70vh]" />
      <TreatmentBreadcrumbSkeleton className="mb-4" />
      
      <TreatmentContentSkeleton />
      
      <TreatmentHospitalsSkeleton className="mb-8" />
      
      <TreatmentMobileContactSkeleton />
    </div>
  )
}
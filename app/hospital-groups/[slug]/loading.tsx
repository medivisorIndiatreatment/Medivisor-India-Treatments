// app/hospital-groups/[slug]/loading.tsx
// Loading skeleton for hospital group detail page with pixel-perfect UI matching

import {
  HospitalGroupHeroSkeleton,
  HospitalGroupInfoSkeleton,
  HospitalGroupBranchesSkeleton,
  HospitalGroupSimilarGroupsSkeleton,
  HospitalGroupBreadcrumbSkeleton
} from "@/components/ui/HospitalGroupSkeletons"

export default function Loading() {
  return (
    <div className="bg-white min-h-screen">
      <HospitalGroupHeroSkeleton className="h-[40vh] md:h-[70vh]" />
      <HospitalGroupBreadcrumbSkeleton className="mb-4" />
      
      <HospitalGroupInfoSkeleton />
      
      <HospitalGroupBranchesSkeleton className="mb-8" />
      
      <HospitalGroupSimilarGroupsSkeleton className="mb-8" />
    </div>
  )
}
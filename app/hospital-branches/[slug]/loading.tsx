// app/hospital-branches/[slug]/loading.tsx
// Premium skeleton loading for Branch Detail Page

import { 
  BranchHeroSkeleton, 
  OverviewSkeleton, 
  ContentSkeleton, 
  ContactFormSkeleton, 
  TreatmentsSectionSkeleton, 
  RelatedBranchesSkeleton, 
  MobileContactSkeleton,
  BreadcrumbSkeleton 
} from "@/components/ui/BranchPageSkeletons"

export default function BranchPageLoading() {
  return (
    <div className="bg-white min-h-screen">
      <BranchHeroSkeleton />
      <BreadcrumbSkeleton />

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="lg:col-span-3">
              <OverviewSkeleton />
              <ContentSkeleton />
            </div>
            <div className="lg:col-span-1 hidden md:block">
              <ContactFormSkeleton />
            </div>
          </div>
        </div>
      </section>

      <TreatmentsSectionSkeleton />
      <RelatedBranchesSkeleton />
      <MobileContactSkeleton />
    </div>
  )
}
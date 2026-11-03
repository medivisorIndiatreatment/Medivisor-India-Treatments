// app/department/[slug]/loading.tsx
// Skeleton loading matching exact department page layout

import { 
  DepartmentHeroSkeleton,
  OverviewSkeleton, 
  ContentSkeleton, 
  ContactFormSkeleton, 
  TreatmentsSectionSkeleton, 
  RelatedBranchesSkeleton, 
  MobileContactSkeleton,
  BreadcrumbSkeleton,
  DoctorsSectionSkeleton,
  CtaSectionSkeleton
} from "@/components/ui/BranchPageSkeletons"

export default function DepartmentPageLoading() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Banner */}
      <DepartmentHeroSkeleton />

      {/* Breadcrumb */}
      <BreadcrumbSkeleton />

      {/* Overview Grid - same layout as page */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="lg:col-span-3">
              {/* Stats Overview */}
              <OverviewSkeleton />
              {/* Description Content */}
              <ContentSkeleton />
            </div>

            {/* Sidebar Contact Form - hidden on mobile */}
            <div className="lg:col-span-1 hidden md:block">
              <ContactFormSkeleton />
            </div>
          </div>
        </div>
      </section>

      {/* Treatments Section */}
      <TreatmentsSectionSkeleton />

      {/* Doctors Section (optional - shown when doctors exist) */}
      <DoctorsSectionSkeleton />

      {/* Hospital Branches / Related */}
      <RelatedBranchesSkeleton />

      {/* Mobile Contact Form - shown only on mobile */}
      <MobileContactSkeleton />

      {/* CTA Section */}
      <CtaSectionSkeleton />
    </div>
  )
}
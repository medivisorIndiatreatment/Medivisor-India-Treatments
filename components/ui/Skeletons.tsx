"use client"

// Shared skeleton components for consistent loading states

interface CardSkeletonProps {
  variant?: "treatment" | "doctor" | "hospital" | "branch"
}

export const CardSkeleton = ({ variant = "treatment" }: CardSkeletonProps) => {
  const heights = {
    treatment: "h-48",
    doctor: "h-60",
    hospital: "h-56",
    branch: "h-40"
  }

  return (
    <div className="bg-white border border-gray-100 rounded-md shadow-xs overflow-hidden animate-pulse">
      <div className={`${heights[variant]} bg-gray-200`} />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex gap-2 pt-2">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  )
}

export const TreatmentCardSkeleton = () => <CardSkeleton variant="treatment" />
export const DoctorCardSkeleton = () => <CardSkeleton variant="doctor" />
export const HospitalCardSkeleton = () => <CardSkeleton variant="hospital" />
export const BranchCardSkeleton = () => <CardSkeleton variant="branch" />

interface GridSkeletonProps {
  count?: number
  variant?: "treatment" | "doctor" | "hospital" | "branch"
  columns?: number
}

export const GridSkeleton = ({ count = 4, variant = "treatment", columns = 4 }: GridSkeletonProps) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} variant={variant} />
      ))}
    </div>
  )
}

export const TreatmentGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <GridSkeleton count={count} variant="treatment" />
)

export const DoctorGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <GridSkeleton count={count} variant="doctor" />
)

export const HospitalGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <GridSkeleton count={count} variant="hospital" />
)

export const BranchGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <GridSkeleton count={count} variant="branch" />
)

// Hero section skeleton
export const HeroSkeleton = () => (
  <div className="w-full h-[400px] bg-gray-200 animate-pulse" />
)

// Section skeleton with heading
export const SectionSkeleton = ({ title = true }: { title?: boolean }) => (
  <div className="space-y-4">
    {title && <div className="h-8 bg-gray-200 rounded w-1/3" />}
    <GridSkeleton count={4} variant="treatment" />
  </div>
)

// Detail page skeleton
export const DetailPageSkeleton = () => (
  <div className="space-y-8">
    <HeroSkeleton />
    <div className="space-y-4">
      <div className="h-6 bg-gray-200 rounded w-1/4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
    <SectionSkeleton />
  </div>
)

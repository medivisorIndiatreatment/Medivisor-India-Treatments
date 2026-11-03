// components/ui/index.ts
// Central export file for all shared UI components

// UI Primitives (named exports)
export { Button, buttonVariants } from './button'
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card'
export { Badge, badgeVariants } from './badge'
export { Skeleton } from './skeleton'

// Display Components
export { default as SectionHeading } from './SectionHeading'
export { default as StatCard } from './StatCard'
export { default as ImageWithFallback } from './ImageWithFallback'

// Form & Input Components
export { default as SearchDropdown } from './SearchDropdown'

// Skeleton Components
export { 
  CardSkeleton,
  TreatmentCardSkeleton,
  DoctorCardSkeleton,
  HospitalCardSkeleton,
  BranchCardSkeleton,
  GridSkeleton,
  TreatmentGridSkeleton,
  DoctorGridSkeleton,
  HospitalGridSkeleton,
  BranchGridSkeleton,
  HeroSkeleton,
  SectionSkeleton,
  DetailPageSkeleton
} from './Skeletons'

// UI Components
export { default as HomepageCarousel } from './HomepageCarousel'
export { default as BreadcrumbNav } from './BreadcrumbNav'
export { TableOfContents, extractHeadingsFromNodes, extractHeadingsFromHtml } from './TableOfContents'
export { default as TreatmentDescription } from './TreatmentDescription'
export { default as OverviewSection } from './OverviewSection'
export { default as MarqueeHeading } from './MarqueeHeading'

// Re-export commonly used UI primitives
export * from './button'
export * from './card'
export * from './badge'
export * from './skeleton'
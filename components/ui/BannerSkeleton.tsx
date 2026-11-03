import { cn } from "@/lib/utils";
import { DESIGN_TOKENS } from "@/components/design-tokens";

interface SkeletonItemProps {
  className?: string;
  style?: React.CSSProperties;
}

export function SkeletonItem({ className, style }: SkeletonItemProps) {
  return (
    <div
      className={cn("skeleton-shimmer", "rounded-md", className)}
      style={style}
    />
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white rounded-md overflow-hidden shadow-sm border border-gray-100/80",
        className
      )}
    >
      <SkeletonItem className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <SkeletonItem className="h-5 w-3/4 rounded-lg" />
        <SkeletonItem className="h-3.5 w-full rounded-md" />
        <SkeletonItem className="h-3.5 w-4/5 rounded-md" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SectionHeadingSkeleton() {
  return (
    <div className="flex items-center justify-between mb-3 md:mb-4">
      <SkeletonItem className="h-9 w-56 rounded-lg" />
      <SkeletonItem className="h-10 w-72 rounded-lg hidden md:block" />
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <div className="relative w-full overflow-hidden bg-[#f3f3f3]">
      <div className="relative md:h-full  h-[530px]  min-h-[60vh] md:min-h-[70dvh]">
        {/* Logo skeleton */}
        <div className="absolute top-0 z-40 container mx-auto">
          <SkeletonItem className="w-[80px] h-[40px] md:w-[120px] md:h-[60px] rounded-lg mt-2" />
        </div>

        <div className="container mx-auto h-full">
          <div className="relative z-30 md:min-h-[500px] py-20 lg:py-10 w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-12 items-end gap-10 md:h-[85vh]">
            {/* Left content skeleton */}
            <div className="lg:col-span-8 space-y-5">
              <div className="space-y-3">
                <SkeletonItem className="h-[40px] md:h-[48px] w-full max-w-[560px] rounded-lg" />
                <SkeletonItem className="h-[40px] md:h-[48px] w-full max-w-[380px] rounded-lg" />
              </div>
              <div className="space-y-2 pt-2">
                <SkeletonItem className="h-[18px] w-full max-w-[520px] rounded-md" />
                <SkeletonItem className="h-[18px] w-full max-w-[440px] rounded-md" />
              </div>
              <SkeletonItem className="h-[50px] w-full sm:w-[260px] rounded-lg mt-6 lg:hidden" />
            </div>

            {/* Right card skeleton (desktop only) */}
            <div className="hidden lg:block lg:col-span-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-7 space-y-5">
                <SkeletonItem className="h-[30px] w-4/5 rounded-lg" />
                <div className="space-y-2 pt-1">
                  <SkeletonItem className="h-[14px] w-full rounded-md" />
                  <SkeletonItem className="h-[14px] w-5/6 rounded-md" />
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-6">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <SkeletonItem
                      key={i}
                      className="h-[15px] w-[90%] rounded-md"
                    />
                  ))}
                </div>
                <div className="pt-2">
                  <SkeletonItem className="h-[50px] w-full rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BannerSliderSkeleton() {
  return (
    <div className="relative w-full mx-auto overflow-hidden">
      <BannerSkeleton />
    </div>
  );
}

export function PartnerLogosSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="flex space-x-5 py-6 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem
          key={i}
          className="w-[100px] h-[70px] md:w-[120px] md:h-[80px] lg:w-[140px] lg:h-[96px] rounded-xl flex-shrink-0"
          style={{ animationDelay: `${i * 0.06}s` }}
        />
      ))}
    </div>
  );
}

export function MedivisorBannerBarSkeleton() {
  return (
    <div className="w-full bg-[#0b2b64]">
      <div className="flex items-center h-24">
        <div className="pl-8 hidden md:block">
          <SkeletonItem className="h-7 w-56 rounded-md bg-white/20" />
        </div>
        <div className="flex-1 flex items-center justify-center gap-6 md:gap-10 pr-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <SkeletonItem className="h-7 w-7 rounded-md bg-white/20" />
              <SkeletonItem className="h-3 w-20 rounded bg-white/20" />
            </div>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-6 pr-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonItem className="h-10 w-10 rounded-md bg-gray-200" />
              <div className="flex flex-col gap-1.5">
                <SkeletonItem className="h-3 w-24 rounded bg-gray-200" />
                <SkeletonItem className="h-3 w-20 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomepageLoadingSkeleton() {
  return (
    <div className="bg-white min-h-screen">
      <BannerSliderSkeleton />

      {/* Banner bar skeleton */}
      <MedivisorBannerBarSkeleton />

      {/* Partners skeleton */}
      <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} ${DESIGN_TOKENS.SECTION_SPACING.PY} overflow-hidden`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <PartnerLogosSkeleton />
        </div>
      </section>

      {/* Treatments skeleton */}
      <section className={`${DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <SectionHeadingSkeleton />
          <CardGridSkeleton count={4} />
        </div>
      </section>

      {/* Hospitals skeleton */}
      <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <SectionHeadingSkeleton />
          <CardGridSkeleton count={4} />
        </div>
      </section>
    </div>
  );
}

export function GenericSectionSkeleton({ bgClass = DESIGN_TOKENS.BACKGROUNDS.WHITE }: { bgClass?: string } = {}) {
  return (
    <section className={`${DESIGN_TOKENS.SECTION_SPACING.PY} ${bgClass}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <SkeletonItem className="h-96 w-full rounded-xl" />
      </div>
    </section>
  );
}

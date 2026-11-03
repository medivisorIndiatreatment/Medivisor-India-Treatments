'use client';

import { SkeletonItem } from "@/components/ui/BannerSkeleton";
import { DESIGN_TOKENS, SECTION_INDEX, getAlternatingBackground } from "@/components/design-tokens";

export function DoctorSectionSkeleton() {
  return (
    <section className={`${getAlternatingBackground(SECTION_INDEX.DOCTORS)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-6 md:px-0">
          <div className="h-8 md:h-10 w-56 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-11 w-full md:w-[340px] bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 skeleton-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
              <div className="relative h-48 md:h-52 bg-gray-100 animate-pulse" />
              <div className="p-4 md:p-5 space-y-3">
                <div className="h-6 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DepartmentServicesSkeleton() {
  return (
    <section className={`${getAlternatingBackground(SECTION_INDEX.DEPARTMENT_SERVICES)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-6 md:px-0">
          <div className="h-8 md:h-10 w-56 md:w-64 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-11 w-full md:w-[340px] bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 skeleton-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
              <div className="relative h-48 md:h-52 bg-gray-100 animate-pulse" />
              <div className="p-4 md:p-5 space-y-3">
                <div className="h-6 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PopularHospitalsSkeleton() {
  return (
    <section className={`${getAlternatingBackground(SECTION_INDEX.POPULAR_HOSPITALS)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-6 md:px-0">
          <div className="h-8 md:h-10 w-56 md:w-64 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-11 w-full md:w-[340px] bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 skeleton-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
              <div className="relative h-48 md:h-52 bg-gray-100 animate-pulse" />
              <div className="p-4 md:p-5 space-y-3">
                <div className="h-6 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TechnologiesServicesSkeleton() {
  return (
    <section className={`${getAlternatingBackground(SECTION_INDEX.TECHNOLOGIES)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-6 md:px-0">
          <div className="h-8 md:h-10 w-56 md:w-64 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-11 w-full md:w-[340px] bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 skeleton-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
              <div className="relative h-48 md:h-52 bg-gray-100 animate-pulse" />
              <div className="p-4 md:p-5 space-y-3">
                <div className="h-6 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSkeleton() {
  return (
    <section className={`${getAlternatingBackground(SECTION_INDEX.TESTIMONIALS)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-6 md:px-0">
          <div className="h-8 md:h-10 w-56 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 skeleton-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
              <SkeletonItem className="h-16 w-16 rounded-full mb-4" />
              <SkeletonItem className="h-5 w-3/4 mb-2" />
              <SkeletonItem className="h-4 w-1/2 mb-4" />
              <SkeletonItem className="h-4 w-full" />
              <SkeletonItem className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const GenericSectionSkeleton = ({ bgClass = '' }: { bgClass?: string }) => (
  <section className={`${bgClass} ${DESIGN_TOKENS.SECTION_SPACING.PY}`} aria-busy="true" aria-label="Loading section">
    <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
      <div className="h-8 md:h-10 w-64 max-w-full bg-gray-200 rounded-lg animate-pulse mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="bg-white rounded-xl overflow-hidden border border-gray-200">
            <div className="h-48 md:h-52 bg-gray-100 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

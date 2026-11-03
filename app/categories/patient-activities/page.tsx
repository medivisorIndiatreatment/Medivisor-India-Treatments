"use client";

import dynamicLoader from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { GenericSectionSkeleton } from "@/components/ui/BannerSkeleton";
import { DESIGN_TOKENS } from "@/components/design-tokens";
import Hero from "@/components/Hero";
import Partners from "@/components/Partners";
import CtaSection from "@/components/CtaSection";
import { useTranslatedStrings } from "@/lib/i18n";

const Testimonials = dynamicLoader(() => import("@/components/Testimonials"), {
  loading: () => (
    <GenericSectionSkeleton bgClass={DESIGN_TOKENS.BACKGROUNDS.WHITE} />
  ),
});

const PatientSupport = dynamicLoader(
  () => import("@/components/PatientSupport"),
  {
loading: () => (
      <GenericSectionSkeleton bgClass={DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT} />
    ),
  },
);

const ActivitiesCarousel = dynamicLoader(
  () => import("@/components/BlogPostCarousel"),
  {
loading: () => (
      <GenericSectionSkeleton bgClass={DESIGN_TOKENS.BACKGROUNDS.WHITE} />
    ),
  },
);

const ExtentCareSection = dynamicLoader(
  () => import("@/components/extentCare"),
  {
loading: () => (
      <GenericSectionSkeleton bgClass={DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT} />
    ),
  },
);

// Lazy section wrapper (copied from homepage pattern)
function LazySection({
  children,
  rootMargin = "100px",
  fallback,
}: {
  children: React.ReactNode;
  rootMargin?: string;
  fallback: React.ReactNode;
}) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || hasLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasLoaded(true);
          observer.disconnect();
        }
      },
{ rootMargin, threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, hasLoaded]);

  if (!hasLoaded) {
    return <div ref={ref}>{fallback}</div>;
  }

  return <div ref={ref}>{children}</div>;
}

export default function PatientActivitiesPage() {
const translatedStrings = useTranslatedStrings([
    "Patient Activities & Wellness Programs",
    "Discover our engaging activities and wellness programs designed to support patient recovery, foster community, and promote holistic healing throughout the treatment journey.",
    "Ready to Begin Your Healing Journey?",
    "Our comprehensive patient activities program supports your recovery every step of the way. From wellness workshops to therapeutic activities, we're here to help you heal holistically.",
    "Learn More",
    "View Activities",
  ]);
  const [
    title,
    description,
    ctaTitle,
    ctaDescription,
    primaryText,
    secondaryText,
  ] = translatedStrings;
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <LazySection
        fallback={
          <GenericSectionSkeleton bgClass={DESIGN_TOKENS.BACKGROUNDS.WHITE} />
        }
      >
        <Hero />
      </LazySection>

      {/* Partners Section (top) */}
      <LazySection fallback={<GenericSectionSkeleton />}>
        <Partners />
      </LazySection>

      {/* Testimonials - Visual Index 4 (White background) */}
<LazySection
        fallback={
          <GenericSectionSkeleton bgClass={DESIGN_TOKENS.BACKGROUNDS.WHITE} />
        }
      >
        <Testimonials />
      </LazySection>

      {/* Patient Support - Visual Index 5 (Gray background) */}
<LazySection
        fallback={
          <GenericSectionSkeleton
            bgClass={DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT}
          />
        }
      >
        <PatientSupport />
      </LazySection>

      {/* Main Content: Patient Activities - Visual Index 6 (White background) */}
      <LazySection fallback={<GenericSectionSkeleton />}>
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ActivitiesCarousel
              category="patient-activities"
title={title}
              description={description}
              sectionIndex={6} // Same as Activities section on homepage for consistent background
            />
          </div>
        </div>
      </LazySection>

      {/* Extent Care - Visual Index 7 (Gray background) */}
<LazySection
        fallback={
          <GenericSectionSkeleton
            bgClass={DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT}
          />
        }
      >
        <ExtentCareSection />
      </LazySection>

      {/* Call to Action Section */}
      <LazySection fallback={<GenericSectionSkeleton />}>
<CtaSection
          title={ctaTitle}
          description={ctaDescription}
          primaryText={primaryText}
          primaryLink="/contact"
          secondaryText={secondaryText}
          secondaryLink="/categories/patient-activities"
        />
      </LazySection>

      {/* Partners Section (bottom) */}
<LazySection
        fallback={
          <GenericSectionSkeleton
            bgClass={DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT}
          />
        }
      >
        <div className="py-12">
          <Partners />
        </div>
      </LazySection>
    </div>
  );
}

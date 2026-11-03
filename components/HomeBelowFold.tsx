"use client";

// Below-the-fold sections are lazy-loaded with skeleton fallbacks while still
// rendering on the server, so complete content is present in the initial HTML
// without putting every section in the homepage's critical client bundle.

import dynamic from "next/dynamic";
import {
  TestimonialsSkeleton,
  GenericSectionSkeleton,
} from "@/components/homepage-skeletons";
import { getAlternatingBackground, SECTION_INDEX } from "@/components/design-tokens";

const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  loading: () => <TestimonialsSkeleton />,
});

const PatientSupport = dynamic(() => import("@/components/PatientSupport"), {
  loading: () => (
    <GenericSectionSkeleton bgClass={`${getAlternatingBackground(SECTION_INDEX.PATIENT_SUPPORT)}`} />
  ),
});

const ExtentCare = dynamic(() => import("@/components/extentCare"), {
  loading: () => (
    <GenericSectionSkeleton bgClass={`${getAlternatingBackground(SECTION_INDEX.EXTENT_CARE)}`} />
  ),
});

const Activities = dynamic(() => import("@/components/Activities"), {
  loading: () => (
    <GenericSectionSkeleton bgClass={`${getAlternatingBackground(SECTION_INDEX.ACTIVITIES)}`} />
  ),
});

export default function HomeBelowFold() {
  return (
    <>
      <Testimonials />
      <PatientSupport />
      <ExtentCare />
      <Activities />
    </>
  );
}

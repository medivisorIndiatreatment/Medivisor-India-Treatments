import WhyMedivisor from "./WhyMedivisor";
import type { Metadata } from 'next';
import {whyMedivisorMetadata} from '@/app/metadata'; // Import the specific metadata

// 1. ✨ EXPORT THE PAGE-SPECIFIC METADATA HERE
// This is allowed because this file is a Server Component (no "use client").
export const metadata: Metadata = whyMedivisorMetadata;

export default function WhyMedivisorPage() {
  return <WhyMedivisor />;
}
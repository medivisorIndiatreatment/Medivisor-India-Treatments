import TreatmentCostPage from './TreatmentCostPage';
import { Metadata } from 'next';
import { treatmentCostMetadata } from '@/app/metadata'; // Import the specific metadata // Import the client component

// 1. ✨ EXPORT THE PAGE-SPECIFIC METADATA HERE
// This is allowed because this file is a Server Component (no "use client").
export const metadata: Metadata = treatmentCostMetadata;


export default function Page() {
  return <TreatmentCostPage />;
}

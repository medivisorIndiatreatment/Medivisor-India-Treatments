import FaqsPage from './FaqsPage';
import { Metadata } from 'next';
import { faqsMetadata } from '@/app/metadata'; // Import the specific metadata // Import the client component

// 1. ✨ EXPORT THE PAGE-SPECIFIC METADATA HERE
// This is allowed because this file is a Server Component (no "use client").
export const metadata: Metadata = faqsMetadata;

export default function Page() {
  return <FaqsPage />;
}

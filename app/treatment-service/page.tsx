import { Metadata } from 'next';
import TreatmentServiceClient from './TreatmentServiceClient';

export const metadata: Metadata = {
  title: 'Cancer Treatment in India | Medivisor India Treatment',
  description: 'World-class cancer treatment in India at affordable costs. Medivisor connects international patients with top oncologists and hospitals for comprehensive cancer care including surgery, chemotherapy, and radiation therapy.',
  keywords: ['cancer treatment India', 'oncology India', 'cancer care India', 'affordable cancer treatment', 'medical tourism India', 'cancer surgery India', 'chemotherapy India', 'radiation therapy India'],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://medivisorindiatreatment.com/treatment-service',
  },
  openGraph: {
    title: 'Cancer Treatment in India | Medivisor India Treatment',
    description: 'World-class cancer treatment in India at affordable costs. Expert oncologists, advanced technology, and comprehensive care for international patients.',
    url: 'https://medivisorindiatreatment.com/treatment-service',
    siteName: 'Medivisor India Treatment',
    images: [
      {
        url: 'https://medivisorindiatreatment.com/logo_medivisor.png',
        width: 1200,
        height: 630,
        alt: 'Cancer Treatment in India - Medivisor',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cancer Treatment in India | Medivisor',
    description: 'World-class cancer treatment in India. Expert oncologists and advanced technology.',
    site: '@medivisorindiatreatment',
    images: ['https://medivisorindiatreatment.com/logo_medivisor.png'],
  },
};

export default function Page() {
  return <TreatmentServiceClient />;
}

import Expanded from './expanded';
import { Metadata } from 'next';

// Proper metadata for the Medivisor Expanded Patient Support Network page
export const metadata: Metadata = {
  title: 'Medivisor Expanded Patient Support Network | Become a Health Ambassador',
  description: 'Join the Medivisor Expanded Patient Support Network (MEPSN) as a Community Health Partner or Health Ambassador. Help bridge healthcare gaps across the Pacific Islands, Africa, and CIS countries. Earn respect, purpose, and sustainable livelihood while saving lives.',
  keywords: [
    'Medivisor Expanded Patient Support Network',
    'MEPSN Health Ambassador',
    'Community Health Partner',
    'Medical Support Network',
    'Health Ambassador Program',
    'Patient Support Network',
    'Medivisor Health Partners',
    'grassroots healthcare support',
    'medical guidance community',
    'healthcare bridge India'
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://medivisorindiatreatment.com/medivisor-expanded-patient-support-network',
  },
  openGraph: {
    title: 'Medivisor Expanded Patient Support Network | Become a Health Ambassador',
    description: 'Join MEPSN as a Community Health Partner. Help patients access world-class medical care in India while earning sustainable livelihood. Over 200+ Health Ambassadors across Pacific Islands, Africa, and CIS.',
    url: 'https://medivisorindiatreatment.com/medivisor-expanded-patient-support-network',
    siteName: 'Medivisor India Treatment',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://medivisorindiatreatment.com/banner/extended-banner.png',
        width: 1200,
        height: 630,
        alt: 'Medivisor Expanded Patient Support Network - Become a Health Ambassador',
        type: 'image/png',
      },
      {
        url: 'https://medivisorindiatreatment.com/banner/extended-banner.png',
        width: 1200,
        height: 630,
        alt: 'Medivisor Expanded Patient Support Network - Dynamic OG Image',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Medivisor Expanded Patient Support Network | Become a Health Ambassador',
    description: 'Join MEPSN as a Community Health Partner. Help patients access world-class medical care in India. Earn respect, purpose, and sustainable livelihood.',
    site: '@MedivisorIndia',
    images: [
      'https://medivisorindiatreatment.com/banner/extended-banner.png',
      'https://medivisorindiatreatment.com/banner/extended-banner.png',
    ],
    // Note: Next.js doesn't expose imageAlt in twitter type directly
    // OG image alt is used for accessibility
  },
};

export default function Page() {
  return <Expanded />;
}

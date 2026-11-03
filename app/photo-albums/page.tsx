import PhotoAlbumsPage from './PhotoAlbumsPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo Albums | Medivisor India',
  description: 'Explore photo albums from Medivisor India, showcasing hospitals, medical events, patient care, and international patient experiences.',
  keywords: 'Medivisor India photo gallery, hospital photos, medical events, patient care images, international patient experiences, healthcare photo albums',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://medivisorindiatreatment.com/photo-albums',
  },
  openGraph: {
    title: 'Photo Albums | Medivisor India',
    description: 'Browse photo albums highlighting Medivisor India’s hospitals, events, and patient experiences.',
    url: 'https://medivisorindiatreatment.com/photo-albums',
    siteName: 'Medivisor India Treatment',
    images: [
      {
        url: 'https://medivisorindiatreatment.com/logo_medivisor.png',
        width: 800,
        height: 250,
        alt: 'Medivisor India Photo Albums',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Photo Albums | Medivisor India',
    description: 'View photos from hospitals, events, and patient experiences at Medivisor India.',
    site: '@MedivisorIndiatreatment',
  },
};

export default function Page() {
  return <PhotoAlbumsPage />;
}

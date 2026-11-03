import { Metadata } from "next"
import SocialActivityPage from "./SocialActivityPage"

export const metadata: Metadata = {
  title: "Social Activity | Medivisor India",
  description: "Stay updated with Medivisor India's latest social activities, community events, and healthcare initiatives.",
  keywords: [
    "Medivisor India social activity",
    "healthcare events India",
    "medical community programs",
    "patient engagement India",
    "social welfare initiatives",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://medivisorindiatreatment.com/social-activity",
  },
  openGraph: {
    title: "Social Activity | Medivisor India",
    description: "Stay updated with Medivisor India's latest social activities, community events, and healthcare initiatives.",
    url: "https://medivisorindiatreatment.com/social-activity",
    siteName: "Medivisor India Treatment",
    images: [
      {
        url: "https://medivisorindiatreatment.com/logo_medivisor.png",
        width: 800,
        height: 250,
        alt: "Medivisor India Social Activity",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Activity | Medivisor India",
    description: "Stay updated with Medivisor India's latest social activities and community events.",
    site: "@MedivisorIndiatreatment",
  },
}

export default function Page() {
  return <SocialActivityPage />
}
import { Metadata } from "next"
import BlogCategoryClient from "@/app/blog/categories/[slug]/BlogCategoryClient"

export const metadata: Metadata = {
  title: "Patient Activities | Medivisor India",
  description: "Celebrating life beyond treatment. Explore our patient activities, events, and joyful moments from Medivisor India.",
  keywords: [
    "Medivisor India patient activities",
    "patient events India",
    "medical tourism activities",
    "international patient care",
    "patient recovery programs",
    "healthcare events India",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://medivisorindiatreatment.com/patient-activities",
  },
  openGraph: {
    title: "Patient Activities | Medivisor India",
    description: "Celebrating life beyond treatment. Explore our patient activities, events, and joyful moments from Medivisor India.",
    url: "https://medivisorindiatreatment.com/patient-activities",
    siteName: "Medivisor India Treatment",
    images: [
      {
        url: "https://medivisorindiatreatment.com/logo_medivisor.png",
        width: 800,
        height: 250,
        alt: "Medivisor India Patient Activities",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Patient Activities | Medivisor India",
    description: "Celebrating life beyond treatment. Explore our patient activities, events, and joyful moments from Medivisor India.",
    site: "@MedivisorIndiatreatment",
  },
}

export default function PatientActivitiesPage() {
  return <BlogCategoryClient slug="patient-activities" />
}

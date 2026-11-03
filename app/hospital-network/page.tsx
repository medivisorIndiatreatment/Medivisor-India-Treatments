import HospitalNetworkPage from "./HospitalNetwork";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hospital Network | Medivisor India",
  description:
    "Explore Medivisor India’s network of world-class hospitals, providing advanced medical treatments and compassionate care for international patients.",
  keywords:
    "Medivisor India hospital network, hospitals in India, medical tourism India, international patient care, advanced hospitals India, world-class hospitals, expert doctors",
  robots: "index, follow",
  alternates: {
    canonical: "https://medivisorindiatreatment.com/hospital-network/", // ✅ Canonical Added
  },
  openGraph: {
    title: "Hospital Network | Medivisor India",
    description:
      "Discover our partner hospitals in India, delivering advanced medical care and world-class facilities for international patients.",
    url: "https://medivisorindiatreatment.com/hospital-network/",
    siteName: "Medivisor India Treatment",
    images: [
      {
        url: "https://medivisorindiatreatment.com/logo_medivisor.png",
        width: 800,
        height: 250,
        alt: "Medivisor India Hospital Network",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hospital Network | Medivisor India",
    description:
      "Meet our network of hospitals providing advanced medical care and expert treatment for international patients.",
    site: "@MedivisorIndiatreatment",
  },
};

export default function Page() {
  return <HospitalNetworkPage />;
}

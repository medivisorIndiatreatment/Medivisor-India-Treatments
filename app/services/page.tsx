import ServicesPage from "./ServicePage";
import { Metadata } from "next";
import { servicesMetadata } from "@/app/metadata"; // Import the specific metadata // Import the client component

export const metadata: Metadata = servicesMetadata;

export default function Page() {
  return <ServicesPage />;
}

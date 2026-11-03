import { Metadata } from "next";
import { contactMetadata } from "@/app/metadata";
import Contact from "@/components/Contact";
import { MapPin, Phone, Mail, Clock, Globe, ArrowRight } from "lucide-react";
import Banner from "@/components/BannerService";
import { DESIGN_TOKENS, getSectionClasses } from "@/components/design-tokens";
import ContactPageClient from "@/components/ContactPageClient";

export const metadata: Metadata = contactMetadata;

export default function ContactPage() {
  return <ContactPageClient />;
}
import { Mail, Phone, MessageCircle, CheckCircle, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Banner from "@/components/BannerService";
import TreatmentCost from "@/components/TreatmentCost"
import OurInitiativesSection from "@/components/OurInitiativesSection";
import Activities from "@/components/Activities";
import SafetyMeasures from "@/components/SafetyMeasures";
import type { Metadata } from 'next';
import {safetyMeasuresMetadata} from '@/app/metadata'; // Import the specific metadata

// 1. ✨ EXPORT THE PAGE-SPECIFIC METADATA HERE
// This is allowed because this file is a Server Component (no "use client").
export const metadata: Metadata = safetyMeasuresMetadata;
import CtaSection from "@/components/CtaSection";
export default function Treatment() {


  return (

    <>

      <Banner
        topSpanText="Safety Measures"
        title=" Patient Safety Measures for Medical Treatment in India"  
        bannerBgImage="/banner/service.png"
        description="Your health, safety, and comfort matter throughout your medical journey. At Medivisor India Treatment, we help international patients connect with hospitals and doctors in India while providing guidance on treatment coordination, medical travel, and essential arrangements. Our goal is to make your journey for medical treatment in India more informed, comfortable, and well coordinated."
        buttonLink="/initiatives" 
        // Replace with an image relevant to your initiatives (e.g., community outreach, health camp, research)
        mainImageSrc="/banner/safty-banner.png" // Replace with a compelling image representing your initiatives (e.g., a collage of different programs, a symbolic icon)
        mainImageAlt="Medivisor India Treatment Initiatives"
     
      />
     

      <SafetyMeasures/>
     
     {/* <Activities/> */}
    </>
  );
}
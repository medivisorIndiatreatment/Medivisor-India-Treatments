import { Mail, Phone, MessageCircle, CheckCircle, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Banner from "@/components/BannerService";
import TreatmentCost from "@/components/TreatmentCost"
import OurInitiativesSection from "@/components/OurInitiativesSection";
import Activities from "@/components/Activities";

export default function Treatment() {


  return (

    <>

      <Banner
        topSpanText="Our Initiatives"
        title="Driving Positive Change in Healthcare"
        description="At Medivisor India Treatment, we believe in going beyond just facilitating treatment. We are committed to a range of initiatives aimed at improving healthcare access, promoting awareness, and fostering community well-being across India."
        buttonText="Learn More"
        buttonLink="/initiatives" 
        bannerBgImage="/service-banner.png" // Replace with an image relevant to your initiatives (e.g., community outreach, health camp, research)
        mainImageSrc="/about-main-1.png" // Replace with a compelling image representing your initiatives (e.g., a collage of different programs, a symbolic icon)
        mainImageAlt="Medivisor India Treatment Initiatives"
     
      />
      <OurInitiativesSection />
     <Activities/>
    </>
  );
}
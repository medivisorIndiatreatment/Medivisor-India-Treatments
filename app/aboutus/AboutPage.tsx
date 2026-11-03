"use client"

import StatsSection from "@/components/StatsSection"
import Banner from "@/components/BannerService"
import TeamSilder from "@/components/teamSilder"
import MeetOurDoctors from "@/components/MeetOurDoctors"
import CtaSection from "@/components/CtaSection"
import Services from "@/components/Services"
import SafetyMeasures from "@/components/SafetyMeasures"
import HospitalGroupPartners from "@/components/HospitalGroupPartners"
import { DESIGN_TOKENS, getSectionClasses } from "@/components/design-tokens"
import { Trans } from '@/lib/i18n/Trans'
import type { MappedGroup } from "@/lib/services/hospital-groups-mapper"

interface AboutPageProps {
  initialGroups?: MappedGroup[]
}

export default function AboutPage({ initialGroups }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-white ">
      <Banner
        topSpanText="About Medivisor"
        title="Your Trusted Gateway to World-Class Healthcare in India."
        description="Medivisor India Treatment is a trusted medical travel partner for international patients seeking advanced, world-class healthcare in India. With over a decade of expertise, we have proudly assisted 3,500+ overseas patients, achieving a remarkable 95%+ success and satisfaction rate. Our unwavering commitment to compassionate care and professional service has earned us recognition from esteemed organizations, including the WHALE (World Health Alliance for Leadership and Excellence), the Indian Health Bureau, and the Mitra Foundation."
        buttonText="Discover How We Help"
        buttonLink="/contact"
        bannerBgImage="/banner/service.png"
        mainImageSrc="/banner/service-banner.png"
        mainImageAlt="Doctor providing expert medical guidance"
        patternStyle="medical"
    
      />

      <StatsSection />
      <Services />
      <TeamSilder />
      <MeetOurDoctors />
      <HospitalGroupPartners initialGroups={initialGroups} />
      <SafetyMeasures />
     
    </div>
  );
}

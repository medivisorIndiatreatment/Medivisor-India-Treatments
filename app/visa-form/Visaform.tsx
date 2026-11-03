"use client"
import { VisaFormContainer } from "@/components/visa-form/visa-form-container"
import Banner from "@/components/BannerService"
import { Trans } from '@/lib/i18n/Trans';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
        <Banner
  topSpanText="Indian e-Visa Made Easy"
  title="Complete Your Indian e-Visa Without Stress"
description="Applying for an Indian e-Visa doesn't have to be complicated. Medivisor helps you complete your application accurately, guides you through every step, and ensures a smooth, hassle-free process from start to finish."
  buttonText="Apply for Indian e-Visa"
  buttonLink="#visa-application"
  bannerBgImage="/visa-banner.png"
  mainImageSrc="/about-main-1.png"
  mainImageAlt="Simple and guided Indian e-Visa application process"
 />

      <VisaFormContainer />
    </main>
  )
}

'use client';

import Image from 'next/image';
import Hero from "@/components/Hero";
import PNGBanner from "@/components/PacificBanner";
import Link from 'next/link';
import HomepageCarousel from '@/components/ui/HomepageCarousel';
import { DESIGN_TOKENS } from '@/components/design-tokens';



export default function PacificBannerSlider() {
  return (
    <section className={` bg-white overflow-hidden relative`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} `}>
        <HomepageCarousel
          autoplay
          autoplayDelay={5000}
          pauseOnHover
          loop
          showControls
          
          basisClassName="basis-full"
          gapClassName="gap-0"
        >
      <PNGBanner />
      <Hero />
        </HomepageCarousel>
      </div>
    </section>
  );
}
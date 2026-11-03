"use client";

import Image from "next/image";
import Link from "next/link";
import { Trans } from "@/lib/i18n/Trans";
import { Hospital, Cpu, Users, HeartHandshake } from "lucide-react";
import { DESIGN_TOKENS } from "@/components/design-tokens";

const SCHEDULE_ITEMS = [
  {
    flag: "/icon/flag/png.png",
    country: "Papua New Guinea",
    city: "Port Moresby & Lae",
    date: "Sep 22–26",
  },
];

function Feature({
  icon: Icon,
  title,
  subtitle,
  dataI18nTitle,
  dataI18nOriginalTitle,
  dataI18nSubtitle,
  dataI18nOriginalSubtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  dataI18nTitle?: string;
  dataI18nOriginalTitle?: string;
  dataI18nSubtitle?: string;
  dataI18nOriginalSubtitle?: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-[#2DB8C7] text-white flex items-center justify-center mx-auto">
        {Icon}
      </div>
      <div className="mt-3">
        <p
          className="md :text-white md:text-gray-900  text-white md:text-lg text-xs break-words"
          data-i18n={dataI18nTitle}
          data-i18n-original={dataI18nOriginalTitle}
        >
          {title}
        </p>
        <p
          className="font-medium text-[#2DB8C7] md:text-lg text-xs break-words"
          data-i18n={dataI18nSubtitle}
          data-i18n-original={dataI18nOriginalSubtitle}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
export default function PacificBanner() {
  return (
    <section className="relative  bg-[url('/banner/png-mobile.png')] h-full md:h-auto md:bg-[url('/banner/png-banner.png')]  bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/50 to-white/30 md:block hidden"></div>
      <div className="absolute inset-0 bg-[#29376A] md:hidden"></div>
      <div
        className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} relative z-10`}
      >
        <div
          className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-0`}
        >
          {/* Left - Image */}
          <div className="relative order-1 md:block hidden lg:order-1">
            <div className="relative aspect-[1/1] lg:aspect-[5/4] w-full overflow-hidden">
              <Image
                src="/teams/sushant.png"
                alt="Mr. Kumar Sushant - Director, Medivisor India Treatment"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={90}
                className="object-cover object-center"
              />

              {/* Only Text Box */}
              <div className="absolute bottom-0 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6 lg:bottom-8 lg:left-8 lg:right-8">
                <div className="bg-[#fffff7] rounded-xl px-5 py-4 sm:px-6 sm:py-5 shadow-lg">
                  <h1
                    className="text-lg sm:text-2xl lg:text-3xl font-bold  text-white md:text-gray-900 leading-tight"
                    data-i18n="pacific.title"
                    data-i18n-original="Meet Mr. Kumar Sushant"
                  >
                    <Trans id="pacific.title">Mr. Kumar Sushant</Trans>
                  </h1>

                  <p className="mt-1 text-sm sm:text-base text-gray-800">
                    Founder, CEO &amp; MD — Medivisor India Treatment
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className={`order-2 py-10 md:mt-0 mt-20 lg:order-2`}>
            <div className="max-w-xl">
              {/* Heading */}
              <h1
                className={`text-4xl sm:text-3xl lg:text-4xl font-bold  text-white md:text-gray-900 leading-[1.1] tracking-tight mb-0 drop-shadow-lg`}
                data-i18n="pacific.title"
                data-i18n-original=" Meet Mr. Kumar Sushant"
              >
                <Trans id="pacific.title"> MEDIVISOR PNG PATIENT MEET</Trans>
              </h1>

              {/* Date */}
              <p
                className={`text-base md:text-lg  text-white md:text-gray-900 font-normal md:font-medium mb-4 drop-shadow`}
                data-i18n="pacific.dates"
                data-i18n-original="Sep 22 – 26, 2026"
              >
                <Trans id="pacific.dates">22–26 Sep 2026 | Port Moresby & Lae</Trans>
              </p>

              {/* Description */}
              <p className= "text-white md:text-gray-900 text-lg font-normal md:font-medium  leading-relaxed mb-2 drop-shadow">




                Are you struggling with a medical condition?


              </p>

              <p className= "text-white md:text-gray-900 text-lg font-normal md:font-medium  leading-relaxed mb-2 drop-shadow">
                Medivisor is visiting your city this month to help you explore advanced, world-class and affordable treatment options in India.
              </p>

              <p className= "text-white md:text-gray-900 text-lg font-normal md:font-medium  leading-relaxed mb-1 drop-shadow">
                Meet us. Understand your options. Take the next step.
              </p>
              {/* <div className="grid grid-cols-4 gap-3 md:gap-2 mt-6">
                <Feature
                  icon={<Hospital size={24} />}
                  title="300+ "
                  subtitle=" Hospitals"
                  dataI18nTitle="hero.stats.hospitals-count"
                  dataI18nOriginalTitle="300+ "
                  dataI18nSubtitle="hero.stats.top-hospitals"
                  dataI18nOriginalSubtitle=" Hospitals"
                />
                 <Feature
                  icon={<Users size={24} />}
                  title="2000+ "
                  subtitle="Specialists"
                  dataI18nTitle="hero.stats.doctors-count"
                  dataI18nOriginalTitle="2000+ "
                  dataI18nSubtitle="hero.stats.specialist-doctors"
                  dataI18nOriginalSubtitle="Specialists"
                />
                <Feature
                  icon={<Cpu size={24} />}
                  title="Robotic"
                  subtitle="Surgeries"
                  dataI18nTitle="hero.stats.modern"
                  dataI18nOriginalTitle="Modern"
                  dataI18nSubtitle="hero.stats.technologies"
                  dataI18nOriginalSubtitle="Technologies"
                />
               
                <Feature
                  icon={<HeartHandshake size={24} />}
                  title="Speedy"
                  subtitle="Recovery"
                  dataI18nTitle="hero.stats.personalised"
                  dataI18nOriginalTitle="Personalised"
                  dataI18nSubtitle="hero.stats.care"
                  dataI18nOriginalSubtitle="Care"
                />
              </div> */}
              <div className="pt-0.5">
                <Link
                  href="/png-patient-meet#pngfrom"
                  className="inline-flex items-center justify-center whitespace-nowrap w-auto font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E22026] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#29A9B9] md:bg-[#23366E] text-white hover:bg-[#1A2A52] hover:shadow-md text-lg active:scale-[0.98] cursor-pointer py-2 px-10 rounded-md mt-4"
                  data-trans-managed="true"
                >
                  BOOK YOUR APPOINTMENT
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

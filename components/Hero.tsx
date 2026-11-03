

"use client";

import Image from "next/image";
import { Hospital, Cpu, Users, HeartHandshake } from "lucide-react";
import { DESIGN_TOKENS } from "./design-tokens";
import { Trans } from "@/lib/i18n/Trans";
import MedivisorBannerBar from "@/components/MedivisorBannerBar";

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
          className="md:text-gray-900  text-white md:text-lg text-xs break-words"
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

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-white md:h-auto md:min-h-[80vh] h-auto">
      <div
        className={`relative md:h-auto md:min-h-[70vh] h-[70vh] ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} py-10 `}
      >
        <Image
          src="/medical-banner.png"
          alt="Medical treatment banner showing advanced healthcare facilities"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover absolute h-full w-full object-right md:object-center z-0"
          aria-hidden="true"
        />
        <div className="absolute bottom-0 w-full left-0 md:h-auto md:min-h-[70vh] md:hidden h-[70vh] bg-linear-to-b from-blue-500/40 via-[#0b2b64]/75 to-[#04122b]/95 z-[1]" />
        <div className={`absolute inset-0 z-10 h-full ${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}   flex flex-col md:items-center justify-center md:justify-end`}>
        <div className="grid h-full w-full lg:grid-cols-12 lg:justify-between">
          <div className="lg:col-span-5 md:items-center items-end h-full flex flex-col justify-end md:justify-center shrink-0 min-w-0">
            <div className="w-full mb-10">
<h2 className="font-hughson text-[80px] md:text-[120px] text-[#2DB8C7] font-light leading-[0.6] break-words" data-i18n="hero.subtitle" data-i18n-original="You're on Your Way to">
                <Trans id="hero.subtitle">You're on Your Way to</Trans>
              </h2>

              <h1 className="leading-[0.9] gap-x-2 flex mt-2">
                <span className="md:text-[#0b2b64] text-white font-bold text-[48px] lg:text-[80px] break-words" data-i18n="hero.title.getting" data-i18n-original="Getting">
                  <Trans id="hero.title.getting">Getting</Trans>
                </span>
                <span className="text-[#27B5C5] font-bold text-[48px] lg:text-[80px] break-words" data-i18n="hero.title.better" data-i18n-original="Better">
                  <Trans id="hero.title.better">Better</Trans>
                </span>
              </h1>

              <div className="md:flex hidden w-full items-center gap-0">
                <div className="h-px w-full bg-[#D7B25A]" />
                <svg
                  width="160"
                  height="44.8"
                  viewBox="0 0 160 44.8"
                  fill="none"
                  className="shrink-0"
                  aria-hidden="true"
                >
                  <path
                    d="M0 22.4H32L41.6 22.4L52.8 7.46L65.6 37.34L80 3.74L94.4 29.87L105.6 22.4H160"
                    stroke="#D7B25A"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

<p className="md:text-gray-700 md:mt-0 mt-5 text-white text-xl lg:text-[20px] max-w-2xl break-words" data-i18n="hero.description" data-i18n-original="Advanced overseas medical treatment in India with exceptional care and seamless support.">
                <Trans id="hero.description">Advanced overseas medical treatment in India with exceptional care and seamless support.</Trans>
              </p>

              <div className="grid grid-cols-4 gap-3 md:gap-2 mt-6">
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
              </div>
            </div>
          </div>
        </div>
        </div>
       
      </div>
       <MedivisorBannerBar />
    </section>
  );
}

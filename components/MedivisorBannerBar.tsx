"use client";

import { DESIGN_TOKENS } from "@/components/design-tokens";
import Image from "next/image";
import { Trans } from "@/lib/i18n/Trans";

interface FeatureItemProps {
  iconType?: "icon" | "image";
  iconSrc?: string;
  title: string;
  subtitle: string;
  titleI18nKey?: string;
  subtitleI18nKey?: string;
}

interface StatItemProps {
  iconType?: "icon" | "image";
  iconSrc?: string;
  label: string;
  value: string;
  iconColor?: string;
  borderColor?: string;
  labelColor?: string;
  labelI18nKey?: string;
}

interface StatItemConfig {
  key: string;
  iconType: "image";
  iconSrc: string;
  label: string;
  value: string;
}

const sharedStatStyles = {
  borderColor: DESIGN_TOKENS.COLORS.BANNER_GOLD,
  labelColor: "#111827",
  iconColor: "#111827",
};

const statsData: StatItemConfig[] = [
  {
    key: "powered",
    iconType: "image",
    iconSrc: "/icon/service-11.png",
    label: "Serving since ",
    value: "11 Years",
  },
  {
    key: "patients",
    iconType: "image",
    iconSrc: "/icon/earth.svg",
    label: "Offices in",
    value: " 15 Countries",
  },
  {
    key: "trusted",
    iconType: "image",
    iconSrc: "/icon/trust.svg",
    label: "Trusted By",
    value: "80000+ People",
  },


];

export default function IndiaAwaitsBar() {
  return (
    <section dir="ltr" className="hidden w-full   absolute bottom-0 md:block">
      <div className="relative h-28 overflow-hidden">
        <div className="flex h-28 w-full items-end">
          <div className="relative z-30 grid h-28 w-[50%] grid-cols-5 items-center bg-[#0b2b64]">
            <div className="w-full col-span-2  md:block hidden">
              <h2 className="text-white ps-auto text-right text-[18px] md:text-[28px] font-light tracking-wide break-words" data-i18n="banner.title" data-i18n-original="India Awaits You!" data-trans-managed="true">
                <Trans id="banner.title">India Awaits You!</Trans>
              </h2>
            </div>

            <div className="flex flex-1 col-span-3 relative z-10 pl-8  justify-end py-2 md:py-4  min-w-0">
              <FeatureItem iconType="image" iconSrc="/icon/flight.svg" title="Seamless Travel" subtitle="Arrangements" titleI18nKey="banner.travel" subtitleI18nKey="banner.arrangements" />
              <FeatureItem iconType="image" iconSrc="/icon/hotel.svg" title="Comfortable" subtitle="Accommodation" titleI18nKey="banner.comfortable" subtitleI18nKey="banner.accommodation" />
              <FeatureItem iconType="image" iconSrc="/icon/support.svg" title="Dedicated" subtitle="On-Ground Support" titleI18nKey="banner.dedicated" subtitleI18nKey="banner.support" />
            </div>

          </div>
          <div className="  h-full md:w-[150px]  relative z-20 shrink-0 overflow-hidden">
            <Image src="/icon/curve.png" alt="Plane" fill sizes="150px" className="object-contain object-left" />
          </div>



          <div className="w-full right-0 absolute hidden bg-gray-50 px-6 h-20 col-span-2 justify-end  md:flex items-center">
            {statsData.map((stat, idx) => (
              <div key={stat.key} className="flex float-end justify-end items-center">
                <StatItem
                  iconType={stat.iconType}
                  iconSrc={stat.iconSrc}
                  label={stat.label}
                  value={stat.value}
                  iconColor={sharedStatStyles.iconColor}
                  borderColor={sharedStatStyles.borderColor}
                  labelColor={sharedStatStyles.labelColor}
                />
                {/* {idx < statsData.length - 1 && <Separator />} */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ iconType = "image", iconSrc, title, subtitle, titleI18nKey, subtitleI18nKey }: FeatureItemProps) {
  return (
    <div
      className="
    flex flex-col items-center justify-center md:py-0 py-2 px-4 md:px-4
border-[#7082a580] border-s
    first:border-s-0  md:border-s md:last:border-s
  "
    >
      {iconType === "image" && iconSrc ? (
        <div className="relative w-7 h-7 mb-1 md:mb-0">
          <Image src={iconSrc} alt={title} fill sizes="(max-width: 767px) 28px, 28px" className="object-contain" loading="eager" />
        </div>
      ) : null}
      <p className="text-white text-center text-xs md:text-[14px] md:font-medium break-words" data-i18n={titleI18nKey} data-i18n-original={`${title} ${subtitle}`} data-trans-managed="true">
        <Trans id={titleI18nKey}>{title}</Trans>
        <br />
        <Trans id={subtitleI18nKey}>{subtitle}</Trans>
      </p>
    </div>
  );
}

function StatItem({ iconType = "image", iconSrc, label, value, iconColor, borderColor, labelColor, labelI18nKey }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 px-1 md:px-2">
      {iconType === "image" && iconSrc ? (
        <div className="relative w-9 h-9 md:w-12 md:h-12  " >
          <Image src={iconSrc} alt={label} fill sizes="(max-width: 767px) 36px, 40px" className="object-contain" loading="eager" />
        </div>
      ) : null}
      <div className="flex flex-col">
        <p className="font-medium text-xs md:text-base leading-tight break-words" style={{ color: labelColor }} data-i18n={labelI18nKey} data-i18n-original={label} data-trans-managed="true">
          <Trans id={labelI18nKey}>{label}</Trans>
        </p>
        <p className="font-medium text-xs md:text-base leading-tight break-words" style={{ color: iconColor }} data-trans-managed="true">
          <Trans id={`banner.value.${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}>{value}</Trans>
        </p>
      </div>
    </div>
  );
}

function Separator() {
  return <div className="w-px h-10" style={{ backgroundColor: DESIGN_TOKENS.COLORS.BORDER_GRAY_LIGHT }} />;
}

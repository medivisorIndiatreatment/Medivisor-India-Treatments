
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui';
import { DESIGN_TOKENS } from './design-tokens';
import {
  useTranslatedString,
  useTranslatedHtmlString,
} from '@/lib/i18n';

type PatternStyle = 'medical' | 'geometric' | 'abstract' | 'banner';

interface BannerProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  topSpanText?: string;
  mainImageSrc?: string;
  mainImageAlt?: string;
  bannerBgImage?: string;
  bannerBgImageMobile?: string;
  patternStyle?: PatternStyle;
}

const DEFAULT_BANNER_BG = '/images/medical-banner-bg.webp';

export default function Banner({
  title,
  description,
  buttonText,
  buttonLink,
  topSpanText,
  mainImageSrc,
  mainImageAlt = 'Banner image',
  bannerBgImage = DEFAULT_BANNER_BG,
  bannerBgImageMobile,
}: BannerProps) {
  const translatedTitle = useTranslatedString(title);
  const translatedDescription = useTranslatedHtmlString(description);
  const translatedButtonText = useTranslatedString(buttonText || '');
  const translatedTopSpanText = useTranslatedString(topSpanText || '');
  const translatedMainImageAlt = useTranslatedString(mainImageAlt);

  return (
    <section className="relative isolate min-h-[80vh] overflow-hidden bg-[#23366E] text-white">
      {/* Layer 1: Background image */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        {bannerBgImageMobile ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
              style={{
                backgroundImage: `url("${bannerBgImageMobile}")`,
              }}
            />
            <div
              className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
              style={{
                backgroundImage: `url("${bannerBgImage}")`,
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("${bannerBgImage}")`,
            }}
          />
        )}
      </div>

      {/* Layer 2: Full dark overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-[#17264F]/55"
      />

      {/* Layer 3: Directional gradient for readable text */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-[#17264F]/85 via-[#23366E]/50 to-[#23366E]/85"
      />

      {/* Layer 4: Subtle Medivisor teal accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 bg-[radial-gradient(ellipse_at_75%_45%,rgba(41,169,185,0.54),transparent_50%)]"
      />

      {/* Main content always stays above the overlays */}
      <div className="container relative z-40 mx-auto grid min-h-[80vh] w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 sm:px-6 md:grid-cols-2 md:gap-8 lg:gap-12 lg:px-8">
        {/* Left content */}
        <div className="relative z-10 min-w-0 py-10 sm:py-12 md:py-8">
         

          <h1
            className="mb-5 max-w-2xl break-words text-3xl font-bold leading-[1.15] tracking-tight text-white sm:mb-6 sm:text-4xl "
            data-i18n-original={title}
            data-trans-managed="true"
          >
            {translatedTitle}
          </h1>

          <div
            className={`mb-7 max-w-xl text-sm leading-7 text-white/95 sm:text-base sm:leading-8 lg:mb-8 ${DESIGN_TOKENS.TYPOGRAPHY.HERO_BODY}`}
            dangerouslySetInnerHTML={{
              __html: translatedDescription,
            }}
            data-trans-managed="true"
            suppressHydrationWarning
          />

          {buttonText && buttonLink && (
            <Link
              href={buttonLink}
              className="inline-flex max-w-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FD3DC] focus-visible:ring-offset-2 focus-visible:ring-offset-[#23366E]"
            >
              <Button
                variant="secondary"
                className="h-12 max-w-full rounded-xl px-6 text-sm font-semibold shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/90 sm:px-7 sm:text-base"
                data-i18n-original={buttonText}
                data-trans-managed="true"
              >
                {translatedButtonText}
              </Button>
            </Link>
          )}
        </div>

        {/* Right image: bottom-aligned and above the overlay */}
        {mainImageSrc && (
          <div className="relative mx-auto flex w-full min-w-0 items-end justify-center md:mx-0 md:h-[80vh] md:min-h-[80vh]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-8 right-5 h-40 w-40 rounded-full bg-[#29A9B9]/20 blur-3xl"
            />

            <Image
              src={mainImageSrc}
              alt={translatedMainImageAlt}
              width={800}
              height={800}
              priority
              sizes="(max-width: 767px) 90vw, (max-width: 1023px) 45vw, 560px"
              className="relative z-10 block h-auto max-h-[320px] w-auto max-w-full object-contain object-bottom sm:max-h-[400px] md:absolute md:inset-x-0 md:bottom-0 md:mx-auto md:max-h-[calc(80vh-48px)] md:max-w-full lg:max-h-[calc(80vh-64px)]"
            />
          </div>
        )}
      </div>
    </section>
  );
}
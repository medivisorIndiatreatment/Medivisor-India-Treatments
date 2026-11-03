'use client';

import { FaArrowRight, FaPhoneAlt } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

// Define a type for the primary and secondary CTA buttons
interface CtaButton {
  text: string;
  link: string;
  icon?: React.ReactNode;
  isPrimary?: boolean;
}

interface BannerProps {
  // Styling & Layout Props
  bannerBgImage: string;
  bannerBgImageMobile?: string; // Made mandatory for background effect
  // Content Props
  topSpanText?: string;
  title: string;
  description: string; // HTML string for rich text
  // CTA Props
  ctas?: CtaButton[]; // FIX 1: Made ctas optional
  children?: React.ReactNode;
  // NOTE: mainImageSrc, mainImageAlt, mainImageClass, layoutType are REMOVED as requested.
}

/**
 * A professional, single-column Hero Banner with a full-bleed background image and 70vh height.
 */
export default function CleanHeroBanner({
  bannerBgImage,
  bannerBgImageMobile,
  title,
  description,
  ctas = [], // FIX 2: Provide a default empty array for robustness
  topSpanText,
  children,
}: BannerProps) {

  // The logic now safely calls .find() on an array (either the passed array or [])
  const primaryCta = ctas.find(cta => cta.isPrimary) || ctas[0];
  const secondaryCta = ctas.find(cta => !cta.isPrimary && cta !== primaryCta);

  // Helper function to render a CTA button
  const renderCta = (cta: CtaButton, className: string) => (
    <Link
      href={cta.link}
      className={`
        ${className} 
        inline-flex items-center justify-center font-medium tracking-wide transition duration-300 ease-in-out
        text-base px-6 py-3 rounded-lg
      `}
    >
      {cta.icon && <span className="mr-2">{cta.icon}</span>}
      {cta.text}
    </Link>
  );

  return (
    <section
      // Set to 70vh minimum height and light theme
      className="relative px-0 md:px-0 overflow-hidden w-full bg-gray-50 text-gray-900 min-h-[65vh] md:min-h-[70vh] flex items-end md:items-center"
    >
<div className="absolute inset-0 z-0">
        {bannerBgImage && (
          <Image
            src={bannerBgImage}
            alt="Banner background"
            fill
            priority
            quality={75}
            className="object-cover hidden md:block object-center"
            sizes="100vw"
          />
        )}
        {bannerBgImageMobile && (
          <Image
            src={bannerBgImageMobile}
            alt="Banner background"
            fill
            priority
            quality={75}
            className="object-contain md:hidden block object-cover"
            sizes="100vw"
          />
        )}
      </div>


      {/* Content Container (Centered for clean single-column layout) */}
      <div className="relative z-10 md:container md:px-16 mx-auto h-full py-1 md:py-0">
        <div className="grid relative md:grid-cols-2 justify-items-start">

          {/* Main Content Area */}
          <div className="absolute inset-0 md:hidden
 bg-gradient-to- from-white/60 via-black/10 to-black/70
 backdrop-blur-xs">
          </div>

          <div className='mb-5 pt-5 relative z-30 px-4'>
            <div className="space-y-2 lg:space-y-3">

              {/* Top Span Text */}
              {topSpanText && (
                <span className="inline-block text-base uppercase text-[#E22026] font-medium tracking-widest border-l-2 border-red-700 pl-2">
                  {topSpanText}
                </span>
              )}

              {/* Main Title - Professional Typography (Large, clean, leading-snug) */}
              <h1 className="heading-lg">
                {title}
              </h1>

              {/* Description - Highly readable, medium dark gray text */}
              <div
                className="text-xl md:block hidden text-gray-700 max-w-2xl leading-relaxed md:font-light"
                dangerouslySetInnerHTML={{ __html: description }}
              />

              {/* CTA Buttons */}
              {(primaryCta || secondaryCta) && (
                <div className="flex flex-wrap gap-4 pt-4">

                  {/* Primary CTA - Focus on professional, deep contrast color */}
                  {primaryCta && renderCta(primaryCta, `
              bg-[#E22026] cursor-pointer md:block hidden hover:bg-[#74BF44] text-white font-medium px-5 py-2 rounded-md shadow-md transition-all
            `)}

                  {/* Secondary/Contact CTA - Clean, outline style */}
                  {secondaryCta && renderCta(secondaryCta, `
              text-gray-800 border-2 border-gray-300 bg-white hover:bg-gray-100
            `)}

                </div>
              )}
            </div>
            {children}
          </div>

        </div>
      </div>
    </section>
  );
}
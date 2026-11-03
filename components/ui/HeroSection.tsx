"use client"

import Image from "next/image"
import { DESIGN_TOKENS, getSectionClasses } from "@/components/design-tokens"

interface HeroSectionProps {
  title: string
  titleI18nKey?: string
  subtitle?: string
  subtitleI18nKey?: string
  image?: string | null
  className?: string
}

export default function HeroSection({
  title,
  titleI18nKey,
  subtitle,
  subtitleI18nKey,
  image,
  className
}: HeroSectionProps) {
  return (
    <section dir="ltr" className={`relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] ${className || ""}`}>
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-white/10" />

      <div className="absolute inset-0 flex flex-col justify-end">
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} pb-4 sm:pb-6 md:pb-10 lg:pb-12`}>
          <div className="max-w-xl sm:max-w-2xl md:max-w-4xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight tracking-tight" data-i18n={titleI18nKey} data-i18n-original={title}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-base md:text-lg text-gray-200 leading-relaxed" data-i18n={subtitleI18nKey} data-i18n-original={subtitle}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
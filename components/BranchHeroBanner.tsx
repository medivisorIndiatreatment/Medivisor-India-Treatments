"use client"

import { useMemo, useCallback, useState } from "react"
import Image from "next/image"
import { MapPin } from "lucide-react"
import { getWixImageUrl } from "@/lib/wixMedia"
import { useI18n } from "@/lib/i18n"
import { useTranslatedStrings, useTranslatedHtmlString } from "@/lib/i18n"

interface Accreditation {
  _id?: string
  title?: string
  name?: string
  image?: string | null
  logo?: string | null
}

interface BranchHeroBannerProps {
branchName?: string
  title?: string
  titleI18nKey?: string
  branchImage?: string | null
  logo?: string | null
  address?: string | null
  description?: string | null
  accreditations?: Accreditation[]
  hospitalName?: string
}

export default function BranchHeroBanner({
branchName,
  title,
  titleI18nKey,
  branchImage,
  logo,
  address,
  description,
  accreditations = [],
  hospitalName,
}: BranchHeroBannerProps) {
  const { t } = useI18n()

  const translatableStrings = useMemo(() => {
    const strings: string[] = []
    if (branchName) strings.push(branchName)
    if (title) strings.push(title)
    if (address) strings.push(address)
    if (description) strings.push(description)
    return Array.from(new Set(strings.filter(Boolean)))
  }, [branchName, title, address, description])

  const translatedStrings = useTranslatedStrings(translatableStrings)

  const translationMap = useMemo(() => {
    const map = new Map<string, string>()
    translatableStrings.forEach((original, i) => {
      map.set(original, translatedStrings[i] ?? original)
    })
    return map
  }, [translatableStrings, translatedStrings])

  const translate = useCallback((text: string): string => {
    if (!text) return text
    return translationMap.get(text) || text
  }, [translationMap])

  const translatedTitle = translate(title || t("Hospital Branch"))

  const translatedDescription = useTranslatedHtmlString(description || "")

  const displayDescription = useMemo(() => {
    if (!translatedDescription) return ""
    const isHtml = translatedDescription.includes('<') && translatedDescription.includes('>')
    if (isHtml) {
      const match = translatedDescription.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/i)
      if (match) {
        return translatedDescription.replace(match[0], '').trim()
      }
      return translatedDescription
    }
    return translatedDescription
  }, [translatedDescription])

  const displayAddress = useMemo(() => {
    if (address) return translate(address)
    return ""
  }, [address, translate])
  // Process images using wixMedia utility
  let bannerImg = null
  if (branchImage) {
    if (branchImage.startsWith('wix:image://')) {
      bannerImg = getWixImageUrl(branchImage)
    } else if (branchImage.startsWith('http://') || branchImage.startsWith('https://')) {
      bannerImg = branchImage
    } else {
      // Handle any other URL format as-is
      bannerImg = branchImage
    }
  }
  const logoImg = logo ? (logo.startsWith('wix:image://') ? getWixImageUrl(logo) : logo) : null
// Process accreditations
  const accreditationImages = accreditations
    ?.map((acc) => {
      if (typeof acc === 'string') return null
      if (acc.image) {
        const wixUrl = getWixImageUrl(acc.image)
        if (wixUrl) return wixUrl
      }
      if (acc.logo) {
        const wixUrl = getWixImageUrl(acc.logo)
        if (wixUrl) return wixUrl
      }
      return null
    })
    .filter((img): img is string => img !== null)

  const translatedAccreditationLabels = useMemo(() => {
    return accreditations.map((acc) => {
      const label = acc.title || acc.name || 'Accreditation'
      return translate(label)
    })
  }, [accreditations, translate])

  const [bannerError, setBannerError] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [accreditationErrors, setAccreditationErrors] = useState<Set<number>>(new Set())

  const handleBannerError = useCallback(() => {
    setBannerError(true)
  }, [])

  const handleLogoError = useCallback(() => {
    setLogoError(true)
  }, [])

  const handleAccreditationError = useCallback((index: number) => {
    setAccreditationErrors(prev => {
      const next = new Set(prev)
      next.add(index)
      return next
    })
  }, [])

  return (
    <section className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh]">
      {bannerImg && !bannerError ? (
        <Image
          src={bannerImg}
          alt={translatedTitle}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          onError={handleBannerError}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200" />
      )}

<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-white/10" />
      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="container mx-auto px-5 sm:px-6 md:px-10 pb-4 sm:pb-6 md:pb-10 lg:pb-12">
          <div className="max-w-xl sm:max-w-2xl md:max-w-4xl">

            {/* Logo (if available) */}
            {logoImg && !logoError && (
              <div className="mb-3 sm:mb-4">
                <Image
                  src={logoImg}
                  alt={hospitalName || "Hospital Logo"}
                  width={120}
                  height={50}
                  className="h-auto w-auto max-h-12 sm:max-h-14 md:max-h-16 object-contain bg-white/90 rounded-xs p-0"
                  priority
                  onError={handleLogoError}
                />
              </div>
            )}

<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-normal md:font-light text-white mb-2 sm:mb-3 md:mb-4 leading-tight" dir="auto" data-i18n={titleI18nKey} data-i18n-original={title} data-trans-managed="true">
              {translatedTitle}
            </h1>

            {displayAddress && (
              <div className="flex items-center gap-2 mb-3 sm:mb-4 md:mb-6">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                <p className="text-white/90 text-sm sm:text-base md:text-lg line-clamp-2" dir="auto" data-i18n-original={address} data-trans-managed="true">
                  {displayAddress}
                </p>
              </div>
            )}

            {/* {displayDescription && (
              <div
                className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed line-clamp-3"
                dir="auto"
                data-i18n-html=""
                data-trans-managed="true"
                dangerouslySetInnerHTML={{ __html: displayDescription }}
              />
            )} */}

              {(accreditationImages.length > 0 || (accreditations && accreditations.length > 0)) && (
                <div className="flex flex-wrap absolute md:top-8 top-4 right-3 sm:right-4 items-center gap-1 sm:gap-2 md:gap-3">
                  {accreditationImages.length > 0 ? (
                    accreditationImages.map((img, index) => (
                      <div
                        key={index}
                        className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/90 rounded-full flex items-center justify-center p-1"
                      >
                         {!accreditationErrors.has(index) ? (
                          <Image
                            src={img}
                            alt={`Accreditation ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 40px, (max-width: 768px) 48px, 56px"
                            className="object-contain rounded-full"
                            onError={() => handleAccreditationError(index)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h.75" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                   <div className="flex flex-wrap gap-1 sm:gap-2">
                     {accreditations.map((acc, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm rounded-full border border-white/30"
                          dir="auto"
                          data-i18n-original={acc.title || acc.name || 'Accreditation'}
                          data-trans-managed="true"
                        >
                          {translatedAccreditationLabels[index] || acc.title || acc.name || 'Accreditation'}
                        </span>
                     ))}
                   </div>
                 )}
               </div>
             )}

          </div>
        </div>
      </div>
    </section>
  )
}
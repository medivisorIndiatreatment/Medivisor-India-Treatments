"use client";

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { getWixImageUrl } from "@/lib/wixMedia"
import { DESIGN_TOKENS, getAlternatingBackground, SECTION_INDEX } from "@/components/design-tokens"
import { generateSlug } from "@/lib/slug-utils"
import { getPartnerTargetUrl } from "@/lib/services/homepage/transformers"
import type { HospitalData } from "@/lib/cms/types"

interface LogoItem {
  _id: string
  title?: string
  logoTitle?: string
  Logo?: string
  logoUrl?: string
  targetUrl?: string
  logo?: string
  image?: string
}

interface PartnersProps {
  initialLogos?: LogoItem[]
  initialHospitals?: HospitalData[]
}

function getResolvedLogoUrl(item: LogoItem): string | null {
  if (item.logoUrl && typeof item.logoUrl === "string" && item.logoUrl.trim() !== "") {
    return item.logoUrl
  }

  const logoValue = item.Logo || item.logo || item.image
  if (!logoValue) return null

  if (logoValue.startsWith("http://") || logoValue.startsWith("https://")) {
    return logoValue
  }

  if (logoValue.startsWith("wix:image://")) {
    try {
      const resolvedUrl = getWixImageUrl(logoValue)
      if (resolvedUrl) return resolvedUrl
    } catch {
      return null
    }
    return null
  }

  return null
}

function getLogoAlt(item: LogoItem): string {
  return item.logoTitle || item.title || "Partner Logo"
}

function getTargetUrl(item: LogoItem, hospitals?: HospitalData[]): string | null {
  if (item.targetUrl && typeof item.targetUrl === "string" && item.targetUrl.trim() !== "") {
    return item.targetUrl
  }

  const resolvedFromHospital = hospitals ? getPartnerTargetUrl(item, hospitals) : undefined
  if (resolvedFromHospital) {
    return resolvedFromHospital
  }

  return null
}

function LogoImage({ src, alt, eager, onError }: { src: string; alt: string; eager?: boolean; onError: () => void }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={`object-contain rounded-md p-1 max-h-full w-auto transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      loading={eager ? "eager" : "lazy"}
      sizes="(max-width: 768px) 120px, 180px"
      onLoad={() => setLoaded(true)}
      onError={(e) => {
        const target = e.target as HTMLImageElement
        target.style.display = "none"
        onError()
      }}
    />
  )
}

export default function Partners({ initialLogos, initialHospitals }: PartnersProps) {
  const logos = initialLogos || []
  const hospitals = initialHospitals || []
  const tripleLogos = useMemo(() => [...logos, ...logos, ...logos], [logos])

  if (logos.length === 0) {
    return null
  }

  return (
    <section className={`${getAlternatingBackground(SECTION_INDEX.PARTNERS)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`} id="Partners">
      <div className={`${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="marquee-outer">
          <div className="marquee-track gap-x-4">
            {tripleLogos.map((item, index) => {
              const logoUrl = getResolvedLogoUrl(item)
              const alt = getLogoAlt(item)

              const logoElement = logoUrl ? (
                <LogoImage src={logoUrl} alt={alt} eager={index < logos.length} onError={() => {}} />
              ) : (
<span className="text-sm text-gray-400 truncate px-2" data-i18n-original={alt}>{alt}</span>
              )

              const targetUrl = getTargetUrl(item, hospitals)

              return targetUrl ? (
                <Link key={`${item._id}-${index}`} href={targetUrl}>
                  <div className="marquee-card">{logoElement}</div>
                </Link>
              ) : (
                <div key={`${item._id}-${index}`} className="marquee-card">{logoElement}</div>
              )
            })}
          </div>
        </div>
      </div>

      <style jsx global>{`
        #Partners .marquee-outer {
          overflow: hidden;
        }

        #Partners .marquee-track {
          display: flex;
          white-space: nowrap;
          width: max-content;
          gap: 1rem;
          animation: marquee-scroll 300s linear infinite;
          animation-fill-mode: forwards;
          will-change: transform;
        }

        #Partners .marquee-outer:hover .marquee-track {
          animation-play-state: paused;
        }

        #Partners .marquee-card {
          flex: 0 0 auto;
          display: flex;
          border: 1px solid #e5e7eb;
          align-items: center;
          justify-content: center;
          height: 4.5rem;
          min-width: 9.5rem;
          position: relative;
          background-color: #f9fafb;
          box-shadow:
            0 2px 8px -2px rgba(0, 0, 0, 0.06),
            0 1px 2px -1px rgba(0, 0, 0, 0.04);
          border-radius: 4px;
          transition:
            transform 220ms ease,
            box-shadow 220ms ease,
            background-color 220ms ease;
        }

        #Partners .marquee-card a {
          text-decoration: none;
          display: block;
        }

        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-33.3333%); }
        }
      `}</style>
    </section>
  )
}

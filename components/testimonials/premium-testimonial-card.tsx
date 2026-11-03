"use client"

import Image from "next/image"
import { Play } from "lucide-react"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { cn } from "@/lib/utils"
import type { EnrichedVideo } from "@/types/video"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import { getYouTubeThumbnailUrl } from "@/lib/utils/youtube"
import { useTranslatedString, useTranslatedHtmlString } from "@/lib/i18n"

interface PremiumTestimonialCardProps {
  video: EnrichedVideo
  index: number
  onPlayVideo: (videoId: string, title: string) => void
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function PremiumTestimonialCard({ video, index, onPlayVideo }: PremiumTestimonialCardProps) {
  const { meta } = video
const rawPatientName = meta?.patientName || video.title || "Patient Story"
  const rawTreatment = meta?.treatment || ""
  const rawHospital = meta?.hospital || ""
  const rawCountry = meta?.country || ""
  const rawTestimonial = meta?.testimonial || ""
  const rawChannelTitle = video.channelTitle || ""

  const patientName = useTranslatedString(rawPatientName)
  const treatment = useTranslatedString(rawTreatment)
  const hospital = useTranslatedString(rawHospital)
  const country = useTranslatedString(rawCountry)
  const testimonial = useTranslatedHtmlString(rawTestimonial)
  const channelTitle = useTranslatedString(rawChannelTitle)

  const title = patientName
  const displaySubtitle = rawHospital
    ? `${treatment} at ${hospital}`
    : channelTitle
  const thumbnailUrl = getYouTubeThumbnailUrl(video.videoId, "hqdefault") || ""

  const noPreviewText = useTranslatedString("No preview")
  return (
    <div
      className={cn(
        "flex flex-col rounded-3xl overflow-hidden",
        "border border-white/60",
        "bg-white/70 backdrop-blur-lg",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]",
        "hover:shadow-[0_4px_6px_rgba(0,0,0,0.06),0_20px_40px_rgba(0,0,0,0.12)]",
        "transition-all duration-500 ease-out",
        "group"
      )}
    >
      {/* Thumbnail with play overlay */}
      <button
        type="button"
        onClick={() => onPlayVideo(video.videoId, title)}
        className={cn(
          "relative w-full aspect-video overflow-hidden",
          "bg-slate-100",
          "focus:outline-none focus:ring-2 focus:ring-[#29A9B9]/40 focus:ring-offset-2"
        )}
        aria-label={`Play video: ${title}`}
      >
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            unoptimized
            className={cn(
              "object-cover",
              "transition-transform duration-700 ease-out",
              "group-hover:scale-110"
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-400">
{noPreviewText}
          </div>
        )}

        {/* Glassmorphism overlay */}
        <div
          className={cn(
            "absolute inset-0",
            "bg-gradient-to-t from-black/60 via-black/20 to-transparent",
            "opacity-80 transition-opacity duration-500",
            "group-hover:opacity-90"
          )}
        />

        {/* Centered animated play button */}
        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 scale-100 group-hover:scale-110">
          <div
            className={cn(
              "flex items-center justify-center",
              "h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24",
              "rounded-full",
              "bg-white/25 backdrop-blur-md",
              "border border-white/40",
              "shadow-[0_8px_32px_rgba(0,0,0,0.2)]",
              "transition-all duration-500",
              "group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
            )}
          >
            <Play
              className={cn(
                "h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white ml-1",
                "transition-transform duration-500",
                "group-hover:scale-110",
                "animate-pulse"
              )}
              fill="white"
              strokeWidth={0}
            />
          </div>
        </div>
      </button>

      {/* Card body */}
      <div className="flex flex-col flex-grow p-5 md:p-6 gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center justify-center rounded-full text-white font-semibold text-sm flex-shrink-0",
              "h-10 w-10 md:h-11 md:w-11",
              "bg-gradient-to-br from-[#23366E] to-[#29A9B9]",
              "shadow-md"
            )}
            aria-hidden
          >
{getInitials(patientName || "PT")}
          </div>
          <div className="min-w-0">
            <h3 className={cn(DESIGN_TOKENS.TYPOGRAPHY.H4, "text-[#23366E] truncate")}>
              {title}
            </h3>
            {displaySubtitle && (
              <p className={cn(DESIGN_TOKENS.TYPOGRAPHY.BODY_SM, "text-gray-600 truncate")}>
                {displaySubtitle}
              </p>
            )}
          </div>
        </div>

{country && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <GlobeIcon className="h-3.5 w-3.5" aria-hidden />
            {country}
          </div>
        )}

        {testimonial && (
          <p
            className="text-sm text-gray-600 leading-relaxed line-clamp-3 border-l-2 border-[#29A9B9] pl-4"
            dangerouslySetInnerHTML={{ __html: testimonial }}
          />
        )}
      </div>
    </div>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}

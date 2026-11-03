"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import Banner from "@/components/BannerService"
import CtaSection from "@/components/CtaSection"
import { useVideos } from "@/hooks/useVideos"
import { PremiumTestimonialCard } from "@/components/testimonials/premium-testimonial-card"
import { PremiumVideoModal } from "@/components/testimonials/premium-video-modal"
import { SearchBar } from "@/components/testimonials/SearchBar"
import { LoadingState } from "@/components/testimonials/LoadingState"
import { EmptyState } from "@/components/testimonials/EmptyState"
import { TESTIMONIAL_META } from "@/lib/data/testimonials"
import { isShortDuration } from "@/lib/utils/youtube"
import type { EnrichedVideo } from "@/types/video"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import { useTranslatedStrings } from "@/lib/i18n";

const GRID_INITIAL_COUNT = 12
const BATCH_SIZE = 8

export default function PatientTestimonialsPage() {
  const { videos, loading, searchLoading, searchTerm, setSearchTerm } = useVideos({ maxResults: 1000 })
  const [gridVisibleCount, setGridVisibleCount] = useState(GRID_INITIAL_COUNT)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [selectedTitle, setSelectedTitle] = useState<string>("")

  const staticStrings = [
    "Real Stories, Real Recoveries",
    "Watch firsthand accounts from patients across the globe who trusted us with their care.",
    "You've reached the end of patient stories",
  ];
  const translatedStrings = useTranslatedStrings(staticStrings);
  const strings: Record<string, string> = {};
  staticStrings.forEach((s, i) => {
    strings[s] = translatedStrings[i] ?? s;
  });

  const enrichedVideos = useMemo(() => {
    return videos
      .filter((v) => !isShortDuration(v.duration))
      .map((v, idx) => ({
        ...v,
        meta: TESTIMONIAL_META[v.videoId],
        _sortKey: v.publishedAt ? new Date(v.publishedAt).getTime() : 0,
        _originalIndex: idx,
      }))
      .sort((a, b) => {
        const dateA = a._sortKey as number
        const dateB = b._sortKey as number
        if (dateB !== dateA) return dateB - dateA
        return (b as any)._originalIndex - (a as any)._originalIndex
      }) as EnrichedVideo[]
  }, [videos])

  useEffect(() => {
    setGridVisibleCount(GRID_INITIAL_COUNT)
  }, [searchTerm])

  const visibleVideos = enrichedVideos.slice(0, gridVisibleCount)
  const hasMore = gridVisibleCount < enrichedVideos.length

  const loadMore = useCallback(() => {
    if (gridVisibleCount >= enrichedVideos.length) return
    setGridVisibleCount((prev) => Math.min(prev + BATCH_SIZE, enrichedVideos.length))
  }, [enrichedVideos.length, gridVisibleCount])

  useEffect(() => {
    if (loading || searchLoading || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore) {
          loadMore()
        }
      },
      { rootMargin: "400px", threshold: 0 }
    )

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }

    return () => observer.disconnect()
  }, [loading, searchLoading, hasMore, loadMore])

  const handleClear = useCallback(() => {
    setSearchTerm("")
  }, [setSearchTerm])

  const handlePlay = useCallback((videoId: string, title: string) => {
    setSelectedVideoId(videoId)
    setSelectedTitle(title)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedVideoId(null)
    setSelectedTitle("")
  }, [])

  if (loading) {
    return <LoadingState />
  }

  return (
    <>
      <Banner
        topSpanText="Patient Testimonials"
        title="3,500+ International Patients Share Their Journey"
        description="From choosing the right hospital to seamless post-treatment care, our patients' experiences with Medivisor are filled with trust, comfort, and hope. Watch their stories and see how we make every journey unforgettable."
        buttonText="Read Their Stories"
          bannerBgImage="/banner/service.png"
        buttonLink="/patient-testimonials"
        mainImageSrc="/banner/testimonials-banner.png"
        mainImageAlt="International Patients Sharing Experiences with Medivisor"
      />

      <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} pt-10 pb-6`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="w-full max-w-2xl">
<h2 className={DESIGN_TOKENS.TYPOGRAPHY.SECTION_HEADING} data-trans-managed="true">{strings["Real Stories, Real Recoveries"]}</h2>
              <p className={DESIGN_TOKENS.TYPOGRAPHY.SECTION_SUBTITLE + " mt-2"} data-trans-managed="true">
                {strings["Watch firsthand accounts from patients across the globe who trusted us with their care."]}
              </p>
            </div>
            <div className="w-full max-w-md">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                loading={searchLoading}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={`${DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT} pb-16`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          {enrichedVideos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {visibleVideos.map((video, idx) => (
                  <PremiumTestimonialCard key={video.videoId} video={video} index={idx} onPlayVideo={handlePlay} />
                ))}
              </div>

              {hasMore && (
                <div ref={sentinelRef} className="h-10 w-full" />
              )}

              {!hasMore && enrichedVideos.length > GRID_INITIAL_COUNT && (
<p className="text-center text-sm text-gray-400 mt-10" data-trans-managed="true">{strings["You've reached the end of patient stories"]}</p>
              )}
            </>
          ) : (
            <EmptyState
              isSearch={searchTerm.length > 0}
              onClear={handleClear}
            />
          )}
        </div>
      </section>

      <PremiumVideoModal
        videoId={selectedVideoId}
        title={selectedTitle}
        onClose={handleCloseModal}
      />

    </>
  )
}

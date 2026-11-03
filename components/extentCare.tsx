"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  DESIGN_TOKENS,
  SECTION_INDEX,
  getAlternatingBackground,
} from "@/components/design-tokens";
import SectionHeading from "@/components/ui/SectionHeading";
import HomepageCarousel from "@/components/ui/HomepageCarousel";
import { Calendar, MapPin } from "lucide-react";
import { Trans } from '@/lib/i18n/Trans';
import { useTranslatedStrings } from "@/lib/i18n";
import { getWixImageUrl } from "@/lib/wixMedia"
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/utils/youtube"
import { calculateReadTime, type Post } from "@/lib/utils/blog"
import { fetcher } from "@/lib/utils/swr"

const LIMIT = 12

export default function ExtentCare() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const postsContainerRef = useRef<HTMLDivElement>(null);

  const { data, error, isLoading } = useSWR(
    `/api/wix-posts?limit=${LIMIT}&offset=0&category=patient-activities`,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  const posts: Post[] = Array.isArray(data?.posts)
    ? data.posts.map((p: any) => ({
        ...p,
        excerpt: p.excerpt || "No description available.",
        content: p.content || "",
        readTime: p.readTime,
      }))
    : [];

  const translatableStrings = useMemo(() => {
    const strings: string[] = [
      "We Go Beyond Care — We Celebrate Life",
      "Beyond treatment, we bring care, joy, and unforgettable moments. From warm personal visits to lively events, your healing journey with us is filled with smiles and celebration — because your happiness is our true mission.",
      "Failed to load blog posts.",
      "No blog posts found in this category.",
    ];
    const seen = new Set<string>(strings);
    for (const post of posts) {
      if (post.title && !seen.has(post.title)) {
        seen.add(post.title);
        strings.push(post.title);
      }
      if (post.excerpt && !seen.has(post.excerpt)) {
        seen.add(post.excerpt);
        strings.push(post.excerpt);
      }
    }
    return strings;
  }, [posts])

  const translatedStrings = useTranslatedStrings(translatableStrings)

  const translationMap = useMemo(() => {
    const map = new Map<string, string>()
    translatableStrings.forEach((original, i) => {
      map.set(original, translatedStrings[i] ?? original)
    })
    return map
  }, [translatableStrings, translatedStrings])

  const t = useCallback((text: string): string => {
    if (!text) return text
    return translationMap.get(text) || text
  }, [translationMap])

  if (error) {
    return (
      <section
        className={`${getAlternatingBackground(SECTION_INDEX.EXTENT_CARE)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}
      >
        <div
          className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} text-center`}
        >
<h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-2 md:mb-4 text-[#241d1f] leading-tight tracking-tight md:text-center" data-i18n="extent-care.error-title" data-i18n-original="We Go Beyond Care — We Celebrate Life" data-trans-managed="true">
            <Trans id="extent-care.error-title">We Go Beyond Care — We Celebrate Life</Trans>
          </h2>
          <p className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} mb-4`} data-i18n="extent-care.error-msg" data-i18n-original="Failed to load blog posts." data-trans-managed="true">
            <Trans id="extent-care.error-msg">Failed to load blog posts.</Trans>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${getAlternatingBackground(SECTION_INDEX.EXTENT_CARE)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}
    >
      <div
        className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}
      >
        {/* Heading */}
        <div className="md:text-center mb-2 md:mb-8 max-w-3xl mx-auto">
<SectionHeading title="We Go Beyond Care — We Celebrate Life" titleI18nKey="extent-care.title" data-i18n-original="We Go Beyond Care — We Celebrate Life" />
          
          <p className={DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} data-i18n="extent-care.desc" data-i18n-original="Beyond treatment, we bring care, joy, and unforgettable moments. From warm personal visits to lively events, your healing journey with us is filled with smiles and celebration — because your happiness is our true mission." data-trans-managed="true">
            <Trans id="extent-care.desc">Beyond treatment, we bring care, joy, and unforgettable moments. From warm personal visits to lively events, your healing journey with us is filled with smiles and celebration — because your happiness is our true mission.</Trans>
          </p>
        </div>

        {/* Posts Carousel */}
        <div ref={postsContainerRef}>
          <HomepageCarousel autoplay autoplayDelay={4000}>
            {posts.map((post, index) => {
              const embedVideoUrl = post.media?.embedMedia?.video?.url;
              const embedThumbnailUrl = post.media?.embedMedia?.thumbnail?.url;
              const youtubeVideoId = extractYouTubeId(embedVideoUrl)
              const youtubeEmbedUrl = youtubeVideoId ? getYouTubeEmbedUrl(youtubeVideoId) : null
              const youtubeThumbnailUrl = youtubeVideoId ? getYouTubeThumbnailUrl(youtubeVideoId) : null
              const wixImageUrl = getWixImageUrl(
                post.media?.wixMedia?.image || post.coverMedia?.image,
              );

              return (
                <div key={post._id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className=" group bg-white border border-gray-100 rounded-md overflow-hidden flex flex-col h-full min-h-[280px] md:min-h-[300px] hover:shadow-xl hover:border-gray-200 transition-all duration-300 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Image */}
                    <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-50">
                      {youtubeEmbedUrl ? (
                        <div className="relative w-full h-full">
                          <img
                            src={
                              youtubeThumbnailUrl ||
                              embedThumbnailUrl ||
                              "/placeholder.svg"
                            }
alt={t(post.title)}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#E22026] rounded-full flex items-center justify-center">
                              <svg
className="w-5 h-5 md:w-6 md:h-6 text-white ms-0.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : embedVideoUrl ? (
                        <video
                          src={embedVideoUrl}
                          poster={embedThumbnailUrl || "/placeholder.svg"}
                          controls
                          className="w-full h-full object-cover"
aria-label={`Play video for ${t(post.title)}`}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : wixImageUrl ? (
                        <img
                          src={wixImageUrl}
alt={t(post.title)}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-50 to-purple-50 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">
                            No image
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 md:p-4 flex flex-col flex-1 bg-white">
<h4 className={`${DESIGN_TOKENS.TYPOGRAPHY.H3} line-clamp-2 mb-1`} itemProp="name" data-i18n-original={post.title} data-trans-managed="true">
                        {t(post.title)}
                      </h4>

                      {post.excerpt && (
                        <p className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} line-clamp-3`} itemProp="description" data-i18n-original={post.excerpt} data-trans-managed="true">
                          {t(post.excerpt)}
                        </p>
                      )}

                        <div className="flex items-center justify-between text-sm text-gray-800 pt-2 mt-2 border-t border-gray-200">
                          <div className="flex items-center">
<Calendar className="w-3.5 h-3.5 me-1.5 -mb-0.5 text-[#29A9B9] flex-shrink-0" />
                            <span className="truncate">
                              {post.firstPublishedDate &&
                                new Date(
                                  post.firstPublishedDate,
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                            </span>
                          </div>
                          {post.readTime && (
<span className="text-gray-600 flex-shrink-0" data-i18n-original={post.readTime} data-trans-managed="true">{t(post.readTime)} </span>
                          )}
                        </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </HomepageCarousel>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-md overflow-hidden flex flex-col min-h-[280px] md:min-h-[300px]"
              >
                <div className="relative w-full h-48 md:h-56 bg-gray-100 animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse"></div>
                </div>
                <div className="p-3 md:p-4 flex flex-col flex-1 bg-gray-50 space-y-3">
                  <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        )}

{!isLoading && !error && posts.length === 0 && (
          <div className="text-center py-8">
            <p className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE} text-gray-500`} data-i18n="extent-care.empty" data-i18n-original="No blog posts found in this category." data-trans-managed="true">
              <Trans id="extent-care.empty">No blog posts found in this category.</Trans>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

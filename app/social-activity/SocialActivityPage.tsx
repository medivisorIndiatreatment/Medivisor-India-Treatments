"use client"

import Banner from "@/components/BannerService"
import { useEffect, useState, useRef } from "react"
import useSWR from "swr"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import { useTranslatedStrings } from "@/lib/i18n";
import type { Post } from "@/lib/utils/blog"
import { getWixImageUrl } from "@/lib/wixMedia"
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/utils/youtube"
import { calculateReadTime } from "@/lib/utils/blog"
import { fetcher } from "@/lib/utils/swr"

const LIMIT = 12

export default function SocialActivityPage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const postsContainerRef = useRef<HTMLDivElement>(null)
  const offset = currentPage * LIMIT

  const { data, error, isLoading } = useSWR(
    `/api/wix-posts?limit=${LIMIT}&offset=${offset}&category=social-activity`,
    fetcher,
    {
      keepPreviousData: true,
    }
  )

   const staticStrings = [
    "Social Activity Articles",
    "Social Activity - Medivisor India",
    "Browse our collection of social activity articles and posts from Medivisor India.",
    "No social activity posts found. Please check your Wix blog settings or permissions.",
    "Failed to load social activity posts.",
    "No Media Available",
    "1 min read",
    "min read",
    "Read More",
    "Loading posts...",
    "Previous",
    "Next",
    "of",
    "You've reached the end of the posts.",
  ];

  const posts: Post[] = Array.isArray(data?.posts)
    ? data.posts.map((p: any) => ({
        ...p,
        excerpt: p.excerpt || "No description available.",
        content: p.content || "",
      }))
    : []

  const postTitles = posts.map((p) => p.title);
  const postExcerpts = posts.map((p) => p.excerpt || "");

  const allStrings = [...staticStrings, ...postTitles, ...postExcerpts];
  const translated = useTranslatedStrings(allStrings);
  const strings: Record<string, string> = {};
  allStrings.forEach((s, i) => {
    strings[s] = translated[i] ?? s;
  });
  const totalPosts: number = data?.metaData?.total ?? 0
  const totalPages = totalPosts ? Math.ceil(totalPosts / LIMIT) : 0
  const hasNextPage = currentPage < totalPages - 1

  useEffect(() => {
    if (!initialLoadComplete && (isLoading || data || error)) {
      setInitialLoadComplete(true)
    }
  }, [initialLoadComplete, isLoading, data, error])

  useEffect(() => {
    if (postsContainerRef.current && initialLoadComplete) {
      postsContainerRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [currentPage, initialLoadComplete])

  const handlePreviousPage = () => setCurrentPage((p) => Math.max(0, p - 1))
  const handleNextPage = () => setCurrentPage((p) => p + 1)

  return (
    <>
      <div>
        <Banner
          topSpanText="Social Activity Articles"
          title="Social Activity - Medivisor India"
          description="Browse our collection of social activity articles and posts from Medivisor India."
          buttonText="Browse All Articles"
          buttonLink="/blog"
          mainImageSrc="/about-main-1.png"
            bannerBgImage="/banner/service.png"
          mainImageAlt="Social Activity - Medivisor India"
        />

        <div className="py-10 bg-gray-100">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 mb-8">
{initialLoadComplete && posts.length === 0 && !isLoading && !error && (
              <p className="text-center text-[#241d1f] dark:text-gray-400 mt-10 text-lg" data-trans-managed="true">
                {strings["No social activity posts found. Please check your Wix blog settings or permissions."]}
              </p>
            )}

            {error && <p className="text-center text-red-600 mt-10 text-lg" data-trans-managed="true">{strings["Failed to load social activity posts."]}</p>}

            <div
              ref={postsContainerRef}
              className="grid gap-6 md:gap-4  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              {posts.map((post) => {
                const embedVideoUrl = post.media?.embedMedia?.video?.url
                const embedThumbnailUrl = post.media?.embedMedia?.thumbnail?.url
                const youtubeVideoId = extractYouTubeId(embedVideoUrl)
                const youtubeEmbedUrl = youtubeVideoId ? getYouTubeEmbedUrl(youtubeVideoId) : null
                const youtubeThumbnailUrl = youtubeVideoId ? getYouTubeThumbnailUrl(youtubeVideoId) : null
                const wixImageUrl = getWixImageUrl(post.media?.wixMedia?.image || post.coverMedia?.image)
                const readTime = calculateReadTime(post.content, { oneMin: strings["1 min read"], minRead: strings["min read"] })

                return (
                  <div
                    key={post._id}
                    className="flex flex-col overflow-hidden border border-gray-100 bg-white rounded-md shadow-xs hover:shadow-md transition-shadow duration-300 ease-in-out"
                  >
                    <Link href={`/blog/${post.slug}`} className="block">
                      <div className="relative w-full h-48 overflow-hidden">
                        {youtubeEmbedUrl ? (
                          <div className="relative w-full h-full">
                            <img
                              src={youtubeThumbnailUrl || embedThumbnailUrl || "/placeholder.svg"}
alt={strings[post.title] || post.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-colors">
                              <div className="w-12 h-12 bg-[#e22229] rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
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
aria-label={`Play video for ${strings[post.title] || post.title}`}
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : wixImageUrl ? (
                          <img
                            src={wixImageUrl || "/placeholder.svg"}
alt={strings[post.title] || post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg" data-trans-managed="true">
                            {strings["No Media Available"]}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4 bg-white">
                      <div className="pb-2">
                        <div className={`${DESIGN_TOKENS.TYPOGRAPHY.H3} line-clamp-2 text-[#241d1f] dark:text-[#241d1f]`}>
                          <Link
                            href={`/blog/${post.slug}`}
                            className="hover:text-primary line-clamp-2 text-[#241d1f] transition-colors duration-200"
data-trans-managed="true"
                          >
                            {strings[post.title] || post.title}
                          </Link>
                        </div>
                      </div>
                      <span className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_SM} `}>
                        {post.firstPublishedDate &&
                          new Date(post.firstPublishedDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                      </span>
                      <div className="flex-grow pt-2">
                        {post.excerpt && (
<p className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} text-[#241d1f] dark:text-[#241d1f] text-base line-clamp-3`} data-trans-managed="true">
                            {strings[post.excerpt] || post.excerpt}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-4">
<span className="text-sm text-[#241d1f] dark:text-gray-400" data-trans-managed="true">{readTime}</span>

                        <Link href={`/blog/${post.slug}`} passHref>
                          <button className="border-gray-200 text-medium rounded-md border px-3 py-1 text-sm font-medium text-[#241d1f] hover:bg-gray-100 transition-colors duration-200" data-trans-managed="true">
                            {strings["Read More"]}
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {isLoading && (
<p className="text-center text-[#241d1f] dark:text-gray-400 mt-10 text-lg" data-trans-managed="true">
                {strings["Loading posts..."]}
              </p>
            )}

            {posts.length > 0 && !isLoading && (
              <div className="flex justify-center text-xs items-center gap-4 mt-12">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0 || isLoading}
aria-label={strings["Previous"]}
                  data-trans-managed="true"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {strings["Previous"]}
                </button>
                <span className="text-[#241d1f] dark:text-gray-300" data-trans-managed="true">
                  {totalPages ? currentPage + 1 : 0} {strings["of"]} {totalPages || "..."}
                </span>
                <button onClick={handleNextPage} disabled={!hasNextPage || isLoading} aria-label={strings["Next"]} data-trans-managed="true">
                  {strings["Next"]}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            )}

            {!hasNextPage && !isLoading && posts.length > 0 && (
<p className="text-center text-[#241d1f] dark:text-gray-400 mt-10 text-lg" data-trans-managed="true">
                {strings["You've reached the end of the posts."]}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

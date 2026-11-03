"use client"

import Banner from "@/components/BannerService"
import { useEffect, useState, useRef } from "react"
import useSWR from "swr"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DESIGN_TOKENS, getSectionClasses } from "@/components/design-tokens";
import { useTranslatedStrings } from "@/lib/i18n";
import type { Post } from "@/lib/utils/blog"
import { getWixImageUrl } from "@/lib/wixMedia"
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/utils/youtube"
import { calculateReadTime } from "@/lib/utils/blog"
import { fetcher } from "@/lib/utils/swr"

const LIMIT = 12

interface BlogCategoryClientProps {
  slug: string
}

export default function BlogCategoryClient({ slug }: BlogCategoryClientProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const postsContainerRef = useRef<HTMLDivElement>(null)
  const offset = currentPage * LIMIT
  
  // Format the category name from slug
  const categoryName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const { data, error, isLoading } = useSWR(
    `/api/wix-posts?limit=${LIMIT}&offset=${offset}&category=${slug}`,
    fetcher,
    {
      keepPreviousData: true,
    }
  )

   const posts: Post[] = Array.isArray(data?.posts)
    ? data.posts.map((p: any) => ({
        ...p,
        excerpt: p.excerpt || "No description available.",
        content: p.content || "",
      }))
    : []
  const totalPosts: number = data?.metaData?.total ?? 0
  const totalPages = totalPosts ? Math.ceil(totalPosts / LIMIT) : 0
  const hasNextPage = currentPage < totalPages - 1

  const postTitles = posts.map(p => p.title);
  const postExcerpts = posts.map(p => p.excerpt || "");
   const allTexts = useTranslatedStrings([
     ...postTitles,
     ...postExcerpts,
     "No Media Available",
     "Read More",
     "Loading posts...",
     "Previous",
     "Next",
     "You've reached the end of the posts.",
     "of",
     "1 min read",
     "min read",
   ]);

   const titleCount = postTitles.length;
   const excerptCount = postExcerpts.length;
   const translatedPostTitles = allTexts.slice(0, titleCount);
   const translatedPostExcerpts = allTexts.slice(titleCount, titleCount + excerptCount);
   const baseIdx = titleCount + excerptCount;
   const translatedNoMedia = allTexts[baseIdx];
   const translatedReadMore = allTexts[baseIdx + 1];
   const translatedLoading = allTexts[baseIdx + 2];
   const translatedPrevious = allTexts[baseIdx + 3];
   const translatedNext = allTexts[baseIdx + 4];
   const translatedEnd = allTexts[baseIdx + 5];
   const translatedOf = allTexts[baseIdx + 6];
   const translatedOneMin = allTexts[baseIdx + 7];
   const translatedMinRead = allTexts[baseIdx + 8];

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
           topSpanText={`${categoryName} Articles`}
           title={`${categoryName}`}
           description={`Browse our collection of articles about ${categoryName.toLowerCase()} from Medivisor India's hospital network.`}
           buttonText="Browse All Articles"
           buttonLink="/blog"
             bannerBgImage="/banner/service.png"
           mainImageSrc="/about-main-1.png"
          
           mainImageAlt={`${categoryName} - Medivisor Blog`}
         />

         <div className={`${DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT} ${getSectionClasses(0, { noBackground: true })}`}>
           <div className="container mx-auto px-5 sm:px-6 lg:px-8 mb-8">
           {initialLoadComplete && posts.length === 0 && !isLoading && !error && (
                <p className="text-center text-[#241d1f] dark:text-gray-400 mt-10 text-lg" data-i18n="blog.no-posts" data-i18n-original="No blog posts found in this category. Please check your Wix blog settings or permissions." data-trans-managed="true">
                  No blog posts found in this category. Please check your Wix blog settings or permissions.
                </p>
              )}

             {error && <p className="text-center text-red-600 mt-10 text-lg" data-i18n="blog.error-loading" data-i18n-original="Failed to load blog posts." data-trans-managed="true">Failed to load blog posts.</p>}

            <div
              ref={postsContainerRef}
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4  ${isLoading ? "pointer-events-none opacity-50" : ""}`}
            >
{posts.map((post, postIndex) => {
                  const embedVideoUrl = post.media?.embedMedia?.video?.url
                  const embedThumbnailUrl = post.media?.embedMedia?.thumbnail?.url
                  const youtubeVideoId = extractYouTubeId(embedVideoUrl)
                  const youtubeEmbedUrl = youtubeVideoId ? getYouTubeEmbedUrl(youtubeVideoId) : null
                  const youtubeThumbnailUrl = youtubeVideoId ? getYouTubeThumbnailUrl(youtubeVideoId) : null
                  const wixImageUrl = getWixImageUrl(post.media?.wixMedia?.image || post.coverMedia?.image)
                  const readTime = calculateReadTime(post.content, { oneMin: translatedOneMin, minRead: translatedMinRead })
                 const translatedTitle = translatedPostTitles[postIndex];
                 const translatedExcerpt = translatedPostExcerpts[postIndex];

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
                              alt={post.title}
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
                            aria-label={`Play video for ${post.title}`}
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : wixImageUrl ? (
                          <img
                            src={wixImageUrl || "/placeholder.svg"}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
<div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg" data-i18n="blog.no-media" data-i18n-original="No Media Available" data-trans-managed="true">
                              {translatedNoMedia}
                            </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex flex-col flex-grow p-4 bg-white">
                      <div className="pb-2">
                        <div className={`${DESIGN_TOKENS.TYPOGRAPHY.H3} line-clamp-2 text-[#241d1f] dark:text-[#241d1f]`}>
                          <Link
href={`/blog/${post.slug}`}
                             className="hover:text-primary line-clamp-2 text-[#241d1f] transition-colors duration-200"
                             data-i18n-original={post.title}
                             data-trans-managed="true"
                           >
                             {translatedTitle}
                           </Link>
                        </div>
                      </div>
                      <span className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_SM} text-[#241d1f] dark:text-gray-400`}>
                        {post.firstPublishedDate &&
new Date(post.firstPublishedDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                      </span>
<div className="flex-grow pt-2">
                          {post.excerpt && (
                            <p className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} text-[#241d1f] dark:text-[#241d1f] text-base line-clamp-3`} data-i18n-original={post.excerpt} data-trans-managed="true">
                              {translatedExcerpt}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between items-center pt-4">
                          <span className="text-sm text-[#241d1f] dark:text-gray-400" data-i18n-original={readTime} data-trans-managed="true">{readTime}</span>

                          <Link href={`/blog/${post.slug}`} passHref>
                            <button className="border-gray-200 text-medium rounded-md border px-3 py-1 text-sm font-medium text-[#241d1f] hover:bg-gray-100 transition-colors duration-200" data-i18n="blog.read-more" data-i18n-original="Read More" data-trans-managed="true">
                              {translatedReadMore}
                            </button>
                          </Link>
                        </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center text-xs items-center gap-4 mt-12">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0 || isLoading}
                  aria-label="Previous page"
                  className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[#241d1f] dark:text-gray-300">
{totalPages ? currentPage + 1 : 0} {translatedOf} {totalPages || "..."}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={!hasNextPage || isLoading}
                  aria-label="Next page"
                  className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

{isLoading && (
                <p className="text-center text-[#241d1f] dark:text-gray-400 mt-10 text-lg" data-i18n="blog.loading" data-i18n-original="Loading posts..." data-trans-managed="true">
                  {translatedLoading}
                </p>
              )}

              {posts.length > 0 && !isLoading && !hasNextPage && (
                <p className="text-center text-[#241d1f] dark:text-gray-400 mt-10 text-lg" data-i18n="blog.end-of-posts" data-i18n-original="You've reached the end of the posts." data-trans-managed="true">
                  {translatedEnd}
                </p>
              )}
          </div>
        </div>
      </div>
    </>
  )
}

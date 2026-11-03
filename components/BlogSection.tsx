"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import useSWR from "swr"
import SectionHeading from "@/components/ui/SectionHeading"
import HomepageCarousel from "@/components/ui/HomepageCarousel"
import { Trans } from '@/lib/i18n/Trans';
import { getWixImageUrl } from "@/lib/wixMedia"
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/utils/youtube"
import { calculateReadTime, type Post } from "@/lib/utils/blog"
import { fetcher } from "@/lib/utils/swr"

interface BlogSectionProps {
  category?: string
  title?: string
}

const LIMIT = 9

export default function BlogSection({ category, title = "Important Updates" }: BlogSectionProps) {
  const categoryParam = category ? `&category=${encodeURIComponent(category)}` : ""
  const { data, isLoading } = useSWR(`/api/wix-posts?limit=${LIMIT}&offset=${0}${categoryParam}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  })

  const posts: Post[] = Array.isArray(data?.posts)
    ? data.posts.map((p: any) => ({
        ...p,
        excerpt: p.excerpt || "No description available.",
        content: p.content || "",
      }))
    : []

  if (isLoading || posts.length === 0) {
    return null
  }

  return (
    <section className="py-4 md:py-10">
      <div className="container mx-auto">
<SectionHeading title={title} className="md:mb-5  mb-l-5 mt-8 md:mt-0 md:pl-3 md:px-2 mb-5" data-i18n-original={title} />
        
        <HomepageCarousel autoplay>
          {posts.map((post) => {
            const embedVideoUrl = post.media?.embedMedia?.video?.url
            const embedThumbnailUrl = post.media?.embedMedia?.thumbnail?.url
            const youtubeVideoId = extractYouTubeId(embedVideoUrl)
            const youtubeEmbedUrl = youtubeVideoId ? getYouTubeEmbedUrl(youtubeVideoId) : null
            const youtubeThumbnailUrl = youtubeVideoId ? getYouTubeThumbnailUrl(youtubeVideoId) : null
            const wixImageUrl = getWixImageUrl(post.media?.wixMedia?.image || post.coverMedia?.image)
            const readTime = calculateReadTime(post.content)

            return (
              <div key={post._id}>
                <Card className="flex flex-col h-full shadow-xs hover:shadow-sm transition-shadow duration-300 ease-in-out border-gray-200">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <CardHeader className="p-0 rounded-t-xs overflow-hidden">
                      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                        {youtubeEmbedUrl ? (
                          <iframe
                            className="absolute top-0 left-0 w-full h-full object-cover rounded-t-lg"
                            src={youtubeEmbedUrl}
                            title={post.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : embedVideoUrl ? (
                          <video
                            src={embedVideoUrl}
                            poster={embedThumbnailUrl || "/placeholder.svg"}
                            controls
                            className="absolute top-0 left-0 w-full h-full object-cover rounded-t-lg"
                            aria-label={`Play video for ${post.title}`}
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : wixImageUrl ? (
                          <Image
                            src={wixImageUrl || "/placeholder.svg"}
                            width={800}
                            height={500}
                            priority={posts.indexOf(post) === 0}
                            quality={70}
                            sizes="100vw"
                            alt={post.title}
                            placeholder="blur"
                            blurDataURL={post.blurDataUrl || "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAADAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="}
                            className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="absolute top-0 left-0 w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg rounded-t-lg">
                            No Media Available
                          </div>
                        )}
                      </div>
                    </CardHeader>
                  </Link>
                  <Link href={`/blog/${post.slug}`} className="transition-colors duration-200">
                    <CardContent className="flex flex-col flex-grow p-4 bg-white rounded-b-xs">
                      <div className="min-h-[40px] mb-2">
<CardTitle className="text-xl font-medium leading-tight text-[#241d1f] hover:text-primary transition-colors line-clamp-2" data-i18n-original={post.title}>
                          {post.title}
                        </CardTitle>
                      </div>

                      <div className="flex justify-start gap-x-3 items-center mb-1">
                        <CardDescription className="text-xs text-gray-600">
                          {post.firstPublishedDate &&
                            new Date(post.firstPublishedDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                        </CardDescription>
                        <span className="text-xs text-gray-600">{readTime}</span>
                      </div>

                      <div className="min-h-[60px]">
<p className="text-[#241d1f] line-clamp-3 leading-relaxed" data-i18n-original={post.excerpt}>
                          {post.excerpt}
                        </p>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </div>
            )
          })}
        </HomepageCarousel>
      </div>
    </section>
  )
}


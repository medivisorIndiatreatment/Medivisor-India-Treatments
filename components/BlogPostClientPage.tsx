"use client"

import React, { useEffect, useState } from 'react'
import Image from "next/image"
import { ChevronLeft, ChevronRight, Copy, Clock, Calendar, Eye, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'
import { RicosRenderer } from '@/components/RichContentViewer'
import { useTranslatedStrings, useTranslatedHtmlString, useTranslatedRicosContent } from '@/lib/i18n';
import { extractTextFromRicos } from '@/lib/cms/utils'
import type { RicosContent } from '@/lib/cms/types'
import { getWixImageUrl } from "@/lib/wixMedia"
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/utils/youtube"
import { ErrorBoundary } from "@/components/ErrorBoundary"

interface Post {
  _id: string
  title: string
  slug: string
  firstPublishedDate?: string
  lastPublishedDate?: string
  url?: string
  media?: {
    wixMedia?: {
      image?: string
      video?: string
    }
    embedMedia?: {
      thumbnail?: {
        url: string
        width?: number
        height?: number
      }
      video?: {
        url: string
        width?: number
        height?: number
      }
    }
    displayed?: boolean
    custom?: boolean
  }
  coverMedia?: {
    image?: string
  }
  excerpt?: string
  content?: string
  contentText?: string
  richContent?: RicosContent
  tags?: string[]
  hashtags?: string[]
  categoryIds?: string[]
  featured?: boolean
  commentingEnabled?: boolean
  minutesToRead?: number
  language?: string
  viewCount?: number
  likeCount?: number
  commentCount?: number
  settings?: any
}

function calculateReadTime(
  content: string | RicosContent | undefined,
  minutesToRead: number | undefined,
  minReadLabel: string,
  lessThanLabel: string
): string {
  if (minutesToRead && minutesToRead > 0) {
    return `${minutesToRead} ${minReadLabel}`
  }

  if (!content) return lessThanLabel

  let text = ''
  if (typeof content === 'string') {
    text = content.replace(/<[^>]*>/g, '')
  } else if (content && 'nodes' in content) {
    text = extractTextFromRicos(content.nodes)
  }

  const wordsPerMinute = 200
  const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
return minutes === 0 ? lessThanLabel : `${minutes} ${minReadLabel}`
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch (e) {
    return 'N/A'
  }
}

export interface BlogPostProps {
  slug: string
  post?: Post | null
  relatedPosts?: Post[]
}

const STATIC_STRINGS = [
  'Oops! Something went wrong',
  'Back',
  'Post Not Found',
  "The blog post you're looking for doesn't exist.",
  'Less than 1 min read',
  'min read',
  'views',
  'Share this post:',
  'Share',
  'Share on Facebook',
  'Share on Twitter',
  'Share on LinkedIn',
  'Share on WhatsApp',
  'Copy link',
  'Bookmark',
  'Remove bookmark',
  'Like',
  'Unlike',
  'Related Articles',
  'Ready to Meet Your Specialist?',
  'Schedule a consultation with one of our expert doctors and take the first step toward better health.',
  'Book Now',
  'No content available for this post.',
  'No slug provided',
  'Blog service not available. Please check API Key configuration and ensure the Wix Blog V4 SDK is correctly integrated.',
  "Post not found. The blog post you're looking for doesn't exist or has been removed.",
  'Failed to load post. This is likely due to a network, CORS, or API Key error with the Wix SDK. Please check your Wix configuration.',
  'Link copied to clipboard!'
]

export default function BlogPost({ slug, post: initialPost, relatedPosts: initialRelatedPosts }: BlogPostProps) {
  const [post, setPost] = useState<Post | null>(initialPost ?? null)
  const [relatedPosts, setRelatedPosts] = useState<Post[]>(initialRelatedPosts ?? [])
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const dynamicTitles = [post?.title || '', post?.contentText || '', post?.excerpt || '', ...relatedPosts.map((rp) => rp.title)]
  const allStrings = [...STATIC_STRINGS, ...dynamicTitles]
  const translatedStrings = useTranslatedStrings(allStrings)
  const strings: Record<string, string> = {}
  allStrings.forEach((s, i) => {
    strings[s] = translatedStrings[i] ?? s
  })

  useEffect(() => {
    if (!post) return

    document.title = `${strings[post.title] || post.title} | Medivisor India`

    return () => {
      document.title = 'Medivisor India'
    }
  }, [post])

const translatedRichContent = useTranslatedRicosContent(post?.richContent) as RicosContent | undefined
  const translatedHtmlContent = useTranslatedHtmlString(post?.content || '')

  const handleShare = async (platform?: string) => {
    const shareUrl = post?.url || window.location.href
    const shareTitle = strings[post?.title || ''] || post?.title || ''
    const shareText = strings[post?.excerpt || ''] || post?.excerpt || ''

    if (platform) {
      const encodedUrl = encodeURIComponent(shareUrl)
      const encodedTitle = encodeURIComponent(shareTitle)

      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank')
          break
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank')
          break
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank')
          break
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, '_blank') 
          break
        default:
          break
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(post?.url || window.location.href)
alert(strings['Link copied to clipboard!'])
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-6 md:py-10">
        <main className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">?</span>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-4" data-trans-managed="true">{strings["Post Not Found"]}</h1>
              <p className="text-gray-600 mb-6" data-trans-managed="true">{strings["The blog post you're looking for doesn't exist."]}</p>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-6 py-3 bg-[#E22026] text-white rounded-lg hover:bg-[#cc1c22] transition-colors font-medium"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span data-trans-managed="true">{strings["Back"]}</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const embedVideoUrl = post.media?.embedMedia?.video?.url
  const embedThumbnailUrl = post.media?.embedMedia?.thumbnail?.url
  const youtubeVideoId = extractYouTubeId(embedVideoUrl)
  const youtubeEmbedUrl = youtubeVideoId ? getYouTubeEmbedUrl(youtubeVideoId) : null
  const youtubeThumbnailUrl = youtubeVideoId ? getYouTubeThumbnailUrl(youtubeVideoId) : null
  const imageUrl = getWixImageUrl(post.media?.wixMedia?.image || post.coverMedia?.image)
const readTime = calculateReadTime(
    post.richContent || post.contentText || post.content,
    post.minutesToRead,
    strings['min read'],
    strings['Less than 1 min read']
  )

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white px-4 md:px-0 py-6 md:py-10">
      <main className="container mx-auto">
        <nav className="mb-4 md:mb-6">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:text-accent-foreground h-10 px-4 py-2 border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
<span data-trans-managed="true">{strings['Back']}</span>
          </button>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <article className="md:bg-white md:rounded-md md:shadow-xs md:border border-gray-100 overflow-hidden">
              <div className="p-0 md:p-4 lg:p-6">
                {(youtubeEmbedUrl || imageUrl) && (
                  <div className="mb-6 md:mb-8 -mx-0 md:-mx-4 lg:-mx-6">
                    {youtubeEmbedUrl ? (
                      <div className="relative w-full aspect-video">
                        <iframe
                          src={youtubeEmbedUrl}
                          title={strings[post.title] || post.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="absolute top-0 left-0 w-full h-full rounded-md md:rounded-none lg:rounded-none"
                        />
                      </div>
                    ) : imageUrl ? (
                      <div className="relative w-full aspect-video">
                        <Image
                          src={imageUrl}
                          alt={strings[post.title] || post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                          className="w-full h-full object-cover rounded-md md:rounded-none lg:rounded-none"
                          priority
                        />
                      </div>
                    ) : null}
                  </div>
                )}

                <header className="mb-4">
 <h1 className="text-3xl md:text-4xl lg:text-4xl font-medium text-gray-900 mb-4 leading-tight" data-trans-managed="true">
                      {strings[post.title] || post.title}
                     </h1>
                   
                   <div className="flex flex-wrap items-center gap-4 md:gap-6 text-base text-gray-800 mb-4 border-b border-gray-200 pb-3">
                     <div className="flex items-center gap-1">
                       <Calendar className="w-4 h-4" />
                       <time dateTime={post.firstPublishedDate}>
                         {formatDate(post.firstPublishedDate)}
                       </time>
                     </div>
                     <div className="flex items-center gap-1">
                       <Clock className="w-4 h-4" />
 <span data-trans-managed="true">{readTime}</span>
                     </div>
                     {post.viewCount !== undefined && (
                       <div className="flex items-center gap-1">
                         <Eye className="w-4 h-4" />
 <span data-trans-managed="true">{`${post.viewCount} ${strings['views']}`}</span>
                       </div>
                     )}
                   </div>
                 </header>

                <div className="prose prose-lg max-w-none">
{translatedRichContent ? (
                    <div data-trans-managed="true" suppressHydrationWarning>
                      <RicosRenderer content={translatedRichContent} />
                    </div>
                  ) : post.content ? (
                    <div dangerouslySetInnerHTML={{ __html: translatedHtmlContent }} data-trans-managed="true" suppressHydrationWarning />
                  ) : post.contentText ? (
                    <div className="whitespace-pre-wrap text-lg md:text-xl text-gray-700 leading-relaxed" data-trans-managed="true">{strings[post.contentText] || post.contentText}</div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">?</span>
                      </div>
<p className="text-gray-800 italic text-lg" data-trans-managed="true">{strings['No content available for this post.']}</p>
                    </div>
                  )}
                </div>

                <div className="mt-10 pt-8 border-t border-gray-200">
<div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700" data-trans-managed="true">{strings['Share this post:']}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleShare()}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            aria-label={strings['Share']}
                            data-trans-managed="true"
                          >
                            <Share2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleShare('facebook')}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            aria-label={strings['Share on Facebook']}
                            data-trans-managed="true"
                          >
                           <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .82.036 1.233.108v2.914h-2.072c-2.28 0-2.76 1.077-2.76 2.668v1.74h4.486l-.584 3.667h-3.902V24h6.377c.415 0 .753-.033.993-.108.24-.075.443-.21.604-.41.16-.2.24-.433.24-.702v-3.217c0-1.022-.258-1.77-1.438-2.48z" fill="#1877F2"/></svg>
                          </button>
                          <button
                            onClick={() => handleShare('twitter')}
                            className="p-2 text-gray-600 hover:text-blue-400 transition-colors"
                            aria-label={strings['Share on Twitter']}
                            data-trans-managed="true"
                          >
                           <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" fill="currentColor"/></svg>
                          </button>
                          <button
                            onClick={() => handleShare('linkedin')}
                            className="p-2 text-gray-600 hover:text-blue-700 transition-colors"
                            aria-label={strings['Share on LinkedIn']}
                            data-trans-managed="true"
                          >
                           <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/></svg>
                          </button>
                          <button
                            onClick={() => handleShare('whatsapp')}
                            className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                            aria-label={strings['Share on WhatsApp']}
                            data-trans-managed="true"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleCopyLink}
                            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                            aria-label={strings['Copy link']}
                            data-trans-managed="true"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className={`p-2 transition-colors ${
                          isBookmarked ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                        }`}
aria-label={isBookmarked ? strings['Remove bookmark'] : strings['Bookmark']}
                        data-trans-managed="true"
                      >
                        <Bookmark className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => setIsLiked(!isLiked)}
                        className={`p-2 transition-colors ${
                          isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                        }`}
aria-label={isLiked ? strings['Unlike'] : strings['Like']}
                        data-trans-managed="true"
                      >
                        <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
          
          <div className="lg:col-span-4">
            {relatedPosts.length > 0 && (
              <section className="bg-white lg:bg-gray-50 border border-gray-100 rounded-md lg:shadow-sm lg:p-6">
<h2 className="text-xl md:text-3xl font-medium text-gray-900 mb-5 leading-tight" data-trans-managed="true">{strings['Related Articles']}</h2>
                <div className="space-y-5">
                  {relatedPosts.map((relatedPost) => {
                    const relatedImageUrl = getWixImageUrl(
                      relatedPost.media?.wixMedia?.image || relatedPost.coverMedia?.image
                    )
                    const translatedRelatedTitle = strings[relatedPost.title] || relatedPost.title
                    return (
                      <a
                        key={relatedPost._id}
                        href={`/blog/${relatedPost.slug}`}
                        className="flex items-start bg-gray-50 lg:bg-white rounded-lg border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300 p-4"
                      >
                        {relatedImageUrl && (
                          <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={relatedImageUrl || "/placeholder.svg"}
                              alt={translatedRelatedTitle}
                              width={80}
                              height={80}
                              sizes="80px"
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          </div>
                        )}
<h3 className="ml-4 text-base md:text-lg font-medium text-gray-900 hover:text-[#E22026] transition-colors duration-200 line-clamp-3" data-trans-managed="true">
                           {translatedRelatedTitle}
                          </h3>
                      </a>
                    )
                  })}
                </div>
              </section>
            )}
            
            <div className="lg:sticky mt-10 lg:top-28">
              <div className="bg-[#23366E] rounded-xl shadow-xl text-white p-6 md:p-8 text-center">
<h2 className="text-2xl md:text-3xl font-semibold mb-4 tracking-tight" data-trans-managed="true">
                    {strings['Ready to Meet Your Specialist?']}
                  </h2>
                  <p className="text-base md:text-lg mb-2 md:mb-4 leading-relaxed" data-trans-managed="true">
                    {strings['Schedule a consultation with one of our expert doctors and take the first step toward better health.']}
                  </p>
                  <button
                    onClick={() => (window.location.href = "/contact")}
                    className="inline-flex items-center px-6 md:px-8 font-medium py-3 md:py-4 bg-white text-[#23366E] rounded-lg hover:bg-gray-50 hover:text-[#23366E] transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <span data-trans-managed="true">{strings['Book Now']}</span>
                  </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </ErrorBoundary>
  )
}
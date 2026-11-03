import BlogPost, { type BlogPostProps } from "@/components/BlogPostClientPage"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { cache } from "react"
import { wixClient } from "@/lib/wix"
import { media } from '@wix/sdk'
import { getWixImageUrl as getWixImageUrlFromLib } from "@/lib/wixMedia"

export const dynamic = "force-dynamic"
export const dynamicParams = true

interface Params {
  params: Promise<{ slug: string }>
}

// Hard cap on upstream Wix calls so a slow/blocked CMS request can never blow
// the Vercel function budget and surface as a 500.
const FETCH_TIMEOUT_MS = 8000

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Upstream CMS request timed out after ${ms}ms`)),
      ms,
    )
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

// Function to get properly formatted Wix Image URL
function getWixImageUrl(wixUrl: string | undefined): string | null {
  const url = getWixImageUrlFromLib(wixUrl)
  return url ? formatImageUrlForSocial(url) : null
}

// Function to format image URL for social media platforms
function formatImageUrlForSocial(imageUrl: string): string | null {
  if (!imageUrl) return null

  try {
    // Ensure URL is valid
    const url = new URL(imageUrl)

    // For Wix static URLs, we need to ensure they're properly formatted
    if (url.hostname === 'static.wixstatic.com') {
      // Reconstruct the URL with proper parameters for social media
      const pathParts = url.pathname.split('/')
      const mediaPart = pathParts[pathParts.length - 1]

      // Create a clean, optimized URL for social media
      // Use Wix's image transformation with proper format
      const optimizedUrl = `https://static.wixstatic.com/media/${mediaPart}/v1/fill/w_1200,h_630,al_c,q_85,usm_0.66_1.00_0.01/${mediaPart}`

      return optimizedUrl
    }

    // For other URLs, return as is
    return imageUrl
  } catch (error) {
    console.error('Error formatting image URL:', error)
    return null
  }
}

// Function to get optimized image URL for social sharing
function getOptimizedShareImage(wixUrl: string | undefined): string {
  if (!wixUrl) {
    // Fallback to a reliable default image
    return "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=630&q=80"
  }

  // Try to get the properly formatted image URL
  const imageUrl = getWixImageUrl(wixUrl)

  if (imageUrl) {
    return imageUrl
  }

  // Final fallback to a reliable medical/health related image
  return "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=630&q=80"
}

// Function to extract text from content for meta description
function extractTextForMeta(content: any): string {
  if (!content) return ''

  if (typeof content === 'string') {
    return content.replace(/<[^>]*>/g, '').trim()
  }

  return 'Informative medical blog post from Medivisor India.'
}

// Function to generate meta description from content
function generateMetaDescription(content: any, excerpt?: string): string {
  if (excerpt && excerpt.trim().length > 0) {
    return excerpt.trim()
  }

  const text = extractTextForMeta(content)

  if (text.length > 160) {
    return text.substring(0, 157) + '...'
  }

  return text || 'Read this informative blog post about medical treatment, patient journeys, and healthcare tips in India.'
}

// Helper function to fetch blog by slug from Wix.
// Deduped per request so generateMetadata + the page component share one call.
// Never throws: returns { post: null, fetchError: true } on upstream failure so
// a CMS outage degrades gracefully instead of 500-ing the page.
const fetchBlogBySlug = cache(async function fetchBlogBySlug(slug: string): Promise<{ post: any; fetchError: boolean }> {
  try {
    if (!wixClient.posts) return { post: null, fetchError: false }

    const results = await Promise.allSettled([
      wixClient.posts.getPostBySlug(slug, {
        fieldsets: [
          "CONTENT_TEXT",
          "URL",
          "RICH_CONTENT",
          "SEO",
        ],
      }).then((response: any) => response.post),
      wixClient.posts.queryPosts()
        .eq('slug', slug)
        .find()
        .then((response: any) => response.items?.[0]),
    ])

    const successful = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value)
      .map(r => r.value)

    if (successful.length > 0) {
      return { post: successful[0], fetchError: false }
    }

    return { post: null, fetchError: false }
  } catch (err) {
    console.error("Error fetching blog:", err)
    return { post: null, fetchError: true }
  }
})

const fetchRelatedPosts = cache(async function fetchRelatedPosts(post: any): Promise<any[]> {
  try {
    if (!wixClient.posts || typeof wixClient.posts.queryPosts !== 'function') return []
    const postTags = post.tags || []
    const postCategories = post.categoryIds || []
    let query = wixClient.posts.queryPosts().ne('_id', post._id).limit(6)
    if (postTags.length > 0) {
      query = query.hasSome('hashtags', postTags)
    } else if (postCategories.length > 0) {
      query = query.hasSome('categoryIds', postCategories)
    }
    const response = await query.find()
    return (response?.items || []) as any[]
  } catch {
    return []
  }
})

// Dynamic Metadata for Blog Post
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params

  let post: any = null
  try {
    const result = await withTimeout(fetchBlogBySlug(slug), FETCH_TIMEOUT_MS)
    post = result.post
  } catch (err) {
    console.error("Error generating blog metadata:", err)
  }

  if (!post) {
    return {
      title: "Blog Post Not Found | Medivisor India",
      description: "The requested blog post doesn't exist.",
      robots: "noindex, follow",
    }
  }

  try {
    const title = post.title || "Medivisor India Blog"
    const description = generateMetaDescription((post as any).richContent || (post as any).contentText || (post as any).content, post.excerpt)

    // Get the optimized share image - this now uses reliable fallbacks
    const shareImageUrl = getOptimizedShareImage((post as any).coverMedia?.image || (post as any).media?.wixMedia?.image)

    const url = `https://medivisorindiatreatment.com/blog/${slug}`

    // Article specific meta tags
    const articleMeta: any = {}
    const blogAny = post as any
    if (blogAny.firstPublishedDate) {
      articleMeta.publishedTime = blogAny.firstPublishedDate
    }
    if (blogAny.lastPublishedDate) {
      articleMeta.modifiedTime = blogAny.lastPublishedDate
    }
    if (blogAny.tags && blogAny.tags.length > 0) {
      articleMeta.tags = blogAny.tags
    }

    return {
      title: `${title} | Medivisor India`,
      description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title,
        description,
        url,
        siteName: "Medivisor India Treatment",
        images: [
          {
            url: shareImageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: "en_US",
        type: "article",
        ...articleMeta,
        authors: ["Medivisor India"],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [shareImageUrl],
        site: "@medivisorindiatreatment",
        creator: "@medivisorindiatreatment",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      keywords: (post as any).tags?.join(', ') || "medical treatment, healthcare, India, patient journey",
      authors: [{ name: "Medivisor India" }],
      publisher: "Medivisor India",
      category: "healthcare",
      ...articleMeta,
    }
  } catch (err) {
    console.error("Error assembling blog metadata:", err)
    return {
      title: `${post.title || "Blog Post"} | Medivisor India`,
      description: "Read this informative blog post from Medivisor India.",
    }
  }
}

// Blog Post Page Component
export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params

  let result: { post: any; fetchError: boolean }
  try {
    result = await withTimeout(fetchBlogBySlug(slug), FETCH_TIMEOUT_MS)
  } catch (err) {
    console.error("Error loading blog post:", err)
    result = { post: null, fetchError: true }
  }

  const { post, fetchError } = result

  // The fetch succeeded but the post genuinely does not exist -> proper 404.
  if (!post && !fetchError) {
    notFound()
  }

  const relatedPosts = post ? await fetchRelatedPosts(post).catch(() => []) : []

  return <BlogPost slug={slug} post={post} relatedPosts={relatedPosts} />
}

// app/team/[slug]/page.tsx

import TeamPage from "@/components/TeamPage";
import type { Metadata, ResolvingMetadata } from 'next';
import { getBestCoverImage, getWixScaledToFillImageUrl } from "@/lib/wixMedia"
import { generateSlug, generateUniqueSlug } from "@/lib/slug-utils"

const COLLECTION_ID = "Team1"

// ----------------------------------------------------------------------
// METADATA UTILITIES (Required for generateMetadata)
// ----------------------------------------------------------------------

// Helper function to extract text from a rich text object
export const extractTextFromRichText = (richTextObj: any): string => {
  if (!richTextObj) return ""
  if (typeof richTextObj === "string") return richTextObj
  if (richTextObj.nodes && Array.isArray(richTextObj.nodes)) {
    return richTextObj.nodes
      .map((node: any) => {
        if (node.type === "PARAGRAPH" && node.nodes) {
          return node.nodes
            .map((textNode: any) => {
              if (textNode.type === "TEXT" && textNode.textData) {
                return textNode.textData.text || ""
              }
              return ""
            })
            .join("")
        }
        return ""
      })
      .join("\n\n")
      .trim()
  }
  if (richTextObj.text) return richTextObj.text
  if (richTextObj.textData && richTextObj.textData.text) return richTextObj.textData.text
  return ""
}

// Processes the Wix image URL to get a scaled version for METADATA (1200x1200)
export const processWixImageUrlForMetadata = (item: any): string => {
  const bestImage = getBestCoverImage(item)
  if (bestImage) {
    return getWixScaledToFillImageUrl(bestImage, 1200, 1200) || bestImage
  }

  const imageFields = [
    "Photo", "photo", "image", "picture", "avatar", "profileImage",
    "mainImage", "featuredImage", "coverImage", "thumbnail",
  ]

  for (const field of imageFields) {
    if (item[field]) {
      let imageUrl = null

      if (typeof item[field] === "string" && item[field].startsWith("wix:image://")) {
        imageUrl = item[field]
      } else if (item[field]?.url && item[field].url.startsWith("wix:image://")) {
        imageUrl = item[field].url
      } else if (item[field]?.src && item[field].src.startsWith("wix:image://")) {
        imageUrl = item[field].src
      }

      if (imageUrl) {
        const processedUrl = getWixScaledToFillImageUrl(imageUrl, 1200, 1200)
        if (processedUrl) {
          return processedUrl
        }
      }
    }
  }

  return `/placeholder.svg?height=1200&width=1200&query=team member portrait`
}


// The actual data fetching logic, executed on the server for metadata
export const fetchMemberItem = async (memberId: string) => {
  // Validate memberId to prevent TypeError
  if (!memberId) {
    return null
  }
  // NOTE: Ensure your wixClient module is correctly set up to import
  // on the server side without conflict (e.g., using dynamic import or ensuring it's not a client dependency).
  const { wixClient } = await import("@/lib/wix")

  // 1. Try by exact ID
  let response = await wixClient.items.query(COLLECTION_ID).eq("_id", memberId).find({ consistentRead: true })

  // 2. Fallback to slug matching (checking all items for a match)
  if (!response?.items?.length) {
    const allMembersResponse = await wixClient.items
      .query(COLLECTION_ID)
      .skip(0)
      .limit(100)
      .find({ consistentRead: true })

      if (allMembersResponse?.items?.length) {
        const targetMember = allMembersResponse.items.find((item: any) => {
          const itemData = item.data || item
          const memberName = itemData.title || item.title || item.Name || item.name || ""
          const memberSlug = generateSlug(memberName)

          const linkSlug = itemData["link-team-1-title"] || item["link-team-1-title"] || ""
          const extractedSlug = linkSlug ? linkSlug.replace(/^.*\/team\//, "").replace(/\/$/, "") : ""

           return memberSlug === memberId || extractedSlug === memberId || item._id === memberId || generateUniqueSlug(memberName, item._id) === memberId
        })

      if (targetMember) {
        response = {
          items: [targetMember],
          totalCount: 1,
          pageSize: 1,
          currentPage: 1,
          length: 1,
        } as any
      }
    }
  }

  // 3. Fallback to partial name matching (optional, as used in original code)
  if (!response?.items?.length) {
    const nameFromSlug = memberId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

    response = await wixClient.items
      .query(COLLECTION_ID)
      .contains("title", nameFromSlug)
      .find({ consistentRead: true })
  }


  return response?.items?.[0] || null
}


// ----------------------------------------------------------------------
// GENERATE METADATA FUNCTION
// ----------------------------------------------------------------------

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Read route params with safety check
  const { slug } = await params

  // Return fallback metadata if slug is undefined
  if (!slug) {
    return {
      title: 'Team Member Not Found',
      description: 'The requested team member profile could not be found.',
    }
  }

  // Fetch data on the server
  const item = await fetchMemberItem(slug)

  if (!item) {
    return {
      title: 'Team Member Not Found',
      description: 'The requested team member profile could not be found.',
    }
  }

  const itemData = item.data || item
  const memberName = itemData.title || item.title || item.Name || item.name || "Team Member"
  const memberRole = itemData.jobTitle || item.jobTitle || item["Job Title"] || item.role || item.position || "Team Member"

  // Use the dedicated image processor for metadata
  const imageUrl = processWixImageUrlForMetadata(itemData)

  // Use shortDescription for the meta description, falling back to bio/longDescription
  const metaDescription = extractTextFromRichText(
    itemData.shortDescription || item.shortDescription || item["Short Description"] || item.excerpt
  ) || extractTextFromRichText(
    itemData.longDescription || item.longDescription || item["Long Description"] || item.bio || item.description,
  ) || `Read the full profile for ${memberName}, ${memberRole}.`

  const siteUrl = 'https://medivisorindiatreatment.com'
  const pageUrl = `${siteUrl}/team/${slug}`

  // Optionally access and extend parent metadata
  const previousImages = (await parent).openGraph?.images || []

return {
    title: `${memberName} | ${memberRole}`,
    description: metaDescription,

    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: pageUrl,
    },

    openGraph: {
      title: `${memberName} | ${memberRole}`,
      description: metaDescription,
      url: pageUrl,
      siteName: 'Medivisor India Treatment',
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 1200,
          height: 1200,
          alt: memberName,
        },
        ...previousImages,
      ],
      type: 'profile',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${memberName} | ${memberRole}`,
      description: metaDescription,
      images: [imageUrl],
    },

    robots: {
      index: true,
      follow: true,
    },
  }
}

// ----------------------------------------------------------------------
// PAGE COMPONENT WRAPPER (Server Component)
// ----------------------------------------------------------------------

export default async function TeamMemberWrapper({ params, searchParams }: Props) {
  const { slug } = await params
  await searchParams

  let initialData = null
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://medivisorindiatreatment.com'}/api/team/${slug}`, {
      next: { revalidate: 300 },
    })
    if (res.ok) {
      initialData = await res.json()
    }
  } catch {
    // Fallback to client-side fetch if server fetch fails
  }

  return <TeamPage slug={slug} initialData={initialData} />;
}